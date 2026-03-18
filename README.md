# 🏥 Ветеринарная клиника

Прототип CRM-системы для ветеринарной клиники. Реализован интерфейс для работы с карточками пациентов, историей посещений и расписанием. Демонстрирует навыки построения интерфейсов под бизнес-задачи (близко к вашим внутренним продуктам).
## 🛠 Технологии

**Frontend:**

- React 18
  
- JavaScript (ES6+)
  
- HTML5 / CSS3

**Backend:**
- Node.js
  
- Express.js

**База данных:**
MongoDB Cloud

## 🚀 Установка и запуск

### Предварительные требования

- Node.js (версия 16 или выше)
  
- npm 

### 1. Клонирование репозитория

git clone https://github.com/nuraibaimurzaevak/veterinary_clinic.git

cd veterinary_clinic


# 2. Установка зависимостей
Backend:

cd server

npm install

Frontend:

cd frontend

npm install

# 4. Настройка окружения

Создайте файл .env в папке server и добавьте:

PORT=5000

DB_CONNECTION=ваша_строка_подключения_к_бд

JWT_SECRET=ваш_секретный_ключ

# 4. Запуск приложения
   
# Backend:

cd backend

npm start

или для разработки

npm run dev

# Frontend (в новом терминале):

cd client

npm start

Приложение будет доступно по адресу: http://localhost:3000

# 📁 Структура проекта

veterinary_clinic/

├── client/                 # React приложение (frontend)

│   ├── public/

│   ├── src/

│   │   ├── components/     # React компоненты

│   │   ├── pages/          # Страницы приложения

│   │   ├── services/       # API запросы

│   │   └── App.js

│   └── package.json

├── server/                 # Node.js API (backend)

│   ├── controllers/        # Контроллеры

│   ├── models/             # Модели данных

│   ├── routes/             # Маршруты API

│   ├── middleware/         # Промежуточные обработчики

│   └── server.js

└── README.md

# ✨ Функционал

📅 Онлайн-запись на приём к врачу

🐕 Управление карточками своих питомцев

🐕 Управление карточками пациентов (питомцев)

📋 История посещений и назначений

🔍 Поиск и фильтрация записей

📞 Контакты клиники и обратная связь

📝 API Endpoints
