import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  PlusCircle,
  Film,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  Subtitles,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { CardSkeleton } from '../../components/skeletons';
import type { Project } from '../../services/api';

export const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video project? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Could not delete project: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>My Video Projects</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Manage your autonomous editing pipelines, draft videos, and published YouTube creations.
          </p>
        </div>

        <Link to="/app/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={16} /> New Project
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search projects by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'draft', 'planned', 'ready', 'published'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${statusFilter === st ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                backgroundColor: statusFilter === st ? 'rgba(124, 58, 237, 0.15)' : 'var(--bg-surface-2)',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredProjects.length === 0 ? (
        <div className="studio-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FolderKanban size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '8px' }}>No projects found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Start your first autonomous video project now.'}
          </p>
          <Link to="/app/new" className="btn btn-primary btn-sm">
            Create Project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="studio-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className={`badge badge-${project.status === 'published' ? 'emerald' : project.status === 'ready' ? 'cyan' : 'violet'}`}>
                    {project.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {project.aspect_ratio} • {project.video_format}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '8px' }}>{project.title}</h3>

                {project.instructions && (
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {project.instructions}
                  </p>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', marginBottom: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Target: {project.target_duration}s</span>
                  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to="/app/studio"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}
                  >
                    <Film size={14} /> Open Studio
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 10px', color: '#EF4444' }}
                    title="Delete Project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
