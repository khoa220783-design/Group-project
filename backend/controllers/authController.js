const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// POST /signup - Đăng ký tài khoản mới
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Vui lòng điền đầy đủ thông tin (name, email, password)' 
            });
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Mật khẩu phải có ít nhất 6 ký tự' 
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Email đã được sử dụng' 
            });
        }

        // Mã hóa mật khẩu bằng bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Lưu vào database
        const savedUser = await newUser.save();

        // Tạo JWT token
        const token = jwt.sign(
            { userId: savedUser._id, email: savedUser.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' } // Token có hiệu lực 7 ngày
        );

        // Trả về thông tin user (không bao gồm password) và token
        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                avatar: savedUser.avatar
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

// POST /login - Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Vui lòng nhập email và password' 
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        // So sánh password với password đã mã hóa
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        // Tạo Access Token (15 phút)
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '15m' }
        );

        // Tạo Refresh Token (random 64 bytes hex)
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // Lưu Refresh Token vào database (expires sau 7 ngày)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt
        });

        // Trả về cả 2 tokens và thông tin user
        res.json({
            message: 'Đăng nhập thành công',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

// POST /logout - Đăng xuất (Revoke Refresh Token)
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp refresh token' 
            });
        }

        // Xóa refresh token khỏi database
        await RefreshToken.deleteOne({ token: refreshToken });

        // Client cũng cần xóa token khỏi localStorage
        res.json({ 
            message: 'Đăng xuất thành công' 
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

// POST /refresh - Lấy Access Token mới từ Refresh Token
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Kiểm tra refresh token có được gửi không
        if (!refreshToken) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp refresh token' 
            });
        }

        // Tìm refresh token trong database
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

        if (!tokenDoc) {
            return res.status(401).json({ 
                message: 'Refresh token không hợp lệ' 
            });
        }

        // Kiểm tra token đã hết hạn chưa
        if (new Date() > tokenDoc.expiresAt) {
            // Xóa token hết hạn
            await RefreshToken.deleteOne({ token: refreshToken });
            return res.status(401).json({ 
                message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại' 
            });
        }

        // Tìm user
        const user = await User.findById(tokenDoc.userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        // Tạo Access Token mới (15 phút)
        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '15m' }
        );

        // Trả về access token mới
        res.json({
            message: 'Refresh token thành công',
            accessToken: newAccessToken
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

// GET /me - Lấy thông tin user hiện tại (cần token)
exports.getCurrentUser = async (req, res) => {
    try {
        // req.user được gán từ middleware verifyToken
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: err.message 
        });
    }
};

