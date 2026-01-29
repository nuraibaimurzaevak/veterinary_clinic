import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
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

  // Моковые данные записей
  const mockAppointments = [
    {
      id: '1',
      petName: 'Барсик',
      petType: 'Кот',
      vetName: 'Петрова Анна Сергеевна',
      specialization: 'Терапевт',
      date: '2024-02-15',
      time: '10:30',
      status: 'upcoming', // upcoming, completed, cancelled
      reason: 'Плановый осмотр',
      symptoms: ['Вялость', 'Отказ от еды'],
      diagnosis: '',
      treatment: '',
      price: 2500,
      duration: 30,
      notes: 'Принести предыдущие анализы',
      createdAt: '2024-02-10T14:30:00Z'
    },
    {
      id: '2',
      petName: 'Рекс',
      petType: 'Собака',
      vetName: 'Сидоров Дмитрий Алексеевич',
      specialization: 'Хирург',
      date: '2024-02-20',
      time: '14:00',
      status: 'upcoming',
      reason: 'Швы после операции',
      symptoms: ['Осмотр швов'],
      diagnosis: '',
      treatment: '',
      price: 1800,
      duration: 20,
      notes: 'Не мочить швы',
      createdAt: '2024-02-12T09:15:00Z'
    },
    {
      id: '3',
      petName: 'Кеша',
      petType: 'Попугай',
      vetName: 'Кузнецова Елена Владимировна',
      specialization: 'Офтальмолог',
      date: '2024-02-10',
      time: '11:15',
      status: 'completed',
      reason: 'Проблемы с глазами',
      symptoms: ['Покраснение глаз', 'Слезотечение'],
      diagnosis: 'Конъюнктивит',
      treatment: 'Глазные капли 3 раза в день, курс 7 дней',
      price: 3200,
      duration: 45,
      notes: 'Повторный осмотр через неделю',
      createdAt: '2024-02-05T16:45:00Z'
    },
    {
      id: '4',
      petName: 'Мурка',
      petType: 'Кошка',
      vetName: 'Иванова Ольга Михайловна',
      specialization: 'Стоматолог',
      date: '2024-02-05',
      time: '09:00',
      status: 'cancelled',
      reason: 'Чистка зубов',
      symptoms: ['Зубной камень'],
      diagnosis: '',
      treatment: '',
      price: 4500,
      duration: 60,
      notes: 'Отменено по инициативе клиента',
      cancelReason: 'Питомец заболел',
      createdAt: '2024-01-30T11:20:00Z',
      cancelledAt: '2024-02-03T15:30:00Z'
    },
    {
      id: '5',
      petName: 'Шарик',
      petType: 'Собака',
      vetName: 'Петрова Анна Сергеевна',
      specialization: 'Терапевт',
      date: '2024-02-25',
      time: '15:30',
      status: 'upcoming',
      reason: 'Вакцинация',
      symptoms: ['Плановая прививка'],
      diagnosis: '',
      treatment: '',
      price: 1500,
      duration: 15,
      notes: 'Перед вакцинацией не кормить 4 часа',
      createdAt: '2024-02-18T13:10:00Z'
    }
  ];

  // Загрузка данных
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        // Имитация загрузки
        await new Promise(resolve => setTimeout(resolve, 800));
        setAppointments(mockAppointments);
      } catch (error) {
        console.error('Ошибка загрузки записей:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Фильтрация записей
  const filteredAppointments = appointments.filter(appointment => {
    // Фильтр по вкладке
    if (activeTab === 'upcoming' && appointment.status !== 'upcoming') return false;
    if (activeTab === 'past' && appointment.status === 'upcoming') return false;
    
    // Фильтр по статусу
    if (filterStatus !== 'all' && appointment.status !== filterStatus) return false;
    
    // Фильтр по дате
    if (filterDate && appointment.date !== filterDate) return false;
    
    // Поиск
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        appointment.petName.toLowerCase().includes(term) ||
        appointment.vetName.toLowerCase().includes(term) ||
        appointment.reason.toLowerCase().includes(term) ||
        appointment.specialization.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Статистика
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.status === 'upcoming').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  // Форматирование даты
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Форматирование времени
  const formatTime = (timeStr) => {
    return timeStr;
  };

  // Получение статуса
  const getStatusInfo = (status) => {
    switch (status) {
      case 'upcoming':
        return { label: 'Предстоящий', color: '#4299E1', icon: '⏰' };
      case 'completed':
        return { label: 'Завершен', color: '#48BB78', icon: '✅' };
      case 'cancelled':
        return { label: 'Отменен', color: '#F56565', icon: '❌' };
      default:
        return { label: 'Неизвестно', color: '#A0AEC0', icon: '❓' };
    }
  };

  // Открытие деталей записи
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // Закрытие деталей
  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  // Отмена записи
  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    setCancelReason('');
  };

  // Подтверждение отмены
  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      alert('Пожалуйста, укажите причину отмены');
      return;
    }

    setAppointments(prev => prev.map(app => 
      app.id === selectedAppointment.id 
        ? { 
            ...app, 
            status: 'cancelled',
            cancelReason: cancelReason,
            cancelledAt: new Date().toISOString()
          }
        : app
    ));

    setShowCancelModal(false);
    setCancelReason('');
    setSelectedAppointment(null);
    alert('Запись успешно отменена');
  };

  // Создание новой записи
  const handleNewAppointment = () => {
    navigate('/booking');
  };

  // Экспорт записей
  const handleExport = () => {
    alert('Экспорт записей в разработке');
  };

  // Удаление записи
  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    }
  };

  // Рендер карточки записи
  const renderAppointmentCard = (appointment) => {
    const statusInfo = getStatusInfo(appointment.status);
    const isUpcoming = appointment.status === 'upcoming';
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';

    return (
      <div key={appointment.id} className="appointment-card">
        <div className="appointment-header">
          <div className="appointment-date">
            <div className="date-day">{new Date(appointment.date).getDate()}</div>
            <div className="date-month">
              {new Date(appointment.date).toLocaleDateString('ru-RU', { month: 'short' })}
            </div>
          </div>
          
          <div className="appointment-info">
            <div className="info-main">
              <h3 className="pet-name">
                {appointment.petName} ({appointment.petType})
              </h3>
              <p className="vet-name">{appointment.vetName}</p>
            </div>
            
            <div className="info-details">
              <span className="specialization">{appointment.specialization}</span>
              <span className="time">{appointment.time}</span>
              <span className="duration">{appointment.duration} мин</span>
            </div>
          </div>
          
          <div className="appointment-status" style={{ color: statusInfo.color }}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-label">{statusInfo.label}</span>
          </div>
        </div>
        
        <div className="appointment-body">
          <div className="appointment-reason">
            <strong>Причина:</strong> {appointment.reason}
          </div>
          
          {appointment.symptoms.length > 0 && (
            <div className="appointment-symptoms">
              <strong>Симптомы:</strong> {appointment.symptoms.join(', ')}
            </div>
          )}
          
          {appointment.notes && (
            <div className="appointment-notes">
              <strong>Примечания:</strong> {appointment.notes}
            </div>
          )}
          
          {isCompleted && appointment.diagnosis && (
            <div className="appointment-diagnosis">
              <strong>Диагноз:</strong> {appointment.diagnosis}
            </div>
          )}
          
          {isCompleted && appointment.treatment && (
            <div className="appointment-treatment">
              <strong>Лечение:</strong> {appointment.treatment}
            </div>
          )}
          
          {isCancelled && appointment.cancelReason && (
            <div className="appointment-cancel-reason">
              <strong>Причина отмены:</strong> {appointment.cancelReason}
            </div>
          )}
        </div>
        
        <div className="appointment-footer">
          <div className="appointment-price">
            Стоимость: <strong>{appointment.price} ₽</strong>
          </div>
          
          <div className="appointment-actions">
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => handleViewDetails(appointment)}
            >
              Подробнее
            </button>
            
            {isUpcoming && (
              <>
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => handleCancelClick(appointment)}
                >
                  Отменить
                </button>
                
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate(`/booking?edit=${appointment.id}`)}
                >
                  Перенести
                </button>
              </>
            )}
            
            {isCancelled && (
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteAppointment(appointment.id)}
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
           
          <div >
            <h1>📋 Мои записи</h1>
            <p>Управление визитами в ветеринарную клинику</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={handleExport}
            >
              Экспорт
            </button>
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

        {/* Фильтры и поиск */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по питомцу, врачу или причине..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filters">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все статусы</option>
              <option value="upcoming">Предстоящие</option>
              <option value="completed">Завершенные</option>
              <option value="cancelled">Отмененные</option>
            </select>
            
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-date"
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

        {/* Список записей */}
        <div className="appointments-container">
          {renderAppointmentsList()}
        </div>

        {/* Модальное окно деталей */}
        {selectedAppointment && (
          <div className="modal-overlay" onClick={handleCloseDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Детали записи</h2>
                <button className="modal-close" onClick={handleCloseDetails}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Основная информация</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Питомец:</span>
                      <span className="detail-value">
                        {selectedAppointment.petName} ({selectedAppointment.petType})
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Врач:</span>
                      <span className="detail-value">{selectedAppointment.vetName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Специализация:</span>
                      <span className="detail-value">{selectedAppointment.specialization}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Дата и время:</span>
                      <span className="detail-value">
                        {formatDate(selectedAppointment.date)} в {formatTime(selectedAppointment.time)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Статус:</span>
                      <span className="detail-value" style={{ color: getStatusInfo(selectedAppointment.status).color }}>
                        {getStatusInfo(selectedAppointment.status).label}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Длительность:</span>
                      <span className="detail-value">{selectedAppointment.duration} минут</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Стоимость:</span>
                      <span className="detail-value">{selectedAppointment.price} ₽</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Медицинская информация</h3>
                  <div className="detail-grid">
                    <div className="detail-item full-width">
                      <span className="detail-label">Причина обращения:</span>
                      <span className="detail-value">{selectedAppointment.reason}</span>
                    </div>
                    {selectedAppointment.symptoms.length > 0 && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Симптомы:</span>
                        <span className="detail-value">{selectedAppointment.symptoms.join(', ')}</span>
                      </div>
                    )}
                    {selectedAppointment.diagnosis && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Диагноз:</span>
                        <span className="detail-value">{selectedAppointment.diagnosis}</span>
                      </div>
                    )}
                    {selectedAppointment.treatment && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Лечение:</span>
                        <span className="detail-value">{selectedAppointment.treatment}</span>
                      </div>
                    )}
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
                    {selectedAppointment.cancelReason && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Причина отмены:</span>
                        <span className="detail-value">{selectedAppointment.cancelReason}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Создана:</span>
                      <span className="detail-value">
                        {new Date(selectedAppointment.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={handleCloseDetails}>
                  Закрыть
                </button>
                {selectedAppointment.status === 'upcoming' && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => {
                      handleCloseDetails();
                      handleCancelClick(selectedAppointment);
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
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <p>
                  Вы собираетесь отменить запись для <strong>{selectedAppointment.petName}</strong> на{' '}
                  {formatDate(selectedAppointment.date)} в {formatTime(selectedAppointment.time)}
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
                
                <div className="cancel-notice">
                  <p>⚠️ Отмена менее чем за 24 часа до приема может облагаться штрафом.</p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
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