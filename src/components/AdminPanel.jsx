import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Wallet, 
  AlertTriangle,
  Eye,
  Copy,
  Check,
  Send,
  Megaphone,
  Crown,
  Award,
  BarChart,
  ListChecks,
  Filter,
  Calendar,
  MessageSquare,
  UserX,
  UserCheck,
  Edit3,
  Home,
  Zap,
  Moon,
  Sun,
  Lock,
  UserPlus
} from 'lucide-react';

const AdminPanel = ({ onBack, onNavigate }) => {
  // ===== 1. الحالات العامة =====
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ===== 2. حالات النوافذ المنبثقة =====
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isUserNotificationModalOpen, setIsUserNotificationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userNotificationMessage, setUserNotificationMessage] = useState('');
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [editBalanceUser, setEditBalanceUser] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState('');

  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ===== 3. البيانات الوهمية =====
  const [users, setUsers] = useState([
    { id: 1, fullName: 'أحمد محمود', phone: '+966501234567', vip: 5, balance: 215.50, status: 'نشط', joinDate: '2026-08-15', referrals: 12, dailyTasks: 5 },
    { id: 2, fullName: 'سارة خالد', phone: '+966559876543', vip: 3, balance: 1050.00, status: 'نشط', joinDate: '2026-08-20', referrals: 5, dailyTasks: 3 },
    { id: 3, fullName: 'محمد علي', phone: '+966543210987', vip: 7, balance: 9999.99, status: 'نشط', joinDate: '2026-07-01', referrals: 55, dailyTasks: 5 },
    { id: 4, fullName: 'عمر الفاروق', phone: '+966561112233', vip: 1, balance: 45.00, status: 'موقف', joinDate: '2026-09-01', referrals: 0, dailyTasks: 0 },
    { id: 5, fullName: 'فاطمة الزهراء', phone: '+966551234567', vip: 4, balance: 340.00, status: 'نشط', joinDate: '2026-08-25', referrals: 8, dailyTasks: 4 },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'TX-1092', userName: 'أحمد محمود', phone: '+966501234567', type: 'deposit', amount: 500, network: 'TRC20', txHash: 'a8f9...b921', address: 'TMwMyUg4bd3JrdawAkuKukSDtvbnd28ppW', date: '2026-09-03 11:30', status: 'pending', adminAction: null, note: '' },
    { id: 'TX-1091', userName: 'سارة خالد', phone: '+966559876543', type: 'withdraw', amount: 150, network: 'BEP20', txHash: '-', address: '0x71C7...8976F', date: '2026-09-03 10:15', status: 'pending', adminAction: null, note: 'سحب لمحفظتي الشخصية' },
    { id: 'TX-1090', userName: 'محمد علي', phone: '+966543210987', type: 'deposit', amount: 1000, network: 'TRC20', txHash: 'e1f2...0e1f2', address: 'TX9yZ2vL3pQ8mR1wN4yB7xC9vM2nE5uP6q', date: '2026-09-02 20:45', status: 'approved', adminAction: 'تم القبول بواسطة المدير', note: '' },
    { id: 'TX-1089', userName: 'عمر الفاروق', phone: '+966561112233', type: 'withdraw', amount: 300, network: 'TRC20', txHash: 'b2c3...a1b2c3', address: 'TY1zX4vK9pQ3mR6wN8yB2xC5vM7nE9uP4r', date: '2026-09-02 16:20', status: 'rejected', adminAction: 'تم الرفض بواسطة المدير (رصيد غير كاف)', note: '' },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, admin: 'المدير الفائق', action: 'قبول طلب إيداع #TX-1090', timestamp: '2026-09-03 09:00' },
    { id: 2, admin: 'المدير الفائق', action: 'رفض طلب سحب #TX-1089', timestamp: '2026-09-02 17:30' },
    { id: 3, admin: 'المدير الفائق', action: 'ترقية المستخدم محمد علي إلى VIP 7', timestamp: '2026-09-01 14:15' },
  ]);

  // ===== 4. محاكاة التحديث التلقائي =====
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      setTimeout(() => {
        if (Math.random() > 0.6) {
          const newTx = {
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            userName: ['أحمد م.', 'سارة خ.', 'خالد ع.'][Math.floor(Math.random() * 3)],
            phone: '+9665' + Math.floor(10000000 + Math.random() * 90000000),
            type: Math.random() > 0.5 ? 'deposit' : 'withdraw',
            amount: Math.floor(Math.random() * 500) + 50,
            network: Math.random() > 0.5 ? 'TRC20' : 'BEP20',
            txHash: Math.random() > 0.5 ? '0x' + Math.random().toString(36).substring(2, 10) : '-',
            address: '0x' + Math.random().toString(36).substring(2, 15),
            date: new Date().toLocaleString('ar-EG'),
            status: 'pending',
            adminAction: null,
            note: ''
          };
          setTransactions(prev => [newTx, ...prev]);
          alert(`🔔 إشعار فوري: طلب ${newTx.type === 'deposit' ? 'إيداع' : 'سحب'} جديد من ${newTx.userName} بمبلغ $${newTx.amount}`);
        }
        setIsLoading(false);
        setLastUpdated(new Date());
      }, 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ===== 5. دوال كلمة المرور =====
  const verifyPassword = (action, params) => {
    setPendingAction({ action, params });
    setPasswordInput('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordConfirm = () => {
    if (passwordInput === 'admin0965') {
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      if (pendingAction) {
        switch (pendingAction.action) {
          case 'approve': handleApproveConfirm(pendingAction.params); break;
          case 'reject': handleRejectConfirm(pendingAction.params); break;
          case 'promote': handlePromoteConfirm(pendingAction.params); break;
          case 'ban': handleBanConfirm(pendingAction.params); break;
          default: break;
        }
      }
      setPendingAction(null);
    } else {
      alert('❌ كلمة المرور غير صحيحة!');
      setPasswordInput('');
    }
  };

  // ===== 6. الإجراءات الحساسة =====
  const handleApprove = (id) => verifyPassword('approve', id);
  const handleReject = (id) => verifyPassword('reject', id);
  const handlePromoteVip = (userId) => verifyPassword('promote', userId);
  const handleToggleBan = (userId) => verifyPassword('ban', userId);

  const handleApproveConfirm = (id) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, status: 'approved', adminAction: 'تم القبول بواسطة المدير' } : tx
    ));
    const tx = transactions.find(t => t.id === id);
    setAuditLogs(prev => [{ id: Date.now(), admin: 'المدير الفائق', action: `قبول طلب ${tx.type === 'deposit' ? 'إيداع' : 'سحب'} #${id}`, timestamp: new Date().toLocaleString('ar-EG') }, ...prev]);
    alert('✅ تم قبول الطلب بنجاح!');
  };

  const handleRejectConfirm = (id) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, status: 'rejected', adminAction: 'تم الرفض بواسطة المدير' } : tx
    ));
    const tx = transactions.find(t => t.id === id);
    setAuditLogs(prev => [{ id: Date.now(), admin: 'المدير الفائق', action: `رفض طلب ${tx.type === 'deposit' ? 'إيداع' : 'سحب'} #${id}`, timestamp: new Date().toLocaleString('ar-EG') }, ...prev]);
    alert('❌ تم رفض الطلب.');
  };

  const handlePromoteConfirm = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId && u.vip < 7) {
        const newVip = u.vip + 1;
        setAuditLogs(prevLogs => [{ id: Date.now(), admin: 'المدير الفائق', action: `ترقية المستخدم ${u.fullName} إلى VIP ${newVip}`, timestamp: new Date().toLocaleString('ar-EG') }, ...prevLogs]);
        alert(`✅ تم ترقية ${u.fullName} إلى VIP ${newVip}`);
        return { ...u, vip: newVip };
      }
      return u;
    }));
  };

  const handleBanConfirm = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'نشط' ? 'موقف' : 'نشط';
        setAuditLogs(prevLogs => [{ id: Date.now(), admin: 'المدير الفائق', action: `${newStatus === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} حساب ${u.fullName}`, timestamp: new Date().toLocaleString('ar-EG') }, ...prevLogs]);
        alert(`✅ تم ${newStatus === 'موقف' ? 'تجميد' : 'إلغاء تجميد'} حساب ${u.fullName}`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  // ===== 7. تحرير الرصيد =====
  const handleEditBalance = (user) => {
    setEditBalanceUser(user);
    setEditAmount('');
    setEditReason('');
    setIsEditBalanceModalOpen(true);
  };

  const handleConfirmEditBalance = () => {
    if (!editAmount || isNaN(editAmount) || parseFloat(editAmount) === 0) {
      alert('⚠️ الرجاء إدخال مبلغ صحيح.');
      return;
    }
    const amount = parseFloat(editAmount);
    setUsers(prev => prev.map(u => {
      if (u.id === editBalanceUser.id) {
        const newBalance = u.balance + amount;
        setAuditLogs(prevLogs => [{ id: Date.now(), admin: 'المدير الفائق', action: `${amount > 0 ? 'إضافة' : 'خصم'} $${Math.abs(amount).toFixed(2)} من رصيد ${u.fullName} (السبب: ${editReason || 'بدون سبب'})`, timestamp: new Date().toLocaleString('ar-EG') }, ...prevLogs]);
        alert(`✅ تم ${amount > 0 ? 'إضافة' : 'خصم'} $${Math.abs(amount).toFixed(2)} من رصيد ${u.fullName}`);
        return { ...u, balance: newBalance };
      }
      return u;
    }));
    setIsEditBalanceModalOpen(false);
    setEditBalanceUser(null);
  };

  // ===== 8. الإشعارات =====
  const handleSendUserNotification = (user) => {
    setSelectedUser(user);
    setUserNotificationMessage('');
    setIsUserNotificationModalOpen(true);
  };

  const handleSendUserNotificationSubmit = () => {
    if (!userNotificationMessage.trim()) {
      alert('⚠️ الرجاء كتابة رسالة.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAuditLogs(prev => [{ 
        id: Date.now(), 
        admin: 'المدير الفائق', 
        action: `إرسال إشعار مخصص للمستخدم ${selectedUser.fullName}: "${userNotificationMessage}"`, 
        timestamp: new Date().toLocaleString('ar-EG') 
      }, ...prev]);
      alert(`✅ تم إرسال الإشعار إلى ${selectedUser.fullName} بنجاح!`);
      setIsUserNotificationModalOpen(false);
      setSelectedUser(null);
      setUserNotificationMessage('');
    }, 1000);
  };

  const handleSendNotification = () => {
    if (!notificationMessage.trim()) return alert('⚠️ الرجاء كتابة رسالة.');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAuditLogs(prev => [{ id: Date.now(), admin: 'المدير الفائق', action: `إرسال إشعار جماعي: "${notificationMessage}"`, timestamp: new Date().toLocaleString('ar-EG') }, ...prev]);
      alert('✅ تم إرسال الإشعار لجميع المستخدمين!');
      setIsNotificationModalOpen(false);
      setNotificationMessage('');
    }, 1500);
  };

  // ===== 9. دوال مساعدة =====
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewDetails = (tx) => {
    setSelectedTransaction(tx);
    setIsDetailsModalOpen(true);
  };

  // ===== 10. الشارات التحفيزية =====
  const getUserBadge = (user) => {
    if (user.referrals >= 20) return { icon: '👑', label: 'ملك التسويق', color: 'text-yellow-400' };
    if (user.referrals >= 10) return { icon: '⭐', label: 'مسوق ماسي', color: 'text-cyan-400' };
    if (user.dailyTasks === 5) return { icon: '🔥', label: 'نشيط اليوم', color: 'text-orange-400' };
    return null;
  };

  // ===== 11. الفلاتر الزمنية =====
  const getDateFilter = (dateStr) => {
    const now = new Date();
    const txDate = new Date(dateStr);
    if (filterDate === 'today') return txDate.toDateString() === now.toDateString();
    if (filterDate === 'week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return txDate >= weekAgo;
    }
    if (filterDate === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // ===== 12. فلترة البيانات =====
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.userName.includes(searchTerm) || tx.phone.includes(searchTerm) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesDate = getDateFilter(tx.date);
    return matchesSearch && matchesType && matchesDate;
  });

  const filteredUsers = users.filter(u => 
    u.fullName.includes(searchTerm) || u.phone.includes(searchTerm)
  );

  // ===== 13. الإحصائيات =====
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'نشط').length;
  const pendingTx = transactions.filter(t => t.status === 'pending').length;
  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((acc, t) => acc + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'approved').reduce((acc, t) => acc + t.amount, 0);
  const totalFees = transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + (t.type === 'withdraw' ? t.amount * (t.network === 'TRC20' ? 0.05 : 0.03) : 0), 0);
  const topReferrers = [...users].sort((a, b) => b.referrals - a.referrals).slice(0, 5);

  // ===== 14. الرسم البياني =====
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('ar-EG', { weekday: 'short' }));
    }
    return days;
  };
  const chartDays = getLast7Days();
  const chartData = chartDays.map((day, idx) => {
    const dayDate = new Date(); dayDate.setDate(dayDate.getDate() - (6 - idx));
    const dayStr = dayDate.toISOString().split('T')[0];
    const deposits = transactions.filter(t => t.type === 'deposit' && t.status === 'approved' && t.date.includes(dayStr)).reduce((s, t) => s + t.amount, 0);
    const withdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'approved' && t.date.includes(dayStr)).reduce((s, t) => s + t.amount, 0);
    return { deposits, withdrawals };
  });
  const maxVal = Math.max(...chartData.flatMap(d => [d.deposits, d.withdrawals]), 1);

  // ===== 15. التبويبات =====
  const tabs = [
    { key: 'overview', label: 'نظرة عامة', icon: BarChart },
    { key: 'transactions', label: 'المعاملات', icon: ListChecks },
    { key: 'users', label: 'المستخدمين', icon: Users },
    { key: 'referrals', label: 'التسويق', icon: Award },
    { key: 'audit', label: 'سجل الإجراءات', icon: Clock },
  ];

  // ===== 16. التصميم =====
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

        {/* ============================================================ */}
        {/* ===== 1. نظرة عامة ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] transition-colors`}>
              <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-400" />
                أفضل 5 مسوقين (الإحالات)
              </h3>
              <div className="space-y-2">
                {topReferrers.map((u, idx) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-yellow-400 text-slate-950' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-gray-400'}`}>{idx + 1}</span>
                      <span className="font-bold text-white">{u.fullName}</span>
                      {getUserBadge(u) && <span className="text-sm" title={getUserBadge(u).label}>{getUserBadge(u).icon}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-cyan-400 font-mono">VIP {u.vip}</span>
                      <span className="text-green-400 font-bold">{u.referrals} إحالة</span>
                      <button onClick={() => handlePromoteVip(u.id)} className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/40 transition-all">رفع VIP</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`${cardBg} backdrop-blur-xl border ${borderColor} rounded-3xl p-6 transition-colors`}>
                <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan-400" /> حركة الأيام السبعة الماضية</h4>
                <div className="flex items-end h-40 gap-2">
                  {chartDays.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex justify-center gap-0.5">
                        <div className="w-3 bg-green-500/80 rounded-t-sm" style={{ height: `${(chartData[idx].deposits / maxVal) * 100}%` }} />
                        <div className="w-3 bg-orange-500/80 rounded-t-sm" style={{ height: `${(chartData[idx].withdrawals / maxVal) * 100}%` }} />
                      </div>
                      <span className="text-[8px] text-gray-400">{day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-400">
                  <span><span className="inline-block w-2 h-2 bg-green-500 rounded-sm ml-1" /> إيداع</span>
                  <span><span className="inline-block w-2 h-2 bg-orange-500 rounded-sm ml-1" /> سحب</span>
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
          </div>
        )}

        {/* ============================================================ */}
        {/* ===== 2. المعاملات ===== */}
        {activeTab === 'transactions' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-4 md:p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            
            <div className="flex flex-col md:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="بحث بالاسم، الهاتف، المعرف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pr-10 pl-4 py-2 rounded-xl ${inputBg} border ${borderColor} text-white placeholder-gray-500 text-xs outline-none focus:border-[#00f3ff] transition-colors`} />
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
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">لا توجد معاملات مطابقة</td></tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-white" onClick={() => handleViewDetails(tx)}>{tx.id}</td>
                        <td className="p-3" onClick={() => handleViewDetails(tx)}>
                          <span className="block text-white">{tx.userName}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">{tx.phone}</span>
                        </td>
                        <td className="p-3" onClick={() => handleViewDetails(tx)}>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{tx.type === 'deposit' ? 'إيداع' : 'سحب'}</span>
                        </td>
                        <td className="p-3 font-mono font-bold" onClick={() => handleViewDetails(tx)}>
                          <span className={tx.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}>${tx.amount}</span>
                        </td>
                        <td className="p-3" onClick={() => handleViewDetails(tx)}>
                          <span className="text-cyan-300 text-[10px]">{tx.network}</span>
                        </td>
                        <td className="p-3" onClick={() => handleViewDetails(tx)}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tx.status === 'approved' ? 'bg-green-500/20 border-green-500/30 text-green-400' : tx.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'}`}>
                            {tx.status === 'approved' ? 'مقبول' : tx.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {tx.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleApprove(tx.id)} className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 transition-all" title="قبول"><CheckCircle2 className="w-4 h-4" /></button>
                              <button onClick={() => handleReject(tx.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-all" title="رفض"><XCircle className="w-4 h-4" /></button>
                              <button onClick={() => handleViewDetails(tx)} className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/30 transition-all" title="تفاصيل"><Eye className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => handleViewDetails(tx)} className="text-gray-500 hover:text-cyan-400 text-[10px] flex items-center gap-1 mx-auto"><Eye className="w-3 h-3" /> عرض</button>
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

        {/* ============================================================ */}
        {/* ===== 3. المستخدمين ===== */}
        {activeTab === 'users' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-4 md:p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            
            <div className="flex flex-col md:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="بحث بالاسم أو رقم الهاتف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pr-10 pl-4 py-2 rounded-xl ${inputBg} border ${borderColor} text-white placeholder-gray-500 text-xs outline-none focus:border-[#00f3ff] transition-colors`} />
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
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white">{u.fullName} {badge && <span className="mr-1 text-sm" title={badge.label}>{badge.icon}</span>}</td>
                        <td className="p-3 font-mono text-cyan-400/80">{u.phone}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">VIP {u.vip}</span></td>
                        <td className="p-3 font-mono font-bold">${u.balance}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'نشط' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.status}</span></td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleSendUserNotification(u)} className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/30 transition-all" title="إرسال إشعار مخصص"><MessageSquare className="w-4 h-4" /></button>
                            <button onClick={() => handleEditBalance(u)} className="p-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-white border border-yellow-500/30 transition-all" title="تحرير الرصيد"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handlePromoteVip(u.id)} className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/30 transition-all" title="رفع VIP"><Crown className="w-4 h-4" /></button>
                            <button onClick={() => handleToggleBan(u.id)} className={`p-1.5 rounded-lg border transition-all ${u.status === 'نشط' ? 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border-red-500/30' : 'bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border-green-500/30'}`} title={u.status === 'نشط' ? 'تجميد' : 'إلغاء التجميد'}>
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

        {/* ============================================================ */}
        {/* ===== 4. التسويق ===== */}
        {activeTab === 'referrals' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Award className="w-6 h-6 text-yellow-400" /> قائمة المسوقين والمكافآت</h3>
              <button onClick={() => alert('✅ تم صرف مكافآت مكتسبة للمسوقين!')} className="px-6 py-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-all flex items-center gap-2">
                <Send className="w-4 h-4" /> صرف المكافآت المستحقة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.filter(u => u.referrals > 0).sort((a,b) => b.referrals - a.referrals).map((u, idx) => (
                <div key={u.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-yellow-400 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'}`}>{idx + 1}</span>
                    <div>
                      <p className="font-bold text-white">{u.fullName}</p>
                      <p className="text-[10px] text-gray-400">VIP {u.vip} • {u.referrals} إحالة</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">المكافأة التقديرية</p>
                    <p className="font-bold text-green-400">${(u.referrals * 2.5).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ===== 5. سجل الإجراءات ===== */}
        {activeTab === 'audit' && (
          <div className={`${cardBg} backdrop-blur-2xl border ${borderColor} rounded-3xl p-6 shadow-[0_0_20px_rgba(0,243,255,0.05)] space-y-4 transition-colors`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="w-6 h-6 text-cyan-400" /> سجل الإجراءات الإدارية</h3>
              <span className="text-xs text-gray-400">آخر تحديث: {lastUpdated.toLocaleString('ar-EG')}</span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-sm text-white">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>🛡️ {log.admin}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ===== النوافذ المنبثقة ===== */}

        {/* تفاصيل المعاملة */}
        {isDetailsModalOpen && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)}>
            <div className="relative w-full max-w-lg bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
              <h3 className="text-xl font-black text-cyan-300 mb-4 text-center">📋 تفاصيل المعاملة #{selectedTransaction.id}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">المستخدم</span><span className="font-bold text-white">{selectedTransaction.userName}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">رقم الهاتف</span><span className="font-mono text-cyan-400">{selectedTransaction.phone}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">النوع</span><span className={`font-bold ${selectedTransaction.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}`}>{selectedTransaction.type === 'deposit' ? 'إيداع' : 'سحب'}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">المبلغ</span><span className="font-mono font-bold text-white">${selectedTransaction.amount}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">الشبكة</span><span className="font-bold text-cyan-300">{selectedTransaction.network}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">عنوان المحفظة</span>
                  <div className="flex items-center gap-2 max-w-[60%]"><span className="text-xs font-mono text-gray-300 truncate">{selectedTransaction.address}</span>
                    <button onClick={() => handleCopy(selectedTransaction.address)} className="p-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-all">{copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}</button>
                  </div>
                </div>
                {selectedTransaction.txHash !== '-' && (
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">هاش المعاملة</span>
                    <div className="flex items-center gap-2 max-w-[60%]"><span className="text-xs font-mono text-cyan-400 truncate">{selectedTransaction.txHash}</span>
                      <button onClick={() => handleCopy(selectedTransaction.txHash)} className="p-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-all">{copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}</button>
                    </div>
                  </div>
                )}
                {selectedTransaction.note && (
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">ملاحظة</span><span className="text-gray-300 text-xs">{selectedTransaction.note}</span></div>
                )}
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">التاريخ</span><span className="text-gray-300">{selectedTransaction.date}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">الحالة</span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${selectedTransaction.status === 'approved' ? 'bg-green-500/20 text-green-400' : selectedTransaction.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {selectedTransaction.status === 'approved' ? 'مقبول' : selectedTransaction.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </span>
                </div>
                {selectedTransaction.adminAction && <div className="mt-2 p-2 rounded-xl bg-white/5 text-xs text-gray-400 border border-white/5">{selectedTransaction.adminAction}</div>}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsDetailsModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">إغلاق</button>
                {selectedTransaction.status === 'pending' && (
                  <>
                    <button onClick={() => { handleApprove(selectedTransaction.id); setIsDetailsModalOpen(false); }} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]">قبول</button>
                    <button onClick={() => { handleReject(selectedTransaction.id); setIsDetailsModalOpen(false); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">رفض</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* تأكيد كلمة المرور */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => { setIsPasswordModalOpen(false); setPendingAction(null); }}>
            <div className="relative w-full max-w-sm bg-[#030914] border border-yellow-400/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(250,204,21,0.2)]" onClick={(e) => e.stopPropagation()}>
              <div className="text-center space-y-4">
                <Lock className="w-12 h-12 text-yellow-400 mx-auto" />
                <h3 className="text-xl font-black text-white">🔐 تأكيد الإجراء</h3>
                <p className="text-sm text-gray-400">هذا الإجراء حساس، يرجى إدخال كلمة المرور لتأكيد هوية المدير.</p>
                <input type="password" placeholder="أدخل كلمة المرور..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-yellow-400 text-center" onKeyDown={(e) => e.key === 'Enter' && handlePasswordConfirm()} />
                <div className="flex gap-3">
                  <button onClick={() => { setIsPasswordModalOpen(false); setPendingAction(null); }} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">إلغاء</button>
                  <button onClick={handlePasswordConfirm} className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-slate-950 font-bold text-sm hover:bg-yellow-300 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)]">تأكيد</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تحرير الرصيد */}
        {isEditBalanceModalOpen && editBalanceUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditBalanceModalOpen(false)}>
            <div className="relative w-full max-w-md bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsEditBalanceModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
              <h3 className="text-xl font-black text-white mb-2 text-center">✏️ تعديل الرصيد</h3>
              <p className="text-center text-sm text-gray-400 mb-4">{editBalanceUser.fullName} (VIP {editBalanceUser.vip}) • الرصيد الحالي: ${editBalanceUser.balance}</p>
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
                <button onClick={handleConfirmEditBalance} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all">تأكيد التعديل</button>
              </div>
            </div>
          </div>
        )}

        {/* الإشعار الجماعي */}
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

        {/* الإشعار المخصص */}
        {isUserNotificationModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsUserNotificationModalOpen(false)}>
            <div className="relative w-full max-w-md bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsUserNotificationModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
              <div className="flex items-center gap-3 mb-4"><MessageSquare className="w-8 h-8 text-cyan-400" /><div><h3 className="text-xl font-black text-white">✉️ إشعار مخصص</h3><p className="text-xs text-gray-400">إلى: {selectedUser.fullName}</p></div></div>
              <textarea value={userNotificationMessage} onChange={(e) => setUserNotificationMessage(e.target.value)} placeholder={`اكتب رسالتك إلى ${selectedUser.fullName}...`} rows="4" className="w-full mt-1 bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm" />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsUserNotificationModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">إلغاء</button>
                <button onClick={handleSendUserNotificationSubmit} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isProcessing ? 'جاري...' : <><Send className="w-4 h-4" /> إرسال</>}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;