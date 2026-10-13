import React from 'react';

interface VideoPreviewSkeletonProps {
  className?: string;
}

export const VideoPreviewSkeleton: React.FC<VideoPreviewSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Video Viewport Skeleton */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          minHeight: '260px',
          backgroundColor: 'var(--bg-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '14px solid var(--border-muted)',
              marginLeft: '3px',
            }}
          ></div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '3px', width: '70%' }}></div>
          <div style={{ height: '10px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '3px', width: '48px' }}></div>
        </div>
      </div>

      {/* Video Metadata / Controls Skeleton */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ height: '22px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '4px', width: '80%' }}></div>
          <div style={{ height: '14px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '50%' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '100%' }}></div>
          <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '90%' }}></div>
          <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '75%' }}></div>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
          <div style={{ height: '36px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '8px', flex: 1 }}></div>
          <div style={{ height: '36px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px', width: '100px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewSkeleton;
