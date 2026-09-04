const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admin = await User.findOne({ phone: '999999999' });
    if (!admin) {
      console.log('❌ لم يتم العثور على حساب الأدمن');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin0965', salt);

    admin.password = hashedPassword;
    await admin.save();

    console.log('✅ تم تحديث كلمة مرور الأدمن بنجاح');
    process.exit(0);
  } catch (error) {
    console.error('❌ فشل التحديث:', error);
    process.exit(1);
  }
}

updateAdminPassword();
