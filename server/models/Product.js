import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: null },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  tax: { type: Number, default: 8 },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', ProductSchema);
