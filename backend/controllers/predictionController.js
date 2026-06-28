const missedDosePredictionService = require('../services/missedDosePredictionService');
const logger = require('../utils/logger');

const getPrediction = async (req, res) => {
    try {
        const result = await missedDosePredictionService.predictRisk(req.user._id);
        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Get prediction error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate prediction.' });
    }
};

module.exports = { getPrediction };
