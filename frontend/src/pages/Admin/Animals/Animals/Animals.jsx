import React, { useState, useEffect } from 'react';
import './Animals.css';

const API_URL = 'http://localhost:5000/api';

const AdminAnimalsPage = () => {
  const [animals, setAnimals] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);
  
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

  // Получение токена
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = getToken();
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      // Загружаем животных и пользователей одновременно
      const [animalsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/animals/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!animalsRes.ok) throw new Error('Ошибка загрузки животных');
      if (!usersRes.ok) throw new Error('Ошибка загрузки пользователей');

      const animalsData = await animalsRes.json();
      const usersData = await usersRes.json();

      setAnimals(animalsData);
      setUsers(usersData);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError('Не удалось загрузить данные');
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
      const token = getToken();
      
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
        ownerType: animalForm.ownerType
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

      // Обновляем список
      loadData();
      setShowAddModal(false);
      resetForm();
      alert('Животное успешно добавлено!');

    } catch (error) {
      console.error('Ошибка добавления животного:', error);
      alert(error.message || 'Произошла ошибка при добавлении животного');
    }
  };

  // Удаление животного
  const handleDeleteClick = (animal) => {
    setAnimalToDelete(animal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/animals/${animalToDelete._id}`, {
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
      setAnimals(prev => prev.filter(animal => animal._id !== animalToDelete._id));
      setShowDeleteModal(false);
      setAnimalToDelete(null);
      alert('Животное удалено');

    } catch (error) {
      console.error('Ошибка удаления животного:', error);
      alert(error.message || 'Произошла ошибка при удалении животного');
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

    if (animals.length === 0) {
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
            {animals.map(animal => {
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
                    <span className={`status-badge ${animal.status}`}>
                      {animal.status === 'active' ? 'Активен' : 'В архиве'}
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
            onClick={() => setShowAddModal(true)}
          >
            + Добавить животное
          </button>
        </div>

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
              <form className="animal-form">
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