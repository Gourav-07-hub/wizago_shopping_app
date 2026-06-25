import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, default: 8 },
  discount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
