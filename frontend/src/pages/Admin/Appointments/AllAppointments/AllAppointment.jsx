import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllAppointment.css'; // Используем те же стили

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AppointmentsAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
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

  // API запрос с использованием fetch
  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const user = getCurrentUser();
    
    if (!user || !token) {
      navigate('/login');
      throw new Error('Требуется авторизация');
    }

    // Проверка прав администратора
    if (user.role !== 'admin') {
      navigate('/appointments');
      throw new Error('Требуются права администратора');
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
      console.log(`Отправка запроса на: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
      
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

  // Загрузка всех записей
  const loadAllAppointments = async (page = 1) => {
    setIsLoading(true);
    try {
      // Загружаем все записи (без фильтра по пользователю)
      const data = await apiRequest('/appointments/user');
      
      console.log('Получены все записи:', data);
      
      if (data && Array.isArray(data)) {
        setAppointments(data);
        
        // Рассчитываем статистику
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        setStats({
          total: data.length,
          pending: data.filter(a => a.status === 'pending').length,
          confirmed: data.filter(a => a.status === 'confirmed').length,
          completed: data.filter(a => a.status === 'completed').length,
          cancelled: data.filter(a => a.status === 'cancelled').length,
          today: data.filter(a => {
            const appointmentDate = new Date(a.date);
            return appointmentDate.toDateString() === today.toDateString();
          }).length
        });
      } else {
        console.error('Неверный формат ответа:', data);
        setAppointments([]);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки записей:', error.message);
      // Используем моковые данные для тестирования
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка списка ветеринаров
  const loadVets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vets`);
      const data = await response.json();
      setVets(data);
    } catch (error) {
      console.error('Ошибка загрузки ветеринаров:', error);
    }
  };

  // Загрузка списка пользователей
  const loadUsers = async () => {
    try {
      const data = await apiRequest('/users');
      setUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
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
        createdBy: {
          _id: '1',
          firstName: 'Иван',
          lastName: 'Иванов',
          email: 'ivan@example.com',
          phone: '+79991234567'
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
        createdBy: {
          _id: '2',
          firstName: 'Мария',
          lastName: 'Петрова',
          email: 'maria@example.com',
          phone: '+79991234568'
        },
        service: 'Швы после операции',
        date: '2024-02-20T00:00:00.000Z',
        time: '14:00',
        status: 'pending',
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
        createdBy: {
          _id: '1',
          firstName: 'Иван',
          lastName: 'Иванов',
          email: 'ivan@example.com',
          phone: '+79991234567'
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
        createdBy: {
          _id: '3',
          firstName: 'Алексей',
          lastName: 'Смирнов',
          email: 'alex@example.com',
          phone: '+79991234569'
        },
        service: 'Чистка зубов',
        date: '2024-02-05T00:00:00.000Z',
        time: '09:00',
        status: 'cancelled',
        notes: 'Отменено по инициативе клиента',
        price: 4500,
        createdAt: '2024-01-30T11:20:00.000Z'
      },
      {
        _id: '5',
        animal: {
          _id: '5',
          name: 'Шарик',
          type: 'Собака',
          breed: 'Лабрадор'
        },
        vet: {
          _id: '1',
          name: 'Петрова Анна Сергеевна',
          specialization: 'Терапевт'
        },
        createdBy: {
          _id: '2',
          firstName: 'Мария',
          lastName: 'Петрова',
          email: 'maria@example.com',
          phone: '+79991234568'
        },
        service: 'Вакцинация',
        date: '2024-02-25T00:00:00.000Z',
        time: '15:30',
        status: 'confirmed',
        notes: 'Перед вакцинацией не кормить 4 часа',
        price: 1500,
        createdAt: '2024-02-18T13:10:00.000Z'
      }
    ];
    
    const mockVets = [
      { _id: '1', name: 'Петрова Анна Сергеевна', specialization: 'Терапевт' },
      { _id: '2', name: 'Сидоров Дмитрий Алексеевич', specialization: 'Хирург' },
      { _id: '3', name: 'Кузнецова Елена Владимировна', specialization: 'Офтальмолог' },
      { _id: '4', name: 'Иванова Ольга Михайловна', specialization: 'Стоматолог' }
    ];
    
    const mockUsers = [
      { _id: '1', firstName: 'Иван', lastName: 'Иванов', email: 'ivan@example.com' },
      { _id: '2', firstName: 'Мария', lastName: 'Петрова', email: 'maria@example.com' },
      { _id: '3', firstName: 'Алексей', lastName: 'Смирнов', email: 'alex@example.com' }
    ];
    
    setAppointments(mockAppointments);
    setVets(mockVets);
    setUsers(mockUsers);
    
    // Рассчитываем статистику для моковых данных
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    setStats({
      total: mockAppointments.length,
      pending: mockAppointments.filter(a => a.status === 'pending').length,
      confirmed: mockAppointments.filter(a => a.status === 'confirmed').length,
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
    } else if (user.role !== 'admin') {
      console.log('Перенаправление на обычную страницу записей...');
      navigate('/appointments');
    } else {
      console.log('Администратор найден, загрузка данных...');
      loadAllAppointments();
      loadVets();
      loadUsers();
    }
  }, []);

  // Фильтрация записей
  const filteredAppointments = appointments.filter(appointment => {
    // Фильтр по вкладке
    if (activeTab !== 'all' && appointment.status !== activeTab) return false;
    
    // Фильтр по статусу
    if (filterStatus !== 'all' && appointment.status !== filterStatus) return false;
    
    // Фильтр по дате
    if (filterDate) {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      if (appointmentDate !== filterDate) return false;
    }
    
    // Фильтр по ветеринару
    if (filterVet !== 'all' && appointment.vet?._id !== filterVet) return false;
    
    // Фильтр по пользователю
    if (filterUser !== 'all' && appointment.createdBy?._id !== filterUser) return false;
    
    // Поиск
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

  // Форматирование времени
  const formatDateTime = (dateString, timeString) => {
    try {
      const date = new Date(dateString);
      return `${formatDate(dateString)} в ${timeString}`;
    } catch (error) {
      return 'Неверная дата/время';
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

  // Отмена записи администратором
  const handleCancelAppointment = async (appointmentId, reason = '') => {
    try {
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
      loadAllAppointments();
      
      return true;
    } catch (error) {
      console.error('Ошибка отмены записи:', error);
      throw error;
    }
  };

  // Обновление записи
  const handleUpdateAppointment = async (appointmentId, updates) => {
    try {
      await apiRequest(`/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      // Обновляем локальное состояние
      setAppointments(prev => prev.map(app => 
        app._id === appointmentId 
          ? { ...app, ...updates }
          : app
      ));
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления записи:', error);
      throw error;
    }
  };

  // Удаление записи
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      await apiRequest(`/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      
      // Обновляем локальное состояние
      setAppointments(prev => prev.filter(app => app._id !== appointmentId));
      
      // Обновляем статистику
      loadAllAppointments();
      
      alert('Запись успешно удалена');
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
      alert('Ошибка при удалении записи');
    }
  };

  // Подтверждение отмены
  const handleConfirmCancel = async () => {
    try {
      await handleCancelAppointment(selectedAppointment._id, cancelReason);
      
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      
      alert('Запись успешно отменена');
    } catch (error) {
      alert('Ошибка при отмене записи');
    }
  };

  // Открытие формы редактирования
  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      service: appointment.service || '',
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time || '',
      notes: appointment.notes || '',
      status: appointment.status || '',
      price: appointment.price || 0
    });
    setShowEditModal(true);
  };

  // Сохранение изменений
  const handleSaveEdit = async () => {
    try {
      await handleUpdateAppointment(selectedAppointment._id, editForm);
      
      setShowEditModal(false);
      setEditForm({});
      setSelectedAppointment(null);
      
      alert('Запись успешно обновлена');
    } catch (error) {
      alert('Ошибка при обновлении записи');
    }
  };

  // Экспорт записей
  const handleExportAppointments = () => {
    const data = filteredAppointments.map(app => ({
      'ID записи': app._id,
      'Питомец': app.animal?.name || '',
      'Тип': app.animal?.type || '',
      'Врач': app.vet?.name || '',
      'Специализация': app.vet?.specialization || '',
      'Клиент': `${app.createdBy?.firstName || ''} ${app.createdBy?.lastName || ''}`,
      'Email': app.createdBy?.email || '',
      'Телефон': app.createdBy?.phone || '',
      'Услуга': app.service || '',
      'Дата': formatDate(app.date),
      'Время': app.time,
      'Статус': getStatusInfo(app.status).label,
      'Стоимость': app.price || 0,
      'Примечания': app.notes || '',
      'Создано': new Date(app.createdAt).toLocaleDateString('ru-RU')
    }));

    // Создаем CSV
    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    // Создаем и скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `записи_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Рендер карточки записи
  const renderAppointmentCard = (appointment) => {
    const statusInfo = getStatusInfo(appointment.status);
    const isUpcoming = appointment.status === 'pending' || appointment.status === 'confirmed';

    // Безопасное получение данных
    const animalName = appointment.animal?.name || 'Неизвестный питомец';
    const animalType = appointment.animal?.type || '';
    const vetName = appointment.vet?.name || 'Неизвестный врач';
    const userName = `${appointment.createdBy?.firstName || ''} ${appointment.createdBy?.lastName || ''}`;
    const userEmail = appointment.createdBy?.email || '';
    
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
              <p className="user-info">
                👤 {userName} ({userEmail})
              </p>
            </div>
            
            <div className="info-details">
              <span className="specialization">{appointment.vet?.specialization}</span>
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
            <span className="meta-item">
              <strong>Создано:</strong> {new Date(appointment.createdAt).toLocaleDateString('ru-RU')}
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
            
            <button 
              className="btn btn-sm btn-info"
              onClick={() => handleEditClick(appointment)}
            >
              Редактировать
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
            
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => handleDeleteAppointment(appointment._id)}
            >
              Удалить
            </button>
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

  // Кнопка возврата в обычный интерфейс
  const handleBackToUserView = () => {
    navigate('/appointments');
  };

  return (
    <div className="appointments-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <div>
            <h1>👑 Управление записями (Администратор)</h1>
            <p>Просмотр и управление всеми записями клиники</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={handleBackToUserView}
            >
              ← Обычный вид
            </button>
            <button 
              className="btn btn-success"
              onClick={handleExportAppointments}
            >
              📥 Экспорт CSV
            </button>
          </div>
        </div>

        {/* Статистика */}
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

        {/* Фильтры и поиск */}
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
              {vets.map(vet => (
                <option key={vet._id} value={vet._id}>{vet.name}</option>
              ))}
            </select>
            
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все клиенты</option>
              {users.map(user => (
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

        {/* Вкладки */}
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

        {/* Список записей */}
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
                      <span className="detail-label">ID записи:</span>
                      <span className="detail-value">{selectedAppointment._id}</span>
                    </div>
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
                        {formatDateTime(selectedAppointment.date, selectedAppointment.time)}
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
                    <div className="detail-item">
                      <span className="detail-label">Создана:</span>
                      <span className="detail-value">
                        {new Date(selectedAppointment.createdAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    {selectedAppointment.updatedAt && (
                      <div className="detail-item">
                        <span className="detail-label">Обновлена:</span>
                        <span className="detail-value">
                          {new Date(selectedAppointment.updatedAt).toLocaleString('ru-RU')}
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
                <button 
                  className="btn btn-info"
                  onClick={() => {
                    setSelectedAppointment(null);
                    setTimeout(() => handleEditClick(selectedAppointment), 100);
                  }}
                >
                  Редактировать
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
                  На: <strong>{formatDateTime(selectedAppointment.date, selectedAppointment.time)}</strong>
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

        {/* Модальное окно редактирования */}
        {showEditModal && selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2>Редактирование записи</h2>
                <button 
                  className="modal-close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({});
                    setSelectedAppointment(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Услуга *</label>
                  <input
                    type="text"
                    value={editForm.service}
                    onChange={(e) => setEditForm({...editForm, service: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Дата *</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Время *</label>
                    <input
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Статус *</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="">Выберите статус</option>
                      <option value="pending">Ожидание</option>
                      <option value="confirmed">Подтвержден</option>
                      <option value="completed">Завершен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Стоимость (₽)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Примечания</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({});
                    setSelectedAppointment(null);
                  }}
                >
                  Отмена
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={!editForm.service || !editForm.date || !editForm.time || !editForm.status}
                >
                  Сохранить изменения
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