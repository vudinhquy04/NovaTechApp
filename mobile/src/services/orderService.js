import axios from 'axios';

const API_URL = 'http://172.20.10.2:5000/api/orders';

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    console.error('Create order error:', error.response?.data || error.message);
    throw error;
  }
};

// Lấy đơn hàng theo số điện thoại
export const getOrdersByPhone = async (phone) => {
  try {
    const response = await axios.get(`${API_URL}/customer/${phone}`);
    return response.data;
  } catch (error) {
    console.error('Get orders by phone error:', error.response?.data || error.message);
    throw error;
  }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Get order by id error:', error.response?.data || error.message);
    throw error;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await axios.put(`${API_URL}/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Cancel order error:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  createOrder,
  getOrdersByPhone,
  getOrderById,
  cancelOrder
};
