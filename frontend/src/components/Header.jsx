import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
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
                    </nav>
                </div>
                {user && (
                    <div className="user-info">
                        <span className="welcome-text">Xin chào, {user.name}</span>
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

