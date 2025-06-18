const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Verify OTP route
router.post('/verify-otp', authController.verifyOtp);

// Reset password route
router.post('/reset-password', authController.resetPassword);

module.exports = router;
