import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    phone: String,
    state: String,
    address: String,
    pincode: String,
  },
  items: [{
    productId: String,
    name: String,
    qty: Number,
    price: Number,
    discount: Number,
    tax: Number,
  }],
  subtotal: Number,
  priorityFee: { type: Number, default: 0 },
  packagingFee: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  grandTotal: Number,
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal',
  },
  packaging: String,
  deliveryMethod: String,
  delivery: {
    carrierId: String,
    carrierName: String,
    speedId: String,
    speedLabel: String,
    estimatedDate: Date,
    estimatedLabel: String,
    deliveryFee: Number,
    pincode: String,
    city: String,
    state: String,
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid',
  },
  paymentDetails: {
    paymentId: String,
    paidAt: Date,
  },
  assignedEmployee: String,
  deliveryPartner: {
    partnerId: String,
    partnerName: String,
    partnerPhone: String,
    assignedAt: Date,
  },
  deliveryCode: String,
  deliveryCodeStatus: {
    type: String,
    enum: ['pending', 'verified', 'delivered'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['pending', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  timeline: [{
    event: String,
    detail: String,
    timestamp: { type: Date, default: Date.now },
  }],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date, default: null },
});

export default mongoose.model('Order', OrderSchema);
