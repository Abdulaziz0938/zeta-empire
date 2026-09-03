require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// استيراد النماذج والدوال الخاصة بالمشروع
const User = require('./models/User');
const { completeTasksAndDistribute } = require('./taskEngine');
require('./cronJobs'); // تشغيل المهام المجدولة (الرواتب)

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ===== الاتصال بقاعدة البيانات =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ تم الاتصال بقاعدة البيانات MongoDB'))
.catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

// ===== واجهات API الأساسية =====

// التحقق من صحة الخادم
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ZETA EMPIRE Backend is running!' });
});

// تسجيل الدخول
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

// إنشاء حساب جديد
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

// جلب بيانات مستخدم
app.get('/api/users/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// إكمال المهام وتوزيع الأرباح
app.post('/api/tasks/complete', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await completeTasksAndDistribute(userId);
    res.json({ success: true, result });
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
