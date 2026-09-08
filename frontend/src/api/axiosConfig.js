import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,  // для сессионной аутентификации
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;