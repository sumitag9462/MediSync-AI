const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const notificationService = require('../services/NotificationService');
const ReminderLog = require('../models/ReminderLog');
const Schedule = require('../models/Schedule');
const { addReminderJob } = require('../queues/reminderQueue');

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
    let status = 'sent';
    let errorMessage = '';
    try {
        await notificationService.sendPushNotification(userId, payload);
    } catch (err) {
        status = 'failed';
        errorMessage = err.message;
        console.error(`Failed to send push notification to user ${userId}:`, err.message);
    }

    // Save Audit Log
    await ReminderLog.create({
        user: userId,
        scheduleId,
        medicineName,
        scheduledTime: time,
        status,
        errorMessage
    });

    // Enqueue the next day's reminder (24 hours from now) if schedule is still active
    const schedule = await Schedule.findById(scheduleId);
    if (schedule && schedule.isActive) {
        // Enqueue exactly 24 hours from now for the same time
        const twentyFourHours = 24 * 60 * 60 * 1000;
        await addReminderJob({ scheduleId, userId, medicineName, time }, twentyFourHours);
    }

    return { success: true };
}, { 
    connection: redisConnection,
    concurrency: 5 // Process up to 5 jobs concurrently
});

reminderWorker.on('completed', (job) => {
    console.log(`✅ Job completed for reminder ${job.id}`);
});

reminderWorker.on('failed', (job, err) => {
    console.error(`❌ Job failed for reminder ${job?.id}:`, err.message);
});

reminderWorker.on('error', (err) => {
    console.error(`⚠️ Reminder Worker Error (Redis likely unavailable):`, err.message);
});

module.exports = reminderWorker;
