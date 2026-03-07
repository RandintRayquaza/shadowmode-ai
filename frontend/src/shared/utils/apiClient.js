import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// We can add auth interceptors here later if the backend requires token validation
// api.interceptors.request.use(async (config) => { ... })

export default api;
