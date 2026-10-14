"""
TubePilot AI - Cloud Media Storage Management
Handles persistent cloud storage for rendered video exports using Supabase Storage,
with automatic fallback to local filesystem storage and signed URL generation.
"""

from __future__ import annotations

import os
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("tubepilot.storage")

DEFAULT_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "rendered-videos").strip()
SIGNED_URL_EXPIRY_SECONDS = int(os.getenv("MEDIA_URL_EXPIRY_SECONDS", "604800"))  # 7 days


def get_storage_client():
    """Retrieve Supabase client with storage capability."""
    try:
        from Backend.supabase_db import get_supabase_client
        return get_supabase_client()
    except Exception as e:
        logger.debug("Could not import supabase client: %s", e)
        return None


def ensure_bucket_exists(client, bucket_name: str) -> bool:
    """Check if bucket exists; if not and permissions allow, attempt creation."""
    try:
        buckets = client.storage.list_buckets()
        existing = [b.name for b in buckets] if buckets else []
        if bucket_name in existing:
            return True
        # Attempt to create public bucket
        client.storage.create_bucket(bucket_name, options={"public": True})
        logger.info("Created Supabase storage bucket: %s", bucket_name)
        return True
    except Exception as e:
        logger.debug("Bucket verification/creation note for '%s': %s", bucket_name, e)
        # If error indicates unauthorized or already exists, assume bucket might exist
        return False


def upload_media_to_persistent_storage(
    file_path: Path,
    filename: str,
    user_id: Optional[str] = None,
    bucket_name: Optional[str] = None,
) -> Optional[str]:
    """
    Uploads a rendered media file to Supabase Storage.
    Returns a persistent public or signed URL, or None if persistent storage is unavailable.
    """
    if not file_path or not file_path.exists():
        logger.warning("Upload aborted: file %s does not exist", file_path)
        return None

    client = get_storage_client()
    if not client:
        logger.info("Supabase client not configured; relying on local media storage.")
        return None

    bucket = bucket_name or DEFAULT_BUCKET
    ensure_bucket_exists(client, bucket)

    storage_path = f"{user_id or 'public'}/{filename}"

    try:
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # Upload or overwrite existing file
        try:
            client.storage.from_(bucket).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": "video/mp4", "x-upsert": "true"},
            )
        except Exception as up_err:
            # If upload fails due to already exists, attempt update
            if "already exists" in str(up_err).lower() or "duplicate" in str(up_err).lower():
                client.storage.from_(bucket).update(
                    path=storage_path,
                    file=file_bytes,
                    file_options={"content-type": "video/mp4", "x-upsert": "true"},
                )
            else:
                raise up_err

        # Try to obtain signed URL first (supports private buckets and secure token access)
        try:
            signed_res = client.storage.from_(bucket).create_signed_url(
                path=storage_path,
                expires_in=SIGNED_URL_EXPIRY_SECONDS,
            )
            if isinstance(signed_res, dict) and signed_res.get("signedURL"):
                return signed_res["signedURL"]
            elif isinstance(signed_res, str):
                return signed_res
        except Exception as sign_err:
            logger.debug("Signed URL generation fallback to public URL: %s", sign_err)

        # Fallback to public URL
        public_url = client.storage.from_(bucket).get_public_url(storage_path)
        if public_url:
            return public_url

    except Exception as e:
        logger.warning(
            "Persistent Supabase Storage upload failed for %s: %s. Using local filesystem.",
            filename,
            e,
        )

    return None


def get_persistent_media_url(
    filename: str,
    user_id: Optional[str] = None,
    bucket_name: Optional[str] = None,
) -> Optional[str]:
    """
    Checks if a media file exists in Supabase Storage and returns a valid signed or public URL.
    """
    client = get_storage_client()
    if not client:
        return None

    bucket = bucket_name or DEFAULT_BUCKET
    storage_path = f"{user_id or 'public'}/{filename}"

    try:
        # Check if file exists in bucket
        folder = user_id or "public"
        items = client.storage.from_(bucket).list(folder)
        file_names = [item.get("name") for item in items if isinstance(item, dict)]
        if filename not in file_names:
            # Also check root of bucket as fallback
            root_items = client.storage.from_(bucket).list("")
            root_names = [item.get("name") for item in root_items if isinstance(item, dict)]
            if filename in root_names:
                storage_path = filename
            else:
                return None

        # Generate signed URL
        try:
            signed = client.storage.from_(bucket).create_signed_url(
                path=storage_path,
                expires_in=SIGNED_URL_EXPIRY_SECONDS,
            )
            if isinstance(signed, dict) and signed.get("signedURL"):
                return signed["signedURL"]
            elif isinstance(signed, str):
                return signed
        except Exception:
            pass

        return client.storage.from_(bucket).get_public_url(storage_path)
    except Exception as e:
        logger.debug("Error checking persistent storage for %s: %s", filename, e)
        return None
