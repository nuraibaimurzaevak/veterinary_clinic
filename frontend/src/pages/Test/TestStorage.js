import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TestStorage = () => {
  const [storageData, setStorageData] = useState({});

  useEffect(() => {
    const checkStorage = () => {
      const data = {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        timestamp: new Date().toLocaleTimeString()
      };
      console.log('🕒 Проверка localStorage:', data);
      setStorageData(data);
    };

    checkStorage();
    const interval = setInterval(checkStorage, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveTest = () => {
    const testUser = {
      id: 999,
      email: 'test@test.com',
      firstName: 'Тест',
      role: 'user'
    };
    localStorage.setItem('token', 'test-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify(testUser));
    window.dispatchEvent(new Event('storage'));
    alert('Тестовые данные сохранены!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔧 Тест localStorage</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Текущий localStorage:</h3>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(storageData, null, 2)}
        </pre>
        <p>Последняя проверка: {storageData.timestamp}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleSaveTest} style={{ padding: '10px', background: '#28a745', color: 'white' }}>
          Сохранить тестовые данные
        </button>
        <Link to="/" style={{ padding: '10px', background: '#007bff', color: 'white', textDecoration: 'none' }}>
          На главную и вернуться
        </Link>
      </div>

      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
        <h4>🔄 Тест:</h4>
        <p>1. Сохрани тестовые данные</p>
        <p>2. Перейди на главную</p>
        <p>3. Вернись сюда (обнови страницу)</p>
        <p>4. Проверь остались ли данные</p>
      </div>
    </div>
  );
};

export default TestStorage;