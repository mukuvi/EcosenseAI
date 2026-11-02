import * as SecureStore from 'expo-secure-store';

export const getItem = (key) => SecureStore.getItemAsync(key);
export const setItem = (key, value) => SecureStore.setItemAsync(key, value);
export const deleteItem = (key) => SecureStore.deleteItemAsync(key);
