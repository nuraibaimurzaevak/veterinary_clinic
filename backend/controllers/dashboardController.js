const Appointment = require('../models/Appointment');
const Animal = require('../models/Animal');
const User = require('../models/User');
const Vet = require('../models/Vet');
const Statistic = require('../models/Statistic');

// Получить статистику для дашборда
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Количество животных
    const totalAnimals = await Animal.countDocuments();
    
    // Записи сегодня
    const appointmentsToday = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Активные пользователи (вошли за последние 30 дней)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });
    
    // Всего ветеринаров
    const totalVets = await Vet.countDocuments({ isActive: true });
    
    // Записи за вчера для сравнения
    const appointmentsYesterday = await Appointment.countDocuments({
      date: { $gte: yesterday, $lt: today }
    });
    
    // Рассчитываем процент изменения
    const todayVsYesterday = appointmentsYesterday > 0 
      ? ((appointmentsToday - appointmentsYesterday) / appointmentsYesterday * 100).toFixed(1)
      : 0;
    
    res.json({
      totalAnimals,
      appointmentsToday,
      activeUsers,
      totalVets,
      todayVsYesterday: todayVsYesterday > 0 ? `+${todayVsYesterday}%` : `${todayVsYesterday}%`,
      stats: [
        {
          title: 'Всего животных',
          value: totalAnimals.toLocaleString(),
          change: '+12%', // Моковые данные
          icon: '🐕'
        },
        {
          title: 'Записей сегодня',
          value: appointmentsToday.toString(),
          change: todayVsYesterday > 0 ? `+${todayVsYesterday}%` : `${todayVsYesterday}%`,
          icon: '📅'
        },
        {
          title: 'Активных пользователей',
          value: activeUsers.toLocaleString(),
          change: '+8%', // Моковые данные
          icon: '👥'
        },
        {
          title: 'Ветеринаров',
          value: totalVets.toString(),
          change: '+2',
          icon: '👨‍⚕️'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получить последние записи
exports.getRecentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('animal', 'name type avatar')
      .populate('owner', 'firstName lastName')
      .populate('vet', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      pet: appointment.animal?.name || 'Не указано',
      owner: `${appointment.owner?.firstName || ''} ${appointment.owner?.lastName || ''}`.trim(),
      vet: `${appointment.vet?.firstName || ''} ${appointment.vet?.lastName || ''}`.trim(),
      time: new Date(appointment.date).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: appointment.status,
      icon: getAnimalIcon(appointment.animal?.type)
    }));
    
    res.json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Вспомогательная функция для иконок
function getAnimalIcon(type) {
  const icons = {
    'Кот': '🐱',
    'Собака': '🐕',
    'Попугай': '🐦',
    'Хомяк': '🐹',
    'Кролик': '🐰',
    'Другое': '🐾'
  };
  return icons[type] || '🐾';
}

// Получить статистику за период
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const statistics = await Statistic.find(query).sort({ date: 1 });
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Сгенерировать отчет
exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    // Здесь можно добавить логику генерации PDF/Excel отчетов
    // Пока возвращаем JSON с данными
    
    const report = {
      type,
      generatedAt: new Date(),
      startDate,
      endDate,
      data: await getReportData(type, startDate, endDate)
    };
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function getReportData(type, startDate, endDate) {
  switch (type) {
    case 'appointments':
      return await Appointment.find({
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).populate('animal vet owner');
    
    case 'revenue':
      // Здесь можно добавить логику расчета доходов
      return { totalRevenue: 0, appointments: 0, average: 0 };
    
    default:
      return {};
  }
}