const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Cho phép null nếu là action từ IP chưa login
    },
    email: {
        type: String,
        default: null
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'SIGNUP',
            'PASSWORD_RESET_REQUEST',
            'PASSWORD_RESET_SUCCESS',
            'AVATAR_UPLOAD',
            'PROFILE_UPDATE',
            'ROLE_CHANGED',
            'USER_DELETED',
            'ACCESS_DENIED'
        ]
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Lưu thêm thông tin chi tiết (JSON)
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để query nhanh
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ ipAddress: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 }); // Sắp xếp theo thời gian

module.exports = mongoose.model('ActivityLog', activityLogSchema);

