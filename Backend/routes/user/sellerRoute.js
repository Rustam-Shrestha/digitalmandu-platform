const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middlewares/isAuthenticated');
const restrict = require('../../middlewares/restrict');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');

const sellerGuard = [isAuthenticated, restrict('seller', 'admin')];

router.get('/products', ...sellerGuard, async (req, res) => {
  try { const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 }); res.json({ data: products }); }
  catch (err) { res.status(500).json({ message: 'Error fetching products', error: err.message }); }
});

router.get('/orders', ...sellerGuard, async (req, res) => {
  try {
    const sellerIds = await Product.find({ seller: req.user._id }).distinct('_id');
    const orders = await Order.find({ 'items.product': { $in: sellerIds } })
      .populate('user', 'name email phone').populate('items.product', 'productName productPrice productImage').sort({ createdAt: -1 });
    // also include orders where seller field matches
    const direct = await Order.find({ seller: req.user._id }).populate('user', 'name email phone').populate('items.product', 'productName productPrice productImage');
    const merged = [...orders, ...direct.filter(o => !orders.some(e => e._id.toString()===o._id.toString()))];
    res.json({ data: merged });
  } catch (err) { res.status(500).json({ message: 'Error fetching orders', error: err.message }); }
});

router.patch('/orders/:id/status', ...sellerGuard, async (req, res) => {
  try {
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (estimatedDelivery) update.estimatedDelivery = estimatedDelivery;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json({ data: order });
  } catch (err) { res.status(400).json({ message: 'Error updating order', error: err.message }); }
});

router.get('/analytics', ...sellerGuard, async (req, res) => {
  try {
    const sellerProducts = await Product.find({ seller: req.user._id });
    const ids = sellerProducts.map(p => p._id);
    const totalOrders = ids.length ? await Order.countDocuments({ 'items.product': { $in: ids } }) : 0;
    const totalRevenueAgg = ids.length ? await Order.aggregate([
      { $match: { 'items.product': { $in: ids } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]) : [];
    res.json({ data: {
      totalProducts: sellerProducts.length,
      totalOrders,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      totalStock: sellerProducts.reduce((s,p)=>s+(p.productStock||0),0),
      soldCount: sellerProducts.reduce((s,p)=>s+(p.soldCount||0),0)
    }});
  } catch (err) { res.status(500).json({ message: 'Error fetching analytics', error: err.message }); }
});

module.exports = router;
