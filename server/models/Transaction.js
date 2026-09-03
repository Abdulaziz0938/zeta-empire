const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'commission', 'referral'], required: true },
  amount: { type: Number, required: true },
  network: { type: String, enum: ['TRC20', 'BEP20'], default: 'TRC20' },
  address: { type: String, default: '' },
  txHash: { type: String, default: '' },
  fee: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  note: { type: String, default: '' },
  adminAction: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
