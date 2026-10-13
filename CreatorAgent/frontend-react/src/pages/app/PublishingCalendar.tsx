import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  format: 'Short' | 'Long-Form';
  status: 'published' | 'scheduled' | 'draft';
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Autonomous Editing Architecture Breakdown',
    date: '2026-10-14',
    time: '14:00',
    format: 'Long-Form',
    status: 'scheduled',
  },
  {
    id: 'e2',
    title: 'How to Reframe Widescreen into 9:16 Shorts Fast',
    date: '2026-10-16',
    time: '18:00',
    format: 'Short',
    status: 'scheduled',
  },
  {
    id: 'e3',
    title: 'The Future of AI Video Production Studios',
    date: '2026-10-12',
    time: '12:00',
    format: 'Short',
    status: 'published',
  },
];

export const PublishingCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  const filteredEvents = events.filter((e) => selectedFormat === 'all' || e.format === selectedFormat);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>Publishing Calendar</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Plan, organize, and monitor your scheduled YouTube video releases and publishing cadence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'Short', 'Long-Form'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${selectedFormat === fmt ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                backgroundColor: selectedFormat === fmt ? 'rgba(124, 58, 237, 0.15)' : 'var(--bg-surface-2)',
                color: selectedFormat === fmt ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {fmt === 'all' ? 'All Formats' : fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Schedule View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '24px' }}>
        {/* Events Schedule Cards */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} style={{ color: 'var(--accent-violet)' }} /> Scheduled Releases
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-violet)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>{new Date(event.date).getDate()}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>{event.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <Clock size={12} /> {event.time} UTC • {event.format}
                    </div>
                  </div>
                </div>

                <span className={`badge badge-${event.status === 'published' ? 'emerald' : event.status === 'scheduled' ? 'cyan' : 'violet'}`} style={{ textTransform: 'capitalize' }}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cadence & Strategy Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="studio-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-emerald)' }} /> Creator Publishing Rhythm
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Consistency is the single highest predictor of YouTube algorithm momentum. TubePilot AI enables batch autonomous production of weekly Shorts and long-form releases.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Weekly Target</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>3 Shorts + 1 Long-Form</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Best Posting Window</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>14:00 – 18:00 UTC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
