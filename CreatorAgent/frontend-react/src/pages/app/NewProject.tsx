import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Film,
  Sparkles,
  Bot,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Sliders,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import type { AgentPlan } from '../../services/api';

export const NewProject: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('9:16');
  const [videoFormat, setVideoFormat] = useState<string>('short');
  const [instructions, setInstructions] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [targetDuration, setTargetDuration] = useState<number>(60);
  const [pacing, setPacing] = useState<string>('fast');
  const [captionsWanted, setCaptionsWanted] = useState<boolean>(true);

  // Execution & Planning State
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<AgentPlan | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanning(true);
    setPlanError(null);

    try {
      // 1. Create Project in DB
      const project = await api.createProject({
        title,
        aspect_ratio: aspectRatio,
        video_format: videoFormat,
        instructions,
        target_duration: targetDuration,
        metadata: {
          source_url: sourceUrl,
          pacing,
          captions_wanted: captionsWanted,
        },
      });

      setCreatedProjectId(project.id);

      // 2. Run Project Planner Agent
      const plan = await api.generateProjectPlan(project.id, {
        instructions,
        target_duration: targetDuration,
        aspect_ratio: aspectRatio,
        video_format: videoFormat,
        pacing,
        captions: captionsWanted,
      });

      setGeneratedPlan(plan);
    } catch (err: any) {
      setPlanError(err.message || 'Failed to initialize project or generate plan. Verify backend.');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleApprovePlan = () => {
    // Navigate to studio workspace
    navigate('/app/studio');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-violet" style={{ marginBottom: '12px' }}>
          <Bot size={12} /> Autonomous Video Planner
        </div>
        <h1 style={{ fontSize: '2rem', color: '#FFFFFF', marginBottom: '8px' }}>Create New Video Project</h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
          Specify your vision, footage sources, and creative requirements. The Project Planner Agent will synthesize a structured execution manifest before rendering.
        </p>
      </div>

      {!generatedPlan ? (
        <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Project Identity */}
          <div className="studio-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--accent-violet)' }} /> 1. Project Specifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Project Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Autonomous Creator Master"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Video Format Preset</label>
                  <select
                    className="input-field"
                    value={videoFormat}
                    onChange={(e) => {
                      setVideoFormat(e.target.value);
                      if (e.target.value === 'short') setAspectRatio('9:16');
                      else if (e.target.value === 'long_form') setAspectRatio('16:9');
                    }}
                  >
                    <option value="short">YouTube Short (Vertical 9:16)</option>
                    <option value="long_form">YouTube Long-Form (16:9 Widescreen)</option>
                    <option value="commentary">Commentary / Reaction (Split Screen)</option>
                    <option value="tutorial">Technical Tutorial / Screencast</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Target Aspect Ratio</label>
                  <select
                    className="input-field"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                  >
                    <option value="9:16">9:16 (Vertical Mobile)</option>
                    <option value="16:9">16:9 (Desktop Landscape)</option>
                    <option value="1:1">1:1 (Square Feed)</option>
                    <option value="4:5">4:5 (Portrait Feed)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Media Source Input */}
          <div className="studio-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Film size={18} style={{ color: 'var(--accent-cyan)' }} /> 2. Source Footage
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="input-label" style={{ margin: 0 }}>Source Video URL (YouTube, MP4, or WebM)</label>
                  <button
                    type="button"
                    onClick={() => setSourceUrl('https://www.youtube.com/watch?v=jNQXAC9IVRw')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    + Try Sample Video
                  </button>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Authorized media will be analyzed by the Media Analysis Agent for audio levels, speech segments, and scene cuts.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Target Duration (Seconds)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(parseInt(e.target.value) || 30)}
                    min={5}
                    max={3600}
                  />
                </div>

                <div>
                  <label className="input-label">Editing Pacing</label>
                  <select
                    className="input-field"
                    value={pacing}
                    onChange={(e) => setPacing(e.target.value)}
                  >
                    <option value="fast">Fast (High Retention Cuts)</option>
                    <option value="balanced">Balanced (Natural Conversation)</option>
                    <option value="slow">Relaxed (Documentary Style)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Natural Language Instructions */}
          <div className="studio-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#F59E0B' }} /> 3. Natural Language Editing Brief
            </h3>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ margin: 0 }}>Instructions for Autonomous Agents</label>
                <button
                  type="button"
                  onClick={() => setInstructions('Cut dead air, highlight key punchlines, reframe main subject to center, generate animated captions, and prepare for YouTube Shorts.')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-violet)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                >
                  + Sample Instructions
                </button>
              </div>
              <textarea
                className="input-field"
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g. Cut dead air, auto-reframe main speaker, add burned-in animated subtitles, insert lower-third titles..."
                required
              />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="captionsCheck"
                checked={captionsWanted}
                onChange={(e) => setCaptionsWanted(e.target.checked)}
                style={{ accentColor: 'var(--accent-violet)', width: '16px', height: '16px' }}
              />
              <label htmlFor="captionsCheck" style={{ fontSize: '0.88rem', color: '#FFFFFF', cursor: 'pointer' }}>
                Include synchronized captions track and subtitle manifest
              </label>
            </div>
          </div>

          {planError && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '8px' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.85rem' }}>{planError}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPlanning}
            style={{ padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {isPlanning ? (
              <>
                <Bot size={18} className="spin" /> Synthesizing Autonomous Plan...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Autonomous Plan
              </>
            )}
          </button>
        </form>
      ) : (
        /* Step 4: Review Autonomous Plan */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="studio-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--accent-emerald)' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: 0 }}>Autonomous Editing Plan Synthesized</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Structured execution manifest prepared by ProjectPlannerAgent
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Intended Output</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>{generatedPlan.intended_output}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Duration</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>{generatedPlan.target_duration_seconds}s</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Processing</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {generatedPlan.estimated_resources?.estimated_render_seconds || 15}s FFmpeg
                </div>
              </div>
            </div>
          </div>

          {/* Planned Operations */}
          <div className="studio-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '16px' }}>Planned Timeline Operations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {generatedPlan.operations.map((op, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-2)',
                    fontSize: '0.88rem',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(124, 58, 237, 0.2)',
                      color: 'var(--accent-violet)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {op.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#FFFFFF', textTransform: 'capitalize' }}>{op.type}: </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{op.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={handleApprovePlan}
              className="btn btn-primary"
              style={{ flex: 1, padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <Check size={18} /> Approve Plan & Open Studio Workspace
            </button>
            <button
              onClick={() => setGeneratedPlan(null)}
              className="btn btn-secondary"
              style={{ padding: '14px 24px' }}
            >
              Revise Brief
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
