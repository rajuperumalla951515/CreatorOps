# Streamlit editor

`app.py` is the optional local Streamlit interface for hands-on video editing.
It reuses `Backend.video_processor` and `Backend.youtube_auth`; it does not
duplicate the rendering or authentication implementation.

Start it from the repository root:

```powershell
streamlit run CreatorAgent\Frontend\app.py
```

Use the React dashboard in `../frontend-react` for the primary product UI.
This Streamlit application remains useful for local editing, debugging, and
notebook-style workflows.
