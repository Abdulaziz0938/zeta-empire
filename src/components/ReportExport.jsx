import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Printer, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Wallet 
} from 'lucide-react';

const ReportExportModule = ({ transactionsData = [] }) => {
  const [dateRange, setDateRange] = useState('all'); // all | today | week | month
  const [filterType, setFilterType] = useState('all'); // all | deposit | withdraw
  const [filterNetwork, setFilterNetwork] = useState('all'); // all | TRC20 | BEP20
  const [isExporting, setIsExporting] = useState(false);

  // بيانات افتراضية في حال لم يتم إرسال بيانات عبر المكون
  const defaultData = [
    { id: 'TX-1001', userName: 'أحمد محمود', userPhone: '+966501234567', type: 'deposit', amount: 500.00, fee: 0.00, network: 'TRC20', address: 'T9xZ3vK8LpQ2mR5wN7yB1xC4vM6nE8uP3q', date: '2026-09-03 10:30 AM', status: 'approved' },
    { id: 'TX-1002', userName: 'سارة خالد', userPhone: '+966559876543', type: 'withdraw', amount: 150.00, fee: 1.00, network: 'TRC20', address: 'TX9yZ2vL3pQ8mR1wN4yB7xC9vM2nE5uP6q', date: '2026-09-03 11:15 AM', status: 'approved' },
    { id: 'TX-1003', userName: 'محمد علي', userPhone: '+966543210987', type: 'deposit', amount: 1000.00, fee: 0.00, network: 'BEP20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', date: '2026-09-02 04:20 PM', status: 'approved' },
    { id: 'TX-1004', userName: 'عمر الفاروق', userPhone: '+966561112233', type: 'withdraw', amount: 300.00, fee: 0.29, network: 'BEP20', address: '0x32A8956EC7ab88b098defB751B7401B5f6d89700', date: '2026-09-01 09:10 AM', status: 'rejected' }
  ];

  const sourceData = transactionsData.length > 0 ? transactionsData : defaultData;

  // فلترة البيانات بناءً على الخيارات المختارة
  const filteredData = sourceData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterNetwork !== 'all' && item.network !== filterNetwork) return false;
    return true;
  });

  // حساب الإحصائيات التلخيصية للتقرير
  const totalDeposit = filteredData.filter(r => r.type === 'deposit' && r.status === 'approved').reduce((acc, r) => acc + r.amount, 0);
  const totalWithdraw = filteredData.filter(r => r.type === 'withdraw' && r.status === 'approved').reduce((acc, r) => acc + r.amount, 0);
  const totalFees = filteredData.filter(r => r.status === 'approved').reduce((acc, r) => acc + (r.fee || 0), 0);
  const netBalance = totalDeposit - totalWithdraw;

  // دالة التصدير إلى Excel / CSV مع دعم ترميز UTF-8 للغة العربية
  const exportToCSV = () => {
    setIsExporting(true);

    // عناوين الأعمدة
    const headers = [
      'معرف العملية',
      'اسم المستخدم',
      'رقم الهاتف',
      'نوع الحركة',
      'المبلغ ($)',
      'الرسوم ($)',
      'الشبكة',
      'عنوان المحفظة',
      'التاريخ والوقت',
      'الحالة'
    ];

    // تحويل البيانات إلى صفوف
    const rows = filteredData.map(item => [
      item.id,
      item.userName,
      item.userPhone,
      item.type === 'deposit' ? 'إيداع' : 'سحب',
      item.amount.toFixed(2),
      (item.fee || 0).toFixed(2),
      item.network,
      item.address,
      item.date,
      item.status === 'approved' ? 'مقبول' : item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'
    ]);

    // دمج العناوين والصفوف بتنسيق CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // إضافة UTF-8 BOM لضمان فتح الملف في Excel باللغة العربية دون رموز غريبة
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Financial_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  // دالة الطباعة السريعة لكشف الحساب
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#00f3ff]/[0.02] backdrop-blur-2xl border border-[#00f3ff]/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_25px_rgba(0,243,255,0.05)] text-white" dir="rtl">
      
      {/* الشريط العلوي للوحدة */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00f3ff] to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_#00f3ff]">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">وحدة التقارير وتصدير المحاسبة</h2>
            <p className="text-xs text-cyan-400/80 font-mono">Export CSV, Excel & Financial Accounting Reports</p>
          </div>
        </div>

        {/* أزرار التصدير والطباعة */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>طباعة التقرير</span>
          </button>

          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'جاري التصدير...' : 'تصدير ملف CSV (Excel)'}</span>
          </button>
        </div>
      </div>

      {/* خيارات التصفية والفلترة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        
        {/* نوع الحركة */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> نوع المعاملة:
          </label>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[#030914] border border-white/10 focus:border-[#00f3ff] rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="all">كافة الحركات (إيداع وسحب)</option>
            <option value="deposit">الإيداعات فقط</option>
            <option value="withdraw">السحوبات فقط</option>
          </select>
        </div>

        {/* الشبكة */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" /> الشبكة:
          </label>
          <select 
            value={filterNetwork}
            onChange={(e) => setFilterNetwork(e.target.value)}
            className="w-full bg-[#030914] border border-white/10 focus:border-[#00f3ff] rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="all">جميع الشبكات (TRC20 & BEP20)</option>
            <option value="TRC20">شبكة TRC20</option>
            <option value="BEP20">شبكة BEP20</option>
          </select>
        </div>

        {/* النطاق الزمني */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> النطاق الزمني:
          </label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-[#030914] border border-white/10 focus:border-[#00f3ff] rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="all">جميع التواريخ المسجلة</option>
            <option value="today">تعاملات اليوم</option>
            <option value="week">تعاملات الأسبوع الحالي</option>
            <option value="month">تعاملات الشهر الحالي</option>
          </select>
        </div>

      </div>

      {/* بطاقات الملخص المحاسبي للتقرير */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
          <p className="text-[11px] text-gray-400 font-medium">مجموع الإيداعات المقبولة</p>
          <p className="text-xl font-extrabold text-green-400 mt-1 font-mono">${totalDeposit.toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
          <p className="text-[11px] text-gray-400 font-medium">مجموع السحوبات المقبولة</p>
          <p className="text-xl font-extrabold text-orange-400 mt-1 font-mono">${totalWithdraw.toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
          <p className="text-[11px] text-gray-400 font-medium">صافي التدفق المالي</p>
          <p className="text-xl font-extrabold text-[#00f3ff] mt-1 font-mono">${netBalance.toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
          <p className="text-[11px] text-gray-400 font-medium">رسوم الشبكات المحصلة</p>
          <p className="text-xl font-extrabold text-yellow-300 mt-1 font-mono">${totalFees.toFixed(2)}</p>
        </div>
      </div>

      {/* معاينة جدول البيانات المفلترة للطباعة أو التصدير */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            معاينة كشف الحساب ({filteredData.length} سجلات)
          </h3>
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-2xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/5 text-gray-300 font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4">المعرف</th>
                <th className="py-3 px-4">المستخدم</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">الرسوم</th>
                <th className="py-3 px-4">الشبكة</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">{row.id}</td>
                  <td className="py-3 px-4 font-sans">{row.userName}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.type === 'deposit' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {row.type === 'deposit' ? 'إيداع' : 'سحب'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">${row.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-400">${(row.fee || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-cyan-300">{row.network}</td>
                  <td className="py-3 px-4 text-gray-400 font-sans text-[11px]">{row.date}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`text-[10px] ${row.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                      {row.status === 'approved' ? 'مأكود' : 'مرفوض'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ReportExportModule;
