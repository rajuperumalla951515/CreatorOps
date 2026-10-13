"""
Agent A: Project Planner Agent
Interprets natural language editing requirements, validates input assets,
and produces a structured, actionable editing plan.
"""

from __future__ import annotations

import json
import re
import uuid
from typing import Any, Dict, List, Optional


class ProjectPlannerAgent:
    def __init__(self, agent_id: str = "agent-planner"):
        self.agent_id = agent_id
        self.role = "Project Planner"

    def create_plan(
        self,
        brief: str = "",
        project_name: str = "Untitled Project",
        format_type: str = "short",
        aspect_ratio: str = "9:16",
        ratio: Optional[str] = None,
        layout: str = "top_landscape",
        target_duration: float = 30.0,
        instructions: Optional[str] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """Convenience method for creating structured plan from brief."""
        eff_instructions = instructions or brief
        eff_ratio = ratio or aspect_ratio
        plan = self.generate_plan(
            project_name=project_name,
            format_type=format_type,
            ratio=eff_ratio,
            layout=layout,
            target_duration=target_duration,
            instructions=eff_instructions,
        )
        plan["aspect_ratio"] = eff_ratio
        plan["target_duration"] = target_duration
        plan["scenes"] = [op.get("description", "") for op in plan.get("operations", [])]
        plan["audio_strategy"] = "ducking" if "music" in eff_instructions.lower() else "voice_priority"
        return plan

    def generate_plan(
        self,
        project_name: str,
        format_type: str,
        ratio: str,
        layout: str,
        target_duration: float,
        instructions: str,
        source_v1: Optional[str] = None,
        source_v2: Optional[str] = None,
        music_source: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Convert natural language instructions into a deterministic, structured editing plan."""
        # 1. Inspect instructions for time codes, pacing, and layout hints
        v1_start = 0.0
        v1_end = target_duration if target_duration > 0 else 15.0
        v2_start = 0.0
        v2_end = target_duration if target_duration > 0 else 15.0

        # Look for patterns like "0:00 to 0:15" or "10s to 25s"
        time_matches = re.findall(r"(\d+):(\d+)", instructions)
        if len(time_matches) >= 2:
            try:
                v1_start = float(time_matches[0][0]) * 60 + float(time_matches[0][1])
                v1_end = float(time_matches[1][0]) * 60 + float(time_matches[1][1])
            except Exception:
                pass

        # 2. Check for missing elements or warnings
        warnings = []
        if not source_v1:
            warnings.append("Primary stream source (Video 1) is missing.")
        if layout != "single" and not source_v2:
            warnings.append(f"Layout '{layout}' requests a secondary stream (Video 2), but none was provided.")

        # 3. Formulate timeline operations
        operations: List[Dict[str, Any]] = [
            {
                "id": "op_ingest_v1",
                "stage": "ingest",
                "description": f"Ingest and validate primary source stream ({v1_start:.1f}s - {v1_end:.1f}s)",
                "source": "v1",
                "start_seconds": v1_start,
                "end_seconds": v1_end,
            }
        ]

        if layout != "single" and source_v2:
            operations.append({
                "id": "op_ingest_v2",
                "stage": "ingest",
                "description": f"Ingest and validate secondary stream ({v2_start:.1f}s - {v2_end:.1f}s)",
                "source": "v2",
                "start_seconds": v2_start,
                "end_seconds": v2_end,
            })

        operations.append({
            "id": "op_composite",
            "stage": "composite",
            "description": f"Composite spatial layout ({layout}) in {ratio} frame with hardware accelerated filter graph",
            "layout": layout,
            "aspect_ratio": ratio,
        })

        if music_source:
            operations.append({
                "id": "op_audio_mix",
                "stage": "audio",
                "description": "Master multi-track audio with background soundtrack ducking",
                "music": True,
            })

        operations.append({
            "id": "op_qa_check",
            "stage": "qa",
            "description": "Run audio/video sync verification and frame-level QA inspection",
        })

        operations.append({
            "id": "op_metadata_gen",
            "stage": "metadata",
            "description": "Synthesize YouTube SEO titles, description, chapters, and thumbnail tags",
        })

        # 4. Calculate realistic processing estimation
        dur = max(v1_end - v1_start, 5.0)
        est_download_secs = 8.0 if (source_v1 and "http" in source_v1) else 2.0
        if source_v2 and "http" in source_v2:
            est_download_secs += 8.0
        est_ffmpeg_secs = round(dur * 0.85 + 4.0, 1)
        est_total_secs = round(est_download_secs + est_ffmpeg_secs + 3.0, 1)

        plan = {
            "plan_id": f"plan_{uuid.uuid4().hex[:10]}",
            "project_name": project_name,
            "intended_output": f"{project_name} ({ratio} {format_type})",
            "target_format": format_type,
            "target_aspect_ratio": ratio,
            "target_layout": layout,
            "target_duration_seconds": round(dur, 1),
            "v1_trim": {"start": v1_start, "end": v1_end},
            "v2_trim": {"start": v2_start, "end": v2_end},
            "operations": operations,
            "warnings": warnings,
            "estimated_resources": {
                "estimated_render_seconds": est_ffmpeg_secs,
                "ram_mb": 512,
                "vram_mb": 256,
            },
            "estimated_processing_seconds": est_total_secs,
            "estimated_human_time": f"~{int(est_total_secs)}s",
            "status": "ready_for_review",
            "requires_user_approval": True,
        }

        return plan
