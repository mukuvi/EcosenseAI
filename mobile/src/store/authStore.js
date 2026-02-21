import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,

  init: async () => {
    const token = await SecureStore.getItemAsync('ecosense_token');
    const userJson = await SecureStore.getItemAsync('ecosense_user');
    if (token && userJson) {
      set({ token, user: JSON.parse(userJson), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('ecosense_token', data.token);
    await SecureStore.setItemAsync('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (email, password, full_name, phone) => {
    const { data } = await api.post('/auth/register', { email, password, full_name, phone });
    await SecureStore.setItemAsync('ecosense_token', data.token);
    await SecureStore.setItemAsync('ecosense_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('ecosense_token');
    await SecureStore.deleteItemAsync('ecosense_user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
