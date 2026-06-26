const mongoose = require('mongoose');

const AIAnalysisSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodReport',
      required: true,
      unique: true,
    },
    summary: {
      type: String,
      required: true,
    },
    abnormalValues: [
      {
        parameter: { type: String, required: true },
        value: { type: Number, required: true },
        referenceRange: { type: String, required: true },
        status: { type: String, enum: ['Low', 'High', 'Critical'], required: true },
        explanation: { type: String },
      },
    ],
    healthTrends: {
      type: String,
    },
    lifestyleSuggestions: [
      {
        type: String,
      },
    ],
    doctorSummary: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAnalysis', AIAnalysisSchema);
