require('dotenv').config();
const { connectDB } = require('../config/db');

async function test() {
  await connectDB();
  try {
    const User = require('../models/User');
    console.log('User model loaded:', typeof User);
    const count = await User.countDocuments({});
    console.log('User count:', count);
  } catch (err) {
    console.error('CRITICAL ERROR STACK TRACE:');
    console.error(err.stack || err);
  }
}

test();
