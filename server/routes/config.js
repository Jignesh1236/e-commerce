const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const adminAuth = require('../middleware/adminAuth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../helpers/cloudinary');

router.get('/', async (req, res, next) => {
  try {
    let config = await Config.findOne();
    if (!config) config = await Config.create({});
    res.json({ success: true, config });
  } catch (err) {
    next(err);
  }
});

router.put('/', adminAuth, async (req, res, next) => {
  try {
    const config = await Config.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, config });
  } catch (err) {
    next(err);
  }
});

router.post('/logo', adminAuth, upload.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const existing = await Config.findOne();
    if (existing?.logo) {
      await deleteFromCloudinary(existing.logo).catch(() => {});
    }

    const logoUrl = await uploadToCloudinary(req.file.buffer, 'store/branding');
    const config = await Config.findOneAndUpdate(
      {},
      { $set: { logo: logoUrl } },
      { new: true, upsert: true }
    );
    res.json({ success: true, logo: logoUrl, config });
  } catch (err) {
    next(err);
  }
});

router.delete('/logo', adminAuth, async (req, res, next) => {
  try {
    const existing = await Config.findOne();
    if (existing?.logo) {
      await deleteFromCloudinary(existing.logo).catch(() => {});
    }
    const config = await Config.findOneAndUpdate(
      {},
      { $set: { logo: '' } },
      { new: true, upsert: true }
    );
    res.json({ success: true, config });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
