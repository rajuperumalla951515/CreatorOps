from __future__ import annotations

import importlib
import json
import sys
import tempfile
import time
from pathlib import Path

import streamlit as st

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import Backend.video_processor
import Backend.youtube_auth

importlib.reload(Backend.video_processor)
importlib.reload(Backend.youtube_auth)

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


def get_icon_svg(name: str, size: int = 18, color: str = "currentColor") -> str:
    """Helper function to render crisp inline SVG vector icons instead of emojis."""
    icons = {
        "film": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>',
        "video": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="m22 8-6 4 6 4V8z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>',
        "youtube": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>',
        "sparkles": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>',
        "layers": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        "music": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        "sliders": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>',
        "clock": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        "download": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
        "upload": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
        "log_out": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
        "check_circle": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        "cpu": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
        "key": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.4z"/><path d="m15.5 7.5-6 6"/><circle cx="7.5" cy="16.5" r="4.5"/></svg>',
        "grid": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
        "arrow_right": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
        "info": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>',
    }
    return icons.get(name, "")


def parse_time_str(val: str | float | int) -> float:
    if isinstance(val, (int, float)):
        return float(val)
    val_str = str(val).strip()
    if not val_str:
        return 0.0
    parts = val_str.split(":")
    try:
        if len(parts) == 1:
            return float(parts[0])
        elif len(parts) == 2:
            return float(parts[0]) * 60.0 + float(parts[1])
        elif len(parts) == 3:
            return float(parts[0]) * 3600.0 + float(parts[1]) * 60.0 + float(parts[2])
    except ValueError:
        return 0.0
    return 0.0


def format_seconds(seconds: float) -> str:
    s = int(seconds)
    hours = s // 3600
    minutes = (s % 3600) // 60
    secs = s % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def format_time_detailed(seconds: float) -> str:
    s = int(seconds)
    hours = s // 3600
    minutes = (s % 3600) // 60
    secs = s % 60
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0 or hours > 0:
        parts.append(f"{minutes}m")
    parts.append(f"{secs}s")
    return " ".join(parts)


def render_cinematic_status(
    step_num: int,
    total_steps: int,
    title: str,
    subtitle: str,
    elapsed_sec: float,
    est_str: str,
    log_msg: str | None = None,
) -> str:
    """Renders high-tech Apple liquid glass cinematic progress telemetry box."""
    log_html = f'<div class="hud-log-box">{log_msg}</div>' if log_msg else ""
    cpu_icon = get_icon_svg("cpu", 14, "#00f0ff")
    clock_icon = get_icon_svg("clock", 14, "#94a3b8")
    return f"""
    <div class="cinematic-portal">
      <div class="cinematic-header">
        <div class="cinematic-status-pill">
          {cpu_icon} MEDIA PIPELINE &nbsp;|&nbsp; STAGE {step_num} OF {total_steps}
        </div>
        <div class="cinematic-timer">
          {clock_icon} Elapsed: {elapsed_sec:.1f}s / Est: {est_str}
        </div>
      </div>
      <div class="cinematic-orb-container">
        <div class="quantum-orb">
          <div class="quantum-ring"></div>
          <div class="quantum-ring-inner"></div>
        </div>
        <div>
          <div class="cinematic-step-title">{title}</div>
          <div class="cinematic-step-sub">{subtitle}</div>
        </div>
      </div>
      <div class="liquid-progress-bar">
        <div class="liquid-progress-fill"></div>
      </div>
      {log_html}
    </div>
    """


st.set_page_config(
    page_title="CreatorOps | High-Performance Media Suite",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Apply Apple Liquid Glassmorphism & High-Tech Visual System
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
      --bg-dark: #07090e;
      --glass-bg: rgba(18, 24, 38, 0.55);
      --glass-border: rgba(255, 255, 255, 0.1);
      --accent-cyan: #00f0ff;
      --accent-indigo: #6366f1;
      --accent-emerald: #10b981;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }

    html, body, [class*="css"], .stApp {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
      color: var(--text-main);
    }

    .stApp {
      background: radial-gradient(circle at 15% 15%, rgba(0, 240, 255, 0.07) 0%, transparent 45%),
                  radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                  var(--bg-dark) !important;
    }

    [data-testid="stHeader"] {
      background: transparent !important;
    }

    [data-testid="stSidebar"] {
      background: rgba(11, 15, 25, 0.75) !important;
      backdrop-filter: blur(25px) saturate(200%) !important;
      -webkit-backdrop-filter: blur(25px) saturate(200%) !important;
      border-right: 1px solid var(--glass-border) !important;
    }

    /* Glass Container Styling */
    [data-testid="stVerticalBlockBorderWrapper"] {
      background: var(--glass-bg) !important;
      backdrop-filter: blur(24px) saturate(200%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 16px !important;
      box-shadow: 0 16px 40px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.12) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    [data-testid="stVerticalBlockBorderWrapper"]:hover {
      border-color: rgba(255, 255, 255, 0.18) !important;
      box-shadow: 0 20px 48px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.2) !important;
    }

    /* Typography */
    h1 {
      font-family: 'Space Grotesk', sans-serif !important;
      font-weight: 700 !important;
      font-size: clamp(2rem, 4vw, 3.6rem) !important;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em !important;
      line-height: 1.05 !important;
      margin-bottom: 12px !important;
    }

    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.25);
      color: var(--accent-cyan);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 20px;
      margin-bottom: 14px;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.15);
    }

    .lede-text {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 780px;
      margin-bottom: 24px;
    }

    .step-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--accent-cyan);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .section-head {
      color: var(--text-main);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 4px 0 14px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Buttons */
    .stButton > button, .stDownloadButton > button {
      border-radius: 12px !important;
      font-weight: 600 !important;
      font-family: 'Inter', sans-serif !important;
      letter-spacing: 0.02em !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: 1px solid rgba(255, 255, 255, 0.14) !important;
      background: rgba(255, 255, 255, 0.05) !important;
      color: #ffffff !important;
      backdrop-filter: blur(12px) !important;
    }

    .stButton > button:hover, .stDownloadButton > button:hover {
      background: rgba(255, 255, 255, 0.12) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
    }

    .stButton > button[type="primary"] {
      background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%) !important;
      border: 1px solid rgba(0, 240, 255, 0.5) !important;
      color: #040814 !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 25px rgba(0, 240, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
    }

    .stButton > button[type="primary"]:hover {
      background: linear-gradient(135deg, #33f3ff 0%, #1a82ff 100%) !important;
      box-shadow: 0 8px 35px rgba(0, 240, 255, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
      transform: translateY(-2px) !important;
      color: #040814 !important;
    }

    /* Inputs & Selectboxes */
    [data-baseweb="input"], [data-baseweb="select"] {
      background: rgba(11, 15, 25, 0.6) !important;
      border-radius: 10px !important;
      border: 1px solid var(--glass-border) !important;
    }

    [data-testid="stFileUploaderDropzone"] {
      background: rgba(11, 15, 25, 0.5) !important;
      border: 1px dashed rgba(255, 255, 255, 0.18) !important;
      border-radius: 14px !important;
      transition: all 0.2s ease !important;
    }
    [data-testid="stFileUploaderDropzone"]:hover {
      border-color: var(--accent-cyan) !important;
      background: rgba(0, 240, 255, 0.04) !important;
    }

    /* Cinematic Telemetry Portal Styling */
    .cinematic-portal {
      background: radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.14) 0%, transparent 70%), rgba(11, 15, 25, 0.88);
      backdrop-filter: blur(30px) saturate(200%);
      -webkit-backdrop-filter: blur(30px) saturate(200%);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.15);
      margin: 16px 0;
      position: relative;
      overflow: hidden;
    }

    .cinematic-portal::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00f0ff, #818cf8, transparent);
      animation: scanline 2.5s infinite linear;
    }

    @keyframes scanline {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .cinematic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .cinematic-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 240, 255, 0.12);
      border: 1px solid rgba(0, 240, 255, 0.3);
      padding: 6px 14px;
      border-radius: 20px;
      color: #00f0ff;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.06em;
    }

    .cinematic-timer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .cinematic-orb-container {
      display: flex;
      align-items: center;
      gap: 20px;
      margin: 16px 0;
    }

    .quantum-orb {
      width: 48px;
      height: 48px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .quantum-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid transparent;
      border-top-color: #00f0ff;
      border-right-color: #818cf8;
      animation: spinGlow 1.4s linear infinite;
    }

    .quantum-ring-inner {
      position: absolute;
      width: 68%;
      height: 68%;
      border-radius: 50%;
      border: 2px solid transparent;
      border-bottom-color: #00f0ff;
      border-left-color: #10b981;
      animation: spinGlowReverse 1s linear infinite;
    }

    @keyframes spinGlow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes spinGlowReverse {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }

    .cinematic-step-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.15rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .cinematic-step-sub {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .liquid-progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 3px;
      overflow: hidden;
      margin: 18px 0 14px 0;
      position: relative;
    }

    .liquid-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00f0ff, #818cf8, #00f0ff);
      background-size: 200% 100%;
      border-radius: 3px;
      animation: shimmerMove 2s infinite linear;
    }

    @keyframes shimmerMove {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .hud-log-box {
      background: rgba(6, 9, 15, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      color: #38bdf8;
      max-height: 120px;
      overflow-y: auto;
    }

    /* Account Profile Card */
    .account-card {
      background: rgba(16, 24, 38, 0.65);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 14px;
      padding: 14px;
      backdrop-filter: blur(14px);
      margin-bottom: 16px;
    }

    .account-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .account-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid #10b981;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
    }

    .account-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .account-handle {
      font-size: 0.78rem;
      color: #00f0ff;
    }

    .account-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      margin-top: 4px;
    }

    /* Result Card */
    .result-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(0, 240, 255, 0.08) 100%);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 16px;
      padding: 20px;
      margin: 16px 0;
      backdrop-filter: blur(20px);
      box-shadow: 0 12px 36px rgba(16, 185, 129, 0.12);
    }

    .preview-card {
      width: 100%;
      max-width: 420px;
      background: rgba(11, 15, 25, 0.7);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
      margin: 0 auto;
      text-align: center;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Automatic 1-click Google OAuth callback handling
if "code" in st.query_params:
    try:
        oauth_code = st.query_params["code"]
        cid = st.session_state.get("yt_flow_client_id", DEFAULT_CLIENT_ID)
        csec = st.session_state.get("yt_flow_client_secret", DEFAULT_CLIENT_SECRET)
        cver = st.session_state.get("yt_code_verifier")
        creds = process_oauth_callback(
            code=oauth_code,
            client_id=cid,
            client_secret=csec,
            redirect_uri="http://localhost:8501",
            code_verifier=cver,
        )
        st.session_state.yt_creds = creds
        st.query_params.clear()
        st.success("Successfully authenticated with YouTube.")
        st.rerun()
    except Exception as err:
        st.error(f"Authentication failure: {err}")
        st.query_params.clear()

# Load saved OAuth Credentials on startup
if "yt_creds" not in st.session_state:
    st.session_state.yt_creds = load_credentials()

# Header & Hero Banner
st.markdown(
    f'<div class="eyebrow-badge">{get_icon_svg("film", 14, "#00f0ff")} CREATOROPS / MEDIA SUITE</div>',
    unsafe_allow_html=True,
)
st.title("Multi-Stream Video & Composition Studio")
st.markdown(
    '<p class="lede-text">High-precision dual-stream video rendering, automated spatial framing, reaction layouts, picture-in-picture commentary, and balanced multi-channel audio synthesis.</p>',
    unsafe_allow_html=True,
)
st.divider()

# Sidebar: YouTube Account Sign-In & Global Canvas Settings
with st.sidebar:
    st.markdown(
        f'<div class="section-head">{get_icon_svg("youtube", 20, "#ff0000")} YouTube Integration</div>',
        unsafe_allow_html=True,
    )

    yt_creds = st.session_state.get("yt_creds")
    yt_profile = fetch_channel_profile(creds=yt_creds) if yt_creds else None

    if yt_creds:
        # User is signed in with Gmail / YouTube! Hide Sign In button completely.
        avatar_img = (yt_profile.get("avatar_url") if yt_profile else "") or "https://www.youtube.com/s/desktop/f7129528/img/favicon_144x144.png"
        check_svg = get_icon_svg("check_circle", 12, "#34d399")
        ch_title = yt_profile.get("title", "Authenticated Channel") if yt_profile else "Connected YouTube Account"
        ch_handle = yt_profile.get("handle") if yt_profile else ""
        
        try:
            raw_sub = yt_profile.get("subscriber_count", 0) if yt_profile else 0
            sub_count = f"{int(raw_sub):,}"
        except (ValueError, TypeError):
            sub_count = "N/A"

        vid_count = yt_profile.get("video_count", "N/A") if yt_profile else "N/A"
        ch_desc = (yt_profile.get("description", "")[:140] + "...") if (yt_profile and yt_profile.get("description")) else ""
        ch_id = yt_profile.get("channel_id", "") if yt_profile else ""

        st.markdown(
            f"""
            <div class="account-card">
              <div class="account-header">
                <img src="{avatar_img}" class="account-avatar" alt="Avatar"/>
                <div>
                  <div class="account-name">{ch_title}</div>
                  <div class="account-handle">{ch_handle or 'Google Account Signed In'}</div>
                  <div class="account-badge">{check_svg} Account Signed In</div>
                </div>
              </div>
              <div style="margin-top:12px; font-size:0.8rem; color:#94a3b8; display:flex; justify-content:space-between; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px;">
                <span>👥 <b>{sub_count}</b> Subscribers</span>
                <span>📹 <b>{vid_count}</b> Uploads</span>
              </div>
              {f'<div style="margin-top:8px; font-size:0.75rem; color:#64748b; line-height:1.4;">{ch_desc}</div>' if ch_desc else ''}
              {f'<div style="margin-top:4px; font-size:0.7rem; color:#475569; font-family:monospace;">ID: {ch_id}</div>' if ch_id else ''}
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Logout Confirmation Dialog
        if st.session_state.get("confirm_logout"):
            st.warning("⚠️ Are you sure you want to log out of your YouTube channel?")
            col_logout_yes, col_logout_no = st.columns(2)
            if col_logout_yes.button("Yes, Log Out", type="primary", use_container_width=True, key="btn_logout_confirm"):
                clear_credentials()
                st.session_state.yt_creds = None
                st.session_state.confirm_logout = False
                st.rerun()
            if col_logout_no.button("Cancel", use_container_width=True, key="btn_logout_cancel"):
                st.session_state.confirm_logout = False
                st.rerun()
        else:
            if st.button("Log Out of YouTube Account", use_container_width=True, key="btn_logout_init"):
                st.session_state.confirm_logout = True
                st.rerun()
    else:
        # User NOT signed in -> Show Sign In button & options
        with st.expander("Connect YouTube Channel", expanded=True):
            st.caption("Authenticate with Google to import channel media and publish exported videos directly.")

            client_id = DEFAULT_CLIENT_ID
            client_secret = DEFAULT_CLIENT_SECRET
            redirect_uri = "http://localhost:8501"

            try:
                auth_url, flow_obj = get_authorization_url(client_id, client_secret, redirect_uri=redirect_uri)
                st.session_state["yt_flow_client_id"] = client_id
                st.session_state["yt_flow_client_secret"] = client_secret
                if hasattr(flow_obj, "code_verifier"):
                    st.session_state["yt_code_verifier"] = flow_obj.code_verifier
                st.link_button("Sign In with Google", auth_url, type="primary", use_container_width=True)
                st.caption("Automatic redirection active upon authorization.")
            except Exception as e:
                st.error(f"OAuth initialization error: {e}")

            with st.expander("Manual OAuth & Client Credentials"):
                uploaded_secret_file = st.file_uploader("Upload client_secret.json", type=["json"], key="client_secret_file")
                col_id, col_sec = st.columns(2)
                client_id = col_id.text_input("Client ID", value=DEFAULT_CLIENT_ID)
                client_secret = col_sec.text_input("Client Secret", value=DEFAULT_CLIENT_SECRET, type="password")

                if uploaded_secret_file:
                    try:
                        secret_data = json.load(uploaded_secret_file)
                        inst = secret_data.get("installed") or secret_data.get("web") or {}
                        client_id = inst.get("client_id", client_id)
                        client_secret = inst.get("client_secret", client_secret)
                        st.success("Loaded credentials configuration.")
                    except Exception as ex:
                        st.error(f"Invalid JSON specification: {ex}")

                code_input = st.text_input("Authorization Code", key="yt_auth_code_input")
                if st.button("Validate & Save Token", type="primary", use_container_width=True):
                    if not code_input:
                        st.warning("Paste authorization code to proceed.")
                    else:
                        try:
                            cid = st.session_state.get("yt_flow_client_id", client_id)
                            csec = st.session_state.get("yt_flow_client_secret", client_secret)
                            flow = get_oauth_flow(cid, csec, redirect_uri="urn:ietf:wg:oauth:2.0:oob")
                            flow.fetch_token(code=code_input.strip())
                            creds = flow.credentials
                            save_credentials(creds)
                            st.session_state.yt_creds = creds
                            st.success("YouTube token validated.")
                            st.rerun()
                        except Exception as err:
                            st.error(f"Authentication failed: {err}")

    st.divider()

    st.markdown(
        f'<div class="section-head">{get_icon_svg("sliders", 18, "#00f0ff")} Canvas Specifications</div>',
        unsafe_allow_html=True,
    )
    ratio_label = st.selectbox(
        "Aspect Ratio Target",
        ["9:16 (Shorts / Reels / TikTok)", "16:9 (Landscape YouTube)", "1:1 (Square Feed)", "4:5 (Portrait Feed)"],
        index=0,
    )
    ratio_code = {
        "9:16 (Shorts / Reels / TikTok)": "9:16",
        "16:9 (Landscape YouTube)": "16:9",
        "1:1 (Square Feed)": "1:1",
        "4:5 (Portrait Feed)": "4:5",
    }[ratio_label]

    crop_label = st.selectbox(
        "Video Crop & Framing Strategy",
        [
            "Center Crop & Fill (Cover - Zero Black Bars)",
            "Fit & Letterbox (Contain - Preserve Full Frame)",
            "Top / Face Focus Crop (Reactions & Vlogs)",
            "Bottom Focus Crop (Gameplay & Screen Share)",
            "Manual Custom Coordinates (Interactive Offsets)",
        ],
        index=0,
    )
    crop_mode = {
        "Center Crop & Fill (Cover - Zero Black Bars)": "cover",
        "Fit & Letterbox (Contain - Preserve Full Frame)": "contain",
        "Top / Face Focus Crop (Reactions & Vlogs)": "top",
        "Bottom Focus Crop (Gameplay & Screen Share)": "bottom",
        "Manual Custom Coordinates (Interactive Offsets)": "custom",
    }[crop_label]

    crop_x_pct = 50.0
    crop_y_pct = 50.0
    crop_zoom = 1.0
    if crop_mode == "custom":
        st.markdown("**⚙️ Manual Crop Controls**")
        crop_x_pct = st.slider("Horizontal Pan (X Offset %)", 0.0, 100.0, 50.0, 1.0, help="0% = Left, 50% = Center, 100% = Right")
        crop_y_pct = st.slider("Vertical Tilt (Y Offset %)", 0.0, 100.0, 50.0, 1.0, help="0% = Top, 50% = Center, 100% = Bottom")
        crop_zoom = st.slider("Zoom Scale", 1.0, 3.0, 1.0, 0.1, help="1.0x = Original, 3.0x = Close-up Zoom")

    browser_cookie_option = st.selectbox(
        "Desktop Session Cookies",
        ["None", "Chrome", "Edge", "Firefox", "Brave"],
        help="Access restricted media using local desktop browser authentication.",
    )
    cookie_file_upload = st.file_uploader(
        "Upload Netscape cookies.txt",
        type=["txt"],
        key="cookies",
        help="Optional exported session file for restricted stream downloads.",
    )
    user_agent = st.text_input(
        "HTTP User-Agent Header",
        placeholder="Mozilla/5.0 ...",
        help="Custom browser header for stream ingestion.",
    )

# Step 1: Layout Architecture Selection
with st.container(border=True):
    st.markdown(
        f'<div class="step-badge">{get_icon_svg("grid", 14, "#00f0ff")} STEP 01 / LAYOUT ARCHITECTURE</div>'
        f'<div class="section-head">{get_icon_svg("layers", 20, "#00f0ff")} Choose Spatial Composition Preset</div>',
        unsafe_allow_html=True,
    )
    preset_choice = st.radio(
        "Composition Preset Selection:",
        [
            "Top Master Layout (16:9 Primary Video + Bottom Reaction Fill)",
            "Dual Vertical Split (50/50 Equal Ratio Stack)",
            "Horizontal Dual Split (Side-by-Side Podcast / Interview)",
            "Picture-in-Picture Overlay (Floating Corner Reaction)",
            "Single Stream Reframed (Solo Video Master)",
        ],
        index=0,
    )

    if "Top Master Layout" in preset_choice:
        layout_mode = "top_landscape"
    elif "Dual Vertical Split" in preset_choice:
        layout_mode = "split_v"
    elif "Horizontal Dual Split" in preset_choice:
        layout_mode = "split_h"
    elif "Picture-in-Picture Overlay" in preset_choice:
        layout_mode = "pip"
    else:
        layout_mode = "single"

# Step 2: Spatial Mapping Selection
if layout_mode != "single":
    with st.container(border=True):
        st.markdown(
            f'<div class="step-badge">{get_icon_svg("grid", 14, "#00f0ff")} STEP 02 / SPATIAL MAPPING</div>'
            f'<div class="section-head">Primary Stream Placement</div>',
            unsafe_allow_html=True,
        )
        if layout_mode in ("top_landscape", "split_v"):
            v1_slot_selection = st.selectbox("Primary Stream Position", ["Top Section (Secondary Stream on Bottom)", "Bottom Section (Secondary Stream on Top)"])
            v1_slot_code = "top" if "Top Section" in v1_slot_selection else "bottom"
        elif layout_mode == "split_h":
            v1_slot_selection = st.selectbox("Primary Stream Position", ["Left Section (Secondary Stream on Right)", "Right Section (Secondary Stream on Left)"])
            v1_slot_code = "left" if "Left Section" in v1_slot_selection else "right"
        else:  # pip
            v1_slot_selection = st.selectbox("Primary Stream Role", ["Main Background Canvas", "Floating Corner Overlay"])
            v1_slot_code = "main" if "Main Background Canvas" in v1_slot_selection else "overlay"
            pip_corner = st.selectbox("Overlay Anchor Corner", ["Top right", "Bottom right", "Bottom left", "Top left"], index=1)
            pip_scale = st.slider("Overlay Frame Scale", 0.2, 0.5, 0.35, 0.05)
else:
    v1_slot_code = "top"
    pip_corner = "Bottom right"
    pip_scale = 0.35

# Fetch signed-in YouTube user's videos for quick selection
my_channel_videos = []
if st.session_state.get("yt_creds"):
    my_channel_videos = fetch_user_videos(creds=st.session_state.yt_creds, max_results=10)

# Step 3: Stream Inputs Configuration
if layout_mode != "single":
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(
            f'<div class="step-badge">{get_icon_svg("video", 14, "#00f0ff")} PRIMARY STREAM</div>'
            f'<div class="section-head">Stream Source 1 Config</div>',
            unsafe_allow_html=True,
        )

        default_v1_url = ""
        if my_channel_videos:
            v1_ch_choice = st.selectbox(
                "Import from YouTube Channel Media:",
                ["-- Select Channel Video --"] + [f"{v['title']} ({v['published_at']})" for v in my_channel_videos],
                key="v1_channel_pick",
            )
            if v1_ch_choice != "-- Select Channel Video --":
                matched_idx = [f"{v['title']} ({v['published_at']})" for v in my_channel_videos].index(v1_ch_choice)
                default_v1_url = my_channel_videos[matched_idx]["url"]

        v1_url = st.text_input("Stream 1 YouTube URL", value=default_v1_url, placeholder="https://www.youtube.com/watch?v=...", key="v1_url")
        v1_file = st.file_uploader("Or Upload Media File 1", type=["mp4", "mov", "mkv", "webm"], key="v1_file")
        col_v1_s, col_v1_e = st.columns(2)
        v1_start_input = col_v1_s.text_input("Start Boundary (MM:SS)", value="0:00", key="v1_start_str")
        v1_end_input = col_v1_e.text_input("End Boundary (MM:SS)", value="0:15", key="v1_end_str")
        v1_vol = st.slider("Stream 1 Audio Level", 0.0, 1.0, 1.0, 0.05, key="v1_vol")

        v1_start = parse_time_str(v1_start_input)
        v1_end = parse_time_str(v1_end_input)
        v1_dur = (v1_end - v1_start) if v1_end > v1_start else 15.0
        clock_svg = get_icon_svg("clock", 13, "#00f0ff")
        st.caption(f"{clock_svg} **Segment 1**: `{format_seconds(v1_start)}` ➔ `{format_seconds(v1_end)}` &nbsp;({format_time_detailed(v1_dur)} duration)")

        if v1_url and v1_url.strip():
            st.video(v1_url.strip())
            st.info(f"📺 **Stream 1 Source**: [{v1_url.strip()}]({v1_url.strip()})  \n✂ **Segment**: `{format_seconds(v1_start)}` ➔ `{format_seconds(v1_end)}` | 🔊 **Volume**: `{int(v1_vol*100)}%`")
        elif v1_file:
            st.video(v1_file)
            st.success(f"📹 **Stream 1 File**: `{v1_file.name}` ({(v1_file.size / (1024*1024)):.1f} MB)  \n✂ **Segment**: `{format_seconds(v1_start)}` ➔ `{format_seconds(v1_end)}`")

    with col2:
        st.markdown(
            f'<div class="step-badge">{get_icon_svg("video", 14, "#818cf8")} SECONDARY STREAM</div>'
            f'<div class="section-head">Stream Source 2 Config</div>',
            unsafe_allow_html=True,
        )

        default_v2_url = ""
        if my_channel_videos:
            v2_ch_choice = st.selectbox(
                "Import from YouTube Channel Media:",
                ["-- Select Channel Video --"] + [f"{v['title']} ({v['published_at']})" for v in my_channel_videos],
                key="v2_channel_pick",
            )
            if v2_ch_choice != "-- Select Channel Video --":
                matched_idx = [f"{v['title']} ({v['published_at']})" for v in my_channel_videos].index(v2_ch_choice)
                default_v2_url = my_channel_videos[matched_idx]["url"]

        v2_url = st.text_input("Stream 2 YouTube URL", value=default_v2_url, placeholder="https://www.youtube.com/watch?v=...", key="v2_url")
        v2_file = st.file_uploader("Or Upload Media File 2", type=["mp4", "mov", "mkv", "webm"], key="v2_file")
        col_v2_s, col_v2_e = st.columns(2)
        v2_start_input = col_v2_s.text_input("Start Boundary (MM:SS)", value="0:00", key="v2_start_str")
        v2_end_input = col_v2_e.text_input("End Boundary (MM:SS)", value="0:15", key="v2_end_str")
        v2_vol = st.slider("Stream 2 Audio Level", 0.0, 1.0, 1.0, 0.05, key="v2_vol")

        v2_start = parse_time_str(v2_start_input)
        v2_end = parse_time_str(v2_end_input)
        v2_dur = (v2_end - v2_start) if v2_end > v2_start else 15.0
        st.caption(f"{clock_svg} **Segment 2**: `{format_seconds(v2_start)}` ➔ `{format_seconds(v2_end)}` &nbsp;({format_time_detailed(v2_dur)} duration)")

        if v2_url and v2_url.strip():
            st.video(v2_url.strip())
            st.info(f"📺 **Stream 2 Source**: [{v2_url.strip()}]({v2_url.strip()})  \n✂ **Segment**: `{format_seconds(v2_start)}` ➔ `{format_seconds(v2_end)}` | 🔊 **Volume**: `{int(v2_vol*100)}%`")
        elif v2_file:
            st.video(v2_file)
            st.success(f"📹 **Stream 2 File**: `{v2_file.name}` ({(v2_file.size / (1024*1024)):.1f} MB)  \n✂ **Segment**: `{format_seconds(v2_start)}` ➔ `{format_seconds(v2_end)}`")
else:
    with st.container(border=True):
        st.markdown(
            f'<div class="step-badge">{get_icon_svg("video", 14, "#00f0ff")} SINGLE MEDIA SOURCE</div>'
            f'<div class="section-head">Master Video Configuration</div>',
            unsafe_allow_html=True,
        )

        default_v1_url = ""
        if my_channel_videos:
            v1_ch_choice = st.selectbox(
                "Import from YouTube Channel Media:",
                ["-- Select Channel Video --"] + [f"{v['title']} ({v['published_at']})" for v in my_channel_videos],
                key="v1_channel_pick_single",
            )
            if v1_ch_choice != "-- Select Channel Video --":
                matched_idx = [f"{v['title']} ({v['published_at']})" for v in my_channel_videos].index(v1_ch_choice)
                default_v1_url = my_channel_videos[matched_idx]["url"]

        v1_url = st.text_input("YouTube Source URL", value=default_v1_url, placeholder="https://www.youtube.com/watch?v=...", key="v1_url_single")
        v1_file = st.file_uploader("Or Upload Video File", type=["mp4", "mov", "mkv", "webm"], key="v1_file_single")
        col_v1_s, col_v1_e = st.columns(2)
        v1_start_input = col_v1_s.text_input("Start Boundary (MM:SS)", value="0:00", key="v1_start_str_s")
        v1_end_input = col_v1_e.text_input("End Boundary (MM:SS)", value="0:15", key="v1_end_str_s")
        v1_vol = st.slider("Audio Master Gain", 0.0, 1.0, 1.0, 0.05, key="v1_vol_s")

        v1_start = parse_time_str(v1_start_input)
        v1_end = parse_time_str(v1_end_input)
        v1_dur = (v1_end - v1_start) if v1_end > v1_start else 15.0
        clock_svg = get_icon_svg("clock", 13, "#00f0ff")
        st.caption(f"{clock_svg} **Segment Window**: `{format_seconds(v1_start)}` ➔ `{format_seconds(v1_end)}` &nbsp;({format_time_detailed(v1_dur)} duration)")

        if v1_url and v1_url.strip():
            st.video(v1_url.strip())
            st.info(f"📺 **Master YouTube Source**: [{v1_url.strip()}]({v1_url.strip()})  \n✂ **Segment**: `{format_seconds(v1_start)}` ➔ `{format_seconds(v1_end)}`")
        elif v1_file:
            st.video(v1_file)
            st.success(f"📹 **Master Video File**: `{v1_file.name}` ({(v1_file.size / (1024*1024)):.1f} MB)")

        v2_url, v2_file, v2_start, v2_end, v2_vol = "", None, 0.0, 0.0, 0.0

# Audio Layer Section
with st.container(border=True):
    st.markdown(
        f'<div class="step-badge">{get_icon_svg("music", 14, "#00f0ff")} MULTI-TRACK AUDIO MATRIX</div>'
        f'<div class="section-head">Background Music Track (Optional)</div>',
        unsafe_allow_html=True,
    )
    music_upload = st.file_uploader("Upload Audio Layer (MP3, WAV, M4A)", type=["mp3", "wav", "m4a"], key="music_upload")
    music_vol = st.slider("Background Music Mix Level", 0.0, 1.0, 0.25, 0.05, key="music_vol")

st.divider()

# Time estimation & target duration panel
target_duration = (v1_end - v1_start) if (v1_end > v1_start) else 15.0
has_yt1 = bool(v1_url.strip())
has_yt2 = bool(v2_url.strip()) if layout_mode != "single" else False
est_info = estimate_processing_time(target_duration, has_yt1, has_yt2)

col_est_a, col_est_b = st.columns([2, 1])
with col_est_a:
    clock_ic = get_icon_svg("clock", 16, "#00f0ff")
    st.markdown(
        f"{clock_ic} **Estimated Processing Duration**: `{est_info['human_readable']}` "
        f"*(Network download ~{int(est_info['download_est'])}s &bull; Spatial rendering ~{int(est_info['ffmpeg_est'])}s)*"
    )
with col_est_b:
    layers_ic = get_icon_svg("layers", 16, "#818cf8")
    st.markdown(f"{layers_ic} **Target Master Duration**: `{format_seconds(target_duration)}`")

# Main Action Button
submit_btn = get_icon_svg("sparkles", 18, "#040814")
submit = st.button("Compile & Render Media Master", type="primary", use_container_width=True)

if submit:
    if not (v1_url.strip() or v1_file):
        st.error("Provide a valid YouTube URL or media file upload for Primary Stream 1.")
    elif layout_mode != "single" and not (v2_url.strip() or v2_file):
        st.error("Provide a valid YouTube URL or media file upload for Secondary Stream 2.")
    else:
        # Placeholder for dynamic cinematic telemetry portal
        telemetry_placeholder = st.empty()
        started_at = time.perf_counter()

        try:
            with tempfile.TemporaryDirectory() as tmp_dir:
                work_dir = Path(tmp_dir)

                # Cookie extraction settings
                browser_name = None if browser_cookie_option == "None" else browser_cookie_option.lower()
                cookie_file_path = None
                if cookie_file_upload:
                    cookie_file_path = work_dir / "custom_cookies.txt"
                    cookie_file_path.write_bytes(cookie_file_upload.getvalue())

                # Stage 1: Ingest Stream 1
                source1: Path | None = None
                if v1_url.strip():
                    def update_v1_dl(dl_msg: str):
                        elapsed = time.perf_counter() - started_at
                        telemetry_placeholder.markdown(
                            render_cinematic_status(
                                step_num=1,
                                total_steps=3,
                                title="Ingesting Primary Stream 1",
                                subtitle=f"Downloading segment boundary ({format_seconds(v1_start)} - {format_seconds(v1_end)})",
                                elapsed_sec=elapsed,
                                est_str=est_info["human_readable"],
                                log_msg=dl_msg,
                            ),
                            unsafe_allow_html=True,
                        )

                    telemetry_placeholder.markdown(
                        render_cinematic_status(
                            step_num=1,
                            total_steps=3,
                            title="Ingesting Primary Stream 1",
                            subtitle=f"Connecting to source stream ({format_seconds(v1_start)} - {format_seconds(v1_end)})...",
                            elapsed_sec=0.0,
                            est_str=est_info["human_readable"],
                        ),
                        unsafe_allow_html=True,
                    )
                    source1 = download_youtube(
                        v1_url.strip(),
                        work_dir,
                        browser=browser_name,
                        user_agent=user_agent.strip() or None,
                        cookie_file=cookie_file_path,
                        start_seconds=v1_start,
                        end_seconds=v1_end or None,
                        progress_callback=update_v1_dl,
                        filename_prefix="v1_source",
                    )
                elif v1_file:
                    source1 = save_upload(v1_file, work_dir / f"v1_{Path(v1_file.name).name}")

                # Stage 2: Ingest Stream 2
                source2: Path | None = None
                if layout_mode != "single":
                    if v2_url.strip():
                        def update_v2_dl(dl_msg: str):
                            elapsed = time.perf_counter() - started_at
                            telemetry_placeholder.markdown(
                                render_cinematic_status(
                                    step_num=2,
                                    total_steps=3,
                                    title="Ingesting Secondary Stream 2",
                                    subtitle=f"Downloading segment boundary ({format_seconds(v2_start)} - {format_seconds(v2_end)})",
                                    elapsed_sec=elapsed,
                                    est_str=est_info["human_readable"],
                                    log_msg=dl_msg,
                                ),
                                unsafe_allow_html=True,
                            )

                        telemetry_placeholder.markdown(
                            render_cinematic_status(
                                step_num=2,
                                total_steps=3,
                                title="Ingesting Secondary Stream 2",
                                subtitle=f"Connecting to source stream ({format_seconds(v2_start)} - {format_seconds(v2_end)})...",
                                elapsed_sec=time.perf_counter() - started_at,
                                est_str=est_info["human_readable"],
                            ),
                            unsafe_allow_html=True,
                        )
                        source2 = download_youtube(
                            v2_url.strip(),
                            work_dir,
                            browser=browser_name,
                            user_agent=user_agent.strip() or None,
                            cookie_file=cookie_file_path,
                            start_seconds=v2_start,
                            end_seconds=v2_end or None,
                            progress_callback=update_v2_dl,
                            filename_prefix="v2_source",
                        )
                    elif v2_file:
                        source2 = save_upload(v2_file, work_dir / f"v2_{Path(v2_file.name).name}")

                # Stage 3: Audio & Compositing Engine
                music = save_upload(music_upload, work_dir / f"music_{Path(music_upload.name).name}") if music_upload else None
                output = work_dir / "creatorops-master.mp4"
                elapsed = time.perf_counter() - started_at

                telemetry_placeholder.markdown(
                    render_cinematic_status(
                        step_num=3,
                        total_steps=3,
                        title="Compositing Spatial Frames & Mastering Audio",
                        subtitle="Executing FFmpeg layout pipeline, matrix scaling, and audio stream synthesis...",
                        elapsed_sec=elapsed,
                        est_str=est_info["human_readable"],
                    ),
                    unsafe_allow_html=True,
                )

                build_video_advanced(
                    source1=source1,
                    source2=source2,
                    music=music,
                    output=output,
                    layout=layout_mode,
                    ratio=ratio_code,
                    v1_slot=v1_slot_code,
                    v1_start=v1_start,
                    v1_end=v1_end or None,
                    v2_start=v2_start,
                    v2_end=v2_end or None,
                    v1_volume=v1_vol,
                    v2_volume=v2_vol if source2 else 0.0,
                    music_volume=music_vol,
                    pip_position=pip_corner if layout_mode == "pip" else "Bottom right",
                    pip_size=pip_scale if layout_mode == "pip" else 0.35,
                    crop_mode=crop_mode,
                    crop_x_pct=crop_x_pct,
                    crop_y_pct=crop_y_pct,
                    crop_zoom=crop_zoom,
                )

                # Clear telemetry box upon completion
                telemetry_placeholder.empty()

                video_bytes = output.read_bytes()
                st.session_state["exported_video_bytes"] = video_bytes
                st.session_state["exported_video_filename"] = f"creatorops-master-{int(time.time())}.mp4"

            elapsed_seconds = time.perf_counter() - started_at
            check_ic = get_icon_svg("check_circle", 20, "#10b981")
            st.markdown(
                f"""
                <div class="result-card">
                  <div style="font-family:'Space Grotesk',sans-serif; font-size:1.2rem; font-weight:700; color:#ffffff; display:flex; align-items:center; gap:8px;">
                    {check_ic} Media Master Rendered Successfully
                  </div>
                  <div style="font-size:0.9rem; color:#94a3b8; margin-top:6px;">
                    Spatial video composition complete. Stream rendered in <strong>{elapsed_seconds:.1f} seconds</strong>.
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        except Exception as error:
            st.error(f"Render engine error: {error}")

# Persistent Video Output & YouTube Publishing Section
if st.session_state.get("exported_video_bytes"):
    st.divider()
    st.markdown(
        f'<div class="section-head">{get_icon_svg("film", 20, "#00f0ff")} Media Master Output & YouTube Publishing</div>',
        unsafe_allow_html=True,
    )

    col_prev, col_up = st.columns([1, 1])

    with col_prev:
        video_ic = get_icon_svg("video", 16, "#00f0ff")
        st.markdown(
            f"""
            <div class="preview-card">
              <div style="font-family:'Space Grotesk',sans-serif; font-size:0.9rem; font-weight:700; color:#00f0ff; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                {video_ic} {ratio_code} Master Canvas Preview
              </div>
            """,
            unsafe_allow_html=True,
        )
        st.video(st.session_state["exported_video_bytes"])

        dl_ic = get_icon_svg("download", 16, "#ffffff")
        st.download_button(
            "Download Master MP4 File",
            st.session_state["exported_video_bytes"],
            file_name=st.session_state.get("exported_video_filename", "creatorops-master.mp4"),
            mime="video/mp4",
            use_container_width=True,
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with col_up:
        with st.container(border=True):
            st.markdown(
                f'<div class="step-badge">{get_icon_svg("upload", 14, "#00f0ff")} BROADCAST MODULE</div>'
                f'<div class="section-head">Publish Directly to YouTube Channel</div>',
                unsafe_allow_html=True,
            )

            yt_creds = st.session_state.get("yt_creds")
            if not yt_creds:
                st.info("Connect your YouTube Channel in the sidebar to publish media directly from CreatorOps.")
            else:
                yt_title = st.text_input("Media Title", value=f"CreatorOps Composition #{int(time.time() % 10000)} #Shorts")
                yt_desc = st.text_area("Media Description", value="Rendered with CreatorOps Multi-Stream Media Suite.\n\n#Shorts #Reaction #CreatorOps")
                yt_privacy = st.selectbox("Privacy Access Setting", ["public", "unlisted", "private"], index=0)

                if st.button("Publish Master Media to YouTube", type="primary", use_container_width=True):
                    with st.spinner("Publishing video stream to YouTube..."):
                        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_upload:
                            temp_upload.write(st.session_state["exported_video_bytes"])
                            temp_upload_path = Path(temp_upload.name)

                        success, res_msg = upload_video_to_youtube(
                            creds=yt_creds,
                            file_path=temp_upload_path,
                            title=yt_title.strip(),
                            description=yt_desc.strip(),
                            privacy_status=yt_privacy,
                            is_short=("9:16" in ratio_code),
                        )

                        try:
                            temp_upload_path.unlink()
                        except Exception:
                            pass

                        if success:
                            st.balloons()
                            st.success("Broadcast completed successfully. Video is live on YouTube!")
                            st.markdown(f"👉 **[Access YouTube Stream]({res_msg})**")
                        else:
                            st.error(f"Broadcast failed: {res_msg}")
