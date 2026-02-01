import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api/axiosConfig';
import API from '../../../../api/api';
import './AllAppointment.css';

const AppointmentsAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [editForm, setEditForm] = useState({
    service: '',
    date: '',
    time: '',
    notes: '',
    status: '',
    price: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterVet, setFilterVet] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0
  });
  const [vets, setVets] = useState([]);
  const [users, setUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/appointments');
    } else {
      loadAllAppointments();
      loadVets();
      loadUsers();
    }
  }, [navigate]);

  const loadAllAppointments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.get(API.APPOINTMENTS.USER || '/api/appointments/user');
      
      let appointmentsData = [];
      
      if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.appointments)) {
          appointmentsData = response.data.appointments;
        } else if (Array.isArray(response.data.data)) {
          appointmentsData = response.data.data;
        } else {
          appointmentsData = response.data.appointments || [];
        }
      }
      
      if (!Array.isArray(appointmentsData)) {
        appointmentsData = [];
      }
      
      setAppointments(appointmentsData);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      setStats({
        total: appointmentsData.length,
        pending: appointmentsData.filter(a => a.status === 'pending').length,
        confirmed: appointmentsData.filter(a => a.status === 'confirmed').length,
        completed: appointmentsData.filter(a => a.status === 'completed').length,
        cancelled: appointmentsData.filter(a => a.status === 'cancelled').length,
        today: appointmentsData.filter(a => {
          if (!a.date) return false;
          try {
            const appointmentDate = new Date(a.date);
            return appointmentDate.toDateString() === today.toDateString();
          } catch (e) {
            return false;
          }
        }).length
      });

    } catch (error) {
      console.error('Ошибка загрузки записей:', error);
      setError('Не удалось загрузить записи. Проверьте соединение с интернетом.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVets = async () => {
    try {
      const response = await api.get(API.VETS.ALL);
      
      let vetsData = [];
      
      if (Array.isArray(response.data)) {
        vetsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.vets)) {
          vetsData = response.data.vets;
        } else if (Array.isArray(response.data.data)) {
          vetsData = response.data.data;
        } else {
          vetsData = Object.values(response.data);
        }
      }
      
      if (!Array.isArray(vetsData)) {
        vetsData = [];
      }
      
      setVets(vetsData);
    } catch (error) {
      console.error('Ошибка загрузки ветеринаров:', error);
      setVets([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get(API.USERS.ALL || '/api/users');
      
      let usersData = [];
      
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.users)) {
          usersData = response.data.users;
        } else if (Array.isArray(response.data.data)) {
          usersData = response.data.data;
        } else {
          usersData = Object.values(response.data);
        }
      }
      
      if (!Array.isArray(usersData)) {
        usersData = [];
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setUsers([]);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab !== 'all' && appointment.status !== activeTab) return false;
    if (filterStatus !== 'all' && appointment.status !== filterStatus) return false;
    
    if (filterDate) {
      try {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        if (appointmentDate !== filterDate) return false;
      } catch (e) {
        return false;
      }
    }
    
    if (filterVet !== 'all' && appointment.vet?._id !== filterVet) return false;
    if (filterUser !== 'all' && appointment.createdBy?._id !== filterUser) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const animalName = appointment.animal?.name?.toLowerCase() || '';
      const vetName = appointment.vet?.name?.toLowerCase() || '';
      const userName = `${appointment.createdBy?.firstName || ''} ${appointment.createdBy?.lastName || ''}`.toLowerCase();
      const userEmail = appointment.createdBy?.email?.toLowerCase() || '';
      const service = appointment.service?.toLowerCase() || '';
      
      return (
        animalName.includes(term) ||
        vetName.includes(term) ||
        userName.includes(term) ||
        userEmail.includes(term) ||
        service.includes(term)
      );
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Неверная дата';
    }
  };

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

  const handleCancelAppointment = async (appointmentId, reason = '') => {
    try {
      await api.put(`${API.APPOINTMENTS.UPDATE?.(appointmentId) || `/api/appointments/${appointmentId}/cancel`}`, { 
        status: 'cancelled', 
        cancelReason: reason 
      });

      setAppointments(prev => prev.map(app => 
        app._id === appointmentId 
          ? { ...app, status: 'cancelled' }
          : app
      ));
      
      await loadAllAppointments();
      
      setSuccessMessage('Запись успешно отменена');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      return true;
    } catch (error) {
      console.error('Ошибка отмены записи:', error);
      throw error;
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      await api.delete(`${API.APPOINTMENTS.DELETE?.(appointmentId) || `/api/appointments/${appointmentId}`}`);
      
      setAppointments(prev => prev.filter(app => app._id !== appointmentId));
      
      await loadAllAppointments();
      
      setSuccessMessage('Запись успешно удалена');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
      alert('Ошибка при удалении записи');
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await handleCancelAppointment(selectedAppointment._id, cancelReason);
      
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      
    } catch (error) {
      alert('Ошибка при отмене записи');
    }
  };

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      service: appointment.service || '',
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
      time: appointment.time || '',
      notes: appointment.notes || '',
      status: appointment.status || '',
      price: appointment.price || 0
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Для обновления записи
      await api.put(`${API.APPOINTMENTS.UPDATE?.(selectedAppointment._id) || `/api/appointments/${selectedAppointment._id}`}`, editForm);

      setAppointments(prev => prev.map(app => 
        app._id === selectedAppointment._id 
          ? { ...app, ...editForm }
          : app
      ));
      
      setSuccessMessage('Запись успешно обновлена');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowEditModal(false);
      setEditForm({});
      setSelectedAppointment(null);
      
    } catch (error) {
      console.error('Ошибка обновления записи:', error);
      alert('Ошибка при обновлении записи');
    }
  };

  const renderAppointmentCard = (appointment) => {
    const statusInfo = getStatusInfo(appointment.status);
    const isUpcoming = appointment.status === 'pending' || appointment.status === 'confirmed';

    const animalName = appointment.animal?.name || 'Неизвестный питомец';
    const animalType = appointment.animal?.type || '';
    const vetName = appointment.vet?.name || 'Неизвестный врач';
    const userName = `${appointment.createdBy?.firstName || ''} ${appointment.createdBy?.lastName || ''}`;
    
    let day = '';
    let month = '';
    
    try {
      const appointmentDate = new Date(appointment.date);
      day = appointmentDate.getDate();
      month = appointmentDate.toLocaleDateString('ru-RU', { month: 'short' });
    } catch (e) {
      day = '?';
      month = '???';
    }

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
              <p className="user-info">
                👤 {userName}
              </p>
            </div>
            
            <div className="info-details">
              <span className="specialization">{appointment.vet?.specialization}</span>
              <span className="time">{appointment.time}</span>
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
              <strong>Стоимость:</strong> {appointment.price || 0} ₽
            </span>
          </div>
        </div>
        
        <div className="appointment-footer">
          <div className="appointment-actions">
            <button 
              className="btn btn-sm btn-info"
              onClick={() => setSelectedAppointment(appointment)}
            >
              Подробнее
            </button>
            
            {isUpcoming && (
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowCancelModal(true);
                }}
              >
                Отменить
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentsList = () => {
    const appointmentsArray = Array.isArray(appointments) ? appointments : [];
    
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка записей...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadAllAppointments}>
            Повторить попытку
          </button>
        </div>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Записей не найдено</h3>
          <p>Измените параметры фильтрации или создайте новую запись</p>
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
        {successMessage && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <span>{successMessage}</span>
            <button className="close-btn" onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}

        <div className="page-header">
          <div>
            <h1>👑 Управление записями (Администратор)</h1>
            <p>Просмотр и управление всеми записями клиники</p>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Всего записей</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#ED8936' }}>⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Ожидание</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#4299E1' }}>✓</div>
            <div className="stat-content">
              <div className="stat-value">{stats.confirmed}</div>
              <div className="stat-label">Подтверждены</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#48BB78' }}>✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Завершены</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#F56565' }}>❌</div>
            <div className="stat-content">
              <div className="stat-value">{stats.cancelled}</div>
              <div className="stat-label">Отменены</div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по питомцу, врачу, клиенту..."
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
              <option value="pending">Ожидание</option>
              <option value="confirmed">Подтвержденные</option>
              <option value="completed">Завершенные</option>
              <option value="cancelled">Отмененные</option>
            </select>
            
            <select 
              value={filterVet}
              onChange={(e) => setFilterVet(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все ветеринары</option>
              {Array.isArray(vets) && vets.map(vet => (
                <option key={vet._id} value={vet._id}>
                  {vet.name} {vet.specialization ? `(${vet.specialization})` : ''}
                </option>
              ))}
            </select>
            
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все клиенты</option>
              {Array.isArray(users) && users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
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
                setFilterVet('all');
                setFilterUser('all');
              }}
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Все записи ({stats.total})
          </button>
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Ожидание ({stats.pending})
          </button>
          <button 
            className={`tab ${activeTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirmed')}
          >
            Подтверждены ({stats.confirmed})
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Завершены ({stats.completed})
          </button>
        </div>

        <div className="appointments-container">
          {renderAppointmentsList()}
        </div>

        {/* Модальное окно деталей записи */}
        {selectedAppointment && !showCancelModal && !showEditModal && (
          <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Детали записи</h2>
                <button className="modal-close" onClick={() => setSelectedAppointment(null)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Информация о записи</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Статус:</span>
                      <span className="detail-value" style={{ color: getStatusInfo(selectedAppointment.status).color }}>
                        {getStatusInfo(selectedAppointment.status).label}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Услуга:</span>
                      <span className="detail-value">{selectedAppointment.service}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Дата и время:</span>
                      <span className="detail-value">
                        {formatDate(selectedAppointment.date)} в {selectedAppointment.time}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Стоимость:</span>
                      <span className="detail-value">{selectedAppointment.price || 0} ₽</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Информация о питомце</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Имя:</span>
                      <span className="detail-value">{selectedAppointment.animal?.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Тип:</span>
                      <span className="detail-value">{selectedAppointment.animal?.type}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Порода:</span>
                      <span className="detail-value">{selectedAppointment.animal?.breed || 'Не указана'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Информация о ветеринаре</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Ветеринар:</span>
                      <span className="detail-value">{selectedAppointment.vet?.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Специализация:</span>
                      <span className="detail-value">{selectedAppointment.vet?.specialization}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Информация о клиенте</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Клиент:</span>
                      <span className="detail-value">
                        {selectedAppointment.createdBy?.firstName} {selectedAppointment.createdBy?.lastName}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedAppointment.createdBy?.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Телефон:</span>
                      <span className="detail-value">{selectedAppointment.createdBy?.phone || 'Не указан'}</span>
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
                    {selectedAppointment.createdAt && (
                      <div className="detail-item">
                        <span className="detail-label">Создана:</span>
                        <span className="detail-value">
                          {new Date(selectedAppointment.createdAt).toLocaleString('ru-RU')}
                        </span>
                      </div>
                    )}
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
                  Вы собираетесь отменить запись для <strong>{selectedAppointment.animal?.name || 'питомца'}</strong>
                </p>
                <p>
                  Клиент: <strong>{selectedAppointment.createdBy?.firstName} {selectedAppointment.createdBy?.lastName}</strong>
                </p>
                <p>
                  На: <strong>{formatDate(selectedAppointment.date)} в {selectedAppointment.time}</strong>
                </p>
                
                <div className="form-group">
                  <label htmlFor="cancelReason">Причина отмены (опционально)</label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Укажите причину отмены..."
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

export default AppointmentsAdmin;