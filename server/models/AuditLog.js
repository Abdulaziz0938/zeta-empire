const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
