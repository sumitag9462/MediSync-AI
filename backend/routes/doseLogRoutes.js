const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDoseLogs, createDoseLog } = require('../controllers/doseLogController');

router.use(protect);

router.route('/')
    .get(getDoseLogs)
    .post(createDoseLog);

module.exports = router;
