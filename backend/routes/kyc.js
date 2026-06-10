const express = require('express');
const router = express.Router();
const { uploadKyc, getKycStatus } = require('../controllers/kycController');
const { protect } = require('../middleware/auth');
const { kycUploads } = require('../middleware/upload');

router.post('/upload', protect, kycUploads, uploadKyc);
router.get('/status', protect, getKycStatus);

module.exports = router;
