import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Auth.css';
import API_BASE_URL from '../config/api';

const API_URL = API_BASE_URL;

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error('Email không hợp lệ');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            
            toast.success('✅ Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.', {
                autoClose: 5000
            });
            
            // Xóa email input sau khi gửi thành công
            setEmail('');
            setLoading(false);
        } catch (error) {
            console.error('Forgot password error:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            toast.error(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Quên Mật Khẩu</h2>
                
                <p className="auth-description">
                    Nhập email của bạn để đặt lại mật khẩu
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Gửi Link Đặt Lại'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login" className="auth-link">
                        Quay lại đăng nhập
                    </Link>
                    <span className="separator">•</span>
                    <Link to="/signup" className="auth-link">
                        Chưa có tài khoản?
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

