const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');

const getTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ success: false, message: 'PIN is required' });

    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not configured' });

    const isMatch = await bcrypt.compare(String(pin), admin.pin);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid PIN' });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-pin', async (req, res, next) => {
  try {
    const { action, otp, newPin } = req.body;

    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not configured' });

    if (action === 'request') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await bcrypt.hash(otpCode, 10);
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

      admin.otpHash = otpHash;
      admin.otpExpiry = otpExpiry;
      await admin.save();

      const transporter = getTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: admin.recoveryEmail,
        subject: 'Admin PIN Reset OTP',
        text: `Your OTP for PIN reset is: ${otpCode}\n\nThis OTP expires in 15 minutes.\n\nIf you did not request this, ignore this email.`,
        html: `<p>Your OTP for PIN reset is: <strong>${otpCode}</strong></p><p>This OTP expires in 15 minutes.</p><p>If you did not request this, ignore this email.</p>`
      });

      return res.json({ success: true, message: 'OTP sent to recovery email' });
    }

    if (action === 'verify') {
      if (!otp || !newPin) {
        return res.status(400).json({ success: false, message: 'OTP and new PIN are required' });
      }

      if (!admin.otpHash || !admin.otpExpiry) {
        return res.status(400).json({ success: false, message: 'No OTP requested. Please request OTP first.' });
      }

      if (new Date() > admin.otpExpiry) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }

      const otpMatch = await bcrypt.compare(String(otp), admin.otpHash);
      if (!otpMatch) return res.status(401).json({ success: false, message: 'Invalid OTP' });

      const hashedPin = await bcrypt.hash(String(newPin), 10);
      admin.pin = hashedPin;
      admin.otpHash = null;
      admin.otpExpiry = null;
      await admin.save();

      return res.json({ success: true, message: 'PIN updated successfully' });
    }

    res.status(400).json({ success: false, message: 'Invalid action. Use "request" or "verify".' });
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', adminAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const LOW_STOCK_THRESHOLD = 10;

    const [
      totalOrders,
      allOrders,
      newUsersToday,
      newUsersThisWeek,
      lowStockProducts,
      topSellingRaw
    ] = await Promise.all([
      Order.countDocuments(),
      Order.find({ status: { $ne: 'Cancelled' } }, { totalAmount: 1, items: 1 }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }, { name: 1, stock: 1, category: 1 }).sort({ stock: 1 }).limit(10),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            totalQty: { $sum: '$items.qty' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
          }
        },
        { $sort: { totalQty: -1 } },
        { $limit: 10 }
      ])
    ]);

    const totalSales = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      success: true,
      dashboard: {
        totalSales,
        totalOrders,
        newUsersToday,
        newUsersThisWeek,
        lowStockProducts,
        topSellingProducts: topSellingRaw
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/export/orders', adminAuth, async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
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

    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('userId', 'name phone');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order ID', key: 'id', width: 28 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'Pincode', key: 'pincode', width: 10 },
      { header: 'Items', key: 'items', width: 50 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Delivery Charge', key: 'deliveryCharge', width: 15 },
      { header: 'Status', key: 'status', width: 18 }
    ];

    sheet.getRow(1).font = { bold: true };

    orders.forEach(order => {
      const itemsStr = order.items.map(i => `${i.name} x${i.qty} @₹${i.price}`).join(', ');
      sheet.addRow({
        id: order._id.toString(),
        date: order.createdAt.toLocaleString('en-IN'),
        customerName: order.address?.name || (order.userId?.name || ''),
        phone: order.address?.phone || (order.userId?.phone || ''),
        address: `${order.address?.fullAddress || ''} ${order.address?.landmark || ''}`.trim(),
        pincode: order.address?.pincode || '',
        items: itemsStr,
        totalAmount: order.totalAmount,
        deliveryCharge: order.deliveryCharge || 0,
        status: order.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
