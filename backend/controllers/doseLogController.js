const DoseLog = require('../models/DoseLog');
const getDoseLogs = async (req, res) => {
    try { res.json(await DoseLog.find({ user: req.user._id }).sort({ actionTime: -1 })); }
    catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};
const createDoseLog = async (req, res) => {
    try {
        const { scheduleId, medicationName, scheduledTime, time, actionTime, status } = req.body;
        if (!scheduleId || !medicationName || !scheduledTime || !actionTime || !status)
            return res.status(400).json({ message: 'Required fields missing.' });
        const log = await new DoseLog({ user: req.user._id, scheduleId, medicationName, scheduledTime, time, actionTime, status }).save();
        res.status(201).json(log);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};
module.exports = { getDoseLogs, createDoseLog };
