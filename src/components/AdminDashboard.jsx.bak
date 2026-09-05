import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Search, 
  Wallet, 
  ShieldAlert, 
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

const AdminDashboard = () => {
  // بيانات افتراضية للطلبات للتحكم والتجربة
  const [transactions, setTransactions] = useState([
    {
      id: 'TX10982',
      userName: 'أحمد محمود',
      phone: '+966501234567',
      type: 'deposit', // deposit | withdraw
      amount: 400,
      netAmount: 400,
      network: 'TRC20',
      walletAddress: 'TMwMyUg4bd3JrdawAkuKukSDtvbnd28ppW',
      proofHash: '0x8f3c...b921',
      date: '2026-09-03 10:15 AM',
      status: 'pending' // pending | approved | rejected
    },
    {
      id: 'TX10983',
      userName: 'سارة خالد',
      phone: '+971509876543',
      type: 'withdraw',
      amount: 100,
      netAmount: 95, // بعد خصم عمولة 5% لـ TRC20
      network: 'TRC20',
      walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      proofHash: '-',
      date: '2026-09-03 11:00 AM',
      status: 'pending'
    },
    {
      id: 'TX10984',
      userName: 'محمد علي',
      phone: '+965600112233',
      type: 'withdraw',
      amount: 200,
      netAmount: 194, // بعد خصم عمولة 3% لـ BEP20
      network: 'BEP20',
      walletAddress: '0x83482Ae471c8fc1cF13923402a57f9FE876497AA',
      proofHash: '-',
      date: '2026-09-03 11:30 AM',
      status: 'pending'
    }
  ]);

  const [filterType, setFilterType] = useState('all'); // all | deposit | withdraw
  const [searchQuery, setSearchQuery] = useState('');

  // معالجة قبول الطلب
  const handleApprove = (id) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, status: 'approved' } : tx)
    );
  };

  // معالجة رفض الطلب
  const handleReject = (id) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, status: 'rejected' } : tx)
    );
  };

  // تصفية الطلبات بناءً على البحث والفئة
  const filteredTx = transactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch = tx.userName.includes(searchQuery) || tx.phone.includes(searchQuery) || tx.id.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans dir-rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* شريط الإدارة العلوي */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,243,255,0.15)]">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-cyan-300 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-[#00f3ff] drop-shadow-[0_0_10px_#00f3ff]" />
              لوحة تحكم الأدمن المعزولة | ZETA EMPIRE
            </h1>
            <p className="text-gray-400 text-sm mt-1">مراجعة والتحكم بطلبات السحب والإيداع اليدوية لشبكات TRC20 و BEP20</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-semibold">
              الطلبات المعلقة: {transactions.filter(t => t.status === 'pending').length}
            </span>
          </div>
        </div>

        {/* أدوات البحث والتصفية */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-3.5 w-5 h-5 text-cyan-400/60" />
            <input 
              type="text" 
              placeholder="البحث بالاسم، رقم الهاتف، أو معرف الطلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#00f3ff]/[0.03] border border-[#00f3ff]/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff]"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {['all', 'deposit', 'withdraw'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  filterType === type 
                    ? 'bg-[#00f3ff] text-slate-950 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)]' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'جميع الطلبات' : type === 'deposit' ? 'الإيداعات' : 'السحوبات'}
              </button>
            ))}
          </div>
        </div>

        {/* جدول معالجة العمليات المالية */}
        <div className="bg-[#00f3ff]/[0.03] backdrop-blur-2xl border border-[#00f3ff]/20 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(0,243,255,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[#00f3ff]/20 bg-[#00f3ff]/[0.05] text-cyan-300 text-sm">
                  <th className="p-4">معرف المعاملة</th>
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">الشبكة</th>
                  <th className="p-4">المبلغ إجمالي / صافي</th>
                  <th className="p-4">عنوان المحفظة / الإثبات</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* ID & Date */}
                    <td className="p-4 font-mono">
                      <span className="text-white font-bold">{tx.id}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{tx.date}</p>
                    </td>

                    {/* User Info */}
                    <td className="p-4">
                      <p className="font-semibold text-white">{tx.userName}</p>
                      <p className="text-xs text-cyan-400/70 font-mono">{tx.phone}</p>
                    </td>

                    {/* Type */}
                    <td className="p-4">
                      {tx.type === 'deposit' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-semibold text-xs">
                          <ArrowDownLeft className="w-4 h-4" /> إيداع
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold text-xs">
                          <ArrowUpRight className="w-4 h-4" /> سحب
                        </span>
                      )}
                    </td>

                    {/* Network */}
                    <td className="p-4 font-mono font-bold">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs ${
                        tx.network === 'TRC20' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {tx.network}
                      </span>
                    </td>

                    {/* Amounts */}
                    <td className="p-4 font-mono">
                      <p className="text-white font-bold">${tx.amount}</p>
                      {tx.type === 'withdraw' && (
                        <p className="text-xs text-green-400">الصافي: ${tx.netAmount}</p>
                      )}
                    </td>

                    {/* Wallet Address & Hash */}
                    <td className="p-4 font-mono text-xs max-w-xs truncate">
                      <p className="text-gray-300 truncate" title={tx.walletAddress}>{tx.walletAddress}</p>
                      {tx.proofHash !== '-' && (
                        <p className="text-cyan-400/80 truncate mt-0.5" title={tx.proofHash}>Hash: {tx.proofHash}</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {tx.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-xl border border-yellow-400/30 text-xs">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> قيد الانتظار
                        </span>
                      )}
                      {tx.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-xl border border-green-400/30 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> مقبول
                        </span>
                      )}
                      {tx.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-xl border border-red-400/30 text-xs">
                          <XCircle className="w-3.5 h-3.5" /> مرفوض
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-slate-950 font-bold transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center gap-1 text-xs"
                          >
                            <CheckCircle className="w-4 h-4" /> قبول
                          </button>
                          <button
                            onClick={() => handleReject(tx.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 font-bold transition-all text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" /> رفض
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs text-center block">تم المعالجة</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
