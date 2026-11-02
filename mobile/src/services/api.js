import axios from 'axios';
import { getItem, setItem, deleteItem } from './storage';
import { NativeModules } from 'react-native';

function getDevHostFromScriptURL() {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL || typeof scriptURL !== 'string') return null;

  const match = scriptURL.match(/^https?:\/\/([^:/?#]+)(?::\d+)?\//i);
  return match?.[1] || null;
}

function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string') return envUrl.replace(/\/+$/, '');

  if (__DEV__) {
    const host = getDevHostFromScriptURL();
    if (host) return `http://${host}:5000/api`;
    return 'http://localhost:5000/api';
  }

  return 'https://ecosense.mukuvi.tech/api';
}

const API_BASE_URL = getApiBaseUrl();
export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getItem('ecosense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteItem('ecosense_token');
      await deleteItem('ecosense_user');
    }
    return Promise.reject(error);
  }
);

export default api;
