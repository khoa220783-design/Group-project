import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Header from './components/Header';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import ActivityLogs from './components/ActivityLogs';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

// Main Dashboard Component - Trang chủ sau khi đăng nhập
function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Nếu là admin, redirect về trang admin
        if (user && user.role === 'admin') {
            navigate('/admin');
        }
    }, [user, navigate]);

    return (
        <div className="dashboard">
            <Header />
            <div className="dashboard-content">
                <div className="content-wrapper">
                    <div className="welcome-section">
                        <h1>Xin chào, {user?.name}!</h1>
                        <p>Chào mừng bạn đến với hệ thống quản lý user</p>
                        
                        <div className="quick-links">
                            <div className="link-card" onClick={() => navigate('/profile')}>
                                <h3>Thông tin cá nhân</h3>
                                <p>Xem và cập nhật profile của bạn</p>
                            </div>
                            
                            {user && user.role === 'admin' && (
                                <>
                                    <div className="link-card" onClick={() => navigate('/admin')}>
                                        <h3>Quản lý Users</h3>
                                        <p>Quản lý tất cả users trong hệ thống</p>
                                    </div>
                                    <div className="link-card" onClick={() => navigate('/logs')}>
                                        <h3>📊 Activity Logs</h3>
                                        <p>Xem nhật ký hoạt động người dùng</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
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
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Protected routes */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/logs" 
                        element={
                            <ProtectedRoute>
                                <ActivityLogs />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
