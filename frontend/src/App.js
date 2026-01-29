import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/layout';
import Home from './pages/HomePages/HomePage';
import Booking from './pages/Booking/Booking';
import Appointments from './pages/AppointmentsPage/AppointmentPage';
import Login from './pages/AuthPages/LoginPage';
import Register from './pages//AuthPages/RegisterPages';
import Profile from './pages/ProfilePages/ProfilePage';
import MyAnimalsPage from './pages/Animals/MyAnimalsPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Страницы с Layout (Header + Footer) */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/booking" element={<Layout><Booking /></Layout>} />
        <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/animals" element={<Layout><MyAnimalsPage /></Layout>} />

        
        {/* Страницы без Header (можно сделать отдельный Layout) */}
        <Route path="/login" element={<LoginLayout><Login /></LoginLayout>} />
        <Route path="/register" element={<LoginLayout><Register /></LoginLayout>} />
        
      </Routes>
    </Router>
  );
}

// Отдельный Layout для страниц авторизации (без Header)
const LoginLayout = ({ children }) => (
  <div className="auth-layout">
    {children}
  </div>
);

export default App;