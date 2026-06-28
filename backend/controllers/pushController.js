const PushSubscription = require('../models/PushSubscription');
require('dotenv').config();

/**
 * Get VAPID Public Key for the frontend
 */
const getVapidPublicKey = (req, res) => {
    res.status(200).json({
        success: true,
        publicKey: process.env.VAPID_PUBLIC_KEY
    });
};

/**
 * Subscribe a user's device to Web Push notifications.
 */
const subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        const userId = req.user._id;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ success: false, message: 'Invalid subscription object.' });
        }

        // Use upsert to handle duplicates cleanly
        await PushSubscription.findOneAndUpdate(
            { user: userId, 'subscription.endpoint': subscription.endpoint },
            { user: userId, subscription },
            { upsert: true, returnDocument: 'after' }
        );

        res.status(201).json({ success: true, message: 'Subscribed to push notifications.' });
    } catch (error) {
        console.error('Push Subscription Error:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe to push notifications.' });
    }
};

/**
 * Unsubscribe a user's device.
 */
const unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        const userId = req.user._id;

        if (!endpoint) {
            return res.status(400).json({ success: false, message: 'Endpoint is required.' });
        }

        await PushSubscription.deleteOne({ user: userId, 'subscription.endpoint': endpoint });

        res.status(200).json({ success: true, message: 'Unsubscribed from push notifications.' });
    } catch (error) {
        console.error('Push Unsubscription Error:', error);
        res.status(500).json({ success: false, message: 'Failed to unsubscribe.' });
    }
};

module.exports = {
    getVapidPublicKey,
    subscribe,
    unsubscribe
};
