from __future__ import annotations

import json
import os
import sys
import tempfile
import time
import uuid

# Relax strict oauthlib scope equality check when Google includes OpenID/profile scopes
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from pathlib import Path
from typing import Any, Dict, List, Optional

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from dotenv import load_dotenv
from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator

# Load environment variables (.env) from backend, project root, and workspace root
_CURR_DIR = Path(__file__).resolve().parent
load_dotenv(_CURR_DIR / ".env")
load_dotenv(_CURR_DIR.parent / ".env")
load_dotenv(_CURR_DIR.parents[1] / ".env")
load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from Backend.db import (
    create_job,
    create_project,
    delete_channel_record,
    delete_project,
    get_channel_record,
    get_job,
    get_project,
    init_db,
    list_jobs,
    list_projects,
    list_publishing_records,
    save_channel_record,
    save_publishing_record,
    update_job_progress,
    update_project,
)
from Backend.supabase_db import (
    extract_user_id_from_header,
    verify_supabase_token,
    log_audit_event_supabase,
    get_audit_events_supabase,
    get_profile_supabase,
    upsert_profile_supabase,
)
from Backend.agents import (
    EditingAgent,
    MediaAnalysisAgent,
    ProjectPlannerAgent,
    PublishingAgent,
    QualityAssuranceAgent,
    ThumbnailMetadataAgent,
    TranscriptCaptionAgent,
    WorkflowSupervisorAgent,
)
from Backend.video_processor import (
    build_video_advanced,
    download_youtube,
    estimate_processing_time,
    save_upload,
)
from Backend.youtube_auth import (
    DEFAULT_CLIENT_ID,
    DEFAULT_CLIENT_SECRET,
    clear_credentials,
    fetch_channel_profile,
    fetch_user_videos,
    get_authorization_url,
    get_oauth_flow,
    load_credentials,
    process_oauth_callback,
    save_credentials,
    upload_video_to_youtube,
)

# Initialize database schema
init_db()

app = FastAPI(title="TubePilot AI Engine", version="3.0.0")

# CORS Configuration
cors_origins_env = os.getenv("ALLOWED_ORIGINS", "*").strip()
if cors_origins_env == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active render jobs & generated media
MEDIA_OUTPUT_DIR = PROJECT_ROOT / "media_output"
MEDIA_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

RENDER_TASKS: Dict[str, Dict[str, Any]] = {}


# ==============================================================================
# Security & Privacy Access Control
# ==============================================================================

def verify_creator_access(
    x_creator_key: Optional[str] = Header(None, alias="X-Creator-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    creator_key: Optional[str] = Query(None),
) -> str:
    """Validate that request has valid Supabase Bearer JWT or Creator Access Key."""
    # 1. Supabase Bearer JWT validation
    if authorization:
        user_id = extract_user_id_from_header(authorization)
        if user_id:
            return user_id

    # 2. Creator Access Key validation
    master_key = os.getenv("CREATOR_ACCESS_KEY", "").strip()
    if not master_key:
        return "default_user"  # Open mode in local dev

    provided = ""
    if isinstance(x_creator_key, str) and x_creator_key.strip():
        provided = x_creator_key.strip()
    elif isinstance(creator_key, str) and creator_key.strip():
        provided = creator_key.strip()

    if provided != master_key:
        raise HTTPException(
            status_code=401,
            detail="Access Denied: Invalid or missing authentication credentials.",
        )
    return "default_user"


def optional_creator_access(
    x_creator_key: Optional[str] = Header(None, alias="X-Creator-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    creator_key: Optional[str] = Query(None),
) -> str:
    """Validate credentials if provided; fallback to 'default_user' during public OAuth redirects."""
    try:
        return verify_creator_access(x_creator_key, authorization, creator_key)
    except HTTPException:
        return "default_user"


class KeyVerifyPayload(BaseModel):
    access_key: str


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "TubePilot AI Production Studio",
        "version": "3.0.0",
        "agents": [
            "ProjectPlannerAgent",
            "MediaAnalysisAgent",
            "TranscriptCaptionAgent",
            "EditingAgent",
            "QualityAssuranceAgent",
            "ThumbnailMetadataAgent",
            "PublishingAgent",
            "WorkflowSupervisorAgent",
        ],
    }


@app.get("/api/auth/status")
def get_auth_status(
    x_creator_key: Optional[str] = Header(None, alias="X-Creator-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    creator_key: Optional[str] = Query(None),
):
    """Check if the backend is password-protected and if current key or Supabase session is valid."""
    if authorization and extract_user_id_from_header(authorization):
        return {"protected": True, "authenticated": True, "method": "supabase"}

    master_key = os.getenv("CREATOR_ACCESS_KEY", "").strip()
    if not master_key:
        return {"protected": False, "authenticated": True, "method": "open"}

    provided = ""
    if isinstance(x_creator_key, str) and x_creator_key.strip():
        provided = x_creator_key.strip()
    elif isinstance(creator_key, str) and creator_key.strip():
        provided = creator_key.strip()

    return {
        "protected": True,
        "authenticated": (provided == master_key),
        "method": "creator_key",
    }


@app.post("/api/auth/verify")
def verify_access_key(payload: KeyVerifyPayload):
    """Verify an entered access key for the private workspace."""
    master_key = os.getenv("CREATOR_ACCESS_KEY", "").strip()
    if not master_key:
        return {"valid": True, "protected": False}
    if payload.access_key.strip() == master_key:
        return {"valid": True, "protected": True}
    raise HTTPException(status_code=401, detail="Incorrect Creator Access Key.")


# ==============================================================================
# Projects API (RESTful v1)
# ==============================================================================

class ProjectCreatePayload(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    format: Optional[str] = "short"
    video_format: Optional[str] = None
    ratio: Optional[str] = "9:16"
    aspect_ratio: Optional[str] = None
    layout: Optional[str] = "top_landscape"
    target_duration: float = 15.0
    instructions: str = ""
    metadata: Optional[Dict[str, Any]] = None

    def resolved_name(self) -> str:
        return (self.name or self.title or "Untitled Project").strip()

    def resolved_format(self) -> str:
        return (self.video_format or self.format or "short").strip()

    def resolved_ratio(self) -> str:
        return (self.aspect_ratio or self.ratio or "9:16").strip()


def format_project_response(p: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Ensure both frontend TypeScript keys (title, video_format, aspect_ratio) and DB keys (name, format, ratio) are present."""
    if not p:
        return None
    res = dict(p)
    title = res.get("title") or res.get("name") or "Untitled Project"
    res["title"] = title
    res["name"] = title
    fmt = res.get("video_format") or res.get("format") or "short"
    res["video_format"] = fmt
    res["format"] = fmt
    ratio = res.get("aspect_ratio") or res.get("ratio") or "9:16"
    res["aspect_ratio"] = ratio
    res["ratio"] = ratio
    return res


class ProjectUpdatePayload(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    format: Optional[str] = None
    video_format: Optional[str] = None
    ratio: Optional[str] = None
    aspect_ratio: Optional[str] = None
    layout: Optional[str] = None
    target_duration: Optional[float] = None
    instructions: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def resolved_dict(self) -> Dict[str, Any]:
        data = self.model_dump(exclude_unset=True)
        if "title" in data and "name" not in data:
            data["name"] = data.pop("title")
        if "video_format" in data and "format" not in data:
            data["format"] = data.pop("video_format")
        if "aspect_ratio" in data and "ratio" not in data:
            data["ratio"] = data.pop("aspect_ratio")
        return data


@app.get("/api/v1/projects")
def api_list_projects(
    limit: int = 50,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(verify_creator_access),
):
    projects = [
        format_project_response(p)
        for p in list_projects(limit=limit, user_id=user_id, auth_header=authorization)
    ]
    return {"projects": projects}


@app.post("/api/v1/projects")
def api_create_project(
    payload: ProjectCreatePayload,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(verify_creator_access),
):
    p_id = f"proj_{uuid.uuid4().hex[:10]}"
    project = create_project(
        project_id=p_id,
        name=payload.resolved_name(),
        format_type=payload.resolved_format(),
        ratio=payload.resolved_ratio(),
        layout=payload.layout or "top_landscape",
        target_duration=payload.target_duration,
        instructions=payload.instructions,
        metadata=payload.metadata,
        user_id=user_id,
        auth_header=authorization,
    )
    log_audit_event_supabase(
        user_id=user_id,
        event_type="project_created",
        entity_type="projects",
        entity_id=p_id,
        description=f"Created video project: {payload.resolved_name()}",
        status="success",
        payload={"project_id": p_id, "name": payload.resolved_name()},
        auth_header=authorization,
    )
    return format_project_response(project)


@app.get("/api/v1/projects/{project_id}")
def api_get_project(
    project_id: str,
    user_id: str = Depends(verify_creator_access),
):
    project = get_project(project_id, user_id=user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return format_project_response(project)


@app.put("/api/v1/projects/{project_id}")
def api_update_project(
    project_id: str,
    payload: ProjectUpdatePayload,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(verify_creator_access),
):
    data = payload.resolved_dict()
    updated = update_project(project_id, data, user_id=user_id, auth_header=authorization)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return format_project_response(updated)


@app.delete("/api/v1/projects/{project_id}")
def api_delete_project(
    project_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(verify_creator_access),
):
    success = delete_project(project_id, user_id=user_id, auth_header=authorization)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    log_audit_event_supabase(
        user_id=user_id,
        event_type="project_deleted",
        entity_type="projects",
        entity_id=project_id,
        description=f"Deleted project {project_id}",
        status="success",
        auth_header=authorization,
    )
    return {"deleted": True, "id": project_id}


# ==============================================================================
# Specialized Autonomous AI Agents Endpoints
# ==============================================================================

@app.post("/api/v1/projects/{project_id}/plan")
def api_generate_plan(project_id: str, payload: Optional[Dict[str, Any]] = None):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    planner = ProjectPlannerAgent()
    params = payload or {}
    plan = planner.generate_plan(
        project_name=project["name"],
        format_type=project["format"],
        ratio=project["ratio"],
        layout=project["layout"],
        target_duration=project["target_duration"],
        instructions=project["instructions"],
        source_v1=params.get("v1_url"),
        source_v2=params.get("v2_url"),
        music_source=params.get("music_url"),
    )

    meta = project.get("metadata", {})
    meta["current_plan"] = plan
    update_project(project_id, {"metadata": meta})
    return plan


@app.post("/api/v1/projects/{project_id}/captions")
def api_generate_captions(project_id: str, payload: Optional[Dict[str, Any]] = None):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    transcriber = TranscriptCaptionAgent()
    params = payload or {}
    duration = float(params.get("duration", project["target_duration"]))
    captions = transcriber.generate_captions(
        duration=duration,
        context_title=project["name"],
        instructions=project.get("instructions", ""),
    )
    return captions


@app.post("/api/v1/projects/{project_id}/metadata")
def api_generate_metadata(project_id: str, payload: Optional[Dict[str, Any]] = None):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    meta_agent = ThumbnailMetadataAgent()
    params = payload or {}
    duration = float(params.get("duration", project["target_duration"]))
    assets = meta_agent.generate_publishing_assets(
        topic_title=project["name"],
        duration_seconds=duration,
        format_type=project.get("format", "short"),
    )
    return assets


@app.post("/api/v1/projects/{project_id}/qa")
def api_inspect_qa(project_id: str, payload: Dict[str, Any]):
    media_url = payload.get("media_url", "")
    filename = media_url.split("/")[-1]
    file_path = MEDIA_OUTPUT_DIR / filename
    qa_agent = QualityAssuranceAgent()
    return qa_agent.inspect_output(file_path)


# ==============================================================================
# Background Jobs & Telemetry (v1)
# ==============================================================================

@app.get("/api/v1/jobs")
def api_list_jobs(limit: int = 30, user_id: str = Depends(verify_creator_access)):
    return {"jobs": list_jobs(limit=limit, user_id=user_id)}


@app.get("/api/v1/jobs/{job_id}")
def api_get_job(job_id: str):
    job = get_job(job_id)
    if not job:
        if job_id in RENDER_TASKS:
            return RENDER_TASKS[job_id]
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/api/v1/jobs/{job_id}/cancel", dependencies=[Depends(verify_creator_access)])
def api_cancel_job(job_id: str):
    update_job_progress(job_id, status="cancelled", log_line="[Supervisor] Job cancelled by user.")
    if job_id in RENDER_TASKS:
        RENDER_TASKS[job_id]["status"] = "failed"
        RENDER_TASKS[job_id]["error"] = "Cancelled by user"
    return {"cancelled": True, "job_id": job_id}


# ==============================================================================
# YouTube Authentication & Publishing (Official Data API v3)
# ==============================================================================

def resolve_yt_redirect(requested_uri: Optional[str] = None) -> str:
    """Resolve redirect URI prioritizing frontend parameter, falling back to Vercel/env."""
    if requested_uri and requested_uri.strip() and requested_uri.strip() != "undefined":
        return requested_uri.strip().rstrip('/')
    env_redirect = os.getenv("YOUTUBE_REDIRECT_URI", "").strip()
    if env_redirect and "onrender.com" not in env_redirect:
        return env_redirect.rstrip('/')
    return "https://creator-ops-beta.vercel.app"


@app.get("/api/youtube/login")
def direct_yt_login(redirect_uri: Optional[str] = None, state: Optional[str] = None):
    try:
        effective_redirect = resolve_yt_redirect(redirect_uri)
        auth_url, _ = get_authorization_url(redirect_uri=effective_redirect, state=state)
        return RedirectResponse(url=auth_url, status_code=307)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/youtube/auth-url")
def get_yt_auth_url(
    redirect_uri: Optional[str] = None,
    state: Optional[str] = None,
    user_id: str = Depends(optional_creator_access),
):
    try:
        effective_redirect = resolve_yt_redirect(redirect_uri)
        auth_url, flow = get_authorization_url(redirect_uri=effective_redirect, state=state)
        verifier = getattr(flow, "code_verifier", None)
        return {"auth_url": auth_url, "code_verifier": verifier}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class AuthCallbackPayload(BaseModel):
    code: str
    redirect_uri: Optional[str] = None
    code_verifier: Optional[str] = None


@app.post("/api/youtube/callback")
def handle_yt_callback(
    payload: AuthCallbackPayload,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(optional_creator_access),
):
    try:
        effective_redirect = resolve_yt_redirect(payload.redirect_uri)
        creds = process_oauth_callback(
            code=payload.code,
            redirect_uri=effective_redirect,
            code_verifier=payload.code_verifier,
            user_id=user_id,
        )
        profile = fetch_channel_profile(creds=creds)
        if profile and profile.get("channel_id"):
            avatar = profile.get("avatar_url") or profile.get("thumbnail_url") or ""
            handle = profile.get("handle") or profile.get("custom_url") or ""
            profile["avatar_url"] = avatar
            profile["thumbnail_url"] = avatar
            profile["handle"] = handle
            profile["custom_url"] = handle
            save_channel_record(
                user_id=user_id,
                channel_id=profile.get("channel_id"),
                channel_title=profile.get("title", "YouTube Channel"),
                channel_handle=handle,
                avatar_url=avatar,
                subscriber_count=str(profile.get("subscriber_count", "0")),
                video_count=str(profile.get("video_count", "0")),
                auth_header=authorization,
            )
            log_audit_event_supabase(
                user_id=user_id,
                event_type="youtube_connected",
                entity_type="youtube_channels",
                entity_id=profile.get("channel_id"),
                description=f"Connected YouTube channel: {profile.get('title', 'YouTube Channel')}",
                status="success",
                payload={"channel_id": profile.get("channel_id"), "title": profile.get("title")},
                auth_header=authorization,
            )
        return {"status": "authenticated", "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication error: {e}")


@app.get("/api/youtube/profile")
def get_yt_profile(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(optional_creator_access),
):
    cached = get_channel_record(user_id=user_id, auth_header=authorization)
    creds = load_credentials(user_id=user_id)
    if not creds:
        if cached:
            avatar = cached.get("avatar_url") or ""
            handle = cached.get("channel_handle") or ""
            return {
                "authenticated": True,
                "profile": {
                    "channel_id": cached.get("channel_id"),
                    "title": cached.get("channel_title"),
                    "handle": handle,
                    "custom_url": handle,
                    "avatar_url": avatar,
                    "thumbnail_url": avatar,
                    "subscriber_count": cached.get("subscriber_count"),
                    "video_count": cached.get("video_count"),
                },
            }
        return {"authenticated": False, "profile": None}
    profile = fetch_channel_profile(creds=creds)
    if profile and profile.get("channel_id"):
        avatar = profile.get("avatar_url") or profile.get("thumbnail_url") or ""
        handle = profile.get("handle") or profile.get("custom_url") or ""
        profile["avatar_url"] = avatar
        profile["thumbnail_url"] = avatar
        profile["handle"] = handle
        profile["custom_url"] = handle
        save_channel_record(
            user_id=user_id,
            channel_id=profile.get("channel_id"),
            channel_title=profile.get("title", "YouTube Channel"),
            channel_handle=handle,
            avatar_url=avatar,
            subscriber_count=str(profile.get("subscriber_count", "0")),
            video_count=str(profile.get("video_count", "0")),
            auth_header=authorization,
        )
    return {"authenticated": bool(profile), "profile": profile}


@app.get("/api/youtube/user-videos")
def get_yt_user_videos(user_id: str = Depends(optional_creator_access)):
    creds = load_credentials(user_id=user_id)
    if not creds:
        return {"videos": []}
    videos = fetch_user_videos(creds=creds, max_results=12)
    return {"videos": videos}


@app.post("/api/youtube/clear")
@app.post("/api/youtube/disconnect")
def clear_yt_session(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(optional_creator_access),
):
    clear_credentials(user_id=user_id)
    delete_channel_record(user_id=user_id, auth_header=authorization)
    log_audit_event_supabase(
        user_id=user_id,
        event_type="youtube_disconnected",
        entity_type="youtube_channels",
        description="Disconnected YouTube channel integration",
        status="success",
        auth_header=authorization,
    )
    return {"status": "signed_out"}


# ==============================================================================
# User Profile & Activity Endpoints
# ==============================================================================

@app.get("/api/v1/activity")
def get_user_activity(
    limit: int = 20,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(verify_creator_access),
):
    events = get_audit_events_supabase(user_id=user_id, limit=limit, auth_header=authorization)
    return {"activities": events}


@app.get("/api/v1/profile")
def get_user_profile(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(verify_creator_access),
):
    profile = get_profile_supabase(user_id=user_id, auth_header=authorization)
    return {"profile": profile}


class ProfileUpdatePayload(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


@app.put("/api/v1/profile")
def update_user_profile(
    payload: ProfileUpdatePayload,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    user_id: str = Depends(verify_creator_access),
):
    data = payload.model_dump(exclude_unset=True)
    updated = upsert_profile_supabase(user_id=user_id, updates=data, auth_header=authorization)
    log_audit_event_supabase(
        user_id=user_id,
        event_type="profile_updated",
        entity_type="profiles",
        entity_id=user_id,
        description="Updated creator profile details",
        status="success",
        payload=data,
        auth_header=authorization,
    )
    return {"profile": updated}


class UploadYouTubePayload(BaseModel):
    task_id: str
    title: str
    description: str = ""
    privacy: str = "public"
    project_id: Optional[str] = None
    scheduled_time: Optional[str] = None
    user_confirmed: bool = True


@app.post("/api/youtube/upload")
@app.post("/api/v1/youtube/publish")
def upload_master_to_yt(payload: UploadYouTubePayload, user_id: str = Depends(verify_creator_access)):
    if not payload.user_confirmed:
        raise HTTPException(status_code=400, detail="Explicit user confirmation required before publishing.")

    creds = load_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="YouTube account not authenticated.")

    media_file = MEDIA_OUTPUT_DIR / f"{payload.task_id}.mp4"
    if not media_file.exists():
        # Look for match in output directory
        candidates = list(MEDIA_OUTPUT_DIR.glob(f"*{payload.task_id}*.mp4"))
        if candidates:
            media_file = candidates[0]
        else:
            raise HTTPException(status_code=404, detail="Master video file not found.")

    publisher = PublishingAgent()
    res = publisher.execute_upload(
        media_file=media_file,
        title=payload.title,
        description=payload.description,
        privacy_status=payload.privacy,
        is_short=True,
    )

    rec_id = f"pub_{uuid.uuid4().hex[:10]}"
    if res.get("success"):
        save_publishing_record(
            record_id=rec_id,
            project_id=payload.project_id,
            video_title=payload.title,
            description=payload.description,
            privacy_status=payload.privacy,
            youtube_video_id=res.get("video_id"),
            youtube_url=res.get("youtube_url"),
            status="completed",
            error_message=None,
            user_id=user_id,
        )
        return {"status": "success", "youtube_url": res.get("youtube_url"), "record_id": rec_id}
    else:
        save_publishing_record(
            record_id=rec_id,
            project_id=payload.project_id,
            video_title=payload.title,
            description=payload.description,
            privacy_status=payload.privacy,
            youtube_video_id=None,
            youtube_url=None,
            status="failed",
            error_message=res.get("error"),
            user_id=user_id,
        )
        raise HTTPException(status_code=500, detail=res.get("error", "Upload failed"))


@app.get("/api/v1/publishing/history")
def api_get_publishing_history(limit: int = 50, user_id: str = Depends(verify_creator_access)):
    return {"history": list_publishing_records(limit=limit, user_id=user_id)}


# ==============================================================================
# Video Processing & Render Engine (Legacy + Pipeline Integration)
# ==============================================================================

def _parse_time_val(v: Any, default: float = 0.0) -> float:
    if v is None:
        return default
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if not s:
        return default
    if ":" in s:
        parts = s.split(":")
        try:
            if len(parts) == 2:
                return float(parts[0]) * 60 + float(parts[1])
            if len(parts) == 3:
                return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
        except ValueError:
            return default
    try:
        return float(s)
    except ValueError:
        return default


class RenderOptions(BaseModel):
    v1_url: str = ""
    v2_url: str = ""
    layout_mode: str = "top_landscape"
    ratio_code: str = "9:16"
    crop_mode: str = "cover"
    crop_x_pct: float = 50.0
    crop_y_pct: float = 50.0
    crop_zoom: float = 1.0
    crop_x1_pct: Optional[float] = None
    crop_y1_pct: Optional[float] = None
    crop_x2_pct: Optional[float] = None
    crop_y2_pct: Optional[float] = None
    v1_slot_code: str = "top"
    v1_start: float = 0.0
    v1_end: float = 15.0
    v2_start: float = 0.0
    v2_end: float = 15.0
    v1_vol: float = 1.0
    v2_vol: float = 1.0
    music_vol: float = 0.25
    pip_corner: str = "Bottom right"
    pip_scale: float = 0.35
    browser_cookie_option: str = "None"
    user_agent: str = ""
    project_id: Optional[str] = None

    @field_validator("v1_start", "v1_end", "v2_start", "v2_end", mode="before")
    @classmethod
    def validate_time_fields(cls, v: Any, info) -> float:
        default = 15.0 if "end" in info.field_name else 0.0
        return _parse_time_val(v, default)


@app.post("/api/estimate")
def estimate_duration(payload: Dict[str, Any]):
    target_duration = float(payload.get("target_duration", 15.0))
    has_yt1 = bool(payload.get("has_yt1", False))
    has_yt2 = bool(payload.get("has_yt2", False))
    return estimate_processing_time(target_duration, has_yt1, has_yt2)


def process_render_task(
    task_id: str,
    v1_url: str,
    v2_url: str,
    v1_file_path: Optional[Path],
    v2_file_path: Optional[Path],
    music_file_path: Optional[Path],
    cookie_file_path: Optional[Path],
    options: RenderOptions,
):
    task = RENDER_TASKS[task_id]
    task["status"] = "processing"
    task["started_at"] = time.perf_counter()

    update_job_progress(task_id, status="processing", step=1, step_title="Supervisor: Initializing Buffers", progress_pct=10.0)

    try:
        with tempfile.TemporaryDirectory() as tmp_dir:
            work_dir = Path(tmp_dir)
            browser_name = None if options.browser_cookie_option == "None" else options.browser_cookie_option.lower()

            # Stream 1 Ingestion
            source1: Optional[Path] = None
            if v1_url.strip():
                task["step"] = 1
                task["step_title"] = "Ingesting Primary Stream 1"
                task["step_subtitle"] = f"Downloading stream segment ({options.v1_start}s - {options.v1_end}s)"
                update_job_progress(task_id, step=1, step_title=task["step_title"], step_subtitle=task["step_subtitle"], progress_pct=25.0)

                def update_v1(msg: str):
                    task["log"] = msg
                    update_job_progress(task_id, log_line=msg)

                source1 = download_youtube(
                    v1_url.strip(),
                    work_dir,
                    browser=browser_name,
                    user_agent=options.user_agent.strip() or None,
                    cookie_file=cookie_file_path,
                    start_seconds=options.v1_start,
                    end_seconds=options.v1_end or None,
                    progress_callback=update_v1,
                    filename_prefix="v1_source",
                )
            elif v1_file_path and v1_file_path.exists():
                source1 = v1_file_path

            # Stream 2 Ingestion
            source2: Optional[Path] = None
            if options.layout_mode != "single":
                if v2_url.strip():
                    task["step"] = 2
                    task["step_title"] = "Ingesting Secondary Stream 2"
                    task["step_subtitle"] = f"Downloading stream segment ({options.v2_start}s - {options.v2_end}s)"
                    update_job_progress(task_id, step=2, step_title=task["step_title"], step_subtitle=task["step_subtitle"], progress_pct=45.0)

                    def update_v2(msg: str):
                        task["log"] = msg
                        update_job_progress(task_id, log_line=msg)

                    source2 = download_youtube(
                        v2_url.strip(),
                        work_dir,
                        browser=browser_name,
                        user_agent=options.user_agent.strip() or None,
                        cookie_file=cookie_file_path,
                        start_seconds=options.v2_start,
                        end_seconds=options.v2_end or None,
                        progress_callback=update_v2,
                        filename_prefix="v2_source",
                    )
                elif v2_file_path and v2_file_path.exists():
                    source2 = v2_file_path

            # Compositing Stage
            task["step"] = 3
            task["step_title"] = "Compositing Spatial Frames & Mastering Audio"
            task["step_subtitle"] = "Executing spatial filter graph and multi-channel audio synthesis..."
            update_job_progress(task_id, step=3, step_title=task["step_title"], step_subtitle=task["step_subtitle"], progress_pct=75.0)

            final_output_path = MEDIA_OUTPUT_DIR / f"{task_id}.mp4"
            build_video_advanced(
                source1=source1,
                source2=source2,
                music=music_file_path,
                output=final_output_path,
                layout=options.layout_mode,
                ratio=options.ratio_code,
                v1_slot=options.v1_slot_code,
                v1_start=options.v1_start,
                v1_end=options.v1_end or None,
                v2_start=options.v2_start,
                v2_end=options.v2_end or None,
                v1_volume=options.v1_vol,
                v2_volume=options.v2_vol if source2 else 0.0,
                music_volume=options.music_vol,
                pip_position=options.pip_corner if options.layout_mode == "pip" else "Bottom right",
                pip_size=options.pip_scale if options.layout_mode == "pip" else 0.35,
                crop_mode=getattr(options, "crop_mode", "cover"),
                crop_x_pct=getattr(options, "crop_x_pct", 50.0),
                crop_y_pct=getattr(options, "crop_y_pct", 50.0),
                crop_zoom=getattr(options, "crop_zoom", 1.0),
                crop_x1_pct=getattr(options, "crop_x1_pct", None),
                crop_y1_pct=getattr(options, "crop_y1_pct", None),
                crop_x2_pct=getattr(options, "crop_x2_pct", None),
                crop_y2_pct=getattr(options, "crop_y2_pct", None),
            )

            task["status"] = "complete"
            task["elapsed"] = round(time.perf_counter() - task["started_at"], 2)
            task["media_url"] = f"/api/media/{task_id}.mp4"

            update_job_progress(
                task_id,
                status="completed",
                step=3,
                step_title="Rendering Complete",
                progress_pct=100.0,
                media_url=task["media_url"],
            )

    except Exception as err:
        task["status"] = "failed"
        task["error"] = str(err)
        update_job_progress(task_id, status="failed", error_message=str(err))


@app.post("/api/render")
async def start_render(
    background_tasks: BackgroundTasks,
    options_json: Optional[str] = Form(None),
    aspect_ratio: Optional[str] = Form(None),
    ratio_code: Optional[str] = Form(None),
    layout_mode: Optional[str] = Form("top_landscape"),
    crop_mode: Optional[str] = Form("cover"),
    crop_x_pct: Optional[float] = Form(50.0),
    crop_y_pct: Optional[float] = Form(50.0),
    crop_zoom: Optional[float] = Form(1.0),
    crop_x1_pct: Optional[float] = Form(None),
    crop_y1_pct: Optional[float] = Form(None),
    crop_x2_pct: Optional[float] = Form(None),
    crop_y2_pct: Optional[float] = Form(None),
    v1_slot: Optional[str] = Form(None),
    v1_slot_code: Optional[str] = Form(None),
    pip_corner: Optional[str] = Form("Bottom right"),
    pip_scale: Optional[float] = Form(0.35),
    v1_url: Optional[str] = Form(""),
    v2_url: Optional[str] = Form(""),
    v1_start: Optional[Any] = Form("0.0"),
    v1_end: Optional[Any] = Form("15.0"),
    v2_start: Optional[Any] = Form("0.0"),
    v2_end: Optional[Any] = Form("15.0"),
    v1_vol: Optional[float] = Form(1.0),
    v2_vol: Optional[float] = Form(1.0),
    music_vol: Optional[float] = Form(0.25),
    project_id: Optional[str] = Form(None),
    v1_file: Optional[UploadFile] = File(None),
    v2_file: Optional[UploadFile] = File(None),
    music_file: Optional[UploadFile] = File(None),
    cookie_file: Optional[UploadFile] = File(None),
    user_id: str = Depends(optional_creator_access),
):
    try:
        if options_json and options_json.strip():
            raw_options = json.loads(options_json)
            if isinstance(raw_options, dict):
                for k in ["v1_start", "v1_end", "v2_start", "v2_end"]:
                    if k in raw_options:
                        raw_options[k] = _parse_time_val(raw_options[k], 15.0 if "end" in k else 0.0)
            options = RenderOptions(**raw_options)
        else:
            effective_ratio = ratio_code or aspect_ratio or "9:16"
            effective_slot = v1_slot or v1_slot_code or "top"

            options = RenderOptions(
                v1_url=v1_url or "",
                v2_url=v2_url or "",
                layout_mode=layout_mode or "top_landscape",
                ratio_code=effective_ratio,
                crop_mode=crop_mode or "cover",
                crop_x_pct=float(crop_x_pct) if crop_x_pct is not None else 50.0,
                crop_y_pct=float(crop_y_pct) if crop_y_pct is not None else 50.0,
                crop_zoom=float(crop_zoom) if crop_zoom is not None else 1.0,
                crop_x1_pct=crop_x1_pct,
                crop_y1_pct=crop_y1_pct,
                crop_x2_pct=crop_x2_pct,
                crop_y2_pct=crop_y2_pct,
                v1_slot_code=effective_slot,
                v1_start=_parse_time_val(v1_start, 0.0),
                v1_end=_parse_time_val(v1_end, 15.0),
                v2_start=_parse_time_val(v2_start, 0.0),
                v2_end=_parse_time_val(v2_end, 15.0),
                v1_vol=float(v1_vol) if v1_vol is not None else 1.0,
                v2_vol=float(v2_vol) if v2_vol is not None else 1.0,
                music_vol=float(music_vol) if music_vol is not None else 0.25,
                pip_corner=pip_corner or "Bottom right",
                pip_scale=float(pip_scale) if pip_scale is not None else 0.35,
                project_id=project_id,
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid render parameters: {e}")

    task_id = str(uuid.uuid4())
    temp_dir = Path(tempfile.gettempdir()) / f"creatorops_{task_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)

    v1_path = save_upload(v1_file, temp_dir / "v1_upload.mp4") if v1_file else None
    v2_path = save_upload(v2_file, temp_dir / "v2_upload.mp4") if v2_file else None
    music_path = save_upload(music_file, temp_dir / "music_upload.mp3") if music_file else None
    cookie_path = save_upload(cookie_file, temp_dir / "cookies.txt") if cookie_file else None

    # Save to persistent database
    create_job(
        job_id=task_id,
        job_type="video_render",
        project_id=options.project_id,
        total_steps=3,
        user_id=user_id,
    )
    update_job_progress(
        job_id=task_id,
        status="queued",
        step=1,
        step_title="Initializing Pipeline",
        step_subtitle="Preparing stream buffers...",
        progress_pct=0.0,
    )

    RENDER_TASKS[task_id] = {
        "id": task_id,
        "status": "queued",
        "step": 1,
        "total_steps": 3,
        "step_title": "Initializing Pipeline",
        "step_subtitle": "Preparing stream buffers...",
        "elapsed": 0.0,
        "log": "",
        "error": None,
        "media_url": None,
    }

    background_tasks.add_task(
        process_render_task,
        task_id=task_id,
        v1_url=options.v1_url,
        v2_url=options.v2_url,
        v1_file_path=v1_path,
        v2_file_path=v2_path,
        music_file_path=music_path,
        cookie_file_path=cookie_path,
        options=options,
    )

    return {"task_id": task_id, "status": "queued"}


@app.get("/api/render/{task_id}")
@app.get("/api/render/status/{task_id}")
def get_task_status(task_id: str):
    if task_id in RENDER_TASKS:
        task = RENDER_TASKS[task_id]
        if task["status"] == "processing":
            task["elapsed"] = round(time.perf_counter() - task["started_at"], 1)
        return task

    db_job = get_job(task_id)
    if db_job:
        return db_job

    raise HTTPException(status_code=404, detail="Render task not found")


@app.get("/api/media/{filename}")
def get_media_file(filename: str):
    file_path = MEDIA_OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Media file not found")
    return FileResponse(file_path, media_type="video/mp4")


# ==============================================================================
# SPA Static File Serving (Unified Full-Stack Deployment)
# ==============================================================================

DIST_DIR = PROJECT_ROOT / "frontend-react" / "dist"
if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_candidate = DIST_DIR / full_path
        if file_candidate.is_file():
            return FileResponse(file_candidate)
        index_file = DIST_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"[TubePilot Engine] Server starting on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
