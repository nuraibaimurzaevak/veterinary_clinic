const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Основная информация
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  animalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Animal', 
    required: true 
  },
  vetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vet', 
    required: true 
  },
  
  // Дата и время
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String 
  },
  duration: { 
    type: Number, 
    default: 30 // в минутах
  },
  
  // Медицинская информация
  reason: { 
    type: String, 
    required: true 
  },
  symptoms: [{ 
    type: String 
  }],
  specialization: { 
    type: String, 
    required: true 
  },
  diagnosis: { 
    type: String 
  },
  treatment: { 
    type: String 
  },
  prescription: [{ 
    medication: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  
  // Статус и информация о записи
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  emergency: { 
    type: Boolean, 
    default: false 
  },
  notes: { 
    type: String 
  },
  cancelReason: { 
    type: String 
  },
  
  // Финансовая информация
  price: { 
    type: Number, 
    default: 0 
  },
  paid: { 
    type: Boolean, 
    default: false 
  },
  paymentMethod: { 
    type: String 
  },
  
  // Системная информация
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Рейтинги и отзывы
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  review: { 
    type: String 
  },
  vetFeedback: { 
    type: String 
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ vetId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;