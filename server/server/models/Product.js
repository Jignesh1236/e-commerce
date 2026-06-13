const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  category: { type: String, required: true, trim: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0, min: 0 },
  deliveryTime: { type: String, default: '' },
  freeDelivery: { type: Boolean, default: false },
  description: { type: String, default: '' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
