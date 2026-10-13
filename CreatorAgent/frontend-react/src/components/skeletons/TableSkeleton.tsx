import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width: '100%',
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface-2)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '14px',
              backgroundColor: 'var(--bg-surface-3)',
              borderRadius: '4px',
              width: '80px',
            }}
          ></div>
        ))}
      </div>
      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            style={{
              padding: '16px 20px',
              borderBottom: rIdx < rows - 1 ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-3)',
                  flexShrink: 0,
                }}
              ></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, maxWidth: '280px' }}>
                <div style={{ height: '14px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '75%' }}></div>
                <div style={{ height: '10px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '4px', width: '50%' }}></div>
              </div>
            </div>
            <div style={{ height: '12px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '90px' }}></div>
            <div style={{ height: '22px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '12px', width: '70px' }}></div>
            <div style={{ height: '14px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '4px', width: '60px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
