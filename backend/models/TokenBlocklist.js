const mongoose = require('mongoose');

const tokenBlocklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically remove document after 30 days (matches JWT expiry)
    }
});

module.exports = mongoose.model('TokenBlocklist', tokenBlocklistSchema);
