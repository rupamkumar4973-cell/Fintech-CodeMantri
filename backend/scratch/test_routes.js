require('dotenv').config();
const { connectDB } = require('../config/db');

async function test() {
  await connectDB();
  try {
    const Notification = require('../models/Notification');
    const LoanApplication = require('../models/LoanApplication');
    const EligibilityReport = require('../models/EligibilityReport');

    console.log('Testing Notification find and sort chaining:');
    const notes = await Notification.find({ userId: 'xxgay7vmq7mtz8f' }).sort({ createdAt: -1 });
    console.log('Notification results length:', notes.length);

    console.log('Testing LoanApplication find and sort chaining:');
    const apps = await LoanApplication.find({ userId: 'xxgay7vmq7mtz8f' }).sort({ createdAt: -1 });
    console.log('LoanApplication results length:', apps.length);

    console.log('Testing EligibilityReport findOne and sort chaining:');
    const report = await EligibilityReport.findOne({ userId: 'xxgay7vmq7mtz8f' }).sort({ createdAt: -1 });
    console.log('EligibilityReport result:', report);
    
    console.log('✅ ALL TEST ROUTINGS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('CRITICAL PATH TEST FAILURE:');
    console.error(err.stack || err);
  }
}

test();
