import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <h1>Quản lý User</h1>
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

