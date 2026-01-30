const mongoose = require('mongoose');

const StatisticSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  totalAnimals: {
    type: Number,
    default: 0,
  },
  totalAppointments: {
    type: Number,
    default: 0,
  },
  appointmentsToday: {
    type: Number,
    default: 0,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  totalVets: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Statistic', StatisticSchema);