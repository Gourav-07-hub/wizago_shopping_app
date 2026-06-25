import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  qty: Number,
  discount: Number,
  tax: Number,
  total: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  employee: {
    id: String,
    name: String,
    role: String,
    dept: String,
    status: String,
  },
  items: [orderItemSchema],
  itemsCount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  subTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  surcharge: { type: Number, default: 0 },
  state: String,
  address: String,
  packaging: String,
  packagingType: String,
  deliveryMethod: String,
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
