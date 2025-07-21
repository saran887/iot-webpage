const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function sendMail(to, subject, text) {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text
  });
}

// Helper to get SMS API key
function getSmsApiKey() {
  const keyPath1 = path.join(__dirname, '../.sms_api_key');
  const keyPath2 = path.join(__dirname, 'sms_api_key.txt');
  if (fs.existsSync(keyPath1)) return fs.readFileSync(keyPath1, 'utf8').trim();
  if (fs.existsSync(keyPath2)) return fs.readFileSync(keyPath2, 'utf8').trim();
  return 'textbelt'; // fallback to free key
}

// Register user with email OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, address } = req.body;
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits and start with 6, 7, 8, or 9' });
    }
    if (!address || !address.state || !address.city) {
      return res.status(400).json({ message: 'State and city are required in address' });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user = new User({
      name,
      email,
      password,
      mobile,
      address,
      role: email === 'admin@gmail.com' ? 'admin' : 'user',
      isVerified: false,
      resetOtp: otp,
      resetOtpExpires: Date.now() + 10 * 60 * 1000
    });
    await user.save();
    await sendMail(email, 'Your OTP for registration', `Your OTP is: ${otp}`);
    res.status(201).json({ message: 'Registration started. Please check your email for OTP.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm registration OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password via email OTP
router.post('/forgot-password-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();
    await sendMail(email, 'Your OTP for password reset', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password via email OTP
router.post('/reset-password-email', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      'your_jwt_secret', // Replace with environment variable in production
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (address)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ address: user.address || {} });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user address and mobile
router.put('/profile/address', authMiddleware, async (req, res) => {
  try {
    const { street, city, state, zipCode, country, mobile } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.address = { street, city, state, zipCode, country };
    if (mobile) user.mobile = mobile;
    await user.save();
    res.json({ message: 'Address updated', address: user.address, mobile: user.mobile });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 