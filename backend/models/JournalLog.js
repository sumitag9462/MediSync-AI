const mongoose = require('mongoose');

const journalLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transcription: {
        type: String,
        required: true,
        trim: true
    },
    mood: {
        type: String,
        default: 'Neutral'
    },
    tags: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('JournalLog', journalLogSchema);
