import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Tạo axios instance
const axiosInstance = axios.create({
    baseURL: API_URL
});

// Request interceptor: Tự động gắn access token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Tự động refresh token khi 401
axiosInstance.interceptors.response.use(
    (response) => {
        // Nếu response OK, trả về như bình thường
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                    // Không có refresh token -> logout
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Gọi API refresh để lấy access token mới
                const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken
                });

                const newAccessToken = refreshResponse.data.accessToken;
                
                // Lưu access token mới
                localStorage.setItem('accessToken', newAccessToken);

                // Gắn token mới vào header của request ban đầu
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Retry request ban đầu với token mới
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh thất bại -> logout
                console.error('Refresh token thất bại:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

