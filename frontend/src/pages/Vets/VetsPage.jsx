import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../config/api';
import './VetsPage.css';

// Временные данные для демонстрации
const mockVets = [
  {
    _id: '1',
    name: 'Иванов Алексей Петрович',
    specialization: 'Терапевт',
    bio: 'Ведущий терапевт клиники. Специализируется на диагностике и лечении внутренних болезней животных.',
    experience: 12,
    education: 'Казанская государственная академия ветеринарной медицины',
    workingHours: { start: '09:00', end: '18:00' },
    isActive: true
  },
  {
    _id: '2',
    name: 'Петрова Мария Сергеевна',
    specialization: 'Хирург',
    bio: 'Опытный хирург. Проводит операции любой сложности. Специализируется на абдоминальной хирургии.',
    experience: 15,
    education: 'Московская государственная академия ветеринарной медицины',
    workingHours: { start: '08:00', end: '17:00' },
    isActive: true
  },
  {
    _id: '3',
    name: 'Сидоров Дмитрий Иванович',
    specialization: 'Стоматолог',
    bio: 'Специалист по стоматологии животных. Занимается лечением зубов, профессиональной чисткой.',
    experience: 8,
    education: 'Санкт-Петербургская государственная академия ветеринарной медицины',
    workingHours: { start: '10:00', end: '19:00' },
    isActive: true
  },
  {
    _id: '4',
    name: 'Козлова Елена Викторовна',
    specialization: 'Офтальмолог',
    bio: 'Эксперт по заболеваниям глаз у животных. Проводит диагностику и лечение глазных болезней.',
    experience: 10,
    education: 'Новосибирский государственный аграрный университет',
    workingHours: { start: '09:00', end: '16:00' },
    isActive: true
  },
  {
    _id: '5',
    name: 'Волков Сергей Александрович',
    specialization: 'Ортопед',
    bio: 'Специалист по заболеваниям опорно-двигательного аппарата. Лечение травм, переломов.',
    experience: 14,
    education: 'Российский университет дружбы народов',
    workingHours: { start: '08:00', end: '18:00' },
    isActive: true
  },
  {
    _id: '6',
    name: 'Новикова Анна Дмитриевна',
    specialization: 'Дерматолог',
    bio: 'Специалист по кожным заболеваниям и аллергиям у животных.',
    experience: 7,
    education: 'Воронежский государственный аграрный университет',
    workingHours: { start: '10:00', end: '18:00' },
    isActive: true
  }
];

const VetsPage = () => {
  const navigate = useNavigate();
  const [vets, setVets] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedVet, setSelectedVet] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadVets();
  }, []);

  useEffect(() => {
    let filtered = vets;

    if (filterSpecialization !== 'all') {
      filtered = filtered.filter(vet => vet.specialization === filterSpecialization);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vet =>
        vet.name.toLowerCase().includes(term) ||
        vet.specialization.toLowerCase().includes(term) ||
        (vet.bio && vet.bio.toLowerCase().includes(term))
      );
    }

    setFilteredVets(filtered);
  }, [vets, searchTerm, filterSpecialization]);

  const loadVets = async () => {
    setIsLoading(true);
    setError('');
    
    // Используем мок данные для демонстрации с небольшой задержкой
    setTimeout(() => {
      setVets(mockVets);
      setFilteredVets(mockVets);
      setIsLoading(false);
      setError('Демонстрационные данные');
      
      // В фоне пытаемся загрузить реальные данные из API
      loadRealVets();
    }, 800);
  };

  // Функция для загрузки реальных данных из API (в фоне)
  const loadRealVets = async () => {
    try {
      const response = await fetch(API.VETS.ALL);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Реальные данные получены от API:', data);
        
        // Проверяем структуру ответа
        if (data.success === true && data.vets && Array.isArray(data.vets)) {
          // Формат: { success: true, vets: [...] }
          console.log('Найдено ветеринаров:', data.vets.length);
        }
      } else {
        console.log('API вернул ошибку:', response.status);
      }
    } catch (error) {
      console.log('API не доступен, используем демо данные:', error.message);
    }
  };

  // Уникальные специализации
  const specializations = React.useMemo(() => {
    const specs = new Set(vets.map(vet => vet.specialization));
    return ['all', ...Array.from(specs)].filter(spec => spec);
  }, [vets]);

  const handleViewDetails = (vet) => {
    setSelectedVet(vet);
    setShowModal(true);
  };

  const handleBookAppointment = (vet) => {
    navigate(`/booking?vet=${vet._id}&vetName=${encodeURIComponent(vet.name)}`);
  };

  const renderVetCard = (vet) => {
    const getSpecializationIcon = (specialization) => {
      const icons = {
        'Терапевт': '🩺',
        'Хирург': '🔪',
        'Стоматолог': '🦷',
        'Офтальмолог': '👁️',
        'Ортопед': '🦴',
        'Дерматолог': '🔍'
      };
      return icons[specialization] || '👨‍⚕️';
    };

    return (
      <div key={vet._id} className="vet-card">
        <div className="vet-card-header">
          <div className="vet-avatar">
            <span className="avatar-icon">
              {getSpecializationIcon(vet.specialization)}
            </span>
          </div>
          
          <div className="vet-main-info">
            <h3 className="vet-name">{vet.name}</h3>
            <div className="vet-specialization-badge">
              {vet.specialization}
            </div>
            {vet.experience > 0 && (
              <div className="vet-experience">Стаж: {vet.experience} лет</div>
            )}
          </div>
        </div>

        <div className="vet-card-body">
          {vet.bio && (
            <p className="vet-bio">{vet.bio.substring(0, 120)}...</p>
          )}
          
          <div className="vet-schedule">
            <div className="schedule-item">
              <span className="schedule-icon">🕒</span>
              <span className="schedule-text">
                {vet.workingHours?.start || '09:00'} - {vet.workingHours?.end || '18:00'}
              </span>
            </div>
          </div>
        </div>

        <div className="vet-card-footer">
          <div className="vet-actions">
            <button 
              className="btn btn-outline"
              onClick={() => handleViewDetails(vet)}
            >
              👁️ Подробнее
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => handleBookAppointment(vet)}
            >
              📅 Записаться
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVetsList = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка ветеринаров...</p>
        </div>
      );
    }

    if (error && !isLoading) {
      return (
        <div className="info-state">
          <div className="info-icon">ℹ️</div>
          <h3>Демонстрационный режим</h3>
          <p>{error}</p>
          <p className="info-note">Для работы с реальными данными проверьте подключение к серверу</p>
        </div>
      );
    }

    if (filteredVets.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <h3>Ветеринаров не найдено</h3>
          <p>
            {searchTerm || filterSpecialization !== 'all' 
              ? 'Попробуйте изменить параметры поиска' 
              : 'В данный момент нет доступных ветеринаров'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="vets-grid">
        {filteredVets.map(renderVetCard)}
      </div>
    );
  };

  return (
    <div className="vets-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>👨‍⚕️ Наши ветеринары</h1>
            <p>Выберите специалиста для записи на прием</p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/booking')}
            >
              📅 Быстрая запись
            </button>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по имени или специализации..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filters">
            <select 
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="filter-select"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec === 'all' ? 'Все специализации' : spec}
                </option>
              ))}
            </select>
            
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => {
                setSearchTerm('');
                setFilterSpecialization('all');
              }}
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="stats-info">
          <div className="stats-item">
            <span className="stats-label">Всего врачей:</span>
            <span className="stats-value">{vets.length}</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">Специализаций:</span>
            <span className="stats-value">{specializations.length - 1}</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">Найдено:</span>
            <span className="stats-value">{filteredVets.length}</span>
          </div>
        </div>

        <div className="vets-container">
          {renderVetsList()}
        </div>
      </div>

      {showModal && selectedVet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Подробная информация</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="vet-details-modal">
                <div className="vet-details-header">
                  <div className="vet-details-avatar">
                    <span className="avatar-icon-large">
                      {selectedVet.specialization === 'Терапевт' ? '🩺' :
                       selectedVet.specialization === 'Хирург' ? '🔪' :
                       selectedVet.specialization === 'Стоматолог' ? '🦷' :
                       selectedVet.specialization === 'Офтальмолог' ? '👁️' :
                       selectedVet.specialization === 'Дерматолог' ? '🔍' : '👨‍⚕️'}
                    </span>
                  </div>
                  <div className="vet-details-info">
                    <h3 className="vet-details-name">{selectedVet.name}</h3>
                    <div className="vet-details-specialization">
                      {selectedVet.specialization}
                    </div>
                    {selectedVet.experience > 0 && (
                      <div className="vet-details-experience">
                        Стаж работы: {selectedVet.experience} лет
                      </div>
                    )}
                  </div>
                </div>

                {selectedVet.education && (
                  <div className="vet-details-section">
                    <h4>📝 Образование</h4>
                    <p>{selectedVet.education}</p>
                  </div>
                )}

                {selectedVet.bio && (
                  <div className="vet-details-section">
                    <h4>📖 О специалисте</h4>
                    <p>{selectedVet.bio}</p>
                  </div>
                )}

                <div className="vet-details-section">
                  <h4>🕒 График работы</h4>
                  <div className="schedule-details">
                    <div className="schedule-item-detail">
                      <span className="schedule-label">Рабочие часы:</span>
                      <span className="schedule-value">
                        {selectedVet.workingHours?.start || '09:00'} - {selectedVet.workingHours?.end || '18:00'}
                      </span>
                    </div>
                    <div className="schedule-note">
                      * Для точного расписания и записи выберите дату при оформлении визита
                    </div>
                  </div>
                </div>

                <div className="vet-details-section">
                  <h4>📍 Контакты</h4>
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <span className="contact-text">Запись через личный кабинет</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">🏥</span>
                      <span className="contact-text">Прием по предварительной записи</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                Закрыть
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowModal(false);
                  handleBookAppointment(selectedVet);
                }}
              >
                📅 Записаться к этому врачу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetsPage;