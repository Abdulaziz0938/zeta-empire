const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const result = await Notification.deleteMany({});
  console.log(`✅ تم حذف جميع الإشعارات (${result.deletedCount} إشعار)`);
  mongoose.disconnect();
})
.catch(err => { console.error('❌ فشل الحذف:', err); mongoose.disconnect(); });
