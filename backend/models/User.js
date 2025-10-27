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
    }
});

module.exports = mongoose.model('User', userSchema);