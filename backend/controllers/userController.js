// Dùng mảng tạm để giả lập database
let users = [
    { id: 1, name: "User 1 (tạm)", email: "user1@test.com" },
    { id: 2, name: "User 2 (tạm)", email: "user2@test.com" }
];
let nextId = 3;

// API GET /users
// Mục tiêu: Lấy toàn bộ danh sách users
exports.getUsers = (req, res) => {
    res.json(users);
};

// API POST /users
// Mục tiêu: Tạo một user mới
exports.createUser = (req, res) => {
    const { name, email } = req.body; // Lấy name, email từ request
    
    // Kiểm tra cơ bản
    if (!name || !email) {
        return res.status(400).json({ message: "Vui lòng nhập đủ tên và email" });
    }
    
    const newUser = { id: nextId++, name, email };
    users.push(newUser); // Thêm user mới vào mảng
    
    res.status(201).json(newUser); // Trả về user vừa tạo
};