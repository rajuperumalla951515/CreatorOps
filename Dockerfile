# ==============================================================================
# Stage 1: Build Frontend (React + Vite + TypeScript)
# ==============================================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY CreatorAgent/frontend-react/package*.json ./
RUN npm ci

COPY CreatorAgent/frontend-react/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Backend (FastAPI + FFmpeg + Python + Built Static Files)
# ==============================================================================
FROM python:3.11-slim

# Install system dependencies: FFmpeg (for media processing) and Node.js (for yt-dlp JS runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend and App code
COPY CreatorAgent ./CreatorAgent

# Copy built React frontend from Stage 1 into CreatorAgent/frontend-react/dist
COPY --from=frontend-builder /app/frontend/dist ./CreatorAgent/frontend-react/dist

# Create media output directory
RUN mkdir -p /app/CreatorAgent/media_output

# Environment configuration defaults
ENV HOST=0.0.0.0
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start unified API + SPA server
CMD ["python", "CreatorAgent/Backend/api_server.py"]
