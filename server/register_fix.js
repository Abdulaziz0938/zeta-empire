app.post('/api/auth/register', async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'رقم الهاتف مسجل بالفعل' });

    // ✅ البحث عن المُحيل باستخدام كود الإحالة
    let parentPhone = 'ADMIN_MAIN';
    if (userData.referralCode) {
      const referrer = await User.findOne({ inviteCode: userData.referralCode });
      if (referrer) {
        parentPhone = referrer.phone;
        // زيادة عدد الإحالات للمُحيل
        referrer.referrals = (referrer.referrals || 0) + 1;
        await referrer.save();
      }
    }

    // إنشاء المستخدم الجديد
    const newUser = new User({
      ...userData,
      parent: parentPhone,
      balance: 2, // مكافأة ترحيبية
      totalEarning: 0,
      dailyEarnings: 0,
      referrals: 0,
      totalReferralCommissions: 0
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, phone: newUser.phone, isAdmin: newUser.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    const response = newUser.toObject();
    delete response.password;
    res.status(201).json({ success: true, user: response, token });
  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
