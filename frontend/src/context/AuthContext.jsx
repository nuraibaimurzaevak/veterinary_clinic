import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Базовый URL API из переменной окружения
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Проверка авторизации через API
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const userData = {
            id: data.user._id || data.user.id,
            name: data.user.firstName || data.user.name || 'Пользователь',
            email: data.user.email,
            role: data.user.role || 'user',
            token: token
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        } else {
          logout();
        }
      } else if (response.status === 401) {
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      try {
        const storedUser = JSON.parse(userStr);
        setUser(storedUser);
      } catch {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Инициализация при загрузке
  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка авторизации');
      }

      const data = await response.json();
      
      if (data.success && data.user && data.token) {
        const userData = {
          id: data.user._id || data.user.id,
          name: data.user.firstName || data.user.name || 'Пользователь',
          email: data.user.email,
          role: data.user.role || 'user',
          token: data.token
        };
        
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        window.dispatchEvent(new Event('authChange'));
        
        return Promise.resolve(userData);
      } else {
        throw new Error('Неверные данные пользователя');
      }
    } catch (error) {
      console.error('Login error:', error);
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.dispatchEvent(new Event('authChange'));
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    login,
    logout,
    isAdmin,
    loading,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};