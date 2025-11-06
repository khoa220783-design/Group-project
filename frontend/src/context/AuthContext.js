import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const AuthContext = createContext();

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);

  const API_URL = API_BASE_URL;

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("accessToken");
      if (savedToken) {
        try {
          // Gọi API để lấy thông tin user
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          setUser(response.data.user);
          setToken(savedToken);
        } catch (error) {
          console.error("Token không hợp lệ:", error);
          // Nếu access token hết hạn, thử refresh
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const refreshResponse = await axios.post(
                `${API_URL}/api/auth/refresh`,
                {
                  refreshToken,
                }
              );
              const newAccessToken = refreshResponse.data.accessToken;
              localStorage.setItem("accessToken", newAccessToken);
              setToken(newAccessToken);

              // Lấy lại thông tin user với token mới
              const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              setUser(userResponse.data.user);
            } catch (refreshError) {
              console.error("Refresh token thất bại:", refreshError);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              setToken(null);
              setUser(null);
            }
          } else {
            localStorage.removeItem("accessToken");
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Hàm đăng ký (KHÔNG tự động login)
  const signup = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      // KHÔNG lưu token - user phải đăng nhập thủ công
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng ký thất bại",
      };
    }
  };

  // Hàm đăng nhập
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      // Lưu cả 2 tokens vào localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setToken(accessToken);
      setUser(user);

      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      // Xóa cả 2 tokens khỏi localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
