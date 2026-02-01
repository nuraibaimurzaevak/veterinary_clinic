import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

// 🔥 ИСПОЛЬЗУЕМ ДЕПЛОЙНУТЫЙ API
const API_URL = 'https://vet-clinic-fhfh.onrender.com/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (loginError) setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    setDebugInfo('');
    
    try {
      console.log('=== 🔐 ЛОГИН ===');
      console.log('📧 Email:', formData.email);
      console.log('🌐 API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📦 Ответ сервера:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при входе');
      }

      // ✅ УСПЕШНЫЙ ВХОД
      console.log('✅ Вход успешен!', data.user.email);
      
      // 🔥 КРИТИЧЕСКИ ВАЖНО: Сохраняем токен ТОЧНО так же как при регистрации
      // Регистрация сохраняет как 'token', логин тоже должен сохранять как 'token'
      const token = data.token || data.accessToken;
      if (!token) {
        throw new Error('Токен не получен от сервера');
      }
      
      localStorage.setItem('token', token);
      console.log('✅ Токен сохранен как "token":', token.substring(0, 20) + '...');
      
      // 🔥 Дополнительно сохраняем как 'accessToken' для обратной совместимости
      localStorage.setItem('accessToken', token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
        console.log('✅ Refresh token сохранен');
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Запоминаем email если нужно
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Проверяем что токен работает
      try {
        const verifyResponse = await fetch(`${API_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Verify успешен:', verifyData.message);
          setDebugInfo('✅ Токен верифицирован сервером');
        }
      } catch (verifyError) {
        console.warn('⚠️ Verify не удался:', verifyError.message);
        setDebugInfo('⚠️ Verify не удался, но вход выполнен');
      }
      
      // 🔥 Отправляем ВСЕ события
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('authChange'));
      window.dispatchEvent(new CustomEvent('loginSuccess'));
      
      console.log('✅ События отправлены, навигация...');
      
      // 🔥 Проверяем localStorage перед навигацией
      setTimeout(() => {
        console.log('=== 🔍 ПРОВЕРКА LOCALSTORAGE ===');
        console.log('token:', localStorage.getItem('token') ? '✅ Есть' : '❌ Нет');
        console.log('accessToken:', localStorage.getItem('accessToken') ? '✅ Есть' : '❌ Нет');
        console.log('user:', localStorage.getItem('user') ? '✅ Есть' : '❌ Нет');
        
        // Навигация
        if (data.user.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }, 300);
      
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      setLoginError(error.message || 'Ошибка при входе. Попробуйте снова.');
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

  // 🔥 Функция для проверки авторизации
  const testAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Токен не найден в localStorage');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('✅ Токен валиден!');
      } else {
        alert('❌ Токен невалиден');
      }
    } catch (error) {
      alert(`❌ Ошибка проверки: ${error.message}`);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Вход в аккаунт</h1>
            <p>Введите ваши данные для входа</p>
          </div>
          
          {loginError && (
            <div className="server-error">
              ⚠️ {loginError}
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
              <label className="form-label">Пароль *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Введите пароль"
                disabled={isLoading}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkbox-text">Запомнить меня</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            
            <div className="form-footer">
              <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
            </div>
          </form>
          
          {/* Отладочная информация */}
          <div className="debug-info">
            <h4>🔧 Отладка:</h4>
            <div className="debug-buttons">
              <button
                onClick={checkAPI}
                className="debug-btn"
              >
                Проверить API
              </button>
              
              <button
                onClick={testAuth}
                className="debug-btn"
              >
                Проверить токен
              </button>
              
              <button
                onClick={() => {
                  console.log('=== 🔍 LOCALSTORAGE ===');
                  console.log('token:', localStorage.getItem('token'));
                  console.log('accessToken:', localStorage.getItem('accessToken'));
                  console.log('user:', localStorage.getItem('user'));
                  alert('Проверьте консоль браузера (F12)');
                }}
                className="debug-btn"
              >
                Показать localStorage
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  alert('LocalStorage очищен');
                  window.location.reload();
                }}
                className="debug-btn danger"
              >
                Очистить данные
              </button>
            </div>
            
            <div className="current-token">
              <h5>Текущий токен:</h5>
              <code>
                {localStorage.getItem('token') 
                  ? `${localStorage.getItem('token').substring(0, 30)}...` 
                  : '❌ Не найден'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;