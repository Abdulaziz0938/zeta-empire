import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, RefreshCw, Zap, ShieldCheck, DollarSign, Lock, RotateCcw } from 'lucide-react';

const WorkPage = ({ user, lang = 'ar' }) => {
  const t = {
    ar: {
      title: "مركز المهام اليومية",
      subtitle: "أكمل المهام الخمس لتحصيل أرباح عقود VIP",
      vipLevel: "مستوى VIP الحالي",
      dailyCommission: "نسبة العمولة اليومية",
      completedTasks: "المهام المكتملة",
      resetTime: "تجديد المهام خلال",
      startTask: "تنفيذ المهمة",
      processing: "جاري المعالجة...",
      allDone: "أحسنت! أكملت جميع المهام.",
      earned: "الربح الصافي المستلم",
      taskPrice: "قيمة العقد",
      commissionEarned: "ربح المهمة",
      contractAmount: "مبلغ العقد المحجوز (98%)",
      contractRenewed: "✅ تم تجديد العقد!",
      profitAdded: "أرباح اليوم مضافة للرصيد القابل للسحب",
      contractLocked: "مبلغ العقد محجوز للمهام القادمة",
      noContract: "💰 لا توجد عقود مفعلة",
      depositFirst: "قم بإيداع لتفعيل العقود.",
      backToDeposit: "العودة للإيداع",
      buyVipFirst: "قم بشراء عقد VIP من صفحة مستويات VIP"
    },
    en: {
      title: "Daily Task Center",
      subtitle: "Complete 5 tasks to unlock your VIP contract yield",
      vipLevel: "Current VIP Level",
      dailyCommission: "Daily Yield Rate",
      completedTasks: "Tasks Completed",
      resetTime: "Tasks Reset In",
      startTask: "Start Task",
      processing: "Processing...",
      allDone: "Great job! All tasks completed.",
      earned: "Net Commission Earned",
      taskPrice: "Contract Value",
      commissionEarned: "Task Profit",
      contractAmount: "Locked Contract Amount (98%)",
      contractRenewed: "✅ Contract Renewed!",
      profitAdded: "Today's profit added to balance",
      contractLocked: "Contract locked for upcoming tasks",
      noContract: "💰 No Active Contract",
      depositFirst: "Deposit to activate.",
      backToDeposit: "Back to Deposit",
      buyVipFirst: "Buy a VIP contract from VIP Levels page"
    }
  }[lang];

  const [completedCount, setCompletedCount] = useState(user?.tasksCompletedToday || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeToReset, setTimeToReset] = useState('');
  const [showRenewMessage, setShowRenewMessage] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  // ✅ تعريف مستويات VIP مع مبلغ العقد المحدد لكل مستوى
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

  // ✅ حساب مبلغ العقد المحجوز (98% من مبلغ العقد)
  const lockedAmount = contractAmount * 0.98;

  // ===== حساب تقسيم المهام =====
  useEffect(() => {
    if (contractAmount === 0) { setTasks([]); return; }
    const capital = contractAmount * 0.98;
    let remaining = capital, generated = [];
    for (let i = 0; i < 4; i++) { let val = parseFloat((Math.random() * (remaining / (5 - i))).toFixed(2)); generated.push(val); remaining -= val; }
    generated.push(parseFloat(remaining.toFixed(2)));
    setTasks(generated);
  }, [contractAmount]);

  // ===== عداد تجديد المهام =====
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date(); const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setHours(0,0,0,0);
      const diff = tomorrow - now;
      setTimeToReset(`${String(Math.floor((diff/3600000)%24)).padStart(2,'0')}:${String(Math.floor((diff/60000)%60)).padStart(2,'0')}:${String(Math.floor((diff/1000)%60)).padStart(2,'0')}`);
    };
    updateTimer(); const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);




const [isProcessing, setIsProcessing] = useState(false);
const [taskLock, setTaskLock] = useState(false);

const handleExecuteTask = async (index) => {
  // ✅ منع الضغط المتكرر
  if (isProcessing || taskLock || index !== completedCount) return;
  
  setIsProcessing(true);
  setTaskLock(true);
  setActiveTaskIndex(index);
  
  try {
    // محاكاة تنفيذ المهمة
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newCompletedCount = completedCount + 1;
    setCompletedCount(newCompletedCount);
    
    if (newCompletedCount === 5) {
      // إرسال طلب توزيع الأرباح
      const res = await fetch(`${API_BASE}/api/tasks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id || user.id })
      });
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ تم توزيع الأرباح:', data);
        setShowRenewMessage(true);
        setTimeout(() => setShowRenewMessage(false), 6000);
      } else {
        alert('❌ ' + data.message);
      }
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
    alert('❌ تعذر الاتصال بالخادم');
  } finally {
    setIsProcessing(false);
    setTaskLock(false);
    setActiveTaskIndex(null);
  }
};






  return (
    <div className="min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center"><h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent">{t.title}</h1><p className="text-cyan-200/70">{t.subtitle}</p></div>
        {showRenewMessage && <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 rounded-3xl p-6 text-center"><RotateCcw className="w-12 h-12 text-green-400 mx-auto" /><h3 className="text-xl font-bold text-white">{t.contractRenewed}</h3><p className="text-cyan-200">{t.profitAdded}: <span className="text-green-400 font-extrabold">${totalProfit.toFixed(2)}</span></p><p className="text-xs text-gray-400">{t.contractLocked} (${lockedAmount.toFixed(2)})</p></div>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 flex justify-between"><div><p className="text-xs text-cyan-300/70">{t.vipLevel}</p><h3 className="text-2xl font-bold text-cyan-400">VIP {vipLevel}</h3></div><Zap className="w-10 h-10 text-[#00f3ff]" /></div>
          <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 flex justify-between"><div><p className="text-xs text-cyan-300/70">{t.dailyCommission}</p><h3 className="text-2xl font-bold text-green-400">{currentRate}% (${totalProfit.toFixed(2)})</h3></div><DollarSign className="w-10 h-10 text-green-400" /></div>
          <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 flex justify-between"><div><p className="text-xs text-cyan-300/70">{t.resetTime}</p><h3 className="text-xl font-mono font-bold text-yellow-300">{timeToReset}</h3></div><RefreshCw className="w-9 h-9 text-yellow-300 animate-spin-slow" /></div>
        </div>

        {contractAmount > 0 && <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4 flex justify-between"><span className="text-sm text-gray-400">{t.contractAmount}:</span><span className="text-lg font-bold text-cyan-300">${lockedAmount.toFixed(2)}</span></div>}

        <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/20 rounded-2xl p-4"><div className="flex justify-between text-sm"><span className="text-cyan-200">{t.completedTasks}</span><span className="text-[#00f3ff] font-bold">{completedCount} / 5</span></div><div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-[#00f3ff]/20 p-0.5"><div className="h-full bg-gradient-to-r from-cyan-500 to-[#00f3ff] rounded-full transition-all duration-500" style={{ width: `${(completedCount/5)*100}%` }} /></div></div>

        {contractAmount === 0 || vipLevel === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">💰 لا توجد عقود مفعلة</p>
            <p className="text-gray-500 text-sm mt-2">
              {vipLevel === 0 ? t.buyVipFirst : t.depositFirst}
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all"
            >
              {vipLevel === 0 ? 'عرض مستويات VIP' : t.backToDeposit}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((price, idx) => {
              const isCompleted = idx < completedCount, isCurrent = idx === completedCount, isLocked = idx > completedCount;
              return <div key={idx} className={`transition-all duration-300 backdrop-blur-xl rounded-2xl p-5 border flex flex-col md:flex-row items-center justify-between gap-4 ${isCompleted ? 'bg-green-500/10 border-green-500/40' : isCurrent ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_25px_rgba(0,243,255,0.25)]' : 'bg-white/5 border-white/10 opacity-50'}`}>
                <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${isCompleted ? 'bg-green-500/20 text-green-400' : isCurrent ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-white/5 text-gray-500'}`}>#{idx+1}</div><div><p className="text-xs text-gray-400">{t.taskPrice}</p><p className="text-lg font-bold text-white">${price}</p></div><div className="border-r border-white/10 h-8 mx-2" /><div><p className="text-xs text-gray-400">{t.commissionEarned}</p><p className="text-lg font-bold text-cyan-300">+${(totalProfit/5).toFixed(2)}</p></div></div>
                <div>{isCompleted ? <div className="flex items-center gap-2 text-green-400 font-semibold px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30"><CheckCircle2 className="w-5 h-5" /> مكتملة</div> : isLocked ? <div className="flex items-center gap-2 text-gray-500 px-4 py-2 rounded-xl bg-white/5 border border-white/10"><Lock className="w-5 h-5" /> مغلقة</div> : <button onClick={() => handleExecuteTask(idx)} disabled={isProcessing} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.8)] disabled:opacity-50">{isProcessing && activeTaskIndex === idx ? <><RefreshCw className="w-5 h-5 animate-spin" /> {t.processing}</> : <><Play className="w-5 h-5 fill-slate-950" /> {t.startTask}</>}</button>}</div>
              </div>;
            })}
          </div>
        )}
        {completedCount === 5 && !showRenewMessage && <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 rounded-3xl p-6 text-center"><ShieldCheck className="w-16 h-16 text-green-400 mx-auto" /><h2 className="text-2xl font-bold text-white">{t.allDone}</h2><p className="text-cyan-200">{t.earned}: <span className="text-green-400 font-extrabold text-xl">${totalProfit.toFixed(2)}</span></p></div>}
      </div>
    </div>
  );
};

export default WorkPage;
