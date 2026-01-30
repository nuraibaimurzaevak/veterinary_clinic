const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Проверка JWT токена
exports.protect = async (req, res, next) => {
  let token;

  // Проверяем заголовок Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Проверяем куки
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Для доступа требуется авторизация'
    });
  }

  try {
    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Находим пользователя по ID из токена
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Обновляем время последнего входа
    if (!req.user.lastLogin || Date.now() - req.user.lastLogin > 3600000) {
      req.user.lastLogin = Date.now();
      await req.user.save();
    }

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Срок действия токена истек'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке авторизации'
    });
  }
};

// Проверка роли администратора
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права администратора.'
    });
  }
};

// Проверка роли ветеринара
exports.vet = (req, res, next) => {
  if (req.user && (req.user.role === 'vet' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права ветеринара.'
    });
  }
};

// Проверка роли пользователя (обычный пользователь или выше)
exports.user = (req, res, next) => {
  if (req.user && ['user', 'vet', 'admin'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Доступ запрещен'
    });
  }
};

// Генерация JWT токена
exports.generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};