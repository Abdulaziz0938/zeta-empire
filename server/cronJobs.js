// server/cronJobs.js
const cron = require('node-cron');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

// دالة لحساب عدد الفريق المباشر
async function getDirectTeamCount(leaderId) {
  return await User.countDocuments({ parentA: leaderId });
}

// دالة لتسجيل المعاملة
async function logTransaction(userId, amount, note) {
  const user = await User.findById(userId);
  if (!user) return;
  const tx = new Transaction({
    userId: user._id,
    userName: user.fullName,
    phone: user.phone,
    type: 'commission',
    amount: amount,
    network: 'SYSTEM',
    status: 'approved',
    note: note
  });
  await tx.save();
}

// ===== المهمة المجدولة: تعمل كل 30 يوم في منتصف الليل =====
cron.schedule('0 0 */30 * *', async () => {
  console.log('🔄 بدء تشغيل مهمة صرف رواتب القادة الشهرية...');
  try {
    const leaders = await User.find({ vipLevel: { $gte: 5 } });
    for (let leader of leaders) {
      const teamCount = await getDirectTeamCount(leader._id);
      let salary = 0;
      if (teamCount >= 50) salary = 100;
      else if (teamCount >= 30) salary = 60;
      else if (teamCount >= 10) salary = 20;

      if (salary > 0) {
        leader.balance = (leader.balance || 0) + salary;
        await leader.save();
        await logTransaction(leader._id, salary, `راتب قائد فريق شهري (VIP ${leader.vipLevel})`);
        console.log(`✅ تم صرف $${salary} للقائد ${leader.fullName}`);
      }
    }
    console.log('✅ انتهت مهمة صرف الرواتب.');
  } catch (error) {
    console.error('❌ فشل تنفيذ مهمة الرواتب:', error);
  }
});

console.log('⏰ تم جدولة مهمة رواتب القادة (تعمل كل 30 يوم).');
