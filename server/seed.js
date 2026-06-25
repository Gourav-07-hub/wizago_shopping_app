import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';

const QUICK_PRODUCTS = [
  { name: 'Glow-in-the-dark Spark Wand', category: 'Accessories', price: 45.00, tax: 8, discount: 5 },
  { name: 'Self-Stirring Pewter Cauldron', category: 'Furniture', price: 120.00, tax: 10, discount: 10 },
  { name: 'Anti-Gravity Floating Inkwell', category: 'Office Supplies', price: 29.99, tax: 5, discount: 0 },
  { name: 'Midnight Velvet Wizard Cloak', category: 'Apparel', price: 95.00, tax: 6, discount: 15 },
  { name: 'Chrono-Watch Timepiece', category: 'Electronics', price: 249.99, tax: 12, discount: 20 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Product.deleteMany({});
  const products = await Product.insertMany(QUICK_PRODUCTS);
  console.log(`Seeded ${products.length} products`);

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => { console.error(err); process.exit(1); });