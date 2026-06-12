import React from 'react';

// Cute AI robot for Dashboard AI Insight card
export default function RobotIllustration({ size = 80 }) {
  return (
    <div style={{ display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #EDE8FF, #F0EBFF)',
        border: '2px solid var(--border-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.55, boxShadow: 'var(--shadow-card)',
        animation: 'pulse-glow 2.5s ease-in-out infinite'
      }}>
        🤖
      </div>
    </div>
  );
}
