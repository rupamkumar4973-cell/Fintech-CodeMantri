const { getModel, Schema } = require('../config/db');

const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

module.exports = getModel('AuditLog', AuditLogSchema);
