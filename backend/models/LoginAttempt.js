const mongoose = require('mongoose');

// Schema để track login attempts (cho rate limiting)
const loginAttemptSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        default: null
    },
    attempts: {
        type: Number,
        default: 1
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    },
    blockedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// TTL Index - tự động xóa sau 24h
loginAttemptSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);

