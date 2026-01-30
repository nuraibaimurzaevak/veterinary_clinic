const express = require('express');
const router = express.Router();
const {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getUserAnimals,
  getClinicAnimals,
  addMedicalRecord,
  addVaccination,
} = require('../controllers/animalController');
const { protect, admin, user } = require('../middleware/auth');

// Все маршруты защищены
router.use(protect);

// Основные маршруты
router.get('/', user, getAnimals);
router.get('/user', user, getUserAnimals);
router.get('/user/:userId', admin, getUserAnimals); // Админ может посмотреть животных любого пользователя
router.get('/clinic', user, getClinicAnimals);
router.get('/:id', user, getAnimalById);
router.post('/', user, createAnimal);
router.put('/:id', user, updateAnimal);
router.delete('/:id', user, deleteAnimal);

// Медицинские записи
router.post('/:id/medical', admin, addMedicalRecord);
router.post('/:id/vaccinations', admin, addVaccination);

module.exports = router;