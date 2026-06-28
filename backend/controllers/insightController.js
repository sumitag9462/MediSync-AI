const patternAnalysisService = require('../services/patternAnalysisService');
const logger = require('../utils/logger');

const getInsights = async (req, res) => {
    try {
        const cache = await patternAnalysisService.getCachedInsights(req.user._id);
        res.json({ success: true, data: cache.insights || [] });
    } catch (error) {
        logger.error('Get insights error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve insights.' });
    }
};

const triggerReanalysis = async (req, res) => {
    try {
        const result = await patternAnalysisService.analyzeUserPatterns(req.user._id);
        res.json({ success: true, data: result.insights });
    } catch (error) {
        logger.error('Trigger reanalysis error:', error);
        res.status(500).json({ success: false, message: 'Failed to run analysis.' });
    }
};

module.exports = { getInsights, triggerReanalysis };
