import { Router } from 'express';
import Order from '../models/Order.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:invoiceNumber', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { invoiceNumber: req.params.invoiceNumber },
      req.body,
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:invoiceNumber', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ invoiceNumber: req.params.invoiceNumber });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Deleted', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
