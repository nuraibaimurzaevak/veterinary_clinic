const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Введите корректный email']
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен быть не менее 6 символов'],
    select: false // Не возвращаем пароль при запросах
  },
  firstName: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Фамилия обязательна'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Телефон обязателен'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'vet'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: '👤'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Хеширование пароля перед сохранением
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now();
  next();
});

// Метод для сравнения паролей
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Метод для обновления времени последнего входа
UserSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  return await this.save();
};

// Виртуальное поле для полного имени
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Не возвращаем пароль при преобразовании в JSON
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);