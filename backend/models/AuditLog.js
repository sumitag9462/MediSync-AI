const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    result: { type: String, enum: ['success', 'failure'], default: 'success' },
    details: { type: Object }
}, { timestamps: true });

// TTL index to automatically delete audit logs after 90 days to save space
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
