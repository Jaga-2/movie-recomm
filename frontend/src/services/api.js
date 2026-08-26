import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  },
};

export const predictionsAPI = {
  predictSingle: async (params) => {
    const response = await apiClient.post('/predictions/predict-single', params);
    return response.data;
  },
  uploadFile: async (formData) => {
    const response = await apiClient.post('/predictions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getHistory: async () => {
    const response = await apiClient.get('/predictions/history');
    return response.data;
  },
  getReport: async (fileId) => {
    const response = await apiClient.get(`/predictions/report/${fileId}`);
    return response.data;
  },
  deleteHistory: async (fileId) => {
    const response = await apiClient.delete(`/predictions/history/${fileId}`);
    return response.data;
  },
  getMetrics: async () => {
    const response = await apiClient.get('/predictions/metrics');
    return response.data;
  },
  getExcelExportUrl: (fileId) => {
    return `${API_BASE_URL}/predictions/export-excel/${fileId}`;
  },
};

export const monitoringAPI = {
  getLiveSensor: async () => {
    const response = await apiClient.get('/monitoring/current');
    return response.data;
  },
};

export const adminAPI = {
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
  getLogs: async () => {
    const response = await apiClient.get('/admin/logs');
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (message) => {
    const response = await apiClient.post('/chat', { message });
    return response.data;
  },
};

export default apiClient;
