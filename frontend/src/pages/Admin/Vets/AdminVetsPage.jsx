import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminVetsPage.css';

const API_URL = 'http://localhost:5000/api';

const AdminVetsPage = () => {
  const navigate = useNavigate();
  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [vetToDelete, setVetToDelete] = useState(null);
  
  // Форма для добавления/редактирования с расписанием по дням
  const [vetForm, setVetForm] = useState({
    name: '',
    specialization: 'Терапевт',
    bio: '',
    experience: '',
    education: '',
    // Общие рабочие часы (по умолчанию)
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    // Детальное расписание по дням
    schedule: {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorking: false, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
      sunday: { isWorking: false, startTime: '10:00', endTime: '14:00' }
    },
    slotDuration: 30, // Длительность приема в минутах
    isActive: true
  });

  // Дни недели для отображения
  const daysOfWeek = [
    { id: 'monday', label: 'Понедельник', short: 'Пн' },
    { id: 'tuesday', label: 'Вторник', short: 'Вт' },
    { id: 'wednesday', label: 'Среда', short: 'Ср' },
    { id: 'thursday', label: 'Четверг', short: 'Чт' },
    { id: 'friday', label: 'Пятница', short: 'Пт' },
    { id: 'saturday', label: 'Суббота', short: 'Сб' },
    { id: 'sunday', label: 'Воскресенье', short: 'Вс' }
  ];

  // Получение токена
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Загрузка ветеринаров
  useEffect(() => {
    loadVets();
  }, []);

  const loadVets = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = getToken();
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      const response = await fetch(`${API_URL}/vets/admin/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка ${response.status}`);
      }

      const data = await response.json();
      setVets(data);

    } catch (error) {
      console.error('Ошибка загрузки ветеринаров:', error);
      setError('Не удалось загрузить список ветеринаров');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики формы
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setVetForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVetForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Обработчик изменений расписания
  const handleScheduleChange = (dayId, field, value) => {
    setVetForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayId]: {
          ...prev.schedule[dayId],
          [field]: value
        }
      }
    }));
  };

  // Копировать рабочие часы на все рабочие дни
  const copyHoursToAllWorkingDays = () => {
    const updatedSchedule = { ...vetForm.schedule };
    
    // Находим первый рабочий день с непустым временем
    const workingDay = Object.keys(updatedSchedule).find(day => 
      updatedSchedule[day].isWorking && 
      updatedSchedule[day].startTime && 
      updatedSchedule[day].endTime
    );

    if (workingDay) {
      const template = updatedSchedule[workingDay];
      
      // Копируем на все рабочие дни
      Object.keys(updatedSchedule).forEach(day => {
        if (updatedSchedule[day].isWorking) {
          updatedSchedule[day] = { ...template };
        }
      });

      setVetForm(prev => ({
        ...prev,
        schedule: updatedSchedule
      }));
      
      alert('Рабочие часы скопированы на все рабочие дни');
    }
  };

  // Применить стандартное расписание (пн-пт 9-18, сб 10-16, вс выходной)
  const applyStandardSchedule = () => {
    const standardSchedule = {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorking: false, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
      sunday: { isWorking: false, startTime: '10:00', endTime: '14:00' }
    };

    if (window.confirm('Применить стандартное расписание (пн-пт 9-18, сб 10-16, вс выходной)?')) {
      setVetForm(prev => ({
        ...prev,
        schedule: standardSchedule
      }));
    }
  };

  // Добавление ветеринара
  const handleAddVet = async () => {
    if (!vetForm.name.trim()) {
      alert('Введите ФИО ветеринара');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/vets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vetForm)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при добавлении ветеринара');
      }

      // Обновляем список
      loadVets();
      setShowAddModal(false);
      resetForm();
      alert('Ветеринар успешно добавлен!');

    } catch (error) {
      console.error('Ошибка добавления ветеринара:', error);
      alert(error.message || 'Произошла ошибка при добавлении ветеринара');
    }
  };

  // Редактирование ветеринара
  const handleEditClick = (vet) => {
    setSelectedVet(vet);
    
    // Если у ветеринара нет расписания в БД, используем стандартное
    const schedule = vet.schedule || {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorking: false, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
      sunday: { isWorking: false, startTime: '10:00', endTime: '14:00' }
    };

    setVetForm({
      name: vet.name,
      specialization: vet.specialization,
      bio: vet.bio || '',
      experience: vet.experience?.toString() || '',
      education: vet.education || '',
      workingHours: vet.workingHours || { start: '09:00', end: '18:00' },
      schedule: schedule,
      slotDuration: vet.slotDuration || 30,
      isActive: vet.isActive !== false // по умолчанию true
    });
    
    setShowEditModal(true);
  };

  const handleUpdateVet = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/vets/${selectedVet._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vetForm)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при обновлении ветеринара');
      }

      loadVets();
      setShowEditModal(false);
      setSelectedVet(null);
      resetForm();
      alert('Данные ветеринара обновлены!');

    } catch (error) {
      console.error('Ошибка обновления ветеринара:', error);
      alert(error.message || 'Произошла ошибка при обновлении данных');
    }
  };

  // Удаление ветеринара
  const handleDeleteClick = (vet) => {
    setVetToDelete(vet);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/vets/${vetToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при удалении ветеринара');
      }

      // Удаляем из списка
      setVets(prev => prev.filter(vet => vet._id !== vetToDelete._id));
      setShowDeleteModal(false);
      setVetToDelete(null);
      alert('Ветеринар удален');

    } catch (error) {
      console.error('Ошибка удаления ветеринара:', error);
      alert(error.message || 'Произошла ошибка при удалении');
    }
  };

  // Сброс формы
  const resetForm = () => {
    setVetForm({
      name: '',
      specialization: 'Терапевт',
      bio: '',
      experience: '',
      education: '',
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      schedule: {
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { isWorking: false, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
        sunday: { isWorking: false, startTime: '10:00', endTime: '14:00' }
      },
      slotDuration: 30,
      isActive: true
    });
  };

  // Рендер строки расписания для дня
  const renderScheduleRow = (day) => {
    const daySchedule = vetForm.schedule[day.id];
    
    return (
      <div key={day.id} className="schedule-row">
        <div className="schedule-day-label">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={daySchedule.isWorking}
              onChange={(e) => handleScheduleChange(day.id, 'isWorking', e.target.checked)}
            />
            <span>{day.label}</span>
          </label>
        </div>
        
        {daySchedule.isWorking ? (
          <>
            <div className="time-inputs">
              <input
                type="time"
                value={daySchedule.startTime}
                onChange={(e) => handleScheduleChange(day.id, 'startTime', e.target.value)}
                className="time-input"
              />
              <span className="time-separator">-</span>
              <input
                type="time"
                value={daySchedule.endTime}
                onChange={(e) => handleScheduleChange(day.id, 'endTime', e.target.value)}
                className="time-input"
              />
            </div>
            
            <div className="break-inputs">
              <span>Перерыв:</span>
              <input
                type="time"
                value={daySchedule.breakStart || ''}
                onChange={(e) => handleScheduleChange(day.id, 'breakStart', e.target.value)}
                className="time-input small"
                placeholder="13:00"
              />
              <span>-</span>
              <input
                type="time"
                value={daySchedule.breakEnd || ''}
                onChange={(e) => handleScheduleChange(day.id, 'breakEnd', e.target.value)}
                className="time-input small"
                placeholder="14:00"
              />
            </div>
          </>
        ) : (
          <div className="day-off">
            <span className="day-off-label">Выходной</span>
          </div>
        )}
      </div>
    );
  };

  // Рендер краткого расписания для таблицы
  const renderSchedulePreview = (vet) => {
    if (!vet.schedule) {
      return <span className="schedule-preview">9:00-18:00</span>;
    }

    const workingDays = daysOfWeek.filter(day => 
      vet.schedule[day.id]?.isWorking
    );

    if (workingDays.length === 0) {
      return <span className="schedule-preview inactive">Нет рабочих дней</span>;
    }

    const firstDay = workingDays[0];
    const schedule = vet.schedule[firstDay.id];
    
    return (
      <div className="schedule-preview">
        <span className="working-days">
          {workingDays.slice(0, 2).map(d => d.short).join(', ')}
          {workingDays.length > 2 && '...'}
        </span>
        <span className="working-hours">
          {schedule.startTime}-{schedule.endTime}
        </span>
      </div>
    );
  };

  // Рендер списка ветеринаров
  const renderVetsList = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка ветеринаров...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadVets}>
            Повторить попытку
          </button>
        </div>
      );
    }

    if (vets.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <h3>Ветеринаров нет</h3>
          <p>Добавьте первого ветеринара в систему</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Добавить ветеринара
          </button>
        </div>
      );
    }

    return (
      <div className="vets-table-container">
        <table className="vets-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Специализация</th>
              <th>Стаж</th>
              <th>Расписание</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {vets.map(vet => (
              <tr key={vet._id}>
                <td>
                  <div className="vet-info-cell">
                    <span className="vet-photo">👨‍⚕️</span>
                    <div>
                      <div className="vet-name">{vet.name}</div>
                      {vet.bio && (
                        <div className="vet-bio-preview">{vet.bio.substring(0, 50)}...</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{vet.specialization}</td>
                <td>{vet.experience || 0} лет</td>
                <td>
                  {renderSchedulePreview(vet)}
                </td>
                <td>
                  <span className={`status-badge ${vet.isActive ? 'active' : 'inactive'}`}>
                    {vet.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEditClick(vet)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(vet)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Рендер формы расписания
  const renderScheduleForm = () => (
    <div className="schedule-form-section">
      <div className="section-header">
        <h3>Расписание работы</h3>
        <div className="schedule-actions">
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={copyHoursToAllWorkingDays}
          >
            Копировать часы на все рабочие дни
          </button>
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={applyStandardSchedule}
          >
            Стандартное расписание
          </button>
        </div>
      </div>
      
      <div className="schedule-grid">
        {daysOfWeek.map(day => renderScheduleRow(day))}
      </div>
      
      <div className="form-group">
        <label htmlFor="slotDuration">Длительность приема (минут)</label>
        <select
          id="slotDuration"
          value={vetForm.slotDuration}
          onChange={(e) => handleFormChange('slotDuration', parseInt(e.target.value))}
          className="form-select"
        >
          <option value="15">15 минут</option>
          <option value="30">30 минут</option>
          <option value="45">45 минут</option>
          <option value="60">60 минут</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="admin-vets-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>👨‍⚕️ Управление ветеринарами</h1>
            <p>Добавление, редактирование и удаление ветеринаров</p>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            + Добавить ветеринара
          </button>
        </div>

        {renderVetsList()}
      </div>

      {/* Модальное окно добавления */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
              <h2>Добавить ветеринара</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form className="vet-form">
                <div className="form-group">
                  <label htmlFor="name">ФИО ветеринара *</label>
                  <input
                    id="name"
                    type="text"
                    value={vetForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Например: Иванов Алексей Петрович"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="specialization">Специализация *</label>
                    <select
                      id="specialization"
                      value={vetForm.specialization}
                      onChange={(e) => handleFormChange('specialization', e.target.value)}
                      className="form-select"
                    >
                      <option value="Терапевт">Терапевт</option>
                      <option value="Хирург">Хирург</option>
                      <option value="Стоматолог">Стоматолог</option>
                      <option value="Офтальмолог">Офтальмолог</option>
                      <option value="Дерматолог">Дерматолог</option>
                      <option value="Ортопед">Ортопед</option>
                      <option value="Кардиолог">Кардиолог</option>
                      <option value="Невролог">Невролог</option>
                      <option value="Онколог">Онколог</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="experience">Стаж работы (лет)</label>
                    <input
                      id="experience"
                      type="number"
                      value={vetForm.experience}
                      onChange={(e) => handleFormChange('experience', e.target.value)}
                      placeholder="5"
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="education">Образование</label>
                  <input
                    id="education"
                    type="text"
                    value={vetForm.education}
                    onChange={(e) => handleFormChange('education', e.target.value)}
                    placeholder="Например: Казанская ГАВМ"
                    className="form-input"
                  />
                </div>
                
                {/* Расписание */}
                {renderScheduleForm()}
                
                <div className="form-group">
                  <label htmlFor="bio">О ветеринаре</label>
                  <textarea
                    id="bio"
                    value={vetForm.bio}
                    onChange={(e) => handleFormChange('bio', e.target.value)}
                    placeholder="Краткая информация о ветеринаре, специализация, достижения..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={vetForm.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                    />
                    <span>Активный ветеринар (принимает пациентов)</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddVet}
                disabled={!vetForm.name.trim()}
              >
                Добавить ветеринара
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {showEditModal && selectedVet && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
              <h2>Редактировать ветеринара</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVet(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form className="vet-form">
                <div className="form-group">
                  <label htmlFor="name">ФИО ветеринара *</label>
                  <input
                    id="name"
                    type="text"
                    value={vetForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="specialization">Специализация *</label>
                    <select
                      id="specialization"
                      value={vetForm.specialization}
                      onChange={(e) => handleFormChange('specialization', e.target.value)}
                      className="form-select"
                    >
                      <option value="Терапевт">Терапевт</option>
                      <option value="Хирург">Хирург</option>
                      <option value="Стоматолог">Стоматолог</option>
                      <option value="Офтальмолог">Офтальмолог</option>
                      <option value="Дерматолог">Дерматолог</option>
                      <option value="Ортопед">Ортопед</option>
                      <option value="Кардиолог">Кардиолог</option>
                      <option value="Невролог">Невролог</option>
                      <option value="Онколог">Онколог</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="experience">Стаж работы (лет)</label>
                    <input
                      id="experience"
                      type="number"
                      value={vetForm.experience}
                      onChange={(e) => handleFormChange('experience', e.target.value)}
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="education">Образование</label>
                  <input
                    id="education"
                    type="text"
                    value={vetForm.education}
                    onChange={(e) => handleFormChange('education', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                {/* Расписание */}
                {renderScheduleForm()}
                
                <div className="form-group">
                  <label htmlFor="bio">О ветеринаре</label>
                  <textarea
                    id="bio"
                    value={vetForm.bio}
                    onChange={(e) => handleFormChange('bio', e.target.value)}
                    className="form-textarea"
                    rows="4"
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={vetForm.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                    />
                    <span>Активный ветеринар (принимает пациентов)</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVet(null);
                  resetForm();
                }}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateVet}
                disabled={!vetForm.name.trim()}
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && vetToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Удалить ветеринара</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setVetToDelete(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">⚠️</span>
                <h3>Вы уверены, что хотите удалить {vetToDelete.name}?</h3>
                <p>
                  Это действие нельзя отменить. Все будущие записи к этому ветеринару будут отменены.
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setVetToDelete(null);
                }}
              >
                Отмена
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Удалить ветеринара
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVetsPage;