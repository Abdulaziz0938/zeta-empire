import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';

const LiveToastSystem = ({ user }) => {
  const [activeToasts, setActiveToasts] = useState([]);
  const [allToasts, setAllToasts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const seenIdsRef = useRef(new Set()); // لتتبع الإشعارات التي ظهرت مسبقاً
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  // ============================================================
  // ✅ دالة لإضافة إشعار جديد (Toast يظهر لبضع ثوانٍ)
  // ============================================================
  const addToast = (toast) => {
    const newToast = { ...toast };
    setActiveToasts(prev => [newToast, ...prev].slice(0, 3));
    setHasNew(true);
    setTimeout(() => setHasNew(false), 3000);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  // ============================================================
  // ✅ جلب الإشعارات من الخادم كل 10 ثوانٍ
  // ============================================================
  const fetchNotifications = async () => {
    try {
      const userId = user?._id || user?.id;
      const url = userId 
        ? `${API_BASE}/api/notifications?userId=${userId}` 
        : `${API_BASE}/api/notifications`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.notifications?.length > 0) {
        // تحويل الإشعارات إلى صيغة Toast
        const newToasts = data.notifications.map(n => ({
          id: n._id || n.id,
          name: n.sender || 'النظام',
          type: n.type === 'success' ? 'deposit' : 'info',
          amount: 0,
          network: 'SYSTEM',
          time: new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          message: n.message,
          createdAt: n.createdAt
        }));

        // إضافة الإشعارات الجديدة فقط (التي لم نرها من قبل)
        const brandNewToasts = newToasts.filter(t => !seenIdsRef.current.has(t.id));
        
        if (brandNewToasts.length > 0) {
          // تسجيلها كـ "مرئية"
          brandNewToasts.forEach(t => seenIdsRef.current.add(t.id));
          
          // إضافة الإشعارات الجديدة إلى السجل والقائمة النشطة
          setAllToasts(prev => [...brandNewToasts, ...prev].slice(0, 50));
          
          // إظهار آخر 3 فقط كـ Toast نشط
          brandNewToasts.slice(0, 3).forEach((toast, idx) => {
            setTimeout(() => addToast(toast), idx * 500);
          });
        } else {
          // تحديث السجل العام دون إظهار Toasts جديدة
          setAllToasts(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const uniqueNew = newToasts.filter(t => !existingIds.has(t.id));
            return [...uniqueNew, ...prev].slice(0, 50);
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ فشل جلب الإشعارات:', error.message);
    }
  };

  // ============================================================
  // ✅ بدء التحديث الدوري (كل 10 ثوانٍ)
  // ============================================================
  useEffect(() => {
    // جلب فوري عند التحميل
    fetchNotifications();

    // ثم كل 10 ثوانٍ
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
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
      {/* الأيقونة العائمة */}
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

      {/* نافذة الإشعارات */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-md max-h-[70vh] bg-[#030914]/95 backdrop-blur-2xl border border-[#00f3ff]/30 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.15)] p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة */}
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

            {/* قائمة الإشعارات */}
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
                        : toast.type === 'withdraw'
                        ? 'bg-cyan-500/5 border-cyan-500/20'
                        : 'bg-cyan-500/5 border-cyan-500/10'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      toast.type === 'deposit' 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-cyan-500/10 border-cyan-500/30 text-[#00f3ff]'
                    }`}>
                      {toast.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : toast.type === 'withdraw' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300">{toast.message}</p>
                      <span className="text-[10px] text-gray-500">{toast.time}</span>
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

            {/* تذييل النافذة */}
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
