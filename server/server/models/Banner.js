const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, default: '' },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  objectPosition: { type: String, default: '50% 50%' }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
