const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ==================== CORS НАСТРОЙКИ ====================
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (мобильные приложения, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://magical-belekoy-c5a3b3.netlify.app/',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://localhost:10000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Для preflight запросов
app.options('*', cors(corsOptions));

// Дополнительные CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// ==================== ПОДКЛЮЧЕНИЕ К MONGODB ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vetclinic';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB подключена'))
.catch(err => {
  console.log('❌ MongoDB ошибка:', err.message);
  console.log('ℹ️ Проверьте переменную окружения MONGODB_URI');
});

// ==================== МОДЕЛИ ====================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  refreshToken: { type: String } // Добавил для refresh токенов
});
const User = mongoose.model('User', userSchema);

const animalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Собака', 'Кот', 'Попугай', 'Хомяк', 'Кролик', 'Другое']
  },
  breed: { type: String, default: '' },
  age: {
    years: { type: Number, default: 0 },
    months: { type: Number, default: 0 }
  },
  weight: { type: Number, default: 0 },
  gender: {
    type: String,
    enum: ['Мужской', 'Женский', 'Неизвестно'],
    default: 'Неизвестно'
  },
  color: { type: String, default: '' },
  microchipNumber: { type: String, default: '' },
  ownerType: {
    type: String,
    enum: ['user', 'clinic', 'external'],
    default: 'user'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now }
});
const Animal = mongoose.model('Animal', animalSchema);

const vetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Имя ветеринара обязательно'],
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Специализация обязательна'],
    trim: true
  },
  bio: {
    type: String,
    default: '',
    trim: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  education: {
    type: String,
    default: '',
    trim: true
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: {
      type: String,
      default: '18:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
const Vet = mongoose.model('Vet', vetSchema);

const appointmentSchema = new mongoose.Schema({
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  vet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vet',
    required: true
  },
  service: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

// ==================== MIDDLEWARE ====================

// Генерация токенов
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'vetclinic_secret_2024_access',
    { expiresIn: '15m' } // Короткоживущий токен
  );
  
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'vetclinic_secret_2024_refresh',
    { expiresIn: '7d' } // Долгоживущий токен
  );
  
  return { accessToken, refreshToken };
};

// Аутентификация - УЛУЧШЕННАЯ ВЕРСИЯ
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Проверяем Authorization header
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // 2. Если нет в заголовке, проверяем в cookies (если используете)
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    // 3. Если нет токена - 401
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Требуется авторизация' 
      });
    }

    // 4. Валидируем токен
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'vetclinic_secret_2024_access');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Токен истек',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw error;
    }

    // 5. Ищем пользователя
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }
    
    // 6. Добавляем пользователя в запрос
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Недействительный токен' 
    });
  }
};

// Проверка роли администратора
const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Требуются права администратора' 
    });
  }
};

// ==================== РОУТЫ ====================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'VetClinic API',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 🔥 НОВЫЙ ЭНДПОИНТ: Проверка токена (которого не было!)
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const userResponse = {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt
    };
    
    res.json({
      success: true,
      message: 'Токен валиден',
      user: userResponse
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка проверки токена' 
    });
  }
});

// 🔥 НОВЫЙ ЭНДПОИНТ: Обновление токена
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token не предоставлен' 
      });
    }

    // Проверяем refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'vetclinic_secret_2024_refresh'
    );
    
    // Ищем пользователя
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }
    
    // Проверяем, совпадает ли refresh token с сохраненным
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Недействительный refresh token' 
      });
    }
    
    // Генерируем новые токены
    const tokens = generateTokens(user);
    
    // Сохраняем новый refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };
    
    res.json({
      success: true,
      message: 'Токен обновлен',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token истек. Требуется повторный вход.' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Недействительный refresh token' 
    });
  }
});

// 🔥 НОВЫЙ ЭНДПОИНТ: Выход из системы
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Удаляем refresh token из базы
    await User.findByIdAndUpdate(req.user._id, { 
      $unset: { refreshToken: 1 } 
    });
    
    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при выходе' 
    });
  }
});

// Регистрация пользователя (ОБНОВЛЕНО с refresh token)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'user'
    });

    // Генерируем токены
    const tokens = generateTokens(user);
    
    // Сохраняем refresh token в базе
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
});

// Вход в систему (ОБНОВЛЕНО с refresh token)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неверный email или пароль' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неверный email или пароль' 
      });
    }

    // Генерируем токены
    const tokens = generateTokens(user);
    
    // Сохраняем refresh token в базе
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastLastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Вход выполнен',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
});

// Получение профиля
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userResponse = {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt
    };
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
});

// Животные пользователя
app.get('/api/animals/user', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    const animals = await Animal.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      animals,
      count: animals.length
    });
  } catch (error) {
    console.error('Error getting animals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения животных' 
    });
  }
});

// Добавить животное
app.post('/api/animals', authenticateToken, async (req, res) => {
  try {
    const { name, type, breed, age, weight, gender, color, microchipNumber } = req.body;

    if (!name || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Имя и тип животного обязательны' 
      });
    }

    const animal = await Animal.create({
      name,
      type,
      breed: breed || '',
      age: age || { years: 0, months: 0 },
      weight: weight || 0,
      gender: gender || 'Неизвестно',
      color: color || '',
      microchipNumber: microchipNumber || '',
      ownerType: 'user',
      createdBy: req.user._id,
      status: 'active'
    });

    const populatedAnimal = await Animal.findById(animal._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Животное добавлено',
      animal: populatedAnimal
    });

  } catch (error) {
    console.error('Error adding animal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка добавления животного' 
    });
  }
});

// Удалить животное
app.delete('/api/animals/:id', authenticateToken, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Животное не найдено' 
      });
    }

    if (req.user.role !== 'admin' && animal.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Нет прав для удаления этого животного' 
      });
    }

    await animal.deleteOne();
    
    res.json({
      success: true,
      message: 'Животное удалено'
    });

  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка удаления животного' 
    });
  }
});

// Все животные (только для админа)
app.get('/api/animals/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const animals = await Animal.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      animals,
      count: animals.length
    });
  } catch (error) {
    console.error('Error getting all animals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения списка животных' 
    });
  }
});

// ==================== API ДЛЯ ВЕТЕРИНАРОВ ====================

// Получить всех активных ветеринаров (публичный)
app.get('/api/vets', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'База данных не подключена' 
      });
    }
    
    const vets = await Vet.find({ isActive: true })
      .select('-__v -createdAt -updatedAt -createdBy')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      vets: vets,
      count: vets.length
    });
    
  } catch (error) {
    console.error('Error in /api/vets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения списка ветеринаров: ' + error.message 
    });
  }
});

// Получить ветеринара по ID (публичный)
app.get('/api/vets/:id', async (req, res) => {
  try {
    const vet = await Vet.findById(req.params.id)
      .select('-__v -createdAt -updatedAt -createdBy');
    
    if (!vet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден' 
      });
    }
    
    res.json({
      success: true,
      vet
    });
  } catch (error) {
    console.error('Error fetching vet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения ветеринара' 
    });
  }
});

// Получить всех ветеринаров для админа
app.get('/api/vets/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const vets = await Vet.find()
      .select('-__v')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      vets
    });
  } catch (error) {
    console.error('Error fetching admin vets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения списка ветеринаров' 
    });
  }
});

// Создать ветеринара (только админ)
app.post('/api/vets', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, specialization, bio, experience, education, workingHours, isActive } = req.body;
    
    if (!name || !specialization) {
      return res.status(400).json({ 
        success: false, 
        message: 'Имя и специализация обязательны' 
      });
    }
    
    const vet = await Vet.create({
      name,
      specialization,
      bio: bio || '',
      experience: experience || 0,
      education: education || '',
      workingHours: workingHours || { start: '09:00', end: '18:00' },
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Ветеринар успешно создан',
      vet
    });
  } catch (error) {
    console.error('Error creating vet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка создания ветеринара' 
    });
  }
});

// Обновить ветеринара (только админ)
app.put('/api/vets/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, specialization, bio, experience, education, workingHours, isActive } = req.body;
    
    let vet = await Vet.findById(req.params.id);
    
    if (!vet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден' 
      });
    }
    
    vet.name = name || vet.name;
    vet.specialization = specialization || vet.specialization;
    if (bio !== undefined) vet.bio = bio;
    if (experience !== undefined) vet.experience = experience;
    if (education !== undefined) vet.education = education;
    if (workingHours !== undefined) vet.workingHours = workingHours;
    if (isActive !== undefined) vet.isActive = isActive;
    
    await vet.save();
    
    res.json({
      success: true,
      message: 'Ветеринар успешно обновлен',
      vet
    });
  } catch (error) {
    console.error('Error updating vet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обновления ветеринара' 
    });
  }
});

// Удалить ветеринара (только админ)
app.delete('/api/vets/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const vet = await Vet.findById(req.params.id);
    
    if (!vet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден' 
      });
    }
    
    await vet.deleteOne();
    
    res.json({
      success: true,
      message: 'Ветеринар успешно удален'
    });
  } catch (error) {
    console.error('Error deleting vet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка удаления ветеринара' 
    });
  }
});

// Получить всех пользователей (только для админа)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v -refreshToken')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения списка пользователей' 
    });
  }
});

// ==================== API ДЛЯ ЗАПИСЕЙ ====================

// 1. Получить все записи пользователя
app.get('/api/appointments/user', authenticateToken, async (req, res) => {
  try {
    let query = { createdBy: req.user._id };
    
    if (req.user.role === 'admin') {
      query = {};
    }
    
    const appointments = await Appointment.find(query)
      .populate('animal', 'name type breed')
      .populate('vet', 'name specialization')
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1, time: -1 });
    
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения записей' 
    });
  }
});

// 2. Получить запись по ID
app.get('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('animal', 'name type breed age gender color')
      .populate('vet', 'name specialization bio workingHours')
      .populate('createdBy', 'firstName lastName email phone');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Запись не найдена' 
      });
    }
    
    if (req.user.role !== 'admin' && appointment.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Нет прав для просмотра этой записи' 
      });
    }
    
    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения записи' 
    });
  }
});

// 3. Создать запись
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { animal, vet, service, date, time, notes, price } = req.body;
    
    if (!animal || !vet || !service || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Заполните все обязательные поля' 
      });
    }
    
    const animalDoc = await Animal.findById(animal);
    if (!animalDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Животное не найдено' 
      });
    }
    
    if (req.user.role !== 'admin' && animalDoc.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Нет прав на запись с этим животным' 
      });
    }
    
    const vetDoc = await Vet.findById(vet);
    if (!vetDoc || !vetDoc.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден или неактивен' 
      });
    }
    
    const existingAppointment = await Appointment.findOne({
      vet,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Это время уже занято' 
      });
    }
    
    const appointment = await Appointment.create({
      animal,
      vet,
      service,
      date: new Date(date),
      time,
      notes: notes || '',
      status: 'pending',
      createdBy: req.user._id,
      price: price || 0
    });
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('animal', 'name type breed')
      .populate('vet', 'name specialization');
    
    res.status(201).json({
      success: true,
      message: 'Запись создана успешно',
      appointment: populatedAppointment
    });
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка создания записи' 
    });
  }
});

// 4. Обновить запись
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { service, date, time, notes, status, price } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Запись не найдена' 
      });
    }
    
    if (req.user.role !== 'admin' && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Нет прав для редактирования этой записи' 
      });
    }
    
    if (service !== undefined) appointment.service = service;
    if (date !== undefined) appointment.date = new Date(date);
    if (time !== undefined) appointment.time = time;
    if (notes !== undefined) appointment.notes = notes;
    if (status !== undefined) appointment.status = status;
    if (price !== undefined) appointment.price = price;
    
    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('animal', 'name type breed')
      .populate('vet', 'name specialization');
    
    res.json({
      success: true,
      message: 'Запись обновлена',
      appointment: populatedAppointment
    });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обновления записи' 
    });
  }
});

// 5. Отменить запись
app.put('/api/appointments/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Запись не найдена' 
      });
    }
    
    if (req.user.role !== 'admin' && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Нет прав для отмены этой записи' 
      });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Запись уже отменена' 
      });
    }
    
    if (appointment.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Нельзя отменить завершенную запись' 
      });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Запись отменена'
    });
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка отмены записи' 
    });
  }
});

// 6. Удалить запись (только админ)
app.delete('/api/appointments/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Запись не найдена' 
      });
    }
    
    await appointment.deleteOne();
    
    res.json({
      success: true,
      message: 'Запись удалена'
    });
    
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка удаления записи' 
    });
  }
});

// 7. Получить доступное время ветеринара
app.get('/api/appointments/vet/:vetId/availability', async (req, res) => {
  try {
    const { date } = req.query;
    const vetId = req.params.vetId;
    
    const vet = await Vet.findById(vetId);
    if (!vet || !vet.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден' 
      });
    }
    
    const targetDate = new Date(date);
    
    const bookedAppointments = await Appointment.find({
      vet: vetId,
      date: targetDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');
    
    const bookedTimes = bookedAppointments.map(app => app.time);
    
    const availableSlots = [];
    const workStart = vet.workingHours.start || '09:00';
    const workEnd = vet.workingHours.end || '18:00';
    
    const [startHour, startMinute] = workStart.split(':').map(Number);
    const [endHour, endMinute] = workEnd.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      if (!bookedTimes.includes(timeSlot)) {
        availableSlots.push({
          time: timeSlot,
          isAvailable: true
        });
      }
      
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }
    
    res.json({
      success: true,
      vet: {
        name: vet.name,
        specialization: vet.specialization,
        workingHours: vet.workingHours
      },
      date: targetDate.toISOString().split('T')[0],
      availableSlots
    });
    
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения доступного времени' 
    });
  }
});

// Статистика для дашборда
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    let animalQuery = {};
    let appointmentQuery = {};
    
    if (req.user.role !== 'admin') {
      animalQuery.createdBy = req.user._id;
      appointmentQuery.createdBy = req.user._id;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalAnimals = await Animal.countDocuments(animalQuery);
    const todayAppointments = await Appointment.countDocuments({
      ...appointmentQuery,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    });
    const totalUsers = await User.countDocuments();
    const totalVets = await Vet.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      stats: {
        totalAnimals,
        todayAppointments,
        totalUsers,
        totalVets
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.json({
      success: true,
      stats: {
        totalAnimals: 0,
        todayAppointments: 0,
        totalUsers: 0,
        totalVets: 0
      }
    });
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Vet Clinic API',
    version: '1.1.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/me'
      },
      animals: {
        userAnimals: 'GET /api/animals/user',
        addAnimal: 'POST /api/animals',
        deleteAnimal: 'DELETE /api/animals/:id',
        allAnimals: 'GET /api/animals/all (admin only)'
      },
      vets: 'GET /api/vets',
      appointments: 'GET /api/appointments/user',
      dashboard: 'GET /api/dashboard/stats'
    }
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Эндпоинт не найден',
    availableEndpoints: '/'
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Требуется авторизация'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== ЗАПУСК СЕРВЕРА ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('====================================');
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 API доступно по адресу: http://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Ваш фронтенд: https://lucky-parfait-382f06.netlify.app`);
  console.log('====================================\n');
  
  console.log('🔥 Ключевые фиксы:');
  console.log('  ✅ Добавлен /api/auth/verify для проверки токена');
  console.log('  ✅ Добавлен /api/auth/refresh для обновления токена');
  console.log('  ✅ Добавлен /api/auth/logout для выхода');
  console.log('\n====================================');
});
