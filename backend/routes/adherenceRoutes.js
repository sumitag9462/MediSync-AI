const express = require('express');
const { getYearlyAdherence } = require('../controllers/adherenceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/yearly', protect, getYearlyAdherence);

module.exports = router;
