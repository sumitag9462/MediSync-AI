const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    user:     { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name:     { type: String, required: true, trim: true },
    dosage:   { type: String, required: true },
    times:    [{ type: String, required: true }],
    startDate:{ type: Date, required: true },
    duration: { type: String, required: true },
    endDate:  { type: Date },
    isActive: { type: Boolean, default: true },
    googleEventIds: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
