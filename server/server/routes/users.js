const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

router.post('/check-ip', async (req, res, next) => {
  try {
    const ip = req.body?.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    const user = await User.findOne({ ip });
    res.json({ success: true, exists: !!user, user: user || null });
  } catch (err) {
    next(err);
  }
});

router.post('/onboard', async (req, res, next) => {
  try {
    const { name, source, address, phone } = req.body;
    const ip = req.body?.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const existing = await User.findOne({ ip });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this IP already exists', user: existing });
    }

    const user = await User.create({ name: name.trim(), ip, source, address, phone });
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
