import React from 'react';

// Pure CSS 3D phone mockup with mini dashboard inside
export default function PhoneMockup() {
  return (
    <div style={{
      perspective: '800px',
      display: 'flex', justifyContent: 'center',
      animation: 'float 5s ease-in-out infinite'
    }}>
      <div style={{
        width: 220, minHeight: 400,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F6FF 100%)',
        borderRadius: 36,
        border: '8px solid rgba(139,92,246,0.15)',
        boxShadow: `
          0 32px 64px rgba(139,92,246,0.2),
          0 8px 24px rgba(0,0,0,0.08),
          inset 0 1px 0 rgba(255,255,255,0.9)
        `,
        padding: '12px 10px',
        transform: 'rotateX(4deg) rotateY(-6deg)',
        transformStyle: 'preserve-3d',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Notch */}
        <div style={{
          width: 60, height: 10, background: 'rgba(139,92,246,0.15)',
          borderRadius: 9999, margin: '0 auto 10px',
        }} />
        {/* Greeting */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Good Morning, Sumit 👋
          </p>
          <p style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
            Here's your health overview for today
          </p>
        </div>
        {/* Notification badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 12, height: 12, borderRadius: '50%',
          background: '#EF4444', fontSize: '0.5rem', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
        }}>1</div>
        {/* Health score */}
        <div style={{
          background: 'rgba(139,92,246,0.06)', borderRadius: 12,
          padding: '10px', marginBottom: 8
        }}>
          <p style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>Health Score</p>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            92<span style={{ fontSize: '0.625rem', fontWeight: 500 }}>/100</span>
          </p>
          <span style={{ fontSize: '0.5rem', background: '#ECFDF5', color: '#059669',
            padding: '1px 6px', borderRadius: 9999, fontWeight: 600 }}>Excellent</span>
        </div>
        {/* 3 mini buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[['💊','Medicines','3 Today'], ['💬','AI Chat','Ask Anything'], ['🔔','Reminders','5 Pending']].map(([icon, label, sub]) => (
            <div key={label} style={{
              flex: 1, background: '#F9F7FF', borderRadius: 10,
              padding: '6px 2px', textAlign: 'center',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ fontSize: '1rem' }}>{icon}</div>
              <p style={{ fontSize: '0.5rem', fontWeight: 600, color: 'var(--text-heading)' }}>{label}</p>
              <p style={{ fontSize: '0.4375rem', color: 'var(--text-muted)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
