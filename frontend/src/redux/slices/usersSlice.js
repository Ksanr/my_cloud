import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/endpoints';

// Асинхронные действия
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await api.fetchUsers();
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId) => {
    await api.deleteUser(userId);
    return userId;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, data }) => {
    const response = await api.updateUser(userId, data);
    return response.data;
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.users.findIndex((u) => u.id === updated.id);
        if (index !== -1) {
          state.users[index] = updated;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default usersSlice.reducer;