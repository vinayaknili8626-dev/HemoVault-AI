const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  approveDoctor,
  approveLab,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('hospital_admin', 'super_admin'), getAdminStats);
router.get('/users', protect, authorize('hospital_admin', 'super_admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('hospital_admin', 'super_admin'), updateUserStatus);
router.put('/doctors/:id/approve', protect, authorize('hospital_admin', 'super_admin'), approveDoctor);
router.put('/labs/:id/approve', protect, authorize('hospital_admin', 'super_admin'), approveLab);
router.get('/logs', protect, authorize('hospital_admin', 'super_admin'), getAuditLogs);

module.exports = router;
