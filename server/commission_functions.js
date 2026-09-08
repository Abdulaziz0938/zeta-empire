// ===== توزيع العمولات على 3 مستويات =====
async function distributeReferralCommissions(userPhone, amount, type = 'deposit') {
  // نسب العمولات: المستوى الأول 5%، الثاني 3%، الثالث 1%
  const rates = [0.05, 0.03, 0.01];
  let currentPhone = userPhone;
  let level = 0;
  let totalCommissions = 0;

  while (currentPhone && currentPhone !== 'ADMIN_MAIN' && level < 3) {
    const parentUser = await User.findOne({ phone: currentPhone });
    if (!parentUser || parentUser.vipLevel < 1) break; // فقط الأعضاء النشطون (VIP1+) يستحقون العمولات

    const commission = amount * rates[level];
    if (commission > 0) {
      parentUser.balance = (parentUser.balance || 0) + commission;
      parentUser.totalEarnings = (parentUser.totalEarnings || 0) + commission;
      parentUser.totalReferralCommissions = (parentUser.totalReferralCommissions || 0) + commission;
      if (type === 'deposit') parentUser.referralEarnings = (parentUser.referralEarnings || 0) + commission;
      await parentUser.save();

      // تسجيل العمولة في سجل العمولات (commission_log)
      const logEntry = {
        userId: parentUser._id,
        phone: parentUser.phone,
        type: type,
        amount: commission,
        source: userPhone,
        level: level + 1,
        timestamp: Date.now()
      };
      // يمكن حفظها في collection منفصل إذا أردت
      console.log(`✅ عمولة المستوى ${level+1} (${rates[level]*100}%): ${commission} للمستخدم ${parentUser.phone}`);
      totalCommissions += commission;
    }

    currentPhone = parentUser.parent;
    level++;
  }

  return totalCommissions;
}
