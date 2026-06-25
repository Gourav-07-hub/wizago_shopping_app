import mongoose from 'mongoose';

const DeliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: null },
  vehicleNumber: { type: String, default: null },
  zone: { type: String, default: null },
  isAvailable: { type: Boolean, default: true },
  currentOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
