import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css';

const API_URL = "http://localhost:5000";

// Protected Route Component
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

// TÁCH FORM SỬA RA THÀNH COMPONENT RIÊNG (cho dễ quản lý)
function EditUser({ user, onUserUpdated, onCancel, token }) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gọi API PUT với token trong header
            await axios.put(
                `${API_URL}/users/${user._id}`, 
                { name, email },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Cập nhật user thành công!');
            onUserUpdated(); // Báo App.js tải lại
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error('Có lỗi khi cập nhật user');
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

// Main Dashboard Component
function Dashboard() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const { token } = useAuth();

    // Hàm tải User
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Xử lý Thêm
    const handleUserAdded = () => {
        fetchUsers();
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa user này?")) {
            try {
                await axios.delete(`${API_URL}/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Xóa user thành công!');
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error('Có lỗi khi xóa user');
            }
        }
    };

    // Xử lý khi nhấn nút Sửa
    const handleEdit = (user) => {
        setEditingUser(user);
    };

    // Xử lý khi nhấn nút Hủy (ở form Sửa)
    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    // Xử lý khi cập nhật (Sửa) xong
    const handleUserUpdated = () => {
        setEditingUser(null);
        fetchUsers();
    };

    return (
        <div className="dashboard">
            <Header />
            <div className="dashboard-content">
                <div className="content-wrapper">
                    {/* HIỂN THỊ CÓ ĐIỀU KIỆN:
                      Nếu đang sửa -> Hiện form Sửa
                      Nếu không -> Hiện form Thêm
                    */}
                    {editingUser ? (
                        <EditUser 
                            user={editingUser} 
                            onUserUpdated={handleUserUpdated} 
                            onCancel={handleCancelEdit}
                            token={token}
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
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Protected routes */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
