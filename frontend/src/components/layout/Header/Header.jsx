import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Валидация
      if (!formData.email.trim() || !formData.password.trim()) {
        throw new Error('Заполните все поля');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Введите корректный email');
      }

      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Сохраняем данные для "Запомнить меня"
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }

      // Создаем мок-пользователя
      const mockUser = {
        id: '1',
        email: formData.email,
        firstName: formData.email.split('@')[0],
        lastName: 'Тестовый',
        role: 'user'
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Сохраняем в localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Триггерим событие для обновления Header
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('authChange'));

      // Перенаправляем на главную
      navigate('/');

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
