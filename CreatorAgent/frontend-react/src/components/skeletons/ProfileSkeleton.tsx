import React from 'react';

interface ProfileSkeletonProps {
  className?: string;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-3)',
              border: '2px solid var(--border-subtle)',
            }}
          ></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '20px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '4px', width: '180px' }}></div>
            <div style={{ height: '14px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '120px' }}></div>
            <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '150px' }}></div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: '36px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '8px', width: '120px' }}></div>
          <div style={{ height: '36px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px', width: '140px' }}></div>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          paddingTop: '24px',
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-surface-2)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '60%' }}></div>
            <div style={{ height: '20px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '45%' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkeleton;
