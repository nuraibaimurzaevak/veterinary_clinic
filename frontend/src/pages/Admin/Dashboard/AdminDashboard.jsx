import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await fetch(`${API.BASE_URL}${endpoint}`, defaultOptions);
      
      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        throw new Error('Сессия истекла');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Быстрые действия
  const quickActions = [
    { title: 'Управление животными', icon: '🐕', onClick: () => navigate('/admin/animals') },
    { title: 'Управление ветеринарами', icon: '👨‍⚕️', onClick: () => navigate('/admin/vets') },
    { title: 'Все записи', icon: '📅', onClick: () => navigate('/admin/appointments') },
  ];

  // Загрузка данных с сервера
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Загружаем данные для дашборда...');
      
      // Загружаем все данные параллельно
      const [appointmentsData, animalsData, vetsData, usersData] = await Promise.all([
        apiRequest('/appointments/user').catch(() => []),
        apiRequest('/animals/all').catch(() => []),
        apiRequest('/vets').catch(() => []),
        apiRequest('/users').catch(() => [])
      ]);
      
      console.log('Полученные данные:', {
        appointments: appointmentsData,
        animals: animalsData,
        vets: vetsData,
        users: usersData
      });
      
      // Преобразуем данные в массивы
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : 
                          (appointmentsData?.appointments || appointmentsData?.data || []);
      
      const animals = Array.isArray(animalsData) ? animalsData : 
                     (animalsData?.animals || animalsData?.data || []);
      
      const vets = Array.isArray(vetsData) ? vetsData : 
                  (vetsData?.vets || vetsData?.data || []);
      
      const users = Array.isArray(usersData) ? usersData : 
                   (usersData?.users || usersData?.data || []);
      
      console.log('Статистика:', {
        totalAppointments: appointments.length,
        totalAnimals: animals.length,
        totalVets: vets.length,
        totalUsers: users.length
      });
      
      // Фильтруем записи на сегодня
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(app => {
        if (!app.date) return false;
        const appointmentDate = app.date.includes('T') ? app.date.split('T')[0] : app.date;
        return appointmentDate === today;
      });
      
      // Формируем статистику с реальными данными
      const formattedStats = [
        { 
          title: 'Всего животных', 
          value: animals.length.toString(), 
          change: '+0%',
          icon: '🐕' 
        },
        { 
          title: 'Записей сегодня', 
          value: todayAppointments.length.toString(), 
          change: '+0%', 
          icon: '📅' 
        },
        { 
          title: 'Пользователей', 
          value: users.length.toString(), 
          change: '+0%', 
          icon: '👥' 
        },
        { 
          title: 'Ветеринаров', 
          value: vets.length.toString(), 
          change: '+0', 
          icon: '👨‍⚕️' 
        },
      ];

      setStats(formattedStats);

      // Форматируем последние 5 записей
      const formattedAppointments = appointments.slice(0, 5).map((appointment, index) => {
        console.log('Обрабатываем запись:', appointment);
        
        // Животное
        let petName = 'Неизвестно';
        let animalType = 'Неизвестно';
        
        if (typeof appointment.animal === 'object' && appointment.animal !== null) {
          petName = appointment.animal.name || 'Без имени';
          animalType = appointment.animal.type || appointment.animal.species || 'Неизвестно';
        } else if (appointment.animalName) {
          petName = appointment.animalName;
        } else if (appointment.animal) {
          petName = appointment.animal;
        }
        
        // Владелец
        let ownerName = 'Неизвестно';
        
        if (typeof appointment.user === 'object' && appointment.user !== null) {
          ownerName = appointment.user.name || appointment.user.username || appointment.user.email || 'Неизвестно';
        } else if (typeof appointment.createdBy === 'object' && appointment.createdBy !== null) {
          ownerName = appointment.createdBy.name || appointment.createdBy.username || appointment.createdBy.email || 'Неизвестно';
        } else if (appointment.user) {
          ownerName = appointment.user;
        } else if (appointment.createdBy) {
          ownerName = appointment.createdBy;
        } else if (appointment.ownerName) {
          ownerName = appointment.ownerName;
        }
        
        // Ветеринар
        let vetName = 'Не назначен';
        
        if (typeof appointment.vet === 'object' && appointment.vet !== null) {
          vetName = appointment.vet.name || appointment.vet.username || appointment.vet.email || 'Не назначен';
        } else if (appointment.vet) {
          vetName = appointment.vet;
        }
        
        // Дата
        let displayDate = appointment.date || today;
        if (displayDate && displayDate.includes('T')) {
          displayDate = displayDate.split('T')[0];
        }

        return {
          id: appointment._id || `app-${index}`,
          pet: petName,
          owner: ownerName,
          vet: vetName,
          time: appointment.time || '--:--',
          date: displayDate,
          status: appointment.status || 'pending',
          icon: getAnimalIcon(animalType),
          animalType: animalType
        };
      });

      console.log('Отформатированные записи:', formattedAppointments);
      setRecentAppointments(formattedAppointments);

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(`Ошибка загрузки: ${err.message}. Используются тестовые данные.`);
      
      // Используем тестовые данные с не нулевыми значениями
      setStats([
        { title: 'Всего животных', value: '12', change: '+2%', icon: '🐕' },
        { title: 'Записей сегодня', value: '3', change: '+1', icon: '📅' },
        { title: 'Пользователей', value: '24', change: '+3%', icon: '👥' },
        { title: 'Ветеринаров', value: '5', change: '+0', icon: '👨‍⚕️' },
      ]);
      
      setRecentAppointments([
        { 
          id: 1, 
          pet: 'Барсик', 
          owner: 'Иван Петров', 
          vet: 'Др. Смирнова', 
          time: '10:30', 
          date: '2024-01-15',
          status: 'confirmed', 
          icon: '🐱',
          animalType: 'Кот'
        },
        { 
          id: 2, 
          pet: 'Мурка', 
          owner: 'Анна Сидорова', 
          vet: 'Др. Козлов', 
          time: '11:00', 
          date: '2024-01-15',
          status: 'pending', 
          icon: '🐈',
          animalType: 'Кошка'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения иконки животного
  const getAnimalIcon = (animalType) => {
    if (!animalType) return '🐾';
    
    const type = animalType.toLowerCase();
    if (type.includes('кот') || type.includes('кошка') || type.includes('cat')) return '🐱';
    if (type.includes('собака') || type.includes('dog')) return '🐕';
    if (type.includes('птица') || type.includes('bird')) return '🐦';
    if (type.includes('кролик') || type.includes('rabbit')) return '🐰';
    if (type.includes('хомяк') || type.includes('hamster')) return '🐹';
    if (type.includes('рыба') || type.includes('fish')) return '🐟';
    if (type.includes('черепаха') || type.includes('turtle')) return '🐢';
    return '🐾';
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
      case 'canceled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Подтверждена';
      case 'pending':
        return 'Ожидание';
      case 'cancelled':
      case 'canceled':
        return 'Отменена';
      case 'completed':
        return 'Завершена';
      default:
        return status || 'Неизвестно';
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    
    try {
      // Если дата в формате ISO (с "T")
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
      }
      
      // Если дата уже в формате YYYY-MM-DD
      const [year, month, day] = dateString.split('-');
      if (year && month && day) {
        return `${day}.${month}.${year}`;
      }
      
      return dateString;
    } catch {
      return dateString;
    }
  };

  const handleNewAppointment = () => {
    navigate('/booking');
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
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>
        <div className="header-actions">
          
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
              <h3>Последние записи</h3>
              <p className="table-subtitle">
                Последние записи на прием
              </p>
            </div>
            <div className="table-actions">
              <button 
                className="btn-link"
                onClick={() => navigate('/admin/appointments')}
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
                <button 
                  className="btn-primary"
                  onClick={handleNewAppointment}
                  style={{marginTop: '16px'}}
                >
                  Создать первую запись
                </button>
              </div>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Питомец</th>
                    <th>Владелец</th>
                    <th>Ветеринар</th>
                    <th>Дата</th>
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
                            <span className="pet-type">{appointment.animalType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="owner-name">{appointment.owner}</td>
                      <td className="vet-name">{appointment.vet}</td>
                      <td className="appointment-date">{formatDate(appointment.date)}</td>
                      <td className="appointment-time">{appointment.time}</td>
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
              <span className="data-label">Всего записей:</span>
              <span className="data-value">{recentAppointments.length}</span>
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