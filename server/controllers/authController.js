const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models/User');

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Forgot Password (Step 1) - Send OTP to the email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex');
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 15); // OTP expires in 15 minutes

    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It will expire in 15 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return res.status(500).json({ error: 'Failed to send OTP' });
      res.status(200).json({ message: 'OTP sent to your email' });
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify OTP (Step 2)
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (new Date() > user.otpExpiration) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset Password (Step 3) - Allow the user to set a new password
exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null; // Clear OTP after reset
    user.otpExpiration = null; // Clear OTP expiration
    await user.save();

    res.status(200).json({ message: 'Password updated successfully, you can now log in' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
