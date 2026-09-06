app.post('/api/auth/register', async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'رقم الهاتف مسجل بالفعل' });

    // 1. البحث عن المُحيل (إذا وجد)
    let referrer = null;
    if (userData.referralCode) {
      referrer = await User.findOne({ inviteCode: userData.referralCode });
    }

    // 2. بناء بيانات المستخدم الجديد مع شجرة الإحالة الصحيحة
    const newUserData = {
      ...userData,
      parentA: referrer ? referrer._id : null,
      parentB: referrer ? referrer.parentA : null,
      parentC: referrer ? referrer.parentB : null
    };

    const newUser = new User(newUserData);
    await newUser.save();

    // 3. زيادة عدد الإحالات للمُحيل المباشر
    if (referrer) {
      referrer.referrals = (referrer.referrals || 0) + 1;
      await referrer.save();
    }

    const token = jwt.sign({ id: newUser._id, phone: newUser.phone, isAdmin: newUser.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    const response = newUser.toObject();
    delete response.password;
    res.status(201).json({ success: true, user: response, token });
  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
