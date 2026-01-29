import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css'

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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
    
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный телефон (минимум 10 цифр)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать буквы и цифры';
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
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Имитация запроса к API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Регистрация:', formData);
        alert('Регистрация успешна! Теперь вы можете войти.');
        navigate('/login');
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Произошла ошибка при регистрации. Попробуйте снова.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <h1>Создать аккаунт</h1>
            <p>Заполните форму для регистрации в клинике</p>
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Отчество</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="form-input"
                placeholder="Иванович"
                disabled={isSubmitting}
              />
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
                disabled={isSubmitting}
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
                placeholder="+7 (999) 123-45-67"
                disabled={isSubmitting}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Адрес</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                placeholder="ул. Ленина, д. 1, кв. 1"
                disabled={isSubmitting}
              />
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
                  disabled={isSubmitting}
                />
                {errors.password && <span className="error">{errors.password}</span>}
                <div className="password-requirements">
                  Пароль должен содержать:
                  <ul>
                    <li>Минимум 6 символов</li>
                    <li>Буквы и цифры</li>
                  </ul>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Подтверждение пароля *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Повторите пароль"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            
            <div className="form-footer">
              <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
              <p>Нажимая "Зарегистрироваться", вы соглашаетесь с нашими условиями использования</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;