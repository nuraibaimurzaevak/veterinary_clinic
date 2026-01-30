const mongoose = require('mongoose');

const AnimalSchema = new mongoose.Schema({
  // Основная информация
  name: {
    type: String,
    required: [true, 'Имя животного обязательно'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Тип животного обязателен'],
    enum: ['Собака', 'Кот', 'Попугай', 'Хомяк', 'Кролик', 'Другое'],
  },
  breed: {
    type: String,
    required: [true, 'Порода обязательна'],
  },
  age: {
    years: { type: Number, default: 0 },
    months: { type: Number, default: 0 },
  },
  gender: {
    type: String,
    enum: ['Мужской', 'Женский', 'Неизвестно'],
    default: 'Неизвестно',
  },
  color: String,
  weight: Number,
  microchipNumber: String,
  avatar: {
    type: String,
    default: '🐾',
  },
  
  // Информация о владельце
  ownerType: {
    type: String,
    enum: ['user', 'clinic', 'external'],
    required: true,
    default: 'user',
  },
  
  // Если владелец - зарегистрированный пользователь
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.ownerType === 'user'; }
  },
  
  // Если владелец - клиника
  clinicOwner: {
    type: String,
    default: 'Наша клиника',
    required: function() { return this.ownerType === 'clinic'; }
  },
  
  // Если владелец - внешний (не зарегистрирован в системе)
  externalOwner: {
    fullName: {
      type: String,
      required: function() { return this.ownerType === 'external'; }
    },
    phone: {
      type: String,
      required: function() { return this.ownerType === 'external'; }
    },
    email: String,
    address: String,
    notes: String,
  },
  
  // Медицинская информация
  medicalHistory: [{
    date: { type: Date, default: Date.now },
    diagnosis: String,
    treatment: String,
    vet: String,
    notes: String,
  }],
  
  vaccinations: [{
    name: String,
    date: Date,
    nextDue: Date,
    notes: String,
  }],
  
  allergies: [String],
  chronicDiseases: [String],
  
  // Статус
  status: {
    type: String,
    enum: ['active', 'archived', 'deceased', 'transferred'],
    default: 'active',
  },
  
  // Метаданные
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Обновляем updatedAt при сохранении
AnimalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Animal', AnimalSchema);