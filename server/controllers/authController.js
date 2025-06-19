const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { 
  getPasswordResetOTPTemplate, 
  getWelcomeEmailTemplate, 
  getPasswordChangedTemplate 
} = require('../utils/emailTemplates');

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register function
const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    
    // Send welcome email
    const welcomeEmail = getWelcomeEmailTemplate(email);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      text: welcomeEmail.text
    });
    
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login function
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Forgot password function
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();
    
    // Send OTP via email using template
    const otpEmail = getPasswordResetOTPTemplate(otp);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: otpEmail.subject,
      html: otpEmail.html,
      text: otpEmail.text
    });
    
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify OTP function
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || user.otp !== otp || !user.otpExpiration || new Date() > user.otpExpiration) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Clear OTP after successful verification (but keep expiration for reference)
    user.otp = null;
    await user.save();
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset password function
const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  try {
    // Validate that passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate password length (optional - you can adjust this)
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP was verified (OTP should be null after verification)
    if (user.otp !== null) {
      return res.status(400).json({ error: 'Please verify OTP first' });
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiration = null;
    await user.save();
    
    // Send password changed confirmation email
    const passwordChangedEmail = getPasswordChangedTemplate();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: passwordChangedEmail.subject,
      html: passwordChangedEmail.html,
      text: passwordChangedEmail.text
    });
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout function (optional - for token invalidation)
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you could add the token to a blacklist
    // For now, we'll just return success since JWT tokens are stateless
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, forgotPassword, verifyOtp, resetPassword, logout };