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

        // Gửi email THẬT qua Gmail SMTP
        try {
            await sendResetEmail(email, resetLink);
            console.log(`✅ Email reset password đã gửi tới: ${email}`);
        } catch (emailError) {
            console.error('❌ Lỗi gửi email:', emailError.message);
            // Vẫn log ra console để backup
            console.log('\n=== PASSWORD RESET EMAIL (Backup) ===');
            console.log(`To: ${email}`);
            console.log(`Reset Link: ${resetLink}`);
            console.log('====================================\n');
        }

        res.json({ 
            message: 'Nếu email tồn tại, link reset password đã được gửi'
            // KHÔNG trả resetToken/resetLink trong response (security)
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
    const transporter = nodemailer.createTransport({
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
        subject: 'Đặt lại mật khẩu - Group Project',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2AA2CD; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                    .button { background-color: #2AA2CD; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Đặt Lại Mật Khẩu</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào,</p>
                        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình tại <strong>Group Project</strong>.</p>
                        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                        <div style="text-align: center;">
                            <a href="${resetLink}" class="button">Đặt Lại Mật Khẩu</a>
                        </div>
                        <p><strong>Lưu ý:</strong></p>
                        <ul>
                            <li>Link này sẽ <strong>hết hạn sau 1 giờ</strong></li>
                            <li>Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này</li>
                            <li>Không chia sẻ link này với bất kỳ ai</li>
                        </ul>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">
                            Nếu nút không hoạt động, copy link sau vào trình duyệt:<br>
                            <span style="word-break: break-all; color: #2AA2CD;">${resetLink}</span>
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Group Project. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    await transporter.sendMail(mailOptions);
}

