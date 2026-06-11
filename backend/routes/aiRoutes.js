const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { predictDoses, todaysSchedule } = require('../controllers/aiController');

router.get('/predict', protect, predictDoses);
router.get('/missed-risk', protect, predictDoses); // Chatbot alias

router.get('/today', protect, todaysSchedule);
router.get('/todays-schedule', protect, todaysSchedule); // Chatbot alias

module.exports = router;
