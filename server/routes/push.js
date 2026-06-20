const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/vapid-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ success: false, message: 'Push notifications not configured' });
  res.json({ success: true, publicKey: key });
});

router.post('/subscribe', async (req, res, next) => {
  try {
    const { userId, subscription } = req.body;
    if (!userId || !subscription) {
      return res.status(400).json({ success: false, message: 'userId and subscription are required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { pushSubscription: subscription },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Push subscription saved' });
  } catch (err) {
    next(err);
  }
});

router.delete('/unsubscribe', async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    await User.findByIdAndUpdate(userId, { pushSubscription: null });
    res.json({ success: true, message: 'Push subscription removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
