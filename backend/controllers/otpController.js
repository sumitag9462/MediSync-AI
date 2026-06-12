const twilio = require('twilio');
const crypto = require('crypto');
const otpStore = {};
const getClient = () => twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const sendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore[phone] = otp;
    try {
        await getClient().messages.create({ body: `Your MediSync-AI OTP is ${otp}`, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err) { console.error('Twilio error:', err); res.status(500).json({ success: false, message: 'Failed to send OTP' }); }
};
const verifyOtp = (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    if (otpStore[phone] && otpStore[phone] === otp) { delete otpStore[phone]; return res.json({ success: true, message: 'OTP verified successfully' }); }
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
};
module.exports = { sendOtp, verifyOtp };
