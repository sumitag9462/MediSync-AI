// 💊 Smart Notification Service — handles medication reminders cleanly

const scheduledNotifications = new Set();

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
