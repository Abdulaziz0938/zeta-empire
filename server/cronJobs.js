const cron = require('node-cron');
const User = require('./models/User');

// دالة مؤقتة لحساب عدد الفريق المباشر
async function getDirectTeamCount(userId) {
  return Math.floor(Math.random() * 61);
}

// دالة مؤقتة لتسجيل المعاملات
async function LogTransaction(userId, amount, description) {
  console.log(`📝 تسجيل معاملة: المستخدم ${userId}، المبلغ ${amount}، السبب: ${description}`);
  return true;
}

// مهمة الرواتب الشهرية
cron.schedule('0 0 */30 * *', async () => {
  console.log('🔄 تشغيل مهمة رواتب القادة...');
  try {
    const leaders = await User.find({ vipLevel: { $gte: 5 } });
    for (let leader of leaders) {
      let teamCount = await getDirectTeamCount(leader._id);
      let salary = 0;
      if (teamCount >= 50) salary = 100;
      else if (teamCount >= 30) salary = 60;
      else if (teamCount >= 10) salary = 20;
      if (salary > 0) {
        leader.balance += salary;
        await leader.save();
        await LogTransaction(leader._id, salary, "Monthly Team Leader Salary");
        console.log(`✅ تم صرف ${salary}$ للقائد ${leader.phone}`);
      }
    }
    console.log('✅ انتهت مهمة الرواتب بنجاح.');
  } catch (error) {
    console.error('❌ خطأ في مهمة الرواتب:', error);
  }
});

module.exports = cron;
