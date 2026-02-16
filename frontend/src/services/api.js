import axios from 'axios';

const API_URL = 'http://192.168.1.18:5000/api';

export const ADMIN_CREDENTIALS = {
  email: 'admin@novatech.com',
  password: 'admin123'
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
  getAll: async () => {
    return {
      orders: [
        {
          _id: 'ORD-20230501',
          customer: { name: 'Nguyễn Văn An', email: 'an.nguyen@company.com' },
          total: 1250000,
          status: 'pending',
          createdAt: '2023-12-10T14:30:00.000Z'
        },
        {
          _id: 'ORD-20230502',
          customer: { name: 'Trần Thị Bích', email: 'bich.tran@gmail.com' },
          total: 450000,
          status: 'shipping',
          createdAt: '2023-12-10T13:15:00.000Z'
        },
        {
          _id: 'ORD-20230503',
          customer: { name: 'Lê Hoàng Cường', email: 'cuong.le@mail.com' },
          total: 2100000,
          status: 'completed',
          createdAt: '2023-11-10T18:45:00.000Z'
        },
        {
          _id: 'ORD-20230504',
          customer: { name: 'Phạm Minh Đăng', email: 'dang.pham@email.com' },
          total: 890000,
          status: 'cancelled',
          createdAt: '2023-11-10T10:20:00.000Z'
        }
      ]
    };
  }
};

export default api;
