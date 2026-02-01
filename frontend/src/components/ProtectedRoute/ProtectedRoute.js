// frontend/src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('🔒 ProtectedRoute: isAuthenticated =', isAuthenticated);
    
    // Если loading закончился, показываем результат
    if (!loading) {
      setIsChecking(false);
    }
  }, [isAuthenticated, loading]);

  // Пока проверяем - показываем загрузку
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Проверка авторизации...</p>
      </div>
    );
  }

  // Если не авторизован - редирект
  if (!isAuthenticated) {
    console.log('🔄 ProtectedRoute: Редирект на /login');
    return <Navigate to="/login" replace />;
  }

  // Если авторизован - показываем детей
  return children;
};

// Добавьте в глобальный CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default ProtectedRoute;