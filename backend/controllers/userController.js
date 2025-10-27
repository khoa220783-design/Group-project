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

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL
        const { name, email } = req.body; // Lấy data mới

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { name, email }, // Data cần cập nhật
            { new: true } // Tùy chọn này để nó trả về user sau khi đã update
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.json(updatedUser); // Trả về user đã cập nhật
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE /users/:id
// Mục tiêu: Xóa user theo ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.json({ message: "Đã xóa user thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};