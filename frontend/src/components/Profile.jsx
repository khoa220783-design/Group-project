import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Profile.css';

const API_URL = "http://localhost:5000";

function Profile() {
    const { user, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });
    const [editData, setEditData] = useState({
        name: '',
        email: ''
    });

    // Fetch profile khi component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const profile = response.data.profile;
            setProfileData({
                name: profile.name,
                email: profile.email
            });
            setEditData({
                name: profile.name,
                email: profile.email
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Không thể tải thông tin profile');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            name: profileData.name,
            email: profileData.email
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            name: profileData.name,
            email: profileData.email
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!editData.name.trim()) {
            toast.error('Tên không được để trống');
            setLoading(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(editData.email)) {
            toast.error('Email không hợp lệ');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put(
                `${API_URL}/api/profile`,
                {
                    name: editData.name,
                    email: editData.email
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const updatedProfile = response.data.profile;
            setProfileData({
                name: updatedProfile.name,
                email: updatedProfile.email
            });
            setIsEditing(false);
            toast.success('Cập nhật profile thành công!');
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi khi cập nhật profile';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="profile-container">
                <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar">
                        {profileData.name.charAt(0).toUpperCase()}
                    </div>
                    <h2>Thông Tin Cá Nhân</h2>
                </div>

                {!isEditing ? (
                    // View Mode
                    <div className="profile-view">
                        <div className="profile-field">
                            <label>Họ tên:</label>
                            <div className="field-value">{profileData.name}</div>
                        </div>

                        <div className="profile-field">
                            <label>Email:</label>
                            <div className="field-value">{profileData.email}</div>
                        </div>

                        <div className="profile-actions">
                            <button 
                                className="btn-edit" 
                                onClick={handleEdit}
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                ) : (
                    // Edit Mode
                    <form className="profile-edit" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Họ tên:</label>
                            <input
                                type="text"
                                placeholder="Nhập họ tên"
                                value={editData.name}
                                onChange={(e) => setEditData({
                                    ...editData,
                                    name: e.target.value
                                })}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                value={editData.email}
                                onChange={(e) => setEditData({
                                    ...editData,
                                    email: e.target.value
                                })}
                                disabled={loading}
                            />
                        </div>

                        <div className="profile-actions">
                            <button 
                                type="submit" 
                                className="btn-save"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
        </>
    );
}

export default Profile;

