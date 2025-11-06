const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration - Cho phép frontend Render và Vercel access
const corsOptions = {
  origin: [
    "http://localhost:3000", // Development
    "https://group-project-iezl.onrender.com", // Production Frontend Render
    "https://group-project-self.vercel.app", // Production Frontend Vercel
    process.env.FRONTEND_URL, // Dynamic từ .env
  ].filter(Boolean), // Loại bỏ undefined
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// THÊM: Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB da ket noi thanh cong."))
  .catch((err) => console.error("Loi ket noi MongoDB:", err));

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

// Routes
app.use("/api/auth", authRoutes); // Auth routes: /api/auth/signup, /api/auth/login, /api/auth/logout
app.use("/api", profileRoutes); // Profile routes: /api/profile (GET, PUT)
app.use("/api/admin", adminRoutes); // Admin routes: /api/admin/users, /api/admin/make-admin
app.use("/", userRoutes);

// SỬA: Lấy PORT từ .env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server dang chay tren port ${PORT}`));
