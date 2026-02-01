import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Инициализация при загрузке
  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 AuthContext инициализация:');
    console.log('token:', token ? '✅ Есть' : '❌ Нет');
    console.log('user:', storedUser ? '✅ Есть' : '❌ Нет');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ AuthContext: Установлен authenticated = true');
      } catch (error) {
        console.error('Ошибка парсинга user:', error);
        logout();
      }
    }
    
    setLoading(false);
  };

  const login = (token, userData) => {
    console.log('📝 AuthContext.login вызван');
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token); // для совместимости
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
    console.log('✅ AuthContext: Пользователь вошел', userData.email);
    
    // Отправляем событие для других компонентов
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ AuthContext: Пользователь вышел');
    
    window.dispatchEvent(new Event('authChange'));
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const response = await fetch('https://vet-clinic-fhfh.onrender.com/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('Ошибка проверки токена:', error);
    }
    
    return false;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    checkInitialAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};