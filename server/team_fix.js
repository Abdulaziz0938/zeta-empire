// ===== جلب شجرة الإحالة (3 مستويات) =====
app.get('/api/team/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    const phone = user.phone;

    // جلب جميع المستخدمين
    const allUsers = await User.find().select('phone fullName vipLevel balance totalDeposit referrals parent');

    // المستوى الأول: من يشيرون إلى هذا المستخدم مباشرة
    const level1 = allUsers.filter(u => u.parent === phone);
    // المستوى الثاني: من يشيرون إلى أعضاء المستوى الأول
    const level1Phones = level1.map(u => u.phone);
    const level2 = allUsers.filter(u => level1Phones.includes(u.parent));
    // المستوى الثالث: من يشيرون إلى أعضاء المستوى الثاني
    const level2Phones = level2.map(u => u.phone);
    const level3 = allUsers.filter(u => level2Phones.includes(u.parent));

    // إجمالي العمولات المستلمة من الإحالات
    const totalReferralCommissions = user.totalReferralCommissions || 0;

    res.json({
      success: true,
      team: {
        level1: level1.map(u => ({ phone: u.phone, fullName: u.fullName, vipLevel: u.vipLevel, balance: u.balance, totalDeposit: u.totalDeposit })),
        level2: level2.map(u => ({ phone: u.phone, fullName: u.fullName, vipLevel: u.vipLevel, balance: u.balance, totalDeposit: u.totalDeposit })),
        level3: level3.map(u => ({ phone: u.phone, fullName: u.fullName, vipLevel: u.vipLevel, balance: u.balance, totalDeposit: u.totalDeposit }))
      },
      totalReferralCommissions
    });
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الفريق:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
