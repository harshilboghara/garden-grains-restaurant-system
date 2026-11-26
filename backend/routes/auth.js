const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // default to 30 days to reduce frequent expirations
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[\d\s-()+]{10,}$/).withMessage('Please enter a valid phone number (at least 10 digits)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user && user.emailVerified) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user && !user.emailVerified) {
      // Update existing unverified user
      user.name = name;
      user.password = password;
      user.phone = phone;
      user.address = address;
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      // Create new user
      user = new User({
        name,
        email,
        password,
        phone,
        address,
        otp,
        otpExpires,
        emailVerified: false
      });
    }

    await user.save();

    // Send OTP email
    try {
      await sendEmail(
        email,
        'Verify Your Registration - Garden Grains',
        `
        <h2>Welcome to Garden Grains!</h2>
        <p>Thank you for registering. To complete your registration, please use the following One-Time Password (OTP):</p>
        <div class="highlight" style="text-align: center;">
          <h1 style="color: #D4AF37; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
          <p><small>This code will expire in 10 minutes.</small></p>
        </div>
        <p>If you did not request this registration, please ignore this email.</p>
        `
      );
    } catch (emailError) {
      console.error('OTP email failed:', emailError);
      // We still return 201 as the user is created, but inform them locally or via logs
    }

    res.status(201).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for registration
// @access  Public
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Verify user
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send Welcome Email (moved from register)
    sendEmail(
      email,
      'Welcome to Garden Grains Restaurant!',
      `
      <h2>Welcome to Garden Grains!</h2>
      <p>Dear ${user.name},</p>
      <p>Your account has been successfully verified! We're thrilled to have you join our community.</p>
      <div class="highlight">
        <p><strong>Your Account Benefits:</strong></p>
        <ul>
          <li>Exclusive access to seasonal menu items</li>
          <li>Priority table reservations</li>
          <li>Real-time order tracking</li>
          <li>Reward points on every purchase</li>
        </ul>
      </div>
      <p>We look forward to serving you!</p>
      `
    ).catch(err => console.error('Welcome email failed:', err));

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail(
      email,
      'New OTP for Verification - Garden Grains',
      `
      <h2>New Verification Code</h2>
      <p>Your new One-Time Password (OTP) is:</p>
      <div class="highlight" style="text-align: center;">
        <h1 style="color: #D4AF37; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
        <p><small>This code will expire in 10 minutes.</small></p>
      </div>
      `
    );

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active and verified
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    if (!user.emailVerified) {
      return res.status(400).json({ 
        message: 'Email not verified. Please verify your email to login.',
        notVerified: true,
        email: user.email
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        role: req.user.role,
        loyaltyPoints: req.user.loyaltyPoints,
        preferences: req.user.preferences,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token (extend session)
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    // User is already authenticated via auth middleware
    // Generate a new token with extended expiration
    const newToken = generateToken(req.user._id);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        loyaltyPoints: req.user.loyaltyPoints
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token (8-character CAPITAL alphanumeric code)
    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    try {
      // Logic for special admin email routing
      // Optional: route admin reset mail to an operations inbox via ADMIN_RESET_EMAIL
      let targetRecipient = email;
      if (email.toLowerCase() === 'admin@gardengrains.com' && process.env.ADMIN_RESET_EMAIL) {
        targetRecipient = process.env.ADMIN_RESET_EMAIL;
      }

      await sendEmail(
        targetRecipient,
        'Admin Password Reset - Garden Grains Restaurant',
        `
        <h2>Admin Security: Reset Password</h2>
        <p>Dear ${user.name},</p>
        <p>We received a request to reset your password for the Garden Grains <strong>Admin Account</strong> (${email}).</p>
        <div class="highlight" style="text-align: center;">
          <p>Your secure reset code is:</p>
          <h1 style="color: #D4AF37; letter-spacing: 5px; margin: 10px 0;">${resetToken}</h1>
          <p><small>This code will expire in 1 hour.</small></p>
        </div>
        <div class="button-container">
          <a href="${process.env.FRONTEND_URL || '#'}/reset-password" class="button">Reset Password Now</a>
        </div>
        <p>Security Notice: If you did not request this, please secure your account immediately.</p>
        <p>Best regards,<br>Garden Grains Security</p>
        `
      );
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;
    const upperToken = token.toUpperCase();

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: upperToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
