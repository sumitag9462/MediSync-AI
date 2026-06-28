const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

// Create the reminder queue
const reminderQueue = new Queue('ReminderQueue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000, // 5s, 10s, 20s...
        },
        removeOnComplete: true,
        removeOnFail: false // Keep failed jobs for the Dead Letter Queue / Monitoring
    }
});

/**
 * Enqueue a reminder job for a specific schedule and time.
 * @param {Object} data - Payload containing scheduleId, userId, medicineName, time.
 * @param {Number} delayMs - How many milliseconds from now to run the job.
 */
const addReminderJob = async (data, delayMs) => {
    try {
        const jobId = `${data.scheduleId}-${data.time.replace(/:/g, '')}-${Date.now()}`;
        await reminderQueue.add('sendReminder', data, {
            jobId, // Unique ID to prevent duplicates if needed
            delay: Math.max(0, delayMs),
        });
        console.log(`⏱️ Reminder scheduled for ${data.medicineName} in ${delayMs}ms`);
    } catch (error) {
        console.error('Error adding reminder job:', error);
    }
};

/**
 * Remove all pending jobs for a specific schedule.
 * Helpful when a schedule is deleted or updated.
 * Note: For production, tracking Job IDs in MongoDB might be better.
 */
const removeJobsForSchedule = async (scheduleId) => {
    try {
        const jobs = await reminderQueue.getDelayed();
        for (const job of jobs) {
            if (job.data.scheduleId === scheduleId.toString()) {
                await job.remove();
            }
        }
    } catch (error) {
        console.error('Error removing jobs for schedule:', error);
    }
};

module.exports = {
    reminderQueue,
    addReminderJob,
    removeJobsForSchedule
};
