import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('ecosense_user') || 'null'),
  token: localStorage.getItem('ecosense_token') || null,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ecosense_token', data.token);
    localStorage.setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (email, password, full_name, phone) => {
    const { data } = await api.post('/auth/register', { email, password, full_name, phone });
    localStorage.setItem('ecosense_token', data.token);
    localStorage.setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: () => {
    localStorage.removeItem('ecosense_token');
    localStorage.removeItem('ecosense_user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
