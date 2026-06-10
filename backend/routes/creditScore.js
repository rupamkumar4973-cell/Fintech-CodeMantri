const express = require('express');
const router = express.Router();
const { getCreditScore } = require('../controllers/creditController');
const { protect } = require('../middleware/auth');

router.get('/:userId', protect, getCreditScore);

module.exports = router;
