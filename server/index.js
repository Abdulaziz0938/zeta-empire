// server/index.js - ZETA EMPIRE Backend (نسخة كاملة ومحدثة)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// استيراد النماذج
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { completeTasksAndDistribute } = require('./taskEngine');
require('./cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;

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

// =====================================================
// ✅ واجهات API الأساسية (المستخدمين والمصادقة)
// =====================================================

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

// [POST] تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] إنشاء حساب جديد
app.post('/api/auth/register', async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'رقم الهاتف مسجل بالفعل' });
    }
    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] إكمال المهام
app.post('/api/tasks/complete', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await completeTasksAndDistribute(userId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// ✅ واجهات API للمعاملات (الإيداع والسحب)
// =====================================================

// [POST] إنشاء معاملة جديدة
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, userName, phone, type, amount, network, address, txHash, fee, note } = req.body;
    const transaction = new Transaction({
      userId, userName, phone, type, amount, network, address, txHash, fee, note,
      status: 'pending'
    });
    await transaction.save();
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

// =====================================================
// ✅ واجهات الإشعارات
// =====================================================

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

// =====================================================
// ✅ واجهات إدارة الأدمن
// =====================================================

// [PUT] ترقية مستوى VIP
app.put('/api/admin/promote/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.vipLevel >= 7) return res.status(400).json({ success: false, message: 'المستخدم في أعلى مستوى' });
    user.vipLevel += 1;
    await user.save();
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
    user.vipLevel -= 1;
    await user.save();
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
    user.status = user.status === 'نشط' ? 'موقف' : 'نشط';
    await user.save();
    res.json({ success: true, message: `تم ${user.status === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} الحساب`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [PUT] تعديل رصيد مستخدم
app.put('/api/admin/balance/:userId', async (req, res) => {
  const { amount, reason } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    user.balance += parseFloat(amount);
    await user.save();
    res.json({ success: true, message: `تم ${parseFloat(amount) >= 0 ? 'إضافة' : 'خصم'} $${Math.abs(amount)}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// ✅ ✅ دوال قبول ورفض الطلبات (الجديدة) ✅ ✅
// =====================================================

// [PUT] قبول طلب معاملة
app.put('/api/admin/approve/:txId', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
    tx.status = 'approved';
    tx.adminAction = 'تم القبول بواسطة المدير';
    await tx.save();
    res.json({ success: true, message: 'تم قبول المعاملة', transaction: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [PUT] رفض طلب معاملة
app.put('/api/admin/reject/:txId', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ success: false, message: 'المعاملة غير موجودة' });
    tx.status = 'rejected';
    tx.adminAction = 'تم الرفض بواسطة المدير';
    await tx.save();
    res.json({ success: true, message: 'تم رفض المعاملة', transaction: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// ✅ واجهات الإشعارات والإدارة الأخرى
// =====================================================

// [POST] إرسال إشعار مخصص لمستخدم
app.post('/api/admin/notify/:userId', async (req, res) => {
  const { message } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    console.log(`📨 إشعار إلى ${user.fullName}: ${message}`);
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
    res.json({ success: true, message: `تم إرسال الإشعار لـ ${users.length} مستخدم` });
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
