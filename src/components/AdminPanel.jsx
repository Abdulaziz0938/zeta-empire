import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight, 
  Search, RefreshCw, TrendingUp, Users, Wallet, AlertTriangle,
  Eye, Copy, Check, Send, Megaphone, Crown, Award, BarChart, ListChecks,
  Filter, Calendar, MessageSquare, UserX, UserCheck, Edit3, Home,
  Zap, Moon, Sun, Lock, UserPlus, MinusCircle
} from 'lucide-react';

const AdminPanel = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // ===== نافذة تعديل الرصيد =====
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [editBalanceUser, setEditBalanceUser] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState('');

  // ===== نافذة الإشعار المخصص =====
  const [isUserNotificationModalOpen, setIsUserNotificationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userNotificationMessage, setUserNotificationMessage] = useState('');

  // ===== نافذة الإشعار الجماعي =====
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  // ===== جلب البيانات =====
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const usersRes = await fetch(`${API_BASE}/api/users`);
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);

      const txsRes = await fetch(`${API_BASE}/api/transactions`);
      const txsData = await txsRes.json();
      if (txsData.success) setTransactions(txsData.transactions);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ فشل جلب البيانات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ===== دوال الإجراءات =====

  // ✅ رفع المستوى
  const handlePromoteVip = async (userId) => {
    if (!confirm('تأكيد رفع مستوى VIP؟')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/promote/${userId}`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ تمت الترقية إلى VIP ${data.user.vipLevel}`);
        fetchData();
      } else alert('❌ ' + data.message);
    } catch (error) {
      alert('❌ خطأ في الاتصال');
    }
  };

  // ✅ تخفيض المستوى (جديد)
  const handleDemoteVip = async (userId) => {
    if (!confirm('⚠️ تأكيد تخفيض مستوى VIP؟')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/demote/${userId}`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ تم التخفيض إلى VIP ${data.user.vipLevel}`);
        fetchData();
      } else alert('❌ ' + data.message);
    } catch (error) {
      alert('❌ خطأ في الاتصال');
    }
  };

  // ✅ تجميد / إلغاء تجميد
  const handleToggleBan = async (userId) => {
    if (!confirm('تأكيد تغيير حالة الحساب؟')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/ban/${userId}`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchData();
      } else alert('❌ ' + data.message);
    } catch (error) {
      alert('❌ خطأ في الاتصال');
    }
  };

  // ✅ تعديل الرصيد (يدعم الإضافة والخصم)
  const handleEditBalance = (user) => {
    setEditBalanceUser(user);
    setEditAmount('');
    setEditReason('');
    setIsEditBalanceModalOpen(true);
  };

  const handleConfirmEditBalance = async () => {
    if (!editAmount || isNaN(editAmount) || parseFloat(editAmount) === 0) {
      alert('⚠️ الرجاء إدخال مبلغ صحيح (استخدم + للإضافة، - للخصم).');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/balance/${editBalanceUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(editAmount), reason: editReason })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        setIsEditBalanceModalOpen(false);
        fetchData();
      } else alert('❌ ' + data.message);
    } catch (error) {
      alert('❌ خطأ في الاتصال');
    }
  };

  // ✅ إرسال إشعار مخصص
  const handleSendUserNotification = (user) => {
    setSelectedUser(user);
    setUserNotificationMessage('');
    setIsUserNotificationModalOpen(true);
  };

  const handleSendUserNotificationSubmit = async () => {
    if (!userNotificationMessage.trim()) {
      alert('⚠️ الرجاء كتابة رسالة.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/notify/${selectedUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userNotificationMessage })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ تم إرسال الإشعار إلى ${selectedUser.fullName}`);
        setIsUserNotificationModalOpen(false);
      } else alert('❌ ' + data.message);
    } catch (error) {
      alert('❌ خطأ في الاتصال');
    }
  };

  // ✅ إرسال إشعار جماعي
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      alert('⚠️ الرجاء كتابة رسالة.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/notify-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: notificationMessage })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        setIsNotificationModalOpen(false);
        setNotificationMessage('');
      } else alert('❌ ' + data.message);
    } catch (error) {
      alert('❌ خطأ في الاتصال');
    }
  };

  // ===== الشارات والتصفية =====
  const getUserBadge = (user) => {
    if (user.referrals >= 20) return { icon: '👑', label: 'ملك التسويق' };
    if (user.referrals >= 10) return { icon: '⭐', label: 'مسوق ماسي' };
    return null;
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.includes(searchTerm) || u.phone?.includes(searchTerm)
  );

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.userName?.includes(searchTerm) || tx.phone?.includes(searchTerm) || tx.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  // ===== الإحصائيات =====
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'نشط').length;
  const pendingTx = transactions.filter(t => t.status === 'pending').length;
  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((acc, t) => acc + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'approved').reduce((acc, t) => acc + t.amount, 0);
  const totalFees = transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + (t.type === 'withdraw' ? t.amount * 0.05 : 0), 0);
  const topReferrers = [...users].sort((a, b) => b.referrals - a.referrals).slice(0, 5);

  const tabs = [
    { key: 'overview', label: 'نظرة عامة', icon: BarChart },
    { key: 'transactions', label: 'المعاملات', icon: ListChecks },
    { key: 'users', label: 'المستخدمين', icon: Users },
    { key: 'referrals', label: 'التسويق', icon: Award },
    { key: 'audit', label: 'سجل الإجراءات', icon: Clock },
  ];

  // ===== التصميم =====
  const bgColor = isDarkMode ? 'bg-[#030914]' : 'bg-gray-100';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const cardBg = isDarkMode ? 'bg-[#00f3ff]/[0.02]' : 'bg-white/80';
  const borderColor = isDarkMode ? 'border-[#00f3ff]/20' : 'border-gray-300/50';
  const inputBg = isDarkMode ? 'bg-white/5' : 'bg-white/80';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-4 md:p-6 font-sans transition-colors duration-300`} dir="rtl">
      
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-[#00f3ff]/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 relative">
        
        {/* ===== الهيدر ===== */}
        <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-[0_0_30px_rgba(0,243,255,0.1)] flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00f3ff] to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_#00f3ff]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">لوحة التحكم الفائقة</h1>
              <p className="text-xs text-cyan-400/80 font-mono">ZETA System Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button onClick={onBack} className="px-4 py-2 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-xs hover:bg-green-500/40 transition-all flex items-center gap-2">
              <Home className="w-4 h-4" /> العودة للرئيسية
            </button>

            <button onClick={() => setIsDarkMode(!isDarkMode)} className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-cyan-400 transition-all flex items-center gap-2 text-xs">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDarkMode ? 'نهاري' : 'ليلي'}</span>
            </button>

            <button onClick={() => setIsNotificationModalOpen(true)} className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> إشعار للكل
            </button>

            <div className="px-3 py-2 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 text-xs font-bold text-yellow-400">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">معلقة: {pendingTx}</span>
            </div>
          </div>
        </div>

        {/* ===== كروت الإحصائيات ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-2xl p-4 text-center transition-colors`}>
            <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">المستخدمين</p>
            <p className="text-lg font-black text-white">{totalUsers}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-2xl p-4 text-center transition-colors`}>
            <UserCheck className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">نشطاء</p>
            <p className="text-lg font-black text-green-400">{activeUsers}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-2xl p-4 text-center transition-colors`}>
            <ArrowDownLeft className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">إيداعات</p>
            <p className="text-lg font-black text-green-400">${totalDeposits.toFixed(0)}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-2xl p-4 text-center transition-colors`}>
            <ArrowUpRight className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">سحوبات</p>
            <p className="text-lg font-black text-orange-400">${totalWithdrawals.toFixed(0)}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-2xl p-4 text-center transition-colors`}>
            <Wallet className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">رسوم</p>
            <p className="text-lg font-black text-yellow-400">${totalFees.toFixed(2)}</p>
          </div>
          <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-2xl p-4 text-center transition-colors`}>
            <TrendingUp className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">معلقة</p>
            <p className="text-lg font-black text-cyan-400">{pendingTx}</p>
          </div>
        </div>

        {/* ===== التبويبات ===== */}
        <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-3xl p-2 flex flex-wrap gap-1 transition-colors`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.key ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===== نظرة عامة ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] transition-colors`}>
              <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-400" />
                أفضل 5 مسوقين
              </h3>
              <div className="space-y-2">
                {topReferrers.map((u, idx) => (
                  <div key={u._id || u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-yellow-400 text-slate-950' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-gray-400'}`}>{idx + 1}</span>
                      <span className="font-bold text-white">{u.fullName}</span>
                      {getUserBadge(u) && <span className="text-sm" title={getUserBadge(u).label}>{getUserBadge(u).icon}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-cyan-400 font-mono">VIP {u.vipLevel}</span>
                      <span className="text-green-400 font-bold">{u.referrals} إحالة</span>
                      <button onClick={() => handlePromoteVip(u._id)} className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/40 transition-all">رفع</button>
                      <button onClick={() => handleDemoteVip(u._id)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-[10px] font-bold hover:bg-red-500/40 transition-all">تخفيض</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-3xl p-6 transition-colors`}>
              <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> آخر الإجراءات</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="text-xs text-gray-400 border-b border-white/5 pb-2 flex justify-between">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-gray-600">{log.timestamp}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-gray-500 flex justify-between">
                <span>آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}</span>
                {isLoading && <span className="text-cyan-400 animate-pulse">جاري التحديث...</span>}
              </div>
            </div>
          </div>
        )}

        {/* ===== المعاملات ===== */}
        {activeTab === 'transactions' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-4 md:p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            <div className="flex flex-col md:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pr-10 pl-4 py-2 rounded-xl ${inputBg} border ${borderColor} text-white placeholder-gray-500 text-xs outline-none focus:border-[#00f3ff] transition-colors`} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filterType === 'all' ? 'bg-[#00f3ff] text-slate-950 border-[#00f3ff]' : `${cardBg} border ${borderColor} text-gray-400`}`}>الكل</button>
                <button onClick={() => setFilterType('deposit')} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filterType === 'deposit' ? 'bg-green-500 text-white border-green-500' : `${cardBg} border ${borderColor} text-gray-400`}`}>إيداع</button>
                <button onClick={() => setFilterType('withdraw')} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filterType === 'withdraw' ? 'bg-orange-500 text-white border-orange-500' : `${cardBg} border ${borderColor} text-gray-400`}`}>سحب</button>
              </div>
              <div className="flex gap-2">
                <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={`px-3 py-2 rounded-xl text-xs ${inputBg} border ${borderColor} text-white outline-none focus:border-[#00f3ff] transition-colors`}>
                  <option value="all">كل الفترات</option>
                  <option value="today">اليوم</option>
                  <option value="week">آخر 7 أيام</option>
                  <option value="month">هذا الشهر</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">المعرف</th>
                    <th className="p-3">المستخدم</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">الشبكة</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">لا توجد معاملات</td></tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-white">{tx.id}</td>
                        <td className="p-3"><span className="block text-white">{tx.userName}</span><span className="text-[10px] text-cyan-400 font-mono">{tx.phone}</span></td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{tx.type === 'deposit' ? 'إيداع' : 'سحب'}</span></td>
                        <td className="p-3 font-mono font-bold"><span className={tx.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}>${tx.amount}</span></td>
                        <td className="p-3"><span className="text-cyan-300 text-[10px]">{tx.network}</span></td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tx.status === 'approved' ? 'bg-green-500/20 border-green-500/30 text-green-400' : tx.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'}`}>{tx.status === 'approved' ? 'مقبول' : tx.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}</span></td>
                        <td className="p-3 text-center">
                          {tx.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => {}} className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 transition-all" title="قبول"><CheckCircle2 className="w-4 h-4" /></button>
                              <button onClick={() => {}} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-all" title="رفض"><XCircle className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-[10px]">تمت</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== المستخدمين ===== */}
        {activeTab === 'users' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-4 md:p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            <div className="flex flex-col md:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pr-10 pl-4 py-2 rounded-xl ${inputBg} border ${borderColor} text-white placeholder-gray-500 text-xs outline-none focus:border-[#00f3ff] transition-colors`} />
              </div>
              <span className="text-xs text-gray-400 self-center">إجمالي: {filteredUsers.length} مستخدم</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">الاسم</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">VIP</th>
                    <th className="p-3">الرصيد</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(u => {
                    const badge = getUserBadge(u);
                    return (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white">{u.fullName} {badge && <span className="mr-1 text-sm" title={badge.label}>{badge.icon}</span>}</td>
                        <td className="p-3 font-mono text-cyan-400/80">{u.phone}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">VIP {u.vipLevel}</span></td>
                        <td className="p-3 font-mono font-bold">${u.balance}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'نشط' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.status || 'نشط'}</span></td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleSendUserNotification(u)} className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/30 transition-all" title="إشعار"><MessageSquare className="w-4 h-4" /></button>
                            <button onClick={() => handleEditBalance(u)} className="p-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-white border border-yellow-500/30 transition-all" title="تعديل الرصيد"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handlePromoteVip(u._id)} className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/30 transition-all" title="رفع VIP"><Crown className="w-4 h-4" /></button>
                            <button onClick={() => handleDemoteVip(u._id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-all" title="تخفيض VIP"><MinusCircle className="w-4 h-4" /></button>
                            <button onClick={() => handleToggleBan(u._id)} className={`p-1.5 rounded-lg border transition-all ${u.status === 'نشط' ? 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border-red-500/30' : 'bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border-green-500/30'}`} title={u.status === 'نشط' ? 'تجميد' : 'إلغاء التجميد'}>
                              {u.status === 'نشط' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== التسويق ===== */}
        {activeTab === 'referrals' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Award className="w-6 h-6 text-yellow-400" /> قائمة المسوقين</h3>
              <button onClick={() => alert('✅ تم صرف المكافآت!')} className="px-6 py-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-all flex items-center gap-2">
                <Send className="w-4 h-4" /> صرف المكافآت
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.filter(u => u.referrals > 0).sort((a,b) => b.referrals - a.referrals).map((u, idx) => (
                <div key={u._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-yellow-400 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'}`}>{idx + 1}</span>
                    <div>
                      <p className="font-bold text-white">{u.fullName}</p>
                      <p className="text-[10px] text-gray-400">VIP {u.vipLevel} • {u.referrals} إحالة</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">المكافأة</p>
                    <p className="font-bold text-green-400">${(u.referrals * 2.5).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== سجل الإجراءات ===== */}
        {activeTab === 'audit' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="w-6 h-6 text-cyan-400" /> سجل الإجراءات</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center hover:border-cyan-500/20 transition-all">
                  <span className="text-sm text-white">{log.action}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>🛡️ {log.admin}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== نافذة تعديل الرصيد ===== */}
        {isEditBalanceModalOpen && editBalanceUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditBalanceModalOpen(false)}>
            <div className="relative w-full max-w-md bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsEditBalanceModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
              <h3 className="text-xl font-black text-white mb-2 text-center">✏️ تعديل الرصيد</h3>
              <p className="text-center text-sm text-gray-400 mb-4">{editBalanceUser.fullName} (VIP {editBalanceUser.vipLevel}) • الرصيد الحالي: ${editBalanceUser.balance}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400">المبلغ (استخدم + للإضافة، - للخصم)</label>
                  <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="مثال: 50 أو -20" className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-[#00f3ff]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">سبب التعديل (اختياري)</label>
                  <input type="text" value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder="مثال: مكافأة ترقية" className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-[#00f3ff]" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsEditBalanceModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">إلغاء</button>
                <button onClick={handleConfirmEditBalance} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all">تأكيد</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== نافذة الإشعار المخصص ===== */}
        {isUserNotificationModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsUserNotificationModalOpen(false)}>
            <div className="relative w-full max-w-md bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsUserNotificationModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
              <div className="flex items-center gap-3 mb-4"><MessageSquare className="w-8 h-8 text-cyan-400" /><div><h3 className="text-xl font-black text-white">✉️ إشعار مخصص</h3><p className="text-xs text-gray-400">إلى: {selectedUser.fullName}</p></div></div>
              <textarea value={userNotificationMessage} onChange={(e) => setUserNotificationMessage(e.target.value)} placeholder={`اكتب رسالتك...`} rows="4" className="w-full mt-1 bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm" />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsUserNotificationModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">إلغاء</button>
                <button onClick={handleSendUserNotificationSubmit} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isProcessing ? 'جاري...' : <><Send className="w-4 h-4" /> إرسال</>}</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== نافذة الإشعار الجماعي ===== */}
        {isNotificationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsNotificationModalOpen(false)}>
            <div className="relative w-full max-w-md bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsNotificationModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
              <div className="flex items-center gap-3 mb-4"><Megaphone className="w-8 h-8 text-cyan-400" /><h3 className="text-xl font-black text-white">📢 إشعار جماعي</h3></div>
              <textarea value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} placeholder="اكتب رسالتك..." rows="4" className="w-full mt-1 bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm" />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsNotificationModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">إلغاء</button>
                <button onClick={handleSendNotification} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isProcessing ? 'جاري...' : <><Send className="w-4 h-4" /> إرسال</>}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
