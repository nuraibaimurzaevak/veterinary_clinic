import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Header from '../../components/layout/Header/Header';

const HomePage = () => {
  const navigate = useNavigate();

  const services = [
    { icon: '🩺', title: 'Терапия', desc: 'Диагностика и лечение заболеваний' },
    { icon: '🔪', title: 'Хирургия', desc: 'Операции любой сложности' },
    { icon: '🦷', title: 'Стоматология', desc: 'Уход за зубами и полостью рта' },
    { icon: '👁️', title: 'Офтальмология', desc: 'Лечение заболеваний глаз' },
    { icon: '💉', title: 'Вакцинация', desc: 'Прививки и профилактика' },
    { icon: '🧪', title: 'Лаборатория', desc: 'Анализы и исследования' },
    { icon: '🩻', title: 'Диагностика', desc: 'УЗИ, рентген, МРТ' },
    { icon: '🏃', title: 'Реабилитация', desc: 'Восстановление после операций' },
  ];

  // В реальном приложении здесь будет проверка авторизации
  const isAuthenticated = false; // Поменяйте на true, чтобы увидеть блок

  return (
    <div className="home-page">
      {/* Панель управления (только для авторизованных пользователей) */}
      {isAuthenticated && (
        <section className="dashboard-section">
          <div className="container">
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3 className="stat-number">0</h3>
                <p className="stat-label">Всего животных</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">2</h3>
                <p className="stat-label">Записей сегодня</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">0</h3>
                <p className="stat-label">Активных пользователей</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">—</h3>
                <p className="stat-label">Ветеринаров</p>
              </div>
            </div>
            
            <div className="dashboard-actions">
              <button 
                className="dashboard-btn primary"
                onClick={() => navigate('/new-appointment')}
              >
                📋 Новая запись
              </button>
              <button 
                className="dashboard-btn secondary"
                onClick={() => navigate('/my-pets')}
              >
                🐶 Мои питомцы
              </button>
              <button 
                className="dashboard-btn secondary"
                onClick={() => navigate('/my-appointments')}
              >
                📅 Мои записи
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Герой секция */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Забота о вашем питомце — <span className="highlight">наша миссия</span>
              </h1>
              <p className="hero-subtitle">
                Профессиональная ветеринарная помощь с любовью и заботой. 
                Современное оборудование, опытные специалисты и индивидуальный подход к каждому питомцу.
              </p>
              <div className="hero-buttons">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => navigate('/booking')}
                >
                  📅 Записаться на прием
                </button>
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => navigate('/register')}
                >
                  📝 Быстрая регистрация
                </button>
              </div>
            </div>
            <div className="hero-image">
              <div className="image-placeholder">
                🐕 🐈 🐦
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🏥</div>
              <h3>Современная клиника</h3>
              <p>Новейшее оборудование и комфортные условия для животных</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👨‍⚕️</div>
              <h3>Опытные врачи</h3>
              <p>Специалисты с многолетним опытом и регулярным повышением квалификации</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⏱️</div>
              <h3>Экономьте время</h3>
              <p>Онлайн-запись и электронная очередь без длительного ожидания</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📱</div>
              <h3>Удобный контроль</h3>
              <p>Личный кабинет с историей посещений и напоминаниями</p>
            </div>
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Наши услуги</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Как записаться */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">Как записаться на прием</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Регистрация</h3>
              <p>Создайте личный кабинет за 2 минуты</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Добавьте питомца</h3>
              <p>Заполните карточку животного</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Выберите услугу</h3>
              <p>Укажите причину визита</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Выберите время</h3>
              <p>Запишитесь на удобную дату и время</p>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <h3>Подтверждение</h3>
              <p>Получите подтверждение на email или смс</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Начните заботиться о питомце правильно</h2>
            <p className="cta-text">
              Присоединяйтесь к тысячам довольных клиентов, которые доверяют здоровье своих питомцев нам
            </p>
            <div className="cta-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate('/register')}
              >
                🐾 Начать сейчас
              </button>
              <button 
                className="btn btn-outline btn-large"
                onClick={() => navigate('/login')}
              >
                🔑 Уже есть аккаунт
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;