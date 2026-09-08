const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { distributeReferralCommissions } = require('./referral');

async function completeTasksAndDistribute(userId) {
  try {
    // ============================================================
    // 1. حساب قيمة الربح للمهمة الواحدة (نحسبها يدوياً لمنع التلاعب)
    // ============================================================
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'المستخدم غير موجود' };
    }

    const vipContract = { 0: 0, 1: 50, 2: 100, 3: 200, 4: 400, 5: 800, 6: 1600, 7: 3200 };
    const vipRates = { 0: 0, 1: 4.0, 2: 4.5, 3: 5.0, 4: 5.5, 5: 6.0, 6: 6.5, 7: 7.0 };

    const rate = vipRates[user.vipLevel] || 0;
    const contractAmount = vipContract[user.vipLevel] || 0;
    const totalDailyProfit = contractAmount * (rate / 100);

    if (totalDailyProfit <= 0) {
      return { success: false, message: 'لا توجد أرباح (تحتاج عقد VIP نشط)' };
    }

    const profitPerTask = totalDailyProfit / 5;

    // ============================================================
    // 2. عملية ذرية 100% (Atomic Update) - تمنع أي شكل من أشكال الغش
    // ============================================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ الشرط: يجب أن يكون عدد المهام أقل من 5 (لم يكملها بعد)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        tasksCompletedToday: { $lt: 5 } // 🔥 هذا الشرط هو خط الدفاع الأخير
      },
      {
        $inc: {
          tasksCompletedToday: 1,
          balance: profitPerTask,
          dailyEarnings: profitPerTask,
          totalEarnings: profitPerTask
        },
        $set: {
          lastTaskDate: new Date()
        }
      },
      { new: true } // إرجاع المستند الجديد بعد التحديث
    );

    // ============================================================
    // 3. إذا لم يتم العثور على مستند، هذا يعني أن المهام مكتملة (5/5)
    // أو أن هناك محاولة غش (لأن الشرط فشل)
    // ============================================================
    if (!updatedUser) {
      return { success: false, message: 'تم إكمال جميع مهام اليوم بالفعل أو حدث تعارض في الطلب' };
    }

    // ============================================================
    // 4. تسجيل المعاملة (فقط إذا نجحت العملية الذرية)
    // ============================================================
    const transaction = new Transaction({
      userId: updatedUser._id,
      userName: updatedUser.fullName,
      phone: updatedUser.phone,
      type: 'commission',
      amount: profitPerTask,
      network: 'SYSTEM',
      status: 'approved',
      note: `أرباح يومية VIP ${updatedUser.vipLevel} (${rate}%) - مهمة ${updatedUser.tasksCompletedToday}/5`
    });
    await transaction.save();

    // ============================================================
    // 5. توزيع عمولات الإحالة (الدخل السلبي)
    // ============================================================
    if (updatedUser.phone && profitPerTask > 0) {
      await distributeReferralCommissions(updatedUser.phone, profitPerTask, 'task');
    }

    console.log(`✅ تم إنجاز مهمة للمستخدم ${updatedUser.phone} (${updatedUser.tasksCompletedToday}/5) +$${profitPerTask}`);

    return {
      success: true,
      message: 'تم توزيع الأرباح',
      profit: profitPerTask,
      newBalance: updatedUser.balance,
      tasksCompleted: updatedUser.tasksCompletedToday,
      dailyEarnings: updatedUser.dailyEarnings
    };

  } catch (error) {
    console.error('❌ خطأ في completeTasksAndDistribute:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { completeTasksAndDistribute };
