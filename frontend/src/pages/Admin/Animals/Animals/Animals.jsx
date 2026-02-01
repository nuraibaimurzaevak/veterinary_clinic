import React, { useState, useEffect } from 'react';
import api from '../../../../api/axiosConfig'; // Используем axios instance
import API from '../../../../api/api'; // Импорт конфига API
import './Animals.css';

const AdminAnimalsPage = () => {
  const [animals, setAnimals] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Форма для добавления животного
  const [animalForm, setAnimalForm] = useState({
    name: '',
    type: 'Собака',
    breed: '',
    age: '',
    weight: '',
    gender: 'Мужской',
    color: '',
    microchipNumber: '',
    ownerType: 'user',
    createdBy: ''
  });

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Загружаем животных и пользователей одновременно с использованием axios
      const [animalsRes, usersRes] = await Promise.all([
        api.get(API.ANIMALS.ALL),
        api.get(API.USERS.ALL)
      ]);

      // Обработка данных животных
      let animalsData = [];
      if (Array.isArray(animalsRes.data)) {
        animalsData = animalsRes.data;
      } else if (animalsRes.data && typeof animalsRes.data === 'object') {
        // Проверяем различные варианты структуры
        if (Array.isArray(animalsRes.data.animals)) {
          animalsData = animalsRes.data.animals;
        } else if (Array.isArray(animalsRes.data.data)) {
          animalsData = animalsRes.data.data;
        } else if (Array.isArray(animalsRes.data.result)) {
          animalsData = animalsRes.data.result;
        } else {
          // Если не нашли массив, преобразуем объект в массив
          animalsData = Object.values(animalsRes.data);
        }
      }
      
      // Гарантируем, что это массив
      if (!Array.isArray(animalsData)) {
        animalsData = [];
      }
      
      setAnimals(animalsData);

      // Обработка данных пользователей
      let usersData = [];
      if (Array.isArray(usersRes.data)) {
        usersData = usersRes.data;
      } else if (usersRes.data && typeof usersRes.data === 'object') {
        if (Array.isArray(usersRes.data.users)) {
          usersData = usersRes.data.users;
        } else if (Array.isArray(usersRes.data.data)) {
          usersData = usersRes.data.data;
        } else {
          usersData = Object.values(usersRes.data);
        }
      }
      
      if (!Array.isArray(usersData)) {
        usersData = [];
      }
      
      setUsers(usersData);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || `Ошибка ${status}`;
        
        if (status === 401) {
          setError('Требуется авторизация');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        } else if (status === 403) {
          setError('У вас нет прав для доступа к этой странице');
        } else {
          setError(message);
        }
      } else if (error.request) {
        setError('Не удалось подключиться к серверу');
      } else {
        setError('Ошибка: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики формы
  const handleFormChange = (field, value) => {
    setAnimalForm(prev => ({ ...prev, [field]: value }));
  };

  // Добавление животного
  const handleAddAnimal = async () => {
    if (!animalForm.name.trim() || !animalForm.createdBy) {
      alert('Заполните обязательные поля: имя животного и владелец');
      return;
    }

    try {
      // Подготовка данных для отправки
      const animalData = {
        name: animalForm.name,
        type: animalForm.type,
        breed: animalForm.breed || '',
        age: {
          years: parseInt(animalForm.age) || 0,
          months: 0
        },
        weight: parseFloat(animalForm.weight) || 0,
        gender: animalForm.gender,
        color: animalForm.color || '',
        microchipNumber: animalForm.microchipNumber || '',
        ownerType: animalForm.ownerType,
        createdBy: animalForm.createdBy
      };

      // Используем axios для отправки
      const response = await api.post(API.ANIMALS.CREATE, animalData);
      
      // Показываем успешное сообщение
      setSuccessMessage('Животное успешно добавлено!');
      
      // Обновляем список
      await loadData();
      
      // Закрываем модалку с задержкой
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1000);

    } catch (error) {
      console.error('Ошибка добавления животного:', error);
      
      if (error.response) {
        const message = error.response.data?.message || 
                       error.response.data?.error || 
                       `Ошибка ${error.response.status}`;
        alert(`Ошибка добавления: ${message}`);
      } else if (error.request) {
        alert('Не удалось подключиться к серверу');
      } else {
        alert('Ошибка: ' + error.message);
      }
    }
  };

  // Удаление животного
  const handleDeleteClick = (animal) => {
    setAnimalToDelete(animal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!animalToDelete) return;

    try {
      // Используем axios для удаления
      await api.delete(API.ANIMALS.DELETE(animalToDelete._id));

      // Удаляем из списка локально
      setAnimals(prev => prev.filter(animal => animal._id !== animalToDelete._id));
      
      // Показываем сообщение
      setSuccessMessage('Животное успешно удалено');
      
      // Закрываем модалку
      setShowDeleteModal(false);
      setAnimalToDelete(null);
      
      // Убираем сообщение через 3 секунды
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Ошибка удаления животного:', error);
      
      if (error.response) {
        const message = error.response.data?.message || 
                       error.response.data?.error || 
                       `Ошибка ${error.response.status}`;
        alert(`Ошибка удаления: ${message}`);
      } else if (error.request) {
        alert('Не удалось подключиться к серверу');
      } else {
        alert('Ошибка: ' + error.message);
      }
      
      setShowDeleteModal(false);
      setAnimalToDelete(null);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setAnimalForm({
      name: '',
      type: 'Собака',
      breed: '',
      age: '',
      weight: '',
      gender: 'Мужской',
      color: '',
      microchipNumber: '',
      ownerType: 'user',
      createdBy: ''
    });
  };

  // Получение типа животного
  const getTypeInfo = (type) => {
    switch (type) {
      case 'Собака': return { label: 'Собака', icon: '🐕', color: '#4299E1' };
      case 'Кот': return { label: 'Кот', icon: '🐱', color: '#ED8936' };
      case 'Попугай': return { label: 'Птица', icon: '🐦', color: '#48BB78' };
      case 'Хомяк': return { label: 'Грызун', icon: '🐹', color: '#F687B3' };
      case 'Кролик': return { label: 'Кролик', icon: '🐰', color: '#9F7AEA' };
      default: return { label: 'Другое', icon: '🐾', color: '#A0AEC0' };
    }
  };

  // Рендер списка животных
  const renderAnimalsList = () => {
    // Гарантируем, что animals это массив
    const animalsArray = Array.isArray(animals) ? animals : [];
    
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка животных...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            Повторить попытку
          </button>
        </div>
      );
    }

    if (animalsArray.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🐕</div>
          <h3>Животных нет</h3>
          <p>Добавьте первое животное в систему</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Добавить животное
          </button>
        </div>
      );
    }

    return (
      <div className="animals-table-container">
        <table className="animals-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Тип</th>
              <th>Порода</th>
              <th>Возраст</th>
              <th>Пол</th>
              <th>Владелец</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {animalsArray.map(animal => {
              const typeInfo = getTypeInfo(animal.type);
              return (
                <tr key={animal._id}>
                  <td>
                    <div className="animal-info-cell">
                      <span 
                        className="animal-icon" 
                        style={{ backgroundColor: `${typeInfo.color}20` }}
                      >
                        {typeInfo.icon}
                      </span>
                      <div>
                        <div className="animal-name">{animal.name}</div>
                        {animal.color && (
                          <div className="animal-color">Окрас: {animal.color}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge" style={{ backgroundColor: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                  </td>
                  <td>{animal.breed || '-'}</td>
                  <td>{animal.age?.years || 0} лет</td>
                  <td>{animal.gender || 'Неизвестно'}</td>
                  <td>
                    {animal.createdBy ? (
                      <div className="owner-info">
                        <div className="owner-name">
                          {animal.createdBy.firstName} {animal.createdBy.lastName}
                        </div>
                        <div className="owner-email">{animal.createdBy.email}</div>
                      </div>
                    ) : (
                      <span className="no-owner">Нет владельца</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${animal.status || 'active'}`}>
                      {animal.status === 'archived' ? 'В архиве' : 'Активен'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteClick(animal)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-animals-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>🐕 Управление животными</h1>
            <p>Просмотр и управление всеми животными в системе</p>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            + Добавить животное
          </button>
        </div>

        {/* Сообщение об успехе */}
        {successMessage && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <span>{successMessage}</span>
            <button className="close-btn" onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}

        {renderAnimalsList()}
      </div>

      {/* Модальное окно добавления животного */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Добавить животное</h2>
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
              <form className="animal-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="name">Имя животного *</label>
                  <input
                    id="name"
                    type="text"
                    value={animalForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Например: Барсик"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Тип животного *</label>
                    <select
                      id="type"
                      value={animalForm.type}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                      className="form-select"
                    >
                      <option value="Собака">Собака</option>
                      <option value="Кот">Кот</option>
                      <option value="Попугай">Птица</option>
                      <option value="Хомяк">Грызун</option>
                      <option value="Кролик">Кролик</option>
                      <option value="Другое">Другое</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gender">Пол *</label>
                    <select
                      id="gender"
                      value={animalForm.gender}
                      onChange={(e) => handleFormChange('gender', e.target.value)}
                      className="form-select"
                    >
                      <option value="Мужской">Самец</option>
                      <option value="Женский">Самка</option>
                      <option value="Неизвестно">Неизвестно</option>
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
                    <label htmlFor="age">Возраст (лет)</label>
                    <input
                      id="age"
                      type="number"
                      value={animalForm.age}
                      onChange={(e) => handleFormChange('age', e.target.value)}
                      placeholder="0"
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="form-row">
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
                </div>
                
                <div className="form-group">
                  <label htmlFor="microchipNumber">Номер чипа</label>
                  <input
                    id="microchipNumber"
                    type="text"
                    value={animalForm.microchipNumber}
                    onChange={(e) => handleFormChange('microchipNumber', e.target.value)}
                    placeholder="Необязательно"
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ownerType">Тип владельца</label>
                    <select
                      id="ownerType"
                      value={animalForm.ownerType}
                      onChange={(e) => handleFormChange('ownerType', e.target.value)}
                      className="form-select"
                    >
                      <option value="user">Пользователь</option>
                      <option value="clinic">Клиника</option>
                      <option value="external">Внешний</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="createdBy">Владелец *</label>
                    <select
                      id="createdBy"
                      value={animalForm.createdBy}
                      onChange={(e) => handleFormChange('createdBy', e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Выберите владельца</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
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
                disabled={!animalForm.name.trim() || !animalForm.createdBy}
              >
                Добавить животное
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
              <h2>Удалить животное</h2>
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
                  Это действие нельзя отменить. Будут удалены все данные о животном.
                </p>
                {animalToDelete.createdBy && (
                  <div className="owner-warning">
                    <p><strong>Владелец:</strong> {animalToDelete.createdBy.firstName} {animalToDelete.createdBy.lastName}</p>
                  </div>
                )}
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
                Удалить животное
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnimalsPage;