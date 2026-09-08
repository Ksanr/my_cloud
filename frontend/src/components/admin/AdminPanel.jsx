import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, updateUser } from '../../redux/slices/usersSlice';
import { fetchFiles } from '../../redux/slices/filesSlice';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { items: files } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Удалить пользователя?')) {
      await dispatch(deleteUser(userId));
    }
  };

  const handleToggleAdmin = async (user) => {
    await dispatch(updateUser({ userId: user.id, data: { is_admin: !user.is_admin } }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Администрирование пользователей</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>Логин</th>
            <th>Полное имя</th>
            <th>Email</th>
            <th>Админ</th>
            <th>Файлы</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td>{user.username}</td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.is_admin ? 'Да' : 'Нет'}</td>
              <td>
                <Link to={`/files?user_id=${user.id}`}>Управлять файлами</Link>
              </td>
              <td>
                <button onClick={() => handleToggleAdmin(user)}>
                  {user.is_admin ? 'Снять админа' : 'Сделать админом'}
                </button>
                <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;