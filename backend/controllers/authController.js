const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');
const upload = require('../middleware/uploadMiddleware');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const requestEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User with this email already exists.' });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ email, otp });
        await transporter.sendMail({
            from: `MediSync-AI <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your MediSync-AI Verification Code',
            text: `Your OTP for MediSync-AI registration is: ${otp}. It will expire in 5 minutes.`,
            html: `<div style="font-family:sans-serif;text-align:center;padding:20px"><h2>MediSync-AI Verification</h2><p>Your one-time password is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:5px;margin:20px 0;background:#f0f0f0;padding:10px;border-radius:5px">${otp}</p><p>This code will expire in 5 minutes.</p></div>`,
        });
        res.status(200).json({ message: 'Verification code sent to your email.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending verification code.' });
    }
};

const verifyEmailOtp = async (req, res) => {
    try {
        const { name, email, password, mobile, place, otp } = req.body;
        if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired verification code.' });
        const newUser = await User.create({ name, email, password, mobile, place });
        await OTP.deleteMany({ email });
        if (newUser) {
            res.status(201).json({ success: true, message: 'Registration successful! Please log in.' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                token: jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' }),
                user: { id: user._id, name: user.name, email: user.email, photo: user.photo || '' },
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

const requestPasswordResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(200).json({ message: 'If an account with this email exists, a verification code has been sent.' });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ email, otp });
        await transporter.sendMail({
            from: `MediSync-AI <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your MediSync-AI Password Reset Code',
            html: `<div style="font-family:sans-serif;text-align:center;padding:20px"><h2>MediSync-AI Password Reset</h2><p>Your one-time password is:</p><p style="font-size:24px;font-weight:bold">${otp}</p><p>This code will expire in 5 minutes.</p></div>`,
        });
        res.status(200).json({ message: 'A verification code has been sent to your email.' });
    } catch (error) {
        console.error('Password reset OTP error:', error);
        res.status(500).json({ message: 'Error sending verification code.' });
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
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
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
            const user = await User.findByIdAndUpdate(req.user._id, { photo: photoPath }, { new: true }).select('-password');
            return res.json({ photo: photoPath, user });
        } catch (dbErr) {
            console.error('Avatar DB error:', dbErr);
            return res.status(500).json({ message: 'Server error saving photo' });
        }
    });
};

module.exports = { requestEmailOtp, verifyEmailOtp, loginUser, requestPasswordResetOtp, verifyPasswordResetOtp, resetPassword, getProfile, updateProfile, uploadPhoto };
