// server/index.js - ZETA EMPIRE Backend (نسخة كاملة مع تعديل شراء VIP)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const AuditLog = require('./models/AuditLog');
const { completeTasksAndDistribute } = require('./taskEngine');
require('./cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'zeta_empire_super_secret_key_2026';

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ تم الاتصال بقاعدة البيانات MongoDB'))
.catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

// ===== دالة حفظ سجل الإجراءات =====
async function saveAuditLog(admin, action, details = {}) {
  try {
    const log = new AuditLog({ admin, action, details, timestamp: new Date() });
    await log.save();
  } catch (error) {
    console.error('❌ فشل حفظ سجل الإجراءات:', error);
  }
}

// ===== واجهات API الأساسية =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ZETA EMPIRE Backend is running!' });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -withdrawPin');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/users/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/team/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('parentA', 'fullName phone vipLevel balance totalDeposit')
      .populate('parentB', 'fullName phone vipLevel balance totalDeposit')
      .populate('parentC', 'fullName phone vipLevel balance totalDeposit');
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    res.json({ success: true, team: { A: user.parentA || [], B: user.parentB || [], C: user.parentC || [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    const token = jwt.sign({ id: user._id, phone: user.phone, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    const userData = user.toObject();
    delete userData.password;
    res.json({ success: true, user: userData, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'رقم الهاتف مسجل بالفعل' });
    const newUser = new User(userData);
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, phone: newUser.phone, isAdmin: newUser.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    const userDataResponse = newUser.toObject();
    delete userDataResponse.password;
    res.status(201).json({ success: true, user: userDataResponse, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/tasks/complete', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await completeTasksAndDistribute(userId);
    if (result.success) {
      await saveAuditLog('النظام', `توزيع أرباح للمستخدم ${userId}`, { profit: result.profit });
      res.json({ success: true, result });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== المعاملات =====
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, userName, phone, type, amount, network, address, txHash, fee, note } = req.body;
    const transaction = new Transaction({ userId, userName, phone, type, amount, network, address, txHash, fee, note, status: 'pending' });
    await transaction.save();
    await saveAuditLog('النظام', `إنشاء طلب ${type}`, { userId, amount, network });
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/transactions/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== الإشعارات =====
app.get('/api/notifications', async (req, res) => {
  try {
    const txs = await Transaction.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(10);
    const notifications = txs.map(tx => ({
      id: tx._id,
      userName: tx.userName,
      type: tx.type,
      amount: tx.amount,
      network: tx.network,
      createdAt: tx.createdAt,
      message: tx.type === 'deposit' ? `تم إيداع $${tx.amount}` : `تم سحب $${tx.amount}`
    }));
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== إدارة الأدمن =====
app.put('/api/admin/promote/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.vipLevel >= 7) return res.status(400).json({ success: false, message: 'المستخدم في أعلى مستوى' });
    const oldVip = user.vipLevel;
    user.vipLevel += 1;
    await user.save();
    await saveAuditLog('المدير الفائق', `ترقية ${user.fullName}`, { from: oldVip, to: user.vipLevel });
    res.json({ success: true, message: `تمت الترقية إلى VIP ${user.vipLevel}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/demote/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.vipLevel <= 0) return res.status(400).json({ success: false, message: 'المستخدم في أدنى مستوى' });
    const oldVip = user.vipLevel;
    user.vipLevel -= 1;
    await user.save();
    await saveAuditLog('المدير الفائق', `تخفيض ${user.fullName}`, { from: oldVip, to: user.vipLevel });
    res.json({ success: true, message: `تم التخفيض إلى VIP ${user.vipLevel}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/ban/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    const oldStatus = user.status;
    user.status = user.status === 'نشط' ? 'موقف' : 'نشط';
    await user.save();
    await saveAuditLog('المدير الفائق', `${user.status === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} ${user.fullName}`, { from: oldStatus, to: user.status });
    res.json({ success: true, message: `تم ${user.status === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} الحساب`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/balance/:userId', async (req, res) => {
  const { amount, reason } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    const oldBalance = user.balance;
    user.balance += parseFloat(amount);
    await user.save();
    await saveAuditLog('المدير الفائق', `تعديل رصيد ${user.fullName}`, { amount, reason, from: oldBalance, to: user.balance });
    res.json({ success: true, message: `تم ${parseFloat(amount) >= 0 ? 'إضافة' : 'خصم'} $${Math.abs(amount)}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== قبول ورفض الطلبات =====
app.put('/api/admin/approve/:txId', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
    const user = await User.findById(tx.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (tx.type === 'deposit') {
      user.balance += tx.amount;
      user.totalDeposit += tx.amount;
    } else if (tx.type === 'withdraw') {
      if (user.balance < tx.amount) return res.status(400).json({ success: false, message: 'الرصيد غير كافٍ' });
      user.balance -= tx.amount;
      user.totalWithdrawal += tx.amount;
    }
    await user.save();
    tx.status = 'approved';
    tx.adminAction = 'تم القبول بواسطة المدير';
    await tx.save();
    await saveAuditLog('المدير الفائق', `قبول طلب ${tx.type} #${tx._id}`, { userId: user._id, amount: tx.amount });
    res.json({ success: true, message: 'تم قبول المعاملة', transaction: tx, newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/reject/:txId', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
    tx.status = 'rejected';
    tx.adminAction = 'تم الرفض بواسطة المدير';
    await tx.save();
    await saveAuditLog('المدير الفائق', `رفض طلب ${tx.type} #${tx._id}`, { userId: tx.userId, amount: tx.amount });
    res.json({ success: true, message: 'تم رفض المعاملة', transaction: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== الإشعارات والإدارة =====
app.post('/api/admin/notify/:userId', async (req, res) => {
  const { message } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    await saveAuditLog('المدير الفائق', `إشعار مخصص إلى ${user.fullName}`, { message });
    res.json({ success: true, message: 'تم إرسال الإشعار' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/notify-all', async (req, res) => {
  const { message } = req.body;
  try {
    const users = await User.find();
    await saveAuditLog('المدير الفائق', 'إشعار جماعي', { count: users.length, message });
    res.json({ success: true, message: `تم الإرسال لـ ${users.length} مستخدم` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/audit', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ✅ شراء VIP (يدوي) - السعر = سعر المستوى المطلوب فقط =====
app.post('/api/vip/purchase', async (req, res) => {
  const { userId, vipLevel } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    const vipPrices = { 1: 50, 2: 100, 3: 200, 4: 400, 5: 800, 6: 1600, 7: 3200 };
    if (!vipPrices[vipLevel]) return res.status(400).json({ success: false, message: 'مستوى VIP غير صحيح' });
    if (vipLevel <= user.vipLevel) return res.status(400).json({ success: false, message: 'أنت تمتلك هذا المستوى أو أعلى' });

    const totalCost = vipPrices[vipLevel];

    if (user.balance < totalCost) {
      return res.status(400).json({ success: false, message: `الرصيد غير كافٍ. المطلوب: $${totalCost}` });
    }

    user.balance -= totalCost;
    user.vipLevel = vipLevel;
    user.totalDeposit += totalCost;
    await user.save();

    const transaction = new Transaction({
      userId: user._id,
      userName: user.fullName,
      phone: user.phone,
      type: 'deposit',
      amount: totalCost,
      network: 'SYSTEM',
      fee: 0,
      status: 'approved',
      note: `شراء VIP ${vipLevel} (بقيمة $${totalCost})`
    });
    await transaction.save();
    await saveAuditLog('النظام', `شراء VIP ${vipLevel} من ${user.fullName}`, { userId: user._id, amount: totalCost, newVIP: vipLevel });

    res.json({
      success: true,
      message: `تم شراء VIP ${vipLevel} بنجاح!`,
      user: { vipLevel: user.vipLevel, balance: user.balance, totalDeposit: user.totalDeposit }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== تشغيل الخادم =====
app.listen(PORT, () => {
  console.log(`🚀 خادم ZETA EMPIRE يعمل على المنفذ ${PORT}`);
  console.log(`📡 رابط API: http://localhost:${PORT}/api/health`);
});

module.exports = app;
