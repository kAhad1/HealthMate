import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Report API
export const reportAPI = {
  uploadReport: (formData) => api.post('/reports/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getReports: (params) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  updateReport: (id, data) => api.put(`/reports/${id}`, data),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  retryAnalysis: (id) => api.post(`/reports/${id}/retry-analysis`),
  getTimeline: (params) => api.get('/reports/timeline', { params }),
};

// Chat API
export const chatAPI = {
  getChat: () => api.get('/chat'),
  sendMessage: (data) => api.post('/chat/message', data),
  getChatHistory: (params) => api.get('/chat/history', { params }),
  clearChatHistory: () => api.delete('/chat/history'),
  getChatStats: () => api.get('/chat/stats'),
  searchMessages: (params) => api.get('/chat/search', { params }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
