const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    medicineName: { type: String, required: true },
    scheduledTime: { type: String, required: true }, // e.g., "08:00"
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    errorMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReminderLog', reminderLogSchema);
