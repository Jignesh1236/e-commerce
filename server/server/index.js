require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { initWebPush } = require('./helpers/webpush');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/config', require('./routes/config'));
app.use('/api/push', require('./routes/push'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Store API is running', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not set.');
  console.error('Please copy .env.example to .env and fill in your credentials.');
  process.exit(1);
}

async function seedAdmin() {
  const Admin = require('./models/Admin');
  const pinHash = process.env.ADMIN_PIN_HASH;
  const email = process.env.ADMIN_RECOVERY_EMAIL || 'admin@store.com';
  if (!pinHash) return;
  const existing = await Admin.findOne();
  if (!existing) {
    await Admin.create({ pin: pinHash, recoveryEmail: email });
    console.log('Admin account seeded from ADMIN_PIN_HASH');
  }
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    await seedAdmin();
    initWebPush();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
