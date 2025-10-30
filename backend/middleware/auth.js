const jwt = require('jsonwebtoken');

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

