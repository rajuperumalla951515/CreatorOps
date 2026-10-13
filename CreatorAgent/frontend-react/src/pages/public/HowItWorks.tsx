import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Video, Sparkles, Layers, ShieldCheck, Upload } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload Original Footage or Authorized Media',
      desc: 'Drag and drop your raw MP4, WebM, or MOV video clips directly into TubePilot AI. Or import authorized streams with automated format probing.',
      details: ['Validates resolution, duration, and audio streams automatically', 'Local storage sandbox prevents cross-project leakage'],
    },
    {
      num: '02',
      title: 'Specify Format, Layout & Natural Language Directives',
      desc: 'Select your target aspect ratio (9:16 Shorts, 16:9 Widescreen), pick a spatial layout (Top Landscape, Split Vertical, PiP), and describe pacing and segments in plain text.',
      details: ['AI Project Planner generates a structured execution plan before rendering', 'Review time trims, crop settings, and audio levels upfront'],
    },
    {
      num: '03',
      title: 'Autonomous Compositing & Audio Mastering',
      desc: 'The Editing Agent and FFmpeg engine execute the spatial filter matrix. The audio engine ducks background soundtrack levels when spoken commentary is detected.',
      details: ['Deterministic FFmpeg commands with hardware acceleration', 'Background background job queue prevents HTTP connection dropouts'],
    },
    {
      num: '04',
      title: 'Quality Assurance & Synchronized Captions',
      desc: 'The QA Agent inspects the exported video to guarantee video/audio sync, while the Transcriber formats synchronized SubRip (.srt) and WebVTT (.vtt) subtitle tracks.',
      details: ['Quality certification score awarded before publishing', 'Download full SRT and VTT files for YouTube Studio'],
    },
    {
      num: '05',
      title: 'Review & Publish to YouTube with Human Approval',
      desc: 'Review the finalized video in the interactive player. Inspect suggested titles, descriptions, and chapters. When satisfied, explicitly confirm publication to your authorized YouTube channel.',
      details: ['Official YouTube Data API v3 upload integration', 'Support for Public, Unlisted, or Private distribution'],
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            Workflow Walkthrough
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            How TubePilot AI Produces <br />
            <span className="text-gradient">Publish-Ready Content.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            A transparent breakdown of each stage in our autonomous video production process.
          </p>
        </div>

        {/* Steps Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '64px' }}>
          {steps.map((step) => (
            <div
              key={step.num}
              className="studio-card"
              style={{
                padding: '36px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '28px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--accent-violet)',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {step.num}
              </div>

              <div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{step.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '16px' }}>
                  {step.desc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {step.details.map((d, dIdx) => (
                    <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#EDEDED' }}>
                      <CheckCircle2 size={15} color="#10B981" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="studio-card-elevated" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Start Your First Production</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            No complex video editing software needed. Start in the browser with TubePilot AI.
          </p>
          <Link to="/app/new" className="btn-primary" style={{ padding: '12px 28px' }}>
            Launch Studio Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
