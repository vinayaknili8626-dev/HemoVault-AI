const crypto = require('crypto');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Laboratory = require('../models/Laboratory');
const MedicalHistory = require('../models/MedicalHistory');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, ...extraDetails } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create verification token (since offline, we will return it in the response for demo purposes)
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      verificationToken
    });

    // Create profile based on role
    if (role === 'patient') {
      await Patient.create({
        user: user._id,
        dateOfBirth: extraDetails.dateOfBirth,
        gender: extraDetails.gender,
        bloodGroup: extraDetails.bloodGroup,
        address: extraDetails.address,
        emergencyContact: extraDetails.emergencyContact
      });
      
      // Seed an empty medical history record
      await MedicalHistory.create({
        patient: user._id,
        allergies: [],
        chronicConditions: [],
        pastSurgeries: [],
        familyHistory: []
      });
    } else if (role === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialization: extraDetails.specialization || 'General Physician',
        licenseNumber: extraDetails.licenseNumber || `LIC-${Date.now()}`,
        isApproved: false // Admin must approve doctors
      });
    } else if (role === 'laboratory') {
      await Laboratory.create({
        user: user._id,
        licenseNumber: extraDetails.licenseNumber || `LAB-${Date.now()}`,
        address: extraDetails.address || 'Standard Address',
        contactNumber: phone,
        email: email,
        isApproved: false // Admin must approve labs
      });
    }

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      verificationToken, // Returned so offline users can verify easily
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify approval for doctor/laboratory
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor && !doctor.isApproved) {
        return res.status(403).json({ success: false, message: 'Your doctor profile is pending administrator approval.', pendingApproval: true });
      }
    } else if (user.role === 'laboratory') {
      const lab = await Laboratory.findOne({ admin: user._id });
      // Note: seed scripts might map laboratory user._id directly or through Laboratory admin. We check both.
      const labByAdmin = lab || await Laboratory.findOne({ user: user._id });
      if (labByAdmin && !labByAdmin.isApproved) {
        return res.status(403).json({ success: false, message: 'Your laboratory profile is pending administrator approval.', pendingApproval: true });
      }
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let details = {};

    if (user.role === 'patient') {
      details = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      details = await Doctor.findOne({ user: user._id }).populate('hospital');
    } else if (user.role === 'laboratory') {
      details = await Laboratory.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      details
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Since offline, we return the resetToken directly in response so user can test password reset
    res.status(200).json({
      success: true,
      message: 'Reset token generated (returned in payload for offline use)',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Hash token from param to match stored hash
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully reset'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
