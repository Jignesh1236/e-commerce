const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  pin: { type: String, required: true },
  recoveryEmail: { type: String, required: true },
  otpHash: { type: String, default: null },
  otpExpiry: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
