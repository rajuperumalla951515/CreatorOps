import React from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Layers,
  Cpu,
  Subtitles,
  Upload,
  Calendar,
  Sparkles,
  Shield,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Volume2,
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureGroups = [
    {
      category: 'Spatial Video Compositing',
      items: [
        {
          title: '6 Dynamic Layout Architecture Presets',
          desc: 'Seamlessly render Top Landscape, Bottom Landscape, Split Vertical, Side-by-Side, Single Focus, or Picture-in-Picture reactions.',
          icon: Layers,
        },
        {
          title: 'Custom Coordinate Drag & Rule-of-Thirds Cropping',
          desc: 'Interactive 3x3 crop frames with 8-point handles, instant center coordinates, and zoom percentage controls.',
          icon: Maximize2,
        },
        {
          title: 'Hardware-Accelerated FFmpeg Pipeline',
          desc: 'Deterministic spatial filter graph executing dual-stream resizing, aspect scaling, and multi-channel synchronization.',
          icon: Cpu,
        },
      ],
    },
    {
      category: 'Autonomous Audio & Captions',
      items: [
        {
          title: 'Multi-Track Audio Synthesis & Ducking',
          desc: 'Independent volume controls for primary audio, reaction mic, and background soundtrack ducking.',
          icon: Volume2,
        },
        {
          title: 'Synchronized WebVTT & SubRip (.srt) Export',
          desc: 'Generate aligned subtitle cues with millisecond precision, ready for direct upload to YouTube Studio.',
          icon: Subtitles,
        },
        {
          title: 'Quality Assurance Frame Inspection',
          desc: 'Automated frame-level QA inspection verifying audio/video sync, aspect consistency, and file integrity score.',
          icon: Shield,
        },
      ],
    },
    {
      category: 'YouTube Studio Distribution',
      items: [
        {
          title: 'Official Google OAuth 2.0 Integration',
          desc: 'Secure least-privilege token management with backend isolation and instant one-click disconnection.',
          icon: Shield,
        },
        {
          title: 'SEO Titles, Descriptions & Real Chapters',
          desc: 'Synthesize high-converting title options and timestamped video chapters derived from actual media duration.',
          icon: Sparkles,
        },
        {
          title: 'Publishing Calendar & Quota Tracking',
          desc: 'Schedule upcoming video drops, monitor historical uploads, and track quota limits with human confirmation.',
          icon: Calendar,
        },
      ],
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            Production Capabilities
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            Engineered for High-Velocity <br />
            <span className="text-gradient">YouTube Video Production.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Explore the comprehensive toolset built into CreatorOps — designed to replace fragmented editing utilities with a unified autonomous studio.
          </p>
        </div>

        {/* Feature Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', marginBottom: '80px' }}>
          {featureGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                {group.category}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {group.items.map((feat, fIdx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={fIdx} className="studio-card" style={{ padding: '28px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(139, 92, 246, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        <Icon size={20} color="var(--accent-violet)" />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{feat.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {feat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="studio-card-elevated" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Experience CreatorOps in Action</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Open the studio canvas and composite your first dual-stream video in seconds.
          </p>
          <Link to="/app" className="btn-primary" style={{ padding: '12px 28px' }}>
            Launch Studio Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
