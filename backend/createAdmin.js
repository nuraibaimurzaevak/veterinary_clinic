// backend/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nuraibaimurzaevak_db_user:oAWq7QMUZjQSsShE@cluster0.6a8t8nm.mongodb.net/?appName=Cluster0');
    
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
    console.log('🔑 Пароль: 123Admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

createAdmin();