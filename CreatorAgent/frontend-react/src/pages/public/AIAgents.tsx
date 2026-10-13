import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  ShieldCheck,
  FileText,
  Sliders,
  CheckCircle2,
  Subtitles,
  Upload,
  Workflow,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AIAgents: React.FC = () => {
  const agents = [
    {
      name: 'Project Planner Agent',
      role: 'Requirements Analysis & Timeline Manifest',
      desc: 'Interprets natural language editing requirements, identifies missing source assets, and formats an executable multi-step timeline manifest with realistic duration and compute estimations.',
      tools: ['Natural Language Parser', 'Asset Dependency Graph', 'Resource Duration Calculator'],
    },
    {
      name: 'Media Analysis Agent',
      role: 'Codec Probing & Quality Assurance Diagnostics',
      desc: 'Inspects authorized source media using FFprobe. Extracts exact dimensions, framerate, audio tracks, and color space, and flags format anomalies or potential audio clipping before rendering begins.',
      tools: ['FFprobe Metadata Extractor', 'Codec Compatibility Checker', 'Audio Channel Inspector'],
    },
    {
      name: 'Transcript & Caption Agent',
      role: 'Speech Alignment & Subtitle Generation',
      desc: 'Transcribes spoken dialog and aligns timestamps into synchronized subtitle cues. Generates valid, downloadable SubRip (.srt) and WebVTT (.vtt) files with multi-language export support.',
      tools: ['Timestamp Segment Aligner', 'SRT / WebVTT Formatter', 'Punctuation & Grammar Normalizer'],
    },
    {
      name: 'Editing Agent',
      role: 'Spatial Layout Compositing & Audio Mastering',
      desc: 'Executes the approved timeline operations into hardware-accelerated FFmpeg commands. Performs spatial matrix transforms (Top Landscape, Split Vertical, PiP), trimming, and multi-track audio mixing.',
      tools: ['FFmpeg Spatial Filter Graph', 'Audio Ducking Synthesizer', 'Timeline Segment Slicer'],
    },
    {
      name: 'Quality Assurance (QA) Agent',
      role: 'Post-Render Inspection & Integrity Certification',
      desc: 'Performs frame-level inspection on the exported master video. Checks audio/video synchronization, verifies file integrity, validates duration constraints, and awards an objective quality certification score.',
      tools: ['Stream Synchronization Auditor', 'Frame Corruption Detector', 'QA Score Generator'],
    },
    {
      name: 'Thumbnail & Metadata Agent',
      role: 'Packaging, Real Chapters & SEO Optimization',
      desc: 'Formulates high-converting YouTube titles, structured descriptions with actual timestamped chapters, search tags, and thumbnail visual concepts without sensational clickbait or keyword stuffing.',
      tools: ['SEO Title Synthesizer', 'Timestamped Chapter Generator', 'Thumbnail Layout Architect'],
    },
    {
      name: 'Publishing Agent',
      role: 'Channel Authorization & Distribution',
      desc: 'Prepares official YouTube Data API v3 upload payloads, checks channel authorization, and enforces explicit human-in-the-loop approval before executing irreversible publishing or scheduling actions.',
      tools: ['YouTube Data API v3 Client', 'Upload Quota Monitor', 'Human Confirmation Validator'],
    },
    {
      name: 'Workflow Supervisor Agent',
      role: 'Orchestration, Retries & Safety Boundaries',
      desc: 'Maintains deterministic state graph across all specialized agents. Coordinates task dependencies, manages bounded retries for transient issues, and halts immediately on policy or authorization failures.',
      tools: ['Deterministic State Machine', 'Bounded Retry Engine', 'Durable Job State Store'],
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            Multi-Agent Architecture
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            Meet the 8 Specialized <br />
            <span className="text-gradient">Autonomous AI Agents.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
            Instead of a single black-box model attempting every task, TubePilot AI employs an orchestrated hierarchy of specialized agents with narrow scopes and deterministic validation.
          </p>
        </div>

        {/* Workflow State Machine Banner */}
        <div className="studio-card" style={{ padding: '32px', marginBottom: '64px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-violet)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
            <Workflow size={16} /> DETERMINISTIC STATE GRAPH
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {['Planning', 'Analysis', 'Compositing', 'Transcription', 'QA Audit', 'Metadata', 'Publishing'].map((st, i, arr) => (
              <React.Fragment key={st}>
                <div style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '8px', color: '#FFFFFF' }}>
                  {st}
                </div>
                {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)' }}>➔</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Agents Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '80px',
          }}
        >
          {agents.map((agent, idx) => (
            <div key={idx} className="studio-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-violet">Agent 0{idx + 1}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  ACTIVE
                </span>
              </div>

              <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{agent.name}</h2>
              <div style={{ color: 'var(--accent-blue)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '16px' }}>
                {agent.role}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', flex: 1, marginBottom: '20px' }}>
                {agent.desc}
              </p>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tools & Capabilities:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {agent.tools.map((t, tIdx) => (
                    <span key={tIdx} style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#EDEDED' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="studio-card-elevated" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Deploy Autonomous Agents to Your Workflow</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Start creating your first project and watch the specialized agents coordinate your production.
          </p>
          <Link to="/app/new" className="btn-primary" style={{ padding: '12px 28px' }}>
            Create New Project <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
