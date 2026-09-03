import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle2, RefreshCw, Zap, ShieldCheck, DollarSign, Lock, RotateCcw
} from 'lucide-react';

const WorkPage = ({ user, lang = 'ar' }) => {
  const t = {
    ar: {
      title: "مركز المهام اليومية",
      subtitle: "أكمل المهام الخمس لتحصيل أرباح عقود VIP",
      vipLevel: "مستوى VIP الحالي",
      dailyCommission: "نسبة العمولة اليومية",
      capLocked: "المبلغ المحجوز للمهام (98%)",
      completedTasks: "المهام المكتملة",
      resetTime: "تجديد المهام خلال",
      startTask: "تنفيذ المهمة",
      processing: "جاري المعالجة...",
      taskSuccess: "تم إكمال المهمة بنجاح!",
      allDone: "أحسنت! أكملت جميع مهام اليوم.",
      earned: "الربح الصافي المستلم",
      taskPrice: "قيمة العقد المقتطعة",
      commissionEarned: "ربح المهمة",
      contractAmount: "مبلغ العقد المحجوز (98%)",
      contractRenewed: "✅ تم تجديد العقد بنجاح!",
      profitAdded: "أرباح اليوم مضافة إلى رصيدك القابل للسحب",
      contractLocked: "مبلغ العقد ما زال محجوزاً للمهام القادمة",
      noContract: "💰 لا توجد عقود مفعلة",
      depositFirst: "قم بإيداع مبلغ لتفعيل عقود VIP والبدء في المهام اليومية.",
      backToDeposit: "العودة للإيداع"
    },
    en: {
      title: "Daily Task Center",
      subtitle: "Complete 5 tasks to unlock your VIP contract yield",
      vipLevel: "Current VIP Level",
      dailyCommission: "Daily Yield Rate",
      capLocked: "Task Capital (98%)",
      completedTasks: "Tasks Completed",
      resetTime: "Tasks Reset In",
      startTask: "Start Task",
      processing: "Processing...",
      taskSuccess: "Task Completed Successfully!",
      allDone: "Great job! All tasks completed for today.",
      earned: "Net Commission Earned",
      taskPrice: "Contract Value",
      commissionEarned: "Task Profit",
      contractAmount: "Locked Contract Amount (98%)",
      contractRenewed: "✅ Contract Renewed Successfully!",
      profitAdded: "Today's profit added to your withdrawable balance",
      contractLocked: "Contract amount remains locked for upcoming tasks",
      noContract: "💰 No Active Contract",
      depositFirst: "Deposit to activate VIP contracts and start daily tasks.",
      backToDeposit: "Back to Deposit"
    }
  }[lang];

  const [completedCount, setCompletedCount] = useState(user?.tasksCompletedToday || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeToReset, setTimeToReset] = useState('');
  const [showRenewMessage, setShowRenewMessage] = useState(false);

  // تعريف مستويات VIP (للحسابات الداخلية فقط)
  const vipLevels = [
    { level: 0, commission: 0, minDeposit: 0 },
    { level: 1, commission: 4.0, minDeposit: 50 },
    { level: 2, commission: 4.5, minDeposit: 100 },
    { level: 3, commission: 5.0, minDeposit: 200 },
    { level: 4, commission: 5.5, minDeposit: 400 },
    { level: 5, commission: 6.0, minDeposit: 800 },
    { level: 6, commission: 6.5, minDeposit: 1600 },
    { level: 7, commission: 7.0, minDeposit: 3200 }
  ];

  const userDeposit = user?.totalDeposit || 0;
  const vipLevel = user?.vipLevel || 0;
  const currentVipData = vipLevels.find(v => v.level === vipLevel) || vipLevels[0];
  const currentRate = currentVipData.commission;
  const totalProfit = userDeposit * (currentRate / 100);
  const contractAmount = userDeposit * 0.98;

  // حساب تقسيم الـ 98% على 5 مهام
  useEffect(() => {
    if (userDeposit === 0) {
      setTasks([]);
      return;
    }
    const capital = userDeposit * 0.98;
    let remaining = capital;
    let generatedTasks = [];

    for (let i = 0; i < 4; i++) {
      let val = parseFloat((Math.random() * (remaining / (5 - i))).toFixed(2));
      generatedTasks.push(val);
      remaining -= val;
    }
    generatedTasks.push(parseFloat(remaining.toFixed(2)));

    setTasks(generatedTasks);
  }, [userDeposit]);

  // عداد تجديد المهام
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow - now;
      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

      setTimeToReset(`${hours}:${minutes}:${seconds}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteTask = (index) => {
    if (isProcessing || index !== completedCount) return;

    setIsProcessing(true);
    setActiveTaskIndex(index);

    setTimeout(() => {
      const newCompletedCount = completedCount + 1;
      setCompletedCount(newCompletedCount);
      setIsProcessing(false);
      setActiveTaskIndex(null);

      if (newCompletedCount === 5) {
        console.log(`✅ تم إضافة ربح اليوم ($${totalProfit.toFixed(2)}) إلى الرصيد القابل للسحب.`);
        console.log(`✅ مبلغ العقد ($${contractAmount.toFixed(2)}) ما زال محجوزاً للمهام القادمة.`);
        
        setShowRenewMessage(true);
        setTimeout(() => {
          setShowRenewMessage(false);
        }, 6000);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]">
            {t.title}
          </h1>
          <p className="text-cyan-200/70 text-sm md:text-base">{t.subtitle}</p>
        </div>

        {/* رسالة تجديد العقد */}
        {showRenewMessage && (
          <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 backdrop-blur-2xl rounded-3xl p-6 text-center space-y-3 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-fade-in">
            <RotateCcw className="w-12 h-12 text-green-400 mx-auto drop-shadow-[0_0_15px_#22c55e]" />
            <h3 className="text-xl font-bold text-white">{t.contractRenewed}</h3>
            <p className="text-cyan-200">
              {t.profitAdded}: <span className="text-green-400 font-extrabold text-xl">${totalProfit.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-400">
              {t.contractLocked} (${contractAmount.toFixed(2)})
            </p>
          </div>
        )}

        {/* Dashboard Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,243,255,0.15)] flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-300/70 uppercase tracking-wider">{t.vipLevel}</p>
              <h3 className="text-2xl font-bold text-cyan-400 mt-1">VIP {vipLevel}</h3>
            </div>
            <Zap className="w-10 h-10 text-[#00f3ff] drop-shadow-[0_0_10px_#00f3ff]" />
          </div>

          <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,243,255,0.15)] flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-300/70 uppercase tracking-wider">{t.dailyCommission}</p>
              <h3 className="text-2xl font-bold text-green-400 mt-1">{currentRate}% (${totalProfit.toFixed(2)})</h3>
            </div>
            <DollarSign className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_#22c55e]" />
          </div>

          <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,243,255,0.15)] flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-300/70 uppercase tracking-wider">{t.resetTime}</p>
              <h3 className="text-xl font-mono font-bold text-yellow-300 mt-1 tracking-widest">{timeToReset}</h3>
            </div>
            <RefreshCw className="w-9 h-9 text-yellow-300 animate-spin-slow drop-shadow-[0_0_10px_#fde047]" />
          </div>
        </div>

        {/* عرض مبلغ العقد المحجوز */}
        {userDeposit > 0 && (
          <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,243,255,0.1)] flex justify-between items-center">
            <span className="text-sm text-gray-400">{t.contractAmount}:</span>
            <span className="text-lg font-bold text-cyan-300 font-mono">${contractAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-cyan-200">{t.completedTasks}</span>
            <span className="text-[#00f3ff] font-bold">{completedCount} / 5</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-[#00f3ff]/20 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-[#00f3ff] rounded-full shadow-[0_0_12px_#00f3ff] transition-all duration-500"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Task Cards */}
        {userDeposit === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">{t.noContract}</p>
            <p className="text-gray-500 text-sm mt-2">{t.depositFirst}</p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all"
            >
              {t.backToDeposit}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((taskPrice, idx) => {
              const isCompleted = idx < completedCount;
              const isCurrent = idx === completedCount;
              const isLocked = idx > completedCount;

              return (
                <div 
                  key={idx}
                  className={`transition-all duration-300 backdrop-blur-xl rounded-2xl p-5 border flex flex-col md:flex-row items-center justify-between gap-4 ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : isCurrent 
                      ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_25px_rgba(0,243,255,0.25)] scale-[1.01]' 
                      : 'bg-white/[0.02] border-white/10 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                      isCompleted ? 'bg-green-500/20 text-green-400 border-green-500/50' : 
                      isCurrent ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]' : 'bg-white/5 text-gray-500 border-white/10'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t.taskPrice}</p>
                      <p className="text-lg font-bold text-white">${taskPrice}</p>
                    </div>
                    <div className="hidden sm:block border-r border-white/10 h-8 mx-2" />
                    <div>
                      <p className="text-xs text-gray-400">{t.commissionEarned}</p>
                      <p className="text-lg font-bold text-cyan-300">+${(totalProfit / 5).toFixed(2)}</p>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-400 font-semibold px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>مكتملة</span>
                      </div>
                    ) : isLocked ? (
                      <div className="flex items-center gap-2 text-gray-500 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <Lock className="w-5 h-5" />
                        <span>مغلقة</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleExecuteTask(idx)}
                        disabled={isProcessing}
                        className="relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.8)] transition-all duration-300 disabled:opacity-50"
                      >
                        <span className="flex items-center gap-2">
                          {isProcessing && activeTaskIndex === idx ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              {t.processing}
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5 fill-slate-950" />
                              {t.startTask}
                            </>
                          )}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* رسالة إتمام المهام */}
        {completedCount === 5 && !showRenewMessage && (
          <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 backdrop-blur-2xl rounded-3xl p-6 text-center space-y-3 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-fade-in">
            <ShieldCheck className="w-16 h-16 text-green-400 mx-auto drop-shadow-[0_0_15px_#22c55e]" />
            <h2 className="text-2xl font-bold text-white">{t.allDone}</h2>
            <p className="text-cyan-200">
              {t.earned}: <span className="text-green-400 font-extrabold text-xl">${totalProfit.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-400 animate-pulse">
              ⏳ جاري تجديد العقد وإضافة الأرباح إلى رصيدك...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkPage;