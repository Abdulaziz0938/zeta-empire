// server/index.js - ZETA EMPIRE Backend (نسخة كاملة مع AuditLog)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===== استيراد النماذج =====
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const AuditLog = require('./models/AuditLog');
const { completeTasksAndDistribute } = require('./taskEngine');
require('./cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'zeta_empire_super_secret_key_2026';

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== الاتصال بقاعدة البيانات =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ تم الاتصال بقاعدة البيانات MongoDB'))
.catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

// ============================================================
// ✅ دالة مساعدة لحفظ سجل الإجراءات (Audit Log)
// ============================================================
async function saveAuditLog(admin, action, details = {}) {
  try {
    const log = new AuditLog({
      admin: admin || 'المدير الفائق',
      action: action,
      details: details,
      timestamp: new Date()
    });
    await log.save();
    console.log(`📝 سجل إجراء: ${action}`);
  } catch (error) {
    console.error('❌ فشل حفظ سجل الإجراءات:', error);
  }
}

// ============================================================
// ✅ واجهات API الأساسية (المستخدمين والمصادقة)
// ============================================================

// [GET] التحقق من صحة الخادم
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ZETA EMPIRE Backend is running!' });
});

// [GET] جلب جميع المستخدمين (للأدمن)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -withdrawPin');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] جلب مستخدم برقم الهاتف
app.get('/api/users/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] جلب شجرة الفريق لمستخدم
app.get('/api/team/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('parentA', 'fullName phone vipLevel balance totalDeposit')
      .populate('parentB', 'fullName phone vipLevel balance totalDeposit')
      .populate('parentC', 'fullName phone vipLevel balance totalDeposit');
    
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    
    const team = {
      A: user.parentA || [],
      B: user.parentB || [],
      C: user.parentC || []
    };
    
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] تسجيل الدخول (مع bcrypt و JWT)
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }
    const token = jwt.sign({ id: user._id, phone: user.phone, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    const userData = user.toObject();
    delete userData.password;
    res.json({ success: true, user: userData, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] إنشاء حساب جديد (مع bcrypt)
app.post('/api/auth/register', async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'رقم الهاتف مسجل بالفعل' });
    }
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

// [POST] إكمال المهام
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

// ============================================================
// ✅ واجهات API للمعاملات (الإيداع والسحب)
// ============================================================

// [POST] إنشاء معاملة جديدة
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, userName, phone, type, amount, network, address, txHash, fee, note } = req.body;
    const transaction = new Transaction({
      userId, userName, phone, type, amount, network, address, txHash, fee, note,
      status: 'pending'
    });
    await transaction.save();
    await saveAuditLog('النظام', `إنشاء طلب ${type}`, { userId, amount, network });
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] جلب جميع المعاملات (للأدمن)
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] جلب معاملات مستخدم محدد
app.get('/api/transactions/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ✅ واجهات الإشعارات
// ============================================================

// [GET] جلب الإشعارات (آخر المعاملات)
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

// ============================================================
// ✅ واجهات إدارة الأدمن (مع Audit Log)
// ============================================================

// [PUT] ترقية مستوى VIP
app.put('/api/admin/promote/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.vipLevel >= 7) return res.status(400).json({ success: false, message: 'المستخدم في أعلى مستوى' });
    const oldVip = user.vipLevel;
    user.vipLevel += 1;
    await user.save();
    await saveAuditLog('المدير الفائق', `ترقية المستخدم ${user.fullName}`, { from: oldVip, to: user.vipLevel });
    res.json({ success: true, message: `تمت الترقية إلى VIP ${user.vipLevel}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [PUT] تخفيض مستوى VIP
app.put('/api/admin/demote/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.vipLevel <= 0) return res.status(400).json({ success: false, message: 'المستخدم في أدنى مستوى' });
    const oldVip = user.vipLevel;
    user.vipLevel -= 1;
    await user.save();
    await saveAuditLog('المدير الفائق', `تخفيض المستخدم ${user.fullName}`, { from: oldVip, to: user.vipLevel });
    res.json({ success: true, message: `تم التخفيض إلى VIP ${user.vipLevel}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [PUT] تجميد / إلغاء تجميد مستخدم
app.put('/api/admin/ban/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    const oldStatus = user.status;
    user.status = user.status === 'نشط' ? 'موقف' : 'نشط';
    await user.save();
    await saveAuditLog('المدير الفائق', `${user.status === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} حساب ${user.fullName}`, { from: oldStatus, to: user.status });
    res.json({ success: true, message: `تم ${user.status === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} الحساب`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [PUT] تعديل رصيد مستخدم يدوياً (من الأدمن)
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

// ============================================================
// ✅ ✅ دوال قبول ورفض الطلبات (مع Audit Log)
// ============================================================

// [PUT] قبول طلب معاملة (إيداع أو سحب)
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
      if (user.balance < tx.amount) {
        return res.status(400).json({ success: false, message: 'الرصيد غير كافٍ' });
      }
      user.balance -= tx.amount;
      user.totalWithdrawal += tx.amount;
    }

    await user.save();

    const oldStatus = tx.status;
    tx.status = 'approved';
    tx.adminAction = 'تم القبول بواسطة المدير';
    await tx.save();

    await saveAuditLog('المدير الفائق', `قبول طلب ${tx.type} #${tx._id}`, {
      userId: user._id,
      userName: user.fullName,
      amount: tx.amount,
      fromStatus: oldStatus,
      toStatus: 'approved'
    });

    res.json({ 
      success: true, 
      message: 'تم قبول المعاملة وتحديث الرصيد بنجاح', 
      transaction: tx,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [PUT] رفض طلب معاملة (مع Audit Log)
app.put('/api/admin/reject/:txId', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });

    const oldStatus = tx.status;
    tx.status = 'rejected';
    tx.adminAction = 'تم الرفض بواسطة المدير';
    await tx.save();

    await saveAuditLog('المدير الفائق', `رفض طلب ${tx.type} #${tx._id}`, {
      userId: tx.userId,
      userName: tx.userName,
      amount: tx.amount,
      fromStatus: oldStatus,
      toStatus: 'rejected'
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

// ============================================================
// ✅ واجهات الإشعارات والإدارة الأخرى
// ============================================================

// [POST] إرسال إشعار مخصص لمستخدم
app.post('/api/admin/notify/:userId', async (req, res) => {
  const { message } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    console.log(`📨 إشعار إلى ${user.fullName}: ${message}`);
    await saveAuditLog('المدير الفائق', `إرسال إشعار مخصص إلى ${user.fullName}`, { message });
    res.json({ success: true, message: 'تم إرسال الإشعار بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] إرسال إشعار جماعي لجميع المستخدمين
app.post('/api/admin/notify-all', async (req, res) => {
  const { message } = req.body;
  try {
    const users = await User.find();
    console.log(`📨 إشعار جماعي لـ ${users.length} مستخدم: ${message}`);
    await saveAuditLog('المدير الفائق', 'إرسال إشعار جماعي', { count: users.length, message });
    res.json({ success: true, message: `تم إرسال الإشعار لـ ${users.length} مستخدم` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ✅ جلب سجل الإجراءات (للأدمن)
// ============================================================
app.get('/api/admin/audit', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, logs });
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
