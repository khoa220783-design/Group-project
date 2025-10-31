const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const uploadController = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/auth');
const { loginRateLimit } = require('../middleware/rateLimit');

// Các route công khai (không cần token)
router.post('/signup', authController.signup);
router.post('/login', loginRateLimit, authController.login); // 🛡️ Rate limiting cho login
router.post('/logout', authController.logout);

// Refresh Token route (public)
router.post('/refresh', authController.refresh);

// Password Reset routes (public)
router.post('/forgot-password', passwordResetController.forgotPassword);
router.post('/reset-password', passwordResetController.resetPassword);

// Route bảo vệ (cần token)
router.get('/me', verifyToken, authController.getCurrentUser);

// Upload Avatar (cần token)
router.post('/upload-avatar', verifyToken, uploadController.uploadAvatar);
router.delete('/delete-avatar', verifyToken, uploadController.deleteAvatar);

// Test endpoint để kiểm tra Cloudinary config
router.get('/test-cloudinary', (req, res) => {
    res.json({
        message: 'Cloudinary config check',
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗'
    });
});

module.exports = router;

