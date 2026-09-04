const bcrypt = require('bcryptjs');
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin0965', salt);
  console.log('كلمة المرور المشفرة:', hash);
})();
