const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose'); // THÊM

const app = express();
app.use(express.json());
app.use(cors());

// THÊM: Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB da ket noi thanh cong.'))
    .catch(err => console.error('Loi ket noi MongoDB:', err));

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/user');

// Routes
app.use('/auth', authRoutes); // Auth routes: /auth/signup, /auth/login, /auth/logout
app.use('/api', profileRoutes); // Profile routes: /api/profile (GET, PUT)
app.use('/', userRoutes);

// SỬA: Lấy PORT từ .env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server dang chay tren port ${PORT}`));