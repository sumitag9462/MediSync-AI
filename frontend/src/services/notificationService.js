import { pushApi } from '../api/pushApi';

// Helper to convert VAPID key
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const scheduledNotifications = new Set();

export const notificationService = {
  requestPermission: async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("This browser does not support desktop notification or service workers");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        await notificationService.subscribeToPush();
      } else {
        console.log("Notification permission not granted.");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  },

  subscribeToPush: async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Send existing subscription to server just in case
        await pushApi.subscribe(subscription);
        return;
      }

      // Fetch VAPID Key from backend
      const { publicKey } = await pushApi.getVapidPublicKey();
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send new subscription to backend
      await pushApi.subscribe(subscription);
      console.log("Successfully subscribed to Web Push.");
    } catch (error) {
      console.error("Web Push Subscription failed:", error);
    }
  },

  showNotification: (title, options) => {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  },

  setReminder: (schedule) => {
    if (!schedule) {
      console.error("❌ setReminder called with undefined schedule");
      return;
    }

    // 🕒 Support array-based times like ["17:30"]
    const timesArray = Array.isArray(schedule.times)
      ? schedule.times
      : schedule.time
      ? [schedule.time]
      : [];

    if (timesArray.length === 0) {
      console.error("❌ No valid times found in schedule:", schedule);
      return;
    }

    const medicationName = schedule.name || "medicine";
    const scheduleId = schedule._id || schedule.id || "unknown";

    timesArray.forEach((time) => {
      if (!time || typeof time !== "string") {
        console.error("❌ Invalid time format:", time);
        return;
      }

      const notificationId = `${scheduleId}-${time}`;
      if (scheduledNotifications.has(notificationId)) {
        console.log(`⏰ Reminder already scheduled for ${medicationName} at ${time}`);
        return;
      }

      const [hour, minute] = time.split(":").map(Number);
      const now = new Date();
      const notificationTime = new Date();
      notificationTime.setHours(hour, minute, 0, 0);

      const timeToNotification = notificationTime.getTime() - now.getTime();

      if (timeToNotification > 0) {
        setTimeout(() => {
          notificationService.showNotification("💊 Medication Reminder", {
            body: `It's time to take your ${medicationName} (${schedule.dosage || ''}mg).`,
            icon: "/vite.svg", // Replace with your app's icon
          });
          scheduledNotifications.delete(notificationId);
        }, timeToNotification);

        scheduledNotifications.add(notificationId);
        console.log(`✅ Reminder set for ${medicationName} at ${time}`);
      } else {
        console.log(`⏩ Skipping past reminder for ${medicationName} (${time})`);
      }
    });
  },
};
