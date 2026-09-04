const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ستُخزن مشفرة
  withdrawPin: { type: String, required: true, maxlength: 6, minlength: 6 },
  inviteCode: { type: String, required: true, unique: true },
  referredBy: { type: String, default: null },
  
  parentA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  parentB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  parentC: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  vipLevel: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdrawal: { type: Number, default: 0 },
  
  dailyEarnings: { type: Number, default: 0 },
  weeklyEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },

  tasksCompletedToday: { type: Number, default: 0 },
  lastTaskDate: { type: Date, default: null },
  
  status: { type: String, default: 'نشط' },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// ===== تشفير كلمة المرور قبل الحفظ =====
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ===== دالة للتحقق من كلمة المرور =====
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
