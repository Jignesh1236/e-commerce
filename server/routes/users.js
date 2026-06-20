const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

function getIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
}

router.post('/check-ip', async (req, res, next) => {
  try {
    const ip = getIP(req);
    const user = await User.findOne({ ip });
    res.json({ success: true, exists: !!user, user: user || null });
  } catch (err) {
    next(err);
  }
});

router.post('/login-by-name-phone', async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this phone number' });
    }

    const nameMatch = user.name.toLowerCase().trim() === name.toLowerCase().trim();
    if (!nameMatch) {
      return res.status(401).json({ success: false, message: 'Name does not match our records' });
    }

    const ip = getIP(req);
    user.ip = ip;
    await user.save();

    res.json({ success: true, user, message: 'Logged in successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/onboard', async (req, res, next) => {
  try {
    const { name, source, address, phone } = req.body;
    const ip = getIP(req);

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const existingByIP = await User.findOne({ ip });
    if (existingByIP) {
      return res.status(409).json({ success: false, message: 'User with this IP already exists', user: existingByIP });
    }

    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        const existingByPhone = await User.findOne({ phone: cleanPhone });
        if (existingByPhone) {
          const nameMatch = existingByPhone.name.toLowerCase().trim() === name.toLowerCase().trim();
          if (nameMatch) {
            existingByPhone.ip = ip;
            await existingByPhone.save();
            return res.json({ success: true, user: existingByPhone, recovered: true });
          }
        }
      }
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
    const user = await User.create({
      name: name.trim(),
      ip,
      source,
      address,
      phone: cleanPhone || undefined,
    });
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, address, requestIp } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const callerIp = getIP(req);
    const isOwner = user.ip && user.ip === callerIp;
    const isAdmin = (() => {
      try {
        const jwt = require('jsonwebtoken');
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
        return true;
      } catch { return false; }
    })();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const update = {};
    if (name && name.trim()) update.name = name.trim();
    if (phone !== undefined) {
      const clean = String(phone).replace(/\D/g, '').slice(-10);
      update.phone = clean || '';
    }
    if (address !== undefined) update.address = address;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    res.json({ success: true, user: updated });
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
