import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectAuth } from '../redux/slices/authSlice';

// Đây là URL API backend của bạn
const API_URL = "http://localhost:5000";

function AddUser({ onUserAdded }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const { accessToken } = useSelector(selectAuth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- PHẦN VALIDATION MỚI ---
        
        // 1. Kiểm tra tên có rỗng (hoặc chỉ có dấu cách)
        if (!name.trim()) { 
            alert("Name không được để trống");
            return; // Dừng hàm, không gửi API
        }
        
        // 2. Kiểm tra email bằng Regex (đảm bảo có dạng a@b.c)
        if (!/\S+@\S+\.\S+/.test(email)) { 
            alert("Email không hợp lệ");
            return; // Dừng hàm, không gửi API
        }
        // --- HẾT PHẦN VALIDATION ---
        
        try {
            // Gửi request POST đến backend với token trong header
            const response = await axios.post(
                `${API_URL}/users`, 
                { name, email },
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            toast.success('Thêm user thành công!');
            onUserAdded(response.data); // Báo App.js tải lại
            setName('');
            setEmail('');
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error('Có lỗi khi thêm user');
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