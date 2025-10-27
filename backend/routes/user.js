const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import controller

// Định nghĩa các đường dẫn
router.get('/users', userController.getUsers); // Khi GET /users -> gọi hàm getUsers
router.post('/users', userController.createUser); // Khi POST /users -> gọi hàm createUser
router.put('/users/:id', userController.updateUser); // <-- THÊM DÒNG NÀY
router.delete('/users/:id', userController.deleteUser); // <-- THÊM DÒNG NÀY

module.exports = router;