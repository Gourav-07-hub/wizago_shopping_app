import { Router } from 'express';
import Order from '../models/Order.js';
import { protect, vendorOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, async (req, res) => {
  try {
    const orderId = req.body.orderId || `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryCode = req.body.deliveryCode || String(Math.floor(100000 + Math.random() * 900000));
    const order = await Order.create({
      ...req.body,
      orderId,
      deliveryCode,
      customer: {
        ...(req.body.customer || {}),
        userId: req.user._id,
      },
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.userId': req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, vendorOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, vendorOnly, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
