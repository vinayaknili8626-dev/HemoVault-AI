const express = require('express');
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/', protect, getAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
