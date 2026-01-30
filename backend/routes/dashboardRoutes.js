const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentAppointments,
  getStatistics,
  generateReport,
} = require('../controllers/dashboardController');

router.get('/stats', getDashboardStats);
router.get('/recent-appointments', getRecentAppointments);
router.get('/statistics', getStatistics);
router.get('/report', generateReport);

module.exports = router;