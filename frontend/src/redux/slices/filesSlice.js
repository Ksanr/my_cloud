import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/endpoints';
import { logout } from './authSlice';

// Асинхронные действия
export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (userId = null) => {
    const response = await api.fetchFiles(userId);
    return response.data;
  }
);

export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async ({ file, comment }) => {
    const response = await api.uploadFile(file, comment);
    return response.data; // ожидается, что бэкенд возвращает созданный объект
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId) => {
    await api.deleteFile(fileId);
    return fileId;
  }
);

export const renameFile = createAsyncThunk(
  'files/renameFile',
  async ({ fileId, newName }) => {
    const response = await api.renameFile(fileId, newName);
    return response.data; // обновлённый объект файла
  }
);

export const updateComment = createAsyncThunk(
  'files/updateComment',
  async ({ fileId, comment }) => {
    const response = await api.setComment(fileId, comment);
    return response.data;
  }
);

// Slice
const filesSlice = createSlice({
  name: 'files',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFiles: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFiles
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // uploadFile
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // deleteFile
      .addCase(deleteFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((file) => file.id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // renameFile
      .addCase(renameFile.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((f) => f.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })
      // updateComment
      .addCase(updateComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((f) => f.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearFiles } = filesSlice.actions;
export default filesSlice.reducer;