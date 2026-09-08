const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { distributeReferralCommissions } = require('./referral'); // تأكد من استيراد دالة العمولات

async function completeTasksAndDistribute(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'المستخدم غير موجود' };
    }

    // ============================================================
    // ✅ منطق QQmony: التحقق من اليوم وإعادة التعيين التلقائي
    // ============================================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = user.lastTaskDate ? new Date(user.lastTaskDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    // إذا كان اليوم مختلفاً عن آخر تاريخ للمهام، نعيد التعيين (تماماً مثل QQmony)
    if (!lastDate || lastDate.getTime() !== today.getTime()) {
      console.log(`🔄 إعادة تعيين مهام المستخدم ${user.phone} ليوم جديد`);
      user.tasksCompletedToday = 0;
      user.dailyEarnings = 0;
      user.lastTaskDate = new Date();
      // ✅ لا نقوم بحفظ هنا، لأننا سنحفظ في نهاية الدالة بعد إضافة الربح الجديد
      // لكننا نعدل الكائن مباشرة
    }

    // ============================================================
    // ✅ التحقق من صلاحية VIP وحساب الربح (مأخوذ من QQmony)
    // ============================================================
    const vipContract = { 0: 0, 1: 50, 2: 100, 3: 200, 4: 400, 5: 800, 6: 1600, 7: 3200 };
    const vipRates = { 0: 0, 1: 4.0, 2: 4.5, 3: 5.0, 4: 5.5, 5: 6.0, 6: 6.5, 7: 7.0 };

    const rate = vipRates[user.vipLevel] || 0;
    const contractAmount = vipContract[user.vipLevel] || 0;
    const totalDailyProfit = contractAmount * (rate / 100);

    // ✅ إذا كان المستوى VIP 0 أو الربح صفر، لا يمكن تنفيذ المهام
    if (totalDailyProfit <= 0) {
      return { success: false, message: 'لا توجد أرباح (تحتاج عقد VIP نشط)' };
    }

    // ✅ التحقق من أن المهام لم تُنجز اليوم بالكامل (5 مهام)
    if (user.tasksCompletedToday >= 5) {
      return { success: false, message: 'تم إكمال جميع مهام اليوم بالفعل' };
    }

    // ============================================================
    // ✅ حساب ربح المهمة الواحدة (تماماً مثل QQmony)
    // ============================================================
    const profitPerTask = totalDailyProfit / 5;

    // ============================================================
    // ✅ تحديث بيانات المستخدم (إضافة الربح)
    // ============================================================
    const newTasksCompleted = (user.tasksCompletedToday || 0) + 1;
    const newDailyEarnings = (user.dailyEarnings || 0) + profitPerTask;

    user.tasksCompletedToday = newTasksCompleted;
    user.dailyEarnings = newDailyEarnings;
    user.balance = (user.balance || 0) + profitPerTask;
    user.totalEarnings = (user.totalEarnings || 0) + profitPerTask;
    user.lastTaskDate = new Date(); // تحديث آخر تاريخ

    await user.save();
    console.log(`✅ تم إنجاز مهمة للمستخدم ${user.phone} (${newTasksCompleted}/5) +$${profitPerTask}`);

    // ============================================================
    // ✅ تسجيل المعاملة (Transaction)
    // ============================================================
    const transaction = new Transaction({
      userId: user._id,
      userName: user.fullName,
      phone: user.phone,
      type: 'commission',
      amount: profitPerTask,
      network: 'SYSTEM',
      status: 'approved',
      note: `أرباح يومية VIP ${user.vipLevel} (${rate}%) - مهمة ${newTasksCompleted}/5`
    });
    await transaction.save();

    // ============================================================
    // ✅ توزيع عمولات الإحالة (الدخل السلبي) - (كما في QQmony)
    // ============================================================
    // ملاحظة: distributeReferralCommissions موجودة في referral.js
    // وتوزع 5%، 3%، 1% على المستويات الثلاثة
    if (user.phone && profitPerTask > 0) {
      // نمرر رقم هاتف المستخدم والمبلغ (ربح المهمة)
      await distributeReferralCommissions(user.phone, profitPerTask, 'task');
    }

    return {
      success: true,
      message: 'تم توزيع الأرباح',
      profit: profitPerTask,
      newBalance: user.balance,
      tasksCompleted: user.tasksCompletedToday,
      dailyEarnings: user.dailyEarnings
    };

  } catch (error) {
    console.error('❌ خطأ في completeTasksAndDistribute:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { completeTasksAndDistribute };
