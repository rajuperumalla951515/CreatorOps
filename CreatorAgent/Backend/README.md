# Backend

The backend is a Python package rooted at `CreatorAgent/Backend`. It exposes
the FastAPI application and keeps media, persistence, authentication, and
workflow coordination in separate modules.

## Module guide

| Module | Responsibility |
| --- | --- |
| `api_server.py` | FastAPI routes, request validation, access control, render jobs, and static frontend serving |
| `video_processor.py` | URL validation, uploads, YouTube/direct downloads, FFmpeg rendering, and processing estimates |
| `db.py` | SQLite persistence and optional Supabase-backed records |
| `storage.py` | Uploads and signed URLs for rendered media, with local fallback |
| `supabase_db.py` | Supabase client, JWT checks, profiles, audit events, and cloud persistence |
| `youtube_auth.py` | Google OAuth flow, token storage, channel reads, and video publishing |
| `agents/` | Specialized planning, analysis, editing, captioning, QA, metadata, publishing, and supervisor agents |
| `tests/` | Unit, API, data-integrity, and production-pipeline tests |
| `video_agent.ipynb` | Interactive notebook using the shared video processor |

## Runtime flow

```text
HTTP request
  -> api_server.py
     -> auth + input validation
     -> agents/ (when orchestration is requested)
     -> video_processor.py
        -> download/upload + FFmpeg
     -> storage.py + db.py
  -> job status and media URL
```

Run the API from the repository root:

```powershell
python CreatorAgent\Backend\api_server.py
```

Run tests from the repository root:

```powershell
python -m pytest CreatorAgent/Backend/tests
```

Keep credentials in environment variables or the ignored
`CreatorAgent/Backend/.credentials/` directory. Do not place tokens or cookie
files in source code.
