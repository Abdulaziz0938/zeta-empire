import React, { useState, useEffect } from 'react';
import { Bell, BellRing, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';

const LiveToastSystem = ({ user }) => {
  const [activeToasts, setActiveToasts] = useState([]);
  const [allToasts, setAllToasts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  // ============================================================
  // ✅ دالة لإضافة إشعار جديد
  // ============================================================
  const addToast = (toast) => {
    const newToast = {
      id: Date.now() + Math.random() * 1000,
      ...toast,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setAllToasts(prev => [newToast, ...prev].slice(0, 50));
    setActiveToasts(prev => [newToast, ...prev].slice(0, 3));
    setHasNew(true);
    setTimeout(() => setHasNew(false), 3000);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  // ============================================================
  // ✅ الاستماع إلى الإيداعات والسحوبات الجديدة من Firebase
  // ============================================================
  useEffect(() => {
    // التأكد من وجود Firebase في الصفحة
    if (typeof firebase === 'undefined' || !firebase.database) {
      console.warn('⚠️ Firebase غير مهيأ. الإشعارات لن تعمل.');
      return;
    }

    const db = firebase.database();

    // 1️⃣ الاستماع إلى الإيداعات الجديدة
    const depositsRef = db.ref('deposits');
    depositsRef.on('child_added', (snapshot) => {
      const userPhone = snapshot.key;
      const userDeposits = snapshot.val();
      if (!userDeposits) return;

      const keys = Object.keys(userDeposits);
      const lastKey = keys[keys.length - 1];
      const deposit = userDeposits[lastKey];
      
      if (deposit && deposit.status === 'pending' && !deposit.seen) {
        if (user?.isAdmin) {
          addToast({
            name: userPhone,
            type: 'deposit',
            amount: deposit.amount,
            network: deposit.network || 'USDT',
            message: `📥 طلب إيداع جديد من ${userPhone} بمبلغ $${deposit.amount}`
          });
          db.ref(`deposits/${userPhone}/${lastKey}`).update({ seen: true });
        }
        if (user?.phone === userPhone) {
          addToast({
            name: 'أنت',
            type: 'deposit',
            amount: deposit.amount,
            network: deposit.network || 'USDT',
            message: `📤 تم إرسال طلب إيداعك بقيمة $${deposit.amount}، بانتظار الموافقة`
          });
        }
      }
    });

    // 2️⃣ الاستماع إلى السحوبات الجديدة
    const withdrawsRef = db.ref('withdraws');
    withdrawsRef.on('child_added', (snapshot) => {
      const userPhone = snapshot.key;
      const userWithdraws = snapshot.val();
      if (!userWithdraws) return;

      const keys = Object.keys(userWithdraws);
      const lastKey = keys[keys.length - 1];
      const withdraw = userWithdraws[lastKey];

      if (withdraw && withdraw.status === 'pending' && !withdraw.seen) {
        if (user?.isAdmin) {
          addToast({
            name: userPhone,
            type: 'withdraw',
            amount: withdraw.amount,
            network: withdraw.network || 'USDT',
            message: `📤 طلب سحب جديد من ${userPhone} بمبلغ $${withdraw.amount}`
          });
          db.ref(`withdraws/${userPhone}/${lastKey}`).update({ seen: true });
        }
        if (user?.phone === userPhone) {
          addToast({
            name: 'أنت',
            type: 'withdraw',
            amount: withdraw.amount,
            network: withdraw.network || 'USDT',
            message: `📤 تم إرسال طلب سحبك بقيمة $${withdraw.amount}، بانتظار الموافقة`
          });
        }
      }
    });

    // تنظيف المستمعين عند مغادرة الصفحة
    return () => {
      depositsRef.off();
      withdrawsRef.off();
    };
  }, [user]);

  // ============================================================
  // ✅ واجهة المستخدم
  // ============================================================
  const BellIcon = hasNew ? BellRing : Bell;

  const removeFromHistory = (id) => {
    setAllToasts(prev => prev.filter(t => t.id !== id));
  };

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
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
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
                  <div key={toast.id} className={`p-3 rounded-2xl border transition-all backdrop-blur-sm flex items-start gap-3 ${
                    toast.type === 'deposit' ? 'bg-green-500/5 border-green-500/20' : 
                    toast.type === 'withdraw' ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-cyan-500/5 border-cyan-500/10'
                  }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      toast.type === 'deposit' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
                      toast.type === 'withdraw' ? 'bg-cyan-500/10 border-cyan-500/30 text-[#00f3ff]' : 'bg-cyan-500/10 border-cyan-500/30 text-[#00f3ff]'
                    }`}>
                      {toast.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{toast.name}</span>
                        {toast.network && <span className="text-[10px] text-gray-400 font-mono">{toast.network}</span>}
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">{toast.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {toast.amount > 0 && <span className={`text-[10px] font-mono font-bold ${toast.type === 'deposit' ? 'text-green-400' : 'text-[#00f3ff]'}`}>${toast.amount}</span>}
                        <span className="text-[10px] text-gray-500">{toast.time}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromHistory(toast.id)} className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center">
              <span className="text-[10px] text-gray-500">آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveToastSystem;
