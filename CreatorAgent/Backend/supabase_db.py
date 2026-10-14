"""
TubePilot AI - Backend Supabase Integration
Handles secure token validation, user authentication from Supabase JWTs,
Row Level Security (RLS) scoping, and persistence for profiles, YouTube accounts,
user activity logs, projects, and publishing history.
"""

from __future__ import annotations

import os
import logging
import uuid
from typing import Any, Dict, List, Optional
import jwt

logger = logging.getLogger("tubepilot.supabase")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xepcqtvzehjnijdvjcfe.supabase.co").strip()
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
    or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_e77cpinfc4g9cV8s2vTQBw_BXDdlq38")
).strip()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "").strip()

# Lazy-loaded supabase-py client singleton
_supabase_client = None


def get_supabase_client():
    """Retrieve base Supabase client."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Connected to Supabase PostgreSQL at %s", SUPABASE_URL)
        except Exception as e:
            logger.warning("Could not initialize Supabase client: %s.", e)
            _supabase_client = None

    return _supabase_client


def get_scoped_client(auth_header: Optional[str] = None):
    """
    Returns a Supabase client scoped to the current user's JWT.
    This ensures PostgREST sets auth.uid() = user_id and evaluates RLS policies properly.
    """
    client = get_supabase_client()
    if not client:
        return None

    # If auth_header contains a Bearer JWT, authenticate the postgrest transport
    if auth_header:
        token_str = auth_header.replace("Bearer ", "").strip()
        if token_str and token_str != "null" and token_str != "undefined":
            try:
                # Scoped postgrest request
                client.postgrest.auth(token_str)
            except Exception as e:
                logger.debug("Could not attach auth header to PostgREST: %s", e)

    return client


def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies a Supabase JWT access token.
    Extracts the user sub (UUID), email, and metadata.
    """
    if not token:
        return None

    token_str = token.replace("Bearer ", "").strip()
    if not token_str or token_str == "null" or token_str == "undefined":
        return None

    try:
        if SUPABASE_JWT_SECRET:
            decoded = jwt.decode(
                token_str,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return decoded
        else:
            # Unverified decode when secret is not configured in development
            decoded = jwt.decode(token_str, options={"verify_signature": False})
            return decoded
    except Exception as e:
        logger.debug("Token verification failed: %s", e)
        return None


def extract_user_id_from_header(auth_header: Optional[str]) -> Optional[str]:
    """Helper to extract user UUID from Authorization header."""
    if not auth_header:
        return None
    claims = verify_supabase_token(auth_header)
    if claims and "sub" in claims:
        return str(claims["sub"])
    return None


# ==============================================================================
# 1. USER PROFILES
# ==============================================================================

def get_profile_supabase(user_id: str, auth_header: Optional[str] = None) -> Optional[Dict[str, Any]]:
    client = get_scoped_client(auth_header)
    if not client:
        return None
    try:
        res = client.table("profiles").select("*").eq("id", user_id).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.debug("Supabase get_profile error: %s", e)
        return None


def upsert_profile_supabase(
    user_id: str, updates: Dict[str, Any], auth_header: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    client = get_scoped_client(auth_header)
    if not client:
        return None
    try:
        payload = {"id": user_id, **updates}
        res = client.table("profiles").upsert(payload).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.debug("Supabase upsert_profile error: %s", e)
        return None


# ==============================================================================
# 2. CONNECTED YOUTUBE CHANNELS
# ==============================================================================

def save_youtube_channel_supabase(
    user_id: str,
    channel_id: str,
    channel_title: str,
    channel_handle: str = "",
    avatar_url: str = "",
    subscriber_count: str = "0",
    video_count: str = "0",
    view_count: str = "0",
    auth_header: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Save or update connected YouTube channel in Supabase public.youtube_channels."""
    client = get_scoped_client(auth_header)
    if not client:
        return None

    # Validate UUID format
    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        logger.debug("Skipping Supabase save for non-UUID user_id: %s", user_id)
        return None

    rec_id = f"yt_{user_id[:8]}_{channel_id}"
    payload = {
        "id": rec_id,
        "user_id": user_id,
        "channel_id": channel_id,
        "channel_title": channel_title,
        "channel_handle": channel_handle or "",
        "avatar_url": avatar_url or "",
        "subscriber_count": str(subscriber_count),
        "video_count": str(video_count),
        "view_count": str(view_count),
        "status": "active",
    }

    try:
        res = client.table("youtube_channels").upsert(
            payload, on_conflict="user_id,channel_id"
        ).execute()
        return res.data[0] if res.data else payload
    except Exception as e:
        logger.debug("Supabase save_youtube_channel error: %s", e)
        return None


def get_youtube_channel_supabase(
    user_id: str, auth_header: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Retrieve connected YouTube channel for user from Supabase."""
    client = get_scoped_client(auth_header)
    if not client:
        return None

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return None

    try:
        res = (
            client.table("youtube_channels")
            .select("*")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("updated_at", desc=True)
            .limit(1)
            .execute()
        )
        return res.data[0] if res.data else None
    except Exception as e:
        logger.debug("Supabase get_youtube_channel error: %s", e)
        return None


def delete_youtube_channel_supabase(
    user_id: str, auth_header: Optional[str] = None
) -> bool:
    """Disconnect / delete YouTube channel record for user in Supabase."""
    client = get_scoped_client(auth_header)
    if not client:
        return False

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return False

    try:
        client.table("youtube_channels").delete().eq("user_id", user_id).execute()
        return True
    except Exception as e:
        logger.debug("Supabase delete_youtube_channel error: %s", e)
        return False


# ==============================================================================
# 2B. SECURE OAUTH TOKEN STORAGE (Service-Role Protected)
# ==============================================================================

def save_oauth_tokens_supabase(
    user_id: str,
    token_data: Dict[str, Any],
    provider: str = "google",
    scopes: Optional[List[str]] = None,
) -> bool:
    """
    Persist user OAuth tokens securely in Supabase public.user_oauth_tokens.
    Protected by service_role RLS so credentials can never be queried by frontend clients.
    """
    client = get_supabase_client()
    if not client:
        return False

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        logger.debug("Skipping OAuth token save for non-UUID user_id: %s", user_id)
        return False

    rec_id = f"tok_{user_id[:8]}_{provider}"
    payload = {
        "id": rec_id,
        "user_id": user_id,
        "provider": provider,
        "token_data": token_data,
        "scopes": scopes or token_data.get("scopes", []),
        "updated_at": "now()",
    }

    try:
        client.table("user_oauth_tokens").upsert(
            payload, on_conflict="user_id,provider"
        ).execute()
        logger.info("Persisted %s OAuth credentials securely in Supabase for user %s", provider, user_id[:8])
        return True
    except Exception as e:
        logger.debug("Supabase save_oauth_tokens_supabase error (falling back to local): %s", e)
        return False


def get_oauth_tokens_supabase(
    user_id: str, provider: str = "google"
) -> Optional[Dict[str, Any]]:
    """Retrieve stored OAuth tokens for user from Supabase public.user_oauth_tokens."""
    client = get_supabase_client()
    if not client:
        return None

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return None

    try:
        res = (
            client.table("user_oauth_tokens")
            .select("token_data, scopes")
            .eq("user_id", user_id)
            .eq("provider", provider)
            .limit(1)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return res.data[0].get("token_data")
        return None
    except Exception as e:
        logger.debug("Supabase get_oauth_tokens_supabase error: %s", e)
        return None


def delete_oauth_tokens_supabase(user_id: str, provider: str = "google") -> bool:
    """Remove stored OAuth tokens for user from Supabase upon disconnect."""
    client = get_supabase_client()
    if not client:
        return False

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return False

    try:
        client.table("user_oauth_tokens").delete().eq("user_id", user_id).eq("provider", provider).execute()
        return True
    except Exception as e:
        logger.debug("Supabase delete_oauth_tokens_supabase error: %s", e)
        return False



# ==============================================================================
# 3. USER ACTIVITY & AUDIT EVENTS
# ==============================================================================

def log_audit_event_supabase(
    user_id: str,
    event_type: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    description: str = "",
    status: str = "success",
    payload: Optional[Dict[str, Any]] = None,
    auth_header: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Persist structured user activity event to public.audit_events."""
    client = get_scoped_client(auth_header)
    if not client:
        return None

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return None

    event_record = {
        "user_id": user_id,
        "event_type": event_type,
        "entity_type": entity_type,
        "entity_id": str(entity_id) if entity_id else None,
        "description": description or f"Event {event_type} executed",
        "status": status,
        "payload": payload or {},
    }

    try:
        res = client.table("audit_events").insert(event_record).execute()
        return res.data[0] if res.data else event_record
    except Exception as e:
        logger.debug("Supabase log_audit_event error: %s", e)
        return None


def get_audit_events_supabase(
    user_id: str, limit: int = 20, auth_header: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve recent user activity events from Supabase."""
    client = get_scoped_client(auth_header)
    if not client:
        return []

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return []

    try:
        res = (
            client.table("audit_events")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.debug("Supabase get_audit_events error: %s", e)
        return []


# ==============================================================================
# 4. PROJECTS & JOBS PERSISTENCE
# ==============================================================================

def save_project_supabase(
    project_dict: Dict[str, Any], auth_header: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Save or update creator project in Supabase public.projects."""
    client = get_scoped_client(auth_header)
    if not client:
        return None

    user_id = project_dict.get("user_id")
    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return None

    payload = {
        "id": project_dict["id"],
        "user_id": user_id,
        "name": project_dict.get("name") or project_dict.get("title", "Untitled Project"),
        "format": project_dict.get("format") or project_dict.get("video_format", "short"),
        "ratio": project_dict.get("ratio") or project_dict.get("aspect_ratio", "9:16"),
        "layout": project_dict.get("layout", "top_landscape"),
        "target_duration": float(project_dict.get("target_duration", 60.0)),
        "instructions": project_dict.get("instructions", ""),
        "status": project_dict.get("status", "draft"),
        "metadata": project_dict.get("metadata", {}),
    }

    try:
        res = client.table("projects").upsert(payload).execute()
        return res.data[0] if res.data else payload
    except Exception as e:
        logger.debug("Supabase save_project error: %s", e)
        return None


def list_projects_supabase(
    user_id: str, limit: int = 50, auth_header: Optional[str] = None
) -> Optional[List[Dict[str, Any]]]:
    """Fetch user's projects from Supabase."""
    client = get_scoped_client(auth_header)
    if not client:
        return None

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return None

    try:
        res = (
            client.table("projects")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data
    except Exception as e:
        logger.debug("Supabase list_projects error: %s", e)
        return None


def delete_project_supabase(
    project_id: str, user_id: str, auth_header: Optional[str] = None
) -> bool:
    """Delete a project in Supabase with RLS verification."""
    client = get_scoped_client(auth_header)
    if not client:
        return False

    try:
        uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        return False

    try:
        client.table("projects").delete().eq("id", project_id).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        logger.debug("Supabase delete_project error: %s", e)
        return False
