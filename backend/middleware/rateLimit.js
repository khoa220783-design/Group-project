const LoginAttempt = require('../models/LoginAttempt');

/**
 * Rate Limiting Middleware - Chống brute force login
 * Quy tắc:
 * - Cho phép 5 lần thử trong 15 phút
 * - Nếu vượt quá: Block IP trong 15 phút
 */
const loginRateLimit = async (req, res, next) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const email = req.body.email;

        // Tìm login attempt từ IP này
        let attempt = await LoginAttempt.findOne({ ipAddress });

        // Nếu chưa có, tạo mới
        if (!attempt) {
            attempt = await LoginAttempt.create({
                ipAddress,
                email,
                attempts: 1,
                lastAttempt: new Date()
            });
            return next();
        }

        // Kiểm tra nếu IP đang bị block
        if (attempt.blockedUntil && attempt.blockedUntil > new Date()) {
            const remainingTime = Math.ceil((attempt.blockedUntil - new Date()) / 1000 / 60);
            return res.status(429).json({
                message: `⚠️ Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ${remainingTime} phút.`,
                blockedUntil: attempt.blockedUntil,
                remainingMinutes: remainingTime
            });
        }

        // Reset nếu đã qua 15 phút kể từ lần thử cuối
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (attempt.lastAttempt < fifteenMinutesAgo) {
            attempt.attempts = 1;
            attempt.lastAttempt = new Date();
            attempt.blockedUntil = null;
            await attempt.save();
            return next();
        }

        // Tăng số lần thử
        attempt.attempts += 1;
        attempt.lastAttempt = new Date();
        attempt.email = email;

        // Nếu vượt quá 5 lần → Block 15 phút
        if (attempt.attempts > 5) {
            attempt.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            await attempt.save();

            console.log(`🚫 [RATE LIMIT] IP ${ipAddress} đã bị block do login thất bại quá nhiều lần`);

            return res.status(429).json({
                message: '⚠️ Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.',
                blockedUntil: attempt.blockedUntil,
                remainingMinutes: 15
            });
        }

        await attempt.save();
        console.log(`⚠️ [RATE LIMIT] IP ${ipAddress} - Lần thử: ${attempt.attempts}/5`);

        next();
    } catch (error) {
        console.error('❌ Lỗi rate limiting:', error.message);
        next(); // Không block request nếu rate limiting thất bại
    }
};

/**
 * Reset login attempts khi đăng nhập thành công
 */
const resetLoginAttempts = async (ipAddress) => {
    try {
        await LoginAttempt.deleteOne({ ipAddress });
        console.log(`✅ [RATE LIMIT] Reset attempts cho IP ${ipAddress}`);
    } catch (error) {
        console.error('❌ Lỗi reset login attempts:', error.message);
    }
};

module.exports = { loginRateLimit, resetLoginAttempts };

