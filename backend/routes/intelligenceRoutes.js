const express = require('express');
const { getSafetyDashboard, getMedicationProfile } = require('../controllers/intelligenceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/safety-dashboard').get(protect, getSafetyDashboard);
router.route('/profile/:rxCui').get(protect, getMedicationProfile);

module.exports = router;
