import React, { useState, useEffect } from 'react';
import { healthApi } from '../api/healthApi';
import { BrainCircuit, AlertCircle, TrendingUp, Info } from 'lucide-react';

const InsightIcon = ({ type }) => {
    switch(type) {
        case 'warning': return <AlertCircle size={18} color="#ef4444" />;
        case 'positive': return <TrendingUp size={18} color="#22c55e" />;
        case 'suggestion': return <Info size={18} color="#3b82f6" />;
        default: return <BrainCircuit size={18} color="#8b5cf6" />;
    }
};

const HealthInsightsPanel = ({ refreshTrigger }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            try {
                const res = await healthApi.getInsights();
                setInsights(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [refreshTrigger]);

    if (loading) return (
        <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
                <BrainCircuit size={18} color="#8b5cf6" /> AI Pattern Insights
            </h3>
            
            {insights.length === 0 ? (
                <p style={{ fontSize: 13, color: '#64748b' }}>Not enough symptom or medication data to generate patterns yet. Keep logging!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {insights.map((insight, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <div style={{ marginTop: 2 }}><InsightIcon type={insight.type} /></div>
                            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                                {insight.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HealthInsightsPanel;
