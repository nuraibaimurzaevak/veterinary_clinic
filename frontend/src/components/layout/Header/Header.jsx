import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);
  const headerRef = useRef(null);

  // Эффект при скролле
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setIsMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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

    // Закрытие меню при изменении роута
    setIsMenuOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header 
      ref={headerRef}
      className={`header ${isScrolled ? 'scrolled' : ''}`}
    >
      <div className="header-container">
        <div className="header-content">
          {/* Логотип */}
          <div className="logo">
            <Link to="/" className="logo-link" onClick={handleNavClick}>
              <span className="logo-icon">🐾</span>
              <span className="logo-text">VetClinic</span>
            </Link>
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

          {/* Навигация с кнопками ВНУТРИ */}
          <nav 
            ref={menuRef}
            className={`nav ${isMenuOpen ? 'active' : ''}`}
            aria-hidden={!isMenuOpen}
          >
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              🏠 Главная
            </Link>
            <Link 
              to="/booking" 
              className={`nav-link ${location.pathname === '/booking' ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              📅 Запись
            </Link>
            <Link 
              to="/animals" 
              className={`nav-link ${location.pathname === '/animals' ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              🐕 Мои питомцы
            </Link>
            <Link 
              to="/appointments" 
              className={`nav-link ${location.pathname === '/appointments' ? 'active' : ''}`} 
              onClick={handleNavClick}
            >
              📋 Мои записи
            </Link>

            {/* Кнопки авторизации КАК ЧАСТЬ НАВИГАЦИИ */}
            {isLoggedIn ? (
              <>
                <div className="user-greeting" style={{ 
                  margin: '10px 0', 
                  padding: '10px 16px',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(224, 224, 222, 0.5)'
                }}>
                  Привет, <span className="user-name">Иван</span>
                </div>
                <Link 
                  to="/profile" 
                  className="nav-btn nav-btn-outline" 
                  onClick={handleNavClick}
                >
                  👤 Профиль
                </Link>
                <button 
                  className="nav-btn" 
                  onClick={handleLogout}
                  style={{ marginTop: '10px' }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button 
                  className="nav-btn nav-btn-outline" 
                  onClick={handleLogin}
                  style={{ marginTop: '10px' }}
                >
                  Войти
                </button>
                <button 
                  className="nav-btn" 
                  onClick={handleRegister}
                  style={{ marginTop: '10px' }}
                >
                  Регистрация
                </button>
              </>
            )}
          </nav>

          {/* Старые кнопки авторизации (для совместимости) */}
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <div className="user-greeting">
                  Привет, <span className="user-name">Иван</span>
                </div>
                <Link 
                  to="/profile" 
                  className="btn btn-outline" 
                  onClick={handleNavClick}
                >
                  👤 Профиль
                </Link>
                <button className="btn" onClick={handleLogout}>
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={handleLogin}>
                  Войти
                </button>
                <button className="btn" onClick={handleRegister}>
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Затемнение фона при открытом меню */}
      {isMenuOpen && (
        <div 
          className="menu-overlay active"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;