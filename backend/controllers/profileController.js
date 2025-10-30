const User = require('../models/User');

// GET /profile - Xem thông tin cá nhân
exports.getProfile = async (req, res) => {
    try {
        // req.user được gán từ middleware verifyToken
        // req.user chứa { userId, email }
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        res.json({
            message: 'Lấy thông tin profile thành công',
            profile: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

// PUT /profile - Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Kiểm tra có dữ liệu để update không
        if (!name && !email) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp thông tin cần cập nhật' 
            });
        }

        // Nếu có email mới, kiểm tra email đã tồn tại chưa
        if (email) {
            const existingUser = await User.findOne({ 
                email, 
                _id: { $ne: req.user.userId } // Không tính user hiện tại
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Email đã được sử dụng bởi user khác' 
                });
            }
        }

        // Tạo object chứa các field cần update
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        // Cập nhật user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { 
                new: true, // Trả về document sau khi update
                runValidators: true // Chạy validation
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        res.json({
            message: 'Cập nhật profile thành công',
            profile: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

