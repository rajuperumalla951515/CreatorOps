from __future__ import annotations

import sys
import tempfile
import time
from pathlib import Path

import streamlit as st

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import importlib
import Backend.video_processor
importlib.reload(Backend.video_processor)

from Backend.video_processor import (
    build_video_advanced,
    download_youtube,
    estimate_processing_time,
    save_upload,
)


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


st.set_page_config(page_title="CreatorOps Video & Collage Studio", page_icon="🎬", layout="wide")

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
    :root { --ink: #f4f0e8; --muted: #a9aaa5; --line: #343a3b; --panel: #171b1b; --accent: #d8ff62; }
    html, body, [class*="css"], .stApp { font-family: "DM Sans", sans-serif; color: var(--ink); }
    .stApp { background: #0d1010; }
    [data-testid="stHeader"] { background: transparent; }
    h1, h2, h3 { font-family: "Space Grotesk", sans-serif; letter-spacing: 0; }
    h1 { font-size: clamp(2rem, 5vw, 4.3rem) !important; line-height: 0.98 !important; max-width: 800px; }
    .eyebrow { color: var(--accent); font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
    .lede { color: var(--muted); font-size: 1rem; max-width: 680px; line-height: 1.6; }
    .step { color: var(--accent); font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .step-title { color: var(--ink); font-family: "Space Grotesk", sans-serif; font-size: 1.25rem; font-weight: 600; margin: .3rem 0 1rem; }
    .stButton > button, .stDownloadButton > button { border-radius: 6px; font-weight: 700; min-height: 2.8rem; }
    .stButton > button[kind="primary"], .stDownloadButton > button { background: var(--accent); border-color: var(--accent); color: #101414; }
    .stButton > button[kind="primary"]:hover, .stDownloadButton > button:hover { background: #efffae; border-color: #efffae; color: #101414; }
    [data-testid="stSidebar"] { background: #141818; border-right: 1px solid var(--line); }
    [data-testid="stFileUploaderDropzone"] { background: #101414; border-color: #485050; }
    .result { border-left: 4px solid var(--accent); background: #151d18; border-radius: 0 8px 8px 0; padding: 1.2rem; }
    .metric-card { background: #171c1c; border: 1px solid #2d3434; border-radius: 8px; padding: 1rem; text-align: center; }
    .metric-value { font-family: "Space Grotesk", sans-serif; font-size: 1.5rem; font-weight: 700; color: var(--accent); }
    .metric-label { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    
    /* Portrait Video Container Card */
    .portrait-wrapper {
        display: flex;
        justify-content: center;
        margin: 1.5rem 0;
    }
    .portrait-card {
        width: 100%;
        max-width: 400px;
        background: #111616;
        border: 2px solid var(--accent);
        border-radius: 16px;
        padding: 1.2rem;
        box-shadow: 0 12px 35px rgba(216, 255, 98, 0.15);
        text-align: center;
    }
    .portrait-title {
        color: var(--accent);
        font-family: "Space Grotesk", sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 0.8rem;
    }
    .live-dl-box {
        background: #121818;
        border-left: 3px solid var(--accent);
        padding: 0.6rem 0.8rem;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.88rem;
        color: var(--accent);
        margin-top: 0.5rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown('<div class="eyebrow">CreatorOps / Video & Collage Agent</div>', unsafe_allow_html=True)
st.title("Create Reaction Shorts, Split-Screen Clips & Collages")
st.markdown(
    '<p class="lede">Combine two videos into a vertical split-screen stack, side-by-side podcast layout, or floating corner reaction. Trim both videos independently, balance audio streams, and export in 9:16, 16:9, or 1:1.</p>',
    unsafe_allow_html=True,
)
st.divider()

# Sidebar: Global Output & YouTube Sign-In Settings
with st.sidebar:
    st.markdown("### Output Canvas & Cookies")
    ratio_label = st.selectbox(
        "Aspect ratio",
        ["9:16 (Shorts / Reels / TikTok)", "16:9 (Landscape YouTube)", "1:1 (Square Feed)", "4:5 (Portrait Feed)"],
        index=0,
    )
    ratio_code = {"9:16 (Shorts / Reels / TikTok)": "9:16", "16:9 (Landscape YouTube)": "16:9", "1:1 (Square Feed)": "1:1", "4:5 (Portrait Feed)": "4:5"}[ratio_label]

    browser_cookie_option = st.selectbox(
        "YouTube sign-in",
        ["None", "Chrome", "Edge", "Firefox", "Brave"],
        help="Use this to extract sign-in cookies from your browser. The app automatically handles open browsers with clean fallback downloading.",
    )
    cookie_file_upload = st.file_uploader(
        "Or upload cookies.txt (optional)",
        type=["txt"],
        key="cookies",
        help="Upload an exported cookies.txt file if browser cookie extraction is locked by an open browser.",
    )
    user_agent = st.text_input(
        "Browser User-Agent (optional)",
        placeholder="Mozilla/5.0 ...",
        help="Paste your browser's User-Agent string if YouTube presents persistent bot verification checks.",
    )
    st.caption("Use footage and music you own or have permission to edit. YouTube downloads must follow applicable terms.")

# Preset Template Quick Selector
with st.container(border=True):
    st.markdown('<div class="step">Preset Templates</div><div class="step-title">Choose a preset layout</div>', unsafe_allow_html=True)
    preset_choice = st.radio(
        "Select Quick Preset:",
        [
            "🎬 Top Landscape (16:9 Video on Top + Reaction/Facecam Fill Bottom)",
            "📱 Split Vertical 50/50 (Top & Bottom Equal Stack)",
            "👥 Split Horizontal (Left & Right - Podcast / Interview)",
            "🖼️ Floating PiP (Corner Overlay - Gaming / Commentary)",
            "📹 Single Video (Reframed / Framed)",
        ],
        index=0,
    )

    if "🎬 Top Landscape" in preset_choice:
        layout_mode = "top_landscape"
    elif "📱 Split Vertical" in preset_choice:
        layout_mode = "split_v"
    elif "👥 Split Horizontal" in preset_choice:
        layout_mode = "split_h"
    elif "🖼️ Floating PiP" in preset_choice:
        layout_mode = "pip"
    else:
        layout_mode = "single"

# Slot Placement Selection
if layout_mode != "single":
    with st.container(border=True):
        st.markdown('<div class="step">Slot Assignment</div><div class="step-title">Where should Video 1 be placed?</div>', unsafe_allow_html=True)
        if layout_mode in ("top_landscape", "split_v"):
            v1_slot_selection = st.selectbox("Video 1 Position", ["Top section (Video 2 goes on Bottom)", "Bottom section (Video 2 goes on Top)"])
            v1_slot_code = "top" if "Top section" in v1_slot_selection else "bottom"
        elif layout_mode == "split_h":
            v1_slot_selection = st.selectbox("Video 1 Position", ["Left section (Video 2 goes on Right)", "Right section (Video 2 goes on Left)"])
            v1_slot_code = "left" if "Left section" in v1_slot_selection else "right"
        else: # pip
            v1_slot_selection = st.selectbox("Video 1 Role", ["Main Background (Video 2 is Corner Floating Overlay)", "Corner Floating Overlay (Video 2 is Main Background)"])
            v1_slot_code = "main" if "Main Background" in v1_slot_selection else "overlay"
            pip_corner = st.selectbox("Floating Corner Position", ["Top right", "Bottom right", "Bottom left", "Top left"], index=1)
            pip_scale = st.slider("Floating Corner Size", 0.2, 0.5, 0.35, 0.05)
else:
    v1_slot_code = "top"
    pip_corner = "Bottom right"
    pip_scale = 0.35

# Video Inputs (Video 1 and Video 2)
if layout_mode != "single":
    col1, col2 = st.columns(2)
    with col1:
        st.markdown('<div class="step">01 / Video 1 (Primary)</div><div class="step-title">Set up Video 1</div>', unsafe_allow_html=True)
        v1_url = st.text_input("YouTube URL for Video 1", placeholder="https://www.youtube.com/watch?v=...", key="v1_url")
        v1_file = st.file_uploader("Or upload Video 1", type=["mp4", "mov", "mkv", "webm"], key="v1_file")
        col_v1_s, col_v1_e = st.columns(2)
        v1_start_input = col_v1_s.text_input("Start time (MM:SS e.g. 2:00)", value="0:00", key="v1_start_str")
        v1_end_input = col_v1_e.text_input("End time (MM:SS e.g. 2:45)", value="0:15", key="v1_end_str")
        v1_vol = st.slider("Video 1 Voice / Audio Volume", 0.0, 1.0, 1.0, 0.05, key="v1_vol")

        v1_start = parse_time_str(v1_start_input)
        v1_end = parse_time_str(v1_end_input)
        v1_dur = (v1_end - v1_start) if v1_end > v1_start else 15.0
        st.caption(f"⏱️ **Video 1 Range (MM:SS)**: `{format_seconds(v1_start)}` ➔ `{format_seconds(v1_end)}` &nbsp;({format_time_detailed(v1_dur)} segment)")

    with col2:
        st.markdown('<div class="step">02 / Video 2 (Secondary / Reaction)</div><div class="step-title">Set up Video 2</div>', unsafe_allow_html=True)
        v2_url = st.text_input("YouTube URL for Video 2", placeholder="https://www.youtube.com/watch?v=...", key="v2_url")
        v2_file = st.file_uploader("Or upload Video 2", type=["mp4", "mov", "mkv", "webm"], key="v2_file")
        col_v2_s, col_v2_e = st.columns(2)
        v2_start_input = col_v2_s.text_input("Start time (MM:SS e.g. 2:00)", value="0:00", key="v2_start_str")
        v2_end_input = col_v2_e.text_input("End time (MM:SS e.g. 2:45)", value="0:15", key="v2_end_str")
        v2_vol = st.slider("Video 2 Voice / Audio Volume", 0.0, 1.0, 1.0, 0.05, key="v2_vol")

        v2_start = parse_time_str(v2_start_input)
        v2_end = parse_time_str(v2_end_input)
        v2_dur = (v2_end - v2_start) if v2_end > v2_start else 15.0
        st.caption(f"⏱️ **Video 2 Range (MM:SS)**: `{format_seconds(v2_start)}` ➔ `{format_seconds(v2_end)}` &nbsp;({format_time_detailed(v2_dur)} segment)")
else:
    with st.container(border=True):
        st.markdown('<div class="step">01 / Video (Single Source)</div><div class="step-title">Set up Source Video</div>', unsafe_allow_html=True)
        v1_url = st.text_input("YouTube URL for Video", placeholder="https://www.youtube.com/watch?v=...", key="v1_url_single")
        v1_file = st.file_uploader("Or upload Video", type=["mp4", "mov", "mkv", "webm"], key="v1_file_single")
        col_v1_s, col_v1_e = st.columns(2)
        v1_start_input = col_v1_s.text_input("Start time (MM:SS e.g. 2:00)", value="0:00", key="v1_start_str_single")
        v1_end_input = col_v1_e.text_input("End time (MM:SS e.g. 2:45)", value="0:15", key="v1_end_str_single")
        v1_vol = st.slider("Voice / Audio Volume", 0.0, 1.0, 1.0, 0.05, key="v1_vol_single")

        v1_start = parse_time_str(v1_start_input)
        v1_end = parse_time_str(v1_end_input)
        v1_dur = (v1_end - v1_start) if v1_end > v1_start else 15.0
        st.caption(f"⏱️ **Video Range (MM:SS)**: `{format_seconds(v1_start)}` ➔ `{format_seconds(v1_end)}` &nbsp;({format_time_detailed(v1_dur)} segment)")

    v2_url = ""
    v2_file = None
    v2_start = 0.0
    v2_end = 0.0
    v2_vol = 1.0
    v2_dur = 0.0

# Optional Audio Layer
with st.container(border=True):
    st.markdown('<div class="step">03 / Audio Layer</div><div class="step-title">Background Music (Optional)</div>', unsafe_allow_html=True)
    col_m1, col_m2 = st.columns([3, 2])
    music_upload = col_m1.file_uploader("Upload background audio", type=["mp3", "wav", "m4a", "aac"], key="music")
    music_vol = col_m2.slider("Music Volume", 0.0, 1.0, 0.18, 0.01, key="music_vol")

# Time Ratios & Detailed Estimation Dashboard
st.markdown("### 📊 Metrics & Render Time Estimation")
est_info = estimate_processing_time(
    v1_duration=v1_dur,
    v2_duration=v2_dur,
    has_youtube=bool(v1_url.strip() or v2_url.strip()),
    layout=layout_mode,
    ratio=ratio_code,
)

m_col1, m_col2, m_col3, m_col4 = st.columns(4)
m_col1.markdown(f'<div class="metric-card"><div class="metric-value">{ratio_code}</div><div class="metric-label">Aspect Ratio</div></div>', unsafe_allow_html=True)
m_col2.markdown(f'<div class="metric-card"><div class="metric-value">{est_info["clip_duration"]:.1f}s</div><div class="metric-label">Target Duration</div></div>', unsafe_allow_html=True)
m_col3.markdown(f'<div class="metric-card"><div class="metric-value">{est_info["human_readable"]}</div><div class="metric-label">Est. Total Time</div></div>', unsafe_allow_html=True)
m_col4.markdown(f'<div class="metric-card"><div class="metric-value">{layout_mode.upper()}</div><div class="metric-label">Layout Mode</div></div>', unsafe_allow_html=True)

st.write("")
generate = st.button("🚀 Render Final Video", type="primary", use_container_width=True)

if generate:
    if not v1_url.strip() and v1_file is None:
        st.error("Please add a YouTube URL or upload a file for Video 1.")
    elif layout_mode != "single" and not v2_url.strip() and v2_file is None:
        st.error("Please add a YouTube URL or upload a file for Video 2 to create a split-screen or PiP collage.")
    elif v1_end and v1_end <= v1_start:
        st.error("Video 1 End time must be greater than Start time.")
    elif v2_end and v2_end <= v2_start:
        st.error("Video 2 End time must be greater than Start time.")
    else:
        with tempfile.TemporaryDirectory(prefix="creatorops-") as temporary_dir:
            work_dir = Path(temporary_dir)
            try:
                started_at = time.perf_counter()
                with st.status(f"🚀 Building your video (Est. {est_info['human_readable']})...", expanded=True) as status:
                    progress_placeholder = st.empty()

                    browser_name = {
                        "None": None,
                        "Chrome": "chrome",
                        "Edge": "edge",
                        "Firefox": "firefox",
                        "Brave": "brave",
                    }[browser_cookie_option]
                    cookie_file_path = save_upload(cookie_file_upload, work_dir / "cookies.txt") if cookie_file_upload else None

                    # Download / Save Video 1
                    if v1_url.strip():
                        def update_v1_dl(dl_msg: str):
                            elapsed = time.perf_counter() - started_at
                            progress_placeholder.markdown(
                                f"**Step 1/3: Downloading Video 1 ({format_seconds(v1_start)} - {format_seconds(v1_end)})** &nbsp;|&nbsp; ⏱️ Elapsed: `{elapsed:.1f}s` / Est: `{est_info['human_readable']}`<br>"
                                f'<div class="live-dl-box">{dl_msg}</div>',
                                unsafe_allow_html=True,
                            )
                        
                        progress_placeholder.markdown(f"**Step 1/3: Downloading Video 1 ({format_seconds(v1_start)} - {format_seconds(v1_end)})**...")
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
                    else:
                        source1 = save_upload(v1_file, work_dir / f"v1_{Path(v1_file.name).name}")

                    # Download / Save Video 2
                    source2 = None
                    if layout_mode != "single":
                        if v2_url.strip():
                            def update_v2_dl(dl_msg: str):
                                elapsed = time.perf_counter() - started_at
                                progress_placeholder.markdown(
                                    f"**Step 2/3: Downloading Video 2 ({format_seconds(v2_start)} - {format_seconds(v2_end)})** &nbsp;|&nbsp; ⏱️ Elapsed: `{elapsed:.1f}s` / Est: `{est_info['human_readable']}`<br>"
                                    f'<div class="live-dl-box">{dl_msg}</div>',
                                    unsafe_allow_html=True,
                                )

                            progress_placeholder.markdown(f"**Step 2/3: Downloading Video 2 ({format_seconds(v2_start)} - {format_seconds(v2_end)})**...")
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

                    # Save Music Layer
                    music = save_upload(music_upload, work_dir / f"music_{Path(music_upload.name).name}") if music_upload else None

                    # Build Output Video
                    output = work_dir / "creatorops-collage.mp4"
                    elapsed = time.perf_counter() - started_at
                    progress_placeholder.markdown(
                        f"**Step 3/3: Compositing video layouts, balancing audio streams, and exporting MP4...** &nbsp;|&nbsp; ⏱️ Elapsed: `{elapsed:.1f}s`"
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
                    )
                    status.update(label="Export completed successfully!", state="complete", expanded=False)

                st.markdown('<div class="result"><strong>Export complete!</strong><br>Your video collage is ready. Play it below or download the MP4 file.</div>', unsafe_allow_html=True)
                elapsed_seconds = time.perf_counter() - started_at
                st.caption(f"⚡ Rendered in {elapsed_seconds:.1f} seconds (Estimated was {est_info['human_readable']}).")
                
                # Styled Portrait Container Card
                st.markdown(
                    f"""
                    <div class="portrait-wrapper">
                      <div class="portrait-card">
                        <div class="portrait-title">📱 {ratio_code} Portrait Preview</div>
                    """,
                    unsafe_allow_html=True,
                )
                st.video(str(output))
                st.download_button("Download final MP4", output.read_bytes(), file_name="creatorops-collage.mp4", mime="video/mp4", use_container_width=True)
                st.markdown('</div></div>', unsafe_allow_html=True)
            except Exception as error:
                st.error(f"The edit could not be completed: {error}")
