const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const BloodReport = require('../models/BloodReport');
const User = require('../models/User');
const Patient = require('../models/Patient');
const AIAnalysis = require('../models/AIAnalysis');
const Notification = require('../models/Notification');
const { parsePdfReport } = require('../services/ocrService');
const { analyzeReportData, handleChatQuery } = require('../services/localAIService');
const { generateVerificationQRCode } = require('../utils/qrGenerator');
const { generateBloodReportPDF } = require('../utils/pdfGenerator');

// @desc    Upload & create a blood report (PDF OCR or Manual Form)
// @route   POST /api/reports/upload
// @access  Private (Laboratory only)
exports.uploadReport = async (req, res) => {
  try {
    let { patientEmail, reportType, parameters, patientId } = req.body;
    let finalParameters = {};

    // 1. Find Patient
    let patientUser;
    if (patientEmail) {
      patientUser = await User.findOne({ email: patientEmail.toLowerCase(), role: 'patient' });
    } else if (patientId) {
      patientUser = await User.findById(patientId);
    }

    if (!patientUser) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // 2. Parse parameters (either from uploaded PDF OCR or direct JSON input)
    let ocrSummaryText = '';
    if (req.file) {
      // PDF file uploaded - Run OCR text parsing
      const pdfBuffer = fs.readFileSync(req.file.path);
      const ocrResult = await parsePdfReport(pdfBuffer);
      
      if (!ocrResult.success) {
        return res.status(400).json({ success: false, message: `Failed to parse PDF: ${ocrResult.error}` });
      }
      
      finalParameters = ocrResult.parameters;
      reportType = ocrResult.reportType;
      ocrSummaryText = ocrResult.rawTextSummary;
    } else {
      // Direct form upload
      if (typeof parameters === 'string') {
        finalParameters = JSON.parse(parameters);
      } else {
        finalParameters = parameters;
      }
    }

    if (!finalParameters || Object.keys(finalParameters).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No blood parameters found. For OCR, ensure the PDF contains clear, standard blood test terms. Otherwise, enter parameters manually.'
      });
    }

    // Convert parameter values to numbers
    const cleanParameters = {};
    for (const [k, v] of Object.entries(finalParameters)) {
      cleanParameters[k.toLowerCase()] = Number(v);
    }

    // 3. Generate verification credentials
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const qrCodeUrl = await generateVerificationQRCode(verificationToken);

    // 4. Create base report
    const report = new BloodReport({
      patient: patientUser._id,
      laboratory: req.user._id,
      reportType,
      parameters: cleanParameters,
      verificationToken,
      qrCodeUrl,
      status: 'pending' // Lab uploads must be approved or finalized
    });

    // 5. Run Offline AI Analysis
    const aiResults = analyzeReportData(cleanParameters);
    const aiAnalysis = await AIAnalysis.create({
      report: report._id,
      summary: aiResults.summary,
      abnormalValues: aiResults.abnormalValues,
      healthTrends: 'Analyzing historical charts...',
      lifestyleSuggestions: aiResults.lifestyleSuggestions,
      doctorSummary: aiResults.doctorSummary
    });

    // Link AI analysis back
    report.aiAnalysis = aiAnalysis._id;

    // 6. Generate and save compiled digital report PDF
    const uniquePdfFilename = `report-${report._id}-${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, '../uploads', uniquePdfFilename);
    
    // We pass Patient user object, Laboratory user object, AI details
    await generateBloodReportPDF(report, patientUser, req.user, aiAnalysis, pdfPath);
    report.pdfUrl = `/uploads/${uniquePdfFilename}`;
    
    // Automatically approve if lab role is authorized to publish directly
    report.status = 'approved';
    await report.save();

    // 7. Calculate Health Score and update Patient
    const patientProfile = await Patient.findOne({ user: patientUser._id });
    if (patientProfile) {
      patientProfile.healthScore = aiResults.healthScore;
      await patientProfile.save();
    }

    // 8. Create In-App Notification for Patient
    await Notification.create({
      recipient: patientUser._id,
      title: 'New Blood Report Ready',
      message: `Your ${reportType} report uploaded by ${req.user.name} has been processed. Health Score: ${aiResults.healthScore}/100.`,
      type: 'report_ready'
    });

    res.status(201).json({
      success: true,
      message: 'Blood report successfully created and analyzed.',
      report,
      aiAnalysis,
      ocrProcessedText: ocrSummaryText ? 'OCR extraction complete' : 'Manual form entry used'
    });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reports list based on logged in user's role
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Doctors can view reports where they are assigned, or search all patients (doctor controller manages patient search)
      // Here by default return all reports where doctor is assigned or all approved reports
      query = {
        $or: [
          { doctor: req.user._id },
          { status: 'approved' } // Can view general public reports for patients who allow it
        ]
      };
    } else if (req.user.role === 'laboratory') {
      query.laboratory = req.user._id;
    }

    const reports = await BloodReport.find(query)
      .populate('patient', 'name email phone')
      .populate('laboratory', 'name email')
      .populate('doctor', 'name specialization')
      .populate('aiAnalysis')
      .sort('-date');

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single report details
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await BloodReport.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('laboratory', 'name email')
      .populate('doctor', 'name specialization')
      .populate('aiAnalysis');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Role authentication: Patients can only view their own reports
    if (req.user.role === 'patient' && report.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add clinical notes and prescription (Doctors only)
// @route   PUT /api/reports/:id/consultation
// @access  Private (Doctor only)
exports.addConsultationNotes = async (req, res) => {
  try {
    const { clinicalNotes, prescription } = req.body;

    const report = await BloodReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.doctor = req.user._id;
    report.clinicalNotes = clinicalNotes;
    report.prescription = prescription;

    // Regene PDF to include doctor notes
    const patientUser = await User.findById(report.patient);
    const labUser = await User.findById(report.laboratory);
    const aiAnalysis = await AIAnalysis.findById(report.aiAnalysis);

    const pdfPath = path.join(__dirname, '..', report.pdfUrl);
    await generateBloodReportPDF(report, patientUser, labUser, aiAnalysis, pdfPath);

    await report.save();

    // Notify patient
    await Notification.create({
      recipient: report.patient,
      title: 'Doctor Appended Notes',
      message: `Dr. ${req.user.name} has added clinical notes/prescription to your ${report.reportType} report.`,
      type: 'appointment'
    });

    res.status(200).json({
      success: true,
      message: 'Consultation notes and prescription added successfully.',
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Public verification of report validity via token (QR Code destination)
// @route   GET /api/reports/verify/:token
// @access  Public
exports.verifyReportQR = async (req, res) => {
  try {
    const report = await BloodReport.findOne({ verificationToken: req.params.token })
      .populate('patient', 'name')
      .populate('laboratory', 'name licenseNumber')
      .populate('doctor', 'name specialization');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Verification Token. This report could not be authenticated on HemoVault AI registry.'
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      message: 'Report authenticity verified in HemoVault AI Ledger.',
      report: {
        id: report._id,
        patientName: report.patient.name,
        laboratoryName: report.laboratory.name,
        labLicense: report.laboratory.licenseNumber,
        reportType: report.reportType,
        date: report.date,
        parameters: report.parameters,
        status: report.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Chatbot assistant discussion router
// @route   POST /api/reports/:id/chat
// @access  Private (Patient/Doctor only)
exports.chatWithReport = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const report = await BloodReport.findById(req.params.id).populate('aiAnalysis');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report context not found' });
    }

    // Setup context for local chatbot engine
    const reportContext = {
      parameters: report.parameters,
      healthScore: report.aiAnalysis ? await getPatientHealthScore(report.patient) : 100,
      abnormalValues: report.aiAnalysis ? report.aiAnalysis.abnormalValues : [],
      lifestyleSuggestions: report.aiAnalysis ? report.aiAnalysis.lifestyleSuggestions : []
    };

    const reply = handleChatQuery(reportContext, message);

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to resolve patient score
async function getPatientHealthScore(patientId) {
  const patient = await Patient.findOne({ user: patientId });
  return patient ? patient.healthScore : 100;
}
