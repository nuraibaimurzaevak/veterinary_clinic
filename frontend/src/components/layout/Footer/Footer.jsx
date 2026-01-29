import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>VetClinic</h3>
            <p>Профессиональный уход с заботой о каждом питомце. Современное оборудование, опытные специалисты.</p>
            <div className="social-links">
              <a href="#" className="social-link">📱</a>
              <a href="#" className="social-link">💬</a>
              <a href="#" className="social-link">📧</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>📍 г. Москва, ул. Пушкина, д. 1</p>
            <p>📞 +7 (999) 123-45-67</p>
            <p>📧 info@vetclinic.ru</p>
          </div>
          
          <div className="footer-section">
            <h4>Часы работы</h4>
            <p>Понедельник - Пятница: 9:00 - 20:00</p>
            <p>Суббота - Воскресенье: 10:00 - 18:00</p>
            <p>Экстренная помощь: 24/7</p>
          </div>
          
          <div className="footer-section">
            <h4>Быстрые ссылки</h4>
            <ul className="footer-links">
              <li><a href="/">Главная</a></li>
              <li><a href="/booking">Запись на прием</a></li>
              <li><a href="/animals">Мои питомцы</a></li>
              <li><a href="/appointments">Мои записи</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 VetClinic. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;