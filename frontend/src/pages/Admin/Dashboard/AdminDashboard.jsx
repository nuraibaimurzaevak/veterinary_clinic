import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // API URL
  const API_URL = 'http://localhost:5000/api';

  // Получение токена
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API запрос с авторизацией
  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      navigate('/login');
      throw new Error('Требуется авторизация');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`Запрос: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);
      
      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        throw new Error('Сессия истекла');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Вспомогательные функции для отчета
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Функция для скачивания отчета
  const handleDownloadReport = async () => {
    try {
      // Используем существующий эндпоинт для записей
      const appointments = await apiRequest('/appointments');
      
      // Преобразуем в CSV для скачивания
      const csvData = appointments.map(app => ({
        ID: app._id,
        Животное: app.animal?.name || 'Не указано',
        Владелец: app.user?.name || 'Не указано',
        Ветеринар: app.vet?.name || 'Не указано',
        Дата: app.date || 'Не указано',
        Время: app.time || 'Не указано',
        Услуга: app.service || 'Не указано',
        Статус: app.status || 'pending',
        Цена: app.price || '0'
      }));
      
      const csv = convertToCSV(csvData);
      downloadCSV(csv, `appointments-report-${new Date().toISOString().split('T')[0]}.csv`);
      
      alert('Отчет скачан успешно!');
    } catch (error) {
      console.error('Ошибка скачивания отчета:', error);
      alert('Ошибка при скачивании отчета');
    }
  };

  // Быстрые действия
  const quickActions = [
    { title: 'Управление животными', icon: '🐕', onClick: () => navigate('/animals') },
    { title: 'Управление ветеринарами', icon: '👨‍⚕️', onClick: () => navigate('/vets') },
    { title: 'Скачать отчет', icon: '📊', onClick: handleDownloadReport },
    { title: 'Все записи', icon: '📅', onClick: () => navigate('/appointments') },
  ];

  // Загрузка данных с сервера
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setUsingMockData(false);
      
      // Загружаем данные с существующих эндпоинтов
      const [animalsResponse, appointmentsResponse, vetsResponse, usersResponse] = await Promise.all([
        apiRequest('/animals/all').catch(() => ({ animals: [] })),
        apiRequest('/appointments').catch(() => ({ appointments: [] })),
        apiRequest('/vets').catch(() => ({ vets: [] })),
        apiRequest('/users').catch(() => ({ users: [] }))
      ]);

      const animals = animalsResponse.animals || animalsResponse || [];
      const appointments = appointmentsResponse.appointments || appointmentsResponse || [];
      const vets = vetsResponse.vets || vetsResponse || [];
      const users = usersResponse.users || usersResponse || [];

      // Фильтруем записи на сегодня
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(app => app.date === today);
      
      // Рассчитываем статистику
      const totalAnimals = animals.length;
      const todayAppointmentsCount = todayAppointments.length;
      const activeUsers = users.length;
      const totalVets = vets.length;

      // Форматируем статистику для отображения
      const formattedStats = [
        { 
          title: 'Всего животных', 
          value: totalAnimals.toLocaleString(), 
          change: '+0%', // Можно добавить реальную динамику
          icon: '🐕' 
        },
        { 
          title: 'Записей сегодня', 
          value: todayAppointmentsCount.toLocaleString(), 
          change: '+0%', 
          icon: '📅' 
        },
        { 
          title: 'Пользователей', 
          value: activeUsers.toLocaleString(), 
          change: '+0%', 
          icon: '👥' 
        },
        { 
          title: 'Ветеринаров', 
          value: totalVets.toLocaleString(), 
          change: '+0', 
          icon: '👨‍⚕️' 
        },
      ];

      setStats(formattedStats);

      // Форматируем последние записи (первые 5 сегодняшних или последних)
      const recentToShow = todayAppointments.length > 0 
        ? todayAppointments.slice(0, 5)
        : appointments.slice(0, 5);

      const formattedAppointments = await Promise.all(
        recentToShow.map(async appointment => {
          try {
            // Получаем дополнительные данные
            const animal = animals.find(a => a._id === appointment.animal) || {};
            const vet = vets.find(v => v._id === appointment.vet) || {};
            const user = users.find(u => u._id === appointment.user) || {};
            
            return {
              id: appointment._id,
              pet: animal.name || 'Не указано',
              owner: user.name || 'Не указано',
              vet: vet.name || 'Не указано',
              time: appointment.time || 'Не указано',
              date: appointment.date || today,
              status: appointment.status || 'pending',
              icon: getAnimalIcon(animal.type),
              animalType: animal.type,
              service: appointment.service
            };
          } catch {
            return {
              id: appointment._id,
              pet: 'Загрузка...',
              owner: 'Загрузка...',
              vet: 'Загрузка...',
              time: appointment.time || 'Не указано',
              date: appointment.date || today,
              status: appointment.status || 'pending',
              icon: '🐾',
              animalType: 'Не указано',
              service: appointment.service || 'Не указано'
            };
          }
        })
      );

      setRecentAppointments(formattedAppointments);
      setError(null);

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(`Ошибка: ${err.message}. Используются демо-данные.`);
      setUsingMockData(true);
      
      // Используем моковые данные
      setStats([
        { title: 'Всего животных', value: '1,245', change: '+12%', icon: '🐕' },
        { title: 'Записей сегодня', value: '48', change: '+5%', icon: '📅' },
        { title: 'Пользователей', value: '2,543', change: '+8%', icon: '👥' },
        { title: 'Ветеринаров', value: '24', change: '+2', icon: '👨‍⚕️' },
      ]);
      
      setRecentAppointments([
        { id: 1, pet: 'Барсик', owner: 'Иван Петров', vet: 'Др. Смирнова', time: '10:30', status: 'confirmed', icon: '🐱' },
        { id: 2, pet: 'Мурка', owner: 'Анна Сидорова', vet: 'Др. Козлов', time: '11:00', status: 'pending', icon: '🐈' },
        { id: 3, pet: 'Рекс', owner: 'Петр Иванов', vet: 'Др. Смирнова', time: '14:15', status: 'confirmed', icon: '🐕' },
        { id: 4, pet: 'Шарик', owner: 'Мария Ковалева', vet: 'Др. Петрова', time: '15:30', status: 'cancelled', icon: '🐕' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения иконки животного
  const getAnimalIcon = (animalType) => {
    if (!animalType) return '🐾';
    
    switch (animalType.toLowerCase()) {
      case 'кот':
      case 'кошка':
      case 'cat':
        return '🐱';
      case 'собака':
      case 'dog':
        return '🐕';
      case 'птица':
      case 'bird':
        return '🐦';
      case 'кролик':
      case 'rabbit':
        return '🐰';
      case 'хомяк':
      case 'hamster':
        return '🐹';
      case 'рыба':
      case 'fish':
        return '🐟';
      case 'черепаха':
      case 'turtle':
        return '🐢';
      default:
        return '🐾';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'status-confirmed';
      case 'pending':
      case 'waiting':
        return 'status-pending';
      case 'cancelled':
      case 'canceled':
        return 'status-cancelled';
      case 'completed':
      case 'done':
        return 'status-completed';
      case 'no_show':
      case 'noshow':
        return 'status-no-show';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'Подтверждена';
      case 'pending':
      case 'waiting':
        return 'Ожидание';
      case 'cancelled':
      case 'canceled':
        return 'Отменена';
      case 'completed':
      case 'done':
        return 'Завершена';
      case 'no_show':
      case 'noshow':
        return 'Не явился';
      default:
        return status || 'Неизвестно';
    }
  };

  // Форматирование даты и времени
  const formatDateTime = (date, time) => {
    try {
      if (!date) return time || 'Не указано';
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('ru-RU');
      return time ? `${formattedDate} ${time}` : formattedDate;
    } catch {
      return time || date || 'Не указано';
    }
  };

  const handleNewAppointment = () => {
    navigate('/booking');
  };

  const handleViewAll = () => {
    navigate('/appointments');
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Заголовок */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Панель управления</h1>
          <p className="dashboard-subtitle">Обзор статистики и управление записями</p>
          {error && (
            <div className="error-message-small">
              ⚠️ {error}
            </div>
          )}
          {usingMockData && (
            <div className="mock-data-warning">
              ⚠️ Используются демо-данные
            </div>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            Обновить
          </button>
          <button 
            className="btn-primary"
            onClick={handleNewAppointment}
          >
            <span className="btn-icon">+</span>
            Новая запись
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon-large">
              <span className="stat-icon-symbol">{stat.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </div>
            <div className={`stat-change-badge ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
              <span className="stat-change">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Основной контент */}
      <div className="dashboard-content">
        {/* Последние записи */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">
              <h3>Записи на сегодня</h3>
              <p className="table-subtitle">
                {usingMockData ? 'Демо-данные' : 'Последние записи на прием'}
              </p>
            </div>
            <div className="table-actions">
              <button 
                className="btn-link"
                onClick={handleViewAll}
              >
                Смотреть все
              </button>
              <button 
                className="btn-icon-small"
                onClick={handleRefresh}
                title="Обновить"
                disabled={loading}
              >
                {loading ? '⟳' : '↻'}
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            {recentAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h4>Нет записей</h4>
                <p>Записи на прием отсутствуют</p>
              </div>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Питомец</th>
                    <th>Владелец</th>
                    <th>Ветеринар</th>
                    <th>Время</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <div className="pet-info">
                          <div className="pet-icon-circle">
                            <span className="pet-icon-symbol">{appointment.icon}</span>
                          </div>
                          <div className="pet-details">
                            <span className="pet-name">{appointment.pet}</span>
                            <span className="pet-type">{appointment.animalType || 'Не указано'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="owner-name">{appointment.owner}</td>
                      <td className="vet-name">{appointment.vet}</td>
                      <td className="appointment-time">
                        {formatDateTime(appointment.date, appointment.time)}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="quick-actions-panel">
          <div className="panel-header">
            <h3>Быстрые действия</h3>
            <p className="panel-subtitle">Часто используемые функции</p>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                className="action-card"
                onClick={action.onClick}
              >
                <div className="action-icon-circle">
                  <span className="action-icon-symbol">{action.icon}</span>
                </div>
                <div className="action-text-content">
                  <span className="action-title">{action.title}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Информация о данных */}
          <div className="data-info">
            <div className="data-info-item">
              <span className="data-label">Обновлено:</span>
              <span className="data-value">{new Date().toLocaleTimeString('ru-RU')}</span>
            </div>
            <div className="data-info-item">
              <span className="data-label">Режим:</span>
              <span className="data-value">
                {usingMockData ? 'Демо-данные' : 'Реальные данные'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Подвал с информацией */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <p>Система управления ветеринарной клиникой</p>
          <p className="footer-version">Версия 1.0.0 | {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;