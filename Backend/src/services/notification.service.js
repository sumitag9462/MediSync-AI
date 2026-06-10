// 💊 Smart Notification Service — handles medication reminders cleanly

const scheduledNotifications = new Map(); // track scheduled reminders and timeout ids

export const notificationService = {
  requestPermission: async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission not granted.");
      }
    }
  },

  playSound: (soundUrl = '/notification-sound.mp3') => {
    try {
      const audio = new Audio(soundUrl);
      audio.play().catch(err => console.error("Sound play failed", err));
    } catch (err) {
      console.error("playSound error", err);
    }
  },

  vibrate: (pattern = [200, 100, 200]) => {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (err) {
      // ignore vibration errors
    }
  },

  showNotification: (title, options = {}, config = {}) => {
    try {
      if (Notification.permission === "granted") {
        new Notification(title, options);
        if (config.sound) notificationService.playSound(config.sound);
        if (config.vibration) notificationService.vibrate();
      }
    } catch (err) {
      console.error("showNotification error", err);
    }
  },

  // Show a milestone notification (fun sound + vibration + emoji)
  showMilestone: (achievement) => {
    const title = `${achievement.emoji || '🎉'} ${achievement.title}`;
    const body = achievement.description || 'Great job!';
    notificationService.showNotification(title, {
      body,
      icon: '/vite.svg'
    }, { sound: '/milestone-sound.mp3', vibration: true });
  },

  // Primary reminder scheduler — works with schedule objects that have .times (array) or .time (string)
  setReminder: (schedule, userPrefs = {}) => {
    if (!schedule) {
      console.error("❌ setReminder called with undefined schedule");
      return;
    }

    const timesArray = Array.isArray(schedule.times)
      ? schedule.times
      : schedule.time
        ? [schedule.time]
        : [];

    if (timesArray.length === 0) {
      console.error("❌ No valid times found in schedule:", schedule);
      return;
    }

    const medicationName = schedule.name || schedule.medicationName || "medicine";
    const scheduleId = schedule._id || schedule.id || schedule.scheduleId || "unknown";

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
        const timeoutId = setTimeout(async () => {
          // location check if userPrefs.location provided
          if (userPrefs.location) {
            try {
              const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
              });
              const distance = getDistanceFromLatLonInMeters(
                pos.coords.latitude,
                pos.coords.longitude,
                userPrefs.location.lat,
                userPrefs.location.lng
              );
              if (distance > (userPrefs.locationRadiusMeters || 100)) {
                console.log(`Skipped ${medicationName} reminder, not at configured location`);
                scheduledNotifications.delete(notificationId);
                return;
              }
            } catch (err) {
              console.error("Geolocation check failed:", err);
            }
          }

          notificationService.showNotification("💊 Medication Reminder", {
            body: `It's time to take your ${medicationName} (${schedule.dosage || ''}).`,
            icon: "/vite.svg",
          }, userPrefs);

          // Add snooze option (simple auto-snooze scheduling)
          if (userPrefs.snoozeMinutes) {
            addSnooze(notificationId, schedule, userPrefs);
          }

          scheduledNotifications.delete(notificationId);
        }, timeToNotification);

        scheduledNotifications.set(notificationId, { timeoutId, schedule });
        console.log(`✅ Reminder set for ${medicationName} at ${time}`);
      } else {
        console.log(`⏩ Skipping past reminder for ${medicationName} (${time})`);
      }
    });
  },

  // Compatibility: previously you called scheduleNotification(dose)
  // Accepts a dose object: { scheduleId, medicationName, time }
  // Converts to a 'schedule-like' object and delegates to setReminder.
  scheduleNotification: (dose, userPrefs = {}) => {
    if (!dose) return;
    const scheduleLike = {
      name: dose.medicationName || 'medicine',
      times: Array.isArray(dose.times) ? dose.times : (dose.time ? [dose.time] : []),
      dosage: dose.dosage || '',
      _id: dose.scheduleId || dose._id || 'unknown',
    };
    notificationService.setReminder(scheduleLike, userPrefs);
  },

  // Cancel a scheduled reminder (if needed)
  cancelScheduled: (notificationId) => {
    const entry = scheduledNotifications.get(notificationId);
    if (entry && entry.timeoutId) {
      clearTimeout(entry.timeoutId);
      scheduledNotifications.delete(notificationId);
    }
  }
};

// Helper for snooze
const addSnooze = (notificationId, schedule, userPrefs) => {
  const snoozeTime = (userPrefs.snoozeMinutes || 5) * 60 * 1000;
  setTimeout(() => {
    notificationService.showNotification("💊 Snoozed Reminder", {
      body: `Snooze over! Take your ${schedule.name || schedule.medicationName}.`,
      icon: "/vite.svg",
    }, userPrefs);
  }, snoozeTime);
};

// Simple distance calculation
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
