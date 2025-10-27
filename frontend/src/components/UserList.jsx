import React from 'react';

function UserList({ users }) {
    return (
        <div>
            <h3>Danh sách User</h3>
            <ul>
                {users.length === 0 ? (
                    <li>Không có user nào</li>
                ) : (
                    // Dùng _id vì MongoDB sẽ trả về _id, còn mảng tạm thì dùng id
                    users.map(user => (
                        <li key={user.id || user._id}>
                            {user.name} ({user.email})
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default UserList;