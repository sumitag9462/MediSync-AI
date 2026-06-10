const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema({
    user:           { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    scheduleId:     { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Schedule' },
    medicationName: { type: String, required: true },
    scheduledTime:  { type: Date, required: true },
    time:           { type: String }, // e.g. '08:30' to match scheduled dose entries
    actionTime:     { type: Date, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Taken', 'Skipped', 'Missed'],
    },
}, { timestamps: true });

module.exports = mongoose.model('DoseLog', doseLogSchema);
