require('dotenv').config();
const { connectDB } = require('../config/db');

async function test() {
  await connectDB();
  try {
    const User = require('../models/User');
    const AuditLog = require('../models/AuditLog');
    const smsService = require('../services/smsService');
    const bcrypt = require('bcryptjs');

    const email = `test_unique_${Date.now()}@gmail.com`;
    const password = 'Password123';
    const phone = '9876543210';
    const name = 'Test Register';

    console.log(`Attempting to register: ${email}`);

    const otp = '123456';
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Creating user in DB...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      otp,
      otpExpires,
      kycStatus: 'Pending',
      role: 'user'
    });

    console.log('User created:', user._id);

    console.log('Sending OTP...');
    await smsService.sendOtp(phone, otp);

    console.log('Creating Audit Log...');
    await AuditLog.create({
      userId: user._id,
      action: 'REGISTER',
      details: `User registered: ${email}`,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    });

    console.log('✅ TEST REGISTER SUCCESSFUL!');
  } catch (err) {
    console.error('❌ TEST REGISTER CRASHED:');
    console.error(err.stack || err);
  }
}

test();
