const express = require('express');
const router = express.Router();
const {
  getUsers,
  getKycs,
  updateKycStatus,
  getLoans,
  updateLoanStatus,
  getAnalytics,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and require admin privileges
router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.get('/kycs', getKycs);
router.put('/kyc/:kycId', updateKycStatus);
router.get('/loans', getLoans);
router.put('/loan/:loanId', updateLoanStatus);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
