const { getModel, Schema } = require('../config/db');

const CreditScoreSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  creditUtilization: { type: Number, required: true }, // in % (e.g. 30)
  activeLoans: { type: Number, required: true },
  repaymentHistory: { type: Number, required: true }, // in % (e.g. 95)
  riskCategory: { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'], required: true }
}, { timestamps: true });

module.exports = getModel('CreditScore', CreditScoreSchema);
