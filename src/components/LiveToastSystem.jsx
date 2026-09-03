import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X
} from 'lucide-react';

const LiveToastSystem = () => {
  const [activeToasts, setActiveToasts] = useState([]);
  const [allToasts, setAllToasts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  // ✅ قائمة أسماء كبيرة (أكثر من 50 اسماً)
  const names = [
    'أحمد محمود', 'سارة خالد', 'محمد علي', 'فاطمة الزهراء', 'عمر الفاروق',
    'ليلى أحمد', 'يوسف حسن', 'نورة سعيد', 'خالد عبدالله', 'منى إبراهيم',
    'عبدالرحمن صالح', 'هند محمد', 'سيف الدين', 'ريما خالد', 'حسن علي',
    'زينب أحمد', 'علي حسين', 'نادين سمير', 'طارق محمود', 'هبة الله',
    'جمال عبدالناصر', 'سمية عادل', 'رامي إسماعيل', 'نهى كريم', 'سامي رشيد',
    'أروى جمال', 'عماد شوقي', 'مريم فوزي', 'ياسر نبيل', 'غادة فريد',
    'معاذ ياسر', 'داليا أسامة', 'رائد مروان', 'شيماء طارق', 'ناصر خالد',
    'أمل رضا', 'باسم ماهر', 'عبير سامي', 'إيهاب شريف', 'نهلة أحمد',
    'رفيق يوسف', 'تهاني سليمان', 'أكرم حسين', 'ليليان سمير', 'صلاح الدين',
    'هدى جمال', 'أيمن نصار', 'سحر محمد', 'جيهان رشدي', 'ماجد فؤاد',
    'أماني عاطف', 'رشا عمر', 'حمدي صبري', 'آية ناصر', 'عصام رضا'
  ];

  const networks = ['TRC20', 'BEP20'];
  const types = ['deposit', 'withdraw'];
  const depositAmounts = [50, 100, 200, 500, 1000, 1500, 3000];
  const withdrawAmounts = [14, 25, 50, 100, 200, 500, 1000];

  // ===== جلب الإشعارات الحقيقية من الخادم =====
  const fetchRealNotifications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`);
      const data = await res.json();
      if (data.success && data.notifications?.length > 0) {
        const newToasts = data.notifications.map(n => ({
          id: n.id || Date.now() + Math.random() * 1000,
          name: n.userName,
          type: n.type,
          amount: n.amount,
          network: n.network || 'TRC20',
          time: new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          message: n.type === 'deposit' 
            ? `تم إيداع مبلغ $${n.amount} بنجاح` 
            : `تم سحب مبلغ $${n.amount} بنجاح`
        }));
        setAllToasts(prev => [...newToasts, ...prev].slice(0, 50));
        setActiveToasts(prev => [...newToasts, ...prev].slice(0, 3));
        setHasNew(true);
        setTimeout(() => setHasNew(false), 3000);
      }
    } catch (error) {
      // لا يوجد إشعارات حقيقية، نستخدم المحاكاة
    }
  };

  // ===== توليد إشعارات وهمية =====
  const generateRandomToast = () => {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomNetwork = networks[Math.floor(Math.random() * networks.length)];
    const randomAmount = randomType === 'deposit' 
      ? depositAmounts[Math.floor(Math.random() * depositAmounts.length)]
      : withdrawAmounts[Math.floor(Math.random() * withdrawAmounts.length)];

    const newToast = {
      id: Date.now() + Math.random() * 1000,
      name: randomName,
      type: randomType,
      amount: randomAmount,
      network: randomNetwork,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      message: randomType === 'deposit' 
        ? `تم إيداع مبلغ $${randomAmount} بنجاح` 
        : `تم سحب مبلغ $${randomAmount} بنجاح`
    };

    setAllToasts(prev => [newToast, ...prev].slice(0, 50));
    setActiveToasts(prev => [newToast, ...prev].slice(0, 3));
    setHasNew(true);
    setTimeout(() => setHasNew(false), 3000);

    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  // ===== تشغيل التحديثات =====
  useEffect(() => {
    fetchRealNotifications();
    const interval = setInterval(() => {
      fetchRealNotifications();
      setTimeout(generateRandomToast, 3000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const removeFromHistory = (id) => {
    setAllToasts(prev => prev.filter(t => t.id !== id));
  };

  const BellIcon = hasNew ? BellRing : Bell;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-5 z-50 p-4 rounded-full shadow-[0_0_25px_rgba(0,243,255,0.5)] border transition-all duration-300 ${
          hasNew 
            ? 'bg-[#00f3ff] text-slate-950 border-[#00f3ff] animate-pulse shadow-[0_0_35px_rgba(0,243,255,0.8)]' 
            : 'bg-[#00f3ff]/10 text-[#00f3ff] border-[#00f3ff]/40 hover:bg-[#00f3ff]/20'
        }`}
      >
        <BellIcon className="w-6 h-6" />
        {activeToasts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)]">
            {activeToasts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-md max-h-[70vh] bg-[#030914]/95 backdrop-blur-2xl border border-[#00f3ff]/30 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.15)] p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#00f3ff]" />
                <h3 className="text-lg font-bold text-white">الإشعارات المباشرة</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#00f3ff]/20 text-[#00f3ff] text-[10px] font-bold">
                  {allToasts.length}
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[50vh] px-1">
              {allToasts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Bell className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                  لا توجد إشعارات بعد
                </div>
              ) : (
                allToasts.map((toast) => (
                  <div 
                    key={toast.id}
                    className={`p-3 rounded-2xl border transition-all backdrop-blur-sm flex items-start gap-3 ${
                      toast.type === 'deposit' 
                        ? 'bg-green-500/5 border-green-500/20' 
                        : 'bg-cyan-500/5 border-cyan-500/20'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      toast.type === 'deposit' 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-cyan-500/10 border-cyan-500/30 text-[#00f3ff]'
                    }`}>
                      {toast.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{toast.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{toast.network}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-green-500/20 border-green-500/30 text-green-400">
                          ✅ منجز
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">{toast.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono font-bold ${
                          toast.type === 'deposit' ? 'text-green-400' : 'text-[#00f3ff]'
                        }`}>
                          ${toast.amount}
                        </span>
                        <span className="text-[10px] text-gray-500">•</span>
                        <span className="text-[10px] text-gray-500">{toast.time}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromHistory(toast.id)}
                      className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center">
              <span className="text-[10px] text-gray-500">
                آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default LiveToastSystem;
