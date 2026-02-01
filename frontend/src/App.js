import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import TestStorage from './pages/Test/TestStorage.js'; // для теста
import './App.css';

function App() {
  console.log('🔄 App.js запущен');
  
  return (
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
            <Route path="/test-storage" element={<TestStorage />} />
            
            {/* ВСЕ ОСТАЛЬНЫЕ - БЕО ЗАЩИТЫ */}
            <Route path="/booking" element={<Booking />} />
            <Route path="/animals" element={<MyAnimalsPage />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vets" element={<AdminVetsPage />} />
            <Route path="/admin/animals" element={<AdminAnimalsPage />} />
            <Route path="/admin/appointments" element={<AppointmentsAdmin />} />

            {/* 404 страница */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;