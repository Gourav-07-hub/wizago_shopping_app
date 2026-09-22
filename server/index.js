import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';
import deliveryRoutes from './routes/delivery.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Wizago Shop API is running 🧙', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/delivery', deliveryRoutes);

// 404 for unknown API routes (must come after all routes)
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler (works with express-async-errors)
app.use((err, req, res, next) => {
  if (err?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid id format' });
  }
  if (err?.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI || !MONGO_URI.startsWith('mongodb')) {
  console.error('❌ MONGODB_URI is missing or invalid. Set it in your environment variables.');
  console.error('   It should start with "mongodb+srv://..."');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
