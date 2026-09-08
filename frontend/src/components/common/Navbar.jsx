import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.link}>My Cloud</Link>
      </div>
      <div style={styles.right}>
        {!isAuthenticated ? (
          <>
            <Link to="/login" style={styles.link}>Вход</Link>
            <Link to="/register" style={styles.link}>Регистрация</Link>
          </>
        ) : (
          <>
            {user?.is_admin && (
              <Link to="/admin" style={styles.link}>Админка</Link>
            )}
            <Link to="/" style={styles.link}>Файлы</Link>
            <span style={styles.user}>{user?.username}</span>
            <button onClick={handleLogout} style={styles.button}>Выйти</button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    background: '#f0f0f0',
    borderBottom: '1px solid #ccc',
  },
  left: { display: 'flex', gap: '15px' },
  right: { display: 'flex', gap: '15px', alignItems: 'center' },
  link: { textDecoration: 'none', color: '#333' },
  user: { fontWeight: 'bold' },
  button: { cursor: 'pointer' },
};

export default Navbar;