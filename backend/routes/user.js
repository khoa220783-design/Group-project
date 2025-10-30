const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import controller
const { verifyToken, isAdmin } = require('../middleware/auth'); // Import middleware

// Định nghĩa các đường dẫn với middleware RBAC

// GET /users - Chỉ Admin mới xem được danh sách tất cả users
router.get('/users', verifyToken, isAdmin, userController.getUsers);

// POST /users - Tạo user mới (cần verify token)
router.post('/users', verifyToken, userController.createUser);

// PUT /users/:id - Cập nhật user (cần verify token)
router.put('/users/:id', verifyToken, userController.updateUser);

// DELETE /users/:id - Xóa user (Admin hoặc chính user đó)
router.delete('/users/:id', verifyToken, userController.deleteUser);

module.exports = router;