const { distributeReferralCommissions } = require('./referral');

// Task Split Engine - Node.js Backend logic
function generateDailyTasks(userDeposit, vipLevelCommission) {
  const taskPoolAmount = userDeposit * 0.98; // 98% من المبلغ المودع
  const taskCount = 5;
  let tasks = [];
  let remaining = taskPoolAmount;

  // تقسيم المبالغ عشوائياً على 5 مهام بحيث يكون المجموع يساوي 98% تماماً
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

// دالة إكمال المهام وتوزيع الأرباح مع الدخل السلبي للإحالات
async function completeTasksAndDistribute(userId) {
  const user = await User.findById(userId);
  const profit = user.deposit * (user.vipCommissionRate / 100);

  // 1. إضافة الربح وإرجاع مبلغ العقد إلى الحساب
  user.balance += profit;
  user.dailyEarnings += profit;
  user.totalEarnings += profit;
  await user.save();

  // 2. توزيع عمولة الإحالة (الدخل السلبي) بشرط أن يكون المحيل VIP1 فأعلى
  await distributeReferralCommissions(user, profit);
}
