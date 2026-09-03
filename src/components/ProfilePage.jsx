import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, DollarSign, TrendingUp, Calendar, Clock, Award, Receipt, Zap, Globe } from 'lucide-react';

const ProfilePage = ({ user, lang = 'ar', setLang }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  useEffect(() => {
    if (user?._id || user?.id) {
      setLoading(true);
      fetch(`${API_BASE}/api/transactions/user/${user._id || user.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setTransactions(data.transactions); })
        .catch(err => console.error('فشل جلب المعاملات', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const t = {
    ar: { title: "الصفحة الشخصية", welcome: "أهلاً بك،", totalBalance: "الرصيد المتاح", totalDeposit: "إجمالي الإيداعات", totalWithdrawal: "إجمالي السحوبات", totalEarnings: "الأرباح", referralEarnings: "عمولات الإحالة", dailyEarnings: "أرباح اليوم", weeklyEarnings: "أرباح الأسبوع", monthlyEarnings: "أرباح الشهر", financialHistory: "السجل المالي", filterAll: "الكل", filterDeposits: "إيداعات", filterWithdrawals: "سحوبات", filterCommissions: "عمولات", noRecords: "لا توجد سجلات", statusCompleted: "ناجحة", statusPending: "قيد المراجعة" },
    en: { title: "Profile", welcome: "Welcome,", totalBalance: "Balance", totalDeposit: "Total Deposits", totalWithdrawal: "Total Withdrawals", totalEarnings: "Earnings", referralEarnings: "Referrals", dailyEarnings: "Daily", weeklyEarnings: "Weekly", monthlyEarnings: "Monthly", financialHistory: "History", filterAll: "All", filterDeposits: "Deposits", filterWithdrawals: "Withdrawals", filterCommissions: "Commissions", noRecords: "No records", statusCompleted: "Completed", statusPending: "Pending" }
  }[lang];

  const filteredHistory = transactions.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposit') return item.type === 'deposit';
    if (activeTab === 'withdraw') return item.type === 'withdraw';
    if (activeTab === 'commission') return ['commission', 'referral'].includes(item.type);
    return true;
  });

  const userData = user || { fullName: 'مستخدم', phone: '+966', vipLevel: 0, balance: 0, totalDeposit: 0, totalWithdrawal: 0, totalEarnings: 0, referralEarnings: 0, dailyEarnings: 0, weeklyEarnings: 0, monthlyEarnings: 0 };

  return (
    <div className={`min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-[#00f3ff]/[0.05] backdrop-blur-2xl border border-[#00f3ff]/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-[#00f3ff] p-0.5 shadow-[0_0_20px_#00f3ff]"><div className="w-full h-full bg-[#030914] rounded-[14px] flex items-center justify-center text-cyan-300 font-black text-xl">ZE</div></div><div><span className="text-gray-400 text-sm">{t.welcome}</span><h2 className="text-xl font-bold text-white">{userData.fullName}</h2><p className="text-xs font-mono text-cyan-400/80">{userData.phone}</p></div></div>
          <div className="flex items-center gap-4"><div className="px-4 py-2 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /><span className="text-yellow-300 font-bold text-sm">VIP {userData.vipLevel}</span></div><button onClick={() => setLang && setLang(lang === 'ar' ? 'en' : 'ar')} className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00f3ff] text-xs font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /><span>{lang === 'ar' ? 'English' : 'عربي'}</span></button></div>
        </div>
        <div className="bg-gradient-to-r from-cyan-900/40 via-[#00f3ff]/10 to-slate-900/80 backdrop-blur-2xl border border-[#00f3ff]/40 rounded-3xl p-6 md:p-8"><p className="text-sm text-cyan-300/80">{t.totalBalance}</p><h1 className="text-4xl md:text-6xl font-black text-white">${(userData.balance || 0).toFixed(2)}</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5"><div className="flex justify-between text-cyan-400 mb-2"><span className="text-xs text-gray-400">{t.totalDeposit}</span><ArrowDownLeft className="w-5 h-5 text-green-400" /></div><p className="text-2xl font-bold text-white">${(userData.totalDeposit || 0).toFixed(2)}</p></div>
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5"><div className="flex justify-between text-cyan-400 mb-2"><span className="text-xs text-gray-400">{t.totalWithdrawal}</span><ArrowUpRight className="w-5 h-5 text-orange-400" /></div><p className="text-2xl font-bold text-white">${(userData.totalWithdrawal || 0).toFixed(2)}</p></div>
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5"><div className="flex justify-between text-cyan-400 mb-2"><span className="text-xs text-gray-400">{t.totalEarnings}</span><TrendingUp className="w-5 h-5 text-cyan-400" /></div><p className="text-2xl font-bold text-cyan-300">${(userData.totalEarnings || 0).toFixed(2)}</p></div>
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5"><div className="flex justify-between text-cyan-400 mb-2"><span className="text-xs text-gray-400">{t.referralEarnings}</span><Award className="w-5 h-5 text-yellow-400" /></div><p className="text-2xl font-bold text-yellow-300">${(userData.referralEarnings || 0).toFixed(2)}</p></div>
        </div>
        <div className="bg-[#00f3ff]/[0.02] backdrop-blur-2xl border border-[#00f3ff]/20 rounded-3xl p-6"><h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-[#00f3ff]" /> الأرباح التراكمية</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex justify-between"><div><p className="text-xs text-gray-400">{t.dailyEarnings}</p><p className="text-xl font-extrabold text-green-400">+${(userData.dailyEarnings || 0).toFixed(2)}</p></div><Clock className="w-8 h-8 text-green-400/40" /></div><div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex justify-between"><div><p className="text-xs text-gray-400">{t.weeklyEarnings}</p><p className="text-xl font-extrabold text-cyan-300">+${(userData.weeklyEarnings || 0).toFixed(2)}</p></div><TrendingUp className="w-8 h-8 text-cyan-400/40" /></div><div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex justify-between"><div><p className="text-xs text-gray-400">{t.monthlyEarnings}</p><p className="text-xl font-extrabold text-yellow-300">+${(userData.monthlyEarnings || 0).toFixed(2)}</p></div><Receipt className="w-8 h-8 text-yellow-400/40" /></div></div></div>
        <div className="bg-[#00f3ff]/[0.03] backdrop-blur-2xl border border-[#00f3ff]/20 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Receipt className="w-6 h-6 text-[#00f3ff]" /> {t.financialHistory}</h3><div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">{['all','deposit','withdraw','commission'].map((key) => <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${activeTab === key ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_12px_rgba(0,243,255,0.5)]' : 'text-gray-400'}`}>{t[`filter${key.charAt(0).toUpperCase()+key.slice(1)}`] || key}</button>)}</div></div>
          <div className="space-y-3">
            {loading ? <p className="text-center text-gray-500">جاري التحميل...</p> : filteredHistory.length === 0 ? <p className="text-center text-gray-500 py-8">{t.noRecords}</p> : filteredHistory.map((item) => <div key={item._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00f3ff]/40 flex justify-between"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.type === 'deposit' ? 'bg-green-500/10 border-green-500/30 text-green-400' : item.type === 'withdraw' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>{item.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : item.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}</div><div><p className="text-sm font-bold text-white">{item.note || item.type}</p><p className="text-xs font-mono text-gray-500">{new Date(item.createdAt).toLocaleString('ar-EG')}</p></div></div><div className="text-right"><p className={`text-base font-extrabold ${item.type === 'withdraw' ? 'text-orange-400' : 'text-green-400'}`}>{item.type === 'withdraw' ? '-' : '+'}${item.amount.toFixed(2)}</p><span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30'}`}>{item.status === 'approved' ? t.statusCompleted : t.statusPending}</span></div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
