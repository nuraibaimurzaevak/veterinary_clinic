const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000/api';

export default {
  // Базовый URL
  BASE_URL: API_URL,
  
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_URL}/auth/register`,
    LOGIN: `${API_URL}/auth/login`,
    PROFILE: `${API_URL}/auth/me`,
    LOGOUT: `${API_URL}/auth/logout`,
  },
  
  // Animals endpoints
  ANIMALS: {
    USER: `${API_URL}/animals/user`,
    CREATE: `${API_URL}/animals`,
    DELETE: (id) => `${API_URL}/animals/${id}`,
    ALL: `${API_URL}/animals/all`, // admin only
  },
  
  // Vets endpoints
  VETS: {
    ALL: `${API_URL}/vets`,
    BY_ID: (id) => `${API_URL}/vets/${id}`,
    ADMIN_ALL: `${API_URL}/vets/admin/all`, // admin only
    CREATE: `${API_URL}/vets`, // admin only
  },
  
  // Appointments endpoints (добавьте если есть)
  APPOINTMENTS: {
    USER: `${API_URL}/appointments/user`,
    CREATE: `${API_URL}/appointments`,
    UPDATE: (id) => `${API_URL}/appointments/${id}`,
    DELETE: (id) => `${API_URL}/appointments/${id}`,
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: `${API_URL}/dashboard/stats`,
  },
  
  // Users (admin only)
  USERS: {
    ALL: `${API_URL}/users`,
  },
};