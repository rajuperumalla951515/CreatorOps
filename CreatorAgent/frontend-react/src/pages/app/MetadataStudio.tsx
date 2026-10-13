import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Bot,
  Hash,
  FileText,
} from 'lucide-react';

export const MetadataStudio: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [format, setFormat] = useState<string>('Shorts');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generated state
  const [titles, setTitles] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const generateMetadataForTopic = (targetTopic: string) => {
    const cleanTopic = targetTopic.trim() || 'Autonomous AI Video Production Workflow';
    const tagBase = cleanTopic
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => '#' + w.replace(/[^a-zA-Z0-9]/g, ''))
      .filter((w) => w.length > 2);

    setTitles([
      `How ${cleanTopic} is Done Autonomously in 2026 (TubePilot)`,
      `The 8 AI Agents Behind ${cleanTopic} 🤖`,
      `I Automated ${cleanTopic} with TubePilot AI`,
      `Stop Doing ${cleanTopic} Manually: Studio Breakdown`,
    ]);

    setDescription(
      `Turn raw footage into polished, publish-ready videos with TubePilot AI — your autonomous multi-agent video studio.\n\n` +
      `Topic Focus: ${cleanTopic}\n` +
      `Format Target: ${format}\n\n` +
      `TIMESTAMPS:\n` +
      `0:00 Introduction & Vision\n` +
      `0:15 Autonomous Multi-Agent Orchestration\n` +
      `0:45 Multi-Stream Timeline & Compositing\n` +
      `1:15 YouTube Publishing & QA Verification\n\n` +
      `🔗 Explore TubePilot AI: https://tubepilot.ai\n` +
      `#TubePilot #VideoEditing #AIAgents ${tagBase.join(' ')}`
    );

    setHashtags([
      '#TubePilot',
      '#AIVideoEditing',
      '#YouTubeAutomation',
      '#CreatorEconomy',
      '#Shorts',
      ...tagBase,
    ]);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateMetadataForTopic(topic);
      setIsGenerating(false);
    }, 500);
  };

  const handleLoadSample = () => {
    const sample = 'Autonomous AI Video Studio Production Workflow';
    setTopic(sample);
    generateMetadataForTopic(sample);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>Metadata & Chapters Studio</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Generate high-CTR titles, structured SEO descriptions, real timestamped chapters, and viral hashtags.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isGenerating ? <Bot size={16} className="spin" /> : <Sparkles size={16} />}
          {titles.length > 0 ? 'Regenerate Metadata' : 'Generate Metadata'}
        </button>
      </div>

      {/* Input Brief */}
      <div className="studio-card" style={{ padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 200px', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Video Core Topic or Brief</label>
              <button
                type="button"
                onClick={handleLoadSample}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
              >
                + Sample Topic
              </button>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. How Autonomous AI Agents Produce Full YouTube Videos"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
            />
          </div>
          <div>
            <label className="input-label">Target Format</label>
            <select
              className="input-field"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="Shorts">YouTube Shorts (9:16)</option>
              <option value="LongForm">Long-Form Video (16:9)</option>
              <option value="Tutorial">Deep-Dive Tutorial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results View */}
      {titles.length === 0 ? (
        <div
          className="studio-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <Sparkles size={36} style={{ color: 'var(--accent-violet)', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', margin: 0 }}>No Metadata Generated Yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: 0 }}>
            Type your video topic in the field above or click <strong style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={handleLoadSample}>+ Sample Topic</strong>, then hit <strong>Generate Metadata</strong>.
          </p>
        </div>
      ) : (
        /* Grid: Titles & Descriptions */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 1fr)', gap: '24px' }}>
          {/* Left Column: Title Variants & Hashtags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* High CTR Titles */}
            <div className="studio-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-violet)' }} /> High-CTR Title Options
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {titles.map((titleText, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>{titleText}</span>
                    <button
                      onClick={() => handleCopy(titleText, `title-${idx}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px', flexShrink: 0 }}
                    >
                      {copiedField === `title-${idx}` ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="studio-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Hash size={18} style={{ color: 'var(--accent-cyan)' }} /> SEO & Discovery Hashtags
                </h3>
                <button
                  onClick={() => handleCopy(hashtags.join(' '), 'hashtags')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copiedField === 'hashtags' ? <Check size={14} /> : <Copy size={14} />} Copy All
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleCopy(tag, tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Structured YouTube Description */}
          <div className="studio-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--accent-emerald)' }} /> YouTube Description & Chapters
              </h3>
              <button
                onClick={() => handleCopy(description, 'desc')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedField === 'desc' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />} Copy Description
              </button>
            </div>

            <textarea
              className="input-field"
              rows={16}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ fontSize: '0.85rem', lineHeight: '1.6', flex: 1, resize: 'vertical' }}
            />

            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Includes required timestamps compliant with YouTube automatic chapter navigation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
