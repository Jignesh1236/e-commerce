const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

router.get('/:userId', async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate('productIds');
    if (!wishlist) return res.json({ success: true, wishlist: { userId: req.params.userId, productIds: [] } });
    res.json({ success: true, wishlist });
  } catch (err) {
    next(err);
  }
});

router.post('/add', async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'userId and productId are required' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, productIds: [productId] });
    } else {
      if (!wishlist.productIds.map(id => id.toString()).includes(productId)) {
        wishlist.productIds.push(productId);
        await wishlist.save();
      }
    }

    res.json({ success: true, wishlist });
  } catch (err) {
    next(err);
  }
});

router.delete('/remove', async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'userId and productId are required' });
    }

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });

    wishlist.productIds = wishlist.productIds.filter(id => id.toString() !== productId);
    await wishlist.save();
    res.json({ success: true, wishlist });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
