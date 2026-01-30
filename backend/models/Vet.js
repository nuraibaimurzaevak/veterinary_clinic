// В vetSchema добавьте расписание:
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
  // Детальное расписание
  schedule: {
    monday: {
      isWorking: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
      breakStart: { type: String, default: '13:00' },
      breakEnd: { type: String, default: '14:00' }
    },
    tuesday: {
      isWorking: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
      breakStart: { type: String, default: '13:00' },
      breakEnd: { type: String, default: '14:00' }
    },
    wednesday: {
      isWorking: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
      breakStart: { type: String, default: '13:00' },
      breakEnd: { type: String, default: '14:00' }
    },
    thursday: {
      isWorking: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
      breakStart: { type: String, default: '13:00' },
      breakEnd: { type: String, default: '14:00' }
    },
    friday: {
      isWorking: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
      breakStart: { type: String, default: '13:00' },
      breakEnd: { type: String, default: '14:00' }
    },
    saturday: {
      isWorking: { type: Boolean, default: false },
      startTime: { type: String, default: '10:00' },
      endTime: { type: String, default: '16:00' },
      breakStart: { type: String, default: '13:00' },
      breakEnd: { type: String, default: '14:00' }
    },
    sunday: {
      isWorking: { type: Boolean, default: false },
      startTime: { type: String, default: '10:00' },
      endTime: { type: String, default: '14:00' }
    }
  },
  // Исключения (отпуск, больничный)
  exceptions: [{
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    isWorking: { type: Boolean, default: false }
  }],
  // Общие настройки
  slotDuration: {
    type: Number,
    default: 30, // продолжительность слота в минутах
    min: 15,
    max: 60
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