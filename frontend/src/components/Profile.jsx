import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { setUser, selectUser } from '../redux/slices/authSlice';
import './Profile.css';
import API_BASE_URL from '../config/api';

const API_URL = API_BASE_URL;

function Profile() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        avatar: null
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
            const response = await axiosInstance.get(`/api/profile`);
            
            const profile = response.data.profile;
            setProfileData({
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar
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
            const response = await axiosInstance.put(
                `/api/profile`,
                {
                    name: editData.name,
                    email: editData.email
                }
            );

            const updatedProfile = response.data.profile;
            setProfileData({
                name: updatedProfile.name,
                email: updatedProfile.email,
                avatar: updatedProfile.avatar
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

    // Upload Avatar
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axiosInstance.post(
                `/api/auth/upload-avatar`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setProfileData(prev => ({
                ...prev,
                avatar: response.data.avatar
            }));

            // Update user in Redux store
            if (user) {
                dispatch(setUser({
                    ...user,
                    avatar: response.data.avatar
                }));
            }

            toast.success('Upload avatar thành công!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi khi upload avatar';
            toast.error(errorMsg);
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Delete Avatar
    const handleDeleteAvatar = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa avatar?')) {
            return;
        }

        setUploadingAvatar(true);

        try {
            await axiosInstance.delete(`/api/auth/delete-avatar`);

            setProfileData(prev => ({
                ...prev,
                avatar: null
            }));

            // Update user in Redux store
            if (user) {
                dispatch(setUser({
                    ...user,
                    avatar: null
                }));
            }

            toast.success('Xóa avatar thành công!');
        } catch (error) {
            console.error('Error deleting avatar:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi khi xóa avatar';
            toast.error(errorMsg);
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <>
            <Header />
            <div className="profile-container">
                <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-section">
                        <div 
                            className="avatar-wrapper"
                            onClick={!uploadingAvatar ? handleAvatarClick : undefined}
                            style={{ cursor: uploadingAvatar ? 'not-allowed' : 'pointer' }}
                        >
                            {profileData.avatar ? (
                                <img 
                                    src={profileData.avatar} 
                                    alt="Avatar" 
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {uploadingAvatar && (
                                <div className="avatar-loading">
                                    <div className="spinner"></div>
                                </div>
                            )}
                            <div className="avatar-overlay">
                                <span>📷</span>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                        {profileData.avatar && (
                            <button
                                className="btn-delete-avatar"
                                onClick={handleDeleteAvatar}
                                disabled={uploadingAvatar}
                            >
                                Xóa avatar
                            </button>
                        )}
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
