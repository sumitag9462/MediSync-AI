import React, { useState } from 'react';
import { healthApi } from '../api/healthApi';
import { Activity, Plus, Loader } from 'lucide-react';

const SymptomLogger = ({ onLogSuccess }) => {
    const [symptomName, setSymptomName] = useState('');
    const [severity, setSeverity] = useState(5);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symptomName) return;
        
        setLoading(true);
        try {
            await healthApi.logSymptom({ symptomName, severity, notes });
            setSymptomName('');
            setSeverity(5);
            setNotes('');
            if (onLogSuccess) onLogSuccess();
        } catch (error) {
            console.error('Failed to log symptom', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
                <Activity size={18} color="#ec4899" /> Log a Symptom
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input 
                    type="text" 
                    placeholder="E.g., Headache, Nausea" 
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    required
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                />
                
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>
                        <span>Severity: {severity}</span>
                        <span>(1 = Mild, 10 = Severe)</span>
                    </div>
                    <input 
                        type="range" min="1" max="10" 
                        value={severity}
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: '#ec4899' }}
                    />
                </div>

                <textarea 
                    placeholder="Additional notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 60 }}
                />

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ background: '#ec4899', color: '#fff', padding: '10px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', cursor: 'pointer' }}
                >
                    {loading ? <Loader size={16} className="animate-spin" /> : <><Plus size={16} /> Log Symptom</>}
                </button>
            </form>
        </div>
    );
};

export default SymptomLogger;
