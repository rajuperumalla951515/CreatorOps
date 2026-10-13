import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Video,
  Layers,
  Sliders,
  Clock,
  Download,
  Upload,
  LogOut,
  CheckCircle2,
  Cpu,
  Sparkles,
  Music,
  RefreshCw,
  Activity,
  Zap,
  Play,
  Share2,
  X,
  Smartphone,
  Monitor,
  Check,
  Lock,
  Unlock,
  ShieldCheck,
  Key,
  AlertCircle,
  Eye,
  Crop,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../services/api';
import type { RenderTaskStatus, YtProfile, YtVideo } from '../../services/api';

const API_BASE = (
  import.meta.env.VITE_API_BASE !== undefined
    ? import.meta.env.VITE_API_BASE
    : (window.location.port === '5173' ? 'http://localhost:8000' : '')
).replace(/\/$/, '');

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface YtMeta {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
}

function VideoPreviewCard({
  url,
  file,
  startStr,
  endStr,
  cropMode,
  cropXPct = 50,
  cropYPct = 50,
  cropZoom = 1.0,
  ratioCode = '9:16',
  onCropChange,
}: {
  url: string;
  file: File | null;
  startStr: string;
  endStr: string;
  cropMode?: string;
  cropXPct?: number;
  cropYPct?: number;
  cropZoom?: number;
  ratioCode?: string;
  onCropChange?: (x: number, y: number, zoom?: number, x1?: number, y1?: number, x2?: number, y2?: number) => void;
}) {
  const [meta, setMeta] = useState<YtMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
  const [dragAction, setDragAction] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const videoId = extractYoutubeId(url);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentZoom = Math.max(cropZoom, 1.0);
  let aspectFactor = 9 / 16;
  if (ratioCode === '16:9') aspectFactor = 16 / 9;
  else if (ratioCode === '1:1') aspectFactor = 1.0;
  else if (ratioCode === '4:5') aspectFactor = 4 / 5;

  const containerAspect = 16 / 9;
  const relAspect = aspectFactor / containerAspect;

  let baseW = 100 / currentZoom;
  let baseH = 100 / currentZoom;
  if (relAspect < 1.0) {
    baseW = baseW * relAspect;
  } else if (relAspect > 1.0) {
    baseH = baseH / relAspect;
  }

  const boxW_pct = Math.max(5, Math.min(100, baseW));
  const boxH_pct = Math.max(5, Math.min(100, baseH));
  const maxLeft = 100 - boxW_pct;
  const maxTop = 100 - boxH_pct;
  const leftPct = maxLeft > 0 ? maxLeft * (cropXPct / 100) : 0;
  const topPct = maxTop > 0 ? maxTop * (cropYPct / 100) : 0;

  const currX1 = leftPct;
  const currX2 = leftPct + boxW_pct;
  const currY1 = topPct;
  const currY2 = topPct + boxH_pct;

  const dragRef = useRef<{
    action: 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';
    startX: number;
    startY: number;
    initialX1: number;
    initialX2: number;
    initialY1: number;
    initialY2: number;
  }>({
    action: 'move',
    startX: 0,
    startY: 0,
    initialX1: currX1,
    initialX2: currX2,
    initialY1: currY1,
    initialY2: currY2,
  });

  useEffect(() => {
    if (!videoId) {
      setMeta(null);
      return;
    }
    setLoadingMeta(true);
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMeta({
            title: data.title,
            author_name: data.author_name,
            author_url: data.author_url,
            thumbnail_url: data.thumbnail_url,
          });
        } else {
          setMeta({
            title: `YouTube Video (${videoId})`,
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          });
        }
      })
      .catch(() => {
        setMeta({
          title: `YouTube Video (${videoId})`,
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        });
      })
      .finally(() => setLoadingMeta(false));
  }, [videoId]);

  const handleStartDrag = (
    e: React.MouseEvent,
    action: 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  ) => {
    if (cropMode !== 'custom' || !onCropChange) return;
    e.preventDefault();
    e.stopPropagation();
    setDragAction(action);
    dragRef.current = {
      action,
      startX: e.clientX,
      startY: e.clientY,
      initialX1: currX1,
      initialX2: currX2,
      initialY1: currY1,
      initialY2: currY2,
    };
  };

  useEffect(() => {
    if (!dragAction) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !onCropChange) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const { action, startX, startY, initialX1, initialX2, initialY1, initialY2 } = dragRef.current;
      const deltaX_px = e.clientX - startX;
      const deltaY_px = e.clientY - startY;

      const deltaX_pct = (deltaX_px / rect.width) * 100;
      const deltaY_pct = (deltaY_px / rect.height) * 100;

      let newX1 = initialX1;
      let newX2 = initialX2;
      let newY1 = initialY1;
      let newY2 = initialY2;

      if (action === 'e') {
        newX2 = Math.max(initialX1 + 5, Math.min(100, initialX2 + deltaX_pct));
      } else if (action === 'w') {
        newX1 = Math.max(0, Math.min(initialX2 - 5, initialX1 + deltaX_pct));
      } else if (action === 'n') {
        newY1 = Math.max(0, Math.min(initialY2 - 5, initialY1 + deltaY_pct));
      } else if (action === 's') {
        newY2 = Math.max(initialY1 + 5, Math.min(100, initialY2 + deltaY_pct));
      } else if (action === 'nw') {
        newX1 = Math.max(0, Math.min(initialX2 - 5, initialX1 + deltaX_pct));
        newY1 = Math.max(0, Math.min(initialY2 - 5, initialY1 + deltaY_pct));
      } else if (action === 'ne') {
        newX2 = Math.max(initialX1 + 5, Math.min(100, initialX2 + deltaX_pct));
        newY1 = Math.max(0, Math.min(initialY2 - 5, initialY1 + deltaY_pct));
      } else if (action === 'sw') {
        newX1 = Math.max(0, Math.min(initialX2 - 5, initialX1 + deltaX_pct));
        newY2 = Math.max(initialY1 + 5, Math.min(100, initialY2 + deltaY_pct));
      } else if (action === 'se') {
        newX2 = Math.max(initialX1 + 5, Math.min(100, initialX2 + deltaX_pct));
        newY2 = Math.max(initialY1 + 5, Math.min(100, initialY2 + deltaY_pct));
      } else if (action === 'move') {
        const curW = initialX2 - initialX1;
        const curH = initialY2 - initialY1;
        newX1 = Math.max(0, Math.min(100 - curW, initialX1 + deltaX_pct));
        newX2 = newX1 + curW;
        newY1 = Math.max(0, Math.min(100 - curH, initialY1 + deltaY_pct));
        newY2 = newY1 + curH;
      }

      const newWidth = newX2 - newX1;
      const newHeight = newY2 - newY1;
      const newCenterX = newX1 + newWidth / 2;
      const newCenterY = newY1 + newHeight / 2;

      let estZoom = 1.0;
      if (relAspect < 1.0) {
        estZoom = Math.max(1.0, (100 * relAspect) / newWidth);
      } else {
        estZoom = Math.max(1.0, 100 / (newHeight * relAspect));
      }

      onCropChange(
        Math.round(newCenterX * 10) / 10,
        Math.round(newCenterY * 10) / 10,
        Math.round(estZoom * 10) / 10,
        Math.round(newX1 * 10) / 10,
        Math.round(newY1 * 10) / 10,
        Math.round(newX2 * 10) / 10,
        Math.round(newY2 * 10) / 10
      );
    };

    const handleGlobalMouseUp = () => {
      setDragAction(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragAction, relAspect, onCropChange]);

  const hasSource = Boolean(file || videoId);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Film size={36} color="var(--accent-violet)" />
            <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>{file.name}</span>
            <span style={{ fontSize: '0.75rem' }}>Local Upload ({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
          </div>
        ) : videoId ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt="YouTube Thumbnail"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            {loadingMeta && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={24} className="spin" color="#FFFFFF" />
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Video size={36} />
            <span style={{ fontSize: '0.85rem' }}>No Media Configured</span>
          </div>
        )}

        {/* Dynamic Crop Overlay if in custom mode */}
        {hasSource && cropMode === 'custom' && (
          <div
            style={{
              position: 'absolute',
              top: `${topPct}%`,
              left: `${leftPct}%`,
              width: `${boxW_pct}%`,
              height: `${boxH_pct}%`,
              border: '2px solid var(--accent-violet)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
              cursor: dragAction === 'move' ? 'grabbing' : 'grab',
              zIndex: 10,
              boxSizing: 'border-box',
            }}
            onMouseDown={(e) => handleStartDrag(e, 'move')}
          >
            {/* Rule of Thirds Grid */}
            {showGrid && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.3)' }} />
              </div>
            )}

            {/* Resize Handles */}
            <div
              style={{ position: 'absolute', top: '-6px', left: '-6px', width: '12px', height: '12px', backgroundColor: '#FFFFFF', border: '2px solid var(--accent-violet)', cursor: 'nw-resize' }}
              onMouseDown={(e) => handleStartDrag(e, 'nw')}
            />
            <div
              style={{ position: 'absolute', top: '-6px', right: '-6px', width: '12px', height: '12px', backgroundColor: '#FFFFFF', border: '2px solid var(--accent-violet)', cursor: 'ne-resize' }}
              onMouseDown={(e) => handleStartDrag(e, 'ne')}
            />
            <div
              style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '12px', height: '12px', backgroundColor: '#FFFFFF', border: '2px solid var(--accent-violet)', cursor: 'sw-resize' }}
              onMouseDown={(e) => handleStartDrag(e, 'sw')}
            />
            <div
              style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '12px', height: '12px', backgroundColor: '#FFFFFF', border: '2px solid var(--accent-violet)', cursor: 'se-resize' }}
              onMouseDown={(e) => handleStartDrag(e, 'se')}
            />
          </div>
        )}

        {/* Aspect Ratio Badge */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.7)', fontSize: '0.75rem', color: '#FFFFFF', zIndex: 15 }}>
          {cropMode === 'custom' ? `Active Frame (${ratioCode})` : 'Source Frame'}
        </div>
      </div>

      {/* Info bar */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Segment: <strong style={{ color: '#FFFFFF' }}>{startStr}</strong> – <strong style={{ color: '#FFFFFF' }}>{endStr}</strong></span>
        </div>
        {cropMode === 'custom' && (
          <button
            onClick={() => setShowGrid(!showGrid)}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-violet)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
        )}
      </div>
    </div>
  );
}

export const StudioWorkspace: React.FC = () => {
  // Project / Video settings
  const [aspectRatio, setAspectRatio] = useState<string>('9:16');
  const [cropMode, setCropMode] = useState<string>('custom');
  const [cropXPct, setCropXPct] = useState<number>(50.0);
  const [cropYPct, setCropYPct] = useState<number>(50.0);
  const [cropZoom, setCropZoom] = useState<number>(1.0);
  const [v1SlotCode, setV1SlotCode] = useState<string>('top');
  const [pipCorner, setPipCorner] = useState<string>('Bottom right');
  const [pipScale, setPipScale] = useState<number>(0.35);

  // Stream 1 Configuration
  const [v1Url, setV1Url] = useState<string>('');
  const [v1File, setV1File] = useState<File | null>(null);
  const [v1StartStr, setV1StartStr] = useState<string>('0:00');
  const [v1EndStr, setV1EndStr] = useState<string>('0:15');
  const [v1Vol, setV1Vol] = useState<number>(1.0);

  // Stream 2 Configuration
  const [v2Url, setV2Url] = useState<string>('');
  const [v2File, setV2File] = useState<File | null>(null);
  const [v2StartStr, setV2StartStr] = useState<string>('0:00');
  const [v2EndStr, setV2EndStr] = useState<string>('0:15');
  const [v2Vol, setV2Vol] = useState<number>(1.0);

  // Audio Configuration
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicVol, setMusicVol] = useState<number>(0.25);

  // Render & Job state
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<RenderTaskStatus | null>(null);
  const [completedMediaUrl, setCompletedMediaUrl] = useState<string | null>(null);

  // YouTube modal state
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [ytTitle, setYtTitle] = useState<string>('');
  const [ytDesc, setYtDesc] = useState<string>('');
  const [ytPrivacy, setYtPrivacy] = useState<'public' | 'private' | 'unlisted'>('unlisted');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Handle Crop Drag Changes
  const handleCropChange = (x: number, y: number, zoom?: number) => {
    setCropXPct(x);
    setCropYPct(y);
    if (zoom !== undefined) setCropZoom(zoom);
  };

  // Poll for Render Job status
  useEffect(() => {
    if (!activeTaskId || completedMediaUrl) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/render/${activeTaskId}`);
        if (res.ok) {
          const data: RenderTaskStatus = await res.json();
          setTaskStatus(data);
          if (data.status === 'complete' && data.media_url) {
            setCompletedMediaUrl(data.media_url);
            setIsRendering(false);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setIsRendering(false);
            clearInterval(interval);
          }
        }
      } catch {
        // Polling retry
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTaskId, completedMediaUrl]);

  // Start FFmpeg Render Job
  const handleStartRender = async () => {
    setIsRendering(true);
    setTaskStatus(null);
    setCompletedMediaUrl(null);

    if (!v1File && !v1Url.trim()) {
      alert('Please enter a YouTube video URL or upload a local video file for Stream 1.');
      setIsRendering(false);
      return;
    }

    const formData = new FormData();
    formData.append('aspect_ratio', aspectRatio);
    formData.append('crop_mode', cropMode);
    formData.append('crop_x_pct', String(cropXPct));
    formData.append('crop_y_pct', String(cropYPct));
    formData.append('crop_zoom', String(cropZoom));
    formData.append('v1_slot', v1SlotCode);
    formData.append('pip_corner', pipCorner);
    formData.append('pip_scale', String(pipScale));

    const parseSeconds = (str: string, defaultVal: number = 0): number => {
      if (!str) return defaultVal;
      const parts = str.split(':').map((p) => parseFloat(p.trim()));
      if (parts.some((n) => isNaN(n))) return defaultVal;
      if (parts.length === 1) return parts[0];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return defaultVal;
    };

    const v1StartSec = parseSeconds(v1StartStr, 0);
    const v1EndSec = parseSeconds(v1EndStr, 15);
    const v2StartSec = parseSeconds(v2StartStr, 0);
    const v2EndSec = parseSeconds(v2EndStr, 15);

    if (v1File) {
      formData.append('v1_file', v1File);
    } else {
      formData.append('v1_url', v1Url);
    }
    formData.append('v1_start', String(v1StartSec));
    formData.append('v1_end', String(v1EndSec));
    formData.append('v1_vol', String(v1Vol));

    if (v2File) {
      formData.append('v2_file', v2File);
    } else if (v2Url) {
      formData.append('v2_url', v2Url);
    }
    formData.append('v2_start', String(v2StartSec));
    formData.append('v2_end', String(v2EndSec));
    formData.append('v2_vol', String(v2Vol));

    if (musicFile) {
      formData.append('music_file', musicFile);
      formData.append('music_vol', String(musicVol));
    }

    const optionsObj = {
      ratio_code: aspectRatio,
      layout_mode: 'top_landscape',
      crop_mode: cropMode,
      crop_x_pct: cropXPct,
      crop_y_pct: cropYPct,
      crop_zoom: cropZoom,
      v1_slot_code: v1SlotCode,
      pip_corner: pipCorner,
      pip_scale: pipScale,
      v1_url: v1File ? '' : v1Url,
      v1_start: v1StartSec,
      v1_end: v1EndSec,
      v1_vol: v1Vol,
      v2_url: v2File ? '' : v2Url,
      v2_start: v2StartSec,
      v2_end: v2EndSec,
      v2_vol: v2Vol,
      music_vol: musicVol,
    };
    formData.append('options_json', JSON.stringify(optionsObj));

    try {
      const res = await fetch(`${API_BASE}/api/render`, {
        method: 'POST',
        headers: api.getAuthHeaders(),
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setActiveTaskId(data.task_id);
      } else {
        const err = await res.json().catch(() => ({}));
        let errorMsg = 'Check parameters';
        if (typeof err.detail === 'string') {
          errorMsg = err.detail;
        } else if (Array.isArray(err.detail)) {
          errorMsg = err.detail
            .map((d: any) => `${d.loc ? d.loc.slice(-1).join('') + ': ' : ''}${d.msg || JSON.stringify(d)}`)
            .join('; ');
        } else if (err.detail && typeof err.detail === 'object') {
          errorMsg = JSON.stringify(err.detail);
        } else if (err.message) {
          errorMsg = err.message;
        }
        alert(`Render initiation failed: ${errorMsg}`);
        setIsRendering(false);
      }
    } catch (e) {
      alert('Could not connect to FastAPI rendering server. Ensure backend is running.');
      setIsRendering(false);
    }
  };

  // Publish to YouTube
  const handlePublishToYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedMediaUrl) return;

    setIsPublishing(true);
    setPublishError(null);
    setPublishedUrl(null);

    try {
      const res = await fetch(`${API_BASE}/api/youtube/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...api.getAuthHeaders(),
        },
        body: JSON.stringify({
          media_url: completedMediaUrl,
          title: ytTitle,
          description: ytDesc,
          privacy: ytPrivacy,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPublishedUrl(data.video_url || 'https://youtube.com');
      } else {
        const err = await res.json().catch(() => ({}));
        setPublishError(err.detail || 'Publishing failed. Check YouTube authorization.');
      }
    } catch (e: any) {
      setPublishError(e.message || 'Network error during publish');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#FFFFFF', marginBottom: '4px' }}>Studio Workspace</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Multi-track timeline compositing, spatial reframing, and autonomous FFmpeg rendering engine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {completedMediaUrl && (
            <button
              onClick={() => setShowPublishModal(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Share2 size={16} style={{ color: '#EF4444' }} /> Publish to YouTube
            </button>
          )}

          <button
            onClick={handleStartRender}
            disabled={isRendering}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isRendering ? (
              <>
                <RefreshCw size={16} className="spin" /> Rendering Stream...
              </>
            ) : (
              <>
                <Zap size={16} /> Render Video
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Progress Monitor */}
      {taskStatus && (
        <div
          className="studio-card"
          style={{
            padding: '20px',
            marginBottom: '24px',
            borderLeft: `4px solid ${
              taskStatus.status === 'complete'
                ? 'var(--accent-emerald)'
                : taskStatus.status === 'failed'
                ? '#EF4444'
                : 'var(--accent-violet)'
            }`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity
                size={18}
                style={{
                  color:
                    taskStatus.status === 'complete'
                      ? 'var(--accent-emerald)'
                      : taskStatus.status === 'failed'
                      ? '#EF4444'
                      : 'var(--accent-violet)',
                }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>
                {taskStatus.step_title || 'Rendering Pipeline'}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Step {taskStatus.step} of {taskStatus.total_steps} ({taskStatus.elapsed.toFixed(1)}s elapsed)
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div
              style={{
                height: '100%',
                width: `${(taskStatus.step / taskStatus.total_steps) * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-violet) 0%, var(--accent-blue) 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span>{taskStatus.step_subtitle || 'Applying spatial transforms...'}</span>
            <span style={{ fontFamily: 'monospace' }}>Task ID: {taskStatus.id.slice(0, 8)}</span>
          </div>

          {completedMediaUrl && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a
                href={completedMediaUrl}
                download
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Download Final MP4
              </a>
              <button
                onClick={() => setShowPublishModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Share2 size={14} /> Send to YouTube Studio
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace Layout: Canvas Grid & Controls Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 1fr)', gap: '24px' }}>
        {/* Left Column: Interactive Previews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Primary Stream Preview */}
          <div className="studio-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} style={{ color: 'var(--accent-violet)' }} />
                <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0 }}>Stream 1 (Primary Viewport)</h3>
              </div>
              <span className="badge badge-violet">{v1SlotCode.toUpperCase()}</span>
            </div>

            <VideoPreviewCard
              url={v1Url}
              file={v1File}
              startStr={v1StartStr}
              endStr={v1EndStr}
              cropMode={cropMode}
              cropXPct={cropXPct}
              cropYPct={cropYPct}
              cropZoom={cropZoom}
              ratioCode={aspectRatio}
              onCropChange={handleCropChange}
            />

            {/* Quick Stream 1 inputs */}
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="input-label">Start Timestamp</label>
                <input
                  type="text"
                  className="input-field"
                  value={v1StartStr}
                  onChange={(e) => setV1StartStr(e.target.value)}
                  placeholder="0:00"
                />
              </div>
              <div>
                <label className="input-label">End Timestamp</label>
                <input
                  type="text"
                  className="input-field"
                  value={v1EndStr}
                  onChange={(e) => setV1EndStr(e.target.value)}
                  placeholder="0:15"
                />
              </div>
            </div>
          </div>

          {/* Secondary Stream Preview (if configured) */}
          <div className="studio-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0 }}>Stream 2 (Reaction / PiP / Split)</h3>
              </div>
              <span className="badge badge-cyan">{pipCorner}</span>
            </div>

            <VideoPreviewCard
              url={v2Url}
              file={v2File}
              startStr={v2StartStr}
              endStr={v2EndStr}
              cropMode="none"
              ratioCode={aspectRatio}
            />

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="input-label">Start Timestamp</label>
                <input
                  type="text"
                  className="input-field"
                  value={v2StartStr}
                  onChange={(e) => setV2StartStr(e.target.value)}
                  placeholder="0:00"
                />
              </div>
              <div>
                <label className="input-label">End Timestamp</label>
                <input
                  type="text"
                  className="input-field"
                  value={v2EndStr}
                  onChange={(e) => setV2EndStr(e.target.value)}
                  placeholder="0:15"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Compositing & Audio Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Format & Aspect Ratio */}
          <div className="studio-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} style={{ color: 'var(--accent-violet)' }} /> Format & Framing
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Output Aspect Ratio</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { code: '9:16', label: '9:16 Shorts' },
                    { code: '16:9', label: '16:9 Widescreen' },
                    { code: '1:1', label: '1:1 Square' },
                  ].map((r) => (
                    <button
                      key={r.code}
                      onClick={() => setAspectRatio(r.code)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: `1px solid ${aspectRatio === r.code ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                        backgroundColor: aspectRatio === r.code ? 'rgba(124, 58, 237, 0.15)' : 'var(--bg-surface-2)',
                        color: aspectRatio === r.code ? '#FFFFFF' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Reframing Algorithm</label>
                <select
                  className="input-field"
                  value={cropMode}
                  onChange={(e) => setCropMode(e.target.value)}
                >
                  <option value="custom">Interactive Rule-of-Thirds Crop</option>
                  <option value="none">Center Fit (Letterbox / Pillarbox)</option>
                  <option value="cover">Smart Dynamic Center Pan</option>
                </select>
              </div>

              <div>
                <label className="input-label">Layout Split Arrangement</label>
                <select
                  className="input-field"
                  value={v1SlotCode}
                  onChange={(e) => setV1SlotCode(e.target.value)}
                >
                  <option value="top">Vertical Split: Stream 1 Top / Stream 2 Bottom</option>
                  <option value="bottom">Vertical Split: Stream 1 Bottom / Stream 2 Top</option>
                  <option value="pip">Picture-in-Picture Floating Overlay</option>
                  <option value="fullscreen">Solo: Stream 1 Only (Fullscreen Master)</option>
                </select>
              </div>

              {v1SlotCode === 'pip' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">PiP Corner</label>
                    <select
                      className="input-field"
                      value={pipCorner}
                      onChange={(e) => setPipCorner(e.target.value)}
                    >
                      <option value="Bottom right">Bottom Right</option>
                      <option value="Bottom left">Bottom Left</option>
                      <option value="Top right">Top Right</option>
                      <option value="Top left">Top Left</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">PiP Scale ({(pipScale * 100).toFixed(0)}%)</label>
                    <input
                      type="range"
                      min="0.2"
                      max="0.6"
                      step="0.05"
                      value={pipScale}
                      onChange={(e) => setPipScale(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-violet)', marginTop: '8px' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media Sources Setup */}
          <div className="studio-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--accent-cyan)' }} /> Media Feeds
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Stream 1 Feed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="input-label" style={{ margin: 0 }}>Stream 1 Source URL or Upload</label>
                  <button
                    type="button"
                    onClick={() => {
                      setV1Url('https://www.youtube.com/watch?v=jNQXAC9IVRw');
                      setV1File(null);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    + Sample Video
                  </button>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={v1Url}
                  onChange={(e) => {
                    setV1Url(e.target.value);
                    setV1File(null);
                  }}
                  style={{ marginBottom: '8px' }}
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setV1File(e.target.files[0]);
                      setV1Url('');
                    }
                  }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                />
              </div>

              {/* Stream 2 Feed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="input-label" style={{ margin: 0 }}>Stream 2 Source URL or Upload (Optional)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setV2Url('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
                      setV2File(null);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    + Sample Video 2
                  </button>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={v2Url}
                  onChange={(e) => {
                    setV2Url(e.target.value);
                    setV2File(null);
                  }}
                  style={{ marginBottom: '8px' }}
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setV2File(e.target.files[0]);
                      setV2Url('');
                    }
                  }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                />
              </div>
            </div>
          </div>

          {/* Audio Mixing Rack */}
          <div className="studio-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Music size={18} style={{ color: 'var(--accent-emerald)' }} /> Audio Mixing Console
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Stream 1 Volume</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{(v1Vol * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={v1Vol}
                  onChange={(e) => setV1Vol(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-violet)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Stream 2 Volume</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{(v2Vol * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={v2Vol}
                  onChange={(e) => setV2Vol(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div>
                <label className="input-label">Background Audio Track</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setMusicFile(e.target.files[0]);
                    }
                  }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}
                />
                {musicFile && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Music Bed Level</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{(musicVol * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={musicVol}
                      onChange={(e) => setMusicVol(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Publishing Confirmation Modal */}
      {showPublishModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                >
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', margin: 0 }}>Publish to YouTube</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Official YouTube Data API v3 Upload Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {publishedUrl ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)', margin: '0 auto 16px auto' }} />
                <h4 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '8px' }}>Video Successfully Uploaded!</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Your video is currently being processed on YouTube servers.
                </p>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Play size={16} /> Watch on YouTube
                </a>
              </div>
            ) : (
              <form onSubmit={handlePublishToYouTube} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="input-label" style={{ margin: 0 }}>Video Title</label>
                    <button
                      type="button"
                      onClick={() => {
                        setYtTitle('Autonomous AI Studio Master - Episode 1');
                        setYtDesc('Rendered autonomously with TubePilot AI Studio.\n#Shorts #CreatorOps #TubePilot');
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                    >
                      + Sample Metadata
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Autonomous AI Studio Master - Episode 1"
                    value={ytTitle}
                    onChange={(e) => setYtTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Description & Hashtags</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Enter video description, timestamps, and hashtags..."
                    value={ytDesc}
                    onChange={(e) => setYtDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Privacy Visibility</label>
                  <select
                    className="input-field"
                    value={ytPrivacy}
                    onChange={(e: any) => setYtPrivacy(e.target.value)}
                  >
                    <option value="unlisted">Unlisted (Recommended for QA Review)</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                {publishError && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#EF4444', fontSize: '0.82rem' }}>
                    <AlertCircle size={14} />
                    <span>{publishError}</span>
                  </div>
                )}

                <div className="studio-card" style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  TubePilot requires explicit human consent before irreversible video uploads. By clicking Confirm, you authoritatively publish this media to your authorized YouTube channel.
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={isPublishing}
                  >
                    {isPublishing ? 'Uploading to YouTube...' : 'Confirm & Upload'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPublishModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
