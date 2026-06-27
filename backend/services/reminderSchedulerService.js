const { addReminderJob, removeJobsForSchedule } = require('../queues/reminderQueue');
const logger = require('../utils/logger');

/**
 * Parses time like "08:00" and calculates milliseconds until the next occurrence.
 * If the time has passed today, it schedules for tomorrow.
 */
const calculateDelayMs = (timeStr) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    // If target time has already passed today, schedule for tomorrow
    if (targetTime.getTime() <= now.getTime()) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime.getTime() - now.getTime();
};

/**
 * Schedule the next upcoming reminder for each time slot in the schedule.
 */
const scheduleNextReminders = async (schedule) => {
    if (!schedule.isActive) return;

    try {
        // We schedule the very next occurrence of each time slot.
        for (const timeStr of schedule.times) {
            const delayMs = calculateDelayMs(timeStr);
            const payload = {
                scheduleId: schedule._id.toString(),
                userId: schedule.user.toString(),
                medicineName: schedule.name,
                time: timeStr
            };
            
            await addReminderJob(payload, delayMs);
        }
    } catch (error) {
        logger.error(`Error scheduling reminders for ${schedule._id}:`, error.message);
    }
};

/**
 * Reschedule reminders (used when a schedule is updated).
 */
const rescheduleReminders = async (schedule) => {
    await removeJobsForSchedule(schedule._id);
    await scheduleNextReminders(schedule);
};

module.exports = {
    scheduleNextReminders,
    rescheduleReminders,
    calculateDelayMs
};
