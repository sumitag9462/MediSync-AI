const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    user:      { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name:      { type: String, required: true, trim: true },
    dosage:    { type: String, required: true },
    times:     [{ type: String }],
    frequency: { type: String, required: true, default: 'daily' },
    history: [{
        date:   { type: Date, default: Date.now },
        status: { type: String, enum: ['taken', 'missed', 'snoozed'], required: true },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
