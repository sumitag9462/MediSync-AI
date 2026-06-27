import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Edit2, Trash2, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ocrApi } from '../api/ocrApi';

const OCRReviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { extractionData } = location.state || {};
    
    const [medicines, setMedicines] = useState([]);
    const [confidence, setConfidence] = useState(0);
    const [historyId, setHistoryId] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editForm, setEditForm] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!extractionData) {
            navigate('/dashboard');
            return;
        }
        setMedicines(extractionData.medicines || []);
        setConfidence(extractionData.confidenceScore || 0);
        setHistoryId(extractionData.historyId);
        
        // Ensure image URL is absolute for display if the backend didn't provide one
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace('/api', '');
        setImageUrl(`${baseUrl}${extractionData.imageUrl}`);
    }, [extractionData, navigate]);

    const getConfidenceBadge = (score) => {
        if (score >= 0.8) return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1"><ShieldCheck size={14}/> High Confidence</span>;
        if (score >= 0.5) return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1"><AlertTriangle size={14}/> Medium Confidence</span>;
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1"><AlertTriangle size={14}/> Low Confidence - Please Verify</span>;
    };

    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditForm({ ...medicines[index], times: medicines[index].times.join(', ') });
    };

    const handleSaveEdit = () => {
        const updated = [...medicines];
        updated[editingIndex] = {
            ...editForm,
            times: editForm.times.split(',').map(t => t.trim()).filter(Boolean)
        };
        setMedicines(updated);
        setEditingIndex(-1);
        setEditForm(null);
    };

    const handleDelete = (index) => {
        const updated = medicines.filter((_, i) => i !== index);
        setMedicines(updated);
    };

    const handleAdd = () => {
        const newMed = { name: '', dosage: '', frequency: 'daily', times: ['Morning'], duration: 'unknown' };
        setMedicines([...medicines, newMed]);
        handleEdit(medicines.length);
    };

    const handleConfirm = async () => {
        if (medicines.length === 0) {
            addToast('Error', 'Please add at least one medicine to save.', 'error');
            return;
        }
        
        setIsSaving(true);
        try {
            await ocrApi.saveSchedule({ historyId, medicines });
            addToast('Success', 'Medications saved successfully!', 'success');
            navigate('/schedules');
        } catch (error) {
            addToast('Error', error.message || 'Failed to save schedules', 'error');
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/20"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Review Extracted Medications</h1>
                        <p className="text-gray-600">Please verify the AI extracted data against your prescription image.</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500 mb-1">Overall AI Confidence</span>
                        {getConfidenceBadge(confidence)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-200 sticky top-8">
                            <div className="p-3 bg-gray-800 text-white text-sm font-medium text-center">
                                Original Prescription
                            </div>
                            <div className="h-[400px] overflow-auto p-2">
                                {imageUrl && <img src={imageUrl} alt="Prescription" className="w-full h-auto rounded-lg" />}
                            </div>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="p-4 font-semibold text-gray-700">Medicine & Dosage</th>
                                            <th className="p-4 font-semibold text-gray-700">Frequency & Time</th>
                                            <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {medicines.map((med, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                {editingIndex === idx ? (
                                                    <td colSpan="3" className="p-4 bg-teal-50/50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-500">Name</label>
                                                                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-500">Dosage</label>
                                                                <input type="text" value={editForm.dosage} onChange={e => setEditForm({...editForm, dosage: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-500">Frequency</label>
                                                                <input type="text" value={editForm.frequency} onChange={e => setEditForm({...editForm, frequency: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-500">Times (comma separated)</label>
                                                                <input type="text" value={editForm.times} onChange={e => setEditForm({...editForm, times: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" placeholder="Morning, Night" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingIndex(-1)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                                                            <button onClick={handleSaveEdit} className="px-3 py-1.5 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1"><Check size={14}/> Save Row</button>
                                                        </div>
                                                    </td>
                                                ) : (
                                                    <>
                                                        <td className="p-4 align-top">
                                                            <div className="font-semibold text-gray-800">{med.name}</div>
                                                            <div className="text-sm text-gray-500 mt-1">{med.dosage}</div>
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <div className="text-gray-700 capitalize">{med.frequency}</div>
                                                            <div className="text-sm text-teal-600 mt-1 flex flex-wrap gap-1">
                                                                {med.times.map(t => (
                                                                    <span key={t} className="bg-teal-50 px-2 py-0.5 rounded text-xs">{t}</span>
                                                                ))}
                                                            </div>
                                                            {med.duration && <div className="text-xs text-gray-400 mt-1">Duration: {med.duration}</div>}
                                                        </td>
                                                        <td className="p-4 align-top text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => handleEdit(idx)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                                    <Edit2 size={18} />
                                                                </button>
                                                                <button onClick={() => handleDelete(idx)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                        {medicines.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-500">
                                                    No medicines extracted. Please add manually.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <button onClick={handleAdd} className="text-teal-600 font-medium flex items-center gap-2 hover:text-teal-700 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-teal-50">
                                    <Plus size={16} /> Add Medicine Manually
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
                                Cancel & Discard
                            </button>
                            <button 
                                onClick={handleConfirm}
                                disabled={isSaving || editingIndex !== -1}
                                className={`px-8 py-3 rounded-xl font-medium text-white transition-all shadow-lg flex items-center gap-2
                                    ${isSaving || editingIndex !== -1 ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30'}`}
                            >
                                {isSaving ? 'Saving...' : 'Confirm & Save Schedule'}
                                {!isSaving && <Check size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OCRReviewPage;
