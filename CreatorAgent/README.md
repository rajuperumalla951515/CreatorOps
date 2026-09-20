# CreatorOps Video Agent

A Streamlit video-editing agent that downloads an authorized YouTube video or accepts an upload, trims it, reframes it to a custom ratio, adds an optional video layer, and mixes in background music.

## Features

- YouTube input through `yt-dlp`
- Local uploads for source video, overlay video, and music
- Custom `9:16`, `16:9`, and `1:1` exports
- FFmpeg-powered trimming, compositing, scaling, and audio mixing
- Preview and download of the final MP4

## Installation

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
streamlit run Frontend/app.py
```

## Notebook workflow

Open `Backend/video_agent.ipynb` in VS Code, set the source and editing options in the configuration cell, then run the cells in order. The notebook uses the same backend processor as the Streamlit app and writes the result to `media/creatorops-notebook-final.mp4`.

The editor does not require API keys. Use footage and music you own or have permission to edit. YouTube downloads must follow applicable terms.

If YouTube displays “Sign in to confirm you are not a bot”, open and refresh the video in your signed-in browser, solve any CAPTCHA, then close the browser before starting the download. Choose that browser in the **YouTube sign-in** setting so `yt-dlp` can read its local cookies. For persistent blocks, paste the same browser User-Agent into the optional field. This option is intended for local use; browser cookies are sensitive and should never be committed or uploaded.
