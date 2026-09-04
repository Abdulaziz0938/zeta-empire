const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { distributeReferralCommissions } = require('./referral');

// ===== إنشاء المهام اليومية =====
function generateDailyTasks(userDeposit, vipLevelCommission) {
  const taskPoolAmount = userDeposit * 0.98;
  const taskCount = 5;
  let tasks = [];
  let remaining = taskPoolAmount;

  for (let i = 0; i < taskCount - 1; i++) {
    let randomPrice = parseFloat((Math.random() * (remaining / (taskCount - i))).toFixed(2));
    tasks.push({ taskId: i + 1, amount: randomPrice, status: "pending" });
    remaining -= randomPrice;
  }
  tasks.push({ taskId: taskCount, amount: parseFloat(remaining.toFixed(2)), status: "pending" });

  const netProfit = userDeposit * (vipLevelCommission / 100);

  return {
    totalCapitalLocked: taskPoolAmount,
    netProfit: netProfit,
    tasks: tasks
  };
}

// ===== إكمال المهام وتوزيع الأرباح =====
async function completeTasksAndDistribute(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('المستخدم غير موجود');

    // تحديد نسبة العمولة حسب مستوى VIP
    const vipRates = { 0: 0, 1: 4.0, 2: 4.5, 3: 5.0, 4: 5.5, 5: 6.0, 6: 6.5, 7: 7.0 };
    const rate = vipRates[user.vipLevel] || 0;
    const profit = user.totalDeposit * (rate / 100);

    if (profit <= 0) {
      return { success: false, message: 'لا توجد أرباح لحسابها' };
    }

    // 1. إضافة الربح إلى رصيد المستخدم
    user.balance += profit;
    user.dailyEarnings += profit;
    user.totalEarnings += profit;
    user.tasksCompletedToday = 0; // إعادة تعيين المهام لليوم التالي
    await user.save();

    // 2. تسجيل المعاملة (ربح)
    const transaction = new Transaction({
      userId: user._id,
      userName: user.fullName,
      phone: user.phone,
      type: 'commission',
      amount: profit,
      network: 'SYSTEM',
      fee: 0,
      status: 'approved',
      note: `أرباح يومية VIP ${user.vipLevel} (${rate}%)`
    });
    await transaction.save();

    // 3. توزيع العمولات للإحالات (الدخل السلبي)
    try {
      await distributeReferralCommissions(user, profit);
    } catch (err) {
      console.error('❌ فشل توزيع عمولات الإحالة:', err);
    }

    return {
      success: true,
      message: 'تم توزيع الأرباح بنجاح',
      profit: profit,
      newBalance: user.balance
    };
  } catch (error) {
    console.error('❌ خطأ في completeTasksAndDistribute:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  generateDailyTasks,
  completeTasksAndDistribute
};
