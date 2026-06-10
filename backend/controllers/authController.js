const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');
const smsService = require('../services/smsService');

// Helper to generate JWT access token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smartloan_jwt_secret_key_2026_secure_signing', {
    expiresIn: '15m'
  });
};

// Helper to generate JWT refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'smartloan_jwt_refresh_secret_key_2026_secure_signing', {
    expiresIn: '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate a mock 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    // Note: For mock DB, pre-save hooks are skipped, so we hash password manually in mock DB context if needed, 
    // or just let Mongoose handle it for real DB, and check manually for mock.
    // To support both, we check if mongoose is running a mock or real connection:
    const isMockDb = require('../config/db').isMock();
    let hashedPassword = password;
    if (isMockDb) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      otp,
      otpExpires,
      kycStatus: 'Pending',
      role: email.startsWith('admin@') ? 'admin' : 'user' // auto-admin for test emails
    });

    if (user) {
      const token = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Send OTP via SMS Service
      await smsService.sendOtp(phone, otp);

      // Audit Log
      await AuditLog.create({
        userId: user._id,
        action: 'REGISTER',
        details: `User registered: ${email}. OTP generated and processed: ${otp}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          kycStatus: user.kycStatus,
          createdAt: user.createdAt
        },
        token,
        refreshToken,
        mockOtp: otp // Return OTP for easy mock registration testing
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Password comparison
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      const token = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Audit Log
      await AuditLog.create({
        userId: user._id,
        action: 'LOGIN',
        details: `User successfully logged in: ${email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          kycStatus: user.kycStatus,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'smartloan_jwt_refresh_secret_key_2026_secure_signing');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const token = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      token,
      newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error.message);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isVerifiedViaGateway = await smsService.checkOtp(user.phone, otp);
    const isVerifiedViaDb = user.otp === otp;

    if (isVerifiedViaGateway || isVerifiedViaDb) {
      // OTP matched, clear it
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      // Audit Log
      await AuditLog.create({
        userId: user._id,
        action: 'OTP_VERIFY',
        details: 'User mobile verification successful via OTP',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Security practice: don't reveal user existence
      return res.json({ message: 'If email exists in our system, a password reset link has been sent.' });
    }

    // In a real app, generate a password reset token and send email.
    // For mock purposes, log audit log and return mock success response.
    const resetToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    
    await AuditLog.create({
      userId: user._id,
      action: 'PASSWORD_RESET_REQ',
      details: `Password reset link requested. Mock Token: ${resetToken}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ 
      message: 'If email exists in our system, a password reset link has been sent.',
      mockResetLink: `http://localhost:5173/reset-password/${resetToken}` // for testing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during forgot password process' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      // Audit Log
      await AuditLog.create({
        userId: user._id,
        action: 'UPDATE_PROFILE',
        details: 'User profile updated',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        kycStatus: updatedUser.kycStatus
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await smsService.sendOtp(user.phone, otp);

    await AuditLog.create({
      userId: user._id,
      action: 'RESEND_OTP',
      details: `OTP code resent to ${user.phone}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'OTP resent successfully', mockOtp: otp });
  } catch (error) {
    console.error('Resend OTP error:', error.message);
    res.status(500).json({ message: 'Server error resending OTP' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  verifyOtp,
  forgotPassword,
  getUserProfile,
  updateUserProfile,
  resendOtp
};
