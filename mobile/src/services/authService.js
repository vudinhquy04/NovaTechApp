import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.9:5000/api/auth';

export const authService = {
  register: async (userData) => {
    try {
      // Map fullName to name for backend
      const registerData = {
        name: userData.fullName,
        email: userData.email,
        password: userData.password
      };
      
      const response = await axios.post(`${API_URL}/register`, registerData);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify({
          ...response.data,
          fullName: response.data.name
        }));
      }
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối' };
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify({
          ...response.data,
          fullName: response.data.name
        }));
      }
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối' };
    }
  },

  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  updateProfile: async (userData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/update`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi cập nhật' };
    }
  },

  changePassword: async (passwords) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_URL}/change-password`, passwords, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi đổi mật khẩu' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Lỗi gửi mã xác thực' };
    }
  },

  verifyResetCode: async (email, code) => {
    try {
      const response = await axios.post(`${API_URL}/verify-reset-code`, { email, code });
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Mã xác thực không hợp lệ' };
    }
  },

  resetPassword: async (email, code, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { email, code, newPassword });
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Lỗi đặt lại mật khẩu' };
    }
  }
};
