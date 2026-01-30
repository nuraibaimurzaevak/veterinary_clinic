const Appointment = require('../models/Appointment');
const Animal = require('../models/Animal');
const Vet = require('../models/Vet');
const User = require('../models/User');

// Создание новой записи
exports.createAppointment = async (req, res) => {
  try {
    const { userId, animalId, vetId, date, time, reason, symptoms, specialization, notes, emergency } = req.body;

    // Проверка доступности времени
    const existingAppointment = await Appointment.findOne({
      vetId,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        error: 'Это время уже занято' 
      });
    }

    // Проверка расписания ветеринара
    const vetSchedule = await Schedule.findOne({ vetId });
    if (vetSchedule) {
      const availableSlots = vetSchedule.getAvailableSlots(new Date(date));
      if (!availableSlots.includes(time)) {
        return res.status(400).json({ 
          error: 'Ветеринар не принимает в это время' 
        });
      }
    }

    // Создание записи
    const appointment = new Appointment({
      userId,
      animalId,
      vetId,
      date: new Date(date),
      time,
      reason,
      symptoms,
      specialization,
      notes,
      emergency,
      status: 'pending',
      createdBy: req.user?._id
    });

    await appointment.save();

    // Получение полной информации для ответа
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('animalId', 'name type breed avatar')
      .populate('vetId', 'name specialization experience rating avatar');

    res.status(201).json({
      message: 'Запись успешно создана',
      appointment: populatedAppointment
    });

  } catch (error) {
    console.error('Ошибка создания записи:', error);
    res.status(500).json({ 
      error: 'Ошибка при создании записи' 
    });
  }
};

// Получение записей пользователя
exports.getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, dateFrom, dateTo, limit = 20, page = 1 } = req.query;

    const query = { userId };
    
    // Фильтры
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (dateFrom) {
      query.date = { $gte: new Date(dateFrom) };
    }
    
    if (dateTo) {
      if (query.date) {
        query.date.$lte = new Date(dateTo);
      } else {
        query.date = { $lte: new Date(dateTo) };
      }
    }

    const skip = (page - 1) * limit;
    
    const appointments = await Appointment.find(query)
      .populate('animalId', 'name type breed avatar age')
      .populate('vetId', 'name specialization experience rating avatar')
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения записей:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении записей' 
    });
  }
};

// Получение записей ветеринара
exports.getVetAppointments = async (req, res) => {
  try {
    const { vetId } = req.params;
    const { date, status } = req.query;

    const query = { vetId };
    
    if (date) {
      query.date = new Date(date);
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('animalId', 'name type breed ownerId')
      .populate('userId', 'name email phone')
      .sort({ date: 1, time: 1 });

    res.json({ appointments });

  } catch (error) {
    console.error('Ошибка получения записей ветеринара:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении записей ветеринара' 
    });
  }
};

// Обновление записи
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Проверка существования записи
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        error: 'Запись не найдена' 
      });
    }

    // Если меняется время, проверяем доступность
    if (updates.time || updates.date) {
      const checkTime = updates.time || appointment.time;
      const checkDate = updates.date ? new Date(updates.date) : appointment.date;

      const existingAppointment = await Appointment.findOne({
        vetId: appointment.vetId,
        date: checkDate,
        time: checkTime,
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: id }
      });

      if (existingAppointment) {
        return res.status(400).json({ 
          error: 'Это время уже занято' 
        });
      }
    }

    // Обновление записи
    Object.assign(appointment, updates, { updatedAt: Date.now() });
    await appointment.save();

    const populatedAppointment = await Appointment.findById(id)
      .populate('animalId', 'name type breed avatar')
      .populate('vetId', 'name specialization experience rating avatar');

    res.json({
      message: 'Запись успешно обновлена',
      appointment: populatedAppointment
    });

  } catch (error) {
    console.error('Ошибка обновления записи:', error);
    res.status(500).json({ 
      error: 'Ошибка при обновлении записи' 
    });
  }
};

// Отмена записи
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        error: 'Запись не найдена' 
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Запись уже отменена' 
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = cancelReason;
    appointment.updatedAt = Date.now();

    await appointment.save();

    res.json({
      message: 'Запись успешно отменена',
      appointment
    });

  } catch (error) {
    console.error('Ошибка отмены записи:', error);
    res.status(500).json({ 
      error: 'Ошибка при отмене записи' 
    });
  }
};

// Получение доступного времени
exports.getAvailableSlots = async (req, res) => {
  try {
    const { vetId, date } = req.params;

    // Получение расписания ветеринара
    const schedule = await Schedule.findOne({ vetId });
    if (!schedule) {
      return res.status(404).json({ 
        error: 'Расписание ветеринара не найдено' 
      });
    }

    // Получение всех записей на эту дату
    const appointments = await Appointment.find({
      vetId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');

    const bookedSlots = appointments.map(a => a.time);
    const availableSlots = schedule.getAvailableSlots(new Date(date));
    
    // Фильтруем занятые слоты
    const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      date,
      vetId,
      availableSlots: freeSlots,
      bookedSlots,
      schedule: schedule.weeklySchedule
    });

  } catch (error) {
    console.error('Ошибка получения доступных слотов:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении доступного времени' 
    });
  }
};

// Получение статистики
exports.getAppointmentStats = async (req, res) => {
  try {
    const { userId, vetId } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (vetId) query.vetId = vetId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: await Appointment.countDocuments(query),
      upcoming: await Appointment.countDocuments({ 
        ...query, 
        status: { $in: ['pending', 'confirmed'] },
        date: { $gte: today }
      }),
      completed: await Appointment.countDocuments({ 
        ...query, 
        status: 'completed' 
      }),
      cancelled: await Appointment.countDocuments({ 
        ...query, 
        status: 'cancelled' 
      }),
      today: await Appointment.countDocuments({ 
        ...query,
        date: today
      }),
      bySpecialization: await Appointment.aggregate([
        { $match: query },
        { $group: { _id: '$specialization', count: { $sum: 1 } } }
      ])
    };

    res.json({ stats });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении статистики' 
    });
  }
};