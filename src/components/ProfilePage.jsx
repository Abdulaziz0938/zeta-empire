import { useZeta } from '../context/ZetaContext.jsx';
import React, { useState, useEffect } from 'react';
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
  Globe,
  MessageSquare,
  Send,
  X,
  RefreshCw
} from 'lucide-react';

const ProfilePage = ({ lang = 'ar', setLang }) => {
  const { user } = useZeta();
  const [activeTab, setActiveTab] = useState('all');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  // ===== سجل المعاملات (من الخادم) =====
  const [userTransactions, setUserTransactions] = useState([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  const fetchMyTransactions = async () => {
    const uid = user?._id || user?.id;
    if (!uid) return;
    setIsLoadingTx(true);
    try {
      const res = await fetch(`${API_BASE}/api/transactions/user/${uid}`);
      const data = await res.json();
      if (data.success) setUserTransactions(data.transactions || []);
    } catch (err) {
      console.error('فشل جلب سجل المعاملات:', err);
    } finally {
      setIsLoadingTx(false);
    }
  };

  useEffect(() => { fetchMyTransactions(); }, [user?._id]);


  // ============================================================
  // ✅ دوال نظام التواصل مع المشرف
  // ============================================================
  const handleSendSupportMessage = async () => {
    const userId = user?._id || user?.id;
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: supportMessage })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ تم إرسال رسالتك للمشرف بنجاح');
        setSupportMessage('');
        setIsSupportModalOpen(false);
      } else alert('❌ ' + (data.message || 'حدث خطأ'));
    } catch (error) { alert('❌ تعذر الاتصال بالخادم'); }
    finally { setIsSending(false); }
  };

  const fetchMyMessages = async () => {
    const userId = user?._id || user?.id;
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE}/api/support/my-messages/${userId}`);
      const data = await res.json();
      if (data.success) setMyMessages(data.messages || []);
    } catch (error) { console.error('❌ فشل جلب الرسائل:', error); }
    finally { setIsLoadingMessages(false); }
  };

  const handleOpenMessages = () => {
    setIsMessagesModalOpen(true);
    fetchMyMessages();
  };


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

  // ✅ استخدم البيانات الحقيقية من user، وليس بيانات وهمية
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
    transactions: [] // قائمة المعاملات ستأتي من الخادم
  };

  // ✅ استخدم مصفوفة فارغة بدلاً من البيانات الوهمية
  const displayHistory = userTransactions.map(tx => ({
    id: '#' + String(tx._id || '').slice(-6).toUpperCase(),
    title: tx.type === 'deposit' ? '📥 طلب إيداع' : tx.type === 'withdraw' ? '📤 طلب سحب' : tx.type === 'purchase' ? '🎁 ترقية VIP' : '💰 عمولة',
    date: tx.createdAt ? new Date(tx.createdAt).toLocaleString('ar-EG') : '—',
    amount: Number(tx.amount) || 0,
    type: tx.type,
    status: tx.status === 'approved' ? 'completed' : tx.status,
    raw: tx
  }));

  const filteredHistory = displayHistory.filter(item => {
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
        {/* ✅ أزرار التواصل مع المشرف */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 rounded-2xl p-5 flex items-center justify-between font-black shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] transition-all"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-7 h-7" />
              <span className="text-base">📩 التواصل مع المشرف</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleOpenMessages}
            className="bg-white/5 border border-white/10 hover:border-[#00f3ff]/60 rounded-2xl p-5 flex items-center justify-between font-black transition-all"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-7 h-7 text-cyan-400" />
              <span className="text-base text-white">📬 رسائلي السابقة</span>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-400" />
          </button>
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

      {/* ============================================================ */}
      {/* ✅ نافذة إرسال رسالة للمشرف */}
      {/* ============================================================ */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsSupportModalOpen(false)}>
          <div className="relative w-full max-w-md bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsSupportModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              <h3 className="text-xl font-black text-white">✉️ إرسال رسالة للمشرف</h3>
            </div>
            <textarea
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="اكتب استفسارك أو مشكلتك هنا..."
              rows="5"
              className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsSupportModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">إلغاء</button>
              <button
                onClick={handleSendSupportMessage}
                disabled={isSending}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (<><RefreshCw className="w-4 h-4 animate-spin" /> جاري الإرسال...</>) : (<><Send className="w-4 h-4" /> إرسال</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ✅ نافذة عرض رسائلي السابقة */}
      {/* ============================================================ */}
      {isMessagesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsMessagesModalOpen(false)}>
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsMessagesModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
              <Receipt className="w-7 h-7 text-cyan-400" />
              <h3 className="text-xl font-black text-white">📬 رسائلي السابقة</h3>
              <button onClick={fetchMyMessages} className="ml-auto p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-all">
                <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoadingMessages ? (
                <div className="text-center py-8 text-gray-400">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-cyan-400" />
                  جاري التحميل...
                </div>
              ) : myMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>لم تُرسل أي رسالة بعد</p>
                </div>
              ) : (
                myMessages.map((msg) => (
                  <div key={msg._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${msg.status === 'replied' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'}`}>
                        {msg.status === 'replied' ? '✅ تم الرد' : '⏳ قيد الانتظار'}
                      </span>
                      <span className="text-[10px] text-gray-500">{new Date(msg.createdAt).toLocaleString('ar-EG')}</span>
                    </div>
                    <p className="text-sm text-gray-200 bg-cyan-500/5 border-r-2 border-cyan-400 pr-3 py-2 rounded">{msg.message}</p>
                    {msg.reply && (
                      <div className="mt-2 bg-green-500/5 border-r-2 border-green-400 pr-3 py-2 rounded">
                        <p className="text-[11px] text-green-400 font-bold mb-1">💬 رد المشرف:</p>
                        <p className="text-sm text-gray-200">{msg.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;