import React from 'react';

// CSS/SVG doctor illustration for Auth left panel
export default function DoctorIllustration() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Platform */}
      <div style={{ position: 'relative' }}>
        {/* Doctor body — CSS only */}
        <div style={{ fontSize: '7rem', filter: 'drop-shadow(0 8px 24px rgba(139,92,246,0.3))',
          animation: 'float 4s ease-in-out infinite' }}>
          👨‍⚕️
        </div>
        {/* Floating platform */}
        <div style={{
          width: 120, height: 20, background: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
          borderRadius: '50%', margin: '0 auto',
          boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
          animation: 'float 4s ease-in-out infinite',
          animationDelay: '0.2s'
        }} />
      </div>
      {/* Health badge floating near doctor */}
      <div style={{
        background: 'white', borderRadius: 12, padding: '8px 16px',
        boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)',
        display: 'flex', alignItems: 'center', gap: 8,
        animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s',
        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)'
      }}>
        <span style={{ color: '#10B981', fontSize: '1rem' }}>✓</span>
        Health Score: 92/100
      </div>
    </div>
  );
}
