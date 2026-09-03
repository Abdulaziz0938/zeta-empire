import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award, 
  Receipt, 
  UserCheck, 
  ShieldCheck, 
  ChevronRight,
  Zap,
  Globe
} from 'lucide-react';

const ProfilePage = ({ user, lang = 'ar', setLang }) => {
  const [activeTab, setActiveTab] = useState('all');

  const t = {
    ar: {
      title: "الصفحة الشخصية والمالية",
      welcome: "أهلاً بك،",
      vipBadge: "عقد VIP النشط",
      totalBalance: "الرصيد الإجمالي المتاح",
      totalDeposit: "إجمالي الإيداعات",
      totalWithdrawal: "إجمالي السحوبات",
      totalEarnings: "الأرباح التراكمية",
      referralEarnings: "عمولات الإحالة",
      dailyEarnings: "أرباح اليوم",
      weeklyEarnings: "أرباح الأسبوع",
      monthlyEarnings: "أرباح الشهر",
      financialHistory: "سجل الواردات والصادرات المالية",
      filterAll: "الكل",
      filterDeposits: "الإيداعات",
      filterWithdrawals: "السحوبات",
      filterCommissions: "العمولات",
      txId: "معرف العملية",
      type: "نوع الحركة",
      amount: "المبلغ",
      date: "التاريخ",
      status: "الحالة",
      statusCompleted: "ناجحة",
      statusPending: "قيد المراجعة",
      noRecords: "لا توجد سجلات مالية حتى الآن"
    },
    en: {
      title: "Personal Financial Center",
      welcome: "Welcome back,",
      vipBadge: "Active VIP Tier",
      totalBalance: "Available Total Balance",
      totalDeposit: "Total Deposits",
      totalWithdrawal: "Total Withdrawals",
      totalEarnings: "Cumulative Profit",
      referralEarnings: "Referral Commission",
      dailyEarnings: "Daily Profit",
      weeklyEarnings: "Weekly Profit",
      monthlyEarnings: "Monthly Profit",
      financialHistory: "Financial Statement & History",
      filterAll: "All",
      filterDeposits: "Deposits",
      filterWithdrawals: "Withdrawals",
      filterCommissions: "Commissions",
      txId: "Transaction ID",
      type: "Type",
      amount: "Amount",
      date: "Date",
      status: "Status",
      statusCompleted: "Completed",
      statusPending: "Pending",
      noRecords: "No transaction records found"
    }
  }[lang];

  // ✅ استخدام بيانات المستخدم الحقيقية
  const userData = user || {
    fullName: "مستخدم",
    phone: "+966500000000",
    vipLevel: 0,
    balance: 0,
    totalDeposit: 0,
    totalWithdrawal: 0,
    totalEarnings: 0,
    referralEarnings: 0,
    dailyEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    transactions: []
  };

  // ✅ مصفوفة فارغة تماماً (بدون بيانات وهمية)
  const mockHistory = [];

  const filteredHistory = mockHistory.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposit') return item.type === 'deposit';
    if (activeTab === 'withdraw') return item.type === 'withdraw';
    if (activeTab === 'commission') return item.type === 'commission' || item.type === 'referral';
    return true;
  });

  return (
    <div className={`min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* الشريط العلوي */}
        <div className="bg-[#00f3ff]/[0.05] backdrop-blur-2xl border border-[#00f3ff]/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,243,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-[#00f3ff] p-0.5 shadow-[0_0_20px_#00f3ff]">
              <div className="w-full h-full bg-[#030914] rounded-[14px] flex items-center justify-center text-cyan-300 font-black text-xl">
                ZE
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{t.welcome}</span>
                <h2 className="text-xl font-bold text-white">{userData.fullName}</h2>
              </div>
              <p className="text-xs font-mono text-cyan-400/80 mt-0.5">{userData.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_#fde047]" />
              <span className="text-yellow-300 font-bold text-sm">VIP {userData.vipLevel}</span>
            </div>

            <button 
              onClick={() => setLang && setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00f3ff] text-xs font-bold transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>
        </div>

        {/* بطاقة الرصيد */}
        <div className="bg-gradient-to-r from-cyan-900/40 via-[#00f3ff]/10 to-slate-900/80 backdrop-blur-2xl border border-[#00f3ff]/40 rounded-3xl p-6 md:p-8 shadow-[0_0_35px_rgba(0,243,255,0.2)]">
          <p className="text-sm text-cyan-300/80 font-medium">{t.totalBalance}</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-2 tracking-tight drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
            ${(userData.balance || 0).toFixed(2)}
          </h1>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(0,243,255,0.05)]">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs text-gray-400 font-medium">{t.totalDeposit}</span>
              <ArrowDownLeft className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">${(userData.totalDeposit || 0).toFixed(2)}</p>
          </div>

          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(0,243,255,0.05)]">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs text-gray-400 font-medium">{t.totalWithdrawal}</span>
              <ArrowUpRight className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">${(userData.totalWithdrawal || 0).toFixed(2)}</p>
          </div>

          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(0,243,255,0.05)]">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs text-gray-400 font-medium">{t.totalEarnings}</span>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-300">${(userData.totalEarnings || 0).toFixed(2)}</p>
          </div>

          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(0,243,255,0.05)]">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs text-gray-400 font-medium">{t.referralEarnings}</span>
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-300">${(userData.referralEarnings || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* الأرباح الزمنية */}
        <div className="bg-[#00f3ff]/[0.02] backdrop-blur-2xl border border-[#00f3ff]/20 rounded-3xl p-6 shadow-[0_0_20px_rgba(0,243,255,0.08)]">
          <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00f3ff]" />
            الأرباح التراكمية
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{t.dailyEarnings}</p>
                <p className="text-xl font-extrabold text-green-400 mt-1">+${(userData.dailyEarnings || 0).toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-400/40" />
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{t.weeklyEarnings}</p>
                <p className="text-xl font-extrabold text-cyan-300 mt-1">+${(userData.weeklyEarnings || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400/40" />
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{t.monthlyEarnings}</p>
                <p className="text-xl font-extrabold text-yellow-300 mt-1">+${(userData.monthlyEarnings || 0).toFixed(2)}</p>
              </div>
              <Receipt className="w-8 h-8 text-yellow-400/40" />
            </div>
          </div>
        </div>

        {/* سجل المعاملات */}
        <div className="bg-[#00f3ff]/[0.03] backdrop-blur-2xl border border-[#00f3ff]/20 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,243,255,0.1)] space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-[#00f3ff]" />
              {t.financialHistory}
            </h3>

            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
              {[
                { key: 'all', label: t.filterAll },
                { key: 'deposit', label: t.filterDeposits },
                { key: 'withdraw', label: t.filterWithdrawals },
                { key: 'commission', label: t.filterCommissions }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.key 
                      ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_12px_rgba(0,243,255,0.5)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t.noRecords}</p>
            ) : (
              filteredHistory.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00f3ff]/40 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      item.type === 'deposit' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      item.type === 'withdraw' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                      'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}>
                      {item.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> :
                       item.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> :
                       <DollarSign className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{item.id} • {item.date}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className={`text-base font-extrabold ${
                      item.type === 'withdraw' ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {item.type === 'withdraw' ? '-' : '+'}${item.amount.toFixed(2)}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      item.status === 'completed' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30'
                    }`}>
                      {item.status === 'completed' ? t.statusCompleted : t.statusPending}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
