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
router.post('/request-email-otp', requestEmailOtp); // Frontend alias

router.post('/verify-otp', verifyEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp); // Frontend alias

router.post('/login', loginUser);

router.post('/forgot-password', requestPasswordResetOtp);
router.post('/request-password-reset-otp', requestPasswordResetOtp); // Frontend alias

router.post('/verify-reset-otp', verifyPasswordResetOtp);
router.post('/verify-password-reset-otp', verifyPasswordResetOtp); // Frontend alias

router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);
router.get('/me', protect, getProfile); // Frontend alias

router.put('/profile', protect, updateProfile);
router.put('/me', protect, updateProfile); // Frontend alias

router.post('/upload-avatar', protect, uploadPhoto);
router.post('/me/photo', protect, uploadPhoto); // Frontend alias

module.exports = router;
