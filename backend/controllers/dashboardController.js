const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');

const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const [schedules, doseLogs] = await Promise.all([
            Schedule.find({ user: userId, isActive: true }),
            DoseLog.find({ user: userId }),
        ]);

        const eligibleSchedules = schedules.filter(s => s.startDate <= now);

        const upcomingDoses = eligibleSchedules.flatMap(s =>
            s.times.map(time => {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = new Date(startOfToday);
                doseTime.setHours(hour, minute, 0, 0);
                if (doseTime <= now) return null;
                return { scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time };
            }).filter(Boolean)
        ).sort((a, b) => a.time.localeCompare(b.time));

        const missedDoses = eligibleSchedules.flatMap(s =>
            s.times.map(time => {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = new Date(startOfToday);
                doseTime.setHours(hour, minute, 0, 0);
                if (doseTime > now) return null;
                return { scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time };
            }).filter(Boolean)
        ).sort((a, b) => a.time.localeCompare(b.time));

        const recentActivity = doseLogs
            .filter(log => ['Taken', 'Skipped', 'Missed'].includes(log.status))
            .sort((a, b) => b.actionTime - a.actionTime)
            .slice(0, 5);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weekLogs = doseLogs.filter(log => log.actionTime > sevenDaysAgo && ['Taken', 'Skipped', 'Missed'].includes(log.status));
        const takenInWeek = weekLogs.filter(l => l.status === 'Taken').length;
        const adherenceWeekly = weekLogs.length > 0 ? Math.round((takenInWeek / weekLogs.length) * 100) : 0;

        let currentStreak = 0;
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i + 1));
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            const schedulesForDay = schedules.filter(s => s.startDate <= dayStart);
            if (schedulesForDay.length === 0) continue;
            const totalDosesScheduled = schedulesForDay.reduce((acc, s) => acc + s.times.length, 0);
            const logsForDay = doseLogs.filter(log => log.actionTime >= dayStart && log.actionTime <= dayEnd);
            const takenLogsForDay = logsForDay.filter(l => l.status === 'Taken');
            const missedOrSkipped = logsForDay.some(l => l.status === 'Missed' || l.status === 'Skipped');
            if (totalDosesScheduled > 0 && takenLogsForDay.length >= totalDosesScheduled && !missedOrSkipped) {
                currentStreak++;
            } else if (totalDosesScheduled > 0) {
                break;
            }
        }

        const seen = new Set();
        const achievements = [
            currentStreak >= 7  && { key: 'streak-7',          title: '7-Day Streak',      emoji: '🔥', description: 'You kept a 7-day streak! Keep going.' },
            currentStreak >= 30 && { key: 'streak-30',         title: '30-Day Streak',     emoji: '🏆', description: 'Amazing — 30 days of consistency!' },
            adherenceWeekly >= 90 && { key: 'consistency-star', title: 'Consistency Star', emoji: '⭐', description: '90%+ adherence for the last 7 days.' },
            recentActivity.length >= 5 && { key: 'active-week', title: 'Active Week',      emoji: '📈', description: 'You have recent consistent activity.' },
        ].filter(Boolean).filter(a => { if (seen.has(a.key)) return false; seen.add(a.key); return true; });

        res.json({
            kpis: { adherenceWeekly, currentStreak, upcomingToday: upcomingDoses.length },
            upcomingDoses, missedDoses, recentActivity, achievements,
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDashboardSummary };
