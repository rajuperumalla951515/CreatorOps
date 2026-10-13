"""
Agent B: Media Analysis Agent
Analyzes authorized source media files, extracts precise technical metadata,
evaluates audio/video codecs, and flags format compatibility issues.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

from Backend.video_processor import ffmpeg_path


class MediaAnalysisAgent:
    def __init__(self, agent_id: str = "agent-analyzer"):
        self.agent_id = agent_id
        self.role = "Media Analyst"

    def analyze_file(self, file_path: Path) -> Dict[str, Any]:
        """Inspect media file using FFmpeg probe and return structured metadata."""
        if not file_path.exists():
            return {
                "valid": False,
                "error": f"File not found: {file_path}",
                "file_path": str(file_path),
            }

        ffmpeg_bin = ffmpeg_path()
        # Probe command to extract streams and container info
        cmd = [
            ffmpeg_bin,
            "-hide_banner",
            "-i",
            str(file_path),
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        output = result.stderr

        width = 0
        height = 0
        duration = 0.0
        has_video = "Video:" in output
        has_audio = "Audio:" in output
        codec_video = ""
        codec_audio = ""
        fps = 30.0

        # Parse duration: "Duration: 00:00:15.34,"
        for line in output.splitlines():
            line_str = line.strip()
            if line_str.startswith("Duration:"):
                dur_match = line_str.split(",")[0].replace("Duration:", "").strip()
                try:
                    parts = dur_match.split(":")
                    if len(parts) == 3:
                        duration = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
                except Exception:
                    pass

            if "Video:" in line_str:
                parts = line_str.split("Video:")[1].split(",")
                if len(parts) > 0:
                    codec_video = parts[0].strip()
                for p in parts:
                    if "x" in p and any(c.isdigit() for c in p):
                        clean = p.strip().split()[0]
                        if "x" in clean:
                            dim_parts = clean.split("x")
                            try:
                                width = int(dim_parts[0])
                                height = int(dim_parts[1])
                            except Exception:
                                pass
                    if "fps" in p:
                        try:
                            fps = float(p.replace("fps", "").strip())
                        except Exception:
                            pass

            if "Audio:" in line_str:
                parts = line_str.split("Audio:")[1].split(",")
                if len(parts) > 0:
                    codec_audio = parts[0].strip()

        size_mb = round(file_path.stat().st_size / (1024 * 1024), 2)
        aspect_ratio = f"{width}:{height}" if width and height else "unknown"

        # Quality & format flags
        flags: List[str] = []
        if width > 0 and height > 0:
            if width >= 1920 or height >= 1920:
                flags.append("High Definition (1080p+)")
            elif width < 720 and height < 720:
                flags.append("Low Resolution Warning: Upscaling will be applied.")

        if not has_audio:
            flags.append("Silent Stream: Source has no embedded audio track.")

        analysis = {
            "valid": True,
            "filename": file_path.name,
            "size_mb": size_mb,
            "duration_seconds": round(duration, 2),
            "width": width,
            "height": height,
            "aspect_ratio": aspect_ratio,
            "fps": fps,
            "has_video": has_video,
            "has_audio": has_audio,
            "video_codec": codec_video,
            "audio_codec": codec_audio,
            "quality_flags": flags,
            "ready_for_pipeline": True,
        }

        return analysis
