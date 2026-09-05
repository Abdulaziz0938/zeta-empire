const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  admin: String,
  action: String,
  details: Object,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AuditLog', auditLogSchema);
