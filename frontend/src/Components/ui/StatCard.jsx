import React from 'react';

// KPI stat card used in Dashboard top row
export default function StatCard({ label, value, unit, icon, color, trend, trendUp }) {
  const colorMap = {
    green:  { bg: '#ECFDF5', text: '#059669' },
    purple: { bg: '#F5F3FF', text: '#7C3AED' },
    amber:  { bg: '#FFFBEB', text: '#D97706' },
    cyan:   { bg: '#ECFEFF', text: '#0891B2' },
    orange: { bg: '#FFF7ED', text: '#EA580C' },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="glass-card" style={{ padding: '20px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>
            {label}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1 }}>
              {value}
            </span>
            {unit && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>}
          </div>
          {trend && (
            <p style={{ fontSize: '0.75rem', color: trendUp ? '#059669' : '#EF4444',
              fontWeight: 500, marginTop: 4 }}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%',
          background: c.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
