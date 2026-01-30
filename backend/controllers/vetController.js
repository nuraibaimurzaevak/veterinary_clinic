// controllers/vetController.js
const Vet = require('../models/Vet');

// @desc    Получить всех активных ветеринаров
// @route   GET /api/vets
// @access  Public
exports.getVets = async (req, res) => {
  try {
    const vets = await Vet.find({ isActive: true })
      .select('-__v -createdAt -updatedAt')
      .sort({ name: 1 });
    
    res.status(200).json(vets);
  } catch (error) {
    console.error('Error fetching vets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при получении списка ветеринаров' 
    });
  }
};

// @desc    Получить всех ветеринаров (для админа)
// @route   GET /api/vets/admin
// @access  Private/Admin
exports.getAdminVets = async (req, res) => {
  try {
    const vets = await Vet.find()
      .select('-__v')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(vets);
  } catch (error) {
    console.error('Error fetching admin vets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при получении списка ветеринаров' 
    });
  }
};

// @desc    Получить ветеринара по ID
// @route   GET /api/vets/:id
// @access  Public
exports.getVetById = async (req, res) => {
  try {
    const vet = await Vet.findById(req.params.id)
      .select('-__v -createdAt -updatedAt');
    
    if (!vet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден' 
      });
    }
    
    res.status(200).json(vet);
  } catch (error) {
    console.error('Error fetching vet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при получении ветеринара' 
    });
  }
};

// @desc    Создать ветеринара
// @route   POST /api/vets
// @access  Private/Admin
exports.createVet = async (req, res) => {
  try {
    const { name, specialization, bio, experience, education, workingHours, isActive } = req.body;
    
    // Валидация
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
      createdBy: req.userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Ветеринар успешно создан',
      data: vet
    });
  } catch (error) {
    console.error('Error creating vet:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при создании ветеринара' 
    });
  }
};

// @desc    Обновить ветеринара
// @route   PUT /api/vets/:id
// @access  Private/Admin
exports.updateVet = async (req, res) => {
  try {
    const { name, specialization, bio, experience, education, workingHours, isActive } = req.body;
    
    let vet = await Vet.findById(req.params.id);
    
    if (!vet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден' 
      });
    }
    
    // Обновляем поля
    vet.name = name || vet.name;
    vet.specialization = specialization || vet.specialization;
    if (bio !== undefined) vet.bio = bio;
    if (experience !== undefined) vet.experience = experience;
    if (education !== undefined) vet.education = education;
    if (workingHours !== undefined) vet.workingHours = workingHours;
    if (isActive !== undefined) vet.isActive = isActive;
    
    await vet.save();
    
    res.status(200).json({
      success: true,
      message: 'Ветеринар успешно обновлен',
      data: vet
    });
  } catch (error) {
    console.error('Error updating vet:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при обновлении ветеринара' 
    });
  }
};

// @desc    Удалить ветеринара
// @route   DELETE /api/vets/:id
// @access  Private/Admin
exports.deleteVet = async (req, res) => {
  try {
    const vet = await Vet.findById(req.params.id);
    
    if (!vet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ветеринар не найден' 
      });
    }
    
    await vet.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Ветеринар успешно удален'
    });
  } catch (error) {
    console.error('Error deleting vet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при удалении ветеринара' 
    });
  }
};