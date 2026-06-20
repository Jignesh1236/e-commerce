const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ip: { type: String, required: true, unique: true },
  source: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  pushSubscription: { type: Object, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
