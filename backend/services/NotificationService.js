const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

const webpush = require('web-push');

// Configure web-push conditionally
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    } catch (e) {
        logger.warn('Failed to configure web-push VAPID details: ' + e.message);
    }
} else {
    logger.warn('VAPID keys not configured in .env. Push notifications will be disabled.');
}

const PushSubscription = require('../models/PushSubscription');

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: env.EMAIL.USER, pass: env.EMAIL.PASS },
        });
    }

    async sendEmailOtp(email, otp) {
        if (env.EMAIL.USER && env.EMAIL.PASS) {
            try {
                await this.transporter.sendMail({
                    from: `MediSync-AI <${env.EMAIL.USER}>`,
                    to: email,
                    subject: 'Your MediSync-AI Verification Code',
                    text: `Your OTP for MediSync-AI is: ${otp}. It will expire in 5 minutes.`,
                    html: `<div style="font-family:sans-serif;text-align:center;padding:20px"><h2>MediSync-AI Verification</h2><p>Your one-time password is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:5px;margin:20px 0;background:#f0f0f0;padding:10px;border-radius:5px">${otp}</p><p>This code will expire in 5 minutes.</p></div>`,
                });
                logger.info(`OTP sent to ${email}`);
            } catch (mailError) {
                logger.error('SMTP Mail error, falling back to console log:', mailError);
                logger.info(`Local Dev OTP for ${email}: ${otp}`);
            }
        } else {
            logger.warn('EMAIL_USER/EMAIL_PASS not configured in .env!');
            logger.info(`Local Dev OTP for ${email}: ${otp}`);
        }
    }

    /**
     * Send a web push notification to a user.
     */
    async sendPushNotification(userId, payload) {
        try {
            // Get all subscriptions for this user
            const subscriptions = await PushSubscription.find({ user: userId });
            
            if (!subscriptions || subscriptions.length === 0) {
                logger.info(`No push subscriptions found for user ${userId}`);
                return;
            }

            const notificationPayload = JSON.stringify(payload);

            // Send to all devices
            const pushPromises = subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(sub.subscription, notificationPayload);
                } catch (error) {
                    // If subscription is invalid/expired (HTTP 410), remove it
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        logger.info('Subscription expired, removing from DB.');
                        await PushSubscription.deleteOne({ _id: sub._id });
                    } else {
                        logger.error('Error sending push notification:', error);
                    }
                }
            });

            await Promise.all(pushPromises);

        } catch (error) {
            logger.error('Error in sendPushNotification:', error);
        }
    }
}

module.exports = new NotificationService();
