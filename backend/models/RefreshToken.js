const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tự động xóa token đã hết hạn sau 7 ngày
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index để tìm kiếm nhanh theo userId
refreshTokenSchema.index({ userId: 1 });

// Index để tìm kiếm nhanh theo token
refreshTokenSchema.index({ token: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);

