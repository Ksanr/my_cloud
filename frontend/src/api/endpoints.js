import api from './axiosConfig';

// Аутентификация
export const login = (username, password) =>
  api.post('/login/', { username, password });

export const logout = () =>
  api.post('/logout/');

export const register = (userData) =>
  api.post('/api/users/', userData);

export const fetchMe = () =>
  api.get('/api/users/me/');

// Управление пользователями (админ)
export const fetchUsers = () =>
  api.get('/api/users/');

export const deleteUser = (userId) =>
  api.delete(`/api/users/${userId}/`);

export const updateUser = (userId, data) =>
  api.patch(`/api/users/${userId}/`, data);

// Работа с файлами
// Получение списка файлов
export const fetchFiles = (userId = null) => {
  console.log('fetchFiles called with userId:', userId);
  const params = userId ? { user_id: userId } : {};
  console.log('params:', params);
  return api.get('/api/files/', { params });
};

// Загрузка файла
export const uploadFile = (file, comment = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (comment) formData.append('comment', comment);
  return api.post('/api/files/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Удаление файла
export const deleteFile = (fileId) =>
  api.delete(`/api/files/${fileId}/`);

// Переименование
export const renameFile = (fileId, newName) =>
  api.post(`/api/files/${fileId}/rename/`, { new_name: newName });

// Изменение комментария
export const setComment = (fileId, comment) =>
  api.post(`/api/files/${fileId}/set_comment/`, { comment });

// Скачивание файла (возвращает blob)
export const downloadFile = (fileId) =>
  api.get(`/api/files/${fileId}/download/`, { responseType: 'blob' });

// Получение специальной ссылки (токена)
export const getSpecialLink = (fileId) =>
  api.get(`/api/files/${fileId}/special_link/`);

// Скачивание по специальной ссылке (внешний доступ)
export const downloadShared = (token) =>
  api.get(`/api/files/shared/${token}/`, { responseType: 'blob' });