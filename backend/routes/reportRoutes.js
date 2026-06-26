const express = require('express');
const {
  uploadReport,
  getReports,
  getReportById,
  addConsultationNotes,
  verifyReportQR,
  chatWithReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, authorize('laboratory'), upload.single('pdf'), uploadReport);
router.get('/', protect, getReports);
router.get('/:id', protect, getReportById);
router.put('/:id/consultation', protect, authorize('doctor'), addConsultationNotes);
router.get('/verify/:token', verifyReportQR);
router.post('/:id/chat', protect, chatWithReport);

module.exports = router;
