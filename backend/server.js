require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize app
const app = express();

// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows serving images statically to local React dev server
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartLoan AI - Fintech Loan Eligibility Platform API' });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/credit-score', require('./routes/creditScore'));
app.use('/api/loan', require('./routes/loan'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notification'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  
  // Seed sample users for mock database or empty collection
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    const count = await User.countDocuments({});
    if (count === 0) {
      console.log('🌱 Seeding default users...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123', salt);
      
      // Seed Test User
      await User.create({
        name: 'John Doe',
        email: 'user@smartloan.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'user',
        kycStatus: 'Pending'
      });
      
      // Seed Test Admin
      await User.create({
        name: 'Admin Officer',
        email: 'admin@smartloan.com',
        password: hashedPassword,
        phone: '9999999999',
        role: 'admin',
        kycStatus: 'Approved'
      });
      
      console.log('✅ Seed successful:');
      console.log('   👤 User: user@smartloan.com / Password123');
      console.log('   ⚙️ Admin: admin@smartloan.com / Password123');
    }
  } catch (seedErr) {
    console.error('Error seeding default users:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 SmartLoan AI Backend running on port ${PORT}`);
  });
};

startServer();
