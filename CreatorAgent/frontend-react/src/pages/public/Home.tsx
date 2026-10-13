import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Cpu,
  Video,
  Layers,
  Subtitles,
  Upload,
  Calendar,
  Lock,
  ChevronRight,
  Shield,
  HelpCircle,
  FileCheck,
  Zap,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewLayout, setPreviewLayout] = useState<'top_landscape' | 'split_vertical' | 'pip'>('top_landscape');

  const faqs = [
    {
      q: 'How does TubePilot AI process video footage?',
      a: 'TubePilot AI employs an orchestrated pipeline of 8 specialized agents powered by hardware-accelerated FFmpeg. Source files and authorized media are probed for codecs, trimmed, composited into spatial multi-stream layouts (Top Landscape, Split Vertical, Picture-in-Picture), audio mastered, and packaged for export.',
    },
    {
      q: 'How does YouTube account authorization work?',
      a: 'We use official Google OAuth 2.0. We request only the scopes required to fetch your channel profile and upload finalized master videos to your channel. Your credentials and tokens are secured on your private backend, and TubePilot AI never publishes without your explicit confirmation.',
    },
    {
      q: 'What video formats and aspect ratios are supported?',
      a: 'We support standard MP4, WebM, and MOV containers. You can render videos in 9:16 vertical (YouTube Shorts, Reels, TikTok), 16:9 widescreen (standard YouTube), 1:1 square, and 4:5 portrait aspect ratios.',
    },
    {
      q: 'Does TubePilot AI store my private video content permanently?',
      a: 'No. Temporary media files are kept in your local deployment working directory during processing and can be purged immediately. Your projects and publishing logs are retained in your private SQLite database under your complete control.',
    },
    {
      q: 'What are the hardware and compute requirements?',
      a: 'FFmpeg rendering utilizes your local CPU or cloud container resources. Processing times depend on duration and resolution; a typical 15-to-30-second Short composites in approximately 10 to 25 seconds.',
    },
  ];

  const agents = [
    {
      title: 'Project Planner Agent',
      desc: 'Interprets editing requirements, identifies missing assets, and produces a structured multi-step timeline manifest.',
      badge: 'Architecture',
    },
    {
      title: 'Media Analysis Agent',
      desc: 'Probes codecs, video resolution, framerates, audio loudness, and stream compatibility before rendering.',
      badge: 'Diagnostics',
    },
    {
      title: 'Transcript & Caption Agent',
      desc: 'Generates aligned timestamped subtitle cues and exports standard SubRip (.srt) and WebVTT (.vtt) files.',
      badge: 'Subtitles',
    },
    {
      title: 'Editing Agent',
      desc: 'Translates spatial filter graphs into timeline operations: trimming, cropping, split-screens, and volume mixing.',
      badge: 'Compositing',
    },
    {
      title: 'Quality Assurance Agent',
      desc: 'Inspects rendered video output for audio/video synchronization, frame corruption, and container compliance.',
      badge: 'Validation',
    },
    {
      title: 'Thumbnail & Metadata Agent',
      desc: 'Synthesizes high-performing titles, SEO descriptions, timestamped chapters, tags, and thumbnail concepts.',
      badge: 'Packaging',
    },
    {
      title: 'Publishing Agent',
      desc: 'Validates channel authorization and schedules publication directly via official YouTube Data API v3.',
      badge: 'Distribution',
    },
    {
      title: 'Workflow Supervisor Agent',
      desc: 'Coordinates agent task graphs, enforces deterministic states, manages retries, and requires human approval.',
      badge: 'Orchestration',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-black)' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '96px 24px 64px 24px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 14px',
            borderRadius: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-violet)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            TIE-IN PRODUCTION PIPELINE V3.0
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
            lineHeight: '1.05',
            marginBottom: '24px',
            letterSpacing: '-0.03em',
          }}
        >
          From Raw Footage to <br />
          <span className="text-gradient">Ready-to-Publish.</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 36px auto',
            lineHeight: '1.6',
          }}
        >
          TubePilot AI unites creators, editors, and producers with specialized autonomous agents that analyze footage, composite multi-stream layouts, generate synchronized captions, and publish directly to YouTube.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '64px',
          }}
        >
          <Link to="/app/new" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Sparkles size={18} /> Start Creating
          </Link>
          <Link to="/how-it-works" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Explore How It Works <ArrowRight size={16} />
          </Link>
        </div>

        {/* 2. Interactive Product Workspace Preview */}
        <div
          className="studio-card-elevated"
          style={{
            maxWidth: '1060px',
            margin: '0 auto',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--surface-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                TubePilot Studio / Multi-Stream Live Canvas
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {(['top_landscape', 'split_vertical', 'pip'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setPreviewLayout(l)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: previewLayout === l ? 'var(--accent-violet)' : 'var(--border-subtle)',
                    background: previewLayout === l ? 'rgba(139, 92, 246, 0.2)' : 'var(--surface-secondary)',
                    color: previewLayout === l ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {l === 'top_landscape' ? 'Top Landscape' : l === 'split_vertical' ? 'Split Vertical' : 'Picture-in-Picture'}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Simulation Area */}
          <div
            style={{
              padding: '32px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            {/* Visual Canvas Viewport */}
            <div
              style={{
                background: '#000000',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                aspectRatio: '9 / 16',
                maxHeight: '420px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 0 30px rgba(0,0,0,0.9)',
                width: '100%',
                maxWidth: '240px',
              }}
            >
              {previewLayout === 'top_landscape' ? (
                <>
                  <div style={{ flex: 1, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #374151', color: '#9CA3AF', fontSize: '0.8rem', flexDirection: 'column', gap: '4px' }}>
                    <Video size={20} color="#8B5CF6" />
                    <span>Stream 1 (16:9 Landscape)</span>
                  </div>
                  <div style={{ flex: 1, background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.8rem', flexDirection: 'column', gap: '4px' }}>
                    <Video size={20} color="#3B82F6" />
                    <span>Stream 2 (Crop Reaction)</span>
                  </div>
                </>
              ) : previewLayout === 'split_vertical' ? (
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{ flex: 1, background: '#111827', borderRight: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.75rem', textAlign: 'center', padding: '8px' }}>
                    Left Stream (50%)
                  </div>
                  <div style={{ flex: 1, background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.75rem', textAlign: 'center', padding: '8px' }}>
                    Right Stream (50%)
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', height: '100%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.8rem' }}>
                  <span>Base Background Stream</span>
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '38%', height: '30%', background: '#1F2937', border: '1px solid var(--accent-violet)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4B5FD', fontSize: '0.65rem' }}>
                    PiP Stream
                  </div>
                </div>
              )}

              {/* Subtitle Overlay Mock */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.8)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Auto-Synchronized Captions (.srt)
              </div>
            </div>

            {/* Pipeline State Display */}
            <div>
              <div className="badge badge-violet" style={{ marginBottom: '12px' }}>
                <Cpu size={12} /> Autonomous Agent Flow
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>
                Real-Time Multi-Stream Compositing
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                Configure primary and reaction streams, balance volume levels, and export in vertical 9:16 Shorts format with synchronized subtitles and chapter metadata.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EDEDED' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Hardware-accelerated spatial filter graph</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EDEDED' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Automated multi-language SubRip (.srt) captions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EDEDED' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Quality Assurance verification before export</span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <Link to="/app" className="btn-primary" style={{ fontSize: '0.88rem' }}>
                  Open Studio Canvas <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 5-Step Production Workflow */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>
            Deterministic 5-Step Production Pipeline
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            From media ingestion to certified YouTube publication, every step is coordinated by specialized agents.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            { step: '01', title: 'Upload & Ingest', desc: 'Upload raw video footage or reference authorized media streams.' },
            { step: '02', title: 'Analyze & Plan', desc: 'Media Analyst checks codecs and Project Planner forms structured manifest.' },
            { step: '03', title: 'Edit & Master', desc: 'Editing Agent executes spatial multi-stream compositing and audio ducking.' },
            { step: '04', title: 'Review & QA', desc: 'Inspect interactive video preview, edit captions, and verify quality score.' },
            { step: '05', title: 'Publish to YouTube', desc: 'Confirm metadata and upload directly via official YouTube Data API v3.' },
          ].map((item) => (
            <div key={item.step} className="studio-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-violet)', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Specialized Autonomous AI Agents Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '12px' }}>
            Specialized Architecture
          </div>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>
            8 Specialized Autonomous AI Agents
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '680px', margin: '0 auto' }}>
            Instead of an unpredictable general-purpose model, TubePilot AI orchestrates dedicated agents with bounded responsibilities and schema validation.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {agents.map((agent, i) => (
            <div key={i} className="studio-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-neutral">{agent.badge}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Agent 0{i + 1}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{agent.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
                {agent.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Trust, Security, & YouTube Compliance Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="studio-card"
          style={{
            padding: '48px 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="badge badge-emerald" style={{ marginBottom: '12px' }}>
              <Shield size={12} /> Security & Integrity First
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
              Designed for Privacy & Compliance
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
              TubePilot AI respects Google API Services User Data Policy. All OAuth tokens and client secrets remain strictly on your private backend. We never access your Google account without permission, and never execute irreversible actions without explicit human approval.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/privacy-policy" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                Read Privacy Policy
              </Link>
              <Link to="/terms-of-use" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                Terms of Use
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { title: 'Least-Privilege Scopes', desc: 'Only requested for reading channel profile and authorized video uploading.' },
              { title: 'Zero Plaintext Key Exposure', desc: 'Client secrets and refresh tokens are managed securely in backend environment variables.' },
              { title: 'Full Content Ownership', desc: 'You retain complete ownership over all source media and generated video output.' },
              { title: 'Instant Account Disconnection', desc: 'Revoke and clear stored OAuth tokens with a single click at any time.' },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--surface-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '4px' }}>
                  {p.title}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pricing Section (Realistic based on actual capabilities) */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge badge-neutral" style={{ marginBottom: '12px' }}>
            Transparent Compute
          </div>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>
            Compute Tiers & Render Quotas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Choose the plan that fits your production volume. All tiers include full access to the 8 autonomous agents.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '1020px',
            margin: '0 auto',
          }}
        >
          {[
            {
              name: 'Creator Starter',
              price: '$0',
              period: '/ month',
              desc: 'Ideal for testing autonomous workflows and daily YouTube Shorts editing.',
              features: [
                'Up to 15 renders / month',
                '720p and 1080p master export',
                'Top Landscape & Split Vertical layouts',
                'SubRip (.srt) caption generation',
                'Manual YouTube export & upload',
              ],
              cta: 'Start with Free Tier',
              primary: false,
            },
            {
              name: 'Studio Pro',
              price: '$29',
              period: '/ month',
              desc: 'For active creators producing daily multi-stream content and Shorts.',
              features: [
                'Unlimited local rendering',
                '1080p 60fps export quality',
                'All 6 layout & PiP composites',
                'Automated YouTube publishing',
                'Full 8 Autonomous Agent orchestration',
                'Timestamped chapter generation',
              ],
              cta: 'Launch Studio Pro',
              primary: true,
            },
            {
              name: 'Production Team',
              price: '$79',
              period: '/ month',
              desc: 'For multi-channel creator teams requiring priority compute and storage.',
              features: [
                'Multi-channel YouTube management',
                'Custom branding & overlay templates',
                'Persistent cloud project storage',
                'Publishing calendar automation',
                'Priority background job queue',
              ],
              cta: 'Contact Studio Sales',
              primary: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={plan.primary ? 'studio-card-elevated' : 'studio-card'}
              style={{
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                border: plan.primary ? '1px solid var(--accent-violet)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{plan.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  {plan.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Outfit', sans-serif" }}>
                  {plan.price}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1, fontSize: '0.88rem' }}>
                {plan.features.map((feat, f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EDEDED' }}>
                    <CheckCircle2 size={16} color="var(--accent-violet)" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/app"
                className={plan.primary ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', textAlign: 'center' }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '64px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real answers regarding technical operations, YouTube authorization, and data privacy.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="studio-card"
              style={{
                padding: '18px 24px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>{faq.q}</h3>
                <ChevronRight
                  size={18}
                  color="var(--text-muted)"
                  style={{
                    transform: activeFaq === i ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>
              {activeFaq === i && (
                <div style={{ marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
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
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 24px 96px 24px',
        }}
      >
        <div
          className="studio-card-elevated"
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #0D0D0D 0%, #080808 100%)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
            Ready to Accelerate Your YouTube Production?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            Join creators who use TubePilot AI to analyze, crop, master, caption, and distribute videos seamlessly.
          </p>
          <Link to="/app" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Launch Studio Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};
