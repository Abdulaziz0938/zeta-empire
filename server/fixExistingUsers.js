const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const referrer = await User.findOne({ phone: '963939152197' }); // Alhousaen
  if (!referrer) {
    console.log('❌ المُحيل غير موجود');
    return;
  }

  const userIds = [
    '6a9c25369d85b3c927d371f3', // Gezo
    '6a9c482536d918af38019603', // Maryam
    '6a9c4e63d77742115e02018f'  // Hero
  ];

  for (const id of userIds) {
    const user = await User.findById(id);
    if (user) {
      user.parentA = referrer._id;
      // تأكد من أن B و C تبقى null لهم لأنهم مباشرون
      await user.save();
      console.log(`✅ تم تحديث ${user.fullName} -> parentA = ${referrer.fullName}`);
    }
  }
  console.log('✅ تم تحديث جميع المستخدمين الحاليين');
  mongoose.disconnect();
})
.catch(console.error);
