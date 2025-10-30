const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// POST /forgot-password - Gửi email reset password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp email' 
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            // Không tiết lộ là email không tồn tại (security)
            return res.json({ 
                message: 'Nếu email tồn tại, link reset password đã được gửi' 
            });
        }

        // Tạo reset token (random 32 bytes hex)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Lưu token vào database (expires sau 1 giờ)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        await PasswordReset.create({
            userId: user._id,
            email: user.email,
            resetToken,
            expiresAt
        });

        // Tạo reset link
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // Gửi email (development mode - chỉ log ra console)
        // Trong production, sẽ gửi email thật
        console.log('\n=== PASSWORD RESET EMAIL ===');
        console.log(`To: ${email}`);
        console.log(`Subject: Reset your password`);
        console.log(`Reset Link: ${resetLink}`);
        console.log(`Token: ${resetToken}`);
        console.log(`Expires at: ${expiresAt}`);
        console.log('============================\n');

        // Optional: Gửi email thật (cần config SMTP)
        // await sendResetEmail(email, resetLink);

        res.json({ 
            message: 'Nếu email tồn tại, link reset password đã được gửi',
            // Development only - remove in production
            resetToken: resetToken,
            resetLink: resetLink
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

// POST /reset-password - Reset password với token
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validation
        if (!token || !newPassword) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp token và mật khẩu mới' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Mật khẩu phải có ít nhất 6 ký tự' 
            });
        }

        // Tìm token trong database
        const resetRecord = await PasswordReset.findOne({ 
            resetToken: token,
            used: false
        });

        if (!resetRecord) {
            return res.status(400).json({ 
                message: 'Token không hợp lệ hoặc đã được sử dụng' 
            });
        }

        // Kiểm tra token đã hết hạn chưa
        if (new Date() > resetRecord.expiresAt) {
            return res.status(400).json({ 
                message: 'Token đã hết hạn. Vui lòng yêu cầu reset mới' 
            });
        }

        // Tìm user
        const user = await User.findById(resetRecord.userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật password
        user.password = hashedPassword;
        await user.save();

        // Đánh dấu token đã sử dụng
        resetRecord.used = true;
        await resetRecord.save();

        res.json({ 
            message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới' 
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

// Helper function để gửi email (optional - cần config SMTP)
async function sendResetEmail(email, resetLink) {
    // Config SMTP transporter
    const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Email content
    const mailOptions = {
        from: `"Group Project" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset your password',
        html: `
            <h1>Reset Your Password</h1>
            <p>You requested to reset your password.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="
                background-color: #2AA2CD;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
            ">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
}

