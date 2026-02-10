import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.78:5000/api/notifications';

const notificationService = {
  // Get all notifications with filters
  getNotifications: async (params = {}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(API_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, data: [] };
    }
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      return { success: false, data: null };
    }
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: false, data: { unreadCount: 0 } };
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false };
    }
  },

  // Mark notification as unread
  markAsUnread: async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/${id}/unread`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      return { success: false };
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false };
    }
  },

  // Create notification (for admin/system use)
  createNotification: async (notificationData) => {
    try {
      const response = await axios.post(API_URL, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false };
    }
  }
};

export default notificationService;
