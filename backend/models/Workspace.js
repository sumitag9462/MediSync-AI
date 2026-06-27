const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        role: { type: String, enum: ['caregiver', 'doctor', 'family'], required: true },
        permissions: [{ type: String }],
        status: { type: String, enum: ['pending', 'active', 'revoked'], default: 'pending' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
