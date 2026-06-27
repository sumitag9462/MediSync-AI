import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { adherenceService } from '../services/adherenceService';

const AdherenceHeatmap = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await adherenceService.getYearlyAdherence();
                setData(result.data || []);
            } catch (error) {
                console.error('Error fetching adherence data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const classForValue = (value) => {
        if (!value || value.value === -1) return 'color-empty';
        if (value.value === 0) return 'color-missed';
        if (value.value === 1) return 'color-partial';
        if (value.value === 2) return 'color-full';
        return 'color-empty';
    };

    const tooltipDataAttrs = (value) => {
        if (!value || !value.date) return null;
        const dateStr = new Date(value.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let label = `${dateStr} — No data`;
        if (value.total > 0) {
            label = `${dateStr} — ${value.taken}/${value.total} doses taken`;
        }
        return { 'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': label };
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-card, #e5e7eb)' }}>
                <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-pulse" style={{ width: '100%', height: '100px', borderRadius: '8px', background: '#f1f5f9' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-card, #e5e7eb)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading, #1e293b)', marginBottom: '16px' }}>
                📊 Adherence Timeline
            </h3>

            <style>{`
                .react-calendar-heatmap .color-empty { fill: #e2e8f0; }
                .react-calendar-heatmap .color-missed { fill: #fca5a5; }
                .react-calendar-heatmap .color-partial { fill: #fcd34d; }
                .react-calendar-heatmap .color-full { fill: #86efac; }
                .react-calendar-heatmap text { font-size: 8px; fill: #94a3b8; }
            `}</style>

            <CalendarHeatmap
                startDate={oneYearAgo}
                endDate={today}
                values={data}
                classForValue={classForValue}
                tooltipDataAttrs={tooltipDataAttrs}
                showWeekdayLabels
                gutterSize={3}
            />
            <Tooltip id="heatmap-tooltip" />

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center', fontSize: '11px', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#e2e8f0', display: 'inline-block' }} /> No data
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#fca5a5', display: 'inline-block' }} /> Missed
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#fcd34d', display: 'inline-block' }} /> Partial
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#86efac', display: 'inline-block' }} /> Full
                </span>
            </div>
        </div>
    );
};

export default AdherenceHeatmap;
