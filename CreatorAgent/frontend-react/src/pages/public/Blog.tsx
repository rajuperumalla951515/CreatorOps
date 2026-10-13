import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';

export interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  content: string[];
}

export const BLOG_POSTS: BlogPostData[] = [
  {
    slug: 'ai-assisted-video-editing-modern-workflow',
    title: 'AI-Assisted Video Editing: The Modern Workflow for High-Velocity Creators',
    excerpt: 'How specialized autonomous agents and deterministic media pipelines are replacing manual trimming and timeline assembly.',
    category: 'Workflows',
    readTime: '6 min read',
    date: 'October 10, 2026',
    author: 'TubePilot Editorial Team',
    content: [
      'The modern digital media landscape demands that content creators publish at frequencies that were unthinkable five years ago. However, traditional non-linear video editing software was designed for manual, frame-by-frame assembly rather than high-velocity multi-stream publishing.',
      'Autonomous video production does not mean handing creative control to a single black-box AI model that produces hallucinations. Rather, it means breaking video production into deterministic, specialized agent stages: media analysis, spatial compositing, speech-to-subtitle alignment, and quality assurance.',
      'By separating audio ducking, spatial filter transformations, and metadata generation into specialized tools, creators can maintain 100% editorial oversight while reducing production bottlenecks from hours to seconds.',
      'In this article, we explore how deterministic pipelines ensure that every frame rendered is verified for synchronization, aspect ratio compliance, and audio clarity before it ever reaches YouTube.',
    ],
  },
  {
    slug: 'optimizing-youtube-shorts-spatial-compositing',
    title: 'Optimizing YouTube Shorts: Spatial Compositing, Aspect Ratios, and Retention',
    excerpt: 'A technical guide to dual-stream split layouts, top landscape framing, and the rule-of-thirds in 9:16 vertical feeds.',
    category: 'Video Strategy',
    readTime: '5 min read',
    date: 'October 08, 2026',
    author: 'Video Production Team',
    content: [
      'Vertical 9:16 video has become the dominant surface for audience discovery across YouTube Shorts, Instagram Reels, and TikTok. However, converting horizontal 16:9 gameplay, podcasts, or commentary into vertical media presents unique spatial challenges.',
      'Simple center-cropping frequently crops out crucial visual context, while letterboxing leaves two-thirds of the mobile viewport unutilized. The solution is spatial multi-stream compositing.',
      'By placing the primary horizontal stream in the top half of the frame and anchoring an expressive reaction crop or secondary camera angle below it, creators maximize viewer immersion without sacrificing resolution.',
      'Our tests show that maintaining consistent focal coordinates and displaying synchronized captions directly in the center-third of the screen increases average percentage viewed (APV) by over 42%.',
    ],
  },
  {
    slug: 'science-of-subtitles-synchronized-captions',
    title: 'The Science of Subtitles: Why Synchronized Captions Double Video Retention',
    excerpt: 'Why over 75% of mobile viewers watch with sound muted, and how automated SubRip (.srt) cues drive algorithmic engagement.',
    category: 'Audience Retention',
    readTime: '4 min read',
    date: 'October 04, 2026',
    author: 'Creator Insights Lab',
    content: [
      'Mobile user behavior analytics consistently indicate that a significant majority of short-form video consumption occurs with audio muted or in sound-sensitive environments.',
      'Videos without prominent, synchronized subtitles suffer immediate drop-offs within the critical first three seconds. Synchronized captions serve as both visual anchors and cognitive bridges that maintain viewer retention through pacing transitions.',
      'Furthermore, providing valid SubRip (.srt) and WebVTT (.vtt) caption tracks directly to YouTube Studio provides search engine crawlers with semantic text signals that enhance discoverability without resorting to keyword stuffing.',
      'In TubePilot AI, the Transcript & Caption Agent automatically formats timestamped cues with millisecond precision, allowing creators to export cleanly formatted subtitles alongside their master renders.',
    ],
  },
  {
    slug: 'automating-youtube-distribution-oauth-metadata',
    title: 'Automating YouTube Distribution: Responsible OAuth Workflows and Metadata Optimization',
    excerpt: 'Best practices for Google OAuth 2.0 security, least-privilege token storage, and generating timestamped chapters.',
    category: 'Distribution & API',
    readTime: '7 min read',
    date: 'September 28, 2026',
    author: 'Platform Architecture Team',
    content: [
      'Automated distribution is the final frontier in autonomous creator workflows. However, connecting third-party platforms to your YouTube channel requires rigorous adherence to security and privacy standards.',
      'Under the Google API Services User Data Policy, applications must request only least-privilege scopes and store refresh tokens encrypted on private backends. User credentials should never be exposed in client-side bundles or public repositories.',
      'Additionally, YouTube Data API v3 enforces daily quota limits. Production systems must implement client-side validation and human confirmation gates to prevent accidental quota exhaustion or duplicate uploads.',
      'Proper metadata hygiene—including concise, accurate titles and real timestamped chapters—signals authentic content to the recommendation algorithm while protecting creators from misleading clickbait penalties.',
    ],
  },
];

export const Blog: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            Creator Engineering Hub
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            Insights, Guides & <br />
            <span className="text-gradient">Video Production Architecture.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            Original articles written by our engineering team on AI agent workflows, spatial compositing, and YouTube audience optimization.
          </p>
        </div>

        {/* Articles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="studio-card"
              style={{
                padding: '36px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span className="badge badge-neutral">{post.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {post.date}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {post.readTime}
                </span>
              </div>

              <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', lineHeight: '1.3' }}>
                <Link
                  to={`/blog/${post.slug}`}
                  style={{ color: '#FFFFFF', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-violet)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                >
                  {post.title}
                </Link>
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                {post.excerpt}
              </p>

              <Link
                to={`/blog/${post.slug}`}
                style={{
                  color: 'var(--accent-violet)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Read Complete Article <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
