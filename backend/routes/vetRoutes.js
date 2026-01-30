// routes/vetRoutes.js
const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Публичные маршруты
router.get('/', vetController.getVets);
router.get('/:id', vetController.getVetById);

// Защищенные маршруты (только админ)
router.get('/admin/all', auth, isAdmin, vetController.getAdminVets);
router.post('/', auth, isAdmin, vetController.createVet);
router.put('/:id', auth, isAdmin, vetController.updateVet);
router.delete('/:id', auth, isAdmin, vetController.deleteVet);

module.exports = router;