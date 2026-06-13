const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const adminAuth = require('../middleware/adminAuth');

router.get('/', async (req, res, next) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
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

module.exports = router;
