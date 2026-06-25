import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../email.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wizago-shop-secret-key';

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, avatar, verificationToken });

    sendVerificationEmail(email, name, verificationToken).catch(() => {});

    res.status(201).json({ message: 'Please check your email to verify your account before logging in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.redirect(process.env.FRONTEND_URL + '/?verification=failed');
    }
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.redirect(process.env.FRONTEND_URL + '/?verification=success');
  } catch (err) {
    res.redirect(process.env.FRONTEND_URL + '/?verification=error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.emailVerified === false) {
      return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox.', needsVerification: true });
    }

    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, avatar, email, currentPassword, newPassword } = req.body;

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    if (email !== undefined && email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ error: 'Email already in use' });
      user.email = email.toLowerCase();
      user.emailVerified = false;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required to set new password' });
      const match = await user.comparePassword(currentPassword);
      if (!match) return res.status(403).json({ error: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();

    const updatedUser = await User.findById(user._id);
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account found with that email' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    sendVerificationEmail(user.email, user.name, verificationToken).catch(() => {});
    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
