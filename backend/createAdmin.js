// backend/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vetclinic');
    
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      phone: String,
      role: String,
      createdAt: { type: Date, default: Date.now }
    }));

    // Проверяем, есть ли уже админ
    const existingAdmin = await User.findOne({ email: 'nurai.baimurzaevak@gmail.com' });
    if (existingAdmin) {
      console.log('✅ Администратор уже существует');
      process.exit(0);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('123Admin', 10);

    // Создаем администратора
    const admin = await User.create({
      email: 'nurai.baimurzaevak@gmail.com',
      password: hashedPassword,
      firstName: 'admin',
      lastName: 'clinic',
      phone: '+9964566567890',
      role: 'admin'
    });

    console.log('✅ Администратор создан успешно!');
    console.log('📧 Email: nurai.baimurzaevak@gmail.com');
    console.log('🔑 Пароль: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

createAdmin();