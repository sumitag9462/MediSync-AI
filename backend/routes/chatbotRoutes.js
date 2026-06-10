const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChatbotContext, sendChatbotMessage } = require('../controllers/chatbotController');

router.use(protect);

router.get('/context', getChatbotContext);
router.post('/message', sendChatbotMessage);

module.exports = router;
