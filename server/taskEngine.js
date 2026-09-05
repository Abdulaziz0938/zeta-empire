const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { distributeReferralCommissions } = require('./referral');

async function completeTasksAndDistribute(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'المستخدم غير موجود' };

    const vipContract = { 0: 0, 1: 50, 2: 100, 3: 200, 4: 400, 5: 800, 6: 1600, 7: 3200 };
    const vipRates = { 0: 0, 1: 4.0, 2: 4.5, 3: 5.0, 4: 5.5, 5: 6.0, 6: 6.5, 7: 7.0 };

    const rate = vipRates[user.vipLevel] || 0;
    const contractAmount = vipContract[user.vipLevel] || 0;
    const profit = contractAmount * (rate / 100);

    if (profit <= 0) return { success: false, message: 'لا توجد أرباح (تحتاج عقد VIP نشط)' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (user.lastTaskDate) {
      const lastDate = new Date(user.lastTaskDate);
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() === today.getTime() && user.tasksCompletedToday === 5) {
        return { success: false, message: 'تم إكمال المهام اليوم بالفعل' };
      }
    }

    user.balance = (Number(user.balance) || 0) + profit;
    user.dailyEarnings = (Number(user.dailyEarnings) || 0) + profit;
    user.totalEarnings = (Number(user.totalEarnings) || 0) + profit;
    user.tasksCompletedToday = 5;
    user.lastTaskDate = new Date();
    await user.save();

    const transaction = new Transaction({ userId: user._id, userName: user.fullName, phone: user.phone, type: 'commission', amount: profit, network: 'SYSTEM', status: 'approved', note: `أرباح يومية VIP ${user.vipLevel}` });
    await transaction.save();

    await distributeReferralCommissions(user, profit);
    return { success: true, message: 'تم توزيع الأرباح', profit, newBalance: user.balance };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
module.exports = { completeTasksAndDistribute };
