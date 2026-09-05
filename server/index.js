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

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ تم الاتصال بقاعدة البيانات MongoDB'))
.catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

async function saveAuditLog(admin, action, details = {}) {
  try {
    const log = new AuditLog({ admin, action, details, timestamp: new Date() });
    await log.save();
  } catch (error) {
    console.error('❌ فشل حفظ سجل الإجراءات:', error);
  }
}

const processedTransactions = new Set();

function isWithdrawTimeAllowed() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours + minutes / 60;
  if (dayOfWeek === 0) return false;
  if (currentTime >= 12 && currentTime < 16) return true;
  return false;
}

const ALLOWED_WITHDRAW_AMOUNTS = [14, 25, 50, 100, 200, 500, 1000];

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




// ===== جلب بيانات الفريق (مع populate) =====
app.get('/api/team/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('parentA', 'fullName phone vipLevel balance totalDeposit')
      .populate('parentB', 'fullName phone vipLevel balance totalDeposit')
      .populate('parentC', 'fullName phone vipLevel balance totalDeposit');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    // تحويل البيانات إلى مصفوفات
    const team = {
      A: user.parentA || [],
      B: user.parentB || [],
      C: user.parentC || []
    };

    res.json({ success: true, team });
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الفريق:', error);
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
    if (userData.referralCode) {
      const referrer = await User.findOne({ inviteCode: userData.referralCode });
      if (referrer) {
        referrer.referrals = (referrer.referrals || 0) + 1;
        await referrer.save();
      }
    }
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

app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, userName, phone, type, amount, network, address, txHash, fee, note } = req.body;

    if (type === 'withdraw' && !isWithdrawTimeAllowed()) {
      return res.status(403).json({
        success: false,
        message: '⛔ السحب غير متاح حالياً. السحب مسموح من 12 ظهراً إلى 4 عصراً (ما عدا الأحد).'
      });
    }

    if (type === 'withdraw' && !ALLOWED_WITHDRAW_AMOUNTS.includes(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: `⚠️ مبلغ السحب غير مسموح به. المبالغ المسموحة: ${ALLOWED_WITHDRAW_AMOUNTS.join(', ')}`
      });
    }

    const transaction = new Transaction({
      userId,
      userName,
      phone,
      type,
      amount,
      network,
      address,
      txHash,
      fee,
      note,
      status: 'pending'
    });
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

app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.userId;
    let filter = { targetUserId: null };
    if (userId) {
      filter = { $or: [{ targetUserId: null }, { targetUserId: userId }] };
    }
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/audit', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
    user.balance = (Number(user.balance) || 0) + parseFloat(amount);
    await user.save();
    await saveAuditLog('المدير الفائق', `تعديل رصيد ${user.fullName}`, { amount, reason, from: oldBalance, to: user.balance });
    res.json({ success: true, message: `تم ${parseFloat(amount) >= 0 ? 'إضافة' : 'خصم'} $${Math.abs(amount)}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/approve/:txId', async (req, res) => {
  const txId = req.params.txId;
  if (processedTransactions.has(txId)) {
    return res.status(409).json({ success: false, message: 'هذه المعاملة تمت معالجتها مسبقاً' });
  }
  try {
    const tx = await Transaction.findById(txId);
    if (!tx) return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
    if (tx.status !== 'pending') {
      return res.status(400).json({ success: false, message: `المعاملة بحالة ${tx.status} ولا يمكن معالجتها` });
    }
    const user = await User.findById(tx.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (tx.type === 'deposit') {
      user.balance = (Number(user.balance) || 0) + tx.amount;
      user.totalDeposit = (Number(user.totalDeposit) || 0) + tx.amount;
    } else if (tx.type === 'withdraw') {
      if (user.balance < tx.amount) {
        return res.status(400).json({ success: false, message: 'الرصيد غير كافٍ' });
      }
      user.balance = (Number(user.balance) || 0) - tx.amount;
      user.totalWithdrawal = (Number(user.totalWithdrawal) || 0) + tx.amount;
    }
    await user.save();
    tx.status = 'approved';
    tx.adminAction = 'تم القبول بواسطة المدير';
    await tx.save();
    processedTransactions.add(txId);
    setTimeout(() => processedTransactions.delete(txId), 10 * 60 * 1000);
    await saveAuditLog('المدير الفائق', `قبول طلب ${tx.type} #${txId}`, {
      userId: user._id,
      amount: tx.amount,
      newBalance: user.balance
    });
    const userData = user.toObject();
    delete userData.password;
    res.json({
      success: true,
      message: 'تم قبول المعاملة بنجاح',
      transaction: tx,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/reject/:txId', async (req, res) => {
  const txId = req.params.txId;
  if (processedTransactions.has(txId)) {
    return res.status(409).json({ success: false, message: 'هذه المعاملة تمت معالجتها مسبقاً' });
  }
  try {
    const tx = await Transaction.findById(txId);
    if (!tx) return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
    if (tx.status !== 'pending') {
      return res.status(400).json({ success: false, message: `المعاملة بحالة ${tx.status} ولا يمكن معالجتها` });
    }
    tx.status = 'rejected';
    tx.adminAction = 'تم الرفض بواسطة المدير';
    await tx.save();
    processedTransactions.add(txId);
    setTimeout(() => processedTransactions.delete(txId), 10 * 60 * 1000);
    await saveAuditLog('المدير الفائق', `رفض طلب ${tx.type} #${txId}`, {
      userId: tx.userId,
      amount: tx.amount
    });
    res.json({
      success: true,
      message: 'تم رفض المعاملة',
      transaction: tx
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/notify/:userId', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'الرجاء كتابة رسالة' });
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    const notification = new Notification({
      message: message.trim(),
      type: 'info',
      sender: 'المدير الفائق',
      targetUserId: user._id
    });
    await notification.save();
    await saveAuditLog('المدير الفائق', `إشعار مخصص إلى ${user.fullName}`, { message });
    res.json({ success: true, message: 'تم إرسال الإشعار للمستخدم' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/notify-all', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'الرجاء كتابة رسالة' });
  }
  try {
    const notification = new Notification({
      message: message.trim(),
      type: 'info',
      sender: 'المدير الفائق',
      targetUserId: null
    });
    await notification.save();
    await saveAuditLog('المدير الفائق', 'إرسال إشعار جماعي', { message });
    res.json({ success: true, message: 'تم إرسال الإشعار لجميع المستخدمين' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ✅ شراء VIP (نسخة معدلة - لا تزيد totalDeposit)
// ============================================================
app.post('/api/vip/purchase', async (req, res) => {
  const { userId, vipLevel } = req.body;
  try {
    const vipPrices = { 1: 50, 2: 100, 3: 200, 4: 400, 5: 800, 6: 1600, 7: 3200 };
    if (!vipPrices[vipLevel]) {
      return res.status(400).json({ success: false, message: 'مستوى VIP غير صحيح' });
    }

    const totalCost = vipPrices[vipLevel];

    // ✅ عملية ذرية: خصم الرصيد ورفع المستوى فقط (بدون زيادة totalDeposit)
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        balance: { $gte: totalCost },
        vipLevel: { $lt: vipLevel }
      },
      {
        $inc: {
          balance: -totalCost
          // ✅ تم إزالة totalDeposit من التحديث
        },
        $set: { vipLevel: vipLevel }
      },
      { new: true }
    );

    if (!user) {
      const existing = await User.findById(userId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      }
      if (existing.vipLevel >= vipLevel) {
        return res.status(400).json({
          success: false,
          message: `أنت بالفعل في VIP ${existing.vipLevel} أو أعلى!`
        });
      }
      if (existing.balance < totalCost) {
        return res.status(400).json({
          success: false,
          message: `الرصيد غير كافٍ. رصيدك: $${existing.balance}, المطلوب: $${totalCost}`
        });
      }
      return res.status(400).json({ success: false, message: 'حدث خطأ غير متوقع' });
    }

    // تسجيل المعاملة كمرجع (نوعها 'purchase' وليس 'deposit')
    const transaction = new Transaction({
      userId: user._id,
      userName: user.fullName,
      phone: user.phone,
      type: 'purchase', // ✅ نوع مميز لشراء VIP
      amount: totalCost,
      network: 'SYSTEM',
      fee: 0,
      status: 'approved',
      note: `شراء VIP ${vipLevel} (بخصم $${totalCost} من الرصيد)`
    });
    await transaction.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: `✅ تم شراء VIP ${vipLevel} بنجاح!`,
      user: {
        vipLevel: userData.vipLevel,
        balance: userData.balance,
        totalDeposit: userData.totalDeposit // لم تتغير
      }
    });

  } catch (error) {
    console.error('❌ خطأ في شراء VIP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 خادم ZETA EMPIRE يعمل على المنفذ ${PORT}`);
  console.log(`📡 رابط API: http://localhost:${PORT}/api/health`);
});

module.exports = app;
