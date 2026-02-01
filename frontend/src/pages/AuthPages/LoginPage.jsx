import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

// 🔥 ИСПОЛЬЗУЕМ ДЕПЛОЙНУТЫЙ API
const API_URL = 'https://vet-clinic-fhfh.onrender.com/api';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Загружаем сохраненный email при монтировании
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedMe = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberedEmail && rememberedMe) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugInfo('');

    try {
      // Валидация
      if (!formData.email.trim() || !formData.password.trim()) {
        throw new Error('Заполните все поля');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Введите корректный email');
      }

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
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
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
      setError(error.message || 'Ошибка при входе. Попробуйте снова.');
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
    <div className="login-page">
      <div className="login-container">
        
        {/* Левая часть с приветствием */}
        <div className="login-left">
          <div className="welcome-content">
            <div className="welcome-logo">
              <span className="logo-icon">🐾</span>
              <span className="logo-text">VetClinic</span>
            </div>
            <h1 className="welcome-title">
              С возвращением!
            </h1>
            <p className="welcome-subtitle">
              Войдите в свой аккаунт, чтобы продолжить
            </p>
            <div className="welcome-features">
              <div className="feature">
                <span className="feature-icon">📅</span>
                <span>Записывайте питомцев онлайн</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🐕</span>
                <span>Управляйте историей питомцев</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔔</span>
                <span>Получайте уведомления</span>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть с формой */}
        <div className="login-right">
          <div className="form-container">
            <div className="form-header">
              <h2>Вход в аккаунт</h2>
              <p>Пожалуйста, введите ваши данные</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              {debugInfo && (
                <div className={`debug-message ${debugInfo.includes('✅') ? 'success' : 'warning'}`}>
                  {debugInfo}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="form-input"
                    disabled={isLoading}
                    required
                  />
                  <span className="input-icon">✉️</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="form-input"
                    disabled={isLoading}
                    required
                  />
                  <span className="input-icon">🔒</span>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="checkbox-custom"></span>
                  Запомнить меня
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Забыли пароль?
                </Link>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Вход...
                  </>
                ) : (
                  'Войти'
                )}
              </button>

              <div className="divider">
                <span>или</span>
              </div>

              <div className="alternative-login">
                <button type="button" className="google-btn">
                  <span className="google-icon">G</span>
                  Войти через Google
                </button>
              </div>

              <div className="signup-link">
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
              </div>

              {/* Отладочная панель (только для разработки) */}
              <div className="debug-panel">
                <div className="api-info">
                  <small>API: {API_URL}</small>
                </div>
                <div className="debug-buttons">
                  <button
                    type="button"
                    onClick={checkAPI}
                    className="debug-btn"
                  >
                    Проверить API
                  </button>
                  
                  <button
                    type="button"
                    onClick={testAuth}
                    className="debug-btn"
                  >
                    Проверить токен
                  </button>
                  
                  <button
                    type="button"
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
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
