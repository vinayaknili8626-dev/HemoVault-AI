const express = require('express');
const {
  getDoctorDashboard,
  searchPatients,
  getPatientDetails
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('doctor'), getDoctorDashboard);
router.get('/patients/search', protect, authorize('doctor', 'laboratory', 'hospital_admin', 'super_admin'), searchPatients);
router.get('/patients/:id', protect, authorize('doctor', 'laboratory', 'hospital_admin', 'super_admin'), getPatientDetails);

module.exports = router;
