const { getModel, Schema } = require('../config/db');

const LoanApplicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Personal', 'Home', 'Vehicle', 'Education', 'Business'], required: true },
  amount: { type: Number, required: true },
  income: { type: Number, required: true },
  tenure: { type: Number, required: true }, // in months
  existingLoans: { type: Number, required: true },
  debtToIncome: { type: Number, required: true }, // in % (e.g. 40)
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  interestRate: { type: Number, default: 0 },
  emi: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 }, // 1 to 100
  recommendation: { type: String, default: '' }
}, { timestamps: true });

module.exports = getModel('LoanApplication', LoanApplicationSchema);
