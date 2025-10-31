const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { logActivityDirect } = require('../middleware/logActivity');

// Multer config - lưu file tạm thời trong memory
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        // Chỉ cho phép upload ảnh
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)'));
        }
    }
}).single('avatar');

// POST /upload-avatar - Upload avatar lên Cloudinary
exports.uploadAvatar = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            // Kiểm tra lỗi upload
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ 
                        message: 'File quá lớn. Kích thước tối đa là 5MB' 
                    });
                }
                return res.status(400).json({ 
                    message: 'Lỗi upload file', 
                    error: err.message 
                });
            } else if (err) {
                return res.status(400).json({ 
                    message: err.message 
                });
            }

            // Kiểm tra có file không
            if (!req.file) {
                return res.status(400).json({ 
                    message: 'Vui lòng chọn file ảnh' 
                });
            }

            // RESIZE ẢNH BẰNG SHARP trước khi upload
            const resizedImageBuffer = await sharp(req.file.buffer)
                .resize(500, 500, {
                    fit: 'cover', // Crop để fit 500x500
                    position: 'center' // Center crop
                })
                .jpeg({ quality: 90 }) // Convert sang JPEG, quality 90%
                .toBuffer();

            // Upload lên Cloudinary
            // Convert resized buffer to base64
            const fileStr = `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`;

            const uploadResponse = await cloudinary.uploader.upload(fileStr, {
                folder: 'group-project/avatars', // Folder trên Cloudinary
                resource_type: 'image'
                // Không cần transformation vì đã resize bằng Sharp rồi
            });

            // Lấy user ID từ token (đã verify bởi middleware)
            const userId = req.user.userId;

            // Tìm user và xóa avatar cũ trên Cloudinary (nếu có)
            const user = await User.findById(userId);
            if (user.avatar) {
                // Extract public_id từ URL cũ và xóa
                try {
                    const urlParts = user.avatar.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    const publicId = `group-project/avatars/${fileName.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteErr) {
                    console.error('Error deleting old avatar:', deleteErr);
                }
            }

            // Cập nhật avatar URL trong database
            user.avatar = uploadResponse.secure_url;
            await user.save();

            // 📝 LOG: Upload avatar
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];
            await logActivityDirect(userId, user.email, 'AVATAR_UPLOAD', ipAddress, userAgent, {
                avatarUrl: uploadResponse.secure_url
            });

            res.json({
                message: 'Upload avatar thành công',
                avatar: uploadResponse.secure_url,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('=== UPLOAD ERROR DETAILS ===');
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Cloudinary config check:');
            console.error('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
            console.error('- API Key:', process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗');
            console.error('- API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗');
            console.error('============================');
            
            res.status(500).json({ 
                message: 'Lỗi server khi upload avatar', 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
};

// DELETE /delete-avatar - Xóa avatar
exports.deleteAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Tìm user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'Không tìm thấy user' 
            });
        }

        if (!user.avatar) {
            return res.status(400).json({ 
                message: 'User chưa có avatar' 
            });
        }

        // Xóa avatar trên Cloudinary
        try {
            const urlParts = user.avatar.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = `group-project/avatars/${fileName.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (deleteErr) {
            console.error('Error deleting avatar from Cloudinary:', deleteErr);
        }

        // Xóa avatar URL trong database
        user.avatar = null;
        await user.save();

        res.json({
            message: 'Xóa avatar thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

