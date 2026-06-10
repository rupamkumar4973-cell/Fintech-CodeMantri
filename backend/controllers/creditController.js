const CreditScore = require('../models/CreditScore');
const KYC = require('../models/KYC');
const cibilService = require('../services/cibilService');
const AuditLog = require('../models/AuditLog');

// @desc    Get user credit score profile
// @route   GET /api/credit-score/:userId
// @access  Private
const getCreditScore = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check authorization: users can only fetch their own score unless they are an admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You cannot view another user\'s credit score.' });
    }

    let creditScore = await CreditScore.findOne({ userId });

    if (!creditScore) {
      // If no score exists yet, we try to fetch it from mock CIBIL bureau using KYC PAN
      const kyc = await KYC.findOne({ userId });
      if (!kyc) {
        return res.status(400).json({ 
          message: 'KYC documents not found. Please upload PAN/Aadhaar details in the KYC module first to retrieve your credit score.',
          requiresKyc: true
        });
      }

      // Generate score from mock CIBIL bureau
      const profile = await cibilService.fetchCreditProfile(req.user.name, kyc.panNumber);
      
      creditScore = await CreditScore.create({
        userId,
        score: profile.score,
        creditUtilization: profile.creditUtilization,
        activeLoans: profile.activeLoans,
        repaymentHistory: profile.repaymentHistory,
        riskCategory: profile.riskCategory
      });

      // Audit Log
      await AuditLog.create({
        userId,
        action: 'FETCH_CIBIL',
        details: `CIBIL credit profile generated. Score: ${profile.score}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.status(200).json(creditScore);
  } catch (error) {
    console.error('Fetch credit score error:', error.message);
    res.status(500).json({ message: 'Server error retrieving credit score.' });
  }
};

module.exports = {
  getCreditScore
};
