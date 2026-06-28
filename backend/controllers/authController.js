const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');
const AuthService = require('../services/AuthService');
const User = require('../models/User');
const OTP = require('../models/OTP');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const upload = require('../middleware/uploadMiddleware');
const axios = require('axios');
const env = require('../config/env');
const jwt = require('jsonwebtoken');

const googleClient = new OAuth2Client(env.GOOGLE.CLIENT_ID);

const requestEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return errorResponse(res, 400, 'Email is required.');
        const result = await AuthService.generateAndSendOtp(email);
        return successResponse(res, 200, result.message);
    } catch (error) {
        logger.error('Error sending OTP:', error);
        return errorResponse(res, 400, error.message || 'Error sending verification code.');
    }
};

const verifyEmailOtp = async (req, res) => {
    try {
        const result = await AuthService.verifyOtpAndRegister(req.body);
        return successResponse(res, 201, result.message, result);
    } catch (error) {
        logger.error('Error verifying OTP:', error);
        return errorResponse(res, 400, error.message || 'Server error during registration.');
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        return res.json(result); // preserving original format for backward compatibility
    } catch (error) {
        logger.error('Login error:', error);
        return errorResponse(res, 401, error.message || 'Server error during login.');
    }
};

const requestPasswordResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return successResponse(res, 200, 'If an account with this email exists, a verification code has been sent.');
        
        const otp = crypto.randomInt(100000, 999999).toString();
        await OTP.create({ email, otp });
        
        const NotificationService = require('../services/NotificationService');
        await NotificationService.sendEmailOtp(email, otp); // Reusing standard OTP email logic
        
        return successResponse(res, 200, 'A verification code has been generated.');
    } catch (error) {
        logger.error('Password reset OTP error:', error);
        return errorResponse(res, 500, 'Error sending verification code.');
    }
};

const verifyPasswordResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired verification code.' });
        const user = await User.findOne({ email });
        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        await OTP.deleteMany({ email });
        res.status(200).json({ success: true, resetToken });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Missing information.' });
        if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.password = password;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const userObj = user.toObject();
        userObj.photo = typeof userObj.photo === 'string' ? userObj.photo : '';
        res.json(userObj);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const updates = {};
        ['name', 'mobile', 'place', 'timezone', 'notifications'].forEach(k => {
            if (req.body[k] !== undefined) updates[k] = req.body[k];
        });
        const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after' }).select('-password');
        res.json(user);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(400).json({ message: 'Unable to update profile' });
    }
};

const uploadPhoto = (req, res) => {
    upload.single('photo')(req, res, async (err) => {
        if (err) {
            console.error('Avatar upload error:', err);
            return res.status(400).json({ message: err.message || 'Upload failed' });
        }
        try {
            if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
            const photoPath = `/uploads/avatars/${req.file.filename}`;
            const user = await User.findByIdAndUpdate(req.user._id, { photo: photoPath }, { returnDocument: 'after' }).select('-password');
            return res.json({ photo: photoPath, user });
        } catch (dbErr) {
            console.error('Avatar DB error:', dbErr);
            return res.status(500).json({ message: 'Server error saving photo' });
        }
    });
};

const removePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.photo = '';
        res.json(await user.save());
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const logoutUser = async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            await TokenBlocklist.create({ token });
        }
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        let email, name, googleId, picture;

        // JWT ID tokens always start with 'eyJ'
        if (token && token.startsWith('eyJ') && token.split('.').length === 3) {
            // It's likely a JWT (ID Token)
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
            picture = payload.picture;
        } else {
            // Treat as Access Token and fetch user info from Google endpoint
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            email = response.data.email;
            name = response.data.name;
            googleId = response.data.sub;
            picture = response.data.picture;
        }

        let user = await User.findOne({ email });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.photo) user.photo = picture;
                await user.save();
            }
        } else {
            user = await User.create({ name, email, googleId, photo: picture });
        }

        const jwtToken = generateToken(user._id, user.name);
        res.json({ _id: user._id, name: user.name, email: user.email, token: jwtToken, photo: user.photo });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
};

const appleLogin = async (req, res) => {
    try {
        const { identityToken, user: appleUserStr } = req.body;
        const appleIdTokenClaims = await appleSignin.verifyIdToken(identityToken, {
            audience: process.env.APPLE_CLIENT_ID,
            ignoreExpiration: true,
        });

        const appleId = appleIdTokenClaims.sub;
        let email = appleIdTokenClaims.email;
        let name = 'Apple User';

        if (appleUserStr) {
            try {
                const appleUser = JSON.parse(appleUserStr);
                if (appleUser.name) name = `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim();
                if (appleUser.email) email = appleUser.email;
            } catch (e) {
                console.error('Error parsing apple user object', e);
            }
        }

        if (!email) return res.status(400).json({ message: 'Email not provided by Apple' });

        let user = await User.findOne({ email });
        if (user) {
            if (!user.appleId) {
                user.appleId = appleId;
                await user.save();
            }
        } else {
            user = await User.create({ name, email, appleId });
        }

        const jwtToken = generateToken(user._id, user.name);
        res.json({ _id: user._id, name: user.name, email: user.email, token: jwtToken, photo: user.photo });
    } catch (error) {
        console.error('Apple login error:', error);
        res.status(401).json({ message: 'Invalid Apple Token' });
    }
};

module.exports = {
    requestEmailOtp, verifyEmailOtp, loginUser, logoutUser, requestPasswordResetOtp,
    verifyPasswordResetOtp, resetPassword, getProfile, updateProfile, removePhoto, uploadPhoto,
    googleLogin, appleLogin
};
