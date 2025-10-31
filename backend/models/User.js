const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Đảm bảo email không bị trùng
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Mật khẩu tối thiểu 6 ký tự
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'], // 3 roles: user, admin, moderator
        default: 'user' // Mặc định là user
    },
    avatar: {
        type: String,
        default: null // URL của avatar trên Cloudinary
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('User', userSchema);