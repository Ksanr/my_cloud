import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../redux/slices/authSlice';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const err = {};
    // Логин: только латиница и цифры, первая буква, длина 4-20
    if (!/^[A-Za-z][A-Za-z0-9]{3,19}$/.test(form.username)) {
      err.username = 'Логин: от 4 до 20 символов, первая буква, только латиница и цифры';
    }
    // Email
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
      err.email = 'Неверный формат email';
    }
    // Пароль: минимум 6, заглавная, цифра, спецсимвол
    if (
      form.password.length < 6 ||
      !/[A-Z]/.test(form.password) ||
      !/\d/.test(form.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(form.password)
    ) {
      err.password = 'Пароль: минимум 6 символов, одна заглавная, одна цифра, один спецсимвол';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(register(form));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Логин</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, margin: '5px 0' }}
          />
          {errors.username && <div style={{ color: 'red' }}>{errors.username}</div>}
        </div>
        <div>
          <label>Полное имя</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, margin: '5px 0' }}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, margin: '5px 0' }}
          />
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </div>
        <div>
          <label>Пароль</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, margin: '5px 0' }}
          />
          {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default Register;