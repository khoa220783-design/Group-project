# 🚀 Group Project - Hệ Thống Quản Lý User Nâng Cao

> Dự án full-stack MERN với các tính năng nâng cao: JWT Authentication, Refresh Token, RBAC, Activity Logging, Rate Limiting, Redux, và nhiều hơn nữa.

---

## 📋 Mục Lục
- [Tính Năng](#-tính-năng)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [API Endpoints](#-api-endpoints)
- [Demo & Screenshots](#-demo--screenshots)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)

---

## ✨ Tính Năng

### 🔐 **Xác Thực & Bảo Mật**
- ✅ Đăng ký, đăng nhập với JWT
- ✅ **Refresh Token** - Tự động làm mới access token khi hết hạn
- ✅ **Rate Limiting** - Chống brute force login (5 lần/15 phút)
- ✅ **Forgot/Reset Password** - Gửi email thật với link reset
- ✅ Protected Routes - Chặn truy cập nếu chưa đăng nhập

### 👥 **Quản Lý User & RBAC**
- ✅ **Role-Based Access Control**: Admin, Moderator, User
- ✅ Admin quản lý users: Xem, thêm, sửa role, xóa
- ✅ Phân quyền chặt chẽ theo role
- ✅ Profile cá nhân với khả năng cập nhật

### 🖼️ **Upload & Media**
- ✅ Upload avatar với Cloudinary
- ✅ Tự động resize ảnh (500x500px) với Sharp
- ✅ Xóa avatar cũ khi upload mới
- ✅ Validation file size & type

### 📊 **Activity Logging & Monitoring**
- ✅ Ghi lại toàn bộ hoạt động user (login, logout, upload, v.v.)
- ✅ Admin xem logs với filter & pagination
- ✅ Thống kê logs theo action, user, thời gian
- ✅ Tích hợp MongoDB để lưu trữ logs

### 🎨 **Frontend Modern**
- ✅ Redux Toolkit - Quản lý state tập trung
- ✅ Redux DevTools - Debug dễ dàng
- ✅ Protected Routes với React Router
- ✅ UI/UX đẹp, responsive
- ✅ Toast notifications (React Toastify)

---

## 🛠️ Công Nghệ Sử Dụng

### **Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt (mã hóa mật khẩu)
- Cloudinary (lưu trữ ảnh)
- Multer + Sharp (xử lý upload)
- Nodemailer (gửi email)
- Crypto (tạo token)

### **Frontend**
- React.js 18
- Redux Toolkit + React-Redux
- React Router DOM v6
- Axios (HTTP client)
- React Toastify (notifications)
- CSS3 (responsive design)

---

## 📥 Cài Đặt

### **Yêu cầu:**
- Node.js >= 14.x
- MongoDB (local hoặc MongoDB Atlas)
- Gmail App Password (để gửi email)
- Cloudinary Account (để upload ảnh)

### **1. Clone Repository**
```bash
git clone https://github.com/<your-username>/Group-project.git
cd Group-project
```

### **2. Cài Đặt Backend**
```bash
cd backend
npm install
```

### **3. Cài Đặt Frontend**
```bash
cd ../frontend
npm install
```

---

## ⚙️ Cấu Hình

### **Backend - Tạo file `.env`**

Tạo file `backend/.env` với nội dung:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/group-project
# Hoặc sử dụng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/group-project

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary (Đăng ký tại: https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP (Tạo App Password tại: https://myaccount.google.com/apppasswords)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

### **Hướng dẫn lấy Gmail App Password:**
1. Vào: https://myaccount.google.com/apppasswords
2. Chọn "Mail" → "Windows Computer"
3. Click "Generate" → Copy mã 16 ký tự
4. Dán vào `SMTP_PASS`

### **Hướng dẫn lấy Cloudinary Credentials:**
1. Đăng ký tại: https://cloudinary.com
2. Vào Dashboard
3. Copy: Cloud name, API Key, API Secret
4. Dán vào `.env`

---

## 🚀 Chạy Ứng Dụng

### **Chạy Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
→ Server chạy tại: http://localhost:5000

### **Chạy Frontend (Terminal 2):**
```bash
cd frontend
npm start
```
→ Ứng dụng mở tại: http://localhost:3000

---

## 📡 API Endpoints

### **Authentication**
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/signup` | Đăng ký tài khoản | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/auth/logout` | Đăng xuất | ❌ |
| POST | `/api/auth/refresh` | Làm mới access token | ❌ |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ |

### **Password Reset**
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/forgot-password` | Gửi email reset password | ❌ |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu | ❌ |

### **Avatar Upload**
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/upload-avatar` | Upload avatar | ✅ |
| DELETE | `/api/auth/delete-avatar` | Xóa avatar | ✅ |

### **Admin - User Management**
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/admin/users` | Lấy danh sách users | ✅ Admin |
| PUT | `/api/admin/users/:id` | Cập nhật role user | ✅ Admin |
| DELETE | `/api/admin/users/:id` | Xóa user | ✅ Admin |

### **Admin - Activity Logs**
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/admin/logs` | Xem activity logs | ✅ Admin |
| GET | `/api/admin/logs/stats` | Thống kê logs | ✅ Admin |

---

## 📸 Demo & Screenshots

### **1. Đăng Nhập & Redux DevTools**
![Login with Redux](screenshots/login-redux.png)

### **2. Dashboard với Role-Based UI**
![Dashboard](screenshots/dashboard.png)

### **3. Upload Avatar**
![Avatar Upload](screenshots/avatar-upload.png)

### **4. Activity Logs (Admin)**
![Activity Logs](screenshots/activity-logs.png)

### **5. Forgot Password Email**
![Email Template](screenshots/email-template.png)

---

## 📂 Cấu Trúc Thư Mục

```
Group-project/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cấu hình Cloudinary
│   ├── controllers/
│   │   ├── authController.js      # Login, signup, refresh token
│   │   ├── adminController.js     # Quản lý users, xem logs
│   │   ├── uploadController.js    # Upload/delete avatar
│   │   └── passwordResetController.js  # Forgot/reset password
│   ├── middleware/
│   │   ├── auth.js                # Verify JWT, check role
│   │   ├── logActivity.js         # Ghi log hoạt động
│   │   └── rateLimit.js           # Rate limiting login
│   ├── models/
│   │   ├── User.js                # Schema User
│   │   ├── RefreshToken.js        # Schema Refresh Token
│   │   ├── PasswordReset.js       # Schema Password Reset
│   │   ├── ActivityLog.js         # Schema Activity Log
│   │   └── LoginAttempt.js        # Schema Login Attempt (rate limit)
│   ├── routes/
│   │   ├── auth.js                # Routes auth
│   │   └── admin.js               # Routes admin
│   ├── .env                       # Environment variables
│   ├── server.js                  # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx          # Trang đăng nhập
│   │   │   ├── Signup.jsx         # Trang đăng ký
│   │   │   ├── ForgotPassword.jsx # Quên mật khẩu
│   │   │   ├── ResetPassword.jsx  # Đặt lại mật khẩu
│   │   │   ├── Profile.jsx        # Profile với upload avatar
│   │   │   ├── Header.jsx         # Header với user info
│   │   │   ├── AdminDashboard.jsx # Quản lý users
│   │   │   ├── ActivityLogs.jsx   # Xem logs
│   │   │   └── Auth.css           # Styles
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   └── authSlice.js   # Redux slice cho auth
│   │   │   └── store.js           # Redux store
│   │   ├── utils/
│   │   │   └── axiosInstance.js   # Axios với auto refresh token
│   │   ├── App.js                 # Main app với routes
│   │   └── index.js
│   └── package.json
│
├── README.md                      # Tài liệu này
└── .gitignore
```

---

## 🧪 Testing

### **Test với Postman:**

Import collection từ file `Postman_Collection.json` (nếu có)

**Hoặc test thủ công:**

1. **Đăng ký:**
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

2. **Đăng nhập:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

3. **Lấy thông tin user:**
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_access_token>
```

---

## 👥 Tài Khoản Demo

Sau khi seed database:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| moderator@example.com | mod123 | Moderator |
| user@example.com | user123 | User |

---

## 🐛 Troubleshooting

### **1. Không kết nối được MongoDB**
```bash
# Kiểm tra MongoDB đang chạy:
mongod --version

# Hoặc sử dụng MongoDB Atlas (cloud)
```

### **2. Email không gửi được**
- Kiểm tra Gmail App Password đúng chưa
- Kiểm tra `SMTP_USER` phải là email đầy đủ
- Bật "Less secure app access" (nếu cần)

### **3. Cloudinary lỗi 401**
- Kiểm tra Cloud Name, API Key, API Secret
- Lưu ý phân biệt hoa thường

### **4. Redux DevTools không hiện**
- Cài extension: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd

---

## 📚 Tài Liệu Tham Khảo

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Cloudinary API](https://cloudinary.com/documentation)
- [Nodemailer Guide](https://nodemailer.com/)

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập

---

## 👨‍💻 Tác Giả

**Group Project Team**
- Sinh viên 1: Backend Developer
- Sinh viên 2: Frontend Developer
- Sinh viên 3: Database & Testing

---

## 🙏 Cảm Ơn

Cảm ơn đã sử dụng project này! Nếu có thắc mắc, vui lòng tạo issue trên GitHub.

**⭐ Đừng quên star repo nếu thấy hữu ích!**
