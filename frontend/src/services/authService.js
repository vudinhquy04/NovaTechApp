import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

export const authService = {
  // Đăng ký
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối' };
    }
  },

  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối' };
    }
  },

  // Lấy thông tin hiện tại
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Cập nhật thông tin
  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/update`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi cập nhật' };
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwords) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/change-password`, passwords, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi đổi mật khẩu' };
    }
  }
};
