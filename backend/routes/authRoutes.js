const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/verify/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;
