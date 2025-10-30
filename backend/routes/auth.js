const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Các route công khai (không cần token)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Route bảo vệ (cần token)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;

