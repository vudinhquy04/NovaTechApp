import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.24.22.142:5001/api/auth';

export const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối' };
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối' };
    }
  },

  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
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
  }
};
