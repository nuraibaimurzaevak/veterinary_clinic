const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  createAdmin,
  checkEmail,
  getUsers
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/create-admin', createAdmin); // Только для разработки

// Защищенные маршруты (требуется авторизация)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Административные маршруты
router.get('/users', protect, admin, getUsers);

module.exports = router;