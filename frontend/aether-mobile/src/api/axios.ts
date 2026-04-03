import axios from 'axios';
import * as SecureStore from 'expo-secure-store';



const BASE_URL = 'http://10.210.11.105:8080';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
