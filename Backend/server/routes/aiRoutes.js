// backend/server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/predict', protect, async (req, res) => {
  try {
    const { predictMissedDoses } = await import('../../src/services/aiAdherenceService.js');
    const result = await predictMissedDoses(req.user._id);
    res.json(result);
  } catch (error) {
    console.error('AI Prediction Error:', error);
    res.status(500).json({ message: 'Prediction failed' });
  }
});

// GET /api/ai/todays-schedule
router.get('/todays-schedule', protect, async (req, res) => {
  try {
    const { getTodaysSchedule } = await import('../../src/services/aiAdherenceService.js');
    const result = await getTodaysSchedule(req.user._id);
    res.json(result);
  } catch (error) {
    console.error('AI Schedule Error:', error);
    res.status(500).json({ message: 'Failed to fetch today\'s schedule' });
  }
});

module.exports = router;
