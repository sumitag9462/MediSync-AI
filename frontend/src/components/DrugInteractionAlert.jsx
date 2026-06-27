import React from 'react';
import { AlertTriangle, CheckCircle, Info, ChevronDown, ExternalLink } from 'lucide-react';

const severityConfig = {
    high:     { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'High Risk' },
    moderate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Moderate' },
    low:      { color: '#ca8a04', bg: '#fefce8', border: '#fef08a', label: 'Low' },
};

const SeverityBadge = ({ severity }) => {
    const cfg = severityConfig[severity?.toLowerCase()] || severityConfig.low;
    return (
        <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`
        }}>
            {cfg.label}
        </span>
    );
};

const InteractionCard = ({ interaction }) => {
    const [expanded, setExpanded] = React.useState(false);
    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
            <div
                onClick={() => setExpanded(e => !e)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', background: '#fafafa' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={16} color="#d97706" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                        {interaction.drug1} ↔ {interaction.drug2}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SeverityBadge severity={interaction.severity} />
                    <ChevronDown size={14} color="#94a3b8" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
            </div>
            {expanded && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
                    <p style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
                        <strong style={{ color: '#1e293b' }}>What happens: </strong>{interaction.description}
                    </p>
                    <p style={{ fontSize: 13, color: '#475569' }}>
                        <strong style={{ color: '#1e293b' }}>What to do: </strong>{interaction.recommendation}
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * DrugInteractionAlert component
 * Props: { interactions, safe, summary, loading }
 */
const DrugInteractionAlert = ({ interactions = [], safe = true, summary = '', loading = false }) => {
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginTop: 8 }}>
                <div style={{ width: 16, height: 16, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 13, color: '#64748b' }}>Checking FDA database...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (safe && interactions.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: 8 }}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                    {summary || 'No known interactions found.'}
                </span>
            </div>
        );
    }

    const highestSeverity = interactions.reduce((acc, i) => {
        const rank = { high: 3, moderate: 2, low: 1 };
        return (rank[i.severity?.toLowerCase()] || 0) > (rank[acc] || 0) ? i.severity?.toLowerCase() : acc;
    }, 'low');

    const bannerCfg = severityConfig[highestSeverity] || severityConfig.low;

    return (
        <div style={{ marginTop: 8 }}>
            {/* Summary Banner */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: bannerCfg.bg, border: `1px solid ${bannerCfg.border}`, marginBottom: 8 }}>
                <AlertTriangle size={16} color={bannerCfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: bannerCfg.color, fontWeight: 600, lineHeight: 1.5 }}>{summary}</p>
            </div>

            {/* Interaction Cards */}
            {interactions.map((interaction, i) => (
                <InteractionCard key={i} interaction={interaction} />
            ))}

            {/* FDA Source Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <Info size={12} color="#94a3b8" />
                <a href="https://open.fda.gov" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                    Source: U.S. Food & Drug Administration (OpenFDA) <ExternalLink size={10} />
                </a>
            </div>
        </div>
    );
};

export default DrugInteractionAlert;
