import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import StatCard from '../Components/cards/StatCard';
import { Clock, BarChart2, Zap, Plus, Check, X, AlertTriangle } from 'lucide-react';
import { dateUtils } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { otherApi } from '../api/otherApi';
import { medicineApi } from '../api/medicineApi';
import { predictionService } from '../services/predictionService';
import { notificationService } from '../services/notificationService';

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

            // Backwards compatibility: some older code used scheduleNotification
            (summaryData.upcomingDoses || []).forEach(dose => {
                // Use scheduleNotification so setReminder will schedule properly
                notificationService.scheduleNotification(dose);
            });

            // Gamification: check achievements and trigger celebration for newly reached ones
            try {
                const achievements = summaryData.achievements || [];
                const seen = JSON.parse(localStorage.getItem('achievementsSeen') || '[]');
                const newOnes = achievements.filter(a => !seen.includes(a.key));
                if (newOnes.length > 0) {
                    // mark them as seen
                    const newSeen = [...seen, ...newOnes.map(a => a.key)];
                    localStorage.setItem('achievementsSeen', JSON.stringify(newSeen));

                    // celebrate the first new one (you could iterate and show all)
                    const first = newOnes[0];
                    if (first) {
                        // show confetti / emoji burst UI
                        setCelebrate(true);
                        clearTimeout(celebrateTimeoutRef.current);
                        celebrateTimeoutRef.current = setTimeout(() => setCelebrate(false), 4200);

                        // show a milestone notification + sound/vibration
                        notificationService.showMilestone(first);
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

    // Avoid duplicate initial fetches in StrictMode/dev by guarding with a ref
    const hasFetchedRef = useRef(false);
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
            notificationService.requestPermission();
        }
    }, [fetchData]);

    // Periodically refresh dashboard summary so time-based sections update automatically
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData();
        }, 60000); // every 60 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleLogDose = async (dose, status) => {
        // same logic as you had — unchanged
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

    // Upcoming/missed logic unchanged
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

    // Auto-log missed doses as "Missed"
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

    if (loading || !summary) return <div className="text-center p-10">Loading Dashboard...</div>;

    // helper render for achievement badges
    const renderAchievements = (achievements) => {
        if (!achievements || achievements.length === 0) {
            return (
                <div className="text-center text-gray-400">No achievements yet — start a streak!</div>
            );
        }
        return (
            <div className="flex flex-wrap gap-3">
                {achievements.map(a => (
                    <div key={a.key} className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-xl border border-purple-800/30">
                        <span className="text-xl">{a.emoji}</span>
                        <div className="text-left">
                            <div className="font-bold text-white leading-tight">{a.title}</div>
                            <div className="text-xs text-purple-200">{a.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
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

            <div className="w-full flex justify-center items-center mb-8 z-10 relative">
                <div className="h-1 w-32 rounded-full bg-gradient-to-r from-purple-500/40 via-pink-400/30 to-purple-500/40 animate-pulse" />
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-8 z-10 relative w-full max-w-7xl mx-auto px-4 md:px-8">
                <motion.h1
                    className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    Welcome back, {user?.name.split(' ')[0]}!
                </motion.h1>

                {prediction && (
                    <motion.div
                        className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative flex items-center justify-center shadow-lg"
                        role="alert"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <AlertTriangle className="mr-3 animate-bounce"/>
                        <span className="block sm:inline">{prediction}</span>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <StatCard title="Upcoming Doses Today" value={upcomingDoses.length} icon={<Clock size={24}/>} color="bg-blue-500/20 text-blue-300" />
                    <StatCard title="Adherence (7d)" value={`${summary.kpis.adherenceWeekly}%`} icon={<BarChart2 size={24}/>} color="bg-green-500/20 text-green-300" />
                    <StatCard title="Current Streak" value={`${summary.kpis.currentStreak} Days`} icon={<Zap size={24}/>} color="bg-yellow-500/20 text-yellow-300" />
                </div>

                <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto">
                    {/* Achievements / Gamification Panel */}
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-purple-900/30 w-full p-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                    >
                        <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">Achievements</h2>
                        { renderAchievements(summary.achievements) }
                    </motion.div>

                    {/* Upcoming Doses Section */}
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-purple-900/30 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight">Upcoming Doses</h2>
                        {upcomingDoses.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingDoses.map(dose => (
                                    <motion.div
                                        key={`${dose.scheduleId}-${dose.time}`}
                                        className="bg-gradient-to-r from-purple-900/40 to-pink-900/30 p-5 rounded-2xl flex justify-between items-center backdrop-blur-md hover:scale-[1.03] hover:shadow-2xl transition-all border border-purple-800/30"
                                        whileHover={{ scale: 1.03 }}
                                    >
                                        <div>
                                            <p className="font-bold text-lg text-white">{dose.medicationName.split(' ')[0]}</p>
                                            <p className="text-sm text-purple-200">{dose.medicationName.split(' ').slice(1).join(' ')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-xl text-purple-400 mr-4">{dateUtils.formatTime(dose.time)}</p>
                                            <button type="button" onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Skipped'); }} title="Skip Dose" className="p-3 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 hover:scale-110 transition-all"><X size={18}/></button>
                                            <button type="button" onClick={(e) => { e.preventDefault(); handleLogDose(dose, 'Taken'); }} title="Take Dose" className="p-3 bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/40 hover:scale-110 transition-all"><Check size={18}/></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p>No more upcoming doses for today. Great job!</p>
                                <motion.button
                                    onClick={() => navigate('/schedules')}
                                    className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl flex items-center mx-auto shadow-lg transition-all text-lg"
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Plus size={20} className="mr-2" /> View Schedules
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Missed Doses Section */}
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-red-900/30 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                    >
                        <h2 className="text-2xl font-extrabold text-red-300 mb-6 tracking-tight">Missed Doses</h2>
                        {missedDoses.length > 0 ? (
                            <ul className="space-y-4">
                                {missedDoses.map(dose => (
                                    <li key={`${dose.scheduleId}-${dose.time}`} className="flex items-center justify-between text-base bg-red-900/20 rounded-xl px-4 py-3">
                                        <div>
                                            <span className="font-semibold text-white">{dose.medicationName}</span>
                                            <span className="ml-3 text-red-400 font-mono">{dateUtils.formatTime(dose.time)}</span>
                                        </div>
                                        <span className="text-red-400 font-bold">Missed</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <p>No missed doses today. Keep it up!</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Recent Activity Section */}
                    <motion.div
                        className="panel-glass panel-hover panel-inner-pad shadow-2xl border border-purple-900/30 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight">Recent Activity</h2>
                        {summary.recentActivity.length > 0 ? (
                            <ul className="space-y-4">
                                {summary.recentActivity.map(log => (
                                    <motion.li
                                        key={log._id}
                                        className="flex items-center justify-between text-base hover:bg-black/10 rounded-xl px-4 py-3 transition-all"
                                        whileHover={{ scale: 1.025 }}
                                    >
                                        <div className="flex items-center">
                                            {log.status === 'Taken' ? (
                                                <Check size={18} className="mr-3 text-green-400"/>
                                            ) : log.status === 'Missed' ? (
                                                <AlertTriangle size={18} className="mr-3 text-yellow-400"/>
                                            ) : log.status === 'Skipped' ? (
                                                <X size={18} className="mr-3 text-red-400"/>
                                            ) : null}
                                            <span className="font-semibold text-white">{log.medicationName}</span>
                                        </div>
                                        <span className="text-purple-200 font-mono">{new Date(log.actionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p>No recent activity to show.</p>
                                <p className="text-base mt-2">Doses you take or miss will appear here.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;
