from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("tubepilot.youtube_auth")

# Relax strict oauthlib scope equality check when Google includes OpenID/profile scopes
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

# Load environment variables (.env) from backend, project root, and workspace root
_CURR_DIR = Path(__file__).resolve().parent
load_dotenv(_CURR_DIR / ".env")
load_dotenv(_CURR_DIR.parent / ".env")
load_dotenv(_CURR_DIR.parents[1] / ".env")
load_dotenv()

# Scopes required for Channel profile, reading videos, uploading, and Google OIDC profile
YOUTUBE_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
]

TOKEN_STORE_DIR = Path(__file__).resolve().parent.parent / ".credentials"
TOKEN_FILE_PATH = TOKEN_STORE_DIR / "youtube_token.json"
CLIENT_SECRET_FILE_PATH = TOKEN_STORE_DIR / "client_secret.json"
VERIFIER_FILE_PATH = TOKEN_STORE_DIR / "code_verifier.txt"

def get_client_id() -> str:
    """Retrieve Google OAuth Client ID from environment variables or local credentials file."""
    env_val = os.getenv("YOUTUBE_CLIENT_ID", "").strip()
    if env_val:
        return env_val
    if CLIENT_SECRET_FILE_PATH.exists():
        try:
            with open(CLIENT_SECRET_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                info = data.get("web") or data.get("installed") or {}
                cid = str(info.get("client_id", "")).strip()
                if cid:
                    return cid
        except Exception:
            pass
    return ""


def get_client_secret() -> str:
    """Retrieve Google OAuth Client Secret from environment variables or local credentials file."""
    env_val = os.getenv("YOUTUBE_CLIENT_SECRET", "").strip()
    if env_val:
        return env_val
    if CLIENT_SECRET_FILE_PATH.exists():
        try:
            with open(CLIENT_SECRET_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                info = data.get("web") or data.get("installed") or {}
                if info.get("client_secret"):
                    return str(info["client_secret"]).strip()
        except Exception:
            pass
    return ""


# Kept for backward compatibility with existing imports
DEFAULT_CLIENT_ID = get_client_id()
DEFAULT_CLIENT_SECRET = get_client_secret()


def ensure_credentials_dir() -> None:
    TOKEN_STORE_DIR.mkdir(parents=True, exist_ok=True)


def get_oauth_flow(
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
    redirect_uri: str = "http://localhost:5173",
) -> Flow:
    """Create OAuth 2.0 flow using client ID and client secret."""
    effective_id = (client_id or get_client_id()).strip()
    effective_secret = (client_secret or get_client_secret()).strip()

    if not effective_id or not effective_secret:
        if CLIENT_SECRET_FILE_PATH.exists():
            try:
                flow = Flow.from_client_secrets_file(
                    str(CLIENT_SECRET_FILE_PATH),
                    scopes=YOUTUBE_SCOPES,
                    redirect_uri=redirect_uri,
                )
                return flow
            except Exception:
                pass
        raise ValueError(
            "Missing YouTube OAuth credentials! Please set YOUTUBE_CLIENT_ID and "
            "YOUTUBE_CLIENT_SECRET in your .env file or place client_secret.json in .credentials/"
        )

    client_config = {
        "web": {
            "client_id": effective_id,
            "client_secret": effective_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }
    flow = Flow.from_client_config(
        client_config,
        scopes=YOUTUBE_SCOPES,
        redirect_uri=redirect_uri,
    )
    return flow


def get_authorization_url(
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
    redirect_uri: str = "http://localhost:5173",
    state: Optional[str] = None,
) -> Tuple[str, Flow]:
    """Generate the Google OAuth consent URL and store PKCE verifier."""
    flow = get_oauth_flow(client_id, client_secret, redirect_uri)
    auth_kwargs: Dict[str, Any] = {
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "consent",
    }
    if state:
        auth_kwargs["state"] = state
    auth_url, _ = flow.authorization_url(**auth_kwargs)
    if hasattr(flow, "code_verifier") and flow.code_verifier:
        try:
            ensure_credentials_dir()
            VERIFIER_FILE_PATH.write_text(flow.code_verifier, encoding="utf-8")
        except Exception:
            pass
    return auth_url, flow


def process_oauth_callback(
    code: str,
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
    redirect_uri: str = "http://localhost:5173",
    code_verifier: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Credentials:
    """Exchange authorization code for OAuth tokens and save them with PKCE support and user isolation."""
    flow = get_oauth_flow(client_id, client_secret, redirect_uri)
    
    verifier = code_verifier
    if not verifier and VERIFIER_FILE_PATH.exists():
        try:
            verifier = VERIFIER_FILE_PATH.read_text(encoding="utf-8").strip()
        except Exception:
            pass

    if verifier:
        flow.code_verifier = verifier
    else:
        flow.code_verifier = None

    flow.fetch_token(code=code.strip())
    creds = flow.credentials
    save_credentials(creds, user_id=user_id)

    if VERIFIER_FILE_PATH.exists():
        try:
            VERIFIER_FILE_PATH.unlink()
        except Exception:
            pass

    return creds


def save_credentials(creds: Credentials, user_id: Optional[str] = None) -> None:
    """Save user credentials to secure Supabase database and local store with per-user isolation."""
    data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id or get_client_id(),
        "client_secret": creds.client_secret or get_client_secret(),
        "scopes": creds.scopes or YOUTUBE_SCOPES,
        "user_id": str(user_id) if user_id else None,
    }

    # 1. Primary: Save to Supabase user_oauth_tokens table (protected by service_role RLS)
    if user_id and str(user_id).strip():
        try:
            from Backend.supabase_db import save_oauth_tokens_supabase
            saved_in_db = save_oauth_tokens_supabase(
                user_id=str(user_id).strip(),
                token_data=data,
                provider="google",
                scopes=creds.scopes,
            )
            if saved_in_db:
                logger.info("Successfully persisted YouTube OAuth tokens to Supabase for user.")
        except Exception as db_err:
            logger.debug("Could not persist OAuth token to Supabase (falling back to local): %s", db_err)

    # 2. Secondary: Local token files for local dev fallback
    try:
        ensure_credentials_dir()
        if user_id and str(user_id).strip():
            safe_uid = "".join(c for c in str(user_id) if c.isalnum() or c in "-_")
            user_file = TOKEN_STORE_DIR / f"youtube_token_{safe_uid}.json"
            with open(user_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

        with open(TOKEN_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass


def load_credentials(user_id: Optional[str] = None) -> Optional[Credentials]:
    """Load stored user OAuth credentials from Supabase, user-specific store, environment, or default file."""
    data = None

    # 1. Primary: Query Supabase public.user_oauth_tokens if user_id is provided
    if user_id and str(user_id).strip():
        try:
            from Backend.supabase_db import get_oauth_tokens_supabase
            db_tokens = get_oauth_tokens_supabase(user_id=str(user_id).strip(), provider="google")
            if db_tokens and isinstance(db_tokens, dict) and db_tokens.get("refresh_token"):
                data = db_tokens
        except Exception as db_err:
            logger.debug("Could not query OAuth tokens from Supabase: %s", db_err)

    # 2. Check user-specific token file if user_id is provided
    if not data and user_id and str(user_id).strip():
        safe_uid = "".join(c for c in str(user_id) if c.isalnum() or c in "-_")
        user_file = TOKEN_STORE_DIR / f"youtube_token_{safe_uid}.json"
        if user_file.exists():
            try:
                with open(user_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                pass

    # 3. Allow injection via YOUTUBE_TOKEN_JSON environment variable (great for container cloud deploys)
    if not data:
        env_token = os.getenv("YOUTUBE_TOKEN_JSON", "").strip()
        if env_token:
            try:
                data = json.loads(env_token)
            except Exception:
                pass

    # 4. Check default local token file
    if not data and TOKEN_FILE_PATH.exists():
        try:
            with open(TOKEN_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass

    if not data:
        return None

    try:
        creds = Credentials(
            token=data.get("token"),
            refresh_token=data.get("refresh_token"),
            token_uri=data.get("token_uri", "https://oauth2.googleapis.com/token"),
            client_id=data.get("client_id") or get_client_id(),
            client_secret=data.get("client_secret") or get_client_secret(),
            scopes=data.get("scopes", YOUTUBE_SCOPES),
        )
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                save_credentials(creds, user_id=user_id)
            except Exception:
                pass
        return creds
    except Exception:
        return None


def clear_credentials(user_id: Optional[str] = None) -> None:
    """Remove saved YouTube OAuth tokens from Supabase, user file, and default store."""
    if user_id and str(user_id).strip():
        # Clear from Supabase
        try:
            from Backend.supabase_db import delete_oauth_tokens_supabase
            delete_oauth_tokens_supabase(user_id=str(user_id).strip(), provider="google")
        except Exception:
            pass

        # Clear user local file
        safe_uid = "".join(c for c in str(user_id) if c.isalnum() or c in "-_")
        user_file = TOKEN_STORE_DIR / f"youtube_token_{safe_uid}.json"
        if user_file.exists():
            try:
                user_file.unlink()
            except Exception:
                pass

    if TOKEN_FILE_PATH.exists():
        try:
            TOKEN_FILE_PATH.unlink()
        except Exception:
            pass

    if VERIFIER_FILE_PATH.exists():
        try:
            VERIFIER_FILE_PATH.unlink()
        except Exception:
            pass


def get_youtube_client(
    creds: Optional[Credentials] = None, api_key: Optional[str] = None
):
    """Build YouTube API client using OAuth Credentials or API Key."""
    if creds:
        return build("youtube", "v3", credentials=creds)
    elif api_key and api_key.strip():
        return build("youtube", "v3", developerKey=api_key.strip())
    else:
        raise ValueError("Neither OAuth credentials nor API Key was provided.")


def fetch_channel_profile(
    creds: Optional[Credentials] = None, api_key: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Fetch channel profile info (Title, Handle, Avatar, Subscribers, Video Count)."""
    try:
        youtube = get_youtube_client(creds=creds, api_key=api_key)
        if creds:
            response = youtube.channels().list(mine=True, part="snippet,statistics,contentDetails").execute()
        else:
            return None

        items = response.get("items", [])
        if not items:
            return None

        channel = items[0]
        snippet = channel.get("snippet", {})
        stats = channel.get("statistics", {})

        return {
            "channel_id": channel.get("id"),
            "title": snippet.get("title", "Unknown Channel"),
            "handle": snippet.get("customUrl", ""),
            "description": snippet.get("description", ""),
            "avatar_url": snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
            "subscriber_count": stats.get("subscriberCount", "0"),
            "video_count": stats.get("videoCount", "0"),
            "uploads_playlist_id": channel.get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads"),
        }
    except Exception as e:
        print(f"Error fetching channel profile: {e}")
        return None


def fetch_user_videos(
    creds: Optional[Credentials] = None, max_results: int = 10
) -> List[Dict[str, Any]]:
    """Fetch recent uploaded videos of the signed-in YouTube channel."""
    if not creds:
        return []
    try:
        profile = fetch_channel_profile(creds=creds)
        if not profile or not profile.get("uploads_playlist_id"):
            return []

        youtube = get_youtube_client(creds=creds)
        uploads_id = profile["uploads_playlist_id"]

        response = (
            youtube.playlistItems()
            .list(
                playlistId=uploads_id,
                part="snippet,contentDetails",
                maxResults=max_results,
            )
            .execute()
        )

        videos = []
        for item in response.get("items", []):
            snippet = item.get("snippet", {})
            video_id = snippet.get("resourceId", {}).get("videoId")
            if video_id:
                videos.append({
                    "id": video_id,
                    "title": snippet.get("title", "Untitled Video"),
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
                    "published_at": snippet.get("publishedAt", "")[:10],
                })
        return videos
    except Exception as e:
        print(f"Error fetching user videos: {e}")
        return []


def upload_video_to_youtube(
    creds: Credentials,
    file_path: Path,
    title: str,
    description: str,
    tags: Optional[List[str]] = None,
    privacy_status: str = "private",
    is_short: bool = True,
) -> Tuple[bool, str]:
    """Upload a video directly to the user's YouTube channel."""
    if not file_path.exists():
        return False, f"File not found: {file_path}"

    if is_short and "#Shorts" not in title and "#Shorts" not in description:
        description = f"{description}\n\n#Shorts".strip()

    try:
        youtube = get_youtube_client(creds=creds)

        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags or ["CreatorOps", "Shorts"],
                "categoryId": "22",
            },
            "status": {
                "privacyStatus": privacy_status,
                "selfDeclaredMadeForKids": False,
            },
        }

        media = MediaFileUpload(
            str(file_path),
            mimetype="video/mp4",
            resumable=True,
            chunksize=1024 * 1024 * 5,
        )

        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media,
        )

        response = None
        while response is None:
            status, response = request.next_chunk()

        video_id = response.get("id")
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        return True, video_url
    except HttpError as e:
        return False, f"YouTube API error ({e.resp.status}): {e.content.decode('utf-8')}"
    except Exception as e:
        return False, f"Upload error: {str(e)}"
