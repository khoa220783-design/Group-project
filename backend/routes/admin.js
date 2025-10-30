const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST /admin/create-first-admin - Tạo admin đầu tiên (public route - chỉ dùng 1 lần)
router.post('/create-first-admin', adminController.createFirstAdmin);

// PUT /admin/make-admin/:id - Cấp quyền admin cho user (cần là admin)
router.put('/make-admin/:id', verifyToken, isAdmin, adminController.makeAdmin);

// PUT /admin/remove-admin/:id - Hủy quyền admin (cần là admin)
router.put('/remove-admin/:id', verifyToken, isAdmin, adminController.removeAdmin);

module.exports = router;

