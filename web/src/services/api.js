import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

const PUBLIC_AUTH_ROUTES = ['/auth/login', '/auth/register'];

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicAuth = PUBLIC_AUTH_ROUTES.some((route) => url.includes(route));
    const hadSession = Boolean(useAuthStore.getState().token);

    if (error.response?.status === 401 && !isPublicAuth && hadSession) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
