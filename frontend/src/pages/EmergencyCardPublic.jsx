import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Phone, AlertTriangle, Pill } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EmergencyCardPublic = () => {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await axios.get(`${API_BASE}/emergency/public/${slug}`);
                setData(res.data.data);
            } catch (err) {
                setError('Emergency card not found or link expired.');
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [slug]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading emergency information...</p>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <p style={{ color: '#ef4444', fontSize: 16 }}>{error}</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32, borderBottom: '3px solid #ef4444', paddingBottom: 20 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Shield size={28} color="#ef4444" />
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Emergency Medical Information</h1>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#334155', margin: '8px 0 0' }}>{data.name}</p>
                </div>

                {/* Blood Group Badge */}
                {data.bloodGroup && (
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <span style={{
                            display: 'inline-block', padding: '12px 32px', borderRadius: 16,
                            background: '#fef2f2', border: '2px solid #fecaca',
                            fontSize: 28, fontWeight: 800, color: '#dc2626', letterSpacing: 2
                        }}>
                            🩸 {data.bloodGroup}
                        </span>
                    </div>
                )}

                {/* Current Medications */}
                {data.medications?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <Pill size={18} color="#6366f1" /> Current Medications
                        </h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Dosage</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Frequency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.medications.map((med, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{med.name}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 14, color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{med.dosage}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 14, color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{med.frequency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Allergies */}
                {data.allergies?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <AlertTriangle size={18} color="#f59e0b" /> Allergies
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {data.allergies.map((a, i) => (
                                <span key={i} style={{ background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                                    ⚠ {a}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Emergency Contacts */}
                {data.emergencyContacts?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <Phone size={18} color="#22c55e" /> Emergency Contacts
                        </h2>
                        {data.emergencyContacts.map((c, i) => (
                            <div key={i} style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{c.name}</p>
                                    <p style={{ fontSize: 12, color: '#64748b' }}>{c.relation}</p>
                                </div>
                                <a href={`tel:${c.phone}`} style={{ fontWeight: 700, color: '#16a34a', textDecoration: 'none', fontSize: 15 }}>{c.phone}</a>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>Generated by MediSync-AI — For Medical Use Only</p>
                </div>
            </div>
        </div>
    );
};

export default EmergencyCardPublic;
