const mongoose = require('mongoose');

const drugProfileSchema = new mongoose.Schema({
    rxCui: { type: String, required: true, unique: true },
    normalizedName: { type: String, required: true },
    brandNames: [{ type: String }],
    activeIngredients: [{ type: String }],
    openFdaData: {
        warnings: [{ type: String }],
        contraindications: [{ type: String }],
        adverseReactions: [{ type: String }],
        pregnancyCategory: { type: String },
        blackBoxWarnings: [{ type: String }]
    },
    lastLookup: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('DrugProfile', drugProfileSchema);
