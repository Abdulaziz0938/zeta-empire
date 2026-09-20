const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },
  userPhone: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'replied', 'read'], default: 'pending' },
  reply: { type: String, default: '' },
  repliedAt: { type: Date, default: null },
  repliedBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
