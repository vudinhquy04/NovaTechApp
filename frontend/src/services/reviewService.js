import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reviews';

export const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId, filter = null, sort = null) => {
    try {
      const params = {};
      if (filter) params.filter = filter;
      if (sort) params.sort = sort;
      
      const response = await axios.get(`${API_URL}/product/${productId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải đánh giá');
    }
  },

  // Get review statistics for a product
  getProductReviewStats: async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/product/${productId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải thống kê đánh giá');
    }
  },

  // Create a review
  createReview: async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_URL, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tạo đánh giá');
    }
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể đánh dấu hữu ích');
    }
  },

  // Add reply to review
  addReply: async (reviewId, comment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/${reviewId}/reply`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể thêm phản hồi');
    }
  }
};
