const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const TokenBlocklist = require('../models/TokenBlocklist');
const env = require('../config/env');
const NotificationService = require('./NotificationService');

class AuthService {
    generateToken(userId, name) {
        return jwt.sign({ userId, name }, env.JWT_SECRET, { expiresIn: '30d' });
    }

    async generateAndSendOtp(email) {
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error('User with this email already exists.');
        }
        
        const otp = crypto.randomInt(100000, 999999).toString();
        await OTP.create({ email, otp });
        
        await NotificationService.sendEmailOtp(email, otp);
        return { message: 'Verification code generated.' };
    }

    async verifyOtpAndRegister(data) {
        const { name, email, password, mobile, place, otp } = data;
        
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long.');
        }
        
        const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });
        if (!otpRecord) {
            throw new Error('Invalid or expired verification code.');
        }
        
        const newUser = await User.create({ name, email, password, mobile, place });
        await OTP.deleteMany({ email });
        
        if (!newUser) {
            throw new Error('Invalid user data');
        }
        return { success: true, message: 'Registration successful! Please log in.' };
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            const token = this.generateToken(user._id, user.name);
            return {
                success: true,
                token,
                user: { id: user._id, name: user.name, email: user.email, photo: user.photo || '' }
            };
        }
        throw new Error('Invalid email or password');
    }

    async blockToken(token) {
        if (token) {
            await TokenBlocklist.create({ token });
        }
        return { success: true, message: 'Logged out successfully' };
    }
}

module.exports = new AuthService();
