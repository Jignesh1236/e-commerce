const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const adminAuth = require('../middleware/adminAuth');

router.get('/', async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { active: true };
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { name, icon, order, active } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const category = await Category.create({
      name: name.trim(),
      icon: icon || '',
      order: Number(order) || 0,
      active: active !== false && active !== 'false'
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const { name, icon, order, active } = req.body;

    if (name !== undefined) category.name = name.trim();
    if (icon !== undefined) category.icon = icon;
    if (order !== undefined) category.order = Number(order);
    if (active !== undefined) category.active = active === true || active === 'true';

    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
