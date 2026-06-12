import React from 'react';

export default function AuroraBackground({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', background: 'var(--bg-page)' }}>
       <div style={{
         position: 'fixed', top: '-10%', left: '-10%', width: '40vw', height: '40vw',
         background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
         borderRadius: '50%', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite',
         pointerEvents: 'none'
       }} />
       <div style={{
         position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw',
         background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
         borderRadius: '50%', filter: 'blur(80px)', animation: 'float-reverse 10s ease-in-out infinite',
         pointerEvents: 'none'
       }} />
       <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
         {children}
       </div>
    </div>
  );
}
