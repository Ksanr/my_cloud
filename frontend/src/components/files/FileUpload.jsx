import { useState } from 'react';

const FileUpload = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onUpload(file, comment);
    setFile(null);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={!file || loading}>
        {loading ? 'Загрузка...' : 'Загрузить'}
      </button>
    </form>
  );
};

export default FileUpload;