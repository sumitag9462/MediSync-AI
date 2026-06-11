const DoseLog = require('../models/DoseLog');
const Schedule = require('../models/Schedule');

// @desc    Predict missed dose risk based on recent night-time miss history
exports.predictMissedDoses = async (userId) => {
    const logs = await DoseLog.find({ user: userId }).sort({ actionTime: -1 }).limit(30);
    // basic rule: if they missed multiple night-time doses, they are high risk
    const nightMisses = logs.filter(l => {
        if (l.status !== 'Missed' && l.status !== 'Skipped') return false;
        // check if hour is night-time (>= 20:00 or <= 06:00)
        const date = new Date(l.actionTime || l.scheduledTime);
        const hour = date.getHours();
        return hour >= 20 || hour <= 6;
    });
    const riskLevel = nightMisses.length >= 3 ? 'High' : nightMisses.length >= 1 ? 'Medium' : 'Low';
    return {
        riskLevel,
        risk: riskLevel, // Chatbot compatibility alias
        missedNightCount: nightMisses.length, // Chatbot compatibility alias
        message: riskLevel === 'High' ? 'High risk of missing evening doses. Suggest setting alarms.' :
                 riskLevel === 'Medium' ? 'Moderate risk of missing evening doses.' : 'Keep up the good work!',
        factors: [`Night-time misses in past 30 logs: ${nightMisses.length}`],
    };
};

// @desc    Retrieve today's schedule for a user
exports.getTodaysSchedule = async (userId) => {
    const schedules = await Schedule.find({ user: userId, isActive: true });
    const today = new Date();
    // Return schedules that cover today
    return schedules.filter(s => s.startDate <= today && (!s.endDate || s.endDate >= today));
};
