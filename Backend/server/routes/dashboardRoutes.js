const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard/summary - A single endpoint to get all dashboard data
router.get('/summary', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

        // Get active schedules and all dose logs in parallel for efficiency
        const [schedules, doseLogs] = await Promise.all([
            Schedule.find({ user: userId, isActive: true }),
            DoseLog.find({ user: userId })
        ]);

        // 1. Calculate Upcoming Doses (exclude ones already logged)
        const now = new Date();

        // Consider only schedules that start now or earlier (today or before)
        const eligibleSchedules = schedules.filter(s => s.startDate <= now);

        // Build upcoming doses (future times today)
        const upcomingDoses = eligibleSchedules.flatMap(s =>
            s.times.map(time => {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = new Date(startOfToday);
                doseTime.setHours(hour, minute, 0, 0);

                if (doseTime <= now) return null; // only future doses
                return { scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time };
            }).filter(Boolean)
        ).sort((a, b) => a.time.localeCompare(b.time));

        // Build missed doses (past times today or earlier not logged yet)
        const missedDoses = eligibleSchedules.flatMap(s =>
            s.times.map(time => {
                const [hour, minute] = time.split(':').map(Number);
                const doseTime = new Date(startOfToday);
                doseTime.setHours(hour, minute, 0, 0);
                if (doseTime > now) return null; // only past/now doses
                return { scheduleId: s._id, medicationName: `${s.name} ${s.dosage}`, time };
            }).filter(Boolean)
        ).sort((a, b) => a.time.localeCompare(b.time));

        // 2. Get Recent Activity (include Missed)
        const recentActivity = doseLogs
            .filter(log => ['Taken', 'Skipped', 'Missed'].includes(log.status))
            .sort((a, b) => b.actionTime - a.actionTime)
            .slice(0, 5);

        // 3. Calculate 7-day Adherence (include Missed)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weekLogs = doseLogs.filter(log => log.actionTime > sevenDaysAgo && (log.status === 'Taken' || log.status === 'Skipped' || log.status === 'Missed'));
        const takenInWeek = weekLogs.filter(l => l.status === 'Taken').length;
        const adherenceWeekly = weekLogs.length > 0 ? Math.round((takenInWeek / weekLogs.length) * 100) : 0;

        // 4. Calculate Current Streak (break on Missed or Skipped)
        let currentStreak = 0;
        for (let i = 0; i < 365; i++) { // check up to 1 year but break early
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

        // 5. Compute Achievements (simple rule-based badges)
        // Achievements are simple strings; you can later store earned badges in DB per user if desired.
        const achievements = [];
        if (currentStreak >= 7) achievements.push({ key: 'streak-7', title: '7-day streak', emoji: '🔥', description: 'You kept a 7-day streak! Keep going.' });
        if (currentStreak >= 30) achievements.push({ key: 'streak-30', title: '30-day streak', emoji: '🏆', description: 'Amazing — 30 days of consistency!' });
        if (adherenceWeekly >= 90) achievements.push({ key: 'consistency-star', title: 'Consistency Star', emoji: '⭐', description: '90%+ adherence for the last 7 days.' });
        if (recentActivity.length >= 5) achievements.push({ key: 'active-week', title: 'Active Week', emoji: '📈', description: 'You have recent consistent activity.' });

        // Remove duplicates and keep unique by key
        const uniqueAchievements = [];
        const seen = new Set();
        for (const a of achievements) {
            if (!seen.has(a.key)) {
                seen.add(a.key);
                uniqueAchievements.push(a);
            }
        }

        res.json({
            kpis: { adherenceWeekly, currentStreak, upcomingToday: upcomingDoses.length },
            upcomingDoses,
            missedDoses,
            recentActivity,
            achievements: uniqueAchievements,
        });

    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
