from __future__ import annotations

import subprocess
from pathlib import Path

import imageio_ffmpeg
import yt_dlp
from yt_dlp.utils import DownloadError


import os
import shutil


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


from typing import Callable


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
    # Ensure FFmpeg directory is in system PATH so yt-dlp range downloader finds it
    ffmpeg_exe = ffmpeg_path()
    ffmpeg_dir = str(Path(ffmpeg_exe).parent)
    if ffmpeg_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

    options = {
        "format": "bv*+ba/b",
        "merge_output_format": "mp4",
        "outtmpl": str(output_dir / f"{filename_prefix}.%(ext)s"),
        "ffmpeg_location": ffmpeg_exe,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "ios", "mweb", "web"],
            }
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
        options["progress_hooks"] = [hook]

    if start_seconds or end_seconds:
        s = start_seconds or 0.0
        e = end_seconds if (end_seconds and end_seconds > s) else None
        if e is not None:
            options["download_ranges"] = yt_dlp.utils.download_range_func(None, [(s, e)])

    js_runtimes = get_js_runtimes()
    if js_runtimes:
        options["js_runtimes"] = js_runtimes

    if cookie_file and cookie_file.exists():
        options["cookiefile"] = str(cookie_file)
    else:
        default_ck = Path(__file__).parent / "default_cookies.txt"
        if default_ck.exists():
            options["cookiefile"] = str(default_ck)
        elif browser:
            options["cookiesfrombrowser"] = (browser,)

    if user_agent:
        options["http_headers"] = {"User-Agent": user_agent}

    try:
        with yt_dlp.YoutubeDL(options) as downloader:
            info = downloader.extract_info(url, download=True)
            downloaded = Path(downloader.prepare_filename(info))
    except DownloadError as error:
        error_msg = str(error)
        # Fallback 1: HTTP 403 Forbidden or keyframe cut failure -> Retry with alternative client
        if "HTTP Error 403" in error_msg or "403" in error_msg or "download_ranges" in options:
            if "download_ranges" in options:
                del options["download_ranges"]
            options["extractor_args"] = {"youtube": {"player_client": ["android", "mweb"]}}
            try:
                with yt_dlp.YoutubeDL(options) as downloader:
                    info = downloader.extract_info(url, download=True)
                    downloaded = Path(downloader.prepare_filename(info))
            except DownloadError as fallback_error:
                error = fallback_error
                error_msg = str(fallback_error)

        if "Could not copy" in error_msg and "cookie database" in error_msg:
            b_name = browser.capitalize() if browser else "Chrome"
            raise RuntimeError(
                f"Could not access {b_name} cookies because the browser is currently running. "
                f"Please CLOSE {b_name} completely (including background tasks in Windows Task Manager), "
                "or upload a cookies.txt file, or set YouTube sign-in to 'None', then try again."
            ) from error
        elif "Sign in to confirm you" in error_msg or "bot" in error_msg.lower():
            raise RuntimeError(
                "YouTube requested bot verification ('Sign in to confirm you're not a bot'). "
                "To resolve this:\n"
                "1. Open YouTube in Chrome/Edge/Firefox and refresh the video.\n"
                "2. Select your browser under 'YouTube sign-in' in the app sidebar.\n"
                "3. Make sure to CLOSE your browser before clicking Render (so Windows unlocks the cookie database).\n"
                "4. Or upload a exported cookies.txt file directly in the sidebar."
            ) from error
        else:
            raise RuntimeError(f"YouTube download failed: {error}") from error

    mp4_file = downloaded.with_suffix(".mp4")
    if mp4_file.exists():
        return mp4_file
    if downloaded.exists():
        return downloaded
    matches = list(output_dir.glob(f"{filename_prefix}.*"))
    if not matches:
        raise FileNotFoundError("The YouTube download did not produce a video file.")
    return matches[0]


def save_upload(uploaded_file: object, destination: Path) -> Path:
    destination.write_bytes(uploaded_file.getbuffer())
    return destination


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
            f"[{top_in}]scale={width}:{h_top}:force_original_aspect_ratio=decrease,pad=w='max({width},iw)':h='max({h_top},ih)':x='(ow-iw)/2':y='(oh-ih)/2':color=black,crop={width}:{h_top},setsar=1[v_top];"
            f"[{bot_in}]scale={width}:{h_bot}:force_original_aspect_ratio=increase,crop={width}:{h_bot},setsar=1[v_bot];"
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
            f"[{top_in}]scale={width}:{h_top}:force_original_aspect_ratio=increase,crop={width}:{h_top},setsar=1[v_top];"
            f"[{bot_in}]scale={width}:{h_bot}:force_original_aspect_ratio=increase,crop={width}:{h_bot},setsar=1[v_bot];"
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
            f"[{left_in}]scale={w_left}:{height}:force_original_aspect_ratio=increase,crop={w_left}:{height},setsar=1[v_left];"
            f"[{right_in}]scale={w_right}:{height}:force_original_aspect_ratio=increase,crop={w_right}:{height},setsar=1[v_right];"
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
            f"[{main_in}]scale={width}:{height}:force_original_aspect_ratio=decrease,pad=w='max({width},iw)':h='max({height},ih)':x='(ow-iw)/2':y='(oh-ih)/2':color=black,crop={width}:{height},setsar=1[main_v];"
            f"[{ov_in}]scale={w_ov}:-2,setsar=1[ov_v];"
            f"[main_v][ov_v]overlay={pos}[video]"
        )
    else:
        # Single video fallback or single input mode
        filter_complex_parts.append(
            f"[0:v]scale={width}:{height}:force_original_aspect_ratio=decrease,pad=w='max({width},iw)':h='max({height},ih)':x='(ow-iw)/2':y='(oh-ih)/2':color=black,crop={width}:{height},setsar=1[video]"
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

    filter_complex_str = ";".join(filter_complex_parts)

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

