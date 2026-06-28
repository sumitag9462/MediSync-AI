const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { logJournal, getJournals } = require('../controllers/journalController');

router.post('/', protect, logJournal);
router.get('/', protect, getJournals);

module.exports = router;
