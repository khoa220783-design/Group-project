import React from 'react';

// Nhận thêm onEdit và onDelete từ App.js
function UserList({ users, onEdit, onDelete }) { 
    return (
        <div>
            <h3>Danh sách User</h3>
            <ul>
                {users.length === 0 ? (
                    <li>Không có user nào</li>
                ) : (
                    users.map(user => (
                        <li key={user._id}> {/* Dùng _id của MongoDB */}
                            {user.name} ({user.email})
                            
                            {/* THÊM 2 NÚT NÀY */}
                            <button onClick={() => onEdit(user)}>Sửa</button>
                            <button onClick={() => onDelete(user._id)}>Xóa</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default UserList;