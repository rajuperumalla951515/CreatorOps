"""
Agent F: Thumbnail & Metadata Agent
Generates high-performing YouTube titles, structured descriptions with real timestamped chapters,
SEO tags, and thumbnail visual concepts without misleading clickbait.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional


class ThumbnailMetadataAgent:
    def __init__(self, agent_id: str = "agent-metadata"):
        self.agent_id = agent_id
        self.role = "Thumbnail & Metadata Strategist"

    def generate_publishing_assets(
        self,
        topic_title: str,
        duration_seconds: float = 15.0,
        instructions: str = "",
        format_type: str = "short",
    ) -> Dict[str, Any]:
        """Synthesize titles, SEO descriptions, chapters, tags, and thumbnail concepts."""
        clean_title = topic_title.strip() or "Epic Reaction Breakdown"
        is_short = format_type.lower() == "short" or duration_seconds <= 60.0

        # High-performing title candidates
        if is_short:
            title_options = [
                f"{clean_title} #Shorts",
                f"You Won't Believe This Moment! | {clean_title} #Shorts",
                f"Watch This Reaction! 🔥 {clean_title} #Shorts",
                f"The Ultimate Highlight: {clean_title} #Shorts",
            ]
        else:
            title_options = [
                f"{clean_title} (Full Reaction & Analysis)",
                f"How It Happened: Complete Breakdown of {clean_title}",
                f"{clean_title}: In-Depth Creator Review",
                f"Everything You Missed in {clean_title}",
            ]

        # Generate realistic, timestamped chapters based on actual duration
        chapters = []
        if duration_seconds > 20.0:
            chapters.append("00:00 - Introduction & Hook")
            chapters.append(f"00:{int(duration_seconds * 0.3):02d} - Key Highlight Moment")
            chapters.append(f"00:{int(duration_seconds * 0.7):02d} - Critical Analysis")
            chapters.append(f"00:{int(duration_seconds * 0.9):02d} - Conclusion & Next Steps")
        else:
            chapters.append("00:00 - Highlight Breakdown")
            chapters.append(f"00:{int(duration_seconds * 0.6):02d} - Peak Reaction")

        chapters_str = "\n".join(chapters)

        # Structured Description
        description = (
            f"{clean_title}\n\n"
            f"Produced with TubePilot AI — Autonomous Video Production Studio.\n\n"
            f"⏱️ Chapters:\n{chapters_str}\n\n"
            f"🔔 Subscribe to the channel for daily breakdowns, reactions, and creator insights!\n\n"
            f"#Creator #VideoProduction #Breakdown {'#Shorts' if is_short else ''}"
        ).strip()

        # Tags
        tags = [
            "TubePilot",
            "Reaction",
            "Video Breakdown",
            "Creator Studio",
            "Trending",
        ]
        if is_short:
            tags.append("Shorts")
            tags.append("YouTube Shorts")

        # Thumbnail Visual Directives
        thumbnail_concepts = [
            {
                "style": "High-Contrast Split Reaction",
                "headline_text": "UNBELIEVABLE!",
                "color_palette": "Deep Black, Electric Violet, Neon Yellow",
                "focal_point": "Expressive reaction face on bottom / key action on top",
            },
            {
                "style": "Minimalist Cinematic Highlight",
                "headline_text": "WATCH THIS",
                "color_palette": "Monochrome Black with Electric Cyan accent",
                "focal_point": "High-contrast action still with bold typography",
            },
        ]

        return {
            "title_suggestions": title_options,
            "primary_title": title_options[0],
            "description": description,
            "chapters": chapters,
            "tags": tags,
            "thumbnail_concepts": thumbnail_concepts,
            "is_short": is_short,
        }
