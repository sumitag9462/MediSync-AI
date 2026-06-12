
import React, { useState, useEffect } from 'react';
import { medicineApi } from '../api/medicineApi';
import AdherenceChart from '../Components/charts/AdherenceChart';
import MissedByHourChart from '../Components/charts/MissedByHourChart';
import StatCard from '../Components/cards/StatCard';
import { BarChart, CheckCircle, XCircle } from 'lucide-react';

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const doseLogs = await medicineApi.getDoseLogs();
                if (doseLogs && doseLogs.length > 0) {
                    const totalTaken = doseLogs.filter(l => l.status === 'Taken').length;
                    const totalMissed = doseLogs.filter(l => l.status === 'Skipped' || l.status === 'Missed').length;
                    const totalLogs = totalTaken + totalMissed;
                    const overallAdherence = totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 0;

                    const weeklyAdherence = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => {
                        const dayLogs = doseLogs.filter(d => new Date(d.actionTime).getDay() === dayIndex);
                        const takenCount = dayLogs.filter(d => d.status === 'Taken').length;
                        const totalCount = dayLogs.filter(d => ['Taken', 'Skipped', 'Missed'].includes(d.status)).length;
                        if (totalCount === 0) return { name: day, adherence: 0 };
                        return { name: day, adherence: Math.round((takenCount / totalCount) * 100) };
                    });

                    const missedByHour = [
                        { hour: 'Morning (6-11am)', missed: 0 },
                        { hour: 'Afternoon (12-5pm)', missed: 0 },
                        { hour: 'Evening (6-11pm)', missed: 0 },
                        { hour: 'Night (12-5am)', missed: 0 },
                    ];
                    doseLogs.filter(d => d.status === 'Skipped' || d.status === 'Missed').forEach(d => {
                        const hour = new Date(d.scheduledTime).getHours();
                        if (hour >= 6 && hour < 12) missedByHour[0].missed++;
                        else if (hour >= 12 && hour < 18) missedByHour[1].missed++;
                        else if (hour >= 18 && hour < 24) missedByHour[2].missed++;
                        else missedByHour[3].missed++;
                    });

                    setAnalyticsData({
                        stats: { overallAdherence, totalTaken, totalMissed },
                        weeklyAdherence,
                        missedByHour: missedByHour.filter(m => m.missed > 0),
                    });
                }
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (loading) return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
            </div>
            <div className="relative z-10 p-12 text-center max-w-lg w-full bg-white/70 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl rounded-[2rem] animate-fade-in">
                <BarChart className="mx-auto text-purple-500 animate-bounce" size={60} />
                <h3 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">Calculating Analytics...</h3>
                <p className="text-slate-500 mt-3 text-lg font-medium">Please wait while we crunch your wellness data.</p>
            </div>
        </div>
    );


    if (!analyticsData) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
                </div>
                <div className="relative z-10 p-12 text-center max-w-lg w-full bg-white/70 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl rounded-[2rem] animate-fade-in">
                    <BarChart className="mx-auto text-purple-500 animate-bounce" size={60} />
                    <h3 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">Not Enough Data</h3>
                    <p className="text-slate-500 mt-3 text-lg font-medium">Log your first dose from the dashboard to generate analytics.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-purple-500/20 w-full">
            {/* Animated Background System - Light Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 py-12 pb-24">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Wellness <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Analytics</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Your health insights and adherence trends</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <StatCard
                        title="Overall Adherence"
                        value={`${analyticsData.stats.overallAdherence}%`}
                        icon={<BarChart size={28} className="text-purple-600" />}
                    />
                    <StatCard
                        title="Total Doses Taken"
                        value={`${analyticsData.stats.totalTaken}`}
                        icon={<CheckCircle size={28} className="text-emerald-500" />}
                    />
                    <StatCard
                        title="Total Doses Missed"
                        value={`${analyticsData.stats.totalMissed}`}
                        icon={<XCircle size={28} className="text-red-500" />}
                    />
                </div>

                {/* Charts Section - Full Width, Stacked */}
                <div className="flex flex-col gap-10 w-full">
                    <div className="rounded-[2rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden">
                        <AdherenceChart data={analyticsData.weeklyAdherence} />
                    </div>
                    {analyticsData.missedByHour.length > 0 ? (
                        <div className="rounded-[2rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden">
                            <MissedByHourChart data={analyticsData.missedByHour} />
                        </div>
                    ) : (
                        <div className="rounded-[2rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl p-12 text-center flex flex-col items-center justify-center min-h-[260px] w-full">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-slate-900 text-xl font-extrabold tracking-tight mb-2">Missed Doses by Time of Day</h3>
                            <p className="text-slate-500 font-medium">No missed doses recorded yet. Keep up the great work!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default AnalyticsPage;