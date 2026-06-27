import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { intelligenceApi } from '../api/intelligenceApi';
import AppShell from '../components/layout/AppShell';

const MedicationSafety = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSafety = async () => {
            try {
                const response = await intelligenceApi.getSafetyDashboard();
                setData(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSafety();
    }, []);

    if (loading) return <AppShell><div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div></AppShell>;

    const getScoreColor = (score) => {
        switch (score) {
            case 'Safe': return 'text-green-500 bg-green-50';
            case 'Mild': return 'text-yellow-600 bg-yellow-50';
            case 'Moderate': return 'text-orange-500 bg-orange-50';
            case 'Severe': return 'text-red-600 bg-red-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <AppShell>
            <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Medication Intelligence</h1>
                        <p className="text-gray-500">AI-powered drug safety analysis</p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Overall Safety Score</h2>
                            <p className="text-sm text-gray-500 mt-1">Based on current active prescriptions</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full font-semibold text-sm ${getScoreColor(data?.overallScore)}`}>
                            {data?.overallScore || 'Unknown'}
                        </span>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-700 leading-relaxed">
                            {data?.aiSafetySummary || "No safety insights available yet. Please add your medications."}
                        </p>
                    </div>
                </div>

                {data?.interactions?.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500 w-5 h-5" /> Detected Interactions
                        </h3>
                        {data.interactions.map((interaction, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between mb-3">
                                    <h4 className="font-semibold text-gray-800">{interaction.medicineA} ↔ {interaction.medicineB}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(interaction.severity)}`}>
                                        {interaction.severity}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2"><span className="font-medium text-gray-700">Reason:</span> {interaction.aiExplanation}</p>
                                <p className="text-gray-600 text-sm"><span className="font-medium text-gray-700">Action:</span> {interaction.recommendation}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default MedicationSafety;
