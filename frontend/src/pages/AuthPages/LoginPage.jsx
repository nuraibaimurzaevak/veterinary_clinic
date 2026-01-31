import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../config/api';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Получаем путь для возврата после входа
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Базовая валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      // Перенаправляем на страницу, с которой пришли, или на главную
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role = 'user') => {
    setLoading(true);
    setError('');
    
    try {
      const demoEmail = role === 'admin' ? 'admin@vetclinic.ru' : 'user@example.com';
      const demoPassword = '123456';
      
      // Прямой вызов API для демо-входа (или используйте моковые данные)
      const response = await fetch(`${API.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: demoEmail, 
          password: demoPassword 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user && data.token) {
          const userData = {
            id: data.user._id || data.user.id,
            name: data.user.firstName || data.user.name || 'Пользователь',
            email: data.user.email,
            role: data.user.role || role,
            token: data.token
          };
          
          // Сохраняем в localStorage
          localStorage.setItem('token', userData.token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Отправляем событие для обновления всех компонентов
          window.dispatchEvent(new Event('authChange'));
          
          // Перенаправляем
          navigate(from, { replace: true });
        } else {
          throw new Error('Неверные демо-данные');
        }
      } else {
        // Если API не работает, используем мок
        const mockUser = {
          id: Date.now(),
          name: role === 'admin' ? 'Администратор' : 'Пользователь',
          email: demoEmail,
          role: role,
          token: 'demo-token-' + Date.now()
        };
        
        localStorage.setItem('token', mockUser.token);
        localStorage.setItem('user', JSON.stringify(mockUser));
        window.dispatchEvent(new Event('authChange'));
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Демо-вход временно недоступен');
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Заголовок */}
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🐾</span>
            <span className="logo-text">VetClinic</span>
          </div>
          <h1>Вход в систему</h1>
          <p className="login-subtitle">
            Войдите в свой аккаунт для управления записями и питомцами
          </p>
        </div>

        {/* Форма входа */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email адрес
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="form-input"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Запомнить меня</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Забыли пароль?
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Вход в систему...
              </>
            ) : (
              'Войти в аккаунт'
            )}
          </button>
        </form>

        {/* Разделитель */}
        <div className="divider">
          <span className="divider-text">или</span>
        </div>

        {/* Демо вход */}
        <div className="demo-section">
          <h3 className="demo-title">Быстрый тестовый вход</h3>
          <p className="demo-subtitle">
            Используйте для тестирования системы без регистрации
          </p>
          
          <div className="demo-buttons">
            <button 
              type="button" 
              className="btn btn-demo btn-demo-user"
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
            >
              <span className="demo-icon">👤</span>
              <div className="demo-button-content">
                <span className="demo-button-title">Пользователь</span>
                <span className="demo-button-subtitle">Обычный клиент клиники</span>
              </div>
            </button>
            
            <button 
              type="button" 
              className="btn btn-demo btn-demo-admin"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
            >
              <span className="demo-icon">👑</span>
              <div className="demo-button-content">
                <span className="demo-button-title">Администратор</span>
                <span className="demo-button-subtitle">Полный доступ к системе</span>
              </div>
            </button>
          </div>
        </div>

        {/* Ссылки */}
        <div className="login-footer">
          <p className="register-link">
            Ещё нет аккаунта?{' '}
            <Link to="/register" className="link">
              Зарегистрироваться
            </Link>
          </p>
          <p className="home-link">
            <Link to="/" className="link">
              ← Вернуться на главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;