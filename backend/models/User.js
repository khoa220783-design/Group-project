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
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('User', userSchema);