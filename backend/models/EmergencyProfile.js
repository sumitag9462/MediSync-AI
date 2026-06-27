const mongoose = require('mongoose');
const crypto = require('crypto');

const emergencyProfileSchema = new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
    allergies:  [{ type: String }],
    emergencyContacts: [{
        name:     { type: String },
        phone:    { type: String },
        relation: { type: String }
    }],
    publicSlug: { type: String, unique: true, default: () => crypto.randomUUID() }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyProfile', emergencyProfileSchema);
