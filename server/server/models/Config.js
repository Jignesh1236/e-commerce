const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  storeName: { type: String, default: 'My Store' },
  tagline: { type: String, default: '' },
  logo: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  deliveryCharge: { type: Number, default: 0 },
  freeDeliveryAbove: { type: Number, default: 500 },
  storeTiming: {
    open: { type: String, default: '08:00 AM' },
    close: { type: String, default: '09:00 PM' },
    days: { type: String, default: 'Monday - Saturday' }
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' }
  },
  aboutUs: { type: String, default: '' },
  contactInfo: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
