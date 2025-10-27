import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css'; // File CSS có sẵn của React

// Đây là URL API backend của bạn
const API_URL = "http://localhost:3000";

function App() {
    const [users, setUsers] = useState([]);

    // Hàm tải danh sách user từ backend
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // useEffect sẽ chạy 1 lần khi App được tải
    useEffect(() => {
        fetchUsers();
    }, []);

    // Hàm này được gọi từ AddUser.jsx sau khi thêm user thành công
    const handleUserAdded = () => {
        fetchUsers(); // Tải lại danh sách user
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Quản lý User</h1>
                
                {/* Component thêm User */}
                <AddUser onUserAdded={handleUserAdded} />
                
                {/* Component danh sách User */}
                <UserList users={users} />
            </header>
        </div>
    );
}

export default App;