import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';
import API from '../../../config/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  // Эффект при скролле
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        burgerRef.current && 
        !burgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Предотвращаем скролл страницы когда меню открыто
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API.BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      setIsMenuOpen(false);
      navigate('/');
    }
  };

  // Определяем какие ссылки показывать
  const getLinksForUser = () => {
    if (!user) {
      // Ссылки для гостей
      return [
        { to: "/", label: "Главная", icon: "🏠" },
        { to: "/vets", label: "Ветеринары", icon: "👨‍⚕️" },
      ];
    }

    if (user.role === 'admin') {
      // Ссылки ТОЛЬКО для админа
      return [
        { to: "/", label: "Главная", icon: "🏠" },
        { to: "/dashboard", label: "Панель управления", icon: "📊" },
        { to: "/admin/animals", label: "Животные", icon: "🐕" },
        { to: "/admin/appointments", label: "Записи", icon: "📋" },
      ];
    }

    // Ссылки для обычного пользователя
    return [
      { to: "/", label: "Главная", icon: "🏠" },
      { to: "/booking", label: "Запись", icon: "📅" },
      { to: "/animals", label: "Мои питомцы", icon: "🐕" },
      { to: "/appointments", label: "Мои записи", icon: "📋" },
      { to: "/vets", label: "Ветеринары", icon: "👨‍⚕️" },
    ];
  };

  // Рендер ссылок для десктопа
  const renderDesktopLinks = () => {
    const links = getLinksForUser();

    return links.map((link, index) => (
      <Link
        key={index}
        to={link.to}
        className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        {link.label}
      </Link>
    ));
  };

  // Рендер ссылок для мобильного меню
  const renderMobileLinks = () => {
    const links = getLinksForUser();

    return links.map((link, index) => (
      <Link
        key={index}
        to={link.to}
        className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-icon">{link.icon}</span>
        <span className="nav-label">{link.label}</span>
      </Link>
    ));
  };

  // Показываем загрузку если еще грузится
  if (loading) {
    return (
      <>
        <header className="header">
          <div className="header-container">
            <div className="header-content">
              <div className="logo">
                <Link to="/" className="logo-link">
                  <span className="logo-icon">🐾</span>
                  <span className="logo-text">VetClinic</span>
                </Link>
              </div>
              <div className="desktop-auth">
                <span className="loading-text">Загрузка...</span>
              </div>
            </div>
          </div>
        </header>
        <div className="header-spacer"></div>
      </>
    );
  }

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${user?.role === 'admin' ? 'admin-header' : ''}`}>
        <div className="header-container">
          <div className="header-content">
            {/* Логотип */}
            <div className="logo">
              <Link to="/" className="logo-link">
                <span className="logo-icon">🐾</span>
                <span className="logo-text">VetClinic</span>
                {user?.role === 'admin' && (
                  <span className="admin-label">ADMIN</span>
                )}
              </Link>
            </div>

            {/* Десктопная навигация */}
            <nav className="desktop-nav">
              {renderDesktopLinks()}
            </nav>

            {/* Десктопные кнопки авторизации */}
            <div className="desktop-auth">
              {user ? (
                <div className="user-section">
                  <span className="user-greeting">
                    Привет, <span className="user-name">{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="admin-badge">👑</span>
                    )}
                  </span>
                  <button className="btn btn-logout" onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="auth-section">
                  <button className="btn btn-login" onClick={handleLogin}>
                    Войти
                  </button>
                  <button className="btn btn-register" onClick={handleRegister}>
                    Регистрация
                  </button>
                </div>
              )}
            </div>

            {/* Бургер меню для мобильных */}
            <button 
              ref={burgerRef}
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Меню"
              aria-expanded={isMenuOpen}
            >
              <span className="menu-toggle-line"></span>
              <span className="menu-toggle-line"></span>
              <span className="menu-toggle-line"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Отступ для фиксированного header */}
      <div className="header-spacer"></div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
          <nav ref={menuRef} className="mobile-menu">
            <div className="mobile-menu-content">
              <div className="mobile-nav-links">
                {renderMobileLinks()}
              </div>

              <div className="mobile-user-section">
                {user ? (
                  <>
                    <div className="mobile-user-info">
                      <div className="mobile-user-greeting">
                        Привет, <span className="mobile-user-name">{user.name}</span>
                        {user.role === 'admin' && (
                          <span className="mobile-admin-badge">👑 Админ</span>
                        )}
                      </div>
                      <div className="user-role">
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </div>
                    </div>
                    <button className="mobile-btn mobile-btn-logout" onClick={handleLogout}>
                      Выйти
                    </button>
                  </>
                ) : (
                  <div className="mobile-auth-buttons">
                    <button className="mobile-btn mobile-btn-login" onClick={handleLogin}>
                      Войти
                    </button>
                    <button className="mobile-btn mobile-btn-register" onClick={handleRegister}>
                      Регистрация
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Header;