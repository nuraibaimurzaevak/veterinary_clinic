import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки пользователя
    setTimeout(() => {
      // Для теста - захардкодим админа
      const mockUser = {
        id: 1,
        name: 'Администратор',
        email: 'admin@vetclinic.ru',
        role: 'admin',
        token: 'mock-token-123'
      };
      
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const login = (email, password) => {
    // Заглушка для логина
    const userData = {
      id: 1,
      name: 'Администратор',
      email: email,
      role: 'admin',
      token: 'mock-token-123'
    };
    
    setUser(userData);
    return Promise.resolve(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    login,
    logout,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};