const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a hospital name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please add a hospital address'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', HospitalSchema);
