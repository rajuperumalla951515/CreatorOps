"""
TubePilot AI - Database Layer
Provides persistent storage for projects, media assets, agent plans,
background jobs, publishing records, and YouTube channel authorizations.
Integrates with Supabase when configured, with full local SQLite persistence fallback.
"""

from __future__ import annotations

import json
import logging
import sqlite3
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("tubepilot.db")

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "tubepilot.db"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize database tables with schema migrations."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Projects Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT DEFAULT 'default_user',
                name TEXT NOT NULL,
                format TEXT NOT NULL DEFAULT 'short',
                ratio TEXT NOT NULL DEFAULT '9:16',
                layout TEXT NOT NULL DEFAULT 'top_landscape',
                target_duration REAL NOT NULL DEFAULT 15.0,
                instructions TEXT DEFAULT '',
                status TEXT NOT NULL DEFAULT 'draft',
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                metadata_json TEXT DEFAULT '{}'
            )
        """)

        # 2. Media Assets Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS media_assets (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                user_id TEXT DEFAULT 'default_user',
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                media_type TEXT NOT NULL,
                duration REAL DEFAULT 0.0,
                width INTEGER DEFAULT 0,
                height INTEGER DEFAULT 0,
                size_bytes INTEGER DEFAULT 0,
                created_at REAL NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        """)

        # 3. Agent Plans Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_plans (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                user_id TEXT DEFAULT 'default_user',
                plan_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending_review',
                created_at REAL NOT NULL,
                approved_at REAL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        """)

        # 4. Jobs Table (Persistent background rendering & agent pipeline)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                user_id TEXT DEFAULT 'default_user',
                job_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'queued',
                step INTEGER DEFAULT 1,
                total_steps INTEGER DEFAULT 6,
                step_title TEXT DEFAULT 'Initializing',
                step_subtitle TEXT DEFAULT '',
                progress_pct REAL DEFAULT 0.0,
                log_text TEXT DEFAULT '',
                error_message TEXT,
                media_url TEXT,
                created_at REAL NOT NULL,
                started_at REAL,
                completed_at REAL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
            )
        """)

        # 5. Publishing History Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS publishing_jobs (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                user_id TEXT DEFAULT 'default_user',
                video_title TEXT NOT NULL,
                description TEXT DEFAULT '',
                privacy_status TEXT NOT NULL DEFAULT 'public',
                scheduled_publish_time TEXT,
                youtube_video_id TEXT,
                youtube_url TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                error_message TEXT,
                created_at REAL NOT NULL,
                published_at REAL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
            )
        """)

        # 6. Connected YouTube Channels Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS youtube_channels (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                channel_title TEXT NOT NULL,
                channel_handle TEXT,
                avatar_url TEXT,
                subscriber_count TEXT DEFAULT '0',
                video_count TEXT DEFAULT '0',
                connected_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
        """)

        # Ensure user_id column exists on projects, jobs, and publishing_jobs for backward compatibility
        for table in ["projects", "jobs", "publishing_jobs"]:
            try:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN user_id TEXT DEFAULT 'default_user'")
            except Exception:
                pass  # Column already exists

        conn.commit()


# ==============================================================================
# Helper CRUD Operations with User Isolation
# ==============================================================================

def create_project(
    project_id: str,
    name: str,
    format_type: str = "short",
    ratio: str = "9:16",
    layout: str = "top_landscape",
    target_duration: float = 15.0,
    instructions: str = "",
    metadata: Optional[Dict[str, Any]] = None,
    user_id: str = "default_user",
) -> Dict[str, Any]:
    now = time.time()
    meta_str = json.dumps(metadata or {})
    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO projects (
                id, user_id, name, format, ratio, layout, target_duration,
                instructions, status, created_at, updated_at, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
            """,
            (
                project_id,
                user_id,
                name,
                format_type,
                ratio,
                layout,
                target_duration,
                instructions,
                now,
                now,
                meta_str,
            ),
        )
        conn.commit()
    return get_project(project_id)  # type: ignore


def get_project(project_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        if user_id:
            row = conn.execute(
                "SELECT * FROM projects WHERE id = ? AND user_id = ?",
                (project_id, user_id),
            ).fetchone()
        else:
            row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()

        if not row:
            return None
        res = dict(row)
        res["metadata"] = json.loads(res.get("metadata_json") or "{}")
        return res


def list_projects(limit: int = 50, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        if user_id:
            rows = conn.execute(
                "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM projects ORDER BY created_at DESC LIMIT ?", (limit,)
            ).fetchall()

        result = []
        for r in rows:
            d = dict(r)
            d["metadata"] = json.loads(d.get("metadata_json") or "{}")
            result.append(d)
        return result


def update_project(
    project_id: str, updates: Dict[str, Any], user_id: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    current = get_project(project_id, user_id)
    if not current:
        return None

    allowed_fields = [
        "name", "format", "ratio", "layout", "target_duration", "instructions", "status"
    ]
    query_parts = []
    params = []

    for k in allowed_fields:
        if k in updates:
            query_parts.append(f"{k} = ?")
            params.append(updates[k])

    if "metadata" in updates:
        query_parts.append("metadata_json = ?")
        params.append(json.dumps(updates["metadata"]))

    query_parts.append("updated_at = ?")
    params.append(time.time())

    params.append(project_id)
    if user_id:
        params.append(user_id)
        where_clause = "WHERE id = ? AND user_id = ?"
    else:
        where_clause = "WHERE id = ?"

    with get_db_connection() as conn:
        conn.execute(f"UPDATE projects SET {', '.join(query_parts)} {where_clause}", tuple(params))
        conn.commit()

    return get_project(project_id, user_id)


def delete_project(project_id: str, user_id: Optional[str] = None) -> bool:
    with get_db_connection() as conn:
        if user_id:
            cur = conn.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        else:
            cur = conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()
        return cur.rowcount > 0


# ==============================================================================
# Jobs Operations
# ==============================================================================

def create_job(
    job_id: str,
    job_type: str,
    project_id: Optional[str] = None,
    total_steps: int = 6,
    user_id: str = "default_user",
) -> Dict[str, Any]:
    now = time.time()
    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO jobs (
                id, project_id, user_id, job_type, status, step, total_steps,
                step_title, step_subtitle, progress_pct, log_text, created_at
            ) VALUES (?, ?, ?, ?, 'queued', 1, ?, 'Queued', 'Awaiting worker', 0.0, '', ?)
            """,
            (job_id, project_id, user_id, job_type, total_steps, now),
        )
        conn.commit()
    return get_job(job_id)  # type: ignore


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        return dict(row) if row else None


def list_jobs(limit: int = 30, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        if user_id:
            rows = conn.execute(
                "SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        return [dict(r) for r in rows]


def update_job_progress(
    job_id: str,
    step: Optional[int] = None,
    step_title: Optional[str] = None,
    step_subtitle: Optional[str] = None,
    progress_pct: Optional[float] = None,
    status: Optional[str] = None,
    log_line: Optional[str] = None,
    media_url: Optional[str] = None,
    error_message: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    current = get_job(job_id)
    if not current:
        return None

    query_parts = []
    params = []

    if step is not None:
        query_parts.append("step = ?")
        params.append(step)
    if step_title is not None:
        query_parts.append("step_title = ?")
        params.append(step_title)
    if step_subtitle is not None:
        query_parts.append("step_subtitle = ?")
        params.append(step_subtitle)
    if progress_pct is not None:
        query_parts.append("progress_pct = ?")
        params.append(progress_pct)
    if status is not None:
        query_parts.append("status = ?")
        params.append(status)
        if status in ("processing", "analyzing") and not current.get("started_at"):
            query_parts.append("started_at = ?")
            params.append(time.time())
        elif status in ("completed", "ready_to_publish", "failed", "cancelled"):
            query_parts.append("completed_at = ?")
            params.append(time.time())

    if log_line:
        new_log = (current.get("log_text") or "") + log_line + "\n"
        query_parts.append("log_text = ?")
        params.append(new_log)

    if media_url is not None:
        query_parts.append("media_url = ?")
        params.append(media_url)

    if error_message is not None:
        query_parts.append("error_message = ?")
        params.append(error_message)

    if not query_parts:
        return current

    params.append(job_id)
    with get_db_connection() as conn:
        conn.execute(f"UPDATE jobs SET {', '.join(query_parts)} WHERE id = ?", tuple(params))
        conn.commit()

    return get_job(job_id)


# ==============================================================================
# YouTube Channel Records
# ==============================================================================

def save_channel_record(
    user_id: str,
    channel_id: str,
    channel_title: str,
    channel_handle: Optional[str] = None,
    avatar_url: Optional[str] = None,
    subscriber_count: str = "0",
    video_count: str = "0",
) -> Dict[str, Any]:
    now = time.time()
    rec_id = f"yt_{channel_id}"
    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO youtube_channels (
                id, user_id, channel_id, channel_title, channel_handle,
                avatar_url, subscriber_count, video_count, connected_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                channel_title = excluded.channel_title,
                channel_handle = excluded.channel_handle,
                avatar_url = excluded.avatar_url,
                subscriber_count = excluded.subscriber_count,
                video_count = excluded.video_count,
                updated_at = excluded.updated_at
            """,
            (
                rec_id,
                user_id,
                channel_id,
                channel_title,
                channel_handle or "",
                avatar_url or "",
                str(subscriber_count),
                str(video_count),
                now,
                now,
            ),
        )
        conn.commit()

    return {
        "id": rec_id,
        "user_id": user_id,
        "channel_id": channel_id,
        "channel_title": channel_title,
        "channel_handle": channel_handle,
        "avatar_url": avatar_url,
        "subscriber_count": subscriber_count,
        "video_count": video_count,
    }


def get_channel_record(user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        if user_id:
            row = conn.execute(
                "SELECT * FROM youtube_channels WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1",
                (user_id,),
            ).fetchone()
        else:
            row = conn.execute(
                "SELECT * FROM youtube_channels ORDER BY updated_at DESC LIMIT 1"
            ).fetchone()
        return dict(row) if row else None


def delete_channel_record(user_id: Optional[str] = None) -> bool:
    with get_db_connection() as conn:
        if user_id:
            cur = conn.execute("DELETE FROM youtube_channels WHERE user_id = ?", (user_id,))
        else:
            cur = conn.execute("DELETE FROM youtube_channels")
        conn.commit()
        return cur.rowcount > 0


# ==============================================================================
# Publishing Records Operations
# ==============================================================================

def save_publishing_record(
    record_id: str,
    project_id: Optional[str],
    video_title: str,
    description: str,
    privacy_status: str,
    youtube_video_id: Optional[str],
    youtube_url: Optional[str],
    status: str = "published",
    error_message: Optional[str] = None,
    user_id: str = "default_user",
) -> Dict[str, Any]:
    now = time.time()
    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO publishing_jobs (
                id, project_id, user_id, video_title, description, privacy_status,
                youtube_video_id, youtube_url, status, error_message, created_at, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record_id,
                project_id,
                user_id,
                video_title,
                description,
                privacy_status,
                youtube_video_id,
                youtube_url,
                status,
                error_message,
                now,
                now if status == "published" else None,
            ),
        )
        conn.commit()

    return {
        "id": record_id,
        "project_id": project_id,
        "user_id": user_id,
        "video_title": video_title,
        "description": description,
        "privacy": privacy_status,
        "youtube_video_id": youtube_video_id,
        "youtube_url": youtube_url,
        "status": status,
        "error_message": error_message,
        "created_at": now,
    }


def list_publishing_records(limit: int = 50, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        if user_id:
            rows = conn.execute(
                "SELECT * FROM publishing_jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM publishing_jobs ORDER BY created_at DESC LIMIT ?", (limit,)
            ).fetchall()

        results = []
        for r in rows:
            d = dict(r)
            d["title"] = d["video_title"]
            d["privacy"] = d["privacy_status"]
            results.append(d)
        return results


# Initialize database automatically on module import
init_db()
