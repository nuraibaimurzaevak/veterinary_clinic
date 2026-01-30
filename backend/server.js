const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vetclinic', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB подключена'))
.catch(err => console.log('❌ MongoDB ошибка:', err.message));

// Модель пользователя
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Модель животного
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

// Модель ветеринара
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

// Добавьте эту модель после модели Vet в server.js:

// Модель записи на прием
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

// Аутентификация
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Пользователь не найден' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Недействительный токен' });
  }
};

// Проверка роли администратора
const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Требуются права администратора' });
  }
};

// Регистрация пользователя
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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

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
      token,
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

// Вход в систему
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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

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
      message: 'Вход выполнен',
      token,
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
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
});

// Животные пользователя (только свои животные)
app.get('/api/animals/user', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    const animals = await Animal.find(query).populate('createdBy', 'firstName lastName');
    
    res.json(animals);
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

    const populatedAnimal = await Animal.findById(animal._id).populate('createdBy', 'firstName lastName');

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
    const animals = await Animal.find().populate('createdBy', 'firstName lastName email');
    
    res.json(animals);
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
    const vets = await Vet.find({ isActive: true })
      .select('-__v -createdAt -updatedAt -createdBy')
      .sort({ name: 1 });
    
    res.json(vets);
  } catch (error) {
    console.error('Error fetching vets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения списка ветеринаров' 
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
    
    res.json(vet);
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
    
    res.json(vets);
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

// Добавьте этот эндпоинт в server.js перед главной страницей:

// Получить всех пользователей (только для админа)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения списка пользователей' 
    });
  }
});




// 1. Получить все записи пользователя
app.get('/api/appointments/user', authenticateToken, async (req, res) => {
  try {
    let query = { createdBy: req.user._id };
    
    // Админы могут видеть все записи
    if (req.user.role === 'admin') {
      query = {};
    }
    
    const appointments = await Appointment.find(query)
      .populate('animal', 'name type breed')
      .populate('vet', 'name specialization')
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1, time: -1 });
    
    res.json(appointments);
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
    
    // Проверка прав: только админ или владелец записи
    if (req.user.role !== 'admin' && appointment.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Нет прав для просмотра этой записи' 
      });
    }
    
    res.json(appointment);
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
    
    // Валидация
    if (!animal || !vet || !service || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Заполните все обязательные поля' 
      });
    }
    
    // Проверяем, что животное принадлежит пользователю
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
    
    // Проверяем ветеринара
    const vetDoc = await Vet.findById(vet);
    if (!vetDoc || !vetDoc.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден или неактивен' 
      });
    }
    
    // Проверяем, не занято ли время
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
    
    // Проверка прав
    if (req.user.role !== 'admin' && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Нет прав для редактирования этой записи' 
      });
    }
    
    // Обновляем поля
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
    
    // Проверка прав
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
    
    // Получаем занятые слоты на эту дату
    const bookedAppointments = await Appointment.find({
      vet: vetId,
      date: targetDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');
    
    const bookedTimes = bookedAppointments.map(app => app.time);
    
    // Генерируем доступное время (с 9 до 18, интервал 30 минут)
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
      
      // Добавляем 30 минут
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }
    
    res.json({
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
    let userQuery = {};
    
    if (req.user.role !== 'admin') {
      animalQuery.createdBy = req.user._id;
    }
    
    const totalAnimals = await Animal.countDocuments(animalQuery);
    const totalUsers = await User.countDocuments(userQuery);
    const totalVets = await Vet.countDocuments({ isActive: true });
    
    res.json({
      stats: [
        { title: 'Всего животных', value: totalAnimals.toString(), change: '+0%', icon: '🐕' },
        { title: 'Записей сегодня', value: '0', change: '+0%', icon: '📅' },
        { title: 'Активных пользователей', value: totalUsers.toString(), change: '+0%', icon: '👥' },
        { title: 'Ветеринаров', value: totalVets.toString(), change: '+0', icon: '👨‍⚕️' }
      ]
    });
  } catch (error) {
    res.json({
      stats: [
        { title: 'Всего животных', value: '0', change: '+0%', icon: '🐕' },
        { title: 'Записей сегодня', value: '0', change: '+0%', icon: '📅' },
        { title: 'Активных пользователей', value: '0', change: '+0%', icon: '👥' },
        { title: 'Ветеринаров', value: '0', change: '+0', icon: '👨‍⚕️' }
      ]
    });
  }
});

// Главная страница
// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Vet Clinic API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      animals: {
        userAnimals: 'GET /api/animals/user',
        addAnimal: 'POST /api/animals',
        deleteAnimal: 'DELETE /api/animals/:id',
        allAnimals: 'GET /api/animals/all (admin only)'
      },
      vets: {
        getVets: 'GET /api/vets',
        getVet: 'GET /api/vets/:id',
        adminVets: 'GET /api/vets/admin/all (admin only)',
        createVet: 'POST /api/vets (admin only)',
        updateVet: 'PUT /api/vets/:id (admin only)',
        deleteVet: 'DELETE /api/vets/:id (admin only)'
      },
      users: {
        getUsers: 'GET /api/users (admin only)'
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats'
      }
    }
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 API доступно по адресу: http://localhost:${PORT}`);
  console.log('\n📋 Доступные эндпоинты:');
  console.log('  👥 Аутентификация:');
  console.log('    POST /api/auth/register - Регистрация');
  console.log('    POST /api/auth/login - Вход');
  console.log('    GET /api/auth/me - Профиль');
  console.log('  🐕 Животные:');
  console.log('    GET /api/animals/user - Животные пользователя');
  console.log('    POST /api/animals - Добавить животное');
  console.log('    DELETE /api/animals/:id - Удалить животное');
  console.log('    GET /api/animals/all - Все животные (admin)');
  console.log('  👨‍⚕️ Ветеринары:');
  console.log('    GET /api/vets - Все ветеринары');
  console.log('    GET /api/vets/:id - Ветеринар по ID');
  console.log('    GET /api/vets/admin/all - Все ветеринары (admin)');
  console.log('    POST /api/vets - Создать ветеринара (admin)');
  console.log('    PUT /api/vets/:id - Обновить ветеринара (admin)');
  console.log('    DELETE /api/vets/:id - Удалить ветеринара (admin)');
  console.log('  📊 Дашборд:');
  console.log('    GET /api/dashboard/stats - Статистика');
});