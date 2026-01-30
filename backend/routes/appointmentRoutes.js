const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Записи пользователя
router.get('/user/:userId', appointmentController.getUserAppointments);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id/cancel', appointmentController.cancelAppointment);

// Записи ветеринара (только для админов и ветеринаров)
router.get('/vet/:vetId', appointmentController.getVetAppointments);

// Доступные слоты
router.get('/available/:vetId/:date', appointmentController.getAvailableSlots);

// Статистика
router.get('/stats', appointmentController.getAppointmentStats);

module.exports = router;