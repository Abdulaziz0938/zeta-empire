const cron = require('node-cron');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

async function getDirectTeamCount(leaderId) {
  return await User.countDocuments({ parentA: leaderId });
}
async function logTransaction(userId, amount, note) {
  const user = await User.findById(userId);
  if (!user) return;
  const tx = new Transaction({ userId: user._id, userName: user.fullName, phone: user.phone, type: 'commission', amount, network: 'SYSTEM', status: 'approved', note });
  await tx.save();
}

cron.schedule('0 0 */30 * *', async () => {
  console.log('🔄 بدء صرف رواتب القادة...');
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
        await logTransaction(leader._id, salary, `راتب قائد فريق (VIP ${leader.vipLevel})`);
        console.log(`✅ صرف $${salary} للقائد ${leader.fullName}`);
      }
    }
  } catch (error) { console.error('❌ خطأ بالرواتب:', error); }
});
console.log('⏰ تم جدولة رواتب القادة (كل 30 يوم).');
