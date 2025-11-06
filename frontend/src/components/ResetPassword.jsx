import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Auth.css';
import API_BASE_URL from '../config/api';

const API_URL = API_BASE_URL;

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        if (!token) {
            toast.error('Token không hợp lệ hoặc đã hết hạn');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
                token,
                newPassword: password
            });
            
            toast.success(response.data.message || 'Đặt lại mật khẩu thành công!');
            
            // Chuyển về trang đăng nhập sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Reset password error:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra token có tồn tại không
    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Link Không Hợp Lệ</h2>
                    <p className="error-message">
                        Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                    </p>
                    <div className="auth-footer">
                        <Link to="/forgot-password" className="auth-link">
                            Yêu cầu link mới
                        </Link>
                        <span className="separator">•</span>
                        <Link to="/login" className="auth-link">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Đặt Lại Mật Khẩu</h2>
                <p className="auth-description">
                    Nhập mật khẩu mới của bạn
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu mới</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Nhập mật khẩu mới"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <small>Tối thiểu 6 ký tự</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login" className="auth-link">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;

