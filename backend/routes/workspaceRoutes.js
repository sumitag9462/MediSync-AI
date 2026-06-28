const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWorkspaces, inviteCaregiver } = require('../controllers/workspaceController');

router.get('/', protect, getWorkspaces);
router.post('/invite', protect, inviteCaregiver);

module.exports = router;
