const SymptomLog = require('../models/SymptomLog');
const patternAnalysisService = require('../services/patternAnalysisService');
const logger = require('../utils/logger');

const logSymptom = async (req, res) => {
    try {
        const { symptomName, severity, notes } = req.body;
        if (!symptomName || !severity) {
            return res.status(400).json({ success: false, message: 'Symptom name and severity are required.' });
        }

        const log = await SymptomLog.create({
            user: req.user._id,
            symptomName,
            severity,
            notes
        });

        // Trigger background re-analysis asynchronously (don't await)
        patternAnalysisService.analyzeUserPatterns(req.user._id).catch(err => 
            logger.error('Background pattern analysis failed:', err.message)
        );

        res.status(201).json({ success: true, data: log });
    } catch (error) {
        logger.error('Symptom log error:', error);
        res.status(500).json({ success: false, message: 'Failed to log symptom.' });
    }
};

const getSymptomLogs = async (req, res) => {
    try {
        const logs = await SymptomLog.find({ user: req.user._id }).sort({ loggedAt: -1 }).limit(50);
        res.json({ success: true, data: logs });
    } catch (error) {
        logger.error('Get symptoms error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve symptoms.' });
    }
};

module.exports = { logSymptom, getSymptomLogs };
