import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAnimalsPage.css';

const API_URL = 'http://localhost:5000/api';

const MyAnimalsPage = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('user');

  // Форма для добавления животного
  const [animalForm, setAnimalForm] = useState({
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

  // Загрузка животных с сервера
  useEffect(() => {
    loadAnimals();
    const user = getUser();
    if (user) {
      setUserRole(user.role);
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

      const response = await fetch(`${API_URL}/animals/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка загрузки животных');
      }

      // Преобразуем данные с сервера в нужный формат
      const formattedAnimals = result.map(animal => ({
        id: animal._id,
        name: animal.name,
        type: animal.type.toLowerCase(),
        breed: animal.breed || '',
        age: animal.age?.years?.toString() || animal.age || '',
        ageUnit: 'years',
        weight: animal.weight?.toString() || '',
        weightUnit: 'kg',
        gender: animal.gender === 'Мужской' ? 'male' : 'female',
        color: animal.color || '',
        chipNumber: animal.microchipNumber || '',
        avatar: getAvatarByType(animal.type),
        createdAt: animal.createdAt ? new Date(animal.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ownerName: animal.createdBy ? `${animal.createdBy.firstName} ${animal.createdBy.lastName}` : 'Неизвестно',
        ownerEmail: animal.createdBy?.email || '',
        ownerType: animal.ownerType || 'user'
      }));

      setAnimals(formattedAnimals);

    } catch (error) {
      console.error('Ошибка загрузки животных:', error);
      setError('Не удалось загрузить животных');
    } finally {
      setIsLoading(false);
    }
  };

  // Получение аватара по типу
  const getAvatarByType = (type) => {
    const avatars = {
      'Собака': '🐕',
      'Кот': '🐱',
      'Попугай': '🐦',
      'Хомяк': '🐹',
      'Кролик': '🐰',
      'Другое': '🐾',
      'dog': '🐕',
      'cat': '🐱',
      'bird': '🐦',
      'rabbit': '🐰',
      'hamster': '🐹',
      'other': '🐾'
    };
    return avatars[type] || '🐾';
  };

  // Получение типа для отправки на сервер
  const getTypeForServer = (type) => {
    const typesMap = {
      'dog': 'Собака',
      'cat': 'Кот',
      'bird': 'Попугай',
      'rabbit': 'Кролик',
      'hamster': 'Хомяк',
      'other': 'Другое'
    };
    return typesMap[type] || 'Другое';
  };

  // Получение пола для отправки на сервер
  const getGenderForServer = (gender) => {
    return gender === 'male' ? 'Мужской' : 'Женский';
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

      const response = await fetch(`${API_URL}/animals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(animalData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при добавлении животного');
      }

      // Обновляем список животных
      loadAnimals();
      setShowAddModal(false);
      resetForm();
      alert('Питомец успешно добавлен!');

    } catch (error) {
      console.error('Ошибка добавления животного:', error);
      alert(error.message || 'Произошла ошибка при добавлении питомца');
    }
  };

  // Редактирование животного (пока не реализовано)
  const handleEditAnimal = (animal) => {
    alert('Редактирование пока не реализовано');
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
      const response = await fetch(`${API_URL}/animals/${animalToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при удалении животного');
      }

      // Удаляем из списка
      setAnimals(prev => prev.filter(animal => animal.id !== animalToDelete.id));
      setShowDeleteModal(false);
      setAnimalToDelete(null);
      alert('Питомец удален');

    } catch (error) {
      console.error('Ошибка удаления животного:', error);
      alert(error.message || 'Произошла ошибка при удалении питомца');
    }
  };

  // Сброс формы
  const resetForm = () => {
    setAnimalForm({
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

  // Просмотр истории
  const handleViewHistory = (animal) => {
    alert('История пока не реализована');
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
              className="btn btn-sm btn-warning"
              onClick={() => handleEditAnimal(animal)}
              disabled
            >
              ✏️ Редактировать
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