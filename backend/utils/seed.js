const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');
const BloodReport = require('../models/BloodReport');
const AIAnalysis = require('../models/AIAnalysis');
const MedicalHistory = require('../models/MedicalHistory');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// Services & Utilities
const { analyzeReportData } = require('../services/localAIService');
const { generateVerificationQRCode } = require('../utils/qrGenerator');
const { generateBloodReportPDF } = require('../utils/pdfGenerator');

dotenv.config();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hemovault');

    // Clean Database
    console.log('Cleaning existing records...');
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Hospital.deleteMany();
    await Laboratory.deleteMany();
    await BloodReport.deleteMany();
    await AIAnalysis.deleteMany();
    await MedicalHistory.deleteMany();
    await Appointment.deleteMany();
    await Notification.deleteMany();

    // Clear local upload folder of seeded files
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      if (file.startsWith('report-') && file.endsWith('.pdf')) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    }
    console.log('Cleaned uploads folder.');

    // 1. Create Super Admin
    console.log('Creating Admin...');
    const adminUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'admin@hemovault.com',
      password: 'password123',
      role: 'super_admin',
      phone: '+1 (555) 019-2834',
      isVerified: true
    });

    // 2. Create Hospital
    console.log('Creating Hospital...');
    const hospital = await Hospital.create({
      name: 'Metro General Hospital',
      address: '100 Medical Plaza, New York, NY 10001',
      contactNumber: '+1 (555) 123-4567',
      email: 'info@metrogeneral.org',
      admin: adminUser._id
    });

    // 3. Create Doctors (Approved and Pending)
    console.log('Creating Doctors...');
    const doctorUserApproved = await User.create({
      name: 'Dr. Marcus Vance',
      email: 'doctor@hemovault.com',
      password: 'password123',
      role: 'doctor',
      phone: '+1 (555) 012-3456',
      isVerified: true
    });

    const docProfileApproved = await Doctor.create({
      user: doctorUserApproved._id,
      specialization: 'Cardiologist',
      licenseNumber: 'DOC-998877',
      hospital: hospital._id,
      isApproved: true
    });

    const doctorUserPending = await User.create({
      name: 'Dr. Clara Oswald',
      email: 'pending_doctor@hemovault.com',
      password: 'password123',
      role: 'doctor',
      phone: '+1 (555) 888-9999',
      isVerified: true
    });

    await Doctor.create({
      user: doctorUserPending._id,
      specialization: 'Endocrinologist',
      licenseNumber: 'DOC-554433',
      hospital: hospital._id,
      isApproved: false
    });

    // 4. Create Labs (Approved and Pending)
    console.log('Creating Laboratories...');
    const labUserApproved = await User.create({
      name: 'Apex Diagnostic Labs',
      email: 'lab@hemovault.com',
      password: 'password123',
      role: 'laboratory',
      phone: '+1 (555) 987-6543',
      isVerified: true
    });

    const labProfileApproved = await Laboratory.create({
      name: 'Apex Diagnostic Labs',
      licenseNumber: 'LAB-776655',
      address: '45 Blue Hill Ave, Boston, MA 02119',
      contactNumber: '+1 (555) 987-6543',
      email: 'boston@apexdiag.com',
      admin: labUserApproved._id,
      isApproved: true
    });

    const labUserPending = await User.create({
      name: 'BioQuest Labs',
      email: 'pending_lab@hemovault.com',
      password: 'password123',
      role: 'laboratory',
      phone: '+1 (555) 222-3333',
      isVerified: true
    });

    await Laboratory.create({
      name: 'BioQuest Labs',
      licenseNumber: 'LAB-221100',
      address: '78 Oak St, Chicago, IL 60611',
      contactNumber: '+1 (555) 222-3333',
      email: 'chicago@bioquest.com',
      admin: labUserPending._id,
      isApproved: false
    });

    // 5. Create Patient
    console.log('Creating Patient...');
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@hemovault.com',
      password: 'password123',
      role: 'patient',
      phone: '+1 (555) 456-7890',
      isVerified: true
    });

    const patientProfile = await Patient.create({
      user: patientUser._id,
      dateOfBirth: new Date('1988-06-15'),
      gender: 'Male',
      bloodGroup: 'O+',
      address: '742 Evergreen Terrace, Springfield, IL 62704',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 456-7891'
      },
      healthScore: 78 // Will be overwritten or calculated, seeding with 78
    });

    // Create Patient Medical History
    await MedicalHistory.create({
      patient: patientUser._id,
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Hypertension'],
      pastSurgeries: ['Appendectomy (2015)'],
      familyHistory: ['Father had Coronary Heart Disease', 'Mother has Type 2 Diabetes']
    });

    // 6. Create Historical Blood Reports
    console.log('Creating Seed Blood Reports...');

    // Report 1: Older report (1 month ago) - CBC
    const token1 = crypto.randomBytes(16).toString('hex');
    const qr1 = await generateVerificationQRCode(token1);
    
    const params1 = {
      hemoglobin: 11.2, // Low
      rbc: 3.8, // Low
      wbc: 6.2,
      platelets: 240,
      hematocrit: 34.0 // Low
    };

    const report1 = new BloodReport({
      patient: patientUser._id,
      laboratory: labUserApproved._id,
      doctor: doctorUserApproved._id,
      reportType: 'CBC',
      parameters: params1,
      verificationToken: token1,
      qrCodeUrl: qr1,
      status: 'approved',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      clinicalNotes: 'Patient complains of fatigue and mild shortness of breath. Prescribed iron supplements.',
      prescription: 'Ferrous Sulfate 325mg - 1 tablet daily with food. Retest CBC in 30 days.'
    });

    const aiRes1 = analyzeReportData(params1);
    const ai1 = await AIAnalysis.create({
      report: report1._id,
      summary: aiRes1.summary,
      abnormalValues: aiRes1.abnormalValues,
      healthTrends: 'This is the initial baseline test for CBC monitoring.',
      lifestyleSuggestions: aiRes1.lifestyleSuggestions,
      doctorSummary: aiRes1.doctorSummary
    });
    
    report1.aiAnalysis = ai1._id;
    const pdfFilename1 = `report-${report1._id}-seed1.pdf`;
    const pdfPath1 = path.join(uploadDir, pdfFilename1);
    await generateBloodReportPDF(report1, patientUser, labUserApproved, ai1, pdfPath1);
    report1.pdfUrl = `/uploads/${pdfFilename1}`;
    await report1.save();


    // Report 2: Recent report (3 days ago) - Lipid & Blood Sugar Combo (represented as Lipid Profile)
    const token2 = crypto.randomBytes(16).toString('hex');
    const qr2 = await generateVerificationQRCode(token2);
    
    const params2 = {
      cholesterol_total: 245, // High
      triglycerides: 185, // High
      hdl: 35, // Low
      ldl: 165, // High
      glucose_fasting: 112, // High (Pre-diabetic)
      hba1c: 6.1 // High (Pre-diabetic)
    };

    const report2 = new BloodReport({
      patient: patientUser._id,
      laboratory: labUserApproved._id,
      doctor: doctorUserApproved._id,
      reportType: 'Lipid Profile',
      parameters: params2,
      verificationToken: token2,
      qrCodeUrl: qr2,
      status: 'approved',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    });

    const aiRes2 = analyzeReportData(params2);
    
    // Set healthScore on patient profile based on latest report
    patientProfile.healthScore = aiRes2.healthScore;
    await patientProfile.save();

    const comparisonText = 'Comparing current Lipid Profile with previous indices reveals slight blood glucose elevations. Total Cholesterol increased by 10%. LDL increased by 15%. HDL remained low. Monitor dietary carbohydrate and saturated fat intake closely.';

    const ai2 = await AIAnalysis.create({
      report: report2._id,
      summary: aiRes2.summary,
      abnormalValues: aiRes2.abnormalValues,
      healthTrends: comparisonText,
      lifestyleSuggestions: aiRes2.lifestyleSuggestions,
      doctorSummary: aiRes2.doctorSummary
    });

    report2.aiAnalysis = ai2._id;
    const pdfFilename2 = `report-${report2._id}-seed2.pdf`;
    const pdfPath2 = path.join(uploadDir, pdfFilename2);
    await generateBloodReportPDF(report2, patientUser, labUserApproved, ai2, pdfPath2);
    report2.pdfUrl = `/uploads/${pdfFilename2}`;
    await report2.save();

    // 7. Seed Appointments
    console.log('Seeding Appointments...');
    await Appointment.create({
      patient: patientUser._id,
      doctor: doctorUserApproved._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      notes: 'Follow up on lipid profile results and review pre-diabetic symptoms.',
      status: 'scheduled'
    });

    // 8. Seed Notifications
    console.log('Seeding Notifications...');
    await Notification.create({
      recipient: patientUser._id,
      title: 'Blood Report Published',
      message: `Your Lipid Profile report from Apex Diagnostic Labs is ready. Health Score: ${aiRes2.healthScore}/100.`,
      type: 'report_ready'
    });

    await Notification.create({
      recipient: doctorUserApproved._id,
      title: 'New Patient Appointment',
      message: `John Doe has scheduled an appointment with you for next week.`,
      type: 'appointment'
    });

    console.log('Database Seeding Successful!');
    console.log('Credentials Summary:');
    console.log('- Super Admin: admin@hemovault.com / password123');
    console.log('- Approved Doctor: doctor@hemovault.com / password123');
    console.log('- Pending Doctor: pending_doctor@hemovault.com / password123');
    console.log('- Approved Lab: lab@hemovault.com / password123');
    console.log('- Pending Lab: pending_lab@hemovault.com / password123');
    console.log('- Patient: patient@hemovault.com / password123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
