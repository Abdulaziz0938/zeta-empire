const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  sender: { type: String, default: 'المشرف' },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema);
