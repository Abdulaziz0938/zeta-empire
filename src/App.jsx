import React, { useState, useEffect } from 'react';
import { 
  Home, CheckSquare, Users, User, Wallet, ShieldAlert, 
  ArrowDownLeft, ArrowUpRight, Crown
} from 'lucide-react';

import AuthPortal from './components/AuthPortal.jsx';
import WorkPage from './components/WorkPage.jsx';
import TeamPage from './components/TeamPage.jsx';
import VIPOverview from './components/VIPOverview.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import FinanceModal from './components/FinanceModal.jsx';
import LiveToastSystem from './components/LiveToastSystem.jsx';

const App = () => {
  // ✅ استعادة الجلسة من localStorage عند تحميل التطبيق
  const savedUser = localStorage.getItem('zeta_user');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUser);
  const [user, setUser] = useState(initialUser);

  const [activeScreen, setActiveScreen] = useState('home');
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [lang, setLang] = useState('ar');

  // ✅ دالة تسجيل الدخول (حفظ الجلسة)
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('zeta_user', JSON.stringify(userData));
  };

  // ✅ دالة تسجيل الخروج
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('zeta_user');
  };

  // إذا لم يكن المستخدم مسجلاً، اعرض بوابة المصادقة
  if (!isLoggedIn || !user) {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} lang={lang} setLang={setLang} />;
  }

  // ✅ نستخدم `user` مباشرة، وليس بيانات افتراضية
  return (
    <div className="min-h-screen bg-[#030914] text-white font-sans relative pb-28" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <LiveToastSystem />

      <FinanceModal 
        isOpen={isFinanceOpen} 
        onClose={() => setIsFinanceOpen(false)} 
        balance={user.balance} 
      />

      <header className="sticky top-0 z-40 bg-[#030914]/80 backdrop-blur-xl border-b border-[#00f3ff]/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00f3ff] to-cyan-500 p-0.5 shadow-[0_0_15px_#00f3ff]">
              <div className="w-full h-full bg-[#030914] rounded-[14px] flex items-center justify-center font-black text-cyan-300 text-sm">
                ZE
              </div>
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-wider">ZETA EMPIRE</h1>
              <p className="text-[10px] text-cyan-400 font-mono">المنصة المالية الرقمية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFinanceOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#00f3ff]/10 border border-[#00f3ff]/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:bg-[#00f3ff]/20 transition-all"
            >
              <Wallet className="w-4 h-4 text-[#00f3ff]" />
              <span className="font-mono">${user.balance.toFixed(2)}</span>
            </button>

            {/* ✅ زر الأدمن يظهر فقط للمدير الفائق */}
            {user.isAdmin === true && (
              <button
                onClick={() => setActiveScreen(activeScreen === 'admin' ? 'home' : 'admin')}
                className={`p-2 rounded-xl border transition-all ${
                  activeScreen === 'admin' 
                    ? 'bg-red-500 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title="لوحة تحكم الأدمن"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* ✅ زر تسجيل الخروج */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        
        {activeScreen === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-[#00f3ff]/20 via-cyan-900/30 to-slate-900/90 backdrop-blur-2xl border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,243,255,0.15)] flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-right">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  مستوى العقد النشط: VIP {user.vipLevel}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white">مرحباً بك، {user.fullName}</h2>
                <p className="text-xs text-gray-300">نفذ مهامك اليومية بضغطة زر للحصول على عمولات الفئة الحالية.</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsFinanceOpen(true)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-[#00f3ff] text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,243,255,0.4)] flex items-center justify-center gap-2"
                >
                  <ArrowDownLeft className="w-4 h-4" /> إيداع
                </button>
                <button
                  onClick={() => setIsFinanceOpen(true)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-orange-500 text-white font-black text-xs shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" /> سحب
                </button>
              </div>
            </div>

            {/* زر VIP */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveScreen('vip')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                عرض جميع مستويات VIP والترقية
              </button>
            </div>

            {/* الإحصائيات السريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4 text-center">
                <p className="text-[11px] text-gray-400">أرباح اليوم</p>
                <p className="text-xl font-bold text-green-400 mt-1 font-mono">+${user.dailyEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4 text-center">
                <p className="text-[11px] text-gray-400">أرباح الأسبوع</p>
                <p className="text-xl font-bold text-cyan-300 mt-1 font-mono">+${user.weeklyEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4 text-center">
                <p className="text-[11px] text-gray-400">عمولات الإحالة</p>
                <p className="text-xl font-bold text-yellow-300 mt-1 font-mono">${user.referralEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4 text-center">
                <p className="text-[11px] text-gray-400">إجمالي الأرباح</p>
                <p className="text-xl font-bold text-white mt-1 font-mono">${user.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {activeScreen === 'tasks' && <WorkPage user={user} lang={lang} />}
        {activeScreen === 'team' && <TeamPage user={user} lang={lang} />}
        {activeScreen === 'profile' && <ProfilePage user={user} lang={lang} setLang={setLang} />}
        
        {activeScreen === 'vip' && (
          <VIPOverview user={user} lang={lang} onBack={() => setActiveScreen('home')} />
        )}

        {activeScreen === 'admin' && user.isAdmin === true && (
          <AdminPanel onBack={() => setActiveScreen('home')} onNavigate={(screen) => setActiveScreen(screen)} />
        )}

        {activeScreen === 'admin' && user.isAdmin !== true && (
          <div className="text-center py-20">
            <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
            <h2 className="text-2xl font-bold text-red-400">🚫 غير مصرح لك!</h2>
            <p className="text-gray-400 mt-2">هذه الصفحة مخصصة للمديرين فقط.</p>
            <button 
              onClick={() => setActiveScreen('home')}
              className="mt-4 px-6 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-sm hover:bg-cyan-500/30 transition-all"
            >
              العودة إلى الرئيسية
            </button>
          </div>
        )}

      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-[#030914]/80 backdrop-blur-2xl border border-[#00f3ff]/40 rounded-3xl p-2 shadow-[0_0_35px_rgba(0,243,255,0.2)]">
        <div className="flex justify-around items-center">
          {[
            { key: 'home', label: 'الرئيسية', icon: Home },
            { key: 'tasks', label: 'المهام', icon: CheckSquare },
            { key: 'team', label: 'الفريق', icon: Users },
            { key: 'profile', label: 'حسابي', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreen === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveScreen(tab.key)}
                className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-[#00f3ff] bg-[#00f3ff]/10 border border-[#00f3ff]/30 shadow-[0_0_15px_rgba(0,243,255,0.3)] scale-105' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_#00f3ff]' : ''}`} />
                <span className="text-[10px] font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
};

export default App;