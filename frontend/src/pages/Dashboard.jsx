import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Clock, BarChart2, Zap, Plus, Check, X, AlertTriangle, Activity, Pill, BrainCircuit, ArrowRight, ChevronDown, HeartPulse } from 'lucide-react';
import { dateUtils } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { otherApi } from '../api/otherApi';
import { medicineApi } from '../api/medicineApi';
import { predictionService } from '../services/predictionService';
import { notificationService } from '../services/notificationService';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import RobotIllustration from '../components/ui/RobotIllustration';
import AdherenceHeatmap from '../components/AdherenceHeatmap';
import SymptomLogger from '../components/SymptomLogger';
import HealthInsightsPanel from '../components/HealthInsightsPanel';
import PredictionAlert from '../components/PredictionAlert';

function _getGreeting() {
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

const KPICard = ({ label, value, icon, _trend, _gradientFromTo, isPercentage }) => {
    const animatedValue = useCountUp(value);
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="card-premium p-5 flex flex-col justify-between cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-bold text-slate-500">{label}</p>
                <div className="text-slate-300">
                   {label === "Health Score" && <X size={12} className="opacity-30" />}
                </div>
            </div>
            
            <div className="flex items-end gap-1 mb-2">
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {animatedValue}
                </p>
                {label === "Health Score" && <span className="text-[10px] font-bold text-slate-400 mb-1">/100</span>}
                {isPercentage && <span className="text-[10px] font-bold text-slate-400 mb-1">%</span>}
                {label === "Streak" && <span className="text-[10px] font-bold text-slate-400 mb-1">Days</span>}
            </div>
            
            <div className="flex justify-between items-end mt-auto">
                <div className="flex flex-col gap-1">
                   {label === "Health Score" ? (
                       <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-max">Excellent</span>
                   ) : label === "Medicines Today" ? (
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">To Take</span>
                   ) : label === "Reminders" ? (
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
                   ) : label === "Adherence" ? (
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">This Week</span>
                   ) : (
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Keep it up! 🔥</span>
                   )}
                </div>
                
                {/* SVG Mock Sparkline or Icon */}
                {label === "Health Score" ? (
                    <svg width="40" height="20" viewBox="0 0 40 20" className="ml-auto">
                       <path d="M0,15 L10,10 L20,18 L30,5 L40,8" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-auto border border-slate-100" style={{ background: '#F9F7FF' }}>
                        {icon}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const _getUniqueColor = (name) => {
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

const _containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } }
};

const _itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const [loading, setLoading] = useState(true);
    const [_prediction, setPrediction] = useState(null);
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
    const _unlockedCount = achievementsList.filter(a => a.unlocked).length;
    const _totalAchievements = achievementsList.length;

    return (
        <div className="relative min-h-screen flex flex-col font-sans overflow-hidden w-full selection:bg-purple-500/20 bg-[#F2EEFF]">
            
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

            <div className="flex-1 flex flex-col space-y-6 z-10 relative w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 pb-24">
                
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2"
                >
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Good Morning, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--btn-gradient)' }}>{user?.name ? user.name.split(' ')[0] : 'Sumit'}</span>! 👋
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">
                            Here&apos;s your health overview for today
                        </p>
                    </div>
                </motion.div>

                {/* 5 Top KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', gap: 24, marginBottom: 32, overflowX: 'auto', paddingBottom: 12 }}
                >
                    <StatCard
                        label="Health Score"
                        value={92}
                        unit="/100"
                        icon={<HeartPulse size={20} />}
                        color="green"
                        trend="2% this week"
                        trendUp={true}
                    />
                    <StatCard
                        label="Medicines"
                        value={upcomingDoses.length + summary.recentActivity.length}
                        unit="Today"
                        icon={<Pill size={20} />}
                        color="purple"
                    />
                    <StatCard
                        label="Reminders"
                        value={upcomingDoses.length}
                        unit="Pending"
                        icon={<Clock size={20} />}
                        color="pink"
                    />
                    <StatCard
                        label="Adherence"
                        value={summary.kpis.adherenceWeekly}
                        unit="%"
                        icon={<Activity size={20} />}
                        color="cyan"
                        trend="Great job!"
                        trendUp={true}
                    />
                    <StatCard
                        label="Streak"
                        value={summary.kpis.currentStreak}
                        unit="Days"
                        icon={<Zap size={20} />}
                        color="amber"
                    />
                </motion.div>

                {/* Main Content Grid: 60/40 Split */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, wFull: '100%' }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '3 1 0%' }}>
                        {/* Column 1: Today&apos;s Schedule */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard hover={false} className="flex flex-col min-h-[400px] w-full">
                        <h2 className="text-base font-extrabold text-slate-900 mb-6 tracking-tight">Today's Schedule</h2>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {upcomingDoses.map(dose => {
                                const name = dose.medicationName.split(' ')[0];
                                const dosage = dose.medicationName.split(' ').slice(1).join(' ');

                                return (
                                    <div key={`${dose.scheduleId}-${dose.time}`} className="flex items-center justify-between p-4 rounded-[14px] bg-[#F9F7FF] border border-[#E5E0FF] group transition-colors hover:border-purple-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
                                                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 mb-0.5">{dateUtils.formatTime(dose.time)}</p>
                                                <p className="text-sm font-bold text-slate-900">{name} <span className="text-slate-500 font-medium text-xs">{dosage}</span></p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-100 cursor-pointer hover:bg-amber-100" onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Taken'); }}>
                                            Upcoming
                                        </span>
                                    </div>
                                );
                            })}
                            
                            {summary.recentActivity.map(log => (
                                <div key={log._id} className="flex items-center justify-between p-4 rounded-[14px] bg-slate-50 border border-slate-100 opacity-80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 mb-0.5">{new Date(log.actionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-sm font-bold text-slate-600">{log.medicationName}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">Taken</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/schedules')} className="mt-4 text-[11px] font-bold text-purple-600 hover:text-purple-700 text-left flex items-center gap-1 transition-colors">
                            View full schedule <ArrowRight size={12} />
                        </button>
                            </GlassCard>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '2 1 0%' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <PredictionAlert />
                        </motion.div>
                        
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <HealthInsightsPanel refreshTrigger={refreshTrigger} />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <SymptomLogger onLogSuccess={triggerRefresh} />
                        </motion.div>

                    {/* Column 3: Upcoming Reminders */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <GlassCard hover={false} className="flex flex-col min-h-[300px]">
                        <h2 className="text-base font-extrabold text-slate-900 mb-6 tracking-tight">Upcoming Reminders</h2>
                        
                        <div className="flex-1 space-y-4">
                            {upcomingDoses.map((dose, i) => {
                                const name = dose.medicationName.split(' ')[0];
                                const _dosage = dose.medicationName.split(' ').slice(1).join(' ');
                                const colors = ['#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
                                const color = colors[i % colors.length];
                                const bgColors = ['#ECFDF5', '#FFFBEB', '#FDF2F8', '#ECFEFF'];
                                const bgColor = bgColors[i % bgColors.length];

                                return (
                                    <div key={`rem-${dose.scheduleId}-${dose.time}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer bg-white">
                                        <div className="flex items-center gap-3">
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-900 leading-tight">{name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{dateUtils.formatTime(dose.time)}</p>
                                            </div>
                                        </div>
                                        <ChevronDown size={14} className="text-slate-300 -rotate-90" />
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => navigate('/schedules')} className="mt-auto text-[11px] font-bold text-slate-400 hover:text-slate-600 text-center flex items-center justify-center gap-1 pt-4 transition-colors">
                            View all
                        </button>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
            {/* Adherence Heatmap */}
            <div style={{ marginTop: 24 }}>
                <AdherenceHeatmap />
            </div>
        </div>
        </div>
    );
};
export default DashboardPage;
