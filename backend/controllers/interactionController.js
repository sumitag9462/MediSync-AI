const Schedule = require('../models/Schedule');
const { checkInteractions, checkInteractionsByName } = require('../services/drugInteractionService');
const logger = require('../utils/logger');

/**
 * POST /api/interactions/check
 * Body: { newMedicine: "Ibuprofen" }
 * Check a new medicine against the user's existing active medications.
 */
const checkNewMedicineInteraction = async (req, res) => {
    try {
        const { newMedicine } = req.body;
        if (!newMedicine || !newMedicine.trim()) {
            return res.status(400).json({ success: false, message: 'newMedicine is required.' });
        }

        const existingSchedules = await Schedule.find({ user: req.user._id, isActive: true }).select('name');
        const existingNames = existingSchedules.map(s => s.name);

        if (existingNames.length === 0) {
            return res.json({
                success: true,
                data: { safe: true, interactions: [], summary: 'No existing medications to check against.', source: 'no_medicines' }
            });
        }

        const result = await checkInteractions(newMedicine.trim(), existingNames);
        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Drug interaction check error:', error);
        res.status(500).json({ success: false, message: 'Error checking drug interactions.' });
    }
};

/**
 * GET /api/interactions/full-check
 * Run full safety check across all active medications for the authenticated user.
 */
const checkFullMedicationList = async (req, res) => {
    try {
        const schedules = await Schedule.find({ user: req.user._id, isActive: true }).select('name');
        const names = schedules.map(s => s.name);

        if (names.length < 2) {
            return res.json({
                success: true,
                data: { safe: true, interactions: [], summary: 'Add at least 2 active medications to run a full safety check.' }
            });
        }

        const result = await checkInteractionsByName(names);
        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Full medication list check error:', error);
        res.status(500).json({ success: false, message: 'Error running full safety check.' });
    }
};

module.exports = { checkNewMedicineInteraction, checkFullMedicationList };
