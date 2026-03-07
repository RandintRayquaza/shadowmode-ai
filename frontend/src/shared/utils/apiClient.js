import axios from 'axios';
import { auth } from '@/shared/utils/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor to attach Firebase ID token on every request
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.warn('[API Client] Failed to get Firebase token:', err);
    }
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
