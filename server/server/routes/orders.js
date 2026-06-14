const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const { sendPushNotification, getStatusNotificationPayload } = require('../helpers/webpush');

router.post('/', async (req, res, next) => {
  try {
    const { userId, items, totalAmount, deliveryCharge, address } = req.body;

    if (!userId || !items || !items.length || !totalAmount || !address) {
      return res.status(400).json({ success: false, message: 'userId, items, totalAmount, and address are required' });
    }

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      deliveryCharge: deliveryCharge || 0,
      address,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', timestamp: new Date() }]
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate('userId', 'name phone'),
      Order.countDocuments(filter)
    ]);

    res.json({ success: true, orders, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });
    await order.save();

    const user = await User.findById(order.userId);
    if (user && user.pushSubscription) {
      const payload = getStatusNotificationPayload(status, order._id.toString());
      await sendPushNotification(user.pushSubscription, payload);
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
