const express = require('express');
const { logSymptom, getSymptomLogs } = require('../controllers/symptomController');
const { getInsights, triggerReanalysis } = require('../controllers/insightController');
const { getPrediction } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/symptoms', protect, logSymptom);
router.get('/symptoms', protect, getSymptomLogs);

router.get('/insights', protect, getInsights);
router.post('/insights/analyze', protect, triggerReanalysis);

router.get('/predictions', protect, getPrediction);

module.exports = router;
