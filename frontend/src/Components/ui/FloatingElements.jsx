import React from 'react';

// Decorative floating medical objects — used on Landing and Auth pages
export default function FloatingElements({ variant = 'landing' }) {
  const elements = variant === 'landing' ? [
    { emoji: '💊', size: 44, top: '12%', left: '8%', delay: '0s',   opacity: 0.7 },
    { emoji: '💊', size: 32, top: '70%', left: '5%', delay: '1.2s', opacity: 0.5 },
    { emoji: '🧬', size: 40, top: '20%', right: '5%',delay: '0.6s', opacity: 0.6 },
    { emoji: '✚',  size: 28, top: '75%', right: '8%',delay: '1.8s', opacity: 0.4 },
    { emoji: '❤️', size: 36, top: '50%', left: '3%', delay: '2.4s', opacity: 0.5 },
  ] : [
    { emoji: '💊', size: 40, top: '15%', right: '10%', delay: '0s',   opacity: 0.6 },
    { emoji: '💊', size: 28, bottom: '20%', left: '8%',delay: '1s',   opacity: 0.45 },
    { emoji: '✚',  size: 32, top: '60%', right: '6%', delay: '0.5s', opacity: 0.5 },
    { emoji: '🧬', size: 36, bottom: '35%',right: '12%',delay:'1.5s', opacity: 0.4 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {elements.map((el, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: el.top, left: el.left, right: el.right, bottom: el.bottom,
          fontSize: el.size, opacity: el.opacity,
          animation: `${i % 2 === 0 ? 'float' : 'float-reverse'} ${3 + i * 0.4}s ease-in-out infinite`,
          animationDelay: el.delay,
          filter: 'drop-shadow(0 4px 8px rgba(139,92,246,0.2))',
        }}>
          {el.emoji}
        </div>
      ))}
    </div>
  );
}
