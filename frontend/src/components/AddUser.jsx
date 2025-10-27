import React, { useState } from 'react';
import axios from 'axios';

// Đây là URL API backend của bạn
const API_URL = "http://localhost:3000";

function AddUser({ onUserAdded }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            alert('Vui lòng nhập tên và email');
            return;
        }
        try {
            // Gửi request POST đến backend
            const response = await axios.post(`${API_URL}/users`, { name, email });
            onUserAdded(response.data); // Báo cho App.js biết để tải lại danh sách
            setName('');
            setEmail('');
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Thêm User</h3>
            <input
                type="text"
                placeholder="Tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Thêm</button>
        </form>
    );
}

export default AddUser;