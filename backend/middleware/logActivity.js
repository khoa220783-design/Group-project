const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware để ghi lại hoạt động của user
 * @param {string} action - Loại action (LOGIN_SUCCESS, LOGOUT, etc.)
 * @param {object} details - Thông tin chi tiết thêm (optional)
 */
const logActivity = (action, details = {}) => {
    return async (req, res, next) => {
        try {
            // Lấy thông tin từ request
            const userId = req.user?.userId || null;
            const email = req.user?.email || req.body?.email || null;
            const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
            const userAgent = req.headers['user-agent'] || null;

            // Lưu log vào database
            await ActivityLog.create({
                userId,
                email,
                action,
                ipAddress,
                userAgent,
                details: {
                    ...details,
                    path: req.originalUrl,
                    method: req.method
                },
                timestamp: new Date()
            });

            console.log(`📝 [LOG] ${action} - User: ${email || 'Anonymous'} - IP: ${ipAddress}`);
        } catch (error) {
            // Không block request nếu log thất bại
            console.error('❌ Lỗi ghi log:', error.message);
        }

        next(); // Tiếp tục xử lý request
    };
};

/**
 * Helper function để log từ controller (không cần middleware)
 */
const logActivityDirect = async (userId, email, action, ipAddress, userAgent, details = {}) => {
    try {
        await ActivityLog.create({
            userId,
            email,
            action,
            ipAddress,
            userAgent,
            details,
            timestamp: new Date()
        });
        console.log(`📝 [LOG] ${action} - User: ${email || 'Anonymous'} - IP: ${ipAddress}`);
    } catch (error) {
        console.error('❌ Lỗi ghi log:', error.message);
    }
};

module.exports = { logActivity, logActivityDirect };

