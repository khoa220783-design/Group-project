import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from './Header';
import './Admin.css';

const API_URL = "http://localhost:5000";

function AdminDashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        users: 0
    });

    useEffect(() => {
        // Kiểm tra quyền admin
        if (user && user.role !== 'admin') {
            toast.error('Bạn không có quyền truy cập trang này');
            navigate('/');
            return;
        }
        
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const usersList = response.data.users;
            setUsers(usersList);
            
            // Tính toán thống kê
            const adminCount = usersList.filter(u => u.role === 'admin').length;
            const userCount = usersList.filter(u => u.role === 'user').length;
            
            setStats({
                total: usersList.length,
                admins: adminCount,
                users: userCount
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Không thể tải danh sách users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Bạn có chắc muốn xóa user "${userName}"?`)) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(`Đã xóa user "${userName}" thành công`);
            fetchUsers(); // Reload danh sách
        } catch (error) {
            console.error('Error deleting user:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi khi xóa user';
            toast.error(errorMsg);
        }
    };

    const handleMakeAdmin = async (userId, userName) => {
        if (!window.confirm(`Cấp quyền admin cho "${userName}"?`)) {
            return;
        }

        try {
            await axios.put(`${API_URL}/admin/make-admin/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(`Đã cấp quyền admin cho "${userName}"`);
            fetchUsers();
        } catch (error) {
            console.error('Error making admin:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi khi cấp quyền';
            toast.error(errorMsg);
        }
    };

    const handleRemoveAdmin = async (userId, userName) => {
        if (!window.confirm(`Hủy quyền admin của "${userName}"?`)) {
            return;
        }

        try {
            await axios.put(`${API_URL}/admin/remove-admin/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(`Đã hủy quyền admin của "${userName}"`);
            fetchUsers();
        } catch (error) {
            console.error('Error removing admin:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi khi hủy quyền';
            toast.error(errorMsg);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="loading">Đang tải...</div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="admin-dashboard">
                <div className="admin-container">
                    <h1>Admin Dashboard</h1>
                    
                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-info">
                                <h3>{stats.total}</h3>
                                <p>Tổng Users</p>
                            </div>
                        </div>
                        <div className="stat-card admin-stat">
                            <div className="stat-info">
                                <h3>{stats.admins}</h3>
                                <p>Admins</p>
                            </div>
                        </div>
                        <div className="stat-card user-stat">
                            <div className="stat-info">
                                <h3>{stats.users}</h3>
                                <p>Users</p>
                            </div>
                        </div>
                    </div>

                    {/* User List Table */}
                    <div className="admin-section">
                        <h2>Danh Sách Người Dùng</h2>
                        
                        {users.length === 0 ? (
                            <div className="empty-state">
                                <p>Không có user nào</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Tên</th>
                                            <th>Email</th>
                                            <th>Vai trò</th>
                                            <th>Ngày tạo</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u, index) => (
                                            <tr key={u._id} className={u._id === user.id ? 'current-user' : ''}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="user-name">
                                                        {u.name}
                                                        {u._id === user.id && (
                                                            <span className="badge-you">Bạn</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`role-badge ${u.role}`}>
                                                        {u.role === 'admin' ? 'Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {u._id !== user.id && (
                                                            <>
                                                                {u.role === 'user' ? (
                                                                    <button
                                                                        className="btn-action btn-promote"
                                                                        onClick={() => handleMakeAdmin(u._id, u.name)}
                                                                        title="Cấp quyền admin"
                                                                    >
                                                                        Cấp Admin
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="btn-action btn-demote"
                                                                        onClick={() => handleRemoveAdmin(u._id, u.name)}
                                                                        title="Hủy quyền admin"
                                                                    >
                                                                        Hủy Admin
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="btn-action btn-delete"
                                                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                                                    title="Xóa user"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </>
                                                        )}
                                                        {u._id === user.id && (
                                                            <span className="text-muted">Bạn không thể tự xóa</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminDashboard;

