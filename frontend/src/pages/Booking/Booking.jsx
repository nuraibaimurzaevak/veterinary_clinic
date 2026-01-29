import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    // Шаг 1: Выбор животного
    animalId: '',
    
    // Шаг 2: Причина обращения
    reason: '',
    symptoms: [],
    customReason: '',
    
    // Шаг 3: Автоматический выбор специалиста
    specialization: '',
    
    // Шаг 4: Выбор ветеринара
    vetId: '',
    
    // Шаг 5: Дата и время
    date: '',
    timeSlot: '',
    
    // Шаг 6: Дополнительная информация
    notes: '',
    emergency: false
  });

  // Моковые данные
  const [userAnimals, setUserAnimals] = useState([
    { id: '1', name: 'Барсик', type: 'Кот', breed: 'Британская', age: '4 года', avatar: '🐱' },
    { id: '2', name: 'Рекс', type: 'Собака', breed: 'Немецкая овчарка', age: '3 года', avatar: '🐕' },
    { id: '3', name: 'Кеша', type: 'Попугай', breed: 'Волнистый', age: '1 год', avatar: '🐦' },
  ]);

  const [reasons, setReasons] = useState([
    { id: 'checkup', label: 'Плановый осмотр', specialization: 'therapist' },
    { id: 'vaccination', label: 'Вакцинация', specialization: 'therapist' },
    { id: 'skin', label: 'Кожные проблемы (зуд, сыпь)', specialization: 'dermatologist' },
    { id: 'wound', label: 'Рана/травма', specialization: 'surgeon' },
    { id: 'fracture', label: 'Перелом', specialization: 'surgeon' },
    { id: 'teeth', label: 'Проблемы с зубами', specialization: 'dentist' },
    { id: 'eyes', label: 'Заболевания глаз', specialization: 'ophthalmologist' },
    { id: 'ears', label: 'Проблемы с ушами', specialization: 'therapist' },
    { id: 'digestion', label: 'Пищеварение (рвота, понос)', specialization: 'therapist' },
    { id: 'other', label: 'Другое', specialization: 'therapist' },
  ]);

  const [specializations, setSpecializations] = useState([
    { id: 'therapist', label: 'Терапевт', icon: '🩺', color: '#8CA8D9' },
    { id: 'surgeon', label: 'Хирург', icon: '🔪', color: '#F56565' },
    { id: 'dermatologist', label: 'Дерматолог', icon: '🔍', color: '#ED8936' },
    { id: 'ophthalmologist', label: 'Офтальмолог', icon: '👁️', color: '#4299E1' },
    { id: 'dentist', label: 'Стоматолог', icon: '🦷', color: '#9F7AEA' },
    { id: 'cardiologist', label: 'Кардиолог', icon: '❤️', color: '#F687B3' },
  ]);

  const [vets, setVets] = useState([
    { 
      id: '1', 
      name: 'Петрова Анна Сергеевна', 
      specialization: ['therapist', 'dermatologist'],
      experience: 8,
      rating: 4.8,
      description: 'Специалист широкого профиля',
      availableSlots: ['09:00', '10:30', '14:00', '15:30'],
      avatar: '👩‍⚕️'
    },
    { 
      id: '2', 
      name: 'Сидоров Дмитрий Алексеевич', 
      specialization: ['surgeon'],
      experience: 12,
      rating: 4.9,
      description: 'Хирург высшей категории',
      availableSlots: ['10:00', '11:30', '16:00', '17:30'],
      avatar: '👨‍⚕️'
    },
    { 
      id: '3', 
      name: 'Кузнецова Елена Владимировна', 
      specialization: ['ophthalmologist'],
      experience: 6,
      rating: 4.7,
      description: 'Специалист по заболеваниям глаз',
      availableSlots: ['09:30', '11:00', '14:30', '16:00'],
      avatar: '👩‍⚕️'
    },
  ]);

  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Шаги записи
  const steps = [
    { number: 1, title: 'Животное', description: 'Выберите питомца' },
    { number: 2, title: 'Причина', description: 'Укажите симптомы' },
    { number: 3, title: 'Специалист', description: 'Автовыбор врача' },
    { number: 4, title: 'Врач', description: 'Выберите ветеринара' },
    { number: 5, title: 'Время', description: 'Дата и время приема' },
    { number: 6, title: 'Подтверждение', description: 'Проверка данных' },
  ];

  // Генерация доступных дат (7 дней вперед)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const formattedDate = {
        id: date.toISOString().split('T')[0],
        date: date,
        day: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        number: date.getDate(),
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        available: i !== 2 && i !== 5 // Пропускаем некоторые дни как пример
      };
      
      dates.push(formattedDate);
    }
    
    setAvailableDates(dates);
  }, []);

  // Генерация временных слотов
  useEffect(() => {
    const slots = [
      '09:00', '09:30', '10:00', '10:30', 
      '11:00', '11:30', '12:00', '12:30',
      '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];
    setAvailableTimeSlots(slots);
  }, []);

  // Фильтрация ветеринаров по специализации
  useEffect(() => {
    if (bookingData.specialization) {
      const filtered = vets.filter(vet => 
        vet.specialization.includes(bookingData.specialization)
      );
      setFilteredVets(filtered);
      
      // Автовыбор первого ветеринара
      if (filtered.length > 0 && !bookingData.vetId) {
        setBookingData(prev => ({ ...prev, vetId: filtered[0].id }));
      }
    }
  }, [bookingData.specialization, vets]);

  // Выбор животного
  useEffect(() => {
    if (bookingData.animalId) {
      const animal = userAnimals.find(a => a.id === bookingData.animalId);
      setSelectedAnimal(animal);
    }
  }, [bookingData.animalId, userAnimals]);

  // Обработчики изменений
  const handleAnimalSelect = (animalId) => {
    setBookingData(prev => ({ ...prev, animalId }));
    if (currentStep === 1) goToNextStep();
  };

  const handleReasonSelect = (reasonId) => {
    const reason = reasons.find(r => r.id === reasonId);
    setBookingData(prev => ({
      ...prev,
      reason: reasonId,
      specialization: reason?.specialization || ''
    }));
    
    if (currentStep === 2) goToNextStep();
  };

  const handleVetSelect = (vetId) => {
    setBookingData(prev => ({ ...prev, vetId }));
    if (currentStep === 4) goToNextStep();
  };

  const handleDateSelect = (dateId) => {
    setBookingData(prev => ({ ...prev, date: dateId }));
  };

  const handleTimeSelect = (timeSlot) => {
    setBookingData(prev => ({ ...prev, timeSlot }));
    if (currentStep === 5) goToNextStep();
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSymptomToggle = (symptom) => {
    setBookingData(prev => {
      const newSymptoms = prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms: newSymptoms };
    });
  };

  // Навигация по шагам
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (stepNumber) => {
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Валидация шага
  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return !!bookingData.animalId;
      case 2:
        return !!bookingData.reason;
      case 3:
        return !!bookingData.specialization;
      case 4:
        return !!bookingData.vetId;
      case 5:
        return !!bookingData.date && !!bookingData.timeSlot;
      default:
        return true;
    }
  };

  // Отправка формы
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Имитация запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Данные записи:', bookingData);
      alert('Запись успешно создана! С вами свяжутся для подтверждения.');
      navigate('/appointments');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Рендер шагов
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  // Шаг 1: Выбор животного
  const renderStep1 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Выберите животное</h2>
        <p>Для кого вы хотите записаться на прием?</p>
      </div>
      
      <div className="animals-grid">
        {userAnimals.map(animal => (
          <div 
            key={animal.id}
            className={`animal-card ${bookingData.animalId === animal.id ? 'selected' : ''}`}
            onClick={() => handleAnimalSelect(animal.id)}
          >
            <div className="animal-avatar">{animal.avatar}</div>
            <div className="animal-info">
              <h3>{animal.name}</h3>
              <p>{animal.type} • {animal.breed}</p>
              <p className="animal-age">{animal.age}</p>
            </div>
            <div className="animal-check">
              {bookingData.animalId === animal.id && '✓'}
            </div>
          </div>
        ))}
        
        <div 
          className="animal-card add-animal"
          onClick={() => navigate('/animals')}
        >
          <div className="animal-avatar">+</div>
          <div className="animal-info">
            <h3>Добавить животное</h3>
            <p>Создать новую карточку питомца</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Шаг 2: Причина обращения
  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Причина обращения</h2>
        <p>Что беспокоит вашего питомца?</p>
      </div>
      
      <div className="reasons-grid">
        {reasons.map(reason => (
          <div 
            key={reason.id}
            className={`reason-card ${bookingData.reason === reason.id ? 'selected' : ''}`}
            onClick={() => handleReasonSelect(reason.id)}
          >
            <div className="reason-content">
              <h3>{reason.label}</h3>
            </div>
          </div>
        ))}
      </div>
      
      {/* Дополнительные симптомы */}
      {bookingData.reason && (
        <div className="symptoms-section">
          <h3>Дополнительные симптомы</h3>
          <p>Отметьте все, что наблюдается у питомца</p>
          
          <div className="symptoms-grid">
            {['Температура', 'Отказ от еды', 'Вялость', 'Апатия', 'Боль при движении', 'Изменение поведения'].map(symptom => (
              <div 
                key={symptom}
                className={`symptom-chip ${bookingData.symptoms.includes(symptom) ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle(symptom)}
              >
                {symptom}
                {bookingData.symptoms.includes(symptom) && ' ✓'}
              </div>
            ))}
          </div>
          
          <div className="form-group">
            <label>Дополнительные комментарии</label>
            <textarea 
              className="form-textarea"
              placeholder="Опишите состояние питомца подробнее..."
              value={bookingData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={bookingData.emergency}
                onChange={(e) => handleInputChange('emergency', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Срочный случай (требуется немедленная помощь)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );

  // Шаг 3: Автовыбор специалиста
  const renderStep3 = () => {
    const selectedReason = reasons.find(r => r.id === bookingData.reason);
    const specialization = specializations.find(s => s.id === bookingData.specialization);
    
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Рекомендуемый специалист</h2>
          <p>Система подобрала подходящего врача на основе симптомов</p>
        </div>
        
        <div className="specialist-card">
          <div className="specialist-header">
            <div className="specialist-icon" style={{ backgroundColor: specialization?.color || '#8CA8D9' }}>
              {specialization?.icon || '🩺'}
            </div>
            <div className="specialist-info">
              <h3>{specialization?.label || 'Терапевт'}</h3>
              <p>Специализация рекомендована для: {selectedReason?.label || 'общего осмотра'}</p>
            </div>
          </div>
          
          <div className="specialist-description">
            <p>
              {specialization?.id === 'surgeon' && 'Хирург занимается оперативным лечением травм, переломов и проведением плановых операций.'}
              {specialization?.id === 'ophthalmologist' && 'Офтальмолог специализируется на диагностике и лечении заболеваний глаз.'}
              {specialization?.id === 'dentist' && 'Ветеринарный стоматолог лечит заболевания зубов и полости рта.'}
              {specialization?.id === 'dermatologist' && 'Дерматолог занимается кожными заболеваниями, аллергиями и проблемами с шерстью.'}
              {(!specialization || specialization.id === 'therapist') && 'Терапевт — врач общей практики, который проведет первичный осмотр и при необходимости направит к узкому специалисту.'}
            </p>
          </div>
        </div>
        
        <div className="step-note">
          <p>✅ Если вы согласны с рекомендацией, переходите к выбору конкретного врача.</p>
          <p>❌ Если нужен другой специалист, вы можете изменить выбор на следующем шаге.</p>
        </div>
      </div>
    );
  };

  // Шаг 4: Выбор ветеринара
  const renderStep4 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Выберите ветеринара</h2>
        <p>Доступные специалисты {specializations.find(s => s.id === bookingData.specialization)?.label?.toLowerCase()}</p>
      </div>
      
      <div className="vets-grid">
        {filteredVets.map(vet => (
          <div 
            key={vet.id}
            className={`vet-card ${bookingData.vetId === vet.id ? 'selected' : ''}`}
            onClick={() => handleVetSelect(vet.id)}
          >
            <div className="vet-header">
              <div className="vet-avatar">{vet.avatar}</div>
              <div className="vet-info">
                <h3>{vet.name}</h3>
                <p>{vet.description}</p>
              </div>
            </div>
            
            <div className="vet-details">
              <div className="vet-detail">
                <span className="detail-label">Стаж:</span>
                <span className="detail-value">{vet.experience} лет</span>
              </div>
              <div className="vet-detail">
                <span className="detail-label">Рейтинг:</span>
                <span className="detail-value">{vet.rating} ★</span>
              </div>
              <div className="vet-detail">
                <span className="detail-label">Специализация:</span>
                <span className="detail-value">
                  {vet.specialization.map(s => specializations.find(sp => sp.id === s)?.label).join(', ')}
                </span>
              </div>
            </div>
            
            <div className="vet-availability">
              <p>Примерное время приема:</p>
              <div className="time-slots">
                {vet.availableSlots.map(slot => (
                  <span key={slot} className="time-slot">{slot}</span>
                ))}
              </div>
            </div>
            
            <div className="vet-check">
              {bookingData.vetId === vet.id && '✓ Выбран'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Шаг 5: Выбор даты и времени
  const renderStep5 = () => {
    const selectedVet = vets.find(v => v.id === bookingData.vetId);
    
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Выберите дату и время</h2>
          <p>Доступные слоты для {selectedVet?.name}</p>
        </div>
        
        <div className="date-time-section">
          {/* Календарь дат */}
          <div className="dates-section">
            <h3>Выберите дату</h3>
            <div className="dates-grid">
              {availableDates.map(date => (
                <div 
                  key={date.id}
                  className={`date-card ${bookingData.date === date.id ? 'selected' : ''} ${!date.available ? 'unavailable' : ''}`}
                  onClick={() => date.available && handleDateSelect(date.id)}
                >
                  <div className="date-day">{date.day}</div>
                  <div className="date-number">{date.number}</div>
                  <div className="date-month">{date.month}</div>
                  {!date.available && <div className="date-unavailable">Нет слотов</div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Временные слоты */}
          {bookingData.date && (
            <div className="times-section">
              <h3>Выберите время</h3>
              <div className="times-grid">
                {availableTimeSlots.map(slot => (
                  <div 
                    key={slot}
                    className={`time-card ${bookingData.timeSlot === slot ? 'selected' : ''}`}
                    onClick={() => handleTimeSelect(slot)}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {bookingData.date && bookingData.timeSlot && (
          <div className="selected-slot">
            <h3>Выбранное время:</h3>
            <p className="slot-info">
              {new Date(bookingData.date).toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })} в {bookingData.timeSlot}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Шаг 6: Подтверждение
  const renderStep6 = () => {
    const selectedAnimal = userAnimals.find(a => a.id === bookingData.animalId);
    const selectedReason = reasons.find(r => r.id === bookingData.reason);
    const selectedSpecialization = specializations.find(s => s.id === bookingData.specialization);
    const selectedVet = vets.find(v => v.id === bookingData.vetId);
    
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Проверьте данные</h2>
          <p>Убедитесь, что все указано верно</p>
        </div>
        
        <div className="confirmation-cards">
          {/* Животное */}
          <div className="confirmation-card">
            <h3>Животное</h3>
            <div className="confirmation-content">
              <div className="confirmation-item">
                <span className="item-label">Питомец:</span>
                <span className="item-value">
                  {selectedAnimal?.avatar} {selectedAnimal?.name} ({selectedAnimal?.type})
                </span>
              </div>
            </div>
            <button 
              className="btn-edit"
              onClick={() => goToStep(1)}
            >
              Изменить
            </button>
          </div>
          
          {/* Причина */}
          <div className="confirmation-card">
            <h3>Причина обращения</h3>
            <div className="confirmation-content">
              <div className="confirmation-item">
                <span className="item-label">Причина:</span>
                <span className="item-value">{selectedReason?.label}</span>
              </div>
              {bookingData.symptoms.length > 0 && (
                <div className="confirmation-item">
                  <span className="item-label">Симптомы:</span>
                  <span className="item-value">{bookingData.symptoms.join(', ')}</span>
                </div>
              )}
              {bookingData.notes && (
                <div className="confirmation-item">
                  <span className="item-label">Комментарий:</span>
                  <span className="item-value">{bookingData.notes}</span>
                </div>
              )}
              {bookingData.emergency && (
                <div className="confirmation-item">
                  <span className="item-label emergency">⚠️ Срочный случай</span>
                </div>
              )}
            </div>
            <button 
              className="btn-edit"
              onClick={() => goToStep(2)}
            >
              Изменить
            </button>
          </div>
          
          {/* Врач */}
          <div className="confirmation-card">
            <h3>Врач</h3>
            <div className="confirmation-content">
              <div className="confirmation-item">
                <span className="item-label">Специалист:</span>
                <span className="item-value">
                  {selectedSpecialization?.icon} {selectedSpecialization?.label}
                </span>
              </div>
              <div className="confirmation-item">
                <span className="item-label">Ветеринар:</span>
                <span className="item-value">
                  {selectedVet?.avatar} {selectedVet?.name}
                </span>
              </div>
            </div>
            <button 
              className="btn-edit"
              onClick={() => goToStep(4)}
            >
              Изменить
            </button>
          </div>
          
          {/* Время */}
          <div className="confirmation-card">
            <h3>Время приема</h3>
            <div className="confirmation-content">
              <div className="confirmation-item">
                <span className="item-label">Дата и время:</span>
                <span className="item-value">
                  {new Date(bookingData.date).toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })} в {bookingData.timeSlot}
                </span>
              </div>
            </div>
            <button 
              className="btn-edit"
              onClick={() => goToStep(5)}
            >
              Изменить
            </button>
          </div>
        </div>
        
        {/* Дополнительная информация */}
        <div className="additional-info">
          <h3>Дополнительная информация</h3>
          <div className="form-group">
            <label>Есть что добавить? (необязательно)</label>
            <textarea 
              className="form-textarea"
              placeholder="Укажите дополнительную информацию, которая может быть полезна врачу..."
              value={bookingData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                required
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                Я согласен с условиями записи и обработки персональных данных
              </span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                Хочу получать напоминания о визите по SMS и email
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="booking-page">
      <div className="container">
        {/* Хлебные крошки */}
        <div className="booking-breadcrumbs">
          <button 
            className="breadcrumb-back"
            onClick={() => navigate('/')}
          >
            ← На главную
          </button>
          <h1>Запись на прием</h1>
        </div>
        
        {/* Прогресс шагов */}
        <div className="booking-progress">
          {steps.map(step => (
            <div 
              key={step.number}
              className={`progress-step ${step.number === currentStep ? 'active' : ''} ${step.number < currentStep ? 'completed' : ''}`}
              onClick={() => goToStep(step.number)}
            >
              <div className="step-number">
                {step.number < currentStep ? '✓' : step.number}
              </div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Контент шага */}
        <div className="booking-content">
          {renderStepContent()}
        </div>
        
        {/* Кнопки навигации */}
        <div className="booking-navigation">
          {currentStep > 1 && (
            <button 
              className="btn btn-outline"
              onClick={goToPrevStep}
              disabled={isSubmitting}
            >
              ← Назад
            </button>
          )}
          
          {currentStep < steps.length ? (
            <button 
              className="btn btn-primary"
              onClick={goToNextStep}
              disabled={!validateStep() || isSubmitting}
            >
              Продолжить →
            </button>
          ) : (
            <button 
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Оформление...
                </>
              ) : (
                '✅ Подтвердить запись'
              )}
            </button>
          )}
        </div>
        
        {/* Информация о текущем выборе */}
        {selectedAnimal && (
          <div className="current-selection">
            <div className="selection-item">
              <span className="selection-label">Животное:</span>
              <span className="selection-value">
                {selectedAnimal.avatar} {selectedAnimal.name}
              </span>
            </div>
            
            {bookingData.reason && (
              <div className="selection-item">
                <span className="selection-label">Причина:</span>
                <span className="selection-value">
                  {reasons.find(r => r.id === bookingData.reason)?.label}
                </span>
              </div>
            )}
            
            {bookingData.specialization && (
              <div className="selection-item">
                <span className="selection-label">Специалист:</span>
                <span className="selection-value">
                  {specializations.find(s => s.id === bookingData.specialization)?.label}
                </span>
              </div>
            )}
            
            {bookingData.vetId && (
              <div className="selection-item">
                <span className="selection-label">Врач:</span>
                <span className="selection-value">
                  {vets.find(v => v.id === bookingData.vetId)?.name}
                </span>
              </div>
            )}
            
            {bookingData.date && bookingData.timeSlot && (
              <div className="selection-item">
                <span className="selection-label">Время:</span>
                <span className="selection-value">
                  {new Date(bookingData.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} в {bookingData.timeSlot}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;