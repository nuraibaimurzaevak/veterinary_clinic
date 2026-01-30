const Animal = require('../models/Animal');

// Получить всех животных
exports.getAnimals = async (req, res) => {
  try {
    const { ownerType, status, type } = req.query;
    
    let query = {};
    
    // Фильтры
    if (ownerType) query.ownerType = ownerType;
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Если пользователь не админ, показываем только его животных или клиники
    if (req.user.role !== 'admin') {
      query.$or = [
        { userId: req.user.id },
        { ownerType: 'clinic' }
      ];
    }
    
    const animals = await Animal.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получить животное по ID
exports.getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName');
    
    if (!animal) {
      return res.status(404).json({ message: 'Животное не найдено' });
    }
    
    // Проверка доступа
    if (req.user.role !== 'admin' && 
        animal.ownerType === 'user' && 
        animal.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет доступа к этому животному' });
    }
    
    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Создать животное (разные типы владельцев)
exports.createAnimal = async (req, res) => {
  try {
    const { ownerType } = req.body;
    
    let animalData = {
      ...req.body,
      createdBy: req.user.id,
    };
    
    // Валидация в зависимости от типа владельца
    if (ownerType === 'user') {
      // Если владелец - текущий пользователь
      if (!req.body.userId) {
        animalData.userId = req.user.id;
      }
      
      // Проверяем, что указанный пользователь существует
      // (можно добавить проверку если нужно)
      
    } else if (ownerType === 'external') {
      // Проверяем обязательные поля для внешнего владельца
      if (!req.body.externalOwner || !req.body.externalOwner.fullName || !req.body.externalOwner.phone) {
        return res.status(400).json({ 
          message: 'Для внешнего владельца укажите ФИО и телефон' 
        });
      }
    }
    
    const animal = new Animal(animalData);
    await animal.save();
    
    const populatedAnimal = await Animal.findById(animal._id)
      .populate('userId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json(populatedAnimal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Обновить животное
exports.updateAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Животное не найдено' });
    }
    
    // Проверка доступа
    if (req.user.role !== 'admin' && 
        animal.ownerType === 'user' && 
        animal.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для обновления' });
    }
    
    // Не позволяем менять тип владельца на 'user' без указания userId
    if (req.body.ownerType === 'user' && !req.body.userId) {
      req.body.userId = req.user.id;
    }
    
    const updatedAnimal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('userId', 'firstName lastName')
    .populate('createdBy', 'firstName lastName');
    
    res.json(updatedAnimal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Удалить животное
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Животное не найдено' });
    }
    
    // Только админ или владелец может удалить
    if (req.user.role !== 'admin' && 
        animal.ownerType === 'user' && 
        animal.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для удаления' });
    }
    
    await animal.deleteOne();
    
    res.json({ message: 'Животное удалено', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получить животных пользователя
exports.getUserAnimals = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' && req.params.userId 
      ? req.params.userId 
      : req.user.id;
    
    const animals = await Animal.find({ 
      ownerType: 'user', 
      userId: userId,
      status: 'active'
    })
    .sort({ name: 1 });
    
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получить животных клиники
exports.getClinicAnimals = async (req, res) => {
  try {
    const animals = await Animal.find({ 
      ownerType: 'clinic',
      status: 'active'
    })
    .sort({ createdAt: -1 });
    
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Добавить запись в медицинскую историю
exports.addMedicalRecord = async (req, res) => {
  try {
    const { diagnosis, treatment, vet, notes } = req.body;
    
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Животное не найдено' });
    }
    
    // Проверка доступа (только админ или ветеринар)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для добавления мед. записи' });
    }
    
    animal.medicalHistory.push({
      diagnosis,
      treatment,
      vet,
      notes,
      date: new Date(),
    });
    
    await animal.save();
    
    res.json(animal.medicalHistory[animal.medicalHistory.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Добавить вакцинацию
exports.addVaccination = async (req, res) => {
  try {
    const { name, date, nextDue, notes } = req.body;
    
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Животное не найдено' });
    }
    
    // Проверка доступа (только админ или ветеринар)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для добавления вакцинации' });
    }
    
    animal.vaccinations.push({
      name,
      date: new Date(date),
      nextDue: nextDue ? new Date(nextDue) : null,
      notes,
    });
    
    await animal.save();
    
    res.json(animal.vaccinations[animal.vaccinations.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};