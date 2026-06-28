const mongoose = require('mongoose');

const insightCacheSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    insights: [{
        type: { type: String, enum: ['pattern', 'warning', 'positive', 'suggestion'] },
        message: { type: String, required: true },
        relatedData: { type: mongoose.Schema.Types.Mixed }
    }],
    lastAnalyzed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('InsightCache', insightCacheSchema);
