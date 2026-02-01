import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RegisterPage.css';

const API_URL = 'https://vet-clinic-fhfh.onrender.com/api';

const Register = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+996',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Если уже авторизован - редирект на главную
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Введите имя';
    if (!formData.lastName.trim()) newErrors.lastName = 'Введите фамилию';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setServerError('');
    setDebugInfo('');
    
    try {
      console.log('=== 📝 РЕГИСТРАЦИЯ ===');
      console.log('📧 Email:', formData.email);
      console.log('🌐 API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📦 Ответ сервера:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
      }

      // ✅ УСПЕШНАЯ РЕГИСТРАЦИЯ
      console.log('✅ Регистрация успешна!', data.user.email);
      console.log('✅ Токен получен:', data.token ? data.token.substring(0, 30) + '...' : 'Нет токена');
      
      if (!data.token) {
        throw new Error('Токен не получен от сервера');
      }
      
      // 🔥 Используем функцию login из AuthContext
      login(data.token, data.user);
      
      setDebugInfo('✅ Регистрация успешна! Автоматический вход...');
      
      // Задержка для показа сообщения
      setTimeout(() => {
        alert(`✅ Регистрация успешна! Добро пожаловать, ${data.user.firstName}!`);
        
        // Навигация
        navigate('/');
      }, 500);
      
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      setServerError(error.message || 'Произошла ошибка при регистрации');
      setDebugInfo(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Функция для проверки API
  const checkAPI = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      alert(`✅ API работает!\nСтатус: ${data.status}\nMongoDB: ${data.mongodb}`);
    } catch (error) {
      alert(`❌ API недоступен: ${error.message}`);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Создать аккаунт</h1>
            <p>Заполните форму для регистрации</p>
          </div>
          
          {serverError && (
            <div className="server-error">
              ⚠️ {serverError}
            </div>
          )}
          
          {debugInfo && (
            <div className={`debug-message ${debugInfo.includes('✅') ? 'success' : 'warning'}`}>
              {debugInfo}
            </div>
          )}
          
          <div className="api-info">
            <small>API: {API_URL}</small>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Имя *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="Иван"
                  disabled={isLoading}
                />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Фамилия *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Иванов"
                  disabled={isLoading}
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="ivan@example.com"
                disabled={isLoading}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Телефон *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="+996 999 99 99 99"
                disabled={isLoading}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Пароль *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Минимум 6 символов"
                  disabled={isLoading}
                />
                {errors.password && <span className="error">{errors.password}</span>}
                <div className="password-requirements">
                  Пароль должен содержать минимум 6 символов
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Подтверждение *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Повторите пароль"
                  disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-small"></span> Регистрация...
                </>
              ) : 'Зарегистрироваться'}
            </button>
            
            <div className="form-footer">
              <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
              <p><Link to="/">← На главную</Link></p>
            </div>
          </form>
          
          {/* Отладочная информация */}
          <div className="debug-info">
            <h4>🔧 Отладка:</h4>
            <div className="debug-buttons">
              <button
                onClick={checkAPI}
                className="debug-btn"
                type="button"
              >
                Проверить API
              </button>
              
              <button
                onClick={() => {
                  console.log('=== 🔍 LOCALSTORAGE ===');
                  console.log('token:', localStorage.getItem('token'));
                  console.log('user:', localStorage.getItem('user'));
                  console.log('isAuthenticated:', isAuthenticated);
                  alert('Проверьте консоль браузера (F12)');
                }}
                className="debug-btn"
                type="button"
              >
                Показать данные
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  alert('LocalStorage очищен');
                  window.location.reload();
                }}
                className="debug-btn danger"
                type="button"
              >
                Очистить всё
              </button>
            </div>
            
            <div className="current-token">
              <h5>Текущий токен:</h5>
              <code>
                {localStorage.getItem('token') 
                  ? `🔑 ${localStorage.getItem('token').substring(0, 30)}...` 
                  : '❌ Не найден'}
              </code>
            </div>
            
            <div className="auth-status">
              <h5>Статус авторизации:</h5>
              <p className={`status ${isAuthenticated ? 'authenticated' : 'not-authenticated'}`}>
                {isAuthenticated ? '✅ Авторизован' : '❌ Не авторизован'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;