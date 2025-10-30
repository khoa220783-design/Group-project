import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng trong AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:5000";

    // Kiểm tra token khi component mount
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                try {
                    // Gọi API để lấy thông tin user
                    const response = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${savedToken}` }
                    });
                    setUser(response.data.user);
                    setToken(savedToken);
                } catch (error) {
                    console.error('Token không hợp lệ:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Hàm đăng ký
    const signup = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/signup`, {
                name,
                email,
                password
            });

            const { token, user } = response.data;
            
            // Lưu token vào localStorage
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true, message: response.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Đăng ký thất bại' 
            };
        }
    };

    // Hàm đăng nhập
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            const { token, user } = response.data;
            
            // Lưu token vào localStorage
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true, message: response.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Đăng nhập thất bại' 
            };
        }
    };

    // Hàm đăng xuất
    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`);
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        } finally {
            // Xóa token khỏi localStorage
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        loading,
        signup,
        login,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

