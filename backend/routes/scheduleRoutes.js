const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');

router.use(protect);

router.route('/')
    .get(getSchedules)
    .post(createSchedule);

router.route('/:id')
    .put(updateSchedule)
    .delete(deleteSchedule);

module.exports = router;
