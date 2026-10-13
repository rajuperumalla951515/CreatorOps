import React, { useState, useEffect } from 'react';
import {
  History,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  StopCircle,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/skeletons';
import type { ProcessingJob } from '../../services/api';

export const JobHistory: React.FC = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (id: string) => {
    setCancellingId(id);
    try {
      await api.cancelJob(id);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: 'failed', error_message: 'Cancelled by creator' } : j))
      );
    } catch (err: any) {
      alert(`Could not cancel job: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>Autonomous Job History</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Durable SQLite execution logs for background FFmpeg compositing, AI planning, and transcription jobs.
          </p>
        </div>

        <button
          onClick={loadJobs}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh History
        </button>
      </div>

      {/* Main Split: Job List & Log Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(340px, 1fr)', gap: '24px' }}>
        {/* Jobs List */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '16px' }}>Execution Queue</h3>

          {loading ? (
            <TableSkeleton rows={4} columns={3} />
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <History size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>No processing jobs recorded.</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>Render a video in the Studio to dispatch a job.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-surface-2)',
                      border: `1px solid ${isSelected ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', textTransform: 'capitalize' }}>
                          {job.job_type.replace('_', ' ')}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          #{job.id.slice(0, 8)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {job.progress_pct}% complete • {new Date(job.created_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge badge-${job.status === 'completed' ? 'emerald' : job.status === 'failed' ? 'violet' : 'blue'}`}>
                        {job.status}
                      </span>
                      {(job.status === 'processing' || job.status === 'queued') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelJob(job.id);
                          }}
                          disabled={cancellingId === job.id}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#EF4444' }}
                          title="Cancel Job"
                        >
                          <StopCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Job Inspector */}
        <div className="studio-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--accent-cyan)' }} /> Execution Inspector
          </h3>

          {selectedJob ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job ID</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#FFFFFF' }}>{selectedJob.id}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status & Progress</span>
                <div style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>
                  {selectedJob.status.toUpperCase()} ({selectedJob.progress_pct}%)
                </div>
              </div>

              {selectedJob.error_message && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>Error Diagnostics</span>
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#EF4444' }}>
                    {selectedJob.error_message}
                  </div>
                </div>
              )}

              {selectedJob.log && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Console Logs</span>
                  <div style={{ backgroundColor: '#000000', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '0.72rem', color: 'var(--accent-emerald)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {selectedJob.log}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select a job from the queue to view execution logs and metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
