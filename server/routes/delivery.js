import { Router } from 'express';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Order from '../models/Order.js';
import { protect, vendorOnly } from '../middleware/auth.js';

const router = Router();

router.get('/partners', protect, vendorOnly, async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/partners', protect, vendorOnly, async (req, res) => {
  try {
    const partner = await DeliveryPartner.create(req.body);
    res.status(201).json({ success: true, partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/partners/:id', protect, vendorOnly, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.status(200).json({ success: true, partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/partners/:id', protect, vendorOnly, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.status(200).json({ success: true, message: 'Partner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/assign/:orderId', protect, vendorOnly, async (req, res) => {
  try {
    const { partnerId, partnerName, partnerPhone } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        deliveryPartner: { partnerId, partnerName, partnerPhone, assignedAt: new Date() },
        status: 'out_for_delivery',
        $push: { timeline: { event: 'assigned', detail: `Assigned to ${partnerName}` } },
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/verify/:orderId', async (req, res) => {
  try {
    const { deliveryCode } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.deliveryCode !== deliveryCode) {
      return res.status(400).json({ success: false, message: 'Invalid delivery code' });
    }
    order.deliveryCodeStatus = 'verified';
    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.timeline.push({ event: 'delivered', detail: 'Order delivered successfully' });
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
