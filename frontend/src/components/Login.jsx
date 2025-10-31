import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login as loginAction, selectLoading, selectError } from '../redux/slices/authSlice';
import './Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email || !password) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Dispatch Redux login action
        const result = await dispatch(loginAction({ email, password }));
        
        if (loginAction.fulfilled.match(result)) {
            toast.success('🎉 Đăng nhập thành công!');
            navigate('/'); // Chuyển về trang chủ sau khi đăng nhập
        } else {
            toast.error(result.payload || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Đăng Nhập</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/forgot-password" className="auth-link">
                        Quên mật khẩu?
                    </Link>
                    <span className="separator">•</span>
                    <Link to="/signup" className="auth-link">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
