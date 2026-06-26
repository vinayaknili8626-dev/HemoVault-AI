const mongoose = require('mongoose');

const LaboratorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a laboratory name'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please add a laboratory license number'],
      unique: true,
    },
    address: {
      type: String,
      required: [true, 'Please add a laboratory address'],
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
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Laboratory', LaboratorySchema);
