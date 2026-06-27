const DoseLog = require('../models/DoseLog');
const Schedule = require('../models/Schedule');
const logger = require('../utils/logger');

/**
 * GET /api/adherence/yearly
 * Returns 365 days of adherence data for the authenticated user.
 * value: 2=full, 1=partial, 0=missed, -1=no data
 */
const getYearlyAdherence = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);

        // Fetch all dose logs for the past year
        const doseLogs = await DoseLog.find({
            user: userId,
            actionTime: { $gte: oneYearAgo, $lte: today }
        }).lean();

        // Fetch all schedules (active or not) to know which days had scheduled doses
        const schedules = await Schedule.find({ user: userId }).lean();

        // Build a map of date -> { taken, total }
        const dateMap = {};

        // Initialize every day in the range
        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dateMap[dateStr] = { taken: 0, total: 0 };
        }

        // Count dose logs per day
        doseLogs.forEach(log => {
            const dateStr = new Date(log.actionTime).toISOString().split('T')[0];
            if (dateMap[dateStr]) {
                dateMap[dateStr].total++;
                if (log.status === 'Taken') {
                    dateMap[dateStr].taken++;
                }
            }
        });

        // Convert to array
        const data = Object.entries(dateMap).map(([date, counts]) => {
            let value = -1; // no data
            if (counts.total > 0) {
                if (counts.taken === counts.total) {
                    value = 2; // full adherence
                } else if (counts.taken > 0) {
                    value = 1; // partial
                } else {
                    value = 0; // missed
                }
            }
            return {
                date,
                value,
                taken: counts.taken,
                total: counts.total
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        logger.error('Yearly adherence error:', error);
        res.status(500).json({ success: false, message: 'Error fetching adherence data' });
    }
};

module.exports = { getYearlyAdherence };
