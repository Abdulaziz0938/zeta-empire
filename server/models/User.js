// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  withdrawPin: { type: String, required: true, maxlength: 6, minlength: 6 },
  inviteCode: { type: String, required: true, unique: true },
  referredBy: { type: String, default: null }, // كود الشخص الذي دعاه
  
  // شجرة الإحالة
  parentA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  parentB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  parentC: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // المستويات والأرصدة
  vipLevel: { type: Number, default: 0 }, // من 0 إلى 7
  balance: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdrawal: { type: Number, default: 0 },
  
  // الأرباح والعمولات
  dailyEarnings: { type: Number, default: 0 },
  weeklyEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },

  // إدارة المهام
  tasksCompletedToday: { type: Number, default: 0 },
  lastTaskDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
