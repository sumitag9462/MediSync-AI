const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    requestEmailOtp,
    verifyEmailOtp,
    loginUser,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    getProfile,
    updateProfile,
    uploadPhoto
} = require('../controllers/authController');

router.post('/register', requestEmailOtp);
router.post('/verify-otp', verifyEmailOtp);
router.post('/login', loginUser);
router.post('/forgot-password', requestPasswordResetOtp);
router.post('/verify-reset-otp', verifyPasswordResetOtp);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, uploadPhoto);

module.exports = router;
