# 🚀 CreatorOps Deployment & Security Guide

This guide explains how your sensitive keys, OAuth tokens, and files are protected, and how to deploy CreatorOps to production while keeping it **100% private to you**.

---

## 🔒 1. How Your Secrets Are Protected

1. **All Keys Moved to Backend `.env`**:
   - `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` are never hardcoded in frontend or backend code.
   - Everything is loaded via `python-dotenv` from `.env` in the backend.

2. **Git Protection (`.gitignore`)**:
   - `.env`, `.credentials/`, `*youtube_token*.json`, `*client_secret*.json`, and `*cookies.txt` are strictly ignored by git.
   - Personal session cookies (`default_cookies.txt`) have been **untracked from Git tracking**.

3. **Private Access Control (`CREATOR_ACCESS_KEY`)**:
   - When deployed to a public URL, anyone who visits the site would normally be able to use your server's CPU or interact with your YouTube channel.
   - We implemented a **Private Access Lock**:
     - Set `CREATOR_ACCESS_KEY` in your `.env` (or cloud provider dashboard) to a secret password or PIN of your choice.
     - When you open the site, a sleek **CreatorOps Private Access** modal will appear asking for your key.
     - Once entered, it is saved in your browser's local storage and sent via `X-Creator-Key`.
     - Unauthorized visitors cannot trigger renders, view your YouTube account, or upload to your channel.

---

## ⚙️ 2. Environment Variables Reference

| Variable | Description | Example / Default |
|---|---|---|
| `CREATOR_ACCESS_KEY` | **Required in Production**. Master password that locks your deployed site to you. | `your_secret_passcode` |
| `YOUTUBE_CLIENT_ID` | Google OAuth Client ID for YouTube Data API v3. | `...apps.googleusercontent.com` |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth Client Secret. | `GOCSPX-...` |
| `YOUTUBE_REDIRECT_URI` | The OAuth callback URL. Must match your deployed site URL or Google Cloud Console setting. | `https://your-app.onrender.com` or `http://localhost:5173` |
| `YOUTUBE_TOKEN_JSON` | *(Optional)* Full content of `youtube_token.json` if deploying to serverless/ephemeral containers. | `{"token": "...", ...}` |
| `YOUTUBE_COOKIES_TEXT` | *(Optional)* Raw text of your YouTube cookie file for yt-dlp fallback on cloud IPs. | Netscape format cookies text |
| `PORT` | Port for the backend API and static frontend. | `8000` |
| `ALLOWED_ORIGINS` | Permitted CORS origins (comma-separated or `*`). | `*` |

---

## 🌐 3. Deployment Options

### Option A: Render (Recommended - Docker One-Click)
CreatorOps includes a multi-stage `Dockerfile` and `render.yaml`:
1. Push your repository to your private GitHub/GitLab account.
2. In Render Dashboard, click **New > Blueprint** and select this repository (or choose **New > Web Service > Docker**).
3. Set your **Environment Variables** in the Render settings:
   - `CREATOR_ACCESS_KEY`: Choose any password.
   - `YOUTUBE_CLIENT_ID`: Your Google OAuth Client ID.
   - `YOUTUBE_CLIENT_SECRET`: Your Google OAuth Client Secret.
   - `YOUTUBE_REDIRECT_URI`: Set to your Render URL (e.g., `https://creatorops.onrender.com`).
4. In your [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Under **Authorized redirect URIs**, add `https://your-app-name.onrender.com`.
5. Deploy! Both the React frontend and FastAPI backend run seamlessly on a single URL.

---

### Option B: Railway / Fly.io / VPS (Docker)
1. Build and run using the included `Dockerfile`:
   ```bash
   docker build -t creatorops .
   docker run -d -p 8000:8000 --env-file .env creatorops
   ```
2. Point your domain or reverse proxy (Nginx / Caddy) to port `8000`.

---

### Option C: Decoupled (Vercel Frontend + Render Backend)
- **Backend (Render/Fly/VPS)**:
  - Run `uvicorn Backend.api_server:app --host 0.0.0.0 --port 8000`.
- **Frontend (Vercel/Netlify)**:
  - Root directory: `CreatorAgent/frontend-react`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_BASE=https://your-backend.onrender.com`

---

## 💻 4. Running Locally

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start Backend**:
   ```bash
   python CreatorAgent/Backend/api_server.py
   ```

3. **Start Frontend Dev Server** (in a separate terminal):
   ```bash
   npm run dev --prefix CreatorAgent/frontend-react
   ```
   Or build once and let FastAPI serve both:
   ```bash
   npm run build --prefix CreatorAgent/frontend-react
   python CreatorAgent/Backend/api_server.py
   ```
   Open `http://localhost:8000`!
