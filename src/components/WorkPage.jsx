import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle2, RefreshCw, Zap, ShieldCheck, DollarSign, 
  Lock, RotateCcw, Clock, TrendingUp, Award, Target 
} from 'lucide-react';
import { useZeta } from '../context/ZetaContext.jsx';

const WorkPage = ({ lang = 'ar' }) => {
  const { user, refreshUser } = useZeta();
  
  const t = {
    ar: {
      title: "🚀 منصة المهام اليومية",
      subtitle: "أكمل المهام الخمس لتحصيل أرباح عقود VIP",
      vipLevel: "مستوى VIP",
      dailyCommission: "العائد اليومي",
      completedTasks: "المهام المكتملة",
      resetTime: "وقت التجديد",
      startTask: "تنفيذ المهمة",
      processing: "جاري المعالجة...",
      allDone: "🎉 تهانينا! أتممت جميع مهام اليوم",
      resetInfo: "ستُعاد المهام خلال",
      earned: "صافي الربح اليومي",
      taskPrice: "قيمة العقد المحجوز",
      commissionEarned: "ربح المهمة",
      contractAmount: "إجمالي العقد المحجوز (98%)",
      contractRenewed: "✅ تم تجديد العقد بنجاح!",
      profitAdded: "تمت إضافة الأرباح إلى رصيدك القابل للسحب",
      contractLocked: "العقد محجوز للمهام القادمة",
      noContract: "💰 لا يوجد عقد نشط",
      depositFirst: "قم بإيداع لتفعيل العقود.",
      backToDeposit: "العودة للإيداع",
      buyVipFirst: "قم بشراء عقد VIP للبدء في جني الأرباح",
      progress: "نسبة الإنجاز",
      remaining: "مهمة متبقية",
      earnedSoFar: "الأرباح المحققة حتى الآن"
    },
    en: {
      title: "🚀 Daily Task Center",
      subtitle: "Complete 5 tasks to unlock your VIP contract yield",
      vipLevel: "VIP Level",
      dailyCommission: "Daily Yield",
      completedTasks: "Tasks Done",
      resetTime: "Reset In",
      startTask: "Start Task",
      processing: "Processing...",
      allDone: "🎉 Congratulations! All tasks completed",
      resetInfo: "Tasks reset in",
      earned: "Net Daily Profit",
      taskPrice: "Locked Contract Value",
      commissionEarned: "Task Profit",
      contractAmount: "Total Locked (98%)",
      contractRenewed: "✅ Contract Renewed!",
      profitAdded: "Profit added to your balance",
      contractLocked: "Contract locked for next tasks",
      noContract: "💰 No Active Contract",
      depositFirst: "Deposit to activate.",
      backToDeposit: "Back to Deposit",
      buyVipFirst: "Buy a VIP contract to start earning",
      progress: "Progress",
      remaining: "Remaining",
      earnedSoFar: "Earned So Far"
    }
  }[lang];

  const [completedCount, setCompletedCount] = useState(user?.tasksCompletedToday || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeToReset, setTimeToReset] = useState('');
  const [showRenewMessage, setShowRenewMessage] = useState(false);
  const [allTasksDone, setAllTasksDone] = useState(completedCount === 5);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  const vipLevels = [
    { level: 0, commission: 0, contractAmount: 0 },
    { level: 1, commission: 4.0, contractAmount: 50 },
    { level: 2, commission: 4.5, contractAmount: 100 },
    { level: 3, commission: 5.0, contractAmount: 200 },
    { level: 4, commission: 5.5, contractAmount: 400 },
    { level: 5, commission: 6.0, contractAmount: 800 },
    { level: 6, commission: 6.5, contractAmount: 1600 },
    { level: 7, commission: 7.0, contractAmount: 3200 }
  ];

  const vipLevel = user?.vipLevel || 0;
  const currentVipData = vipLevels.find(v => v.level === vipLevel) || vipLevels[0];
  const currentRate = currentVipData.commission;
  const contractAmount = currentVipData.contractAmount;
  const totalProfit = contractAmount * (currentRate / 100);
  const lockedAmount = contractAmount * 0.98;
  const profitPerTask = totalProfit / 5;
  const earnedSoFar = completedCount * profitPerTask;

  useEffect(() => {
    if (contractAmount === 0) { setTasks([]); return; }
    const capital = contractAmount * 0.98;
    let remaining = capital, generated = [];
    for (let i = 0; i < 4; i++) {
      let val = parseFloat((Math.random() * (remaining / (5 - i))).toFixed(2));
      generated.push(val);
      remaining -= val;
    }
    generated.push(parseFloat(remaining.toFixed(2)));
    setTasks(generated);
  }, [contractAmount]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      setTimeToReset(
        `${String(Math.floor((diff / 3600000) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 60000) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}`
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ تحديث حالة allTasksDone عند تغير completedCount
  useEffect(() => {
    setAllTasksDone(completedCount === 5);
  }, [completedCount]);

  // ✅ تحديث completedCount عند تغير user من السياق
  useEffect(() => {
    if (user?.tasksCompletedToday !== undefined) {
      setCompletedCount(user.tasksCompletedToday);
    }
  }, [user]);

  const handleExecuteTask = async (index) => {
    if (isProcessing || index !== completedCount || allTasksDone) return;
    
    setIsProcessing(true);
    setActiveTaskIndex(index);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCompletedCount = completedCount + 1;
    setCompletedCount(newCompletedCount);
    setIsProcessing(false);
    setActiveTaskIndex(null);

    if (newCompletedCount === 5) {
      setIsProcessing(true);
      try {
        const res = await fetch(`${API_BASE}/api/tasks/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id || user.id })
        });
        const data = await res.json();
        if (data.success) {
          setShowRenewMessage(true);
          await refreshUser(); // ✅ تحديث فوري للبيانات
          setTimeout(() => setShowRenewMessage(false), 6000);
        } else {
          alert('❌ ' + data.message);
        }
      } catch (error) {
        alert('❌ تعذر الاتصال بالخادم.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* الهيدر */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,243,255,0.3)]">
            {t.title}
          </h1>
          <p className="text-cyan-200/70 text-sm md:text-base">{t.subtitle}</p>
        </div>

        {showRenewMessage && (
          <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 rounded-3xl p-6 text-center animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <RotateCcw className="w-16 h-16 text-green-400 mx-auto mb-3 drop-shadow-[0_0_20px_#22c55e]" />
            <h3 className="text-2xl font-bold text-white">{t.contractRenewed}</h3>
            <p className="text-cyan-200 text-lg">
              {t.profitAdded}: <span className="text-green-400 font-extrabold text-2xl">+${totalProfit.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">{t.contractLocked} (${lockedAmount.toFixed(2)})</p>
          </div>
        )}

        {/* بطاقات الحالة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_20px_rgba(0,243,255,0.05)]">
            <div>
              <p className="text-xs text-cyan-300/70">{t.vipLevel}</p>
              <h3 className="text-2xl font-bold text-cyan-400">VIP {vipLevel}</h3>
            </div>
            <Crown className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_#fde047]" />
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_20px_rgba(34,197,94,0.05)]">
            <div>
              <p className="text-xs text-green-300/70">{t.dailyCommission}</p>
              <h3 className="text-2xl font-bold text-green-400">{currentRate}%</h3>
              <p className="text-xs text-green-300/50">${totalProfit.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-600/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_20px_rgba(250,204,21,0.05)]">
            <div>
              <p className="text-xs text-yellow-300/70">{t.completedTasks}</p>
              <h3 className="text-2xl font-bold text-yellow-300">{completedCount} / 5</h3>
            </div>
            <Target className="w-10 h-10 text-yellow-400" />
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.05)]">
            <div>
              <p className="text-xs text-purple-300/70">{t.resetTime}</p>
              <h3 className="text-xl font-mono font-bold text-purple-300">{timeToReset}</h3>
            </div>
            <Clock className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        {contractAmount > 0 && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(0,243,255,0.05)]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">{t.contractAmount}:</span>
              <span className="text-lg font-bold text-cyan-300">${lockedAmount.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex justify-between text-xs text-gray-400">
              <span>{t.earnedSoFar}: <span className="text-green-400 font-bold">${earnedSoFar.toFixed(2)}</span></span>
              <span>{t.remaining}: {5 - completedCount} {lang === 'ar' ? 'مهمة' : 'tasks'}</span>
            </div>
          </div>
        )}

        {contractAmount > 0 && (
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-cyan-200 font-bold">{t.progress}</span>
              <span className="text-[#00f3ff] font-mono font-bold">{Math.round((completedCount / 5) * 100)}%</span>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-[#00f3ff]/20 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-[#00f3ff] rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(0,243,255,0.6)]"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ✅ عرض رسالة الإكمال الثابتة بدلاً من المهام */}
        {allTasksDone ? (
          <div className="bg-gradient-to-br from-green-500/20 via-cyan-500/10 to-blue-500/20 border border-green-500/40 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(34,197,94,0.15)] backdrop-blur-2xl">
            <ShieldCheck className="w-20 h-20 text-green-400 mx-auto mb-5 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-bounce" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{t.allDone}</h2>
            <div className="bg-white/5 rounded-2xl p-4 max-w-md mx-auto border border-white/10">
              <p className="text-gray-300 text-sm">{t.earned}:</p>
              <p className="text-3xl font-black text-green-400 drop-shadow-[0_0_20px_#22c55e]">+${totalProfit.toFixed(2)}</p>
            </div>
            <p className="text-cyan-200 mt-4 text-lg">
              {t.resetInfo}{' '}
              <span className="text-yellow-300 font-mono text-3xl font-bold bg-black/30 px-4 py-1 rounded-xl inline-block mt-2 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                {timeToReset}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-6 border-t border-white/10 pt-4">
              {t.contractLocked} (${lockedAmount.toFixed(2)})
            </p>
          </div>
        ) : (
          <>
            {contractAmount === 0 || vipLevel === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <DollarSign className="w-20 h-20 text-gray-600 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 font-bold text-2xl">{t.noContract}</p>
                <p className="text-gray-500 text-sm mt-3">{vipLevel === 0 ? t.buyVipFirst : t.depositFirst}</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_40px_rgba(0,243,255,0.7)] transition-all"
                >
                  {vipLevel === 0 ? '🚀 عرض مستويات VIP' : t.backToDeposit}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tasks.map((price, idx) => {
                  const isCompleted = idx < completedCount;
                  const isCurrent = idx === completedCount;
                  const isLocked = idx > completedCount;
                  const taskProfit = profitPerTask;

                  return (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden transition-all duration-500 backdrop-blur-xl rounded-2xl p-6 border flex flex-col md:flex-row items-center justify-between gap-4 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.1)]'
                          : isCurrent
                          ? 'bg-gradient-to-r from-cyan-500/30 to-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_35px_rgba(0,243,255,0.25)] animate-pulse'
                          : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`absolute inset-y-0 left-0 w-1.5 rounded-r-full transition-all ${
                        isCompleted ? 'bg-green-400 shadow-[0_0_15px_#22c55e]' : 
                        isCurrent ? 'bg-[#00f3ff] shadow-[0_0_25px_#00f3ff]' : 'bg-gray-600'
                      }`} />

                      <div className="flex items-center gap-5 w-full md:w-auto flex-wrap">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border transition-all ${
                            isCompleted
                              ? 'bg-green-500/20 text-green-400 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                              : isCurrent
                              ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/50 shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                              : 'bg-white/5 text-gray-500 border-white/10'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> {t.taskPrice}
                          </p>
                          <p className="text-xl font-bold text-white font-mono">${price.toFixed(2)}</p>
                        </div>
                        
                        <div className="hidden md:block w-px h-10 bg-white/10" />
                        
                        <div>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" /> {t.commissionEarned}
                          </p>
                          <p className="text-xl font-bold text-cyan-300 font-mono">+${taskProfit.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-green-400 font-bold px-5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 backdrop-blur-sm">
                            <CheckCircle2 className="w-5 h-5 animate-pulse" /> 
                            <span className="text-sm">مكتملة</span>
                          </div>
                        ) : isLocked ? (
                          <div className="flex items-center gap-2 text-gray-500 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10">
                            <Lock className="w-5 h-5" /> 
                            <span className="text-sm">مقفلة</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleExecuteTask(idx)}
                            disabled={isProcessing}
                            className="relative overflow-hidden px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                            {isProcessing && activeTaskIndex === idx ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" /> 
                                <span>{t.processing}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 fill-slate-950" /> 
                                <span>{t.startTask}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkPage;
