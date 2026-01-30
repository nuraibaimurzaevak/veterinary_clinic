import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = 'http://localhost:5000/api';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при входе');
      }

      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Сохраняем настройку "запомнить меня"
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      // РЕДИРЕКТ В ЗАВИСИМОСТИ ОТ РОЛИ
      if (data.user.role === 'admin') {
        navigate('/dashboard'); // Админ
      } else {
        navigate('/'); // Обычный пользователь на главную
      }
      
    } catch (error) {
      setLoginError(error.message || 'Ошибка при входе. Попробуйте снова.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Функция восстановления пароля в разработке');
  };

  // При загрузке компонента, проверяем сохраненный email
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

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-wrapper">
          {/* Левая часть - информация */}
          <div className="login-info">
            <div className="login-info-content">
              <h1 className="login-title">С возвращением!</h1>
              <p className="login-subtitle">
                Войдите в свой аккаунт, чтобы продолжить заботиться о питомце
              </p>
              
              <div className="login-features">
                <div className="feature-item">
                  <div className="feature-icon">📋</div>
                  <div className="feature-text">
                    <h3>История посещений</h3>
                    <p>Все записи в одном месте</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🐕</div>
                  <div className="feature-text">
                    <h3>Карточки питомцев</h3>
                    <p>Управление информацией о животных</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🔔</div>
                  <div className="feature-text">
                    <h3>Напоминания</h3>
                    <p>О прививках и визитах</p>
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

              {loginError && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email адрес
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="example@vetclinic.ru"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Пароль
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Введите ваш пароль"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
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
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">Запомнить меня</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="forgot-password"
                    disabled={isLoading}
                  >
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
                  ) : (
                    'Войти'
                  )}
                </button>

                <div className="form-footer">
                  <p>
                    Ещё нет аккаунта?{' '}
                    <Link to="/register" className="link">
                      Зарегистрироваться
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

export default Login;