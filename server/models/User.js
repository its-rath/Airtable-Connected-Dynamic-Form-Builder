const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    airtableId: {
        type: String,
        required: true,
        unique: true,
    },
    email: String,
    name: String,
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    tokenExpiresAt: {
        type: Date,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
