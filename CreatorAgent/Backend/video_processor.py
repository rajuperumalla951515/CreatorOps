from __future__ import annotations

import base64
import http.cookiejar
import ipaddress
import logging
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import urllib.parse
from pathlib import Path
from typing import Callable, Optional

from dotenv import load_dotenv
import httpx
import imageio_ffmpeg
import yt_dlp
from yt_dlp.utils import DownloadError

logger = logging.getLogger("tubepilot.video_processor")

# Load environment variables (.env) from backend, project root, and workspace root
_CURR_DIR = Path(__file__).resolve().parent
load_dotenv(_CURR_DIR / ".env")
load_dotenv(_CURR_DIR.parent / ".env")
load_dotenv(_CURR_DIR.parents[1] / ".env")
load_dotenv()

# Limits & safety
MAX_DIRECT_DOWNLOAD_BYTES = 600 * 1024 * 1024  # 600 MB max for direct stream download
DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


def ffmpeg_path() -> str:
    sys_ffmpeg = shutil.which("ffmpeg")
    if sys_ffmpeg:
        return sys_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def get_js_runtimes() -> dict[str, dict[str, str]]:
    node_paths = [
        shutil.which("node"),
        r"C:\Program Files\nodejs\node.exe",
        r"C:\Program Files (x86)\nodejs\node.exe",
        str(Path.home() / "AppData" / "Local" / "Programs" / "node" / "node.exe"),
        "/usr/bin/node",
        "/usr/local/bin/node",
    ]
    for p in node_paths:
        if p and Path(p).exists():
            return {"node": {"path": str(p)}}
    return {}


def run_ffmpeg(arguments: list[str]) -> None:
    command = [ffmpeg_path(), "-y", "-hide_banner", "-loglevel", "error", *arguments]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "FFmpeg could not process the video.")


def has_audio(video: Path) -> bool:
    probe = subprocess.run(
        [ffmpeg_path(), "-hide_banner", "-i", str(video)],
        capture_output=True,
        text=True,
        check=False,
    )
    return " Audio:" in probe.stderr


# ==============================================================================
# Security & SSRF Protection
# ==============================================================================

def validate_media_url(url: str) -> str:
    """
    Validates URL format and blocks requests to private/internal network addresses (SSRF protection).
    """
    clean_url = (url or "").strip()
    if not clean_url:
        raise ValueError("URL cannot be empty.")

    parsed = urllib.parse.urlsplit(clean_url)
    if parsed.scheme.lower() not in ("http", "https"):
        raise ValueError(f"Invalid URL protocol: '{parsed.scheme}'. Only HTTP and HTTPS URLs are supported.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid URL: missing host.")

    # Block localhost / private IP hostnames explicitly
    if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"):
        raise ValueError("Access to local/private network resources is prohibited.")

    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror as e:
        raise ValueError(f"Could not resolve video host '{hostname}': {e}")

    for _, _, _, _, sockaddr in addr_info:
        ip = ipaddress.ip_address(sockaddr[0])
        if (
            ip.is_loopback
            or ip.is_private
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            raise ValueError(f"Access to private or cloud-internal network destination ({ip}) is prohibited.")

    return clean_url


def is_direct_media_url(url: str) -> bool:
    """Checks whether URL points directly to a video binary file."""
    parsed = urllib.parse.urlsplit(url.strip())
    path = parsed.path.lower()
    known_exts = (".mp4", ".webm", ".mov", ".m4v", ".mkv", ".ts")
    if any(path.endswith(ext) for ext in known_exts):
        return True

    # Check for direct supabase or s3 storage patterns
    if "/storage/v1/object/" in path or "storage.googleapis.com" in parsed.netloc:
        return True

    return False


# ==============================================================================
# Direct Media Streaming Downloader
# ==============================================================================

def download_direct_media(
    url: str,
    output_dir: Path,
    start_seconds: float = 0.0,
    end_seconds: float | None = None,
    progress_callback: Callable[[str], None] | None = None,
    filename_prefix: str = "source",
    user_agent: str | None = None,
) -> Path:
    """
    Downloads direct video files (MP4, WebM, MOV) over HTTP/HTTPS with streaming chunks,
    progress callbacks, SSRF protection, size limits, and FFmpeg segment trimming.
    """
    clean_url = validate_media_url(url)
    output_dir.mkdir(parents=True, exist_ok=True)
    raw_dest = output_dir / f"{filename_prefix}_raw.mp4"
    final_dest = output_dir / f"{filename_prefix}.mp4"

    headers = {
        "User-Agent": user_agent or DEFAULT_USER_AGENT,
        "Accept": "*/*",
    }

    if progress_callback:
        progress_callback("[download] Connecting to direct media source...")

    def on_redirect_response(response: httpx.Response) -> None:
        """Validate redirect destinations to prevent SSRF bypass via 301/302 redirects."""
        if response.is_redirect:
            loc = response.headers.get("Location")
            if loc:
                resolved = urllib.parse.urljoin(str(response.url), loc)
                validate_media_url(resolved)

    downloaded = 0
    with httpx.Client(
        headers=headers,
        follow_redirects=True,
        timeout=90.0,
        event_hooks={"response": [on_redirect_response]},
    ) as client:
        with client.stream("GET", clean_url) as resp:
            if resp.status_code >= 400:
                raise RuntimeError(f"Direct media source responded with HTTP {resp.status_code}: {resp.reason_phrase}")

            content_len_str = resp.headers.get("content-length")
            total_bytes = int(content_len_str) if content_len_str and content_len_str.isdigit() else 0

            if total_bytes > MAX_DIRECT_DOWNLOAD_BYTES:
                raise ValueError(
                    f"File size exceeds maximum allowed limit ({total_bytes // (1024*1024)}MB > {MAX_DIRECT_DOWNLOAD_BYTES // (1024*1024)}MB)."
                )

            with open(raw_dest, "wb") as f:
                for chunk in resp.iter_bytes(chunk_size=512 * 1024):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if downloaded > MAX_DIRECT_DOWNLOAD_BYTES:
                        raw_dest.unlink(missing_ok=True)
                        raise ValueError(f"Download aborted: file exceeds {MAX_DIRECT_DOWNLOAD_BYTES // (1024*1024)}MB limit.")

                    if progress_callback and total_bytes > 0:
                        pct = (downloaded / total_bytes) * 100
                        mb_down = downloaded / (1024 * 1024)
                        mb_total = total_bytes / (1024 * 1024)
                        progress_callback(f"[download] {pct:5.1f}% of {mb_total:.1f}MB ({mb_down:.1f}MB downloaded)")

    if not raw_dest.exists() or raw_dest.stat().st_size == 0:
        raise RuntimeError("Direct media download produced an empty file.")

    # Validate container header / magic bytes
    with open(raw_dest, "rb") as sample_f:
        header_sample = sample_f.read(64)

    is_valid_media = (
        b"ftyp" in header_sample
        or header_sample.startswith(b"\x1a\x45\xdf\xa3")  # WebM / MKV
        or header_sample.startswith(b"RIFF")  # AVI
        or header_sample.startswith(b"OggS")  # OGG
        or header_sample.startswith(b"\x00\x00\x01\xba")  # MPEG
        or header_sample.startswith(b"G")  # MPEG-TS
        or b"moov" in header_sample
    )
    if not is_valid_media:
        raw_dest.unlink(missing_ok=True)
        raise ValueError(
            "The direct URL did not return a valid video stream (unrecognized container header). "
            "Please verify the URL points directly to an MP4, WebM, or MOV file."
        )

    # Trim segment if requested
    use_trim = (start_seconds > 0.0) or (end_seconds is not None and end_seconds > start_seconds)
    if use_trim:
        if progress_callback:
            progress_callback(f"[download] Trimming segment ({start_seconds}s - {end_seconds or 'end'}s)...")

        trim_args = ["-ss", str(start_seconds)]
        if end_seconds and end_seconds > start_seconds:
            trim_args.extend(["-to", str(end_seconds)])
        trim_args.extend(["-i", str(raw_dest)])

        # Try fast stream-copy first
        try:
            run_ffmpeg([*trim_args, "-c", "copy", str(final_dest)])
        except Exception:
            # Fallback to re-encode if stream copy fails on non-keyframe boundaries
            run_ffmpeg([*trim_args, "-c:v", "libx264", "-c:a", "aac", str(final_dest)])

        raw_dest.unlink(missing_ok=True)
        return final_dest
    else:
        if raw_dest != final_dest:
            if final_dest.exists():
                final_dest.unlink()
            raw_dest.rename(final_dest)
        return final_dest


# ==============================================================================
# Cookie Normalization & Validation Helper
# ==============================================================================

def normalize_and_validate_cookies(raw_text: str, output_path: Path) -> tuple[bool, int, list[str]]:
    """
    Safely parses, normalizes, and validates Netscape HTTP Cookie format text.
    Handles:
    - Base64 encoding (e.g. `base64:...` prefix or raw base64 string).
    - Escaped newlines (\\r\\n, \\n) and escaped tabs (\\t).
    - Space-separated columns instead of tabs.
    - Missing '# Netscape HTTP Cookie File' header.
    - Wrapping quotes added by cloud secret managers.

    Returns:
        (is_valid: bool, cookie_count: int, detected_cookie_names: list[str])
    """
    text = (raw_text or "").strip()
    if not text:
        return (False, 0, [])

    # Strip wrapping quotes if entire string was quoted in environment variable
    if (text.startswith('"') and text.endswith('"')) or (text.startswith("'") and text.endswith("'")):
        text = text[1:-1].strip()

    # 1. Base64 auto-detection
    if text.startswith("base64:"):
        try:
            text = base64.b64decode(text[7:]).decode("utf-8", errors="ignore")
        except Exception as e:
            logger.warning("Failed to decode base64: prefix in cookie text: %s", e)
    elif not any(c in text for c in ("\n", "\t", " ")) and len(text) > 40:
        try:
            decoded = base64.b64decode(text).decode("utf-8", errors="ignore")
            if "youtube" in decoded.lower() or "cookie" in decoded.lower() or "\t" in decoded:
                text = decoded
        except Exception:
            pass

    # 2. Unescape literal escaped backslash characters
    if "\\n" in text and "\n" not in text:
        text = text.replace("\\r\\n", "\n").replace("\\n", "\n")
    if "\\t" in text and "\t" not in text:
        text = text.replace("\\t", "\t")

    lines = text.splitlines()
    cleaned_lines: list[str] = []
    has_header = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if "netscape" in stripped.lower():
            has_header = True
            cleaned_lines.append("# Netscape HTTP Cookie File")
            continue
        if stripped.startswith("#"):
            cleaned_lines.append(stripped)
            continue

        # If line has tabs, keep clean tab-separated format
        if "\t" in stripped:
            parts = stripped.split("\t")
            if len(parts) >= 7:
                cleaned_lines.append("\t".join(p.strip() for p in parts[:7]))
                continue

        # If spaces were used instead of tabs by copy-paste or editor
        parts = re.split(r"\s+", stripped)
        if len(parts) >= 7:
            col7 = "\t".join(parts[:6] + [" ".join(parts[6:])])
            cleaned_lines.append(col7)
        else:
            cleaned_lines.append(stripped)

    if not has_header:
        cleaned_lines.insert(0, "# Netscape HTTP Cookie File")
        cleaned_lines.insert(1, "# Generated by CreatorOps")

    content = "\n".join(cleaned_lines) + "\n"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")

    # 3. Validate with standard MozillaCookieJar
    try:
        cj = http.cookiejar.MozillaCookieJar(str(output_path))
        cj.load(ignore_discard=True, ignore_expires=True)
        cookie_names = [c.name for c in cj]
        return (len(cookie_names) > 0, len(cookie_names), cookie_names)
    except Exception as val_err:
        logger.warning("Cookie file failed validation check: %s", val_err)
        return (False, 0, [])


# ==============================================================================
# YouTube & Universal Media Downloader
# ==============================================================================

def download_youtube(
    url: str,
    output_dir: Path,
    browser: str | None = None,
    user_agent: str | None = None,
    cookie_file: Path | None = None,
    start_seconds: float = 0.0,
    end_seconds: float | None = None,
    progress_callback: Callable[[str], None] | None = None,
    filename_prefix: str = "source",
) -> Path:
    """
    Downloads video from YouTube or any supported platform URL.
    - Routes direct media URLs to download_direct_media.
    - Applies SSRF protection and security validation.
    - For YouTube: uses normalized cookies (Netscape or Base64), PO token, and prioritized clients.
    - Fallback to segment trimming with FFmpeg if range downloading is unavailable.
    """
    clean_url = validate_media_url(url)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Route direct video URLs immediately without yt-dlp overhead
    if is_direct_media_url(clean_url):
        return download_direct_media(
            url=clean_url,
            output_dir=output_dir,
            start_seconds=start_seconds,
            end_seconds=end_seconds,
            progress_callback=progress_callback,
            filename_prefix=filename_prefix,
            user_agent=user_agent,
        )

    # Ensure FFmpeg directory is in system PATH so yt-dlp range downloader finds it
    ffmpeg_exe = ffmpeg_path()
    ffmpeg_dir = str(Path(ffmpeg_exe).parent)
    if ffmpeg_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

    effective_user_agent = (
        os.getenv("YOUTUBE_USER_AGENT", "").strip()
        or user_agent
        or DEFAULT_USER_AGENT
    )
    po_token = os.getenv("YOUTUBE_PO_TOKEN", "").strip()

    base_options = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "merge_output_format": "mp4",
        "outtmpl": str(output_dir / f"{filename_prefix}.%(ext)s"),
        "ffmpeg_location": ffmpeg_exe,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "geo_bypass": True,
        "http_headers": {
            "User-Agent": effective_user_agent,
            "Accept-Language": "en-US,en;q=0.9",
        },
    }

    if progress_callback:
        def hook(d: dict) -> None:
            if d.get("status") == "downloading":
                percent = d.get("_percent_str", "").strip()
                total = d.get("_total_bytes_str", d.get("_total_bytes_estimate_str", "")).strip()
                speed = d.get("_speed_str", "").strip()
                eta = d.get("_eta_str", "").strip()
                msg = f"[download]  {percent} of  {total} at    {speed} ETA {eta}".strip()
                progress_callback(msg)
        base_options["progress_hooks"] = [hook]

    js_runtimes = get_js_runtimes()
    if js_runtimes:
        base_options["js_runtimes"] = js_runtimes

    # Detect if target is YouTube
    parsed_netloc = urllib.parse.urlsplit(clean_url).netloc.lower()
    is_yt = any(domain in parsed_netloc for domain in ("youtube.com", "youtu.be", "youtube-nocookie.com"))

    # Discover cookie source
    primary_cookie_source: tuple[str, str] | None = None
    cookie_diagnostic_err: str | None = None

    if cookie_file and cookie_file.exists():
        primary_cookie_source = ("file", str(cookie_file))
    elif browser and browser.lower() != "none":
        primary_cookie_source = ("browser", browser.lower())
    else:
        env_ck_file = os.getenv("YOUTUBE_COOKIES_FILE", "").strip()
        env_ck_text = os.getenv("YOUTUBE_COOKIES_TEXT", "").strip()
        if env_ck_file and Path(env_ck_file).exists():
            primary_cookie_source = ("file", str(Path(env_ck_file).resolve()))
        elif env_ck_text:
            env_cookie_path = output_dir / "env_cookies.txt"
            is_valid, count, cookie_names = normalize_and_validate_cookies(env_ck_text, env_cookie_path)
            if is_valid and count > 0:
                primary_cookie_source = ("file", str(env_cookie_path))
                logger.info("Successfully loaded %d valid cookies from YOUTUBE_COOKIES_TEXT for YouTube authentication.", count)
            else:
                cookie_diagnostic_err = "YOUTUBE_COOKIES_TEXT is configured but contains 0 valid Netscape cookies or has an invalid format."
                logger.warning(cookie_diagnostic_err)
        else:
            default_ck = Path(__file__).parent / "default_cookies.txt"
            if default_ck.exists():
                primary_cookie_source = ("file", str(default_ck))

    # Helper function to construct attempt options dictionary
    def make_opts(cookie_source: tuple[str, str] | None, player_client: str | None, use_range: bool) -> dict:
        opts = dict(base_options)
        if use_range and (start_seconds or end_seconds):
            s = start_seconds or 0.0
            e = end_seconds if (end_seconds and end_seconds > s) else None
            if e is not None:
                opts["download_ranges"] = yt_dlp.utils.download_range_func(None, [(s, e)])
        if is_yt and player_client:
            opts["extractor_args"] = {"youtube": {"player_client": [player_client]}}
        if is_yt and po_token:
            ext_args = opts.setdefault("extractor_args", {}).setdefault("youtube", {})
            ext_args["po_token"] = [f"web+{po_token}", f"mweb+{po_token}"]
        if cookie_source:
            kind, val = cookie_source
            if kind == "file":
                opts["cookiefile"] = val
            elif kind == "browser":
                opts["cookiesfrombrowser"] = (val,)
        return opts

    attempts: list[dict] = []

    if is_yt:
        # Tier 1: With cookies if available (highest quality: web & android)
        if primary_cookie_source:
            attempts.append(make_opts(primary_cookie_source, "web", use_range=True))
            attempts.append(make_opts(primary_cookie_source, "android", use_range=False))
            attempts.append(make_opts(primary_cookie_source, "ios", use_range=False))

        # Tier 2: Android client alone (consistently bypasses datacenter bot detection on cloud servers)
        attempts.append(make_opts(None, "android", use_range=True))
        attempts.append(make_opts(None, "android", use_range=False))

        # Tier 3: Android Creator & iOS clients
        attempts.append(make_opts(None, "android_creator", use_range=False))
        attempts.append(make_opts(None, "ios", use_range=False))

        # Tier 4: Mobile Web client
        attempts.append(make_opts(None, "mweb", use_range=False))

        # Tier 5: Default extractor
        attempts.append(make_opts(None, None, use_range=False))
    else:
        # Non-YouTube URL (Vimeo, Twitter, TikTok, generic platforms)
        attempts.append(make_opts(primary_cookie_source, None, use_range=True))
        attempts.append(make_opts(None, None, use_range=False))

    last_exception: Exception | None = None
    downloaded: Path | None = None

    for opts in attempts:
        try:
            with yt_dlp.YoutubeDL(opts) as downloader:
                info = downloader.extract_info(clean_url, download=True)
                prep_path = Path(downloader.prepare_filename(info))
                if prep_path.exists():
                    downloaded = prep_path
                    break
                matches = list(output_dir.glob(f"{filename_prefix}.*"))
                if matches:
                    downloaded = matches[0]
                    break
        except Exception as error:
            last_exception = error
            continue

    if not downloaded or not downloaded.exists():
        # Final Subprocess CLI Fallback if Python API attempts fail
        try:
            cmd = [
                sys.executable,
                "-m",
                "yt_dlp",
                "--format",
                "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                "--merge-output-format",
                "mp4",
                "--output",
                str(output_dir / f"{filename_prefix}.%(ext)s"),
                "--no-playlist",
                "--quiet",
                "--no-warnings",
            ]
            if primary_cookie_source and primary_cookie_source[0] == "file":
                cmd.extend(["--cookies", primary_cookie_source[1]])
            if is_yt:
                if primary_cookie_source:
                    cmd.extend(["--extractor-args", "youtube:player_client=web,android"])
                else:
                    cmd.extend(["--extractor-args", "youtube:player_client=android"])
            if is_yt and po_token:
                cmd.extend(["--extractor-args", f"youtube:po_token=web+{po_token}"])
            cmd.append(clean_url)
            subprocess.run(cmd, check=True, capture_output=True)
            matches = list(output_dir.glob(f"{filename_prefix}.*"))
            if matches:
                downloaded = matches[0]
        except Exception as error:
            raw_err = str(last_exception or error)
            if "Sign in to confirm you’re not a bot" in raw_err or "bot" in raw_err.lower() or "login" in raw_err.lower():
                if cookie_diagnostic_err:
                    raise RuntimeError(
                        f"YouTube bot protection blocked this request: {cookie_diagnostic_err} "
                        "Please verify the cookie text in YOUTUBE_COOKIES_TEXT, or enter a direct video URL (MP4/WebM/MOV)."
                    ) from error
                elif primary_cookie_source:
                    raise RuntimeError(
                        "YouTube rejected the session cookies on Render (cookies may be expired, invalid, or flagged). "
                        "Export fresh cookies from your logged-in YouTube browser session and update YOUTUBE_COOKIES_TEXT, "
                        "or enter a direct video URL (MP4/WebM/MOV)."
                    ) from error
                else:
                    raise RuntimeError(
                        "YouTube bot protection blocked this request on the cloud server. "
                        "To download YouTube videos in production, set YOUTUBE_COOKIES_TEXT in Render environment variables, "
                        "or enter a direct video URL (MP4/WebM/MOV)."
                    ) from error
            elif "Private video" in raw_err or "Video unavailable" in raw_err:
                raise RuntimeError("Video is private, removed, or geo-restricted.") from error
            else:
                raise RuntimeError(f"Video download failed: {raw_err}") from error

    if not downloaded or not downloaded.exists():
        matches = list(output_dir.glob(f"{filename_prefix}.*"))
        if not matches:
            raise FileNotFoundError("The video download did not produce a valid media file.")
        downloaded = matches[0]

    mp4_file = downloaded.with_suffix(".mp4")
    if mp4_file.exists():
        final_video = mp4_file
    else:
        final_video = downloaded

    # If range download was skipped and start/end seconds were specified, trim with FFmpeg
    if (start_seconds > 0.0 or (end_seconds is not None and end_seconds > start_seconds)):
        trimmed_file = output_dir / f"{filename_prefix}_trimmed.mp4"
        trim_args = ["-ss", str(start_seconds)]
        if end_seconds and end_seconds > start_seconds:
            trim_args.extend(["-to", str(end_seconds)])
        trim_args.extend(["-i", str(final_video)])
        try:
            run_ffmpeg([*trim_args, "-c", "copy", str(trimmed_file)])
            if trimmed_file.exists() and trimmed_file.stat().st_size > 0:
                final_video.unlink(missing_ok=True)
                return trimmed_file
        except Exception:
            try:
                run_ffmpeg([*trim_args, "-c:v", "libx264", "-c:a", "aac", str(trimmed_file)])
                if trimmed_file.exists() and trimmed_file.stat().st_size > 0:
                    final_video.unlink(missing_ok=True)
                    return trimmed_file
            except Exception:
                pass

    return final_video


def save_upload(uploaded_file: object, destination: Path) -> Path:
    """
    Saves an uploaded file to destination, supporting both FastAPI UploadFile
    and Streamlit UploadedFile formats.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)

    if hasattr(uploaded_file, "file") and hasattr(uploaded_file.file, "read"):
        # FastAPI UploadFile
        uploaded_file.file.seek(0)
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)
    elif hasattr(uploaded_file, "getbuffer"):
        # Streamlit UploadedFile
        destination.write_bytes(uploaded_file.getbuffer())
    elif hasattr(uploaded_file, "read"):
        data = uploaded_file.read()
        if isinstance(data, bytes):
            destination.write_bytes(data)
        else:
            destination.write_text(str(data), encoding="utf-8")
    else:
        raise TypeError(f"Unsupported upload file type: {type(uploaded_file)}")

    return destination



def make_crop_filter(
    in_stream: str,
    w: int,
    h: int,
    mode: str = "cover",
    x_pct: float = 50.0,
    y_pct: float = 50.0,
    zoom: float = 1.0,
    crop_x1_pct: float | None = None,
    crop_y1_pct: float | None = None,
    crop_x2_pct: float | None = None,
    crop_y2_pct: float | None = None,
    out_name: str = "v",
) -> str:
    if mode == "contain":
        return f"[{in_stream}]scale={w}:{h}:force_original_aspect_ratio=decrease,pad=w='max({w},iw)':h='max({h},ih)':x='(ow-iw)/2':y='(oh-ih)/2':color=black,crop={w}:{h},setsar=1[{out_name}];"
    elif mode == "top":
        return f"[{in_stream}]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}:x='(iw-ow)/2':y=0,setsar=1[{out_name}];"
    elif mode == "bottom":
        return f"[{in_stream}]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}:x='(iw-ow)/2':y='ih-oh',setsar=1[{out_name}];"
    elif mode == "custom":
        if crop_x1_pct is not None and crop_y1_pct is not None and crop_x2_pct is not None and crop_y2_pct is not None:
            x1p = max(0.0, min(100.0, float(crop_x1_pct))) / 100.0
            y1p = max(0.0, min(100.0, float(crop_y1_pct))) / 100.0
            x2p = max(0.0, min(100.0, float(crop_x2_pct))) / 100.0
            y2p = max(0.0, min(100.0, float(crop_y2_pct))) / 100.0
            if x2p <= x1p:
                x2p = min(1.0, x1p + 0.05)
            if y2p <= y1p:
                y2p = min(1.0, y1p + 0.05)
            ow_expr = f"iw*{(x2p - x1p):.4f}"
            oh_expr = f"ih*{(y2p - y1p):.4f}"
            x_expr = f"iw*{x1p:.4f}"
            y_expr = f"ih*{y1p:.4f}"
            return f"[{in_stream}]crop=w='{ow_expr}':h='{oh_expr}':x='{x_expr}':y='{y_expr}',scale={w}:{h},setsar=1[{out_name}];"
        else:
            z = max(float(zoom), 1.0)
            xp = max(0.0, min(100.0, float(x_pct))) / 100.0
            yp = max(0.0, min(100.0, float(y_pct))) / 100.0
            ow_expr = f"min(iw, ih*{w}/{h}/{z:.2f})"
            oh_expr = f"min(ih, iw*{h}/{w}/{z:.2f})"
            x_expr = f"(iw-ow)*{xp:.4f}"
            y_expr = f"(ih-oh)*{yp:.4f}"
            return f"[{in_stream}]crop=w='{ow_expr}':h='{oh_expr}':x='{x_expr}':y='{y_expr}',scale={w}:{h},setsar=1[{out_name}];"
    else:  # "cover" / center crop
        return f"[{in_stream}]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}:x='(iw-ow)/2':y='(ih-oh)/2',setsar=1[{out_name}];"


def build_video_advanced(
    source1: Path,
    source2: Path | None,
    music: Path | None,
    output: Path,
    layout: str = "split_v",
    ratio: str = "9:16",
    v1_slot: str = "top",
    v1_start: float = 0.0,
    v1_end: float | None = None,
    v2_start: float = 0.0,
    v2_end: float | None = None,
    v1_volume: float = 1.0,
    v2_volume: float = 1.0,
    music_volume: float = 0.18,
    pip_position: str = "Bottom right",
    pip_size: float = 0.35,
    crop_mode: str = "cover",
    crop_x_pct: float = 50.0,
    crop_y_pct: float = 50.0,
    crop_zoom: float = 1.0,
    crop_x1_pct: float | None = None,
    crop_y1_pct: float | None = None,
    crop_x2_pct: float | None = None,
    crop_y2_pct: float | None = None,
) -> None:
    width, height = {
        "9:16": (1080, 1920),
        "16:9": (1920, 1080),
        "1:1": (1080, 1080),
        "4:5": (1080, 1350),
    }[ratio]

    inputs: list[str] = []
    
    # Input 0: source1
    inputs.extend(["-ss", str(v1_start)])
    if v1_end is not None and v1_end > v1_start:
        inputs.extend(["-to", str(v1_end)])
    inputs.extend(["-i", str(source1)])

    # Input 1 (optional): source2
    source2_idx = None
    if source2:
        source2_idx = 1
        inputs.extend(["-ss", str(v2_start)])
        if v2_end is not None and v2_end > v2_start:
            inputs.extend(["-to", str(v2_end)])
        inputs.extend(["-i", str(source2)])

    # Input Music (optional)
    music_idx = None
    if music:
        music_idx = len(inputs) // 2  # next input index
        inputs.extend(["-stream_loop", "-1", "-i", str(music)])

    filter_complex_parts: list[str] = []
    
    # VIDEO FILTER LOGIC
    if layout == "top_landscape" and source2:
        h_top = int(round((width * 9 / 16) / 2) * 2)  # Ensure even height for libx264 (e.g. 608 for 1080w)
        h_bot = height - h_top
        if h_bot % 2 != 0:
            h_bot -= 1
            h_top += 1
        
        if v1_slot == "bottom":
            top_in, bot_in = "1:v", "0:v"
        else:
            top_in, bot_in = "0:v", "1:v"
            
        filter_complex_parts.append(
            make_crop_filter(top_in, width, h_top, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="v_top") +
            make_crop_filter(bot_in, width, h_bot, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="v_bot") +
            f"[v_top][v_bot]vstack=inputs=2[video]"
        )
    elif layout == "split_v" and source2:
        h_top = (height // 2 // 2) * 2
        h_bot = height - h_top
        
        # Decide which input goes to top vs bottom
        if v1_slot == "bottom":
            top_in, bot_in = "1:v", "0:v"
        else:
            top_in, bot_in = "0:v", "1:v"
            
        filter_complex_parts.append(
            make_crop_filter(top_in, width, h_top, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="v_top") +
            make_crop_filter(bot_in, width, h_bot, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="v_bot") +
            f"[v_top][v_bot]vstack=inputs=2[video]"
        )
    elif layout == "split_h" and source2:
        w_left = (width // 2 // 2) * 2
        w_right = width - w_left
        
        if v1_slot == "right":
            left_in, right_in = "1:v", "0:v"
        else:
            left_in, right_in = "0:v", "1:v"
            
        filter_complex_parts.append(
            make_crop_filter(left_in, w_left, height, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="v_left") +
            make_crop_filter(right_in, w_right, height, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="v_right") +
            f"[v_left][v_right]hstack=inputs=2[video]"
        )
    elif layout == "pip" and source2:
        if v1_slot == "overlay":
            main_in, ov_in = "1:v", "0:v"
        else:
            main_in, ov_in = "0:v", "1:v"
            
        w_ov = max(int(width * pip_size), 240)
        pos_map = {
            "Top right": f"{width}-w-32:32",
            "Bottom right": f"{width}-w-32:{height}-h-32",
            "Bottom left": f"32:{height}-h-32",
            "Top left": f"32:32",
        }
        pos = pos_map.get(pip_position, f"{width}-w-32:{height}-h-32")
        
        filter_complex_parts.append(
            make_crop_filter(main_in, width, height, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="main_v") +
            f"[{ov_in}]scale={w_ov}:-2,setsar=1[ov_v];" +
            f"[main_v][ov_v]overlay={pos}[video]"
        )
    else:
        # Single video fallback or single input mode
        filter_complex_parts.append(
            make_crop_filter("0:v", width, height, mode=crop_mode, x_pct=crop_x_pct, y_pct=crop_y_pct, zoom=crop_zoom, crop_x1_pct=crop_x1_pct, crop_y1_pct=crop_y1_pct, crop_x2_pct=crop_x2_pct, crop_y2_pct=crop_y2_pct, out_name="video")
        )

    # AUDIO FILTER LOGIC
    audio_inputs: list[tuple[str, float]] = []
    if has_audio(source1):
        audio_inputs.append(("0:a", v1_volume))
    if source2 and source2_idx is not None and has_audio(source2):
        audio_inputs.append((f"{source2_idx}:a", v2_volume))

    if music and music_idx is not None:
        audio_inputs.append((f"{music_idx}:a", music_volume))

    if len(audio_inputs) > 1:
        mix_parts: list[str] = []
        mix_names: list[str] = []
        for idx, (stream, vol) in enumerate(audio_inputs):
            name = f"a{idx}"
            mix_parts.append(f"[{stream}]aresample=async=1,volume={vol:.2f}[{name}]")
            mix_names.append(f"[{name}]")
        
        mix_str = ";".join(mix_parts) + f";{''.join(mix_names)}amix=inputs={len(audio_inputs)}:duration=longest:dropout_transition=2[audio]"
        filter_complex_parts.append(mix_str)
        audio_map = ["-map", "[audio]"]
    elif len(audio_inputs) == 1:
        stream, vol = audio_inputs[0]
        filter_complex_parts.append(f"[{stream}]volume={vol:.2f}[audio]")
        audio_map = ["-map", "[audio]"]
    else:
        audio_map = []

    cleaned_parts = [p.strip("; \r\n\t") for p in filter_complex_parts if p.strip("; \r\n\t")]
    filter_complex_str = ";".join(cleaned_parts)

    cmd = [
        *inputs,
        "-filter_complex", filter_complex_str,
        "-map", "[video]",
        *audio_map,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "21",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        str(output),
    ]
    run_ffmpeg(cmd)


def build_video(
    source: Path,
    overlay: Path | None,
    music: Path | None,
    output: Path,
    start_seconds: float,
    end_seconds: float | None,
    ratio: str,
    overlay_position: str,
    music_volume: float,
) -> None:
    layout = "pip" if overlay else "single"
    build_video_advanced(
        source1=source,
        source2=overlay,
        music=music,
        output=output,
        layout=layout,
        ratio=ratio,
        v1_slot="main",
        v1_start=start_seconds,
        v1_end=end_seconds,
        v2_start=0.0,
        v2_end=None,
        v1_volume=1.0,
        v2_volume=1.0,
        music_volume=music_volume,
        pip_position=overlay_position,
        pip_size=0.33,
    )


def estimate_processing_time(
    v1_duration: float,
    v2_duration: float = 0.0,
    has_youtube: bool = False,
    layout: str = "split_v",
    ratio: str = "9:16",
) -> dict[str, float | str]:
    clip_dur = max(v1_duration, v2_duration) if (v1_duration and v2_duration) else (v1_duration or v2_duration or 15.0)
    dl_est = 12.0 if has_youtube else 2.0
    filter_multiplier = 0.45 if layout in ("split_v", "split_h", "pip") else 0.3
    ffmpeg_est = max(3.0, clip_dur * filter_multiplier)
    total_est = dl_est + ffmpeg_est
    
    if total_est < 60:
        human_readable = f"~{int(total_est)} seconds"
    else:
        human_readable = f"~{total_est / 60:.1f} minutes"
        
    return {
        "clip_duration": clip_dur,
        "download_est": dl_est,
        "ffmpeg_est": ffmpeg_est,
        "total_est": total_est,
        "human_readable": human_readable,
    }

