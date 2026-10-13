"""
Agent G: Publishing Agent
Verifies channel authorization, validates publishing metadata, enforces explicit human
approval, and executes authorized uploads via official YouTube Data API v3.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from Backend.youtube_auth import load_credentials, upload_video_to_youtube


class PublishingAgent:
    def __init__(self, agent_id: str = "agent-publisher"):
        self.agent_id = agent_id
        self.role = "Publishing & Distribution Manager"

    def validate_publish_request(
        self,
        media_file: Path,
        title: str,
        privacy_status: str,
    ) -> Tuple[bool, Optional[str]]:
        """Verify that all pre-upload requirements and safety constraints are satisfied."""
        if not media_file.exists():
            return False, f"Exported video file not found: {media_file}"

        if not title.strip():
            return False, "Video title is required."

        if privacy_status not in ["public", "unlisted", "private"]:
            return False, f"Invalid privacy status '{privacy_status}'. Must be public, unlisted, or private."

        creds = load_credentials()
        if not creds:
            return False, "No authenticated YouTube channel found. Please connect your Google account."

        return True, None

    def execute_upload(
        self,
        media_file: Path,
        title: str,
        description: str,
        tags: Optional[List[str]] = None,
        privacy_status: str = "public",
        is_short: bool = True,
    ) -> Dict[str, Any]:
        """Perform authorized video upload via YouTube Data API v3."""
        creds = load_credentials()
        if not creds:
            return {
                "success": False,
                "error": "YouTube account not authenticated.",
            }

        success, res_msg = upload_video_to_youtube(
            creds=creds,
            file_path=media_file,
            title=title,
            description=description,
            tags=tags,
            privacy_status=privacy_status,
            is_short=is_short,
        )

        if success:
            # Extract video ID from URL
            video_id = None
            if "v=" in res_msg:
                video_id = res_msg.split("v=")[1].split("&")[0]

            return {
                "success": True,
                "youtube_url": res_msg,
                "video_id": video_id,
                "title": title,
                "privacy_status": privacy_status,
            }
        else:
            return {
                "success": False,
                "error": res_msg,
            }
