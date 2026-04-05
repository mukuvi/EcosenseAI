import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('ecosense_user') || 'null'),
  token: localStorage.getItem('ecosense_token') || null,
  hydrating: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ecosense_token', data.token);
    localStorage.setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (email, password, full_name, phone, role) => {
    const { data } = await api.post('/auth/register', { email, password, full_name, phone, role });
    localStorage.setItem('ecosense_token', data.token);
    localStorage.setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  refreshProfile: async () => {
    const token = get().token;
    if (!token) return null;
    const { data } = await api.get('/auth/me');
    localStorage.setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user });
    return data.user;
  },

  hydrate: async () => {
    const token = get().token;
    const user = get().user;
    if (!token || user) return;

    set({ hydrating: true });
    try {
      await get().refreshProfile();
    } finally {
      set({ hydrating: false });
    }
  },

  logout: () => {
    localStorage.removeItem('ecosense_token');
    localStorage.removeItem('ecosense_user');
    set({ user: null, token: null, hydrating: false });
  },
}));

export default useAuthStore;
