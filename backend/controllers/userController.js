const User = require('../models/User'); // Import model

// GET /users
exports.getUsers = async (req, res) => {
    try {
        // Thay vì mảng tạm, giờ ta tìm trong DB
        const users = await User.find(); 
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /users
exports.createUser = async (req, res) => {
    // Tạo 1 đối tượng User mới từ model
    const newUser = new User({
        name: req.body.name,
        email: req.body.email
    });

    try {
        // Lưu vào DB
        const savedUser = await newUser.save(); 
        res.status(201).json(savedUser);
    } catch (err) {
        // Lỗi (ví dụ: trùng email, thiếu name/email)
        res.status(400).json({ message: err.message });
    }
};