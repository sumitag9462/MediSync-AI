const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { predictDoses, todaysSchedule } = require('../controllers/aiController');

router.get('/predict', protect, predictDoses);
router.get('/today', protect, todaysSchedule);

module.exports = router;
