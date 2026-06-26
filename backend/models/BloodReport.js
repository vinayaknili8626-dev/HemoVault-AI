const mongoose = require('mongoose');

const BloodReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportType: {
      type: String,
      required: true,
      enum: [
        'CBC',
        'Blood Sugar',
        'Lipid Profile',
        'Thyroid',
        'Liver Function',
        'Kidney Function',
        'Vitamin Tests',
        'Iron Studies',
        'Urine Reports',
        'Custom',
      ],
    },
    parameters: {
      type: Map,
      of: Number,
      required: true,
    },
    pdfUrl: {
      type: String,
    },
    qrCodeUrl: {
      type: String,
    },
    verificationToken: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIAnalysis',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    clinicalNotes: {
      type: String,
    },
    prescription: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodReport', BloodReportSchema);
