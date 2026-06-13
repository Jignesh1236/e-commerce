const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const adminAuth = require('../middleware/adminAuth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../helpers/cloudinary');

router.get('/', async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { active: true };
    const banners = await Banner.find(filter).sort({ order: 1 });
    res.json({ success: true, banners });
  } catch (err) {
    next(err);
  }
});

router.post('/', adminAuth, upload.single('image'), async (req, res, next) => {
  try {
    const { title, link, order, active } = req.body;

    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'store/banners');

    const banner = await Banner.create({
      imageUrl,
      title: title || '',
      link: link || '',
      order: Number(order) || 0,
      active: active !== 'false' && active !== false
    });

    res.status(201).json({ success: true, banner });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', adminAuth, upload.single('image'), async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    const { title, link, order, active } = req.body;

    if (title !== undefined) banner.title = title;
    if (link !== undefined) banner.link = link;
    if (order !== undefined) banner.order = Number(order);
    if (active !== undefined) banner.active = active === 'true' || active === true;

    if (req.file) {
      await deleteFromCloudinary(banner.imageUrl);
      banner.imageUrl = await uploadToCloudinary(req.file.buffer, 'store/banners');
    }

    await banner.save();
    res.json({ success: true, banner });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    await deleteFromCloudinary(banner.imageUrl);
    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
