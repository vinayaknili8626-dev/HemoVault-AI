const Laboratory = require('../models/Laboratory');
const Doctor = require('../models/Doctor');
const BloodReport = require('../models/BloodReport');
const User = require('../models/User');

// @desc    Get laboratory dashboard metadata
// @route   GET /api/labs/dashboard
// @access  Private (Laboratory only)
exports.getLabDashboard = async (req, res) => {
  try {
    const labProfile = await Laboratory.findOne({ user: req.user._id });
    const labUserId = req.user._id;

    const totalUploaded = await BloodReport.countDocuments({ laboratory: labUserId });
    const pendingCount = await BloodReport.countDocuments({ laboratory: labUserId, status: 'pending' });
    const approvedCount = await BloodReport.countDocuments({ laboratory: labUserId, status: 'approved' });

    const recentReports = await BloodReport.find({ laboratory: labUserId })
      .populate('patient', 'name email')
      .sort('-date')
      .limit(5);

    res.status(200).json({
      success: true,
      profile: labProfile,
      stats: {
        totalUploaded,
        pendingCount,
        approvedCount
      },
      recentReports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all approved laboratories (Hospital/Lab Directory)
// @route   GET /api/labs/directory
// @access  Public
exports.getApprovedLabs = async (req, res) => {
  try {
    const labs = await Laboratory.find({ isApproved: true }).populate('admin', 'name email phone');
    res.status(200).json({ success: true, count: labs.length, labs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all approved doctors (Doctor Directory)
// @route   GET /api/labs/doctors
// @access  Public
exports.getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: true })
      .populate('user', 'name email phone')
      .populate('hospital', 'name');
      
    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
