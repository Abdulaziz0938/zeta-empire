const fs = require('fs');
const filePath = 'src/components/AdminPanel.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. تعطيل useEffect لجلب الرسائل مؤقتاً
content = content.replace(
  "if (activeTab === 'support') {",
  "if (false && activeTab === 'support') {"
);

// 2. تعطيل قسم عرض الدعم مؤقتاً
content = content.replace(
  "{activeTab === 'support' && (",
  "{false && activeTab === 'support' && ("
);

fs.writeFileSync(filePath, content);
console.log('✅ تم تعطيل useEffect + قسم العرض مؤقتاً');
