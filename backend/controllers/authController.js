const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
                email: savedUser.email
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

        // Tạo JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Trả về token và thông tin user
        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
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

// POST /logout - Đăng xuất
// Lưu ý: JWT là stateless, nên việc logout chủ yếu xử lý ở phía client
// (xóa token khỏi localStorage/sessionStorage)
exports.logout = (req, res) => {
    // Phía server chỉ cần trả về message thành công
    // Client sẽ xóa token khi nhận được response này
    res.json({ 
        message: 'Đăng xuất thành công' 
    });
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

