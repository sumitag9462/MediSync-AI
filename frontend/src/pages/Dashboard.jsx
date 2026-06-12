import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Clock, BarChart2, Zap, Plus, Check, X, AlertTriangle, Activity } from 'lucide-react';
import { dateUtils } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { otherApi } from '../api/otherApi';
import { medicineApi } from '../api/medicineApi';
import { predictionService } from '../services/predictionService';
import { notificationService } from '../services/notificationService';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!target) {
            setCount(0);
            return;
        }
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
}

const KPICard = ({ label, value, icon, trend, gradientFromTo, isPercentage }) => {
    const animatedValue = useCountUp(value);
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden rounded-[2rem] p-6 bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] hover:border-purple-200 transition-all cursor-pointer group"
        >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientFromTo}`} />

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-slate-50/80 shadow-sm border border-white flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>

            {/* Label */}
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                {label}
            </p>

            {/* Animated counter value */}
            <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {isPercentage ? `${animatedValue}%` : animatedValue}
            </p>

            {/* Trend chip */}
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md mt-3 text-xs font-semibold ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <span>{trend > 0 ? '↑' : '↓'}</span>
                <span>{Math.abs(trend)}% vs last week</span>
            </div>
            
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradientFromTo} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
        </motion.div>
    );
};

const getUniqueColor = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
        { bg: 'bg-violet-400', shadow: 'shadow-[0_0_8px_rgba(167,139,250,0.8)]' },
        { bg: 'bg-pink-400', shadow: 'shadow-[0_0_8px_rgba(244,114,182,0.8)]' },
        { bg: 'bg-cyan-400', shadow: 'shadow-[0_0_8px_rgba(34,211,238,0.8)]' },
        { bg: 'bg-teal-400', shadow: 'shadow-[0_0_8px_rgba(45,212,191,0.8)]' },
        { bg: 'bg-amber-400', shadow: 'shadow-[0_0_8px_rgba(251,191,36,0.8)]' }
    ];
    return colors[hash % colors.length];
};

const ALL_ACHIEVEMENTS = [
    { id: 'streak-7', label: '7-Day Streak', icon: '🔥' },
    { id: 'streak-30', label: '30-Day Streak', icon: '🏆' },
    { id: 'consistency-star', label: 'Consistency Star', icon: '⭐' },
    { id: 'active-week', label: 'Active Week', icon: '📈' },
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);
    const [doseLogsData, setDoseLogsData] = useState([]);
    const [hiddenUpcoming, setHiddenUpcoming] = useState([]);

    // Gamification: show confetti briefly
    const [celebrate, setCelebrate] = useState(false);
    const celebrateTimeoutRef = useRef(null);

    // Helper to consistently key doses (normalize scheduleId to string)
    const doseKey = (d) => `${String(d.scheduleId)}-${d.time}`;

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            otherApi.getDashboardSummary(),
            medicineApi.getDoseLogs()
        ]).then(([summaryData, doseLogs]) => {
            setSummary(summaryData);
            setDoseLogsData(doseLogs || []);
            const adherencePrediction = predictionService.predictAdherence(doseLogs);
            setPrediction(adherencePrediction);

            (summaryData.upcomingDoses || []).forEach(dose => {
                if (typeof notificationService.scheduleNotification === 'function') {
                    notificationService.scheduleNotification(dose);
                } else if (typeof notificationService.setReminder === 'function') {
                    notificationService.setReminder(dose);
                }
            });

            // Gamification: check achievements and trigger celebration for newly reached ones
            try {
                const achievements = summaryData.achievements || [];
                const seen = JSON.parse(localStorage.getItem('achievementsSeen') || '[]');
                const newOnes = achievements.filter(a => !seen.includes(a.key));
                if (newOnes.length > 0) {
                    const newSeen = [...seen, ...newOnes.map(a => a.key)];
                    localStorage.setItem('achievementsSeen', JSON.stringify(newSeen));

                    const first = newOnes[0];
                    if (first) {
                        setCelebrate(true);
                        clearTimeout(celebrateTimeoutRef.current);
                        celebrateTimeoutRef.current = setTimeout(() => setCelebrate(false), 4200);
                        if (typeof notificationService.showMilestone === 'function') {
                            notificationService.showMilestone(first);
                        }
                    }
                }
            } catch (err) {
                console.error('Gamification check failed', err);
            }

            setLoading(false);
        }).catch(error => {
            console.error("Failed to fetch dashboard data:", error);
            setLoading(false);
        });
    }, []);

    const hasFetchedRef = useRef(false);
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
            notificationService.requestPermission();
        }
    }, [fetchData]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData();
        }, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleLogDose = async (dose, status) => {
        setHiddenUpcoming(prev => [...prev, doseKey(dose)]);

        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
        const alreadyLoggedToday = (doseLogsData || []).some(log => {
            if (!log.scheduleId || !log.actionTime) return false;
            const sameSchedule = String(log.scheduleId) === String(dose.scheduleId);
            const sameTime = (log.time || '') === dose.time;
            const sameStatus = log.status === status;
            const actionDate = new Date(log.actionTime);
            return sameSchedule && sameTime && sameStatus && actionDate >= startOfToday && actionDate <= endOfToday;
        });
        if (alreadyLoggedToday) {
            return;
        }

        const log = {
            scheduleId: dose.scheduleId,
            medicationName: dose.medicationName,
            time: dose.time,
            scheduledTime: new Date(new Date().toDateString() + ' ' + dose.time).toISOString(),
            actionTime: new Date().toISOString(),
            status,
        };

        let createdLog = null;
        try {
            createdLog = await medicineApi.createDoseLog(log);
        } catch (error) {
            console.error('Failed to create dose log:', error);
            fetchData();
            return;
        }

        setSummary(prev => {
            if (!prev) return prev;
            const newUpcoming = (prev.upcomingDoses || []).filter(u => doseKey(u) !== doseKey(dose));
            const newRecent = [createdLog, ...(prev.recentActivity || [])]
                .filter((log, idx, arr) =>
                    arr.findIndex(l => l.scheduleId === log.scheduleId && l.time === log.time && new Date(l.actionTime).toDateString() === new Date(log.actionTime).toDateString()) === idx
                )
                .slice(0, 5);
            const newKpis = { ...(prev.kpis || {}) };
            if (typeof newKpis.upcomingToday === 'number') {
                newKpis.upcomingToday = Math.max(0, newKpis.upcomingToday - 1);
            }
            return { ...prev, upcomingDoses: newUpcoming, recentActivity: newRecent, kpis: newKpis };
        });

        fetchData();
    };

    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const toHHmm = (dateLike, fallbackTimeStr) => {
        if (fallbackTimeStr) return fallbackTimeStr;
        const d = new Date(dateLike);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    const actedTodayKeys = new Set(
        (doseLogsData || [])
            .filter(l => ['Taken', 'Skipped', 'Missed'].includes(l.status) && l.actionTime && new Date(l.actionTime) >= startOfToday)
            .map(l => {
                const hhmm = toHHmm(l.scheduledTime, l.time);
                return `${String(l.scheduleId)}-${hhmm}`;
            })
    );

    const upcomingDoses = (summary?.upcomingDoses || []).filter(
        dose => !hiddenUpcoming.includes(doseKey(dose)) && !actedTodayKeys.has(doseKey(dose))
    );

    const missedDoses = summary?.missedDoses || [];

    const missedLoggedRef = useRef({});
    useEffect(() => {
        if (!missedDoses.length) return;
        missedDoses.forEach(async (dose) => {
            const key = `${dose.scheduleId}-${dose.time}`;
            const alreadyLogged = (summary?.recentActivity || []).some(
                log => log.scheduleId === dose.scheduleId && log.time === dose.time && ['Taken', 'Skipped', 'Missed'].includes(log.status)
            );
            if (!alreadyLogged && !missedLoggedRef.current[key]) {
                missedLoggedRef.current[key] = true;
                await handleLogDose(dose, 'Missed');
            }
        });
        // eslint-disable-next-line
    }, [missedDoses.length, summary]);

    if (loading || !summary) return <div className="text-center p-10 text-white/50">Loading Dashboard...</div>;

    const unlockedKeys = new Set((summary?.achievements || []).map(a => a.key));
    const achievementsList = ALL_ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: unlockedKeys.has(ach.id)
    }));
    const unlockedCount = achievementsList.filter(a => a.unlocked).length;
    const totalAchievements = achievementsList.length;

    return (
        <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-purple-500/20">
            {/* Animated Background System - Light Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
            </div>

            {/* Confetti / emoji burst UI */}
            {celebrate && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-24">
                    <div className="text-6xl animate-burst drop-shadow-2xl">
                        🎉✨🏅
                    </div>
                    <style>{`
                        .animate-burst {
                          animation: burst 1.2s ease-out both;
                        }
                        @keyframes burst {
                          0% { transform: translateY(-20px) scale(0.6); opacity: 0; }
                          30% { transform: translateY(0) scale(1.15); opacity: 1; }
                          100% { transform: translateY(-40px) scale(1); opacity: 0; }
                        }
                    `}</style>
                </div>
            )}

            <div className="flex-1 flex flex-col space-y-8 z-10 relative w-full max-w-6xl mx-auto px-4 md:px-8 py-8 pb-24">
                {/* Greeting & Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase mb-1">
                            {getGreeting()} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{user?.name ? user.name.split(' ')[0] : 'Sumit'}</span> 👋
                        </h1>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => navigate('/schedules')}
                            className="text-sm px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-purple-300 hover:text-purple-700 shadow-sm transition-all"
                        >
                            + Log a dose
                        </button>
                        <button
                            onClick={() => navigate('/schedules')}
                            className="text-sm px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-purple-300 hover:text-purple-700 shadow-sm transition-all"
                        >
                            Today's schedule
                        </button>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('toggle-chatbot'))}
                            className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 transition-all"
                        >
                            Ask AI assistant
                        </button>
                    </div>
                </motion.div>

                {/* AI Nudge (if exists) */}
                {prediction && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl p-5 bg-white/70 border border-amber-200 shadow-lg backdrop-blur-xl flex items-start gap-4 mb-4 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400" />
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shadow-inner border border-amber-200 shrink-0">
                            🤖
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-800">AI Health Insight</p>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{prediction}</p>
                        </div>
                    </motion.div>
                )}

                {/* KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
                >
                    <KPICard
                        label="Upcoming Doses Today"
                        value={upcomingDoses.length}
                        icon={<Clock className="text-purple-600" size={24} />}
                        trend={12}
                        gradientFromTo="from-purple-500 to-pink-500"
                        isPercentage={false}
                    />
                    <KPICard
                        label="Adherence Rate (7d)"
                        value={summary.kpis.adherenceWeekly}
                        icon={<BarChart2 className="text-blue-500" size={24} />}
                        trend={5}
                        gradientFromTo="from-blue-400 to-cyan-400"
                        isPercentage={true}
                    />
                    <KPICard
                        label="Current Streak"
                        value={summary.kpis.currentStreak}
                        icon={<Zap className="text-amber-500" size={24} />}
                        trend={20}
                        gradientFromTo="from-amber-400 to-orange-500"
                        isPercentage={false}
                    />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                    {/* Left/Middle Column (Doses lists & Activity) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Doses */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-[2rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                            
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Clock size={16} />
                                </span>
                                Upcoming Doses
                                <span className="h-px flex-1 bg-slate-200 ml-4"></span>
                            </h2>
                            
                            {upcomingDoses.length > 0 ? (
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                                    {upcomingDoses.map(dose => {
                                        const name = dose.medicationName.split(' ')[0];
                                        const dosage = dose.medicationName.split(' ').slice(1).join(' ');

                                        return (
                                            <motion.div
                                                variants={itemVariants}
                                                key={`${dose.scheduleId}-${dose.time}`}
                                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all group relative overflow-hidden z-10"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                
                                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner shrink-0">
                                                    <span className="font-bold text-lg">{name.charAt(0)}</span>
                                                </div>

                                                <div className="flex-1">
                                                    <p className="text-base font-bold text-slate-900">{name} <span className="text-slate-500 font-normal">{dosage}</span></p>
                                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                        <Clock size={14} className="text-purple-400" />
                                                        {dateUtils.formatTime(dose.time)}
                                                    </p>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex gap-2 w-full sm:w-auto relative z-20">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Taken'); }}
                                                        className="flex-1 sm:flex-none text-sm px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Check size={16} /> Take
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Skipped'); }}
                                                        className="flex-1 sm:flex-none text-sm px-5 py-2.5 rounded-xl text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <X size={16} /> Skip
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12 bg-white/50 rounded-2xl border border-slate-100 border-dashed relative z-10">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <Check size={40} />
                                    </div>
                                    <p className="text-xl text-slate-800 font-bold mb-2">All caught up for today!</p>
                                    <p className="text-slate-500 text-base mb-6">No more doses remaining on your schedule.</p>
                                    <motion.button
                                        onClick={() => navigate('/schedules')}
                                        className="bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 text-slate-700 font-bold py-3 px-6 rounded-xl inline-flex items-center shadow-sm transition-all text-sm"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Plus size={18} className="mr-2" /> View Full Schedule
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>

                        {/* Missed Doses */}
                        {missedDoses.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="rounded-[2rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl p-6 md:p-8"
                            >
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                                        <AlertTriangle size={16} />
                                    </span>
                                    Missed Doses
                                    <span className="h-px flex-1 bg-slate-200 ml-4"></span>
                                </h2>
                                <div className="space-y-4">
                                    {missedDoses.map(dose => (
                                        <div key={`${dose.scheduleId}-${dose.time}`} className="flex items-center justify-between bg-red-50/50 border border-red-100 rounded-2xl px-5 py-4 hover:shadow-md transition-shadow">
                                            <div>
                                                <span className="font-bold text-slate-800">{dose.medicationName}</span>
                                                <span className="ml-3 text-red-500 font-medium bg-red-100 px-2 py-0.5 rounded-md text-xs">{dateUtils.formatTime(dose.time)}</span>
                                            </div>
                                            <span className="text-red-500 font-bold bg-red-100 px-3 py-1 rounded-full text-xs">Missed</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-[2rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    <Activity size={16} />
                                </span>
                                Recent Activity
                                <span className="h-px flex-1 bg-slate-200 ml-4"></span>
                            </h2>
                            {summary.recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {summary.recentActivity.map(log => (
                                        <div
                                            key={log._id}
                                            className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:shadow-sm hover:border-slate-200 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${
                                                    log.status === 'Taken' ? 'bg-emerald-50 text-emerald-500' : 
                                                    log.status === 'Missed' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                                                }`}>
                                                    {log.status === 'Taken' ? <Check size={18} /> : 
                                                     log.status === 'Missed' ? <X size={18} /> : <span className="font-bold">-</span>}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 block">{log.medicationName}</span>
                                                    <span className="text-xs font-semibold uppercase tracking-wider mt-1 block">
                                                        {log.status === 'Taken' ? (
                                                            <span className="text-emerald-600">Taken</span>
                                                        ) : log.status === 'Missed' ? (
                                                            <span className="text-red-600">Missed</span>
                                                        ) : (
                                                            <span className="text-amber-600">Skipped</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-slate-500 font-medium text-sm bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                {new Date(log.actionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white/50 rounded-2xl border border-slate-100 border-dashed text-slate-500 font-medium">
                                    <p>No recent activity today.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column (Achievements) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="rounded-[2rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl p-6 md:p-8 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                                Achievements
                            </h2>
                            <p className="text-sm text-slate-500 mb-6 font-medium">
                                <span className="text-purple-600 font-bold">{unlockedCount}</span> of <span className="text-slate-800 font-bold">{totalAchievements}</span> unlocked
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {achievementsList.map(ach => (
                                    <motion.div
                                        key={ach.id}
                                        whileHover={{ scale: 1.05 }}
                                        className={`rounded-2xl p-4 text-center border transition-all ${
                                            ach.unlocked
                                                ? 'bg-white border-purple-200 shadow-md shadow-purple-500/5'
                                                : 'bg-slate-50/50 border-slate-100 opacity-60 grayscale'
                                            }`}
                                    >
                                        <div className="text-4xl mb-3 drop-shadow-sm">{ach.icon}</div>
                                        <p className={`text-xs font-bold uppercase tracking-wide 
                                            ${ach.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                                            {ach.label}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;
