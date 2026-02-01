import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

// 🔥 ИСПОЛЬЗУЕМ ДЕПЛОЙНУТЫЙ API
const API_URL = 'https://vet-clinic-fhfh.onrender.com/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+996',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Введите имя';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Введите фамилию';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Введите email';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Введите корректный email';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Введите телефон';
    }
    
    if (!formData.password) {
      errors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен быть не менее 6 символов';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    return errors;
  };

  // 🔥 Функция для автоматического входа после регистрации
  const autoLoginAfterRegister = async (email, password) => {
    try {
      console.log('🔄 Автоматический вход после регистрации...');
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка автоматического входа');
      }

      // ✅ Вход успешен
      const token = data.token || data.accessToken;
      if (!token) {
        throw new Error('Токен не получен при автоматическом входе');
      }
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✅ Автоматический вход успешен:', data.user.email);
      
      // 🔥 Отправляем события для обновления Header
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('authChange'));
      window.dispatchEvent(new CustomEvent('loginSuccess'));
      
      return true;
      
    } catch (error) {
      console.error('❌ Ошибка автоматического входа:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugInfo('');

    try {
      // Валидация
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setError('Пожалуйста, заполните все поля корректно');
        return;
      }

      console.log('=== 📝 РЕГИСТРАЦИЯ ===');
      console.log('📧 Email:', formData.email);
      console.log('🌐 API URL:', API_URL);
      console.log('📋 Данные для отправки:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: '***' // Не показываем пароль в логах
      });

      // 1️⃣ ШАГ 1: Регистрация
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
      console.log('📦 Ответ сервера регистрации:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
      }

      // ✅ УСПЕШНАЯ РЕГИСТРАЦИЯ
      console.log('✅ Регистрация успешна! Пользователь:', data.user?.email);
      
      // 🔥 Проверяем, вернул ли сервер токен сразу
      if (data.token) {
        console.log('✅ Токен получен сразу при регистрации');
        localStorage.setItem('token', data.token);
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setDebugInfo('✅ Регистрация успешна! Автоматический вход...');
      } else {
        // 2️⃣ ШАГ 2: Автоматический вход если токен не вернулся
        console.log('🔄 Токен не получен, выполняем автоматический вход...');
        setDebugInfo('✅ Регистрация успешна! Выполняем вход...');
        
        await autoLoginAfterRegister(formData.email, formData.password);
      }
      
      // Задержка для показа сообщения
      setTimeout(() => {
        console.log('✅ Навигация на главную...');
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      setError(error.message || 'Произошла ошибка при регистрации');
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
              <h1 className="login-title">Присоединяйтесь к нам!</h1>
              <p className="login-subtitle">
                Создайте аккаунт и получите доступ ко всем функциям ветеринарной клиники
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
                <h2>Создать аккаунт</h2>
                <p>Заполните форму для регистрации</p>
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
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Имя *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Иван"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Фамилия *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Иванов"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email *</label>
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
                  <label className="form-label">Телефон *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+996 999 99 99 99"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Пароль *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Минимум 6 символов"
                      disabled={isLoading}
                      required
                    />
                    <div className="password-hint">
                      * Пароль должен содержать минимум 6 символов
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Подтверждение *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Повторите пароль"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Регистрация...
                    </>
                  ) : 'Зарегистрироваться'}
                </button>
                
                <div className="form-footer">
                  <p>
                    Уже есть аккаунт?{' '}
                    <Link to="/login" className="link">
                      Войти
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

export default RegisterPage;