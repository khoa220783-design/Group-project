const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin, checkRole } = require('../middleware/auth');

// POST /admin/create-first-admin - Tạo admin đầu tiên (public route - chỉ dùng 1 lần)
router.post('/create-first-admin', adminController.createFirstAdmin);

// ===== RBAC ROUTES (Admin only) =====

// GET /admin/users - Lấy danh sách users (Admin only)
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);

// PUT /admin/users/:id - Cập nhật role của user (Admin only)
router.put('/users/:id', verifyToken, isAdmin, adminController.updateUserRole);

// DELETE /admin/users/:id - Xóa user (Admin only)
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);

// ===== Legacy routes (giữ lại để tương thích) =====

// PUT /admin/make-admin/:id - Cấp quyền admin cho user (cần là admin)
router.put('/make-admin/:id', verifyToken, isAdmin, adminController.makeAdmin);

// PUT /admin/remove-admin/:id - Hủy quyền admin (cần là admin)
router.put('/remove-admin/:id', verifyToken, isAdmin, adminController.removeAdmin);

module.exports = router;

