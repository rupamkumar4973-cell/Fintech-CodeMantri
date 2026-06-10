const express = require('express');
const router = express.Router();
const {
  checkEligibility,
  applyForLoan,
  getApplications,
  getRecommendations,
  downloadReportPdf
} = require('../controllers/loanController');
const { protect } = require('../middleware/auth');

router.post('/check-eligibility', protect, checkEligibility);
router.post('/apply', protect, applyForLoan);
router.get('/applications', protect, getApplications);
router.get('/recommendations', protect, getRecommendations);
router.get('/report/:reportId/pdf', protect, downloadReportPdf);

module.exports = router;
