import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import './MyAnimalsPage.css';

const MyAnimalsPage = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animalForHistory, setAnimalForHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('user');

  // Форма для добавления/редактирования животного
  const [animalForm, setAnimalForm] = useState({
    id: '',
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    ageUnit: 'years',
    weight: '',
    weightUnit: 'kg',
    gender: 'male',
    color: '',
    microchipNumber: '',
    notes: '',
    avatar: '🐶'
  });

  // Получение токена
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Получение пользователя
  const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  // Получение аватара по типу
  const getAvatarByType = (type) => {
    if (!type) return '🐾';
    
    const typeStr = typeof type === 'string' ? type.toLowerCase() : '';
    if (typeStr.includes('собака') || typeStr.includes('dog')) return '🐕';
    if (typeStr.includes('кот') || typeStr.includes('кошка') || typeStr.includes('cat')) return '🐱';
    if (typeStr.includes('птица') || typeStr.includes('bird')) return '🐦';
    if (typeStr.includes('хомяк') || typeStr.includes('hamster')) return '🐹';
    if (typeStr.includes('кролик') || typeStr.includes('rabbit')) return '🐰';
    return '🐾';
  };

  // Получение типа для отправки на сервер
  const getTypeForServer = (type) => {
    const typesMap = {
      'dog': 'Собака',
      'cat': 'Кот',
      'bird': 'Птица',
      'rabbit': 'Кролик',
      'hamster': 'Хомяк',
      'other': 'Другое'
    };
    return typesMap[type] || 'Другое';
  };

  // Получение типа из сервера для формы
  const getTypeFromServer = (type) => {
    if (!type) return 'other';
    
    const typeStr = type.toLowerCase();
    if (typeStr.includes('собака') || typeStr.includes('dog')) return 'dog';
    if (typeStr.includes('кот') || typeStr.includes('кошка') || typeStr.includes('cat')) return 'cat';
    if (typeStr.includes('птица') || typeStr.includes('bird')) return 'bird';
    if (typeStr.includes('кролик') || typeStr.includes('rabbit')) return 'rabbit';
    if (typeStr.includes('хомяк') || typeStr.includes('hamster')) return 'hamster';
    return 'other';
  };

  // Получение пола для отправки на сервер
  const getGenderForServer = (gender) => {
    return gender === 'male' ? 'Мужской' : 'Женский';
  };

  // Получение пола из сервера для формы
  const getGenderFromServer = (gender) => {
    if (!gender) return 'male';
    const genderStr = gender.toLowerCase();
    if (genderStr.includes('муж') || genderStr.includes('male')) return 'male';
    if (genderStr.includes('жен') || genderStr.includes('female')) return 'female';
    return 'male';
  };

  // Загрузка животных с сервера
  useEffect(() => {
    loadAnimals();
    const user = getUser();
    if (user) {
      setUserRole(user.role || 'user');
    }
  }, []);

  const loadAnimals = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = getToken();
      const user = getUser();
      
      if (!token || !user) {
        navigate('/login');
        return;
      }

      const response = await fetch(API.ANIMALS.USER, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Пробуем разные форматы ответа
      let animalsData = [];
      
      if (Array.isArray(result)) {
        animalsData = result;
      } else if (result?.animals && Array.isArray(result.animals)) {
        animalsData = result.animals;
      } else if (result?.data && Array.isArray(result.data)) {
        animalsData = result.data;
      }

      // Если ничего не нашли, используем тестовые данные
      if (animalsData.length === 0) {
        animalsData = [
          {
            _id: '1',
            name: 'Барсик',
            type: 'Кот',
            breed: 'Сиамский',
            age: { years: 3 },
            weight: 4.5,
            gender: 'Мужской',
            color: 'Серый',
            microchipNumber: 'CHIP12345',
            createdAt: new Date().toISOString(),
            createdBy: {
              firstName: 'Иван',
              lastName: 'Петров',
              email: 'ivan@example.com'
            }
          },
          {
            _id: '2',
            name: 'Шарик',
            type: 'Собака',
            breed: 'Лабрадор',
            age: { years: 5 },
            weight: 25,
            gender: 'Мужской',
            color: 'Черный',
            createdAt: new Date().toISOString(),
            createdBy: {
              firstName: 'Анна',
              lastName: 'Сидорова',
              email: 'anna@example.com'
            }
          }
        ];
      }

      // Преобразуем данные с сервера в нужный формат
      const formattedAnimals = animalsData.map(animal => {
        // Получаем возраст
        let age = '';
        if (animal.age) {
          if (typeof animal.age === 'object') {
            age = animal.age.years?.toString() || animal.age.months?.toString() || '';
          } else {
            age = animal.age.toString();
          }
        }
        
        return {
          id: animal._id || animal.id || Math.random().toString(),
          name: animal.name || 'Без имени',
          type: getTypeFromServer(animal.type),
          breed: animal.breed || '',
          age: age,
          ageUnit: 'years',
          weight: animal.weight?.toString() || '',
          weightUnit: 'kg',
          gender: getGenderFromServer(animal.gender),
          color: animal.color || '',
          chipNumber: animal.microchipNumber || '',
          avatar: getAvatarByType(animal.type),
          createdAt: animal.createdAt ? new Date(animal.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          ownerName: animal.createdBy ? `${animal.createdBy.firstName || ''} ${animal.createdBy.lastName || ''}`.trim() || animal.createdBy.name : 'Неизвестно',
          ownerEmail: animal.createdBy?.email || '',
          ownerType: animal.ownerType || 'user'
        };
      });

      setAnimals(formattedAnimals);

    } catch (error) {
      console.error('Ошибка загрузки животных:', error);
      setError('Не удалось загрузить животных. Проверьте консоль для деталей.');
      
      // Используем тестовые данные при ошибке
      setAnimals([
        {
          id: '1',
          name: 'Барсик',
          type: 'cat',
          breed: 'Сиамский',
          age: '3',
          ageUnit: 'years',
          weight: '4.5',
          weightUnit: 'kg',
          gender: 'male',
          color: 'Серый',
          chipNumber: 'CHIP12345',
          avatar: '🐱',
          createdAt: '2024-01-15',
          ownerName: 'Иван Петров',
          ownerEmail: 'ivan@example.com',
          ownerType: 'user'
        },
        {
          id: '2',
          name: 'Шарик',
          type: 'dog',
          breed: 'Лабрадор',
          age: '5',
          ageUnit: 'years',
          weight: '25',
          weightUnit: 'kg',
          gender: 'male',
          color: 'Черный',
          chipNumber: '',
          avatar: '🐕',
          createdAt: '2024-01-15',
          ownerName: 'Анна Сидорова',
          ownerEmail: 'anna@example.com',
          ownerType: 'user'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка истории записей для животного
  const loadAnimalHistory = async (animalId) => {
    setIsHistoryLoading(true);
    
    try {
      const token = getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Загружаем все записи пользователя
      const response = await fetch(API.APPOINTMENTS.USER, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Фильтруем записи по животному
      let allAppointments = [];
      
      if (Array.isArray(result)) {
        allAppointments = result;
      } else if (result?.appointments && Array.isArray(result.appointments)) {
        allAppointments = result.appointments;
      } else if (result?.data && Array.isArray(result.data)) {
        allAppointments = result.data;
      }

      // Фильтруем записи для конкретного животного
      const animalAppointments = allAppointments.filter(app => {
        const appointmentAnimalId = app.animal?._id || app.animal;
        return appointmentAnimalId === animalId;
      });

      // Форматируем записи для отображения
      const formattedAppointments = animalAppointments.map(appointment => {
        // Находим ветеринара
        let vetName = 'Не назначен';
        if (typeof appointment.vet === 'object' && appointment.vet !== null) {
          vetName = appointment.vet.name || appointment.vet.username || appointment.vet.email || 'Не назначен';
        } else if (appointment.vet) {
          vetName = appointment.vet;
        }
        
        // Форматируем дату
        let displayDate = appointment.date || '';
        if (displayDate && displayDate.includes('T')) {
          displayDate = displayDate.split('T')[0];
        }

        return {
          id: appointment._id || appointment.id,
          date: displayDate,
          time: appointment.time || '--:--',
          service: appointment.service || 'Не указано',
          vet: vetName,
          status: appointment.status || 'pending',
          price: appointment.price || '0',
          notes: appointment.notes || ''
        };
      });

      setAppointments(formattedAppointments);

    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
      setError('Не удалось загрузить историю записей');
      setAppointments([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Открытие модального окна истории
  const handleViewHistory = async (animal) => {
    setAnimalForHistory(animal);
    await loadAnimalHistory(animal.id);
    setShowHistoryModal(true);
  };

  // Фильтрация животных
  const filteredAnimals = animals.filter(animal => {
    if (filterType !== 'all' && animal.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        animal.name.toLowerCase().includes(term) ||
        (animal.breed && animal.breed.toLowerCase().includes(term)) ||
        (animal.color && animal.color.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Статистика
  const stats = {
    total: animals.length,
    cats: animals.filter(a => a.type === 'cat').length,
    dogs: animals.filter(a => a.type === 'dog').length,
    others: animals.filter(a => !['cat', 'dog'].includes(a.type)).length
  };

  // Получение типа животного
  const getTypeInfo = (type) => {
    switch (type) {
      case 'dog':
        return { label: 'Собака', icon: '🐕', color: '#4299E1' };
      case 'cat':
        return { label: 'Кошка', icon: '🐱', color: '#ED8936' };
      case 'bird':
        return { label: 'Птица', icon: '🐦', color: '#48BB78' };
      case 'rabbit':
        return { label: 'Кролик', icon: '🐰', color: '#9F7AEA' };
      case 'hamster':
        return { label: 'Грызун', icon: '🐹', color: '#F687B3' };
      default:
        return { label: 'Другое', icon: '🐾', color: '#A0AEC0' };
    }
  };

  // Получение пола животного
  const getGenderInfo = (gender) => {
    return gender === 'male' 
      ? { label: 'Самец', icon: '♂️' }
      : { label: 'Самка', icon: '♀️' };
  };

  // Получение текста статуса
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

  // Получение класса статуса
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

  // Обработчики формы
  const handleFormChange = (field, value) => {
    setAnimalForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'type') {
      const avatars = {
        dog: '🐶',
        cat: '🐱',
        bird: '🐦',
        rabbit: '🐰',
        hamster: '🐹',
        other: '🐾'
      };
      setAnimalForm(prev => ({ ...prev, avatar: avatars[value] || '🐾' }));
    }
  };

  // Открытие формы редактирования
  const handleEditAnimal = (animal) => {
    setSelectedAnimal(animal);
    setAnimalForm({
      id: animal.id,
      name: animal.name,
      type: animal.type,
      breed: animal.breed,
      age: animal.age,
      ageUnit: animal.ageUnit,
      weight: animal.weight,
      weightUnit: animal.weightUnit,
      gender: animal.gender,
      color: animal.color,
      microchipNumber: animal.chipNumber,
      notes: '',
      avatar: animal.avatar
    });
    setShowEditModal(true);
  };

  // Добавление животного на сервер
  const handleAddAnimal = async () => {
    if (!animalForm.name.trim()) {
      alert('Введите имя питомца');
      return;
    }

    const token = getToken();
    const user = getUser();
    
    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const animalData = {
        name: animalForm.name,
        type: getTypeForServer(animalForm.type),
        breed: animalForm.breed || '',
        age: {
          years: parseInt(animalForm.age) || 0,
          months: 0
        },
        weight: parseFloat(animalForm.weight) || 0,
        gender: getGenderForServer(animalForm.gender),
        color: animalForm.color || '',
        microchipNumber: animalForm.microchipNumber || ''
      };

      const response = await fetch(API.ANIMALS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(animalData)
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении животного');
      }

      // Обновляем список животных
      loadAnimals();
      setShowAddModal(false);
      resetForm();
      alert('Питомец успешно добавлен!');

    } catch (error) {
      console.error('Ошибка добавления животного:', error);
      alert('Произошла ошибка при добавлении питомца');
    }
  };

  // Редактирование животного на сервере
  const handleUpdateAnimal = async () => {
    if (!animalForm.name.trim()) {
      alert('Введите имя питомца');
      return;
    }

    const token = getToken();
    const user = getUser();
    
    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const animalData = {
        name: animalForm.name,
        type: getTypeForServer(animalForm.type),
        breed: animalForm.breed || '',
        age: {
          years: parseInt(animalForm.age) || 0,
          months: 0
        },
        weight: parseFloat(animalForm.weight) || 0,
        gender: getGenderForServer(animalForm.gender),
        color: animalForm.color || '',
        microchipNumber: animalForm.microchipNumber || ''
      };

      const response = await fetch(API.ANIMALS.UPDATE(animalForm.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(animalData)
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении животного');
      }

      // Обновляем список животных
      loadAnimals();
      setShowEditModal(false);
      resetForm();
      alert('Данные питомца успешно обновлены!');

    } catch (error) {
      console.error('Ошибка обновления животного:', error);
      alert('Произошла ошибка при обновлении данных питомца');
    }
  };

  // Удаление животного с сервера
  const handleDeleteClick = (animal) => {
    setAnimalToDelete(animal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = getToken();
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(API.ANIMALS.DELETE(animalToDelete.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении животного');
      }

      // Удаляем из списка
      setAnimals(prev => prev.filter(animal => animal.id !== animalToDelete.id));
      setShowDeleteModal(false);
      setAnimalToDelete(null);
      alert('Питомец удален');

    } catch (error) {
      console.error('Ошибка удаления животного:', error);
      alert('Произошла ошибка при удалении питомца');
    }
  };

  // Сброс формы
  const resetForm = () => {
    setAnimalForm({
      id: '',
      name: '',
      type: 'dog',
      breed: '',
      age: '',
      ageUnit: 'years',
      weight: '',
      weightUnit: 'kg',
      gender: 'male',
      color: '',
      microchipNumber: '',
      notes: '',
      avatar: '🐶'
    });
    setSelectedAnimal(null);
  };

  // Запись на прием
  const handleBookAppointment = (animal) => {
    navigate(`/booking?animal=${animal.id}`);
  };

  // Рендер карточки животного
  const renderAnimalCard = (animal) => {
    const typeInfo = getTypeInfo(animal.type);
    const genderInfo = getGenderInfo(animal.gender);

    return (
      <div key={animal.id} className="animal-card">
        <div className="animal-card-header">
          <div className="animal-avatar" style={{ backgroundColor: `${typeInfo.color}20` }}>
            <span className="avatar-icon">{animal.avatar}</span>
          </div>
          
          <div className="animal-main-info">
            <div className="animal-name-row">
              <h3 className="animal-name">{animal.name}</h3>
              <span className="animal-type-badge" style={{ backgroundColor: typeInfo.color }}>
                {typeInfo.icon} {typeInfo.label}
              </span>
            </div>
            
            <div className="animal-details">
              <p className="animal-breed">{animal.breed || 'Без породы'}</p>
              <div className="animal-meta">
                <span className="animal-meta-item">
                  {genderInfo.icon} {genderInfo.label}
                </span>
                <span className="animal-meta-item">
                  {animal.age || '0'} {animal.ageUnit === 'years' ? 'лет' : 'мес'}
                </span>
                <span className="animal-meta-item">
                  {animal.weight || '0'} {animal.weightUnit}
                </span>
              </div>
              {userRole === 'admin' && (
                <div className="animal-owner">
                  <small>Владелец: {animal.ownerName} ({animal.ownerEmail})</small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="animal-card-body">
          <div className="animal-info-grid">
            <div className="info-item">
              <span className="info-label">Окрас:</span>
              <span className="info-value">{animal.color || 'Не указан'}</span>
            </div>
            
            {animal.chipNumber && (
              <div className="info-item">
                <span className="info-label">Чип:</span>
                <span className="info-value chip-number">{animal.chipNumber}</span>
              </div>
            )}
            
            <div className="info-item">
              <span className="info-label">Добавлен:</span>
              <span className="info-value">
                {new Date(animal.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        <div className="animal-card-footer">
          <div className="animal-actions">
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => handleBookAppointment(animal)}
            >
              📅 Запись
            </button>
            
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => handleViewHistory(animal)}
            >
              📋 История
            </button>
            
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => handleDeleteClick(animal)}
            >
              🗑️ Удалить
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Рендер списка животных
  const renderAnimalsList = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка данных о питомцах...</p>
        </div>
      );
    }

    if (filteredAnimals.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>Питомцев не найдено</h3>
          <p>
            {searchTerm || filterType !== 'all' 
              ? 'Попробуйте изменить параметры поиска'
              : 'Добавьте своего первого питомца'
            }
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Добавить питомца
          </button>
        </div>
      );
    }

    return (
      <div className="animals-grid">
        {filteredAnimals.map(renderAnimalCard)}
      </div>
    );
  };

  // Рендер истории записей
  const renderHistoryTable = () => {
    if (isHistoryLoading) {
      return (
        <div className="loading-state">
          <div className="spinner small"></div>
          <p>Загрузка истории записей...</p>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="empty-history">
          <div className="empty-icon">📅</div>
          <h4>История записей отсутствует</h4>
          <p>Для этого питомца еще нет записей на прием</p>
        </div>
      );
    }

    return (
      <div className="history-table">
        <table style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Дата</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Время</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Услуга</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ветеринар</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Статус</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Стоимость</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.id} style={{ 
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <td style={{ 
                  padding: '16px', 
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px'
                }}>
                  {appointment.date}
                </td>
                <td style={{ padding: '16px' }}>{appointment.time}</td>
                <td style={{ padding: '16px' }}>{appointment.service}</td>
                <td style={{ padding: '16px' }}>{appointment.vet}</td>
                <td style={{ padding: '16px' }}>
                  <span 
                    className={`status-badge ${getStatusClass(appointment.status)}`}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {getStatusText(appointment.status)}
                  </span>
                </td>
                <td style={{ 
                  padding: '16px', 
                  borderTopRightRadius: '8px',
                  borderBottomRightRadius: '8px'
                }}>
                  {appointment.price} ₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animals-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>🐕 {userRole === 'admin' ? 'Все животные' : 'Мои питомцы'}</h1>
            <p>{userRole === 'admin' ? 'Управление всеми животными в системе' : 'Управление информацией о ваших животных'}</p>
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              + Добавить питомца
            </button>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">🐾</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Всего питомцев</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#ED8936' }}>🐱</div>
            <div className="stat-content">
              <div className="stat-value">{stats.cats}</div>
              <div className="stat-label">Кошки</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#4299E1' }}>🐕</div>
            <div className="stat-content">
              <div className="stat-value">{stats.dogs}</div>
              <div className="stat-label">Собаки</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#48BB78' }}>🐦</div>
            <div className="stat-content">
              <div className="stat-value">{stats.others}</div>
              <div className="stat-label">Другие</div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по имени, породе..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filters">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все типы</option>
              <option value="dog">Собаки</option>
              <option value="cat">Кошки</option>
              <option value="bird">Птицы</option>
              <option value="rabbit">Кролики</option>
              <option value="hamster">Грызуны</option>
              <option value="other">Другие</option>
            </select>
            
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="animals-container">
          {renderAnimalsList()}
        </div>

        {/* Модальное окно добавления */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Добавить питомца</h2>
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
                <form className="animal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Имя питомца *</label>
                      <input
                        id="name"
                        type="text"
                        value={animalForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Введите имя"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="type">Тип животного *</label>
                      <select
                        id="type"
                        value={animalForm.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        className="form-select"
                      >
                        <option value="dog">Собака</option>
                        <option value="cat">Кошка</option>
                        <option value="bird">Птица</option>
                        <option value="rabbit">Кролик</option>
                        <option value="hamster">Грызун</option>
                        <option value="other">Другое</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="breed">Порода</label>
                      <input
                        id="breed"
                        type="text"
                        value={animalForm.breed}
                        onChange={(e) => handleFormChange('breed', e.target.value)}
                        placeholder="Например: Сиамская"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="gender">Пол *</label>
                      <select
                        id="gender"
                        value={animalForm.gender}
                        onChange={(e) => handleFormChange('gender', e.target.value)}
                        className="form-select"
                      >
                        <option value="male">Самец</option>
                        <option value="female">Самка</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="age">Возраст (лет)</label>
                      <input
                        id="age"
                        type="number"
                        value={animalForm.age}
                        onChange={(e) => handleFormChange('age', e.target.value)}
                        placeholder="0"
                        className="form-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="weight">Вес (кг)</label>
                      <input
                        id="weight"
                        type="number"
                        value={animalForm.weight}
                        onChange={(e) => handleFormChange('weight', e.target.value)}
                        placeholder="0"
                        className="form-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="color">Окрас</label>
                      <input
                        id="color"
                        type="text"
                        value={animalForm.color}
                        onChange={(e) => handleFormChange('color', e.target.value)}
                        placeholder="Например: Рыжий с белым"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="chipNumber">Номер чипа</label>
                      <input
                        id="chipNumber"
                        type="text"
                        value={animalForm.microchipNumber}
                        onChange={(e) => handleFormChange('microchipNumber', e.target.value)}
                        placeholder="Необязательно"
                        className="form-input"
                      />
                    </div>
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
                  onClick={handleAddAnimal}
                  disabled={!animalForm.name.trim()}
                >
                  Добавить питомца
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Редактировать питомца</h2>
                <button 
                  className="modal-close" 
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <form className="animal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-name">Имя питомца *</label>
                      <input
                        id="edit-name"
                        type="text"
                        value={animalForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Введите имя"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-type">Тип животного *</label>
                      <select
                        id="edit-type"
                        value={animalForm.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        className="form-select"
                      >
                        <option value="dog">Собака</option>
                        <option value="cat">Кошка</option>
                        <option value="bird">Птица</option>
                        <option value="rabbit">Кролик</option>
                        <option value="hamster">Грызун</option>
                        <option value="other">Другое</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-breed">Порода</label>
                      <input
                        id="edit-breed"
                        type="text"
                        value={animalForm.breed}
                        onChange={(e) => handleFormChange('breed', e.target.value)}
                        placeholder="Например: Сиамская"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-gender">Пол *</label>
                      <select
                        id="edit-gender"
                        value={animalForm.gender}
                        onChange={(e) => handleFormChange('gender', e.target.value)}
                        className="form-select"
                      >
                        <option value="male">Самец</option>
                        <option value="female">Самка</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-age">Возраст (лет)</label>
                      <input
                        id="edit-age"
                        type="number"
                        value={animalForm.age}
                        onChange={(e) => handleFormChange('age', e.target.value)}
                        placeholder="0"
                        className="form-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-weight">Вес (кг)</label>
                      <input
                        id="edit-weight"
                        type="number"
                        value={animalForm.weight}
                        onChange={(e) => handleFormChange('weight', e.target.value)}
                        placeholder="0"
                        className="form-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-color">Окрас</label>
                      <input
                        id="edit-color"
                        type="text"
                        value={animalForm.color}
                        onChange={(e) => handleFormChange('color', e.target.value)}
                        placeholder="Например: Рыжий с белым"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-chipNumber">Номер чипа</label>
                      <input
                        id="edit-chipNumber"
                        type="text"
                        value={animalForm.microchipNumber}
                        onChange={(e) => handleFormChange('microchipNumber', e.target.value)}
                        placeholder="Необязательно"
                        className="form-input"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Отмена
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleUpdateAnimal}
                  disabled={!animalForm.name.trim()}
                >
                  Сохранить изменения
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно истории */}
        {showHistoryModal && animalForHistory && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
              <div className="modal-header">
                <h2>История записей: {animalForHistory.name}</h2>
                <button 
                  className="modal-close" 
                  onClick={() => {
                    setShowHistoryModal(false);
                    setAnimalForHistory(null);
                    setAppointments([]);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="history-header" style={{ 
                  marginBottom: '20px', 
                  paddingBottom: '20px', 
                  borderBottom: '1px solid #e5e7eb' 
                }}>
                  <div className="animal-info-summary">
                    <div className="animal-avatar-small">
                      <span>{animalForHistory.avatar}</span>
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <h4 style={{ margin: '0 0 4px 0' }}>{animalForHistory.name}</h4>
                      <p style={{ margin: 0, color: '#6b7280' }}>
                        {animalForHistory.breed || 'Без породы'} • {animalForHistory.age || '0'} лет
                      </p>
                    </div>
                  </div>
                  <div className="history-stats">
                    <span className="stat-item" style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '6px 12px', 
                      borderRadius: '6px',
                      fontSize: '14px' 
                    }}>
                      Всего записей: {appointments.length}
                    </span>
                  </div>
                </div>
                
                {renderHistoryTable()}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleBookAppointment(animalForHistory)}
                >
                  📅 Новая запись
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowHistoryModal(false);
                    setAnimalForHistory(null);
                    setAppointments([]);
                  }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно удаления */}
        {showDeleteModal && animalToDelete && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h2>Удалить питомца</h2>
                <button 
                  className="modal-close" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAnimalToDelete(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="delete-warning">
                  <span className="warning-icon">⚠️</span>
                  <h3>Вы уверены, что хотите удалить {animalToDelete.name}?</h3>
                  <p>
                    Это действие нельзя отменить. Будут удалены все данные о питомце.
                  </p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAnimalToDelete(null);
                  }}
                >
                  Отмена
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Удалить питомца
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAnimalsPage;