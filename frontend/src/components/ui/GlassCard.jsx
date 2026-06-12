import React from 'react';

// Reusable wrapper component — use everywhere instead of plain <div>
export default function GlassCard({ children, className = '', hover = true, onClick }) {
  return (
    <div
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{ padding: '24px' }}
    >
      {children}
    </div>
  );
}
