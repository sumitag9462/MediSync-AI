const { predictMissedDoses, getTodaysSchedule } = require('../services/aiAdherenceService');
const predictDoses = async (req, res) => {
    try { res.json(await predictMissedDoses(req.user._id)); }
    catch (error) { console.error('AI prediction error:', error); res.status(500).json({ message: 'Prediction failed' }); }
};
const todaysSchedule = async (req, res) => {
    try { res.json(await getTodaysSchedule(req.user._id)); }
    catch (error) { console.error("Today's schedule error:", error); res.status(500).json({ message: "Failed to fetch today's schedule" }); }
};
module.exports = { predictDoses, todaysSchedule };
