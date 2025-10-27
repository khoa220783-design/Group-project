const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Tải các biến từ file .env

const app = express();

// Middleware
app.use(express.json()); // Cho phép server đọc JSON
app.use(cors());         // Cho phép React gọi API

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});