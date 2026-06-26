const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    allergies: [
      {
        type: String,
      },
    ],
    chronicConditions: [
      {
        type: String,
      },
    ],
    pastSurgeries: [
      {
        type: String,
      },
    ],
    familyHistory: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalHistory', MedicalHistorySchema);
