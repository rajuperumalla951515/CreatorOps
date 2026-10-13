import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Film,
  Bot,
  Subtitles,
  Sparkles,
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
  Activity,
  Layers,
  Calendar,
  Zap,
} from 'lucide-react';
import { YouTubeIcon } from '../../components/YouTubeIcon';
import { CardSkeleton, TableSkeleton } from '../../components/skeletons';
import { api } from '../../services/api';
import type { Project, YtProfile, ProcessingJob } from '../../services/api';

export const DashboardOverview: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [ytProfile, setYtProfile] = useState<YtProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [projList, jobList, profile] = await Promise.all([
        api.getProjects().catch(() => []),
        api.getJobs().catch(() => []),
        api.getYoutubeProfile().catch(() => null),
      ]);
      setProjects(projList);
      setJobs(jobList);
      setYtProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Studio Banner */}
      <div
        className="studio-card"
        style={{
          padding: '32px',
          marginBottom: '32px',
          background: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15), transparent 70%), var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '12px' }}>
            <Bot size={12} /> Autonomous Studio Active
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFFFFF', marginBottom: '8px' }}>
            Welcome to TubePilot AI
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            Your 8 specialized autonomous agents are primed. Turn raw footage and authorized feeds into high-retention, YouTube-optimized video packages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/app/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={16} /> New AI Project
          </Link>
          <Link to="/app/studio" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Film size={16} /> Open Studio
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {loading ? (
        <CardSkeleton count={4} className="mb-8" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="studio-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Studio Projects</span>
              <Layers size={18} style={{ color: 'var(--accent-violet)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF' }}>{projects.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {projects.filter((p) => p.status === 'published').length} published to YouTube
            </div>
          </div>

          <div className="studio-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Autonomous Agents</span>
              <Bot size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF' }}>8 Active</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
              Deterministic state graph ready
            </div>
          </div>

          <div className="studio-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rendering Queue</span>
              <Activity size={18} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF' }}>
              {jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {jobs.filter((j) => j.status === 'completed').length} completed total
            </div>
          </div>

          <div className="studio-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Connected Channel</span>
              <YouTubeIcon size={18} style={{ color: '#EF4444' }} />
            </div>
            {ytProfile ? (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ytProfile.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  {ytProfile.subscriber_count} subscribers
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Not Connected</div>
                <Link to="/app/accounts" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                  Authorize via Google OAuth →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Launchpad Grid */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '16px' }}>Studio Launchpad</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <Link
            to="/app/new"
            className="studio-card"
            style={{
              padding: '20px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(124, 58, 237, 0.15)', color: 'var(--accent-violet)' }}>
                <PlusCircle size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0 }}>Plan New Video</h3>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Describe editing requirements in natural language and generate structured production manifests.
            </p>
          </Link>

          <Link
            to="/app/studio"
            className="studio-card"
            style={{
              padding: '20px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                <Film size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0 }}>Multi-Track Studio</h3>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Interactive rule-of-thirds reframing, layout splits, audio mixing, and FFmpeg compositing.
            </p>
          </Link>

          <Link
            to="/app/captions"
            className="studio-card"
            style={{
              padding: '20px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                <Subtitles size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0 }}>Captions & Subtitles</h3>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              High-accuracy speech transcription, word-level alignment, and instant SRT / VTT export.
            </p>
          </Link>

          <Link
            to="/app/metadata"
            className="studio-card"
            style={{
              padding: '20px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0 }}>Metadata & Chapters</h3>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Generate high-CTR titles, SEO descriptions, timestamped chapters, and viral hashtags.
            </p>
          </Link>
        </div>
      </div>

      {/* Split Section: Recent Projects & Active Agent Jobs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '24px' }}>
        {/* Recent Projects Table / List */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>Recent Projects</h3>
            <Link to="/app/projects" style={{ fontSize: '0.85rem', color: 'var(--accent-violet)', textDecoration: 'none' }}>
              View All ({projects.length}) →
            </Link>
          </div>

          {loading ? (
            <TableSkeleton rows={4} columns={3} />
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Film size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No projects created yet.</p>
              <Link to="/app/new" className="btn btn-secondary btn-sm" style={{ marginTop: '12px', display: 'inline-block' }}>
                Create First Project
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-violet)',
                      }}
                    >
                      <Film size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>{project.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {project.aspect_ratio} • {project.video_format}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge badge-${project.status === 'published' ? 'emerald' : project.status === 'ready' ? 'cyan' : 'violet'}`}>
                      {project.status}
                    </span>
                    <Link
                      to="/app/studio"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Autonomous Agents Fleet Status */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>Agent Fleet Status</h3>
            <Link to="/app/agents" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}>
              Agent Console →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: 'Workflow Supervisor', role: 'Deterministic coordinator', status: 'Ready' },
              { name: 'Project Planner', role: 'Structured requirements', status: 'Ready' },
              { name: 'Media Analysis', role: 'FFprobe scene diagnostics', status: 'Ready' },
              { name: 'Transcript & Caption', role: 'SRT/VTT alignment', status: 'Ready' },
              { name: 'Editing Engine', role: 'FFmpeg filtergraph compositing', status: 'Ready' },
              { name: 'Quality Assurance', role: 'Audio/Video sync & integrity', status: 'Ready' },
              { name: 'Thumbnail & Metadata', role: 'Chapters & description', status: 'Ready' },
              { name: 'Publishing Agent', role: 'YouTube Data API v3 upload', status: 'Ready' },
            ].map((agent, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-surface-2)',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 500 }}>{agent.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{agent.role}</div>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
