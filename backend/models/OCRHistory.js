const mongoose = require('mongoose');

const ocrHistorySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    extractedData: {
        type: Array,
        default: []
    },
    confidenceScore: { 
        type: Number, 
        default: 0 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('OCRHistory', ocrHistorySchema);
