import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Clock, BarChart2, Zap, Plus, Check, X, AlertTriangle } from 'lucide-react';
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
      className="relative overflow-hidden rounded-2xl p-5 bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 transition-all cursor-pointer group"
    >
      {/* Top accent line - unique color per card */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradientFromTo} rounded-t-2xl`} />
      
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-lg mb-3 text-violet-300">
        {icon}
      </div>
      
      {/* Label */}
      <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-1">
        {label}
      </p>
      
      {/* Animated counter value */}
      <p className="text-3xl font-black text-white">
        {isPercentage ? `${animatedValue}%` : animatedValue}
      </p>
      
      {/* Trend chip */}
      <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
      </p>
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
            .filter(l => ['Taken','Skipped','Missed'].includes(l.status) && l.actionTime && new Date(l.actionTime) >= startOfToday)
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
                log => log.scheduleId === dose.scheduleId && log.time === dose.time && ['Taken','Skipped','Missed'].includes(log.status)
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
        <div className="relative min-h-screen flex flex-col bg-[#08081a] text-white">
            {/* Animated background orb */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-r from-purple-500/20 via-pink-400/10 to-purple-500/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />

            {/* Confetti / emoji burst UI */}
            {celebrate && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-24">
                    <div className="text-6xl animate-burst">
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

            <div className="flex-1 flex flex-col space-y-8 z-10 relative w-full max-w-5xl mx-auto px-4 md:px-8 py-8">
                {/* Greeting & Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <p className="text-xs text-white/35 font-medium tracking-wide uppercase">
                        {getGreeting()} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <h1 className="text-2xl font-extrabold text-white mt-1">
                        Welcome back, <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{user?.name ? user.name.split(' ')[0] : 'Sumit'}</span> 👋
                    </h1>
                    
                    <div className="flex gap-2 mt-3 flex-wrap">
                        <button
                            onClick={() => navigate('/schedules')}
                            className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 hover:bg-violet-500/20 transition-all"
                        >
                            + Log a dose
                        </button>
                        <button
                            onClick={() => navigate('/schedules')}
                            className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 hover:bg-violet-500/20 transition-all"
                        >
                            View today's schedule
                        </button>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('toggle-chatbot'))}
                            className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 hover:bg-violet-500/20 transition-all"
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
                        className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 mb-4"
                    >
                        <span className="text-xl">🤖</span>
                        <div>
                            <p className="text-sm font-semibold text-amber-300">AI Nudge</p>
                            <p className="text-xs text-amber-200/70 mt-0.5">{prediction}</p>
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
                        icon={<Clock size={20}/>}
                        trend={12}
                        gradientFromTo="from-violet-500 to-purple-400"
                        isPercentage={false}
                    />
                    <KPICard
                        label="Adherence Rate (7d)"
                        value={summary.kpis.adherenceWeekly}
                        icon={<BarChart2 size={20}/>}
                        trend={5}
                        gradientFromTo="from-cyan-400 to-violet-500"
                        isPercentage={true}
                    />
                    <KPICard
                        label="Current Streak"
                        value={summary.kpis.currentStreak}
                        icon={<Zap size={20}/>}
                        trend={20}
                        gradientFromTo="from-pink-500 to-violet-500"
                        isPercentage={false}
                    />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {/* Left/Middle Column (Doses lists & Activity) */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Upcoming Doses */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5"
                        >
                            <h2 className="text-sm font-semibold text-white/60 mb-6 flex items-center gap-2">
                                Upcoming Doses
                                <span className="h-px flex-1 bg-white/[0.06]"></span>
                            </h2>
                            {upcomingDoses.length > 0 ? (
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                                    {upcomingDoses.map(dose => {
                                        const name = dose.medicationName.split(' ')[0];
                                        const dosage = dose.medicationName.split(' ').slice(1).join(' ');
                                        const colorInfo = getUniqueColor(name);
                                        
                                        return (
                                            <motion.div
                                                variants={itemVariants}
                                                key={`${dose.scheduleId}-${dose.time}`}
                                                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/20 transition-all"
                                            >
                                                {/* Glowing dot with unique color per medication */}
                                                <div className={`w-2 h-2 rounded-full ${colorInfo.bg} ${colorInfo.shadow}`} />
                                                
                                                <span className="text-sm font-medium text-white flex-1">{name} {dosage}</span>
                                                <span className="text-xs text-white/35">{dateUtils.formatTime(dose.time)}</span>
                                                
                                                {/* Action buttons */}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Taken'); }}
                                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all"
                                                >
                                                    Take
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Skipped'); }}
                                                    className="text-xs px-3 py-1.5 rounded-lg text-white/40 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                                                >
                                                    Skip
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3">✅</div>
                                    <p className="text-white/60 font-semibold">All caught up for today!</p>
                                    <p className="text-white/30 text-sm mt-1">No more doses remaining</p>
                                    <motion.button
                                        onClick={() => navigate('/schedules')}
                                        className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center mx-auto shadow-lg transition-all text-sm"
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Plus size={16} className="mr-2" /> View Schedules
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>

                        {/* Missed Doses */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5"
                        >
                            <h2 className="text-sm font-semibold text-red-300 mb-6 flex items-center gap-2">
                                Missed Doses
                                <span className="h-px flex-1 bg-white/[0.06]"></span>
                            </h2>
                            {missedDoses.length > 0 ? (
                                <div className="space-y-4">
                                    {missedDoses.map(dose => (
                                        <div key={`${dose.scheduleId}-${dose.time}`} className="flex items-center justify-between text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                            <div>
                                                <span className="font-semibold text-white">{dose.medicationName}</span>
                                                <span className="ml-3 text-red-400 font-mono">{dateUtils.formatTime(dose.time)}</span>
                                            </div>
                                            <span className="text-red-400 font-bold">Missed</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-white/30 text-sm">
                                    <p>No missed doses today. Keep it up!</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5"
                        >
                            <h2 className="text-sm font-semibold text-white/60 mb-6 flex items-center gap-2">
                                Recent Activity
                                <span className="h-px flex-1 bg-white/[0.06]"></span>
                            </h2>
                            {summary.recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {summary.recentActivity.map(log => (
                                        <div
                                            key={log._id}
                                            className="flex items-center justify-between text-sm bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3"
                                        >
                                            <div className="flex items-center">
                                                {log.status === 'Taken' ? (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mr-3" />
                                                ) : log.status === 'Missed' ? (
                                                    <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] mr-3" />
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] mr-3" />
                                                )}
                                                <span className="font-semibold text-white">{log.medicationName}</span>
                                            </div>
                                            <span className="text-white/40 font-mono text-xs">{new Date(log.actionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-white/30 text-sm">
                                    <p>No recent activity to show.</p>
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
                        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5">
                            <h2 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                                Achievements 
                                <span className="h-px flex-1 bg-white/[0.06]"></span>
                                <span className="text-xs text-violet-400">{unlockedCount}/{totalAchievements} unlocked</span>
                            </h2>
                            <div className="grid grid-cols-4 gap-3">
                                {achievementsList.map(ach => (
                                    <motion.div
                                        key={ach.id}
                                        whileHover={{ scale: 1.05 }}
                                        className={`rounded-xl p-3 text-center border transition-all ${
                                            ach.unlocked
                                                ? 'bg-violet-500/10 border-violet-500/30'
                                                : 'bg-white/[0.03] border-white/[0.06] opacity-40 grayscale'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{ach.icon}</div>
                                        <p className={`text-[9px] font-semibold uppercase tracking-wide 
                                            ${ach.unlocked ? 'text-violet-300' : 'text-white/30'}`}>
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
