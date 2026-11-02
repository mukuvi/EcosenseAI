import { create } from 'zustand';
import { getItem, setItem, deleteItem } from '../services/storage';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  init: async () => {
    const token = await getItem('ecosense_token');
    const userJson = await getItem('ecosense_user');
    if (token) {
      set({ token, user: userJson ? JSON.parse(userJson) : null });
      try {
        await get().refreshProfile();
      } catch {}
    }

    set({ isLoading: false });
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await setItem('ecosense_token', data.token);
    await setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (email, password, full_name, phone, role) => {
    const { data } = await api.post('/auth/register', { email, password, full_name, phone, role });
    await setItem('ecosense_token', data.token);
    await setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  refreshProfile: async () => {
    const token = await getItem('ecosense_token');
    if (!token) return null;
    const { data } = await api.get('/auth/me');
    await setItem('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user });
    return data.user;
  },

  logout: async () => {
    await deleteItem('ecosense_token');
    await deleteItem('ecosense_user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
