import axios from 'axios';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматически добавляем X-CSRFToken во все небезопасные запросы
api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCookie('csrftoken');
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

export default api;
