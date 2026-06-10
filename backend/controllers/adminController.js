const User = require('../models/User');
const KYC = require('../models/KYC');
const LoanApplication = require('../models/LoanApplication');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users.' });
  }
};

// @desc    Get all KYC requests
// @route   GET /api/admin/kycs
// @access  Private/Admin
const getKycs = async (req, res) => {
  try {
    const kycs = await KYC.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(kycs);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving KYC records.' });
  }
};

// @desc    Approve or Reject KYC Request
// @route   PUT /api/admin/kyc/:kycId
// @access  Private/Admin
const updateKycStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const kycId = req.params.kycId;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected.' });
  }

  try {
    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({ message: 'KYC record not found.' });
    }

    kyc.status = status;
    kyc.rejectionReason = status === 'Rejected' ? rejectionReason : null;
    await kyc.save();

    // Update User Collection
    const user = await User.findById(kyc.userId);
    if (user) {
      user.kycStatus = status;
      await user.save();
    }

    // Create Notification for the user
    await Notification.create({
      userId: kyc.userId,
      message: status === 'Approved' 
        ? 'Congratulations! Your KYC verification has been approved.' 
        : `Your KYC verification was rejected. Reason: ${rejectionReason}`
    });

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: `KYC_${status.toUpperCase()}`,
      details: `Admin ${req.user.email} updated KYC status for user ${kyc.userId} to ${status}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ message: `KYC successfully ${status}`, kyc });
  } catch (error) {
    console.error('Update KYC status error:', error.message);
    res.status(500).json({ message: 'Server error updating KYC status.' });
  }
};

// @desc    Get all loan applications
// @route   GET /api/admin/loans
// @access  Private/Admin
const getLoans = async (req, res) => {
  try {
    const loans = await LoanApplication.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving loan applications.' });
  }
};

// @desc    Approve/Reject loan application
// @route   PUT /api/admin/loan/:loanId
// @access  Private/Admin
const updateLoanStatus = async (req, res) => {
  const { status } = req.body;
  const loanId = req.params.loanId;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected.' });
  }

  try {
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found.' });
    }

    loan.status = status;
    await loan.save();

    // Create Notification
    await Notification.create({
      userId: loan.userId,
      message: `Your ${loan.type} loan application for ₹${loan.amount.toLocaleString()} has been ${status.toUpperCase()}.`
    });

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: `LOAN_${status.toUpperCase()}`,
      details: `Admin updated loan application ${loanId} status to ${status}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ message: `Loan application successfully ${status}`, loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating loan status.' });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalApplications = await LoanApplication.countDocuments();
    const approvedApplications = await LoanApplication.countDocuments({ status: 'Approved' });
    const pendingApplications = await LoanApplication.countDocuments({ status: 'Pending' });
    
    // Aggregations
    const loans = await LoanApplication.find({});
    const totalLoanAmount = loans.reduce((acc, curr) => acc + curr.amount, 0);
    const approvedLoanAmount = loans
      .filter(l => l.status === 'Approved')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const kycPending = await User.countDocuments({ kycStatus: 'Uploaded' });
    const kycApproved = await User.countDocuments({ kycStatus: 'Approved' });

    res.status(200).json({
      summary: {
        totalUsers,
        totalApplications,
        approvedApplications,
        pendingApplications,
        totalLoanAmount,
        approvedLoanAmount
      },
      kyc: {
        pending: kycPending,
        approved: kycApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics dashboard.' });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
};

module.exports = {
  getUsers,
  getKycs,
  updateKycStatus,
  getLoans,
  updateLoanStatus,
  getAnalytics,
  getAuditLogs
};
