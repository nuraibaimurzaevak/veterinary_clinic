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

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-wrapper">
          {/* Левая часть - информация */}
          <div className="login-info">
            <div className="login-info-content">
              <h1 className="login-title">С возвращением!</h1>
              <p className="login-subtitle">
                Войдите в свой аккаунт, чтобы получить доступ ко всем функциям ветеринарной клиники
              </p>
              
              <div className="login-features">
                <div className="feature-item">
                  <span className="feature-icon">🐕</span>
                  <div className="feature-text">
                    <h3>Управление питомцами</h3>
                    <p>Добавляйте и отслеживайте историю ваших животных</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">📅</span>
                  <div className="feature-text">
                    <h3>Онлайн записи</h3>
                    <p>Записывайтесь на прием в удобное время</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть - форма */}
          <div className="login-form-container">
            <div className="login-form-card">
              <div className="form-header">
                <h2>Вход в аккаунт</h2>
                <p>Введите ваши данные для входа</p>
              </div>
              
              {/* Оповещения об ошибках */}
              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              {debugInfo && (
                <div className="alert alert-info">
                  <span className="alert-icon">ℹ️</span>
                  {debugInfo}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="example@email.com"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Пароль</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
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
                    <span className="checkbox-text">Запомнить меня</span>
                  </label>
                  
                  <button type="button" className="forgot-password">
                    Забыли пароль?
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Вход...
                    </>
                  ) : 'Войти'}
                </button>
                
                <div className="form-footer">
                  <p>
                    Нет аккаунта?{' '}
                    <Link to="/register" className="link">
                      Зарегистрироваться
                    </Link>
                  </p>
                  <p className="back-home">
                    <Link to="/" className="link">
                      ← Вернуться на главную
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;