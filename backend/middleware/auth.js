const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT token
exports.verifyToken = (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        // Format: "Bearer <token>"
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                message: 'Không tìm thấy token. Vui lòng đăng nhập' 
            });
        }

        // Tách token ra khỏi "Bearer "
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Token không hợp lệ' 
            });
        }

        // Xác thực token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-secret-key'
        );

        // Gán thông tin user vào req để sử dụng ở các middleware/controller tiếp theo
        req.user = decoded;
        
        // Chuyển sang middleware/controller tiếp theo
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token đã hết hạn. Vui lòng đăng nhập lại' 
            });
        }
        
        return res.status(401).json({ 
            message: 'Token không hợp lệ',
            error: err.message 
        });
    }
};

// Middleware kiểm tra quyền Admin (RBAC)
exports.isAdmin = async (req, res, next) => {
    try {
        // req.user đã được gán từ verifyToken middleware
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                message: 'Không tìm thấy thông tin user' 
            });
        }

        // Tìm user trong database để lấy role
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        // Kiểm tra role có phải admin không
        if (user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Truy cập bị từ chối. Chỉ Admin mới có quyền thực hiện' 
            });
        }

        // Gán thêm role vào req.user
        req.user.role = user.role;
        
        // Cho phép tiếp tục
        next();
    } catch (err) {
        return res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

