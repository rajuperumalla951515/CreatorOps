import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Video,
  Layers,
  Subtitles,
  Calendar,
  Lock,
  ChevronRight,
  Shield,
  HelpCircle,
  FileCheck,
  Zap,
  CheckCircle2,
  Cpu,
  LayoutDashboard,
  ExternalLink,
  Sliders,
  Play,
  Volume2,
} from 'lucide-react';
import { YouTubeIcon } from '../../components/YouTubeIcon';
import { getCurrentUser } from '../../utils/supabase';

export const Home: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'canvas' | 'channel' | 'pipeline'>('canvas');
  const [previewLayout, setPreviewLayout] = useState<'top_landscape' | 'split_vertical' | 'pip'>('top_landscape');
  const [captionStyle, setCaptionStyle] = useState<'highlight' | 'boxed' | 'minimal'>('highlight');

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'What is CreatorOps and who is it designed for?',
      a: 'CreatorOps is an autonomous creator operations platform and video production studio designed for YouTubers, podcasters, video editors, and production teams. It unifies footage reframing for Shorts, subtitle generation, metadata optimization, and official YouTube Data API v3 publishing in one workspace.',
    },
    {
      q: 'How does YouTube account authorization work?',
      a: 'CreatorOps connects to YouTube using official Google OAuth 2.0. We request only the minimal permissions necessary to view channel info and publish authorized videos. Your credentials and refresh tokens remain securely isolated on your private backend, and CreatorOps enforces human confirmation before any video is published.',
    },
    {
      q: 'What video layouts and aspect ratios are supported?',
      a: 'CreatorOps supports 9:16 vertical (YouTube Shorts, Reels, TikTok) and standard 16:9 widescreen formats. You can composite multi-stream layouts including Top Landscape with reaction crop, Split Vertical (50/50 dual speaker), and Picture-in-Picture in MP4, WebM, and MOV containers.',
    },
    {
      q: 'How are subtitles and captions generated?',
      a: 'The Captions Engine processes audio streams using automated speech recognition to generate word-level timestamped cues. You can format captions with active word highlighting, contrast backgrounds, or minimal styles, and export standard SubRip (.srt) and WebVTT (.vtt) files.',
    },
    {
      q: 'Does CreatorOps publish videos automatically without approval?',
      a: 'No. CreatorOps strictly adheres to an explicit human confirmation protocol. You review the rendered video preview, title, description, tags, and visibility status (private, unlisted, public) before confirming upload to YouTube.',
    },
    {
      q: 'Where is video media and account data stored?',
      a: 'Source media files are transcoded on your private media server and can be purged at any time. Project configurations, audit event logs, and channel mappings are securely stored in your Supabase instance with Row Level Security (RLS).',
    },
  ];

  const agentFleet = [
    {
      id: '01',
      title: 'Workflow Supervisor',
      role: 'Deterministic pipeline coordinator',
      desc: 'Enforces state transitions, manages retry budgets, and guarantees human approval before publish actions.',
      tag: 'Orchestration',
    },
    {
      id: '02',
      title: 'Project Planner Agent',
      role: 'Requirements to timeline manifest',
      desc: 'Translates natural language briefs and video tracks into a structured, executable FFmpeg composition plan.',
      tag: 'Planning',
    },
    {
      id: '03',
      title: 'Media Analysis Agent',
      role: 'Codecs, loudness & stream probing',
      desc: 'Analyzes input resolution, framerate, audio waveforms, and stream sync using hardware-accelerated ffprobe.',
      tag: 'Diagnostics',
    },
    {
      id: '04',
      title: 'Editing Engine Agent',
      role: 'Spatial multi-stream filtergraphs',
      desc: 'Executes split-screen compositing, face tracking rule-of-thirds crops, picture-in-picture insets, and audio ducking.',
      tag: 'Compositing',
    },
    {
      id: '05',
      title: 'Transcript & Caption Agent',
      role: 'Word-level synchronized subtitle cues',
      desc: 'Generates aligned subtitle cues with millisecond accuracy, exporting standard SubRip (.srt) and WebVTT (.vtt).',
      tag: 'Captions',
    },
    {
      id: '06',
      title: 'Quality Assurance Agent',
      role: 'A/V sync & compliance verification',
      desc: 'Validates rendered video containers, checks audio/video synchronization, and prevents corrupted exports.',
      tag: 'Validation',
    },
    {
      id: '07',
      title: 'Metadata & Chapters Agent',
      role: 'High-CTR titles, chapters & SEO tags',
      desc: 'Synthesizes viewer-focused titles, detailed descriptions, timestamped chapters, and targeted search tags.',
      tag: 'SEO & Packaging',
    },
    {
      id: '08',
      title: 'YouTube Publishing Agent',
      role: 'Direct YouTube Data API v3 distribution',
      desc: 'Handles resumable video uploads, metadata synchronization, privacy state configuration, and scheduled releases.',
      tag: 'Distribution',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', color: '#FFFFFF', minHeight: '100vh' }}>
      {/* Authenticated User Status Strip */}
      {currentUser && (
        <div
          style={{
            backgroundColor: 'rgba(124, 58, 237, 0.12)',
            borderBottom: '1px solid rgba(124, 58, 237, 0.25)',
            padding: '10px 24px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span>
            Signed in as <strong>{currentUser.email}</strong>
          </span>
          <Link
            to="/app"
            style={{
              color: 'var(--accent-violet)',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Open Studio Workspace <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* 1. Hero Section */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 24px 48px 24px',
          textAlign: 'center',
        }}
      >
        {/* Category Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 16px',
            borderRadius: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            CREATOR OPERATIONS & AUTONOMOUS STUDIO OS
          </span>
        </div>

        {/* Primary Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            fontFamily: "'Outfit', sans-serif",
            maxWidth: '920px',
            margin: '0 auto 24px auto',
          }}
        >
          The Production Workspace Built for{' '}
          <span className="text-gradient">YouTube Creators.</span>
        </h1>

        {/* Supporting Narrative */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6,
          }}
        >
          CreatorOps combines intelligent multi-track reframing, automated captioning, metadata synthesis, and direct YouTube Data API publishing into one seamless, secure workspace.
        </p>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '56px',
          }}
        >
          {currentUser ? (
            <Link
              to="/app"
              className="btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '0.98rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LayoutDashboard size={18} />
              <span>Go to Studio Workspace</span>
            </Link>
          ) : (
            <Link
              to="/signup"
              className="btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '0.98rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={18} />
              <span>Get Started Free</span>
            </Link>
          )}

          <button
            onClick={() => scrollToSection('features')}
            className="btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '0.98rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <span>Explore Features</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* 2. Interactive Product Interface Preview */}
        <div
          className="studio-card-elevated"
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            overflow: 'hidden',
            textAlign: 'left',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Top Window Bar */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* Window Controls & App Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                CreatorOps Studio • Workspace Preview
              </span>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'canvas', label: 'Multi-Track Canvas' },
                { id: 'channel', label: 'Channel Operations' },
                { id: 'pipeline', label: '8-Agent Pipeline' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: activeTab === tab.id ? 'var(--accent-violet)' : 'var(--border-subtle)',
                    backgroundColor: activeTab === tab.id ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div style={{ padding: '28px 24px', backgroundColor: 'var(--bg-surface-1)' }}>
            {activeTab === 'canvas' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  alignItems: 'center',
                }}
              >
                {/* 9:16 Vertical Live Preview Canvas */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '240px',
                    aspectRatio: '9 / 16',
                    margin: '0 auto',
                    backgroundColor: '#000000',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  {previewLayout === 'top_landscape' ? (
                    <>
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#111827',
                          borderBottom: '2px solid #374151',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: '#9CA3AF',
                          fontSize: '0.78rem',
                        }}
                      >
                        <Video size={20} color="var(--accent-violet)" />
                        <span>Stream 1 (16:9 Landscape)</span>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#1F2937',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: '#9CA3AF',
                          fontSize: '0.78rem',
                        }}
                      >
                        <Video size={20} color="#38BDF8" />
                        <span>Stream 2 (Reaction Crop)</span>
                      </div>
                    </>
                  ) : previewLayout === 'split_vertical' ? (
                    <div style={{ display: 'flex', height: '100%' }}>
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#111827',
                          borderRight: '1px solid #374151',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9CA3AF',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          padding: '8px',
                        }}
                      >
                        Host A (50%)
                      </div>
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#1F2937',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9CA3AF',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          padding: '8px',
                        }}
                      >
                        Guest B (50%)
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'relative',
                        height: '100%',
                        backgroundColor: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9CA3AF',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span>Base Gameplay Stream</span>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          width: '40%',
                          height: '28%',
                          backgroundColor: '#1F2937',
                          border: '1px solid var(--accent-violet)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#C4B5FD',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        Facecam Inset
                      </div>
                    </div>
                  )}

                  {/* Subtitle Cue Overlay Simulation */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      left: '12px',
                      right: '12px',
                      padding: captionStyle === 'boxed' ? '6px 10px' : '4px 6px',
                      backgroundColor: captionStyle === 'boxed' ? 'rgba(0, 0, 0, 0.85)' : 'transparent',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: captionStyle === 'boxed' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                      textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                    }}
                  >
                    {captionStyle === 'highlight' ? (
                      <span>
                        Creators need <span style={{ color: '#FACC15', textDecoration: 'underline' }}>deterministic</span> tools.
                      </span>
                    ) : captionStyle === 'boxed' ? (
                      <span style={{ color: '#FFFFFF' }}>Word-Level Captions Aligned</span>
                    ) : (
                      <span style={{ color: '#E2E8F0', letterSpacing: '0.02em' }}>High-Accuracy Speech-to-Text</span>
                    )}
                  </div>
                </div>

                {/* Canvas Configuration Controls */}
                <div>
                  <div className="badge badge-violet" style={{ marginBottom: '12px' }}>
                    <Sliders size={12} /> Interactive Compositor
                  </div>
                  <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '8px', fontWeight: 700 }}>
                    Spatial Video & Subtitle Compositing
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                    Switch layouts, balance multi-stream audio ducking, and synchronize captions automatically. Test the layout switcher below:
                  </p>

                  {/* Layout Selector */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Select Multi-Track Layout:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'top_landscape', label: 'Top Landscape' },
                        { id: 'split_vertical', label: 'Split Vertical' },
                        { id: 'pip', label: 'Picture-in-Picture' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setPreviewLayout(item.id as any)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: previewLayout === item.id ? 'var(--accent-violet)' : 'var(--border-subtle)',
                            backgroundColor: previewLayout === item.id ? 'rgba(124, 58, 237, 0.15)' : 'var(--surface-secondary)',
                            color: previewLayout === item.id ? '#FFFFFF' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caption Style Selector */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Subtitle Display Preset:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'highlight', label: 'Karaoke Highlight' },
                        { id: 'boxed', label: 'High-Contrast Box' },
                        { id: 'minimal', label: 'Minimalist Clean' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setCaptionStyle(style.id as any)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: captionStyle === style.id ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                            backgroundColor: captionStyle === style.id ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-secondary)',
                            color: captionStyle === style.id ? '#FFFFFF' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={currentUser ? '/app/studio' : '/signup'}
                    className="btn-primary"
                    style={{ fontSize: '0.88rem', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Launch Studio Workspace</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'channel' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
                <div
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    padding: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <YouTubeIcon size={24} color="#FFFFFF" />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>CreatorOps Tech Demo</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@creatorops • YouTube Channel</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--surface-primary)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channel Status</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>Connected via OAuth</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--surface-primary)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>API Protocol</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>YouTube Data API v3</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Authorization allows direct video publishing with title, description, timestamped chapters, tags, and category configuration.
                  </div>
                </div>

                <div>
                  <div className="badge badge-emerald" style={{ marginBottom: '12px' }}>
                    <Shield size={12} /> Google OAuth 2.0 Integration
                  </div>
                  <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '8px', fontWeight: 700 }}>
                    Direct Channel Synchronization
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                    Connect your YouTube channel in seconds. CreatorOps never stores your Google account password and requests only the minimal scopes necessary to upload finalized videos with your explicit confirmation.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>Resumable video uploads for stable large file transfer</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>Automatic video privacy configuration (Public, Unlisted, Private)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>One-click channel disconnect and token revocation</span>
                    </div>
                  </div>

                  <Link
                    to={currentUser ? '/app/accounts' : '/signup'}
                    className="btn-primary"
                    style={{ fontSize: '0.88rem', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Connect Channel in Studio</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '6px', fontWeight: 700 }}>
                    Deterministic 8-Agent Production Pipeline
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                    Each agent manages a bounded phase of the video lifecycle with schema validation and human approval.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {agentFleet.slice(0, 4).map((agent) => (
                    <div
                      key={agent.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--surface-secondary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-violet)', fontWeight: 700, fontFamily: 'monospace' }}>
                          AGENT {agent.id}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{agent.tag}</span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                        {agent.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {agent.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <Link to="/ai-agents" style={{ fontSize: '0.84rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
                    View All 8 Agents & System Prompts →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer note inside preview */}
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--surface-primary)',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Interactive product simulation of CreatorOps Studio v3.0</span>
            <span>All workflows backed by hardware-accelerated FFmpeg</span>
          </div>
        </div>
      </section>

      {/* 3. Problem & Solution Section (Why CreatorOps) */}
      <section
        id="overview"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '12px' }}>
            Problem & Solution
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
            The Fragmented Creator Workflow Is Broken
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Content creators spend more time managing tools, copying timestamps, and re-exporting formats than actually creating.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Problem Card */}
          <div
            className="studio-card"
            style={{
              padding: '32px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              backgroundColor: 'rgba(239, 68, 68, 0.02)',
            }}
          >
            <div style={{ color: '#F87171', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
              The Fragmented Reality
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '16px' }}>
              4 to 6 Disconnected Tools for Every Video
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#EF4444', fontWeight: 700 }}>✕</span>
                <span>Manual vertical cropping of 16:9 recordings for Shorts and Reels.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#EF4444', fontWeight: 700 }}>✕</span>
                <span>Paying for standalone subtitle sites with watermark or character limits.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#EF4444', fontWeight: 700 }}>✕</span>
                <span>Manually writing YouTube titles, tags, and description chapters in notes apps.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#EF4444', fontWeight: 700 }}>✕</span>
                <span>Exporting huge files locally just to re-upload to YouTube Studio.</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div
            className="studio-card-elevated"
            style={{
              padding: '32px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.02)',
            }}
          >
            <div style={{ color: '#34D399', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
              The CreatorOps Platform
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '16px' }}>
              Unified Operations in One Creator Workspace
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: '#EDEDED' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Automated multi-stream compositing (Top Landscape, Split, PiP) in seconds.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Word-level speech alignment and customizable subtitle cue formatting.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>AI-assisted metadata synthesis: SEO titles, structured descriptions & chapters.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Direct YouTube publishing with resumable uploads and scheduled releases.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section
        id="features"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge badge-neutral" style={{ marginBottom: '12px' }}>
            Core Capabilities
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
            Real Features Built for Production
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Every tool in CreatorOps corresponds to working capabilities in the studio application.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            {
              icon: Video,
              title: 'Multi-Track Studio',
              desc: 'Transform raw video files into 9:16 vertical Shorts or 16:9 widescreen formats with rule-of-thirds speaker cropping.',
              path: '/app/studio',
            },
            {
              icon: Subtitles,
              title: 'Captions & Subtitles Engine',
              desc: 'High-accuracy speech-to-text with millisecond timestamps, active word highlighting, and standard SRT/VTT file export.',
              path: '/app/captions',
            },
            {
              icon: Sparkles,
              title: 'Metadata & Chapters Studio',
              desc: 'Generate click-worthy titles, structured video descriptions, timestamped chapters, and viral hashtags based on content analysis.',
              path: '/app/metadata',
            },
            {
              icon: YouTubeIcon,
              title: 'YouTube Studio Operations',
              desc: 'Authorize channels via official Google OAuth 2.0. Manage uploads, schedule publication, and track channel telemetry.',
              path: '/app/youtube',
            },
            {
              icon: Cpu,
              title: '8-Agent Autonomous Pipeline',
              desc: 'Deterministic orchestration coordinates Ingestion, Planning, Compositing, Captions, QA, and Distribution with bounded tasks.',
              path: '/ai-agents',
            },
            {
              icon: Calendar,
              title: 'Publishing Calendar & History',
              desc: 'Organize planned releases, review historical rendering jobs, inspect audit events, and manage project revisions.',
              path: '/app/calendar',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="studio-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(124, 58, 237, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: 'var(--accent-violet)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '8px', fontWeight: 700 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>
                  {feat.desc}
                </p>
                <Link
                  to={currentUser ? feat.path : '/signup'}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--accent-violet)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Explore in Studio</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works (Authentic 3-Step Workflow) */}
      <section
        id="how-it-works"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
            Simple Workflow
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
            How CreatorOps Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            A transparent three-step process tailored to the real authentication and studio application.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              step: '01',
              title: 'Create Account or Sign In',
              desc: 'Sign up in seconds using Google or your work email. Supabase provides session persistence and database row-level security.',
            },
            {
              step: '02',
              title: 'Connect Your YouTube Channel',
              desc: 'Authenticate your channel via official Google OAuth 2.0 with minimal scopes. Credentials remain isolated on your private backend.',
            },
            {
              step: '03',
              title: 'Ingest, Composite & Publish',
              desc: 'Select multi-track layouts, generate synchronized subtitle cues, review the interactive preview, and publish with explicit confirmation.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="studio-card"
              style={{
                padding: '32px 24px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--accent-violet)',
                  fontFamily: "'Outfit', sans-serif",
                  marginBottom: '12px',
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '10px', fontWeight: 700 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Trust, Security & YouTube Compliance */}
      <section
        id="security"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="studio-card"
          style={{
            padding: '40px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="badge badge-emerald" style={{ marginBottom: '12px' }}>
              <Shield size={12} /> Compliance & Security
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>
              Built for Transparency & Creator Trust
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
              CreatorOps complies with Google API Services User Data Policy. We never access your Google account without explicit authorization, and irreversible actions like uploading or altering video status require your direct confirmation.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/privacy" className="btn-secondary" style={{ fontSize: '0.84rem' }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="btn-secondary" style={{ fontSize: '0.84rem' }}>
                Terms of Service
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: 'Least-Privilege Scopes',
                desc: 'Permissions are restricted solely to reading channel profile data and uploading confirmed videos.',
              },
              {
                title: 'Private Backend Isolation',
                desc: 'Client secrets and refresh tokens are securely managed in backend environment variables and Supabase RLS.',
              },
              {
                title: 'Human Confirmation Protocol',
                desc: 'CreatorOps never publishes or schedules a video without unambiguous user review and approval.',
              },
              {
                title: 'One-Click Disconnection',
                desc: 'Revoke and delete stored OAuth tokens instantly via the Connected Accounts settings page.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'var(--surface-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section
        id="faq"
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '80px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Clear, honest answers about CreatorOps operations, YouTube integration, and privacy.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="studio-card"
              style={{ padding: '18px 24px', cursor: 'pointer' }}
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  {faq.q}
                </h3>
                <ChevronRight
                  size={18}
                  color="var(--text-muted)"
                  style={{
                    transform: activeFaq === i ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                  }}
                />
              </div>
              {activeFaq === i && (
                <div style={{ marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Final Call to Action */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '64px 24px 96px 24px',
        }}
      >
        <div
          className="studio-card-elevated"
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: '14px', fontFamily: "'Outfit', sans-serif" }}>
            Ready to Streamline Your Creator Operations?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Join creators who use CreatorOps to compose multi-track videos, master subtitles, and publish directly to YouTube.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={currentUser ? '/app' : '/signup'}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{currentUser ? 'Open Studio Workspace' : 'Get Started Free'}</span>
              <ArrowRight size={16} />
            </Link>
            {!currentUser && (
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: '14px 24px', fontSize: '0.95rem' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
