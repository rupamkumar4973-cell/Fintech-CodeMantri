const LoanApplication = require('../models/LoanApplication');
const EligibilityReport = require('../models/EligibilityReport');
const CreditScore = require('../models/CreditScore');
const User = require('../models/User');
const KYC = require('../models/KYC');
const recommendationEngine = require('../services/recommendationEngine');
const pdfService = require('../services/pdfService');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Check loan eligibility
// @route   POST /api/loan/check-eligibility
// @access  Private
const checkEligibility = async (req, res) => {
  const { requestedAmount, tenure, monthlyIncome, existingLoans, employmentType, age } = req.body;

  try {
    // 1. Fetch user's CIBIL score (if generated)
    let scoreRecord = await CreditScore.findOne({ userId: req.user._id });
    let cibilScore = 700; // default for mock if no KYC or score generated yet

    if (scoreRecord) {
      cibilScore = scoreRecord.score;
    } else {
      // Try to check if KYC is completed to generate a bureau score
      const kyc = await KYC.findOne({ userId: req.user._id });
      if (kyc) {
        const cibilService = require('../services/cibilService');
        const profile = await cibilService.fetchCreditProfile(req.user.name, kyc.panNumber);
        scoreRecord = await CreditScore.create({
          userId: req.user._id,
          score: profile.score,
          creditUtilization: profile.creditUtilization,
          activeLoans: profile.activeLoans,
          repaymentHistory: profile.repaymentHistory,
          riskCategory: profile.riskCategory
        });
        cibilScore = scoreRecord.score;
      }
    }

    // 2. Evaluate eligibility
    const engineInput = {
      cibilScore,
      monthlyIncome,
      existingLoans,
      requestedAmount,
      tenure,
      age,
      employmentType,
      kycStatus: req.user.kycStatus
    };

    const assessment = recommendationEngine.evaluateEligibility(engineInput);

    // 3. Store Eligibility Report
    const report = await EligibilityReport.create({
      userId: req.user._id,
      cibilScore,
      monthlyIncome,
      debtToIncomeRatio: assessment.debtToIncomeRatio,
      isKycVerified: req.user.kycStatus === 'Approved',
      maxEligibleAmount: assessment.maxEligibleAmount,
      suggestedInterestRate: assessment.suggestedInterestRate,
      approvalProbability: assessment.approvalProbability,
      riskAnalysis: {
        category: assessment.riskAnalysis.category,
        suggestions: assessment.riskAnalysis.suggestions,
        details: assessment.riskAnalysis.details
      }
    });

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: 'CHECK_ELIGIBILITY',
      details: `Loan eligibility checked. Status: ${assessment.isEligible ? 'Eligible' : 'Ineligible'}. Max Limit: ₹${assessment.maxEligibleAmount}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      reportId: report._id,
      assessment: {
        ...assessment,
        cibilScore
      }
    });
  } catch (error) {
    console.error('Check eligibility error:', error.message);
    res.status(500).json({ message: 'Server error assessing loan eligibility.' });
  }
};

// @desc    Apply for a loan
// @route   POST /api/loan/apply
// @access  Private
const applyForLoan = async (req, res) => {
  const { type, amount, income, tenure, existingLoans } = req.body;

  try {
    // 1. Fetch user's CIBIL score
    let cibilScore = 700;
    const scoreRecord = await CreditScore.findOne({ userId: req.user._id });
    if (scoreRecord) {
      cibilScore = scoreRecord.score;
    }

    // 2. Evaluate risk parameters
    const engineInput = {
      cibilScore,
      monthlyIncome: income,
      existingLoans,
      requestedAmount: amount,
      tenure,
      age: 30, // Default mock age if not provided
      employmentType: 'Salaried',
      kycStatus: req.user.kycStatus
    };

    const assessment = recommendationEngine.evaluateEligibility(engineInput);

    // 3. Create Loan Application
    const application = await LoanApplication.create({
      userId: req.user._id,
      type,
      amount,
      income,
      tenure,
      existingLoans,
      debtToIncome: assessment.debtToIncomeRatio,
      status: 'Pending',
      interestRate: assessment.suggestedInterestRate,
      emi: assessment.emi,
      riskScore: 100 - assessment.financialHealthScore,
      recommendation: assessment.riskAnalysis.details
    });

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: 'APPLY_LOAN',
      details: `Applied for ${type} loan. Amount: ₹${amount}. Risk Score: ${100 - assessment.financialHealthScore}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Create Notification
    await Notification.create({
      userId: req.user._id,
      message: `Your ${type} loan application for ₹${amount.toLocaleString()} has been received and is under review.`
    });

    res.status(201).json({
      message: 'Loan application submitted successfully.',
      application
    });
  } catch (error) {
    console.error('Apply loan error:', error.message);
    res.status(500).json({ message: 'Server error submitting loan application.' });
  }
};

// @desc    Get user's loan applications
// @route   GET /api/loan/applications
// @access  Private
const getApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving applications.' });
  }
};

// @desc    Get AI Recommendations
// @route   GET /api/loan/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    // Retrieve user credit score
    const scoreRecord = await CreditScore.findOne({ userId: req.user._id });
    
    // Default values if no credit score is fetched yet
    const cibilScore = scoreRecord ? scoreRecord.score : 680;
    
    // Fetch last check or mock input
    const lastReport = await EligibilityReport.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const engineInput = {
      cibilScore,
      monthlyIncome: lastReport ? lastReport.monthlyIncome : 45000,
      existingLoans: lastReport ? (lastReport.debtToIncomeRatio * lastReport.monthlyIncome / 100) : 10000,
      requestedAmount: 0,
      tenure: 24,
      age: 28,
      employmentType: 'Salaried',
      kycStatus: req.user.kycStatus
    };

    const assessment = recommendationEngine.evaluateEligibility(engineInput);

    res.status(200).json({
      cibilScore,
      financialHealthScore: assessment.financialHealthScore,
      riskCategory: assessment.riskAnalysis.category,
      suggestions: assessment.riskAnalysis.suggestions,
      recommendations: assessment.recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error.message);
    res.status(500).json({ message: 'Server error retrieving recommendations.' });
  }
};

// @desc    Download Eligibility Report PDF
// @route   GET /api/loan/report/:reportId/pdf
// @access  Private
const downloadReportPdf = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const report = await EligibilityReport.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Eligibility report not found.' });
    }

    // Authenticate: user can only download their own reports
    if (report.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to this report.' });
    }

    const user = await User.findById(report.userId);

    // Generate and stream PDF
    pdfService.generateEligibilityReport(report, user, res);

    // Audit Log for pdf download
    await AuditLog.create({
      userId: req.user._id,
      action: 'DOWNLOAD_PDF',
      details: `Downloaded eligibility report PDF: ${reportId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

  } catch (error) {
    console.error('PDF generation error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF report.' });
    }
  }
};

module.exports = {
  checkEligibility,
  applyForLoan,
  getApplications,
  getRecommendations,
  downloadReportPdf
};
