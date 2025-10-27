import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css'; 

const API_URL = "http://localhost:3000";

// TÁCH FORM SỬA RA THÀNH COMPONENT RIÊNG (cho dễ quản lý)
function EditUser({ user, onUserUpdated, onCancel }) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gọi API PUT
            await axios.put(`${API_URL}/users/${user._id}`, { name, email });
            onUserUpdated(); // Báo App.js tải lại
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Sửa User: {user.name}</h3>
            <input
                type="text"
                placeholder="Tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Cập nhật</button>
            <button type="button" onClick={onCancel}>Hủy</button>
        </form>
    );
}


function App() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null); // STATE MỚI: Lưu user đang sửa

    // Hàm tải User (giữ nguyên)
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Xử lý Thêm (giữ nguyên)
    const handleUserAdded = () => {
        fetchUsers(); 
    };

    // HÀM MỚI: Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa user này?")) {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchUsers(); // Tải lại danh sách sau khi xóa
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    // HÀM MỚI: Xử lý khi nhấn nút Sửa
    const handleEdit = (user) => {
        setEditingUser(user); // Lưu user đang sửa vào state
    };

    // HÀM MỚI: Xử lý khi nhấn nút Hủy (ở form Sửa)
    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    // HÀM MỚI: Xử lý khi cập nhật (Sửa) xong
    const handleUserUpdated = () => {
        setEditingUser(null); // Xóa user đang sửa
        fetchUsers(); // Tải lại danh sách
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Quản lý User</h1>
                
                {/* HIỂN THỊ CÓ ĐIỀU KIỆN:
                  Nếu đang sửa -> Hiện form Sửa
                  Nếu không -> Hiện form Thêm
                */}
                {editingUser ? (
                    <EditUser 
                        user={editingUser} 
                        onUserUpdated={handleUserUpdated} 
                        onCancel={handleCancelEdit} 
                    />
                ) : (
                    <AddUser onUserAdded={handleUserAdded} />
                )}
                
                {/* Truyền 2 hàm mới vào UserList */}
                <UserList 
                    users={users} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                />
            </header>
        </div>
    );
}

export default App;