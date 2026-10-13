import React from 'react';

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 3, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ height: '16px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '35%' }}></div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-3)' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ height: '24px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '4px', width: '65%' }}></div>
            <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '50%' }}></div>
          </div>
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '25%' }}></div>
            <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '25%' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
