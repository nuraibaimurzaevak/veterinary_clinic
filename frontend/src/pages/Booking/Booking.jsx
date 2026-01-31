import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../config/api';
import './Booking.css';

const Booking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    animalId: '',
    service: '',
    symptoms: [],
    notes: '',
    specialization: '',
    vetId: '',
    date: '',
    time: '',
    emergency: false,
    price: 0
  });

  const [userAnimals, setUserAnimals] = useState([]);
  const [reasons, setReasons] = useState([
    { id: 'checkup', label: 'Плановый осмотр', specialization: 'Терапевт' },
    { id: 'vaccination', label: 'Вакцинация', specialization: 'Терапевт' },
    { id: 'skin', label: 'Кожные проблемы', specialization: 'Дерматолог' },
    { id: 'wound', label: 'Рана/травма', specialization: 'Хирург' },
    { id: 'fracture', label: 'Перелом', specialization: 'Хирург' },
    { id: 'teeth', label: 'Проблемы с зубами', specialization: 'Стоматолог' },
    { id: 'eyes', label: 'Заболевания глаз', specialization: 'Офтальмолог' },
    { id: 'ears', label: 'Проблемы с ушами', specialization: 'Терапевт' },
    { id: 'digestion', label: 'Пищеварение', specialization: 'Терапевт' },
    { id: 'other', label: 'Другое', specialization: 'Терапевт' },
  ]);

  const [specializations, setSpecializations] = useState([
    { id: 'Терапевт', label: 'Терапевт', icon: '🩺', color: '#8CA8D9' },
    { id: 'Хирург', label: 'Хирург', icon: '🔪', color: '#F56565' },
    { id: 'Дерматолог', label: 'Дерматолог', icon: '🔍', color: '#ED8936' },
    { id: 'Офтальмолог', label: 'Офтальмолог', icon: '👁️', color: '#4299E1' },
    { id: 'Стоматолог', label: 'Стоматолог', icon: '🦷', color: '#9F7AEA' },
  ]);

  const [vets, setVets] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busySlots, setBusySlots] = useState([]);

  const steps = [
    { number: 1, title: 'Животное', description: 'Выберите питомца' },
    { number: 2, title: 'Причина', description: 'Укажите симптомы' },
    { number: 3, title: 'Специалист', description: 'Автовыбор врача' },
    { number: 4, title: 'Врач', description: 'Выберите ветеринара' },
    { number: 5, title: 'Время', description: 'Дата и время приема' },
    { number: 6, title: 'Подтверждение', description: 'Проверка данных' },
  ];

  // Получение токена
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API запрос
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // ИСПРАВЛЕННАЯ функция парсинга расписания
  const parseVetSchedule = (vet) => {
    // Если расписание уже в правильном формате объекта
    if (vet.schedule && typeof vet.schedule === 'object' && vet.schedule !== null) {
      // Проверяем, есть ли все дни недели
      const defaultSchedule = {
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        saturday: { isWorking: false, startTime: '10:00', endTime: '16:00' },
        sunday: { isWorking: false, startTime: '10:00', endTime: '14:00' }
      };
      
      // Объединяем с дефолтными значениями
      return { ...defaultSchedule, ...vet.schedule };
    }
    
    // Если расписание в виде JSON строки
    if (vet.schedule && typeof vet.schedule === 'string') {
      try {
        const parsed = JSON.parse(vet.schedule);
        const defaultSchedule = {
          monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          saturday: { isWorking: false, startTime: '10:00', endTime: '16:00' },
          sunday: { isWorking: false, startTime: '10:00', endTime: '14:00' }
        };
        
        return { ...defaultSchedule, ...parsed };
      } catch (e) {
        console.warn('Не удалось распарсить расписание, используем по умолчанию:', e);
      }
    }
    
    // Если есть поле workingDays или подобное
    if (vet.workingDays) {
      const schedule = {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        schedule[day] = {
          isWorking: vet.workingDays.includes(day),
          startTime: '09:00',
          endTime: '18:00'
        };
      });
      return schedule;
    }
    
    // Стандартное расписание
    return {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      saturday: { isWorking: false, startTime: '10:00', endTime: '16:00' },
      sunday: { isWorking: false, startTime: '10:00', endTime: '14:00' }
    };
  };

  // ИСПРАВЛЕННАЯ генерация доступных дат
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Сбрасываем время на начало дня
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(todayStart);
      date.setDate(todayStart.getDate() + i);
      
      // Форматируем дату в YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateId = `${year}-${month}-${day}`;
      
      const dayOfWeek = date.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      const formattedDate = {
        id: dateId,
        date: new Date(dateId),
        originalDate: date,
        day: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        number: date.getDate(),
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        dayOfWeek: dayOfWeek,
        dayName: dayNames[dayOfWeek]
      };
      
      dates.push(formattedDate);
    }
    
    setAvailableDates(dates);
  };

  // Загрузка данных из БД
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Загрузка животных пользователя
        const animalsData = await apiRequest('/animals/user');
        setUserAnimals(animalsData || []);

        // Загрузка ветеринаров
        const vetsResponse = await apiRequest('/vets');
        
        // Правильно обрабатываем расписание каждого ветеринара
        const processedVets = (vetsResponse || []).map(vet => {
          return {
            ...vet,
            schedule: parseVetSchedule(vet),
            isActive: vet.isActive !== false
          };
        });
        
        setVets(processedVets);

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError(`Ошибка загрузки: ${error.message}. Проверьте подключение к серверу.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Генерация дат после загрузки ветеринаров
  useEffect(() => {
    if (vets.length > 0) {
      generateAvailableDates();
    }
  }, [vets]);

  // Проверка, работает ли ветеринар в определенный день
  const isVetWorkingOnDate = (vet, dateStr) => {
    if (!vet || !vet.schedule) {
      return true;
    }
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    const daySchedule = vet.schedule[dayName];
    
    if (!daySchedule) {
      return dayName !== 'saturday' && dayName !== 'sunday';
    }
    
    return daySchedule.isWorking !== false;
  };

  // Получение рабочего расписания на день
  const getWorkingHoursForDate = (vet, dateStr) => {
    if (!vet || !vet.schedule) return {
      isWorking: true,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: null,
      breakEnd: null
    };
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    return vet.schedule[dayName] || {
      isWorking: true,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: null,
      breakEnd: null
    };
  };

  // Генерация временных слотов
  const generateTimeSlots = (vet, dateStr) => {
    const daySchedule = getWorkingHoursForDate(vet, dateStr);
    
    if (!daySchedule.isWorking) {
      return [];
    }
    
    const startTime = daySchedule.startTime || '09:00';
    const endTime = daySchedule.endTime || '18:00';
    const breakStart = daySchedule.breakStart;
    const breakEnd = daySchedule.breakEnd;
    const slotDuration = vet.slotDuration || 30;
    
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      const isBreakTime = breakStart && breakEnd && (timeSlot >= breakStart && timeSlot < breakEnd);
      
      if (!isBreakTime) {
        slots.push({
          time: timeSlot,
          isAvailable: true
        });
      }
      
      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }
    
    return slots;
  };

  // Получение занятых слотов ветеринара
  const fetchBusySlots = async (vetId, date) => {
    try {
      const response = await apiRequest(`/appointments/vet/${vetId}/availability?date=${date}`);
      if (response && response.availableSlots) {
        const busy = response.availableSlots
          .filter(slot => !slot.isAvailable)
          .map(slot => slot.time);
        setBusySlots(busy);
      }
    } catch (error) {
      console.error('Ошибка получения занятых слотов:', error);
      setBusySlots([]);
    }
  };

  // Фильтрация ветеринаров по специализации
  useEffect(() => {
    if (bookingData.specialization) {
      const filtered = vets.filter(vet => 
        vet.specialization === bookingData.specialization && vet.isActive !== false
      );
      setFilteredVets(filtered);
      
      if (filtered.length > 0 && !bookingData.vetId) {
        setBookingData(prev => ({ ...prev, vetId: filtered[0]._id }));
      }
    }
  }, [bookingData.specialization, vets]);

  // Выбор животного
  useEffect(() => {
    if (bookingData.animalId) {
      const animal = userAnimals.find(a => a._id === bookingData.animalId);
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
      service: reason?.label || '',
      specialization: reason?.specialization || ''
    }));
    
    if (currentStep === 2) goToNextStep();
  };

  const handleVetSelect = (vetId) => {
    setBookingData(prev => ({ ...prev, vetId }));
    if (currentStep === 4) goToNextStep();
  };

  const handleDateSelect = async (dateId) => {
    setBookingData(prev => ({ 
      ...prev, 
      date: dateId, 
      time: '' 
    }));
    
    setAvailableTimeSlots([]);
    setBusySlots([]);
    
    if (bookingData.vetId) {
      const vet = vets.find(v => v._id === bookingData.vetId);
      
      if (vet && isVetWorkingOnDate(vet, dateId)) {
        const slots = generateTimeSlots(vet, dateId);
        setAvailableTimeSlots(slots);
        await fetchBusySlots(bookingData.vetId, dateId);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  };

  const handleTimeSelect = (time) => {
    setBookingData(prev => ({ ...prev, time }));
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
        return !!bookingData.service;
      case 3:
        return true;
      case 4:
        return !!bookingData.vetId;
      case 5:
        return !!bookingData.date && !!bookingData.time;
      default:
        return true;
    }
  };

  // Рассчитать стоимость
  const calculatePrice = (service) => {
    const prices = {
      'Плановый осмотр': 1500,
      'Вакцинация': 1200,
      'Кожные проблемы': 2000,
      'Рана/травма': 2500,
      'Перелом': 5000,
      'Проблемы с зубами': 3000,
      'Заболевания глаз': 2200,
      'Проблемы с ушами': 1800,
      'Пищеварение': 1700,
      'Другое': 1000
    };
    return prices[service] || 1000;
  };

  // Отправка формы
  const handleSubmit = async () => {
    if (!validateStep()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        animal: bookingData.animalId,
        vet: bookingData.vetId,
        service: bookingData.service,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes,
        emergency: bookingData.emergency,
        price: calculatePrice(bookingData.service),
        status: 'confirmed'
      };

      if (bookingData.symptoms.length > 0) {
        appointmentData.notes = `Симптомы: ${bookingData.symptoms.join(', ')}. ${appointmentData.notes || ''}`;
      }

      await apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });

      alert('Запись успешно создана!');
      navigate('/appointments');
      
    } catch (error) {
      console.error('Ошибка создания записи:', error);
      alert(`Ошибка при создании записи: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Форматирование времени
  const formatTimeRange = (schedule) => {
    if (!schedule || !schedule.isWorking) return 'Выходной';
    return `${schedule.startTime || '09:00'} - ${schedule.endTime || '18:00'}`;
  };

  // Рендер шагов
  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Ошибка загрузки данных</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      );
    }

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
      
      {userAnimals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>У вас нет животных</h3>
          <p>Добавьте животное, чтобы записаться на прием</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/animals')}
          >
            Добавить животное
          </button>
        </div>
      ) : (
        <div className="animals-grid">
          {userAnimals.map(animal => (
            <div 
              key={animal._id}
              className={`animal-card ${bookingData.animalId === animal._id ? 'selected' : ''}`}
              onClick={() => handleAnimalSelect(animal._id)}
            >
              <div className="animal-avatar">
                {animal.type === 'Кот' ? '🐱' : 
                 animal.type === 'Собака' ? '🐕' : 
                 animal.type === 'Попугай' ? '🐦' : '🐾'}
              </div>
              <div className="animal-info">
                <h3>{animal.name}</h3>
                <p>{animal.type} • {animal.breed || 'Порода не указана'}</p>
                <p className="animal-age">
                  {animal.age?.years || 0} лет {animal.age?.months || 0} мес.
                </p>
              </div>
              <div className="animal-check">
                {bookingData.animalId === animal._id && '✓'}
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
      )}
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
            className={`reason-card ${bookingData.service === reason.label ? 'selected' : ''}`}
            onClick={() => handleReasonSelect(reason.id)}
          >
            <div className="reason-content">
              <h3>{reason.label}</h3>
              <p className="reason-price">~ {calculatePrice(reason.label)} ₽</p>
            </div>
          </div>
        ))}
      </div>
      
      {bookingData.service && (
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
    const selectedReason = reasons.find(r => r.label === bookingData.service);
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
              {specialization?.id === 'Хирург' && 'Хирург занимается оперативным лечением травм, переломов и проведением плановых операций.'}
              {specialization?.id === 'Офтальмолог' && 'Офтальмолог специализируется на диагностике и лечении заболеваний глаз.'}
              {specialization?.id === 'Стоматолог' && 'Ветеринарный стоматолог лечит заболевания зубов и полости рта.'}
              {specialization?.id === 'Дерматолог' && 'Дерматолог занимается кожными заболеваниями, аллергиями и проблемами с шерстью.'}
              {(!specialization || specialization.id === 'Терапевт') && 'Терапевт — врач общей практики, который проведет первичный осмотр и при необходимости направит к узкому специалисту.'}
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
      
      {filteredVets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <h3>Нет доступных ветеринаров</h3>
          <p>Выберите другую специализацию или обратитесь в регистратуру</p>
        </div>
      ) : (
        <div className="vets-grid">
          {filteredVets.map(vet => {
            const isSelected = bookingData.vetId === vet._id;
            
            return (
              <div 
                key={vet._id}
                className={`vet-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleVetSelect(vet._id)}
              >
                <div className="vet-header">
                  <div className="vet-avatar">
                    {vet.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
                  </div>
                  <div className="vet-info">
                    <h3>{vet.name}</h3>
                    <p className="vet-specialization">{vet.specialization}</p>
                    <p className="vet-bio">{vet.bio || 'Опытный специалист'}</p>
                  </div>
                  <div className="vet-rating">
                    <span className="rating-star">★</span>
                    <span className="rating-value">{vet.rating || 4.8}</span>
                  </div>
                </div>
                
                <div className="vet-details">
                  <div className="vet-detail">
                    <span className="detail-label">Стаж:</span>
                    <span className="detail-value">{vet.experience || 0} лет</span>
                  </div>
                  <div className="vet-detail">
                    <span className="detail-label">Длительность приема:</span>
                    <span className="detail-value">{vet.slotDuration || 30} минут</span>
                  </div>
                  <div className="vet-detail">
                    <span className="detail-label">Стоимость приема:</span>
                    <span className="detail-value">{vet.price || calculatePrice(bookingData.service)} ₽</span>
                  </div>
                </div>
                
                <div className="vet-schedule">
                  <h4>Рабочее расписание:</h4>
                  <div className="schedule-grid">
                    {vet.schedule && Object.entries(vet.schedule).map(([day, schedule]) => {
                      if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)) return null;
                      
                      const dayNames = {
                        monday: 'Пн',
                        tuesday: 'Вт',
                        wednesday: 'Ср',
                        thursday: 'Чт',
                        friday: 'Пт',
                        saturday: 'Сб',
                        sunday: 'Вс'
                      };
                      
                      return (
                        <div key={day} className="schedule-day">
                          <span className="day-label">{dayNames[day]}:</span>
                          <span className={`day-time ${schedule.isWorking ? 'working' : 'day-off'}`}>
                            {schedule.isWorking ? formatTimeRange(schedule) : 'Выходной'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="vet-check">
                  {isSelected && (
                    <>
                      <span className="check-icon">✓</span>
                      <span>Выбран</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Шаг 5: Выбор даты и времени
  const renderStep5 = () => {
    const selectedVet = vets.find(v => v._id === bookingData.vetId);
    
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Выберите дату и время</h2>
          <p>Доступные слоты для {selectedVet?.name || 'ветеринара'}</p>
        </div>
        
        <div className="date-time-section">
          {/* Календарь дат */}
          <div className="dates-section">
            <h3>Выберите дату</h3>
            <p className="schedule-note">
              Доступные дни для записи (рабочие дни врача)
            </p>
            <div className="dates-grid">
              {availableDates.map(date => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dateObj = new Date(date.id);
                const isPast = dateObj < today;
                const isWorking = selectedVet ? isVetWorkingOnDate(selectedVet, date.id) : true;
                const isAvailable = !isPast && isWorking;
                const isSelected = bookingData.date === date.id;
                
                return (
                  <div 
                    key={date.id}
                    className={`date-card ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : 'unavailable'}`}
                    onClick={() => isAvailable && handleDateSelect(date.id)}
                    title={
                      isPast ? 'Прошедшая дата' : 
                      !isWorking ? 'Ветеринар не работает в этот день' : 
                      'Доступно для записи'
                    }
                  >
                    <div className="date-day">{date.day}</div>
                    <div className="date-number">{date.number}</div>
                    <div className="date-month">{date.month}</div>
                    {!isAvailable && <div className="date-unavailable">✗</div>}
                    {isSelected && <div className="date-selected">✓</div>}
                  </div>
                );
              })}
            </div>
            <div className="dates-info">
              <p>Пн-Пт: рабочие дни, Сб-Вс: выходные (по умолчанию)</p>
            </div>
          </div>
          
          {/* Временные слоты */}
          {bookingData.date && (
            <div className="times-section">
              <h3>Выберите время</h3>
              {availableTimeSlots.length === 0 ? (
                <div className="empty-slots">
                  <p>❌ Нет доступных слотов на эту дату</p>
                  <p>Ветеринар не работает или все слоты заняты</p>
                </div>
              ) : (
                <>
                  <div className="times-grid">
                    {availableTimeSlots.map(slot => {
                      const isBusy = busySlots.includes(slot.time);
                      const isSelected = bookingData.time === slot.time;
                      const isAvailable = !isBusy && slot.isAvailable;
                      
                      return (
                        <div 
                          key={slot.time}
                          className={`time-card ${isSelected ? 'selected' : ''} ${isBusy ? 'busy' : 'available'}`}
                          onClick={() => isAvailable && handleTimeSelect(slot.time)}
                          title={isBusy ? 'Это время уже занято' : 'Доступно для записи'}
                        >
                          {slot.time}
                          {isBusy && <span className="busy-icon">⛔</span>}
                          {isSelected && <span className="selected-icon">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="time-legend">
                    <div className="legend-item">
                      <span className="legend-color available"></span>
                      <span>Доступно</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color busy"></span>
                      <span>Занято</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color selected"></span>
                      <span>Выбрано</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {bookingData.date && bookingData.time && (
          <div className="selected-slot">
            <h3>Выбранное время:</h3>
            <p className="slot-info">
              {new Date(bookingData.date).toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })} в {bookingData.time}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Шаг 6: Подтверждение
  const renderStep6 = () => {
    const selectedAnimal = userAnimals.find(a => a._id === bookingData.animalId);
    const selectedReason = reasons.find(r => r.label === bookingData.service);
    const selectedSpecialization = specializations.find(s => s.id === bookingData.specialization);
    const selectedVet = vets.find(v => v._id === bookingData.vetId);
    const price = calculatePrice(bookingData.service);
    
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Проверьте данные</h2>
          <p>Убедитесь, что все указано верно</p>
        </div>
        
        <div className="confirmation-cards">
          <div className="confirmation-card">
            <h3>Животное</h3>
            <div className="confirmation-content">
              <div className="confirmation-item">
                <span className="item-label">Питомец:</span>
                <span className="item-value">
                  {selectedAnimal?.name} ({selectedAnimal?.type})
                </span>
              </div>
              <div className="confirmation-item">
                <span className="item-label">Порода:</span>
                <span className="item-value">{selectedAnimal?.breed || 'Не указана'}</span>
              </div>
              <div className="confirmation-item">
                <span className="item-label">Возраст:</span>
                <span className="item-value">
                  {selectedAnimal?.age?.years || 0} лет {selectedAnimal?.age?.months || 0} мес.
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
          
          <div className="confirmation-card">
            <h3>Причина обращения</h3>
            <div className="confirmation-content">
              <div className="confirmation-item">
                <span className="item-label">Услуга:</span>
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
                <span className="item-value">{selectedVet?.name}</span>
              </div>
              <div className="confirmation-item">
                <span className="item-label">Стаж:</span>
                <span className="item-value">{selectedVet?.experience || 0} лет</span>
              </div>
              <div className="confirmation-item">
                <span className="item-label">Стоимость приема:</span>
                <span className="item-value">{selectedVet?.price || price} ₽</span>
              </div>
            </div>
            <button 
              className="btn-edit"
              onClick={() => goToStep(4)}
            >
              Изменить
            </button>
          </div>
          
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
                  })} в {bookingData.time}
                </span>
              </div>
              <div className="confirmation-item">
                <span className="item-label">Длительность:</span>
                <span className="item-value">{selectedVet?.slotDuration || 30} минут</span>
              </div>
              <div className="confirmation-item">
                <span className="item-label">Стоимость:</span>
                <span className="item-value price">{price} ₽</span>
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
        
        <div className="additional-info">
          <h3>Дополнительная информация</h3>
          <div className="form-group">
            <label>Еще что-то добавить? (необязательно)</label>
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
                defaultChecked={false}
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
                defaultChecked={true}
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
                `✅ Подтвердить запись (${calculatePrice(bookingData.service)} C)`
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
                {selectedAnimal.name}
              </span>
            </div>
            
            {bookingData.service && (
              <div className="selection-item">
                <span className="selection-label">Услуга:</span>
                <span className="selection-value">
                  {bookingData.service}
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
                  {vets.find(v => v._id === bookingData.vetId)?.name}
                </span>
              </div>
            )}
            
            {bookingData.date && bookingData.time && (
              <div className="selection-item">
                <span className="selection-label">Время:</span>
                <span className="selection-value">
                  {new Date(bookingData.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} в {bookingData.time}
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