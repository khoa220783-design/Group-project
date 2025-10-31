const User = require('../models/User');

// GET /admin/users - Lấy danh sách tất cả users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        res.json({
            message: 'Lấy danh sách users thành công',
            count: users.length,
            users
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
    }
};

// PUT /admin/users/:id - Cập nhật role của user (Admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const currentUserId = req.user.userId;

        // Validate role
        if (!['user', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({ 
                message: 'Role không hợp lệ. Chỉ chấp nhận: user, admin, moderator' 
            });
        }

        // Không cho phép tự thay đổi role của chính mình
        if (currentUserId === id) {
            return res.status(400).json({ 
                message: 'Không thể tự thay đổi role của chính mình' 
            });
        }

        // Tìm và update user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        user.role = role;
        await user.save();

        res.json({
            message: `Đã cập nhật role thành ${role} thành công`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
    }
};

// DELETE /admin/users/:id - Xóa user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.userId;

        // Không cho phép tự xóa chính mình
        if (currentUserId === id) {
            return res.status(400).json({ 
                message: 'Không thể tự xóa tài khoản của chính mình' 
            });
        }

        // Tìm và xóa user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        res.json({
            message: 'Đã xóa user thành công',
            deletedUser: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
    }
};

// PUT /admin/make-admin/:id - Chuyển user thành admin (chỉ admin hiện tại mới làm được)
exports.makeAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm user cần update
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        // Kiểm tra user đã là admin chưa
        if (user.role === 'admin') {
            return res.status(400).json({ 
                message: 'User này đã là admin rồi' 
            });
        }

        // Update role thành admin
        user.role = 'admin';
        await user.save();

        res.json({
            message: 'Đã cấp quyền admin thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
    }
};

// PUT /admin/remove-admin/:id - Hủy quyền admin (chỉ admin hiện tại mới làm được)
exports.removeAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.userId;

        // Không cho phép tự hủy quyền admin của chính mình
        if (currentUserId === id) {
            return res.status(400).json({ 
                message: 'Không thể tự hủy quyền admin của chính mình' 
            });
        }

        // Tìm user cần update
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        // Kiểm tra user có phải admin không
        if (user.role !== 'admin') {
            return res.status(400).json({ 
                message: 'User này không phải là admin' 
            });
        }

        // Update role thành user
        user.role = 'user';
        await user.save();

        res.json({
            message: 'Đã hủy quyền admin thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
    }
};

// POST /admin/create-first-admin - Tạo admin đầu tiên (chỉ dùng khi chưa có admin nào)
exports.createFirstAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp email của user cần set làm admin' 
            });
        }

        // Kiểm tra đã có admin nào chưa
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ 
                message: 'Đã có admin trong hệ thống. Không thể tạo admin đầu tiên nữa.' 
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user với email này' 
            });
        }

        // Update role thành admin
        user.role = 'admin';
        await user.save();

        res.json({
            message: 'Đã tạo admin đầu tiên thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: err.message 
        });
    }
};

