const DoseLog = require('../models/DoseLog');
const Workspace = require('../models/Workspace');
const SocketService = require('../services/SocketService');

const getDoseLogs = async (req, res) => {
    try { 
        // Only fetch logs from the last 90 days to prevent huge payloads
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        res.json(await DoseLog.find({ user: req.user._id, actionTime: { $gte: ninetyDaysAgo } }).sort({ actionTime: -1 })); 
    }
    catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};
const createDoseLog = async (req, res) => {
    try {
        const { scheduleId, medicationName, scheduledTime, time, actionTime, status } = req.body;
        if (!scheduleId || !medicationName || !scheduledTime || !actionTime || !status)
            return res.status(400).json({ message: 'Required fields missing.' });
        const log = await new DoseLog({ user: req.user._id, scheduleId, medicationName, scheduledTime, time, actionTime, status }).save();
        
        // Emit real-time update to caregiver workspace
        try {
            const workspace = await Workspace.findOne({ patient: req.user._id });
            if (workspace) {
                SocketService.emitToWorkspace(workspace._id.toString(), 'dose_logged', {
                    patientId: req.user._id,
                    log
                });
            }
        } catch (socketError) {
            console.error("Socket emission failed:", socketError);
        }
        
        res.status(201).json(log);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};
module.exports = { getDoseLogs, createDoseLog };
