require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('./models/Notification');
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

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('✅ MongoDB متصل'))
.catch(err => console.error('❌ فشل الاتصال:', err));

async function saveAuditLog(admin, action, details = {}) {
  try { const log = new AuditLog({ admin, action, details, timestamp: new Date() }); await log.save(); } 
  catch (error) { console.error('❌ فشل حفظ السجل:', error); }
}

const processedTransactions = new Set();

// ===== الصحة =====
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// ===== المستخدمين =====
app.get('/api/users', async (req, res) => {
  try { const users = await User.find().select('-password -withdrawPin'); res.json({ success: true, users }); } 
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.get('/api/users/:phone', async (req, res) => {
  try { const user = await User.findOne({ phone: req.params.phone }); if (!user) return res.status(404).json({ success: false, message: 'غير موجود' }); const userData = user.toObject(); delete userData.password; res.json({ success: true, user: userData }); } 
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== المصادقة =====
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    const token = jwt.sign({ id: user._id, phone: user.phone, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    const userData = user.toObject(); delete userData.password;
    res.json({ success: true, user: userData, token });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'رقم الهاتف مسجل بالفعل' });
    const newUser = new User(userData);
    await newUser.save();
    if (userData.referralCode) {
      const referrer = await User.findOne({ inviteCode: userData.referralCode });
      if (referrer) { referrer.referrals = (referrer.referrals || 0) + 1; await referrer.save(); }
    }
    const token = jwt.sign({ id: newUser._id, phone: newUser.phone, isAdmin: newUser.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    const response = newUser.toObject(); delete response.password;
    res.status(201).json({ success: true, user: response, token });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== المهام =====
app.post('/api/tasks/complete', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await completeTasksAndDistribute(userId);
    if (result.success) { await saveAuditLog('النظام', `توزيع أرباح ${userId}`, { profit: result.profit }); res.json({ success: true, result }); } 
    else res.status(400).json({ success: false, message: result.message });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== المعاملات (بما فيها رقم المعاملة) =====
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, userName, phone, type, amount, network, address, txHash, fee, note } = req.body;
    const transaction = new Transaction({ userId, userName, phone, type, amount, network, address, txHash, fee, note, status: 'pending' });
    await transaction.save();
    await saveAuditLog('النظام', `طلب ${type}`, { userId, amount });
    res.status(201).json({ success: true, transaction });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.get('/api/transactions', async (req, res) => {
  try { const transactions = await Transaction.find().sort({ createdAt: -1 }); res.json({ success: true, transactions }); } 
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.get('/api/transactions/user/:userId', async (req, res) => {
  try { const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 }); res.json({ success: true, transactions }); } 
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== الإشعارات =====
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.userId;
    let filter = { targetUserId: null };
    if (userId) filter = { $or: [{ targetUserId: null }, { targetUserId: userId }] };
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, notifications });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== سجل الإجراءات (للأدمن) =====
app.get('/api/admin/audit', async (req, res) => {
  try { const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50); res.json({ success: true, logs }); } 
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== إدارة الأدمن =====
app.put('/api/admin/promote/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    if (user.vipLevel >= 7) return res.status(400).json({ success: false, message: 'أعلى مستوى' });
    const old = user.vipLevel; user.vipLevel += 1; await user.save();
    await saveAuditLog('المدير', `ترقية ${user.fullName}`, { from: old, to: user.vipLevel });
    res.json({ success: true, message: `تمت الترقية إلى VIP ${user.vipLevel}`, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.put('/api/admin/demote/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    if (user.vipLevel <= 0) return res.status(400).json({ success: false, message: 'أدنى مستوى' });
    const old = user.vipLevel; user.vipLevel -= 1; await user.save();
    await saveAuditLog('المدير', `تخفيض ${user.fullName}`, { from: old, to: user.vipLevel });
    res.json({ success: true, message: `تم التخفيض إلى VIP ${user.vipLevel}`, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.put('/api/admin/ban/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    const old = user.status; user.status = user.status === 'نشط' ? 'موقف' : 'نشط'; await user.save();
    await saveAuditLog('المدير', `${user.status === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} ${user.fullName}`, { from: old, to: user.status });
    res.json({ success: true, message: `تم ${user.status === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} الحساب`, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.put('/api/admin/balance/:userId', async (req, res) => {
  const { amount, reason } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    const old = user.balance; user.balance = (Number(user.balance) || 0) + parseFloat(amount); await user.save();
    await saveAuditLog('المدير', `تعديل رصيد ${user.fullName}`, { amount, reason, from: old, to: user.balance });
    res.json({ success: true, message: `تم ${parseFloat(amount) >= 0 ? 'إضافة' : 'خصم'} $${Math.abs(amount)}`, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== قبول ورفض الطلبات (مع منع التكرار) =====
app.put('/api/admin/approve/:txId', async (req, res) => {
  const txId = req.params.txId;
  if (processedTransactions.has(txId)) return res.status(409).json({ success: false, message: 'تمت المعالجة مسبقاً' });
  try {
    const tx = await Transaction.findById(txId);
    if (!tx) return res.status(404).json({ success: false, message: 'غير موجودة' });
    if (tx.status !== 'pending') return res.status(400).json({ success: false, message: `بحالة ${tx.status}` });
    const user = await User.findById(tx.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (tx.type === 'deposit') { user.balance = (Number(user.balance) || 0) + tx.amount; user.totalDeposit = (Number(user.totalDeposit) || 0) + tx.amount; }
    else if (tx.type === 'withdraw') { if (user.balance < tx.amount) return res.status(400).json({ success: false, message: 'الرصيد غير كافٍ' }); user.balance = (Number(user.balance) || 0) - tx.amount; user.totalWithdrawal = (Number(user.totalWithdrawal) || 0) + tx.amount; }
    await user.save();
    tx.status = 'approved'; tx.adminAction = 'تم القبول'; await tx.save();
    processedTransactions.add(txId); setTimeout(() => processedTransactions.delete(txId), 600000);
    await saveAuditLog('المدير', `قبول طلب ${tx.type} #${txId}`, { userId: user._id, amount: tx.amount });
    const userData = user.toObject(); delete userData.password;
    res.json({ success: true, message: 'تم القبول', transaction: tx, user: userData });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.put('/api/admin/reject/:txId', async (req, res) => {
  const txId = req.params.txId;
  if (processedTransactions.has(txId)) return res.status(409).json({ success: false, message: 'تمت المعالجة مسبقاً' });
  try {
    const tx = await Transaction.findById(txId);
    if (!tx) return res.status(404).json({ success: false, message: 'غير موجودة' });
    if (tx.status !== 'pending') return res.status(400).json({ success: false, message: `بحالة ${tx.status}` });
    tx.status = 'rejected'; tx.adminAction = 'تم الرفض'; await tx.save();
    processedTransactions.add(txId); setTimeout(() => processedTransactions.delete(txId), 600000);
    await saveAuditLog('المدير', `رفض طلب ${tx.type} #${txId}`, { userId: tx.userId, amount: tx.amount });
    res.json({ success: true, message: 'تم الرفض', transaction: tx });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== الإشعارات الإدارية =====
app.post('/api/admin/notify/:userId', async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: 'اكتب رسالة' });
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    const notification = new Notification({ message: message.trim(), type: 'info', sender: 'المدير', targetUserId: user._id });
    await notification.save();
    await saveAuditLog('المدير', `إشعار إلى ${user.fullName}`, { message });
    res.json({ success: true, message: 'تم الإرسال' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
app.post('/api/admin/notify-all', async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: 'اكتب رسالة' });
  try {
    const notification = new Notification({ message: message.trim(), type: 'info', sender: 'المدير', targetUserId: null });
    await notification.save();
    await saveAuditLog('المدير', 'إشعار جماعي', { message });
    res.json({ success: true, message: 'تم الإرسال للجميع' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== شراء VIP (نسخة آمنة ذرية) =====
app.post('/api/vip/purchase', async (req, res) => {
  const { userId, vipLevel } = req.body;
  try {
    const vipPrices = { 1: 50, 2: 100, 3: 200, 4: 400, 5: 800, 6: 1600, 7: 3200 };
    if (!vipPrices[vipLevel]) return res.status(400).json({ success: false, message: 'مستوى غير صحيح' });
    const totalCost = vipPrices[vipLevel];

    const user = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: totalCost }, vipLevel: { $lt: vipLevel } },
      { $inc: { balance: -totalCost, totalDeposit: totalCost }, $set: { vipLevel: vipLevel } },
      { new: true }
    );

    if (!user) {
      const existing = await User.findById(userId);
      if (!existing) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      if (existing.vipLevel >= vipLevel) return res.status(400).json({ success: false, message: `أنت بالفعل VIP ${existing.vipLevel} أو أعلى` });
      if (existing.balance < totalCost) return res.status(400).json({ success: false, message: `الرصيد غير كافٍ: $${existing.balance}، المطلوب: $${totalCost}` });
      return res.status(400).json({ success: false, message: 'خطأ غير متوقع' });
    }

    const transaction = new Transaction({ userId: user._id, userName: user.fullName, phone: user.phone, type: 'deposit', amount: totalCost, network: 'SYSTEM', status: 'approved', note: `شراء VIP ${vipLevel}` });
    await transaction.save();
    const userData = user.toObject(); delete userData.password;
    res.json({ success: true, message: `✅ تم شراء VIP ${vipLevel}`, user: { vipLevel: userData.vipLevel, balance: userData.balance, totalDeposit: userData.totalDeposit } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ===== تشغيل الخادم =====
app.listen(PORT, () => console.log(`🚀 يعمل على المنفذ ${PORT}`));
module.exports = app;
