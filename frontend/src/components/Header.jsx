import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout as logoutAction, selectUser } from '../redux/slices/authSlice';
import './Header.css';

function Header() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await dispatch(logoutAction());
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-left">
                    <h1 onClick={() => navigate('/')} style={{cursor: 'pointer'}}>Quản lý User</h1>
                    <nav className="header-nav">
                        <Link 
                            to="/" 
                            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
                        >
                            Dashboard
                        </Link>
                        <Link 
                            to="/profile" 
                            className={location.pathname === '/profile' ? 'nav-link active' : 'nav-link'}
                        >
                            Profile
                        </Link>
                        {/* Admin và Moderator đều thấy Admin panel */}
                        {user && (user.role === 'admin' || user.role === 'moderator') && (
                            <Link 
                                to="/admin" 
                                className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}
                            >
                                {user.role === 'admin' ? 'Admin Panel' : 'Moderator Panel'}
                            </Link>
                        )}
                    </nav>
                </div>
                {user && (
                    <div className="user-info">
                        <span className="welcome-text">
                            Xin chào, {user.name}
                            {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                            {user.role === 'moderator' && <span className="moderator-badge">Moderator</span>}
                        </span>
                        <button onClick={handleLogout} className="logout-button">
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
