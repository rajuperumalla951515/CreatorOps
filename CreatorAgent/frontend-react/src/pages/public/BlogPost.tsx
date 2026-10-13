import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Share2 } from 'lucide-react';
import { BLOG_POSTS } from './Blog';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          to="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '32px',
          }}
        >
          <ArrowLeft size={16} /> Back to Creator Engineering Hub
        </Link>

        {/* Article Header */}
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span className="badge badge-violet">{post.category}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {post.readTime}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: '1.2', marginBottom: '20px' }}>
            {post.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '24px',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> {post.author}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {post.date}
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }
              }}
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
              }}
            >
              <Share2 size={13} /> Share Article
            </button>
          </div>
        </header>

        {/* Article Body */}
        <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#D4D4D8' }}>
          {post.content.map((paragraph, idx) => (
            <p key={idx} style={{ marginBottom: '24px' }}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Author Bio Card */}
        <div
          className="studio-card"
          style={{
            marginTop: '64px',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            TP
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', color: '#FFFFFF' }}>{post.author}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              The TubePilot AI engineering and creator strategy team focuses on multi-agent video orchestration, FFmpeg performance optimization, and responsible YouTube distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
