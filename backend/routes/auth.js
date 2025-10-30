const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const uploadController = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/auth');

// Các route công khai (không cần token)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Password Reset routes (public)
router.post('/forgot-password', passwordResetController.forgotPassword);
router.post('/reset-password', passwordResetController.resetPassword);

// Route bảo vệ (cần token)
router.get('/me', verifyToken, authController.getCurrentUser);

// Upload Avatar (cần token)
router.post('/upload-avatar', verifyToken, uploadController.uploadAvatar);
router.delete('/delete-avatar', verifyToken, uploadController.deleteAvatar);

module.exports = router;

