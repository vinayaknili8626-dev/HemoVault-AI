const express = require('express');
const {
  getPatientDashboardStats,
  getPatientReportTrends,
  getMedicalHistory,
  updateMedicalHistory,
  updatePatientProfile
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('patient'), getPatientDashboardStats);
router.get('/trends', protect, getPatientReportTrends);
router.get('/history', protect, getMedicalHistory);
router.put('/history', protect, updateMedicalHistory);
router.put('/profile', protect, authorize('patient'), updatePatientProfile);

module.exports = router;
