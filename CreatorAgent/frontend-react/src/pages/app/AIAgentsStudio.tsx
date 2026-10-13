import React, { useState } from 'react';
import {
  Bot,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  FileCode,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Subtitles,
  Share2,
  FileText,
  Clock,
} from 'lucide-react';

interface AgentCardInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  tools: string[];
  permissions: string;
  status: 'Ready' | 'Active' | 'Standby';
}

const AGENTS: AgentCardInfo[] = [
  {
    id: 'planner',
    name: 'Project Planner Agent',
    category: 'Architecture & Orchestration',
    description: 'Interprets natural language editing requirements, validates durations and aspect ratios, and outputs structured execution manifests with step-by-step timeline operations.',
    tools: ['RequirementParser', 'DurationEstimator', 'ManifestValidator'],
    permissions: 'Read briefs, write plan manifests',
    status: 'Ready',
  },
  {
    id: 'analyzer',
    name: 'Media Analysis Agent',
    category: 'Computer Vision & Audio Diagnostics',
    description: 'Inspects authorized source footage, probes video container streams with FFprobe, extracts audio channels, and identifies scene boundaries and silence periods.',
    tools: ['FFprobeInspector', 'SilenceDetector', 'ResolutionValidator'],
    permissions: 'Read media files, execute read-only probe filters',
    status: 'Ready',
  },
  {
    id: 'transcriber',
    name: 'Transcript and Caption Agent',
    category: 'Speech & Subtitles',
    description: 'Transcribes speech, aligns word timestamps, detects natural sentence pauses, and formats synchronized SRT and WebVTT caption tracks.',
    tools: ['SpeechTranscriber', 'TimestampAligner', 'SRTFormatter', 'VTTFormatter'],
    permissions: 'Read audio streams, write subtitle manifests',
    status: 'Ready',
  },
  {
    id: 'editor',
    name: 'Editing Engine Agent',
    category: 'FFmpeg Compositing',
    description: 'Executes the approved editing manifest by compiling complex FFmpeg filtergraphs for multi-video layout, scale/crop, picture-in-picture, volume ducking, and MP4 muxing.',
    tools: ['FilterGraphBuilder', 'FFmpegRenderer', 'AudioMixer'],
    permissions: 'Execute sandboxed FFmpeg processes within scratch directory',
    status: 'Ready',
  },
  {
    id: 'qa',
    name: 'Quality Assurance Agent',
    category: 'Integrity & Verification',
    description: 'Verifies rendered video container integrity, validates duration against the brief, computes audio/video synchronization confidence, and flags visual artifacts.',
    tools: ['ContainerVerifier', 'SyncAuditor', 'FrameIntegrityChecker'],
    permissions: 'Read output MP4, generate QA scorecards',
    status: 'Ready',
  },
  {
    id: 'metadata',
    name: 'Thumbnail and Metadata Agent',
    category: 'Publishing Optimization',
    description: 'Analyzes project context and transcript to generate high-CTR titles, structured descriptions, timestamped YouTube chapters, thumbnail visual briefs, and SEO hashtags.',
    tools: ['TitleGenerator', 'ChapterFormatter', 'HashtagSuggester'],
    permissions: 'Read transcript, write publishing metadata',
    status: 'Ready',
  },
  {
    id: 'publisher',
    name: 'Publishing Agent',
    category: 'YouTube API Integration',
    description: 'Validates upload payload against YouTube Data API v3 requirements, checks OAuth tokens, verifies channel permissions, and uploads videos only upon explicit human confirmation.',
    tools: ['YouTubeUploader', 'PrivacyEnforcer', 'TokenManager'],
    permissions: 'OAuth YouTube API v3 authenticated upload',
    status: 'Ready',
  },
  {
    id: 'supervisor',
    name: 'Workflow Supervisor Agent',
    category: 'Deterministic Coordinator',
    description: 'Monitors the deterministic state graph, tracks job transitions, halts on policy or QA failures, manages bounded retries, and maintains durable job state in SQLite.',
    tools: ['StateGraphEngine', 'RetryPolicyManager', 'AuditLogger'],
    permissions: 'Global workflow state management & SQLite writes',
    status: 'Ready',
  },
];

export const AIAgentsStudio: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentCardInfo>(AGENTS[0]);
  const [testLog, setTestLog] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);

  const handleRunAgentDiagnostic = (agent: AgentCardInfo) => {
    setIsRunningTest(true);
    setTestLog(null);
    setTimeout(() => {
      setTestLog(
        `[${new Date().toISOString()}] INITIALIZING ${agent.name.toUpperCase()}\n` +
        `> Scope: ${agent.category}\n` +
        `> Tools bound: ${agent.tools.join(', ')}\n` +
        `> Sandbox directory: CreatorAgent/data/scratch/\n` +
        `> Policy check: Enforced least-privilege permissions (${agent.permissions})\n` +
        `> Health check: 200 OK — Ready for pipeline dispatch.\n`
      );
      setIsRunningTest(false);
    }, 600);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
          <Bot size={12} /> Autonomous Production Fleet
        </div>
        <h1 style={{ fontSize: '2rem', color: '#FFFFFF', marginBottom: '8px' }}>AI Agents Studio</h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
          TubePilot AI coordinates 8 specialized autonomous agents across a deterministic state graph. Each agent operates with strictly scoped permissions and validated schemas.
        </p>
      </div>

      {/* State Graph Visual Pipeline */}
      <div className="studio-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} style={{ color: 'var(--accent-violet)' }} /> Deterministic Production Pipeline
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '12px', paddingBottom: '8px' }}>
          {[
            { step: '1', title: 'Plan', agent: 'Planner' },
            { step: '2', title: 'Analyze', agent: 'Analyzer' },
            { step: '3', title: 'Transcribe', agent: 'Transcriber' },
            { step: '4', title: 'Edit', agent: 'Editor' },
            { step: '5', title: 'Verify', agent: 'QA' },
            { step: '6', title: 'Package', agent: 'Metadata' },
            { step: '7', title: 'Publish', agent: 'Publisher' },
          ].map((item, i) => (
            <React.Fragment key={item.step}>
              <div
                style={{
                  minWidth: '110px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-violet)', fontWeight: 700, marginBottom: '2px' }}>
                  STEP 0{item.step}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>{item.title}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.agent} Agent</div>
              </div>
              {i < 6 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Agents Grid and Selected Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(340px, 1fr)', gap: '24px' }}>
        {/* Agent Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {AGENTS.map((agent) => {
            const isSelected = selectedAgent.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="studio-card"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: `1px solid ${isSelected ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                  backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface-1)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-violet)',
                      }}
                    >
                      <Bot size={18} />
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{agent.status}</span>
                  </div>

                  <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '4px' }}>{agent.name}</h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>{agent.category}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    {agent.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{agent.tools.length} Scoped Tools</span>
                  <span style={{ color: isSelected ? 'var(--accent-violet)' : 'inherit', fontWeight: 600 }}>
                    {isSelected ? 'Inspecting' : 'Inspect →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Inspector Panel */}
        <div className="studio-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <div>
            <div className="badge badge-violet" style={{ marginBottom: '8px' }}>Selected Agent</div>
            <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '4px' }}>{selectedAgent.name}</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>{selectedAgent.category}</div>
          </div>

          <div>
            <label className="input-label">Scoped Tools</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedAgent.tools.map((tool) => (
                <span key={tool} className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Security & Permissions</label>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              {selectedAgent.permissions}
            </div>
          </div>

          <button
            onClick={() => handleRunAgentDiagnostic(selectedAgent)}
            disabled={isRunningTest}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isRunningTest ? <Zap size={16} className="spin" /> : <Play size={16} />}
            Run Agent Diagnostic
          </button>

          {testLog && (
            <div style={{ backgroundColor: '#000000', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <pre style={{ margin: 0, fontSize: '0.74rem', color: 'var(--accent-emerald)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {testLog}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
