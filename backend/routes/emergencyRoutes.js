const express = require('express');
const { upsertEmergencyProfile, getMyEmergencyProfile, getPublicEmergencyCard } = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/profile', protect, upsertEmergencyProfile);
router.get('/profile', protect, getMyEmergencyProfile);
router.get('/public/:slug', getPublicEmergencyCard); // PUBLIC — no auth middleware

module.exports = router;
