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
  console.log(`📌 بدء توزيع الأرباح للمستخدم ${userId}`);
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ المستخدم غير موجود');
      return { success: false, message: 'المستخدم غير موجود' };
    }

    console.log(`👤 المستخدم: ${user.fullName} (VIP ${user.vipLevel})`);
    console.log(`💰 الرصيد الحالي: ${user.balance}`);
    console.log(`💰 إجمالي الإيداعات: ${user.totalDeposit}`);

    // ✅ تعريف مبالغ العقد والنسب حسب مستوى VIP
    const vipContract = { 0: 0, 1: 50, 2: 100, 3: 200, 4: 400, 5: 800, 6: 1600, 7: 3200 };
    const vipRates = { 0: 0, 1: 4.0, 2: 4.5, 3: 5.0, 4: 5.5, 5: 6.0, 6: 6.5, 7: 7.0 };

    const rate = vipRates[user.vipLevel] || 0;
    const contractAmount = vipContract[user.vipLevel] || 0;
    const profit = contractAmount * (rate / 100);

    console.log(`📊 مستوى VIP: ${user.vipLevel}, النسبة: ${rate}%, مبلغ العقد: ${contractAmount}`);
    console.log(`💰 الربح المحسوب: ${profit}`);

    if (profit <= 0) {
      console.warn('⚠️ لا توجد أرباح لحسابها');
      return { 
        success: false, 
        message: 'لا توجد أرباح لحسابها (تأكد من أن لديك عقد VIP نشط).' 
      };
    }

    // ✅ التحقق من أن المهام لم تُنفذ اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.lastTaskDate) {
      const lastDate = new Date(user.lastTaskDate);
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() === today.getTime() && user.tasksCompletedToday === 5) {
        console.warn('⚠️ تم إكمال المهام اليوم بالفعل');
        return { 
          success: false, 
          message: 'لقد أكملت جميع مهام اليوم بالفعل. انتظر حتى الغد.' 
        };
      }
    }

    // 1. إضافة الربح إلى رصيد المستخدم
    const oldBalance = user.balance;
    user.balance = (Number(user.balance) || 0) + profit;
    user.dailyEarnings = (Number(user.dailyEarnings) || 0) + profit;
    user.totalEarnings = (Number(user.totalEarnings) || 0) + profit;
    user.tasksCompletedToday = 5;
    user.lastTaskDate = new Date();

    console.log(`💰 الرصيد القديم: ${oldBalance}, الرصيد الجديد: ${user.balance}`);

    await user.save();
    console.log('✅ تم حفظ تحديثات المستخدم');

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
    console.log(`✅ تم تسجيل معاملة الربح: $${profit}`);

    // 3. توزيع العمولات للإحالات (الدخل السلبي)
    try {
      await distributeReferralCommissions(user, profit);
      console.log('✅ تم توزيع عمولات الإحالة');
    } catch (err) {
      console.error('❌ فشل توزيع عمولات الإحالة:', err);
      // لا نوقف العملية بسبب فشل العمولات
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
