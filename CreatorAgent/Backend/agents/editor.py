"""
Agent D: Editing Agent
Translates approved timeline operations into executable FFmpeg compositing manifests,
applies aspect ratio transformations, volume balancing, and master video export.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable, Dict, Optional

from Backend.video_processor import build_video_advanced


class EditingAgent:
    def __init__(self, agent_id: str = "agent-editor"):
        self.agent_id = agent_id
        self.role = "Lead Video Editor"

    def execute_render(
        self,
        source1: Path,
        source2: Optional[Path],
        music_file: Optional[Path],
        output_file: Path,
        layout: str = "top_landscape",
        ratio: str = "9:16",
        v1_slot: str = "top",
        v1_start: float = 0.0,
        v1_end: Optional[float] = None,
        v2_start: float = 0.0,
        v2_end: Optional[float] = None,
        v1_volume: float = 1.0,
        v2_volume: float = 1.0,
        music_volume: float = 0.25,
        pip_position: str = "Bottom right",
        pip_size: float = 0.35,
        crop_mode: str = "cover",
        crop_x_pct: float = 50.0,
        crop_y_pct: float = 50.0,
        crop_zoom: float = 1.0,
        crop_x1_pct: Optional[float] = None,
        crop_y1_pct: Optional[float] = None,
        crop_x2_pct: Optional[float] = None,
        crop_y2_pct: Optional[float] = None,
        progress_callback: Optional[Callable[[str], None]] = None,
    ) -> Dict[str, Any]:
        """Execute compositing via build_video_advanced and record manifest."""
        if progress_callback:
            progress_callback("Configuring spatial filter graph and multi-stream timeline...")

        build_video_advanced(
            source1=source1,
            source2=source2,
            music=music_file,
            output=output_file,
            layout=layout,
            ratio=ratio,
            v1_slot=v1_slot,
            v1_start=v1_start,
            v1_end=v1_end,
            v2_start=v2_start,
            v2_end=v2_end,
            v1_volume=v1_volume,
            v2_volume=v2_volume if source2 else 0.0,
            music_volume=music_volume,
            pip_position=pip_position,
            pip_size=pip_size,
            crop_mode=crop_mode,
            crop_x_pct=crop_x_pct,
            crop_y_pct=crop_y_pct,
            crop_zoom=crop_zoom,
            crop_x1_pct=crop_x1_pct,
            crop_y1_pct=crop_y1_pct,
            crop_x2_pct=crop_x2_pct,
            crop_y2_pct=crop_y2_pct,
        )

        manifest = {
            "output_path": str(output_file),
            "layout": layout,
            "aspect_ratio": ratio,
            "v1_duration": round((v1_end or 15.0) - v1_start, 2),
            "audio_ducking": music_file is not None,
            "master_exported": output_file.exists(),
        }

        return manifest
