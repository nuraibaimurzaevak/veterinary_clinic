import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🔥 ОТЛАДКА
  console.log('🎯 Header запускается на пути:', location.pathname);
  console.log('🔐 localStorage при запуске Header:', {
    token: localStorage.getItem('token') ? '✅ Есть' : '❌ Нет',
    user: localStorage.getItem('user') ? '✅ Есть' : '❌ Нет'
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  // 1️⃣ ПРОВЕРКА: ЕСТЬ ЛИ ПОЛЬЗОВАТЕЛЬ?
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  const user = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!token && !!user;
  const isAdmin = user?.role === 'admin';
  const userName = user?.firstName || user?.name || 'Пользователь';

  // 2️⃣ СЛУШАЕМ СОБЫТИЯ ДЛЯ ПЕРЕЗАГРУЗКИ
  useEffect(() => {
    console.log('🔔 Header: Начинаю слушать события storage');
    
    const handleStorageChange = () => {
      console.log('🔔 Header: Получил событие storage - перерендериваюсь');
      // Принудительный перерендер при изменении localStorage
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Также слушаем кастомные события
    window.addEventListener('authChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  // 3️⃣ ЭФФЕКТЫ ДЛЯ СКРОЛЛА И МЕНЮ
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          burgerRef.current && !burgerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMenuOpen]);

  // 4️⃣ ОБРАБОТЧИКИ
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavClick = () => setIsMenuOpen(false);
  const handleLogin = () => { navigate('/login'); setIsMenuOpen(false); };
  const handleRegister = () => { navigate('/register'); setIsMenuOpen(false); };

  const handleLogout = () => {
    console.log('🚪 Header: Выход из системы');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
    
    // Отправляем ВСЕ события
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('authChange'));
    
    navigate('/');
  };

  // 5️⃣ ССЫЛКИ
  const getLinksForUser = () => {
    if (!isLoggedIn) {
      return [{ to: "/", label: "Главная", icon: "🏠" }];
    }

    if (isAdmin) {
      return [
        { to: "/dashboard", label: "Панель управления", icon: "📊" },
        { to: "/admin/animals", label: "Животные", icon: "🐕" },
        { to: "/admin/appointments", label: "Записи", icon: "📋" },
      ];
    }

    return [
      { to: "/", label: "Главная", icon: "🏠" },
      { to: "/booking", label: "Запись", icon: "📅" },
      { to: "/animals", label: "Мои питомцы", icon: "🐕" },
      { to: "/appointments", label: "Мои записи", icon: "📋" },
    ];
  };

  const links = getLinksForUser();

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${isAdmin ? 'admin-header' : ''}`}>
        <div className="header-container">
          <div className="header-content">
            {/* Логотип */}
            <div className="logo">
              <Link to="/" className="logo-link">
                <span className="logo-icon">🐾</span>
                <span className="logo-text">VetClinic</span>
                {isAdmin && <span className="admin-label">ADMIN</span>}
              </Link>
            </div>

            {/* Навигация */}
            <nav className="desktop-nav">
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Кнопки авторизации */}
            <div className="desktop-auth">
              {isLoggedIn ? (
                <div className="user-section">
                  <span className="user-greeting">
                    Привет, <span className="user-name">{userName}</span>
                    {isAdmin && <span className="admin-badge">👑</span>}
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

            {/* Бургер меню */}
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

      {/* Отступ */}
      <div className="header-spacer"></div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
          <nav ref={menuRef} className="mobile-menu">
            <div className="mobile-menu-content">
              <div className="mobile-nav-links">
                {links.map((link, index) => (
                  <Link
                    key={index}
                    to={link.to}
                    className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
                    onClick={handleNavClick}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    <span className="nav-label">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="mobile-user-section">
                {isLoggedIn ? (
                  <>
                    <div className="mobile-user-info">
                      <div className="mobile-user-greeting">
                        Привет, <span className="mobile-user-name">{userName}</span>
                        {isAdmin && <span className="mobile-admin-badge">👑 Админ</span>}
                      </div>
                      <div className="user-role">
                        {isAdmin ? 'Администратор' : 'Пользователь'}
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