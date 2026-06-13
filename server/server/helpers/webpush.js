const webpush = require('web-push');

const initWebPush = () => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not set — push notifications disabled');
    return;
  }
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO || 'mailto:admin@store.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
};

const sendPushNotification = async (subscription, payload) => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  if (!subscription) return;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log('Push subscription expired/invalid — should remove from DB');
    } else {
      console.error('Push notification error:', err.message);
    }
  }
};

const getStatusNotificationPayload = (status, orderId) => {
  const messages = {
    Confirmed: {
      title: 'Order Confirmed! ✅',
      body: 'Your order has been confirmed. We will prepare it shortly.'
    },
    'Out for Delivery': {
      title: 'Out for Delivery! 🚚',
      body: 'Your order is on the way. Please be available.'
    },
    Delivered: {
      title: 'Order Delivered! 🎉',
      body: 'Your order has been delivered. Tap to leave a review!'
    },
    Cancelled: {
      title: 'Order Cancelled ❌',
      body: 'Your order has been cancelled. Contact us for help.'
    }
  };
  const msg = messages[status] || { title: 'Order Update', body: `Status: ${status}` };
  return { ...msg, orderId, url: '/orders' };
};

module.exports = { initWebPush, sendPushNotification, getStatusNotificationPayload };
