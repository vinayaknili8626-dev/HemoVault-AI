const Patient = require('../models/Patient');
const User = require('../models/User');
const BloodReport = require('../models/BloodReport');
const Notification = require('../models/Notification');
const MedicalHistory = require('../models/MedicalHistory');

// @desc    Get dashboard statistics for a patient
// @route   GET /api/patients/dashboard
// @access  Private (Patient only)
exports.getPatientDashboardStats = async (req, res) => {
  try {
    const patientProfile = await Patient.findOne({ user: req.user._id });
    if (!patientProfile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const reportsCount = await BloodReport.countDocuments({ patient: req.user._id });
    const recentReports = await BloodReport.find({ patient: req.user._id })
      .populate('laboratory', 'name')
      .populate('doctor', 'name')
      .sort('-date')
      .limit(5);

    const recentNotifications = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        healthScore: patientProfile.healthScore,
        reportsCount,
        bloodGroup: patientProfile.bloodGroup,
        gender: patientProfile.gender
      },
      recentReports,
      recentNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get parameter trends over time for charts
// @route   GET /api/patients/trends
// @access  Private (Patient/Doctor only)
exports.getPatientReportTrends = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user._id;

    // Fetch patient's approved reports sorted chronologically
    const reports = await BloodReport.find({ patient: patientId, status: 'approved' })
      .sort('date')
      .select('date parameters reportType');

    // Aggregate trends for common markers
    const trends = {
      hemoglobin: [],
      glucose_fasting: [],
      ldl: [],
      hdl: [],
      tsh: []
    };

    reports.forEach(report => {
      const dateStr = new Date(report.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      
      if (report.parameters) {
        if (report.parameters.get('hemoglobin') !== undefined) {
          trends.hemoglobin.push({ date: dateStr, value: report.parameters.get('hemoglobin') });
        }
        if (report.parameters.get('glucose_fasting') !== undefined) {
          trends.glucose_fasting.push({ date: dateStr, value: report.parameters.get('glucose_fasting') });
        }
        if (report.parameters.get('ldl') !== undefined) {
          trends.ldl.push({ date: dateStr, value: report.parameters.get('ldl') });
        }
        if (report.parameters.get('hdl') !== undefined) {
          trends.hdl.push({ date: dateStr, value: report.parameters.get('hdl') });
        }
        if (report.parameters.get('tsh') !== undefined) {
          trends.tsh.push({ date: dateStr, value: report.parameters.get('tsh') });
        }
      }
    });

    res.status(200).json({
      success: true,
      trends
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get/Update patient medical history
// @route   GET /api/patients/history
// @access  Private (Patient/Doctor only)
exports.getMedicalHistory = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user._id;
    let history = await MedicalHistory.findOne({ patient: patientId });
    
    if (!history) {
      history = await MedicalHistory.create({
        patient: patientId,
        allergies: [],
        chronicConditions: [],
        pastSurgeries: [],
        familyHistory: []
      });
    }

    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update medical history
// @route   PUT /api/patients/history
// @access  Private (Patient/Doctor only)
exports.updateMedicalHistory = async (req, res) => {
  try {
    const patientId = req.body.patientId || req.user._id;
    const { allergies, chronicConditions, pastSurgeries, familyHistory } = req.body;

    let history = await MedicalHistory.findOne({ patient: patientId });

    if (!history) {
      history = new MedicalHistory({ patient: patientId });
    }

    if (allergies) history.allergies = allergies;
    if (chronicConditions) history.chronicConditions = chronicConditions;
    if (pastSurgeries) history.pastSurgeries = pastSurgeries;
    if (familyHistory) history.familyHistory = familyHistory;

    await history.save();

    res.status(200).json({ success: true, message: 'Medical history updated', history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile info
// @route   PUT /api/patients/profile
// @access  Private (Patient only)
exports.updatePatientProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    const patient = await Patient.findOne({ user: req.user._id });
    if (patient) {
      if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
      if (gender) patient.gender = gender;
      if (bloodGroup) patient.bloodGroup = bloodGroup;
      if (address) patient.address = address;
      if (emergencyContact) patient.emergencyContact = emergencyContact;
      await patient.save();
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', user, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
