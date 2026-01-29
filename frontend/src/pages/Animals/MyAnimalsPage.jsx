import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAnimalsPage.css';

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

  // Форма для добавления/редактирования животного
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
    chipNumber: '',
    notes: '',
    avatar: '🐶'
  });

  // Моковые данные животных
  const mockAnimals = [
    {
      id: '1',
      name: 'Барсик',
      type: 'cat',
      breed: 'Британская короткошерстная',
      age: '4',
      ageUnit: 'years',
      weight: '5',
      weightUnit: 'kg',
      gender: 'male',
      color: 'Серый',
      chipNumber: 'CHIP123456789',
      avatar: '🐱',
      createdAt: '2023-01-15',
      lastVisit: '2024-02-10',
      vaccinations: ['Комплексная вакцинация', 'От бешенства'],
      allergies: ['Нет'],
      chronicDiseases: ['Нет']
    },
    {
      id: '2',
      name: 'Рекс',
      type: 'dog',
      breed: 'Немецкая овчарка',
      age: '3',
      ageUnit: 'years',
      weight: '35',
      weightUnit: 'kg',
      gender: 'male',
      color: 'Черно-подпалый',
      chipNumber: 'CHIP987654321',
      avatar: '🐕',
      createdAt: '2022-05-20',
      lastVisit: '2024-02-05',
      vaccinations: ['Комплексная вакцинация', 'От бешенства', 'От лептоспироза'],
      allergies: ['Курица'],
      chronicDiseases: ['Нет']
    },
    {
      id: '3',
      name: 'Кеша',
      type: 'bird',
      breed: 'Волнистый попугай',
      age: '1',
      ageUnit: 'years',
      weight: '0.05',
      weightUnit: 'kg',
      gender: 'male',
      color: 'Синий',
      chipNumber: '',
      avatar: '🐦',
      createdAt: '2023-11-10',
      lastVisit: '2024-01-20',
      vaccinations: [],
      allergies: ['Авокадо'],
      chronicDiseases: ['Нет']
    },
    {
      id: '4',
      name: 'Мурка',
      type: 'cat',
      breed: 'Дворовая',
      age: '2',
      ageUnit: 'years',
      weight: '3.5',
      weightUnit: 'kg',
      gender: 'female',
      color: 'Трехцветная',
      chipNumber: 'CHIP555666777',
      avatar: '🐈',
      createdAt: '2023-03-08',
      lastVisit: '2024-02-15',
      vaccinations: ['Комплексная вакцинация'],
      allergies: ['Нет'],
      chronicDiseases: ['Мочекаменная болезнь']
    }
  ];

  // Загрузка данных
  useEffect(() => {
    const loadAnimals = async () => {
      setIsLoading(true);
      try {
        // Имитация загрузки
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnimals(mockAnimals);
      } catch (error) {
        console.error('Ошибка загрузки животных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimals();
  }, []);

  // Фильтрация животных
  const filteredAnimals = animals.filter(animal => {
    // Фильтр по типу
    if (filterType !== 'all' && animal.type !== filterType) return false;
    
    // Поиск
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        animal.name.toLowerCase().includes(term) ||
        animal.breed.toLowerCase().includes(term) ||
        animal.color.toLowerCase().includes(term)
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
    
    // Автоматически меняем аватар при смене типа
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

  // Добавление животного
  const handleAddAnimal = () => {
    const newAnimal = {
      id: Date.now().toString(),
      ...animalForm,
      createdAt: new Date().toISOString().split('T')[0],
      lastVisit: '',
      vaccinations: [],
      allergies: ['Нет'],
      chronicDiseases: ['Нет']
    };

    setAnimals(prev => [...prev, newAnimal]);
    setShowAddModal(false);
    resetForm();
    alert('Питомец успешно добавлен!');
  };

  // Редактирование животного
  const handleEditAnimal = (animal) => {
    setAnimalForm(animal);
    setSelectedAnimal(animal);
    setShowAddModal(true);
  };

  // Удаление животного
  const handleDeleteClick = (animal) => {
    setAnimalToDelete(animal);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setAnimals(prev => prev.filter(animal => animal.id !== animalToDelete.id));
    setShowDeleteModal(false);
    setAnimalToDelete(null);
    alert('Питомец удален');
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
      chipNumber: '',
      notes: '',
      avatar: '🐶'
    });
    setSelectedAnimal(null);
  };

  // Запись на прием для животного
  const handleBookAppointment = (animal) => {
    navigate(`/booking?animal=${animal.id}`);
  };

  // Просмотр истории посещений
  const handleViewHistory = (animal) => {
    navigate(`/appointments?animal=${animal.id}`);
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
              <p className="animal-breed">{animal.breed}</p>
              <div className="animal-meta">
                <span className="animal-meta-item">
                  {genderInfo.icon} {genderInfo.label}
                </span>
                <span className="animal-meta-item">
                  {animal.age} {animal.ageUnit === 'years' ? 'лет' : 'мес'}
                </span>
                <span className="animal-meta-item">
                  {animal.weight} {animal.weightUnit}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="animal-card-body">
          <div className="animal-info-grid">
            <div className="info-item">
              <span className="info-label">Окрас:</span>
              <span className="info-value">{animal.color}</span>
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
            
            {animal.lastVisit && (
              <div className="info-item">
                <span className="info-label">Последний визит:</span>
                <span className="info-value">
                  {new Date(animal.lastVisit).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          {/* Особенности здоровья */}
          <div className="animal-health">
            {animal.allergies[0] !== 'Нет' && (
              <div className="health-tag warning">
                ⚠️ Аллергии: {animal.allergies.join(', ')}
              </div>
            )}
            
            {animal.chronicDiseases[0] !== 'Нет' && (
              <div className="health-tag danger">
                ⚕️ Хронические заболевания: {animal.chronicDiseases.join(', ')}
              </div>
            )}
            
            {animal.vaccinations.length > 0 && (
              <div className="health-tag success">
                💉 Вакцинации: {animal.vaccinations.length}
              </div>
            )}
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
        {/* Заголовок */}
        <div className="page-header">
          <div>
            <h1>🐕 Мои питомцы</h1>
            <p>Управление информацией о ваших животных</p>
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

        {/* Статистика */}
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

        {/* Фильтры и поиск */}
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

        {/* Список животных */}
        <div className="animals-container">
          {renderAnimalsList()}
        </div>

        {/* Модальное окно добавления/редактирования */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedAnimal ? 'Редактировать питомца' : 'Добавить питомца'}</h2>
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
                      <label htmlFor="age">Возраст</label>
                      <div className="input-with-unit">
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
                        <select
                          value={animalForm.ageUnit}
                          onChange={(e) => handleFormChange('ageUnit', e.target.value)}
                          className="unit-select"
                        >
                          <option value="years">лет</option>
                          <option value="months">мес</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="weight">Вес</label>
                      <div className="input-with-unit">
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
                        <select
                          value={animalForm.weightUnit}
                          onChange={(e) => handleFormChange('weightUnit', e.target.value)}
                          className="unit-select"
                        >
                          <option value="kg">кг</option>
                          <option value="g">г</option>
                        </select>
                      </div>
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
                        value={animalForm.chipNumber}
                        onChange={(e) => handleFormChange('chipNumber', e.target.value)}
                        placeholder="Необязательно"
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Дополнительная информация</label>
                    <textarea
                      id="notes"
                      value={animalForm.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Особенности здоровья, характер, предпочтения..."
                      rows="3"
                      className="form-textarea"
                    />
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
                  {selectedAnimal ? 'Сохранить изменения' : 'Добавить питомца'}
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
                    Это действие нельзя отменить. Будут удалены все данные о питомце, 
                    включая историю посещений и медицинские записи.
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