const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Laboratory = require('../models/Laboratory');
const BloodReport = require('../models/BloodReport');

// @desc    Get system statistics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const patientsCount = await User.countDocuments({ role: 'patient' });
    const doctorsCount = await User.countDocuments({ role: 'doctor' });
    const labsCount = await User.countDocuments({ role: 'laboratory' });
    const reportsCount = await BloodReport.countDocuments();

    // Pending approvals
    const pendingDoctors = await Doctor.countDocuments({ isApproved: false });
    const pendingLabs = await Laboratory.countDocuments({ isApproved: false });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        patientsCount,
        doctorsCount,
        labsCount,
        reportsCount,
        pendingApprovals: pendingDoctors + pendingLabs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend or activate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ success: true, message: `User account is now ${status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject doctor registration
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (Admin only)
exports.approveDoctor = async (req, res) => {
  try {
    const { approve } = req.body;
    // Find doctor by Doctor ID or User ID
    const doctor = await Doctor.findOne({
      $or: [{ _id: req.params.id }, { user: req.params.id }]
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.isApproved = approve;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor registration ${approve ? 'approved' : 'unapproved'}`,
      doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject laboratory registration
// @route   PUT /api/admin/labs/:id/approve
// @access  Private (Admin only)
exports.approveLab = async (req, res) => {
  try {
    const { approve } = req.body;
    // Find lab by Lab ID or Admin User ID
    const lab = await Laboratory.findOne({
      $or: [{ _id: req.params.id }, { admin: req.params.id }, { user: req.params.id }]
    });

    if (!lab) {
      return res.status(404).json({ success: false, message: 'Laboratory profile not found' });
    }

    lab.isApproved = approve;
    await lab.save();

    res.status(200).json({
      success: true,
      message: `Laboratory registration ${approve ? 'approved' : 'unapproved'}`,
      lab
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent system activities (Audit Logs)
// @route   GET /api/admin/logs
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    // Generate a set of recent events from the actual database
    const users = await User.find().sort('-createdAt').limit(10);
    const reports = await BloodReport.find().populate('patient', 'name').populate('laboratory', 'name').sort('-createdAt').limit(10);

    const logs = [];

    users.forEach(u => {
      logs.push({
        event: 'User Registration',
        message: `New ${u.role} registered: ${u.name} (${u.email})`,
        timestamp: u.createdAt,
        type: 'security'
      });
    });

    reports.forEach(r => {
      logs.push({
        event: 'Blood Report Published',
        message: `${r.reportType} report uploaded for patient ${r.patient ? r.patient.name : 'Unknown'} by ${r.laboratory ? r.laboratory.name : 'Unknown'}`,
        timestamp: r.createdAt,
        type: 'activity'
      });
    });

    // Sort combined logs by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ success: true, count: logs.length, logs: logs.slice(0, 15) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
