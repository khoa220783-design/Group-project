import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Auth.css';

const API_URL = "http://localhost:5000";

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            
            toast.success('Gửi yêu cầu thành công! Đang chuyển đến trang đặt lại mật khẩu...');
            
            // Chuyển thẳng đến trang reset password với token
            setTimeout(() => {
                if (response.data.resetToken) {
                    navigate(`/reset-password?token=${response.data.resetToken}`);
                } else {
                    // Fallback nếu không có token
                    toast.info('Vui lòng kiểm tra email để lấy link đặt lại mật khẩu');
                }
            }, 1500);
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

