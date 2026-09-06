const cron = require('node-cron');
const User = require('./models/User');

// ===== إعادة تعيين المهام يومياً عند منتصف الليل =====
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 جارٍ إعادة تعيين المهام اليومية...');
  try {
    const result = await User.updateMany({}, { tasksCompletedToday: 0, lastTaskDate: null });
    console.log(`✅ تم إعادة تعيين المهام لـ ${result.modifiedCount} مستخدم`);
  } catch (error) {
    console.error('❌ فشل إعادة تعيين المهام:', error);
  }
});

console.log('⏰ تم جدولة إعادة تعيين المهام يومياً عند منتصف الليل');
