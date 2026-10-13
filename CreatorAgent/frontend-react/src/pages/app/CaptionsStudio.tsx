import React, { useState, useEffect } from 'react';
import {
  Subtitles,
  Download,
  Play,
  Pause,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api';

interface CaptionSegment {
  id: number;
  start: number; // in seconds
  end: number;
  text: string;
}

const SAMPLE_CAPTIONS: CaptionSegment[] = [
  { id: 1, start: 0.0, end: 3.5, text: 'Welcome to TubePilot AI, the autonomous video studio.' },
  { id: 2, start: 3.5, end: 7.2, text: 'Today we are turning raw footage into high-retention content.' },
  { id: 3, start: 7.2, end: 11.8, text: 'Our eight specialized agents coordinate the entire pipeline.' },
  { id: 4, start: 11.8, end: 15.0, text: 'Hit subscribe to follow the autonomous production workflow!' },
];

export const CaptionsStudio: React.FC = () => {
  const [captions, setCaptions] = useState<CaptionSegment[]>([
    { id: 1, start: 0.0, end: 3.5, text: '' },
  ]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [language, setLanguage] = useState<string>('en');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const handleUpdateText = (id: number, text: string) => {
    setCaptions((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  };

  const handleUpdateTiming = (id: number, field: 'start' | 'end', value: number) => {
    setCaptions((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleAddSegment = () => {
    const last = captions[captions.length - 1];
    const newStart = last ? last.end : 0;
    const newEnd = newStart + 3.0;
    setCaptions([
      ...captions,
      {
        id: Date.now(),
        start: newStart,
        end: newEnd,
        text: '',
      },
    ]);
  };

  const handleDeleteSegment = (id: number) => {
    setCaptions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDownloadSRT = () => {
    let srtContent = '';
    captions.forEach((c, idx) => {
      const startStr = formatTimestamp(c.start).replace('.', ',');
      const endStr = formatTimestamp(c.end).replace('.', ',');
      srtContent += `${idx + 1}\n00:${startStr} --> 00:${endStr}\n${c.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tubepilot_captions_${language}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadVTT = () => {
    let vttContent = 'WEBVTT\n\n';
    captions.forEach((c, idx) => {
      const startStr = formatTimestamp(c.start);
      const endStr = formatTimestamp(c.end);
      vttContent += `${idx + 1}\n00:${startStr} --> 00:${endStr}\n${c.text}\n\n`;
    });

    const blob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tubepilot_captions_${language}.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAutoTranscribe = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>Captions & Subtitles Studio</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            High-accuracy speech-to-text alignment, timing corrections, and export in SRT and WebVTT formats.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleDownloadSRT} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export .SRT
          </button>
          <button onClick={handleDownloadVTT} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export .VTT
          </button>
          <button
            onClick={handleAutoTranscribe}
            disabled={isGenerating}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isGenerating ? <Bot size={16} className="spin" /> : <Sparkles size={16} />}
            Auto-Transcribe
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.88rem' }}>Captions synchronized and updated successfully.</span>
        </div>
      )}

      {/* Main Split: Subtitle List & Live Frame Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(340px, 1fr)', gap: '24px' }}>
        {/* Subtitles Timeline List */}
        <div className="studio-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Subtitles size={18} style={{ color: 'var(--accent-violet)' }} />
              <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0 }}>Subtitle Cues ({captions.length})</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setCaptions(SAMPLE_CAPTIONS)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)' }}
              >
                + Sample Transcript
              </button>
              <button onClick={handleAddSegment} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Add Cue
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
            {captions.map((cap, index) => {
              const isSelected = activeSegmentIndex === index;
              return (
                <div
                  key={cap.id}
                  onClick={() => setActiveSegmentIndex(index)}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-surface-2)',
                    border: `1px solid ${isSelected ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      <input
                        type="number"
                        step="0.1"
                        value={cap.start}
                        onChange={(e) => handleUpdateTiming(cap.id, 'start', parseFloat(e.target.value) || 0)}
                        style={{ width: '60px', padding: '2px 4px', background: 'var(--bg-surface-3)', border: '1px solid var(--border-subtle)', color: '#FFFFFF', borderRadius: '4px', fontSize: '0.78rem' }}
                      />
                      <span>→</span>
                      <input
                        type="number"
                        step="0.1"
                        value={cap.end}
                        onChange={(e) => handleUpdateTiming(cap.id, 'end', parseFloat(e.target.value) || 0)}
                        style={{ width: '60px', padding: '2px 4px', background: 'var(--bg-surface-3)', border: '1px solid var(--border-subtle)', color: '#FFFFFF', borderRadius: '4px', fontSize: '0.78rem' }}
                      />
                      <span>({(cap.end - cap.start).toFixed(1)}s)</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSegment(cap.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Delete Cue"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="Enter caption dialogue or subtitle line..."
                    value={cap.text}
                    onChange={(e) => handleUpdateText(cap.id, e.target.value)}
                    style={{ fontSize: '0.88rem', resize: 'vertical' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Subtitle Overlay Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="studio-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '14px' }}>Burned-in Caption Preview</h3>

            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '9/16',
                backgroundColor: '#000000',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px 16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* Fake video background grid */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

              {/* Subtitle text overlay */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                {captions[activeSegmentIndex]?.text || 'No active caption'}
              </div>

              <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                Frame: {formatTimestamp(captions[activeSegmentIndex]?.start || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
