import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header/Header';
import Home from './pages/HomePages/HomePage';
import Booking from './pages/Booking/Booking';
import Appointments from './pages/AppointmentsPage/AppointmentPage';
import Login from './pages/AuthPages/LoginPage';
import Register from './pages/AuthPages/RegisterPage';
import MyAnimalsPage from './pages/Animals/MyAnimalsPage';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import AdminVetsPage from './pages/Admin/Vets/AdminVetsPage';
import VetsPage from './pages/Vets/VetsPage';
import AdminAnimalsPage from './pages/Admin/Animals/Animals/Animals';
import AppointmentsAdmin from './pages/Admin/Appointments/AllAppointments/AllAppointment';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

// Временные компоненты
const AppointmentDetails = () => <div>Детали записи (в разработке)</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vets" element={<VetsPage />} />
              
              {/* Защищенные маршруты (требуют авторизации) */}
              <Route path="/booking" element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              } />
              
              <Route path="/animals" element={
                <ProtectedRoute>
                  <MyAnimalsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } />
              
              <Route path="/appointments/:id" element={
                <ProtectedRoute>
                  <AppointmentDetails />
                </ProtectedRoute>
              } />
              
              {/* Админские маршруты */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/vets" element={
                <ProtectedRoute requireAdmin>
                  <AdminVetsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/animals" element={
                <ProtectedRoute requireAdmin>
                  <AdminAnimalsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/appointments" element={
                <ProtectedRoute requireAdmin>
                  <AppointmentsAdmin />
                </ProtectedRoute>
              } />

              {/* 404 страница */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;