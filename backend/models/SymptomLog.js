const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptomName: { type: String, required: true },
    severity: { type: Number, min: 1, max: 10, required: true },
    notes: { type: String, default: '' },
    loggedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
