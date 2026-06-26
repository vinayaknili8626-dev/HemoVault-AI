const express = require('express');
const {
  getLabDashboard,
  getApprovedLabs,
  getApprovedDoctors
} = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('laboratory'), getLabDashboard);
router.get('/directory', getApprovedLabs);
router.get('/doctors', getApprovedDoctors);

module.exports = router;
