const KYC = require('../models/KYC');
const User = require('../models/User');
const ocrService = require('../services/ocrService');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Upload documents and submit KYC
// @route   POST /api/kyc/upload
// @access  Private
const uploadKyc = async (req, res) => {
  try {
    const { panNumber, aadhaarNumber } = req.body;

    if (!req.files || !req.files['panCard'] || !req.files['aadhaarCard'] || !req.files['selfie']) {
      return res.status(400).json({ message: 'All KYC files (PAN card, Aadhaar card, Selfie) are required.' });
    }

    if (!panNumber || !aadhaarNumber) {
      return res.status(400).json({ message: 'PAN Number and Aadhaar Number fields are required.' });
    }

    const panFile = req.files['panCard'][0];
    const aadhaarFile = req.files['aadhaarCard'][0];
    const selfieFile = req.files['selfie'][0];

    // Mock OCR details extraction
    const panOcr = await ocrService.extractDocumentData('pan', panFile.path);
    const aadhaarOcr = await ocrService.extractDocumentData('aadhaar', aadhaarFile.path);

    // Combine OCR Data
    const ocrData = {
      name: panOcr.name || aadhaarOcr.name,
      dob: panOcr.dob || aadhaarOcr.dob,
      panNumber: panOcr.panNumber,
      aadhaarNumber: aadhaarOcr.aadhaarNumber,
      confidence: Math.round(((panOcr.confidence + aadhaarOcr.confidence) / 2) * 100) / 100
    };

    // Check if KYC already exists for user
    let kycRecord = await KYC.findOne({ userId: req.user._id });

    const kycPayload = {
      userId: req.user._id,
      panNumber,
      aadhaarNumber,
      selfieUrl: `/uploads/${selfieFile.filename}`,
      panCardUrl: `/uploads/${panFile.filename}`,
      aadhaarCardUrl: `/uploads/${aadhaarFile.filename}`,
      ocrData,
      status: 'Pending',
      rejectionReason: null
    };

    if (kycRecord) {
      // Update existing record
      kycRecord = await KYC.findByIdAndUpdate(kycRecord._id, kycPayload, { new: true });
    } else {
      // Create new record
      kycRecord = await KYC.create(kycPayload);
    }

    // Update User's KYC status to 'Uploaded'
    const user = await User.findById(req.user._id);
    user.kycStatus = 'Uploaded';
    await user.save();

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: 'SUBMIT_KYC',
      details: 'KYC documents submitted. OCR Confidence: ' + (ocrData.confidence * 100) + '%',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Create Notification
    await Notification.create({
      userId: req.user._id,
      message: 'Your KYC documents have been submitted successfully and are pending admin verification.'
    });

    res.status(200).json({
      message: 'KYC documents submitted successfully.',
      kyc: kycRecord
    });
  } catch (error) {
    console.error('KYC Upload error:', error.message);
    res.status(500).json({ message: 'Server error during KYC upload processing.' });
  }
};

// @desc    Get current user's KYC details
// @route   GET /api/kyc/status
// @access  Private
const getKycStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user._id });
    if (!kyc) {
      return res.status(200).json({ status: 'Pending', details: null });
    }
    res.status(200).json({ status: kyc.status, kyc });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving KYC status.' });
  }
};

module.exports = {
  uploadKyc,
  getKycStatus
};
