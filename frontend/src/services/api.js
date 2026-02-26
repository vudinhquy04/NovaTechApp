import axios from 'axios';

const API_URL = 'http://172.20.10.2:5000/api';

export const ADMIN_CREDENTIALS = {
  email: 'admin@novatech.com',
  password: 'admin123'
};

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

export const productAPI = {
  getAll: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export const userAPI = {
  getAll: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/auth/users', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/auth/users/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  }
};

export const orderAPI = {
  getAll: async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  cancel: async (id, reason) => {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/orders/stats/summary');
    return response.data;
  }
};

export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/products/categories/all');
    return response.data;
  }
};

export default api;
