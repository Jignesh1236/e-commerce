const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../helpers/cloudinary');

router.get('/featured', async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true, stock: { $gt: 0 } }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'top_rated') sortOption = { rating: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.post('/', adminAuth, upload.array('images', 10), async (req, res, next) => {
  try {
    const { name, price, discountPercent, category, stock, deliveryTime, freeDelivery, description, featured } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'name, price, and category are required' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, 'store/products')));
    }

    const product = await Product.create({
      name,
      price: Number(price),
      discountPercent: Number(discountPercent) || 0,
      category,
      images: imageUrls,
      stock: Number(stock) || 0,
      deliveryTime: deliveryTime || '',
      freeDelivery: freeDelivery === 'true' || freeDelivery === true,
      description: description || '',
      featured: featured === 'true' || featured === true
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', adminAuth, upload.array('images', 10), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, price, discountPercent, category, stock, deliveryTime, freeDelivery, description, featured, removeImages } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (discountPercent !== undefined) product.discountPercent = Number(discountPercent);
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (deliveryTime !== undefined) product.deliveryTime = deliveryTime;
    if (freeDelivery !== undefined) product.freeDelivery = freeDelivery === 'true' || freeDelivery === true;
    if (description !== undefined) product.description = description;
    if (featured !== undefined) product.featured = featured === 'true' || featured === true;

    if (removeImages) {
      const toRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      await Promise.all(toRemove.map(url => deleteFromCloudinary(url)));
      product.images = product.images.filter(img => !toRemove.includes(img));
    }

    if (req.files && req.files.length > 0) {
      const newUrls = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, 'store/products')));
      product.images = [...product.images, ...newUrls];
    }

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.images && product.images.length > 0) {
      await Promise.all(product.images.map(url => deleteFromCloudinary(url)));
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
