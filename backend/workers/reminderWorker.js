const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const notificationService = require('../services/notificationService');

/**
 * Worker that processes the ReminderQueue.
 * Handles the logic of sending a push notification/email when the job is executed.
 */
const reminderWorker = new Worker('ReminderQueue', async (job) => {
    const { scheduleId, userId, medicineName, time } = job.data;
    console.log(`👷 Processing reminder job: ${job.id} for ${medicineName}`);

    // Build the payload for the notification
    const payload = {
        title: 'Medication Reminder',
        body: `It's time to take your medication: ${medicineName} at ${time}.`,
        icon: '/icons/icon-192x192.png', // Ensure icon exists in frontend public/icons
        data: {
            scheduleId,
            url: '/schedules' // URL to open when notification is clicked
        }
    };

    // Send push notification
    await notificationService.sendPushNotification(userId, payload);

    return { success: true };
}, { 
    connection: redisConnection,
    concurrency: 5 // Process up to 5 jobs concurrently
});

reminderWorker.on('completed', (job) => {
    console.log(`✅ Job completed for reminder ${job.id}`);
});

reminderWorker.on('failed', (job, err) => {
    console.error(`❌ Job failed for reminder ${job.id}:`, err.message);
});

module.exports = reminderWorker;
