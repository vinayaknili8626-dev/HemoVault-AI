const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const BloodReport = require('../models/BloodReport');
const Appointment = require('../models/Appointment');
const MedicalHistory = require('../models/MedicalHistory');

// @desc    Get doctor dashboard metadata
// @route   GET /api/doctors/dashboard
// @access  Private (Doctor only)
exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id }).populate('hospital');
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Patients count (unique patients who have reports assigned to this doctor or scheduled appointments)
    const uniquePatients = await BloodReport.distinct('patient', { doctor: req.user._id });
    
    // Scheduled appointments
    const appointments = await Appointment.find({ doctor: req.user._id, status: 'scheduled' })
      .populate('patient', 'name email phone')
      .sort('date')
      .limit(10);

    // Recent reports reviewed or created
    const recentReports = await BloodReport.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort('-date')
      .limit(5);

    res.status(200).json({
      success: true,
      profile: doctorProfile,
      stats: {
        patientsCount: uniquePatients.length,
        appointmentsCount: appointments.length
      },
      appointments,
      recentReports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search patients by name, email, or phone
// @route   GET /api/doctors/patients/search
// @access  Private (Doctor/Laboratory/Admin only)
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      // Return recent 10 patients
      const patients = await User.find({ role: 'patient' }).limit(10).select('name email phone');
      return res.status(200).json({ success: true, count: patients.length, patients });
    }

    // Find users with role 'patient' matching query
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      role: 'patient',
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    }).select('name email phone');

    // Get patients IDs and combine with profile healthScore
    const patientProfiles = await Patient.find({ user: { $in: users.map(u => u._id) } });

    const patients = users.map(user => {
      const profile = patientProfiles.find(p => p.user.toString() === user._id.toString());
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        healthScore: profile ? profile.healthScore : 100,
        bloodGroup: profile ? profile.bloodGroup : 'N/A'
      };
    });

    res.status(200).json({ success: true, count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient profile, medical history, and list of blood reports
// @route   GET /api/doctors/patients/:id
// @access  Private (Doctor/Laboratory/Admin only)
exports.getPatientDetails = async (req, res) => {
  try {
    const userPatient = await User.findById(req.params.id);
    if (!userPatient || userPatient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const profile = await Patient.findOne({ user: userPatient._id });
    
    let history = await MedicalHistory.findOne({ patient: userPatient._id });
    if (!history) {
      history = await MedicalHistory.create({
        patient: userPatient._id,
        allergies: [],
        chronicConditions: [],
        pastSurgeries: [],
        familyHistory: []
      });
    }

    const reports = await BloodReport.find({ patient: userPatient._id })
      .populate('laboratory', 'name')
      .populate('doctor', 'name')
      .populate('aiAnalysis')
      .sort('-date');

    res.status(200).json({
      success: true,
      patient: {
        id: userPatient._id,
        name: userPatient.name,
        email: userPatient.email,
        phone: userPatient.phone,
        dob: profile ? profile.dateOfBirth : null,
        gender: profile ? profile.gender : null,
        bloodGroup: profile ? profile.bloodGroup : null,
        address: profile ? profile.address : null,
        emergencyContact: profile ? profile.emergencyContact : null,
        healthScore: profile ? profile.healthScore : 100
      },
      history,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
