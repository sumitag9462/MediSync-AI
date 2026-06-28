import React, { useState, useEffect } from 'react';
import { healthApi } from '../api/healthApi';
import { ShieldAlert, Info } from 'lucide-react';

const PredictionAlert = () => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const res = await healthApi.getPredictions();
                setPrediction(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrediction();
    }, []);

    if (loading || !prediction || prediction.riskScore === 0) return null;

    const getColor = (label) => {
        if (label === 'High') return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '#ef4444' };
        if (label === 'Medium') return { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '#f59e0b' };
        return { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', icon: '#64748b' };
    };

    const colors = getColor(prediction.label);

    return (
        <div style={{ padding: 16, background: colors.bg, borderRadius: 16, border: `1px solid ${colors.border}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ marginTop: 2 }}><ShieldAlert size={20} color={colors.icon} /></div>
            <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                    Adherence Drop-Off Risk: {prediction.label}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {prediction.factors.map((factor, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <Info size={14} color={colors.icon} style={{ marginTop: 2, flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{factor}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PredictionAlert;
