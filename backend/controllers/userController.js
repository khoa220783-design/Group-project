const User = require('../models/User'); // Import model

// GET /users - Danh sách người dùng (Chỉ Admin)
exports.getUsers = async (req, res) => {
    try {
        // Lấy tất cả users nhưng không trả về password
        const users = await User.find().select('-password'); 
        
        res.json({
            message: 'Lấy danh sách users thành công',
            total: users.length,
            users: users
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
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
// Quyền: Admin có thể xóa bất kỳ user nào, User chỉ có thể xóa chính mình
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL
        const currentUserId = req.user.userId; // User đang đăng nhập

        // Kiểm tra user cần xóa có tồn tại không
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ 
                message: "Không tìm thấy user" 
            });
        }

        // Lấy thông tin user hiện tại để check role
        const currentUser = await User.findById(currentUserId);
        
        // Kiểm tra quyền:
        // - Nếu là admin: có thể xóa bất kỳ ai
        // - Nếu là user: chỉ có thể xóa chính mình
        if (currentUser.role !== 'admin' && currentUserId !== id) {
            return res.status(403).json({ 
                message: 'Bạn không có quyền xóa user này' 
            });
        }

        // Không cho phép xóa chính mình (để tránh mất quyền admin)
        if (currentUserId === id) {
            return res.status(400).json({ 
                message: 'Không thể tự xóa tài khoản của chính mình' 
            });
        }

        await User.findByIdAndDelete(id);

        res.json({ 
            message: "Đã xóa user thành công",
            deletedUser: {
                id: userToDelete._id,
                name: userToDelete.name,
                email: userToDelete.email
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
    }
};