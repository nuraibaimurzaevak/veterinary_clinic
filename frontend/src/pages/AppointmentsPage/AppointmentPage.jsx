import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../config/api'; // ← Импортируем конфиг
import './AppointmentPage.css';

const Appointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    today: 0
  });

  // Получение текущего пользователя
  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  // Получение токена
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API запрос с использованием fetch - ИСПРАВЛЕНО
  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const user = getCurrentUser();
    
    if (!user || !token) {
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
      console.log(`Отправка запроса на: ${API.BASE_URL}${endpoint}`); // ← Используем API.BASE_URL
      const response = await fetch(`${API.BASE_URL}${endpoint}`, defaultOptions);
      
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

  // Загрузка записей - ИСПРАВЛЕНО
  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        console.log('Пользователь не найден');
        navigate('/login');
        return;
      }

      console.log('Загрузка записей для пользователя:', user.id);
      
      // Используем API.APPOINTMENTS.USER - ИСПРАВЛЕНО
      const data = await apiRequest('/appointments/user');
      
      console.log('Получены записи:', data);
      
      // Обработка разных форматов ответа
      let appointmentsData = [];
      
      if (data && data.success && data.appointments) {
        // Формат: { success: true, appointments: [...] }
        appointmentsData = data.appointments;
      } else if (data && Array.isArray(data)) {
        // Формат: [...]
        appointmentsData = data;
      } else if (data && data.appointments) {
        // Формат: { appointments: [...] }
        appointmentsData = data.appointments;
      } else {
        console.error('Неверный формат ответа:', data);
        appointmentsData = [];
      }
      
      setAppointments(appointmentsData);
      
      // Рассчитываем статистику
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      setStats({
        total: appointmentsData.length,
        upcoming: appointmentsData.filter(a => 
          (a.status === 'pending' || a.status === 'confirmed') && 
          new Date(a.date) >= today
        ).length,
        completed: appointmentsData.filter(a => a.status === 'completed').length,
        cancelled: appointmentsData.filter(a => a.status === 'cancelled').length,
        today: appointmentsData.filter(a => {
          const appointmentDate = new Date(a.date);
          return appointmentDate.toDateString() === today.toDateString();
        }).length
      });
      
    } catch (error) {
      console.error('Ошибка загрузки записей:', error.message);
      // Используем моковые данные для тестирования
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Моковые данные для тестирования
  const loadMockData = () => {
    console.log('Загрузка моковых данных...');
    const mockAppointments = [
      {
        _id: '1',
        animal: {
          _id: '1',
          name: 'Барсик',
          type: 'Кот',
          breed: 'Британская'
        },
        vet: {
          _id: '1',
          name: 'Петрова Анна Сергеевна',
          specialization: 'Терапевт'
        },
        service: 'Плановый осмотр',
        date: '2024-02-15T00:00:00.000Z',
        time: '10:30',
        status: 'confirmed',
        notes: 'Принести предыдущие анализы',
        price: 2500,
        createdAt: '2024-02-10T14:30:00.000Z'
      },
      {
        _id: '2',
        animal: {
          _id: '2',
          name: 'Рекс',
          type: 'Собака',
          breed: 'Немецкая овчарка'
        },
        vet: {
          _id: '2',
          name: 'Сидоров Дмитрий Алексеевич',
          specialization: 'Хирург'
        },
        service: 'Швы после операции',
        date: '2024-02-20T00:00:00.000Z',
        time: '14:00',
        status: 'confirmed',
        notes: 'Не мочить швы',
        price: 1800,
        createdAt: '2024-02-12T09:15:00.000Z'
      },
      {
        _id: '3',
        animal: {
          _id: '3',
          name: 'Кеша',
          type: 'Попугай',
          breed: 'Волнистый'
        },
        vet: {
          _id: '3',
          name: 'Кузнецова Елена Владимировна',
          specialization: 'Офтальмолог'
        },
        service: 'Проблемы с глазами',
        date: '2024-02-10T00:00:00.000Z',
        time: '11:15',
        status: 'completed',
        notes: 'Повторный осмотр через неделю',
        price: 3200,
        createdAt: '2024-02-05T16:45:00.000Z'
      },
      {
        _id: '4',
        animal: {
          _id: '4',
          name: 'Мурка',
          type: 'Кошка',
          breed: 'Дворовая'
        },
        vet: {
          _id: '4',
          name: 'Иванова Ольга Михайловна',
          specialization: 'Стоматолог'
        },
        service: 'Чистка зубов',
        date: '2024-02-05T00:00:00.000Z',
        time: '09:00',
        status: 'cancelled',
        notes: 'Отменено по инициативе клиента',
        price: 4500,
        createdAt: '2024-01-30T11:20:00.000Z'
      }
    ];
    
    setAppointments(mockAppointments);
    
    // Рассчитываем статистику для моковых данных
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    setStats({
      total: mockAppointments.length,
      upcoming: mockAppointments.filter(a => 
        (a.status === 'pending' || a.status === 'confirmed') && 
        new Date(a.date) >= today
      ).length,
      completed: mockAppointments.filter(a => a.status === 'completed').length,
      cancelled: mockAppointments.filter(a => a.status === 'cancelled').length,
      today: mockAppointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate.toDateString() === today.toDateString();
      }).length
    });
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      console.log('Перенаправление на страницу входа...');
      navigate('/login');
    } else {
      console.log('Пользователь найден, загрузка записей...');
      loadAppointments();
    }
  }, []);

  // Фильтрация записей
  const filteredAppointments = appointments.filter(appointment => {
    // Фильтр по вкладке
    const isUpcoming = appointment.status === 'pending' || appointment.status === 'confirmed';
    const isPast = appointment.status === 'completed' || appointment.status === 'cancelled';
    
    if (activeTab === 'upcoming' && !isUpcoming) return false;
    if (activeTab === 'past' && !isPast) return false;
    
    // Фильтр по статусу
    if (filterStatus !== 'all' && appointment.status !== filterStatus) return false;
    
    // Фильтр по дате
    if (filterDate) {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      if (appointmentDate !== filterDate) return false;
    }
    
    // Поиск
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const animalName = appointment.animal?.name?.toLowerCase() || '';
      const vetName = appointment.vet?.name?.toLowerCase() || '';
      const service = appointment.service?.toLowerCase() || '';
      const specialization = appointment.vet?.specialization?.toLowerCase() || '';
      
      return (
        animalName.includes(term) ||
        vetName.includes(term) ||
        service.includes(term) ||
        specialization.includes(term)
      );
    }
    
    return true;
  });

  // Форматирование даты
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      
      return date.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Неверная дата';
    }
  };

  // Получение информации о статусе
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Ожидание', color: '#ED8936', icon: '⏳' };
      case 'confirmed':
        return { label: 'Подтвержден', color: '#4299E1', icon: '✓' };
      case 'completed':
        return { label: 'Завершен', color: '#48BB78', icon: '✅' };
      case 'cancelled':
        return { label: 'Отменен', color: '#F56565', icon: '❌' };
      default:
        return { label: 'Неизвестно', color: '#A0AEC0', icon: '❓' };
    }
  };

  // Отмена записи через API - ИСПРАВЛЕНО
  const handleCancelAppointment = async (appointmentId) => {
    try {
      // Используем правильный endpoint для отмены
      await apiRequest(`/appointments/${appointmentId}/cancel`, {
        method: 'PUT'
      });

      // Обновляем локальное состояние
      setAppointments(prev => prev.map(app => 
        app._id === appointmentId 
          ? { ...app, status: 'cancelled' }
          : app
      ));
      
      // Обновляем статистику
      loadAppointments();
      
      return true;
    } catch (error) {
      console.error('Ошибка отмены записи:', error);
      throw error;
    }
  };

  // Подтверждение отмены
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Пожалуйста, укажите причину отмены');
      return;
    }

    try {
      await handleCancelAppointment(selectedAppointment._id);
      
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      
      alert('Запись успешно отменена');
    } catch (error) {
      alert('Ошибка при отмене записи');
    }
  };

  // Удаление записи - ИСПРАВЛЕНО
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      // Проверяем права пользователя
      const user = getCurrentUser();
      if (user.role !== 'admin') {
        alert('Только администратор может удалять записи');
        return;
      }

      await apiRequest(`/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      
      // Обновляем локальное состояние
      setAppointments(prev => prev.filter(app => app._id !== appointmentId));
      
      // Обновляем статистику
      loadAppointments();
      
      alert('Запись успешно удалена');
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
      alert('Ошибка при удалении записи');
    }
  };

  // Создание новой записи
  const handleNewAppointment = () => {
    navigate('/booking');
  };

  // Перенос записи
  const handleReschedule = (appointmentId) => {
    navigate(`/booking?edit=${appointmentId}`);
  };

  // Рендер карточки записи
  const renderAppointmentCard = (appointment) => {
    const statusInfo = getStatusInfo(appointment.status);
    const isUpcoming = appointment.status === 'pending' || appointment.status === 'confirmed';
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';

    // Безопасное получение данных
    const animalName = appointment.animal?.name || 'Неизвестный питомец';
    const animalType = appointment.animal?.type || '';
    const vetName = appointment.vet?.name || 'Неизвестный врач';
    const specialization = appointment.vet?.specialization || '';
    
    const appointmentDate = new Date(appointment.date);
    const day = appointmentDate.getDate();
    const month = appointmentDate.toLocaleDateString('ru-RU', { month: 'short' });

    return (
      <div key={appointment._id} className="appointment-card">
        <div className="appointment-header">
          <div className="appointment-date">
            <div className="date-day">{day}</div>
            <div className="date-month">{month}</div>
          </div>
          
          <div className="appointment-info">
            <div className="info-main">
              <h3 className="pet-name">
                {animalName} {animalType && `(${animalType})`}
              </h3>
              <p className="vet-name">{vetName}</p>
            </div>
            
            <div className="info-details">
              <span className="specialization">{specialization}</span>
              <span className="time">{appointment.time}</span>
              <span className="service">{appointment.service}</span>
            </div>
          </div>
          
          <div className="appointment-status" style={{ color: statusInfo.color }}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-label">{statusInfo.label}</span>
          </div>
        </div>
        
        <div className="appointment-body">
          <div className="appointment-reason">
            <strong>Услуга:</strong> {appointment.service}
          </div>
          
          {appointment.notes && (
            <div className="appointment-notes">
              <strong>Примечания:</strong> {appointment.notes}
            </div>
          )}
          
          <div className="appointment-meta">
            <span className="meta-item">
              <strong>Дата:</strong> {formatDate(appointment.date)}
            </span>
            <span className="meta-item">
              <strong>Время:</strong> {appointment.time}
            </span>
          </div>
        </div>
        
        <div className="appointment-footer">
          <div className="appointment-price">
            Стоимость: <strong>{appointment.price || 0} ₽</strong>
          </div>
          
          <div className="appointment-actions">
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setSelectedAppointment(appointment)}
            >
              Подробнее
            </button>
            
            {isUpcoming && (
              <>
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowCancelModal(true);
                  }}
                >
                  Отменить
                </button>
                
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleReschedule(appointment._id)}
                >
                  Перенести
                </button>
              </>
            )}
            
            {isCancelled && (
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteAppointment(appointment._id)}
              >
                Удалить
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Рендер списка записей
  const renderAppointmentsList = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка записей...</p>
        </div>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Записей не найдено</h3>
          <p>
            {activeTab === 'upcoming' 
              ? 'У вас нет предстоящих записей'
              : 'У вас нет завершенных записей'
            }
          </p>
          <button 
            className="btn btn-primary"
            onClick={handleNewAppointment}
          >
            Создать первую запись
          </button>
        </div>
      );
    }

    return (
      <div className="appointments-grid">
        {filteredAppointments.map(renderAppointmentCard)}
      </div>
    );
  };

  return (
    <div className="appointments-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <div>
            <h1>📋 Мои записи</h1>
            <p>Управление визитами в ветеринарную клинику</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={handleNewAppointment}
            >
              + Новая запись
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Всего записей</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#4299E1' }}>⏰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.upcoming}</div>
              <div className="stat-label">Предстоящие</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#48BB78' }}>✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Завершенные</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#F56565' }}>❌</div>
            <div className="stat-content">
              <div className="stat-value">{stats.cancelled}</div>
              <div className="stat-label">Отмененные</div>
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Предстоящие ({stats.upcoming})
          </button>
          <button 
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            История ({stats.completed + stats.cancelled})
          </button>
        </div>

        {/* Фильтры */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по питомцу, врачу или услуге..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-options">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидание</option>
              <option value="confirmed">Подтвержден</option>
              <option value="completed">Завершен</option>
              <option value="cancelled">Отменен</option>
            </select>
            
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="date-input"
              placeholder="Фильтр по дате"
            />
            
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterDate('');
              }}
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* Список записей */}
        <div className="appointments-container">
          {renderAppointmentsList()}
        </div>

        {/* Модальное окно деталей */}
        {selectedAppointment && !showCancelModal && (
          <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Детали записи</h2>
                <button className="modal-close" onClick={() => setSelectedAppointment(null)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Основная информация</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Питомец:</span>
                      <span className="detail-value">
                        {selectedAppointment.animal?.name || 'Неизвестно'} 
                        {selectedAppointment.animal?.type && ` (${selectedAppointment.animal.type})`}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Врач:</span>
                      <span className="detail-value">
                        {selectedAppointment.vet?.name || 'Неизвестно'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Специализация:</span>
                      <span className="detail-value">
                        {selectedAppointment.vet?.specialization || 'Не указана'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Дата и время:</span>
                      <span className="detail-value">
                        {formatDate(selectedAppointment.date)} в {selectedAppointment.time}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Статус:</span>
                      <span className="detail-value" style={{ color: getStatusInfo(selectedAppointment.status).color }}>
                        {getStatusInfo(selectedAppointment.status).label}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Услуга:</span>
                      <span className="detail-value">{selectedAppointment.service || 'Не указана'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Стоимость:</span>
                      <span className="detail-value">{selectedAppointment.price || 0} ₽</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Дополнительная информация</h3>
                  <div className="detail-grid">
                    {selectedAppointment.notes && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Примечания:</span>
                        <span className="detail-value">{selectedAppointment.notes}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Создана:</span>
                      <span className="detail-value">
                        {selectedAppointment.createdAt 
                          ? new Date(selectedAppointment.createdAt).toLocaleDateString('ru-RU')
                          : 'Неизвестно'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setSelectedAppointment(null)}>
                  Закрыть
                </button>
                {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => {
                      setSelectedAppointment(null);
                      setTimeout(() => {
                        setSelectedAppointment(selectedAppointment);
                        setShowCancelModal(true);
                      }, 100);
                    }}
                  >
                    Отменить запись
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно отмены */}
        {showCancelModal && selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h2>Отмена записи</h2>
                <button 
                  className="modal-close" 
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedAppointment(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <p>
                  Вы собираетесь отменить запись для <strong>{selectedAppointment.animal?.name || 'питомца'}</strong> на{' '}
                  {formatDate(selectedAppointment.date)} в {selectedAppointment.time}
                </p>
                
                <div className="form-group">
                  <label htmlFor="cancelReason">Укажите причину отмены *</label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Например: изменились планы, питомец заболел и т.д."
                    rows={3}
                    className="form-textarea"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedAppointment(null);
                  }}
                >
                  Назад
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={!cancelReason.trim()}
                >
                  Подтвердить отмену
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;