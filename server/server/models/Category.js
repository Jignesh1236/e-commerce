const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  showInHero: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
