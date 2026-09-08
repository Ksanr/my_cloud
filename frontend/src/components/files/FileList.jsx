import { useState } from 'react';

const FileList = ({
  files,
  loading,
  error,
  onDelete,
  onRename,
  onCommentUpdate,
  onDownload,
  onCopyLink,
}) => {
  const [editing, setEditing] = useState(null); // { id, field: 'name'|'comment' }

  if (loading) return <div>Загрузка файлов...</div>;
  if (error) return <div style={{ color: 'red' }}>Ошибка: {error}</div>;
  if (files.length === 0) return <div>Файлов нет</div>;

  const handleRenameSubmit = (id, newName) => {
    onRename(id, newName);
    setEditing(null);
  };

  const handleCommentSubmit = (id, newComment) => {
    onCommentUpdate(id, newComment);
    setEditing(null);
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {files.map((file) => (
        <li key={file.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <div>
            <strong>{file.original_name}</strong> ({file.size_human})
            <span style={{ marginLeft: 10 }}>Комментарий: {file.comment || '—'}</span>
            <span style={{ marginLeft: 10 }}>Загружен: {new Date(file.uploaded_at).toLocaleDateString()}</span>
          </div>
          <div>
            <button onClick={() => onDownload(file.id)}>Скачать</button>
            <button onClick={() => onCopyLink(file.id)}>Получить ссылку</button>
            <button onClick={() => onDelete(file.id)}>Удалить</button>
            <button onClick={() => setEditing({ id: file.id, field: 'name' })}>
              Переименовать
            </button>
            <button onClick={() => setEditing({ id: file.id, field: 'comment' })}>
              Изменить комментарий
            </button>
          </div>
          {editing && editing.id === file.id && (
            <div style={{ marginTop: 5 }}>
              {editing.field === 'name' ? (
                <>
                  <input
                    type="text"
                    defaultValue={file.original_name}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameSubmit(file.id, e.target.value);
                      }
                    }}
                    autoFocus
                  />
                  <button onClick={() => setEditing(null)}>Отмена</button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    defaultValue={file.comment}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCommentSubmit(file.id, e.target.value);
                      }
                    }}
                    autoFocus
                  />
                  <button onClick={() => setEditing(null)}>Отмена</button>
                </>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default FileList;