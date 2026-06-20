const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.get('/:userId', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart) return res.json({ success: true, cart: { userId: req.params.userId, items: [] } });
    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
});

router.post('/add', async (req, res, next) => {
  try {
    const { userId, productId, qty = 1 } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'userId and productId are required' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [{ productId, qty }] });
    } else {
      const existing = cart.items.find(i => i.productId.toString() === productId);
      if (existing) {
        existing.qty += Number(qty);
      } else {
        cart.items.push({ productId, qty: Number(qty) });
      }
      await cart.save();
    }

    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
});

router.put('/update', async (req, res, next) => {
  try {
    const { userId, productId, qty } = req.body;
    if (!userId || !productId || qty === undefined) {
      return res.status(400).json({ success: false, message: 'userId, productId, and qty are required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (Number(qty) <= 0) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      item.qty = Number(qty);
    }

    await cart.save();
    res.json({ success: true, cart });
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

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
