const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create/Schedule an appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, notes } = req.body;

    const doctorUser = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctorUser) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      notes
    });

    // Notify doctor
    await Notification.create({
      recipient: doctorId,
      title: 'New Appointment Scheduled',
      message: `Patient ${req.user.name} has scheduled a consultation for ${new Date(date).toLocaleString()}.`,
      type: 'appointment'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment successfully scheduled',
      appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments list
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort('date');

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (Cancel / Complete)
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Auth check: Patient or Doctor of the appointment only
    if (
      appointment.patient.toString() !== req.user._id.toString() &&
      appointment.doctor.toString() !== req.user._id.toString() &&
      req.user.role !== 'super_admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    // Send notifications
    const isDoctor = req.user.role === 'doctor';
    const notifyRecipient = isDoctor ? appointment.patient : appointment.doctor;
    const notifyName = req.user.name;

    await Notification.create({
      recipient: notifyRecipient,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your appointment scheduled for ${new Date(appointment.date).toLocaleString()} has been ${status} by ${notifyName}.`,
      type: 'appointment'
    });

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
