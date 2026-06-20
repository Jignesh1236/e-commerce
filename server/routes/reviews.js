const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

router.get('/all', adminAuth, async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.get('/:productId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    if (!userId || !productId || !rating) {
      return res.status(400).json({ success: false, message: 'userId, productId, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const deliveredOrder = await Order.findOne({
      userId,
      status: 'Delivered',
      'items.productId': productId
    });

    if (!deliveredOrder) {
      return res.status(403).json({ success: false, message: 'You can only review products from delivered orders' });
    }

    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await Review.create({ userId, productId, orderId: deliveredOrder._id, rating: Number(rating), comment: comment || '' });
    await review.populate('userId', 'name');

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
