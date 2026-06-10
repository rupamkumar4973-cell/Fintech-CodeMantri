const { getModel, Schema } = require('../config/db');

const KYCSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  panNumber: { type: String, required: true },
  aadhaarNumber: { type: String, required: true },
  selfieUrl: { type: String, required: true },
  panCardUrl: { type: String, required: true },
  aadhaarCardUrl: { type: String, required: true },
  ocrData: {
    name: String,
    dob: String,
    panNumber: String,
    aadhaarNumber: String,
    confidence: Number
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String, default: null }
}, { timestamps: true });

module.exports = getModel('KYC', KYCSchema);
