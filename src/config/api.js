// src/config/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthHeader = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((res) => res, (err) => {
  // On 401, clear auth and notify app (do not force redirect)
  if (err.response?.status === 401) {
    const isTempAuth = localStorage.getItem('tempAuth') === 'true';
    if (isTempAuth) {
       return Promise.reject(err);
     }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('app:logout'));
    window.dispatchEvent(new Event('app:cartCleared'));
  }
  return Promise.reject(err);
});

export default api;
