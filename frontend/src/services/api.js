import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Component Services
export const componentService = {
  getAll: async (params = {}) => {
    const res = await api.get('/components', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/components/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/components', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/components/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/components/${id}`);
    return res.data;
  },
};

// Configuration Services
export const configurationService = {
  getAll: async (search = '') => {
    const res = await api.get('/configurations', { params: search ? { search } : {} });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/configurations/${id}`);
    return res.data;
  },
  preview: async (component_ids) => {
    const res = await api.post('/configurations/preview', component_ids);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/configurations', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/configurations/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/configurations/${id}`);
    return res.data;
  },
};

// Dashboard Services
export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
};

export default api;
