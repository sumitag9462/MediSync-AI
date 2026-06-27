import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Plus, Trash2, Copy, Download, Check } from 'lucide-react';
import apiClient from '../api/apiClient';

const EmergencyQRCard = () => {
    const [profile, setProfile] = useState(null);
    const [qrUrl, setQrUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({
        bloodGroup: '',
        allergies: [],
        emergencyContacts: [{ name: '', phone: '', relation: '' }]
    });
    const [allergyInput, setAllergyInput] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.get('/emergency/profile');
                if (res.data?.data?.profile) {
                    const p = res.data.data.profile;
                    setProfile(p);
                    setQrUrl(res.data.data.qrUrl);
                    setForm({
                        bloodGroup: p.bloodGroup || '',
                        allergies: p.allergies || [],
                        emergencyContacts: p.emergencyContacts?.length ? p.emergencyContacts : [{ name: '', phone: '', relation: '' }]
                    });
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await apiClient.post('/emergency/profile', form);
            setProfile(res.data.data.profile);
            setQrUrl(res.data.data.qrUrl);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const addContact = () => {
        setForm(prev => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relation: '' }] }));
    };

    const removeContact = (idx) => {
        setForm(prev => ({ ...prev, emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== idx) }));
    };

    const updateContact = (idx, field, value) => {
        setForm(prev => {
            const contacts = [...prev.emergencyContacts];
            contacts[idx] = { ...contacts[idx], [field]: value };
            return { ...prev, emergencyContacts: contacts };
        });
    };

    const addAllergy = () => {
        if (allergyInput.trim()) {
            setForm(prev => ({ ...prev, allergies: [...prev.allergies, allergyInput.trim()] }));
            setAllergyInput('');
        }
    };

    const removeAllergy = (idx) => {
        setForm(prev => ({ ...prev, allergies: prev.allergies.filter((_, i) => i !== idx) }));
    };

    const copyLink = () => {
        navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = () => {
        const svg = document.getElementById('emergency-qr-svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.download = 'emergency-qr.png';
            link.href = canvas.toDataURL();
            link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

    const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc' };
    const btnStyle = { padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 10, background: '#fee2e2', borderRadius: 12 }}><Shield size={24} color="#ef4444" /></div>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Emergency Health Card</h2>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Scannable QR with your medical essentials</p>
                </div>
            </div>

            {/* Blood Group */}
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#475569', marginBottom: 6 }}>Blood Group</label>
            <select value={form.bloodGroup} onChange={e => setForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                style={{ ...inputStyle, marginBottom: 16 }}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>

            {/* Allergies */}
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#475569', marginBottom: 6 }}>Allergies</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} placeholder="e.g. Penicillin"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAllergy())} style={inputStyle} />
                <button onClick={addAllergy} style={{ ...btnStyle, background: '#e0e7ff', color: '#4f46e5' }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {form.allergies.map((a, i) => (
                    <span key={i} style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {a} <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeAllergy(i)} />
                    </span>
                ))}
            </div>

            {/* Emergency Contacts */}
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#475569', marginBottom: 6 }}>Emergency Contacts</label>
            {form.emergencyContacts.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <input value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} placeholder="Name" style={inputStyle} />
                    <input value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} placeholder="Phone" style={inputStyle} />
                    <input value={c.relation} onChange={e => updateContact(i, 'relation', e.target.value)} placeholder="Relation" style={inputStyle} />
                    {form.emergencyContacts.length > 1 && (
                        <button onClick={() => removeContact(i)} style={{ ...btnStyle, background: '#fee2e2', color: '#ef4444', padding: '8px' }}><Trash2 size={14} /></button>
                    )}
                </div>
            ))}
            <button onClick={addContact} style={{ ...btnStyle, background: '#f0fdf4', color: '#16a34a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={14} /> Add Contact
            </button>

            <button onClick={handleSave} disabled={saving}
                style={{ ...btnStyle, background: '#4f46e5', color: '#fff', width: '100%', padding: 14, fontSize: 15 }}>
                {saving ? 'Saving...' : 'Save & Generate QR'}
            </button>

            {/* QR Code Display */}
            {qrUrl && (
                <div style={{ marginTop: 24, textAlign: 'center', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fafafa' }}>
                    <QRCodeSVG id="emergency-qr-svg" value={qrUrl} size={200} level="H" includeMargin />
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, wordBreak: 'break-all' }}>{qrUrl}</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                        <button onClick={copyLink} style={{ ...btnStyle, background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                        </button>
                        <button onClick={downloadQR} style={{ ...btnStyle, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Download size={14} /> Download QR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyQRCard;
