import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';
import API_BASE_URL from '../../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

// ===== ASYNC THUNKS =====

// Signup Thunk
export const signup = createAsyncThunk(
    'auth/signup',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Đăng ký thất bại'
            );
        }
    }
);

// Login Thunk
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            const { accessToken, refreshToken, user } = response.data;

            // Lưu tokens vào localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            return { accessToken, refreshToken, user };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Đăng nhập thất bại'
            );
        }
    }
);

// Logout Thunk
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { refreshToken } = getState().auth;
            
            if (refreshToken) {
                await axios.post(`${API_URL}/logout`, { refreshToken });
            }

            // Xóa tokens khỏi localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            return null;
        } catch (error) {
            // Vẫn logout dù API fail
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
        }
    }
);

// Fetch Current User Thunk
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/me`);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Không thể lấy thông tin user'
            );
        }
    }
);

// Update User Profile Thunk
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${API_URL}/me`, userData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Cập nhật profile thất bại'
            );
        }
    }
);

// ===== AUTH SLICE =====

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        isAuthenticated: !!localStorage.getItem('accessToken'),
        loading: false,
        error: null
    },
    reducers: {
        // Reset error
        clearError: (state) => {
            state.error = null;
        },
        // Set user (dùng khi update avatar, etc.)
        setUser: (state, action) => {
            state.user = action.payload;
        },
        // Update tokens (dùng khi refresh token)
        setTokens: (state, action) => {
            state.accessToken = action.payload.accessToken;
            if (action.payload.refreshToken) {
                state.refreshToken = action.payload.refreshToken;
            }
            state.isAuthenticated = true;
        },
        // Reset auth state
        resetAuth: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // ===== SIGNUP =====
        builder
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                // Không tự động login sau signup
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== LOGIN =====
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });

        // ===== LOGOUT =====
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            });

        // ===== FETCH CURRENT USER =====
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Nếu token invalid, logout
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            });

        // ===== UPDATE USER PROFILE =====
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Export actions
export const { clearError, setUser, setTokens, resetAuth } = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;

// Export reducer
export default authSlice.reducer;

