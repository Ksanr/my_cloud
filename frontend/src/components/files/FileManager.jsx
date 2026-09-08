import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchFiles,
  uploadFile,
  deleteFile,
  renameFile,
  updateComment,
  clearFiles,
} from '../../redux/slices/filesSlice';
import { downloadFile, getSpecialLink } from '../../api/endpoints';

const FileManager = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.files);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [editingFile, setEditingFile] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFiles());
    } else {
      dispatch(clearFiles());
    }
  }, [dispatch, isAuthenticated]);

  // Если пользователь не авторизован – показываем приветствие
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <h2>Добро пожаловать в My Cloud!</h2>
        <p>Для доступа к файлам необходимо войти или зарегистрироваться.</p>
        <div style={{ marginTop: 20 }}>
          <Link to="/login"><button>Войти</button></Link>
          <Link to="/register"><button style={{ marginLeft: 10 }}>Регистрация</button></Link>
        </div>
      </div>
    );
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    await dispatch(uploadFile({ file: selectedFile, comment }));
    setSelectedFile(null);
    setComment('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить файл?')) {
      await dispatch(deleteFile(id));
    }
  };

  const handleRename = async (id, newName) => {
    await dispatch(renameFile({ fileId: id, newName }));
    setEditingFile(null);
  };

  const handleCommentUpdate = async (id, newComment) => {
    await dispatch(updateComment({ fileId: id, comment: newComment }));
    setEditingFile(null);
  };

  const handleDownload = async (id, originalName) => {
    try {
      const response = await downloadFile(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error', err);
    }
  };

  const handleCopyLink = async (id) => {
    try {
      const res = await getSpecialLink(id);
      const link = `http://localhost:8000/api/files/shared/${res.data.special_link}`;
      await navigator.clipboard.writeText(link);
      alert('Ссылка скопирована!');
    } catch (err) {
      console.error('Copy link error', err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Мои файлы</h2>

      {/* Форма загрузки */}
      <form onSubmit={handleUpload} style={{ marginBottom: 20 }}>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit" disabled={!selectedFile}>Загрузить</button>
      </form>

      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Список файлов */}
      {items.length === 0 && !loading && <div>Файлов нет</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((file) => (
          <li key={file.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <div>
              <strong>{file.original_name}</strong> ({file.size_human})
              <span style={{ marginLeft: 10 }}>Комментарий: {file.comment || '—'}</span>
              <span style={{ marginLeft: 10 }}>Загружен: {new Date(file.uploaded_at).toLocaleDateString()}</span>
            </div>
            <div>
              <button onClick={() => handleDownload(file.id, file.original_name)}>Скачать</button>
              <button onClick={() => handleCopyLink(file.id)}>Получить ссылку</button>
              <button onClick={() => handleDelete(file.id)}>Удалить</button>
              <button onClick={() => setEditingFile({ id: file.id, field: 'name' })}>
                Переименовать
              </button>
              <button onClick={() => setEditingFile({ id: file.id, field: 'comment' })}>
                Изменить комментарий
              </button>
            </div>
            {editingFile && editingFile.id === file.id && (
              <div style={{ marginTop: 5 }}>
                {editingFile.field === 'name' ? (
                  <>
                    <input
                      type="text"
                      defaultValue={file.original_name}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRename(file.id, e.target.value);
                        }
                      }}
                    />
                    <button onClick={() => setEditingFile(null)}>Отмена</button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      defaultValue={file.comment}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCommentUpdate(file.id, e.target.value);
                        }
                      }}
                    />
                    <button onClick={() => setEditingFile(null)}>Отмена</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileManager;