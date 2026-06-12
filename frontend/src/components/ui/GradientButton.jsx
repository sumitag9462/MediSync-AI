import React from 'react';

export default function GradientButton({ children, onClick, type = 'button',
  fullWidth = false, size = 'md', variant = 'primary', icon }) {
  const sizes = {
    sm: { padding: '8px 18px', fontSize: '0.875rem' },
    md: { padding: '12px 28px', fontSize: '0.9375rem' },
    lg: { padding: '15px 36px', fontSize: '1rem' }
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={variant === 'primary' ? 'btn-primary' : 'btn-ghost'}
      style={{ width: fullWidth ? '100%' : 'auto', justifyContent: 'center', ...sizes[size] }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
