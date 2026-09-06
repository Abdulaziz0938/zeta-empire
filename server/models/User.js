const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  withdrawPin: { type: String, required: true, maxlength: 6, minlength: 6 },
  inviteCode: { type: String, required: true, unique: true },
  
  // ✅ شجرة الإحالة (باستخدام رقم الهاتف)
  parent: { type: String, default: 'ADMIN_MAIN' }, // رقم هاتف المُحيل المباشر
  
  // المستويات والأرصدة
  vipLevel: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdrawal: { type: Number, default: 0 },
  
  // الأرباح
  dailyEarnings: { type: Number, default: 0 },
  weeklyEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },
  totalReferralCommissions: { type: Number, default: 0 }, // ✅ العمولات الكلية من الإحالات
  
  // الإحالات
  referrals: { type: Number, default: 0 }, // عدد الإحالات المباشرة
  
  // المهام
  tasksCompletedToday: { type: Number, default: 0 },
  lastTaskDate: { type: Date, default: null },
  status: { type: String, default: 'نشط' },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
