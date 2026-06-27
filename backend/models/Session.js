const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    refreshToken: { type: String, required: true },
    deviceInfo: { type: String },
    ipAddress: { type: String },
    lastActivity: { type: Date, default: Date.now },
    isValid: { type: Boolean, default: true }
}, { timestamps: true });

// Auto expire session if inactive
sessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('Session', sessionSchema);
