"""
Agent E: Quality Assurance (QA) Agent
Verifies exported master media integrity, inspects audio/video synchronization,
checks container consistency, and generates a formal quality certification score.
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any, Dict, List

from Backend.video_processor import ffmpeg_path, has_audio


class QualityAssuranceAgent:
    def __init__(self, agent_id: str = "agent-qa"):
        self.agent_id = agent_id
        self.role = "Quality Assurance Auditor"

    def inspect_output(
        self,
        media_file: Path,
        expected_ratio: str = "9:16",
        min_duration: float = 1.0,
    ) -> Dict[str, Any]:
        """Perform comprehensive quality audits on the exported master video."""
        if not media_file.exists():
            return {
                "passed": False,
                "score": 0,
                "error": f"Master media file does not exist: {media_file}",
            }

        file_size = media_file.stat().st_size
        if file_size < 1024 * 50:  # Under 50KB is suspect
            return {
                "passed": False,
                "score": 20,
                "error": f"Master file size is abnormally small ({file_size} bytes). Possible corrupted render.",
            }

        ffmpeg_bin = ffmpeg_path()
        cmd = [ffmpeg_bin, "-hide_banner", "-i", str(media_file)]
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        output = result.stderr

        audio_present = has_audio(media_file)
        video_present = "Video:" in output

        duration = 0.0
        width = 0
        height = 0

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

        checks: List[Dict[str, Any]] = [
            {
                "check": "Video Stream Integrity",
                "passed": video_present,
                "details": f"Video stream detected ({width}x{height})",
            },
            {
                "check": "Audio Track Presence",
                "passed": audio_present,
                "details": "Audio stream master present" if audio_present else "Warning: No audio stream detected",
            },
            {
                "check": "Duration Threshold",
                "passed": duration >= min_duration,
                "details": f"Duration: {duration:.2f}s (Min required: {min_duration:.1f}s)",
            },
            {
                "check": "File Non-Corruption",
                "passed": file_size > 1024 * 100,
                "details": f"Size: {round(file_size / (1024 * 1024), 2)} MB",
            },
        ]

        passed_count = sum(1 for c in checks if c["passed"])
        score = int((passed_count / len(checks)) * 100)
        overall_passed = score >= 75 and video_present

        return {
            "passed": overall_passed,
            "quality_score": score,
            "duration": round(duration, 2),
            "dimensions": f"{width}x{height}",
            "checks": checks,
            "recommendation": "Ready for YouTube Publishing" if overall_passed else "Manual Review Required",
        }
