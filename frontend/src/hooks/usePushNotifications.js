import { useState, useEffect } from 'react';
import axios from 'axios';

// Helper to convert VAPID key format for the browser
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushNotifications = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        // Check current subscription status when component mounts
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsSubscribed(true);
                        setSubscription(sub);
                    }
                });
            });
        }
    }, []);

    const subscribe = async () => {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                alert('Push notifications are not supported by your browser.');
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            
            // 1. Get VAPID public key from backend
            const { data: { publicKey } } = await axios.get('/api/push/vapidPublicKey', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            // 2. Subscribe to PushManager
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // 3. Send subscription object to backend
            await axios.post('/api/push/subscribe', sub, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setSubscription(sub);
            setIsSubscribed(true);
            alert('Successfully subscribed to push notifications!');
            
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            if (Notification.permission === 'denied') {
                alert('You have blocked notifications. Please enable them in your browser settings.');
            } else {
                alert('Failed to subscribe. Please try again.');
            }
        }
    };

    const unsubscribe = async () => {
        try {
            if (!subscription) return;

            // 1. Unsubscribe from backend
            await axios.post('/api/push/unsubscribe', { endpoint: subscription.endpoint }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // 2. Unsubscribe from PushManager
            await subscription.unsubscribe();

            setSubscription(null);
            setIsSubscribed(false);
            alert('Unsubscribed successfully.');

        } catch (error) {
            console.error('Failed to unsubscribe:', error);
        }
    };

    return {
        isSubscribed,
        subscribe,
        unsubscribe
    };
};
