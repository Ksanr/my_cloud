import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/endpoints';

export const login = createAsyncThunk('auth/login', async (credentials) => {
  console.log('api object:', api);
  const response = await api.login(credentials.username, credentials.password);
  return response.data;
});

export const logout = createAsyncThunk('auth/logout', async () => {
    await api.logout();
  return {};
});

export const register = createAsyncThunk('auth/register', async (userData) => {
  // 1. Регистрируем пользователя
  await api.register(userData);
  // 2. Автоматически входим
  const loginResponse = await api.login(userData.username, userData.password);
  return loginResponse.data;
});

export const fetchMe = createAsyncThunk('auth/me', async () => {
  const response = await api.get('/users/me/');
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export default authSlice.reducer;