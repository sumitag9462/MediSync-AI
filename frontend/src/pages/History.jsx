import React, { useState, useEffect } from 'react';
import { medicineApi } from '../api/medicineApi';
import { History as HistoryIcon, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { dateUtils } from '../utils/dateUtils';

const HistoryPage = () => {
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        medicineApi.getDoseLogs().then(data => {
            const grouped = data.reduce((acc, log) => {
                const date = new Date(log.actionTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(log);
                return acc;
            }, {});
            setLogs(grouped);
            setLoading(false);
        }).catch(error => {
            console.error("Failed to fetch history:", error);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans">
            <div className="flex flex-col items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium text-lg">Loading your history...</p>
            </div>
        </div>
    );

    const logGroups = Object.keys(logs);

    return (
        <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden font-sans selection:bg-purple-500/20">
            {/* Animated Background System - Light Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
            </div>

            <div className="flex-1 flex flex-col z-10 relative w-full max-w-4xl mx-auto px-4 md:px-8 py-12 pb-24">
                <div className="flex flex-col mb-10 gap-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Dose <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">History</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">Review your past medication records.</p>
                </div>
                
                {logGroups.length > 0 ? (
                    <div className="space-y-12">
                        {logGroups.map(date => (
                            <div key={date}>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-6 sticky top-0 py-3 z-20 flex items-center gap-3">
                                    {date}
                                    {new Date(date).toDateString() === new Date().toDateString() && (
                                        <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">Today</span>
                                    )}
                                </h2>
                                <div className="bg-white/80 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl rounded-[2rem] overflow-hidden">
                                    <div className="divide-y divide-slate-100">
                                        {logs[date].map(log => (
                                            <div key={log._id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${log.status === 'Taken' ? 'bg-emerald-50 text-emerald-500' : log.status === 'Missed' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                                                        {log.status === 'Taken' ? (
                                                            <CheckCircle size={24} title="Taken" />
                                                        ) : log.status === 'Missed' ? (
                                                            <AlertTriangle size={24} title="Missed" />
                                                        ) : (
                                                            <XCircle size={24} title="Skipped" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-lg text-slate-900 tracking-tight">{log.medicationName}</p>
                                                        <p className="text-sm text-slate-500 font-medium">Scheduled for {dateUtils.formatTime(new Date(log.scheduledTime).toTimeString().slice(0, 5))}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className={`font-bold text-sm px-3 py-1 rounded-lg ${log.status === 'Taken' ? 'bg-emerald-100 text-emerald-700' : log.status === 'Missed' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        {log.status}
                                                    </span>
                                                    <p className="text-xs text-slate-400 font-bold mt-2">{new Date(log.actionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-16 md:p-24 rounded-[3rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl w-full">
                        <div className="w-24 h-24 bg-purple-50 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <HistoryIcon size={48} />
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">No History Yet</h3>
                        <p className="text-slate-500 mt-4 text-lg font-medium max-w-md mx-auto">Log your first dose from the dashboard to see your medication history here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default HistoryPage;

