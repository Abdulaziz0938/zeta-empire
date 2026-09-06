const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  // 1. جلب المُحيل (Alhousaen)
  const referrer = await User.findOne({ phone: '963939152197' });
  if (!referrer) {
    console.log('❌ لم يتم العثور على المُحيل');
    return;
  }

  // 2. جلب المستخدمين الذين استخدموا كود دعوته (بناءً على معرفاتهم)
  const userIds = [
    '6a9c25369d85b3c927d371f3', // Gezo
    '6a9c482536d918af38019603', // Maryam
    '6a9c4e63d77742115e02018f'  // Hero
  ];

  // 3. تعيينهم كـ parentA, parentB, parentC
  const [user1, user2, user3] = await Promise.all(userIds.map(id => User.findById(id)));

  if (user1) referrer.parentA = user1._id;
  if (user2) referrer.parentB = user2._id;
  if (user3) referrer.parentC = user3._id;

  // 4. حفظ التغييرات
  await referrer.save();
  console.log('✅ تم ربط الإحالات بنجاح!');
  console.log('parentA:', user1?.fullName);
  console.log('parentB:', user2?.fullName);
  console.log('parentC:', user3?.fullName);

  mongoose.disconnect();
})
.catch(console.error);
