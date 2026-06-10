const { getModel, Schema } = require('../config/db');

const EligibilityReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cibilScore: { type: Number, required: true },
  monthlyIncome: { type: Number, required: true },
  debtToIncomeRatio: { type: Number, required: true },
  isKycVerified: { type: Boolean, default: false },
  maxEligibleAmount: { type: Number, required: true },
  suggestedInterestRate: { type: Number, required: true },
  approvalProbability: { type: Number, required: true }, // in % (e.g. 85)
  riskAnalysis: {
    category: { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'] },
    suggestions: [String],
    details: String
  }
}, { timestamps: true });

module.exports = getModel('EligibilityReport', EligibilityReportSchema);
