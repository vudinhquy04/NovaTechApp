import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

export const orderService = {
  // Get all orders for current user
  getOrders: async (status = null) => {
    try {
      const token = localStorage.getItem('token');
      const params = status ? { status } : {};
      const response = await axios.get(API_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    }
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_URL, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  },

  // Cancel order
  cancelOrder: async (orderId, cancelData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/${orderId}/cancel`, cancelData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  }
};
