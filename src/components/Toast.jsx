import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

let listeners = [];

export const toast = {
  success: (msg) => emit({ type: 'success', msg }),
  error:   (msg) => emit({ type: 'error',   msg }),
  warning: (msg) => emit({ type: 'warning', msg }),
  info:    (msg) => emit({ type: 'info',    msg })
};

function emit(payload) {
  listeners.forEach(fn => fn({ ...payload, id: Date.now() + Math.random() }));
}

const VARIANTS = {
  success: { icon: CheckCircle2, color: '#22c55e', border: 'rgba(34,197,94,0.5)',  shadow: '0 0 30px rgba(34,197,94,0.35)' },
  error:   { icon: XCircle,      color: '#ef4444', border: 'rgba(239,68,68,0.5)',  shadow: '0 0 30px rgba(239,68,68,0.35)' },
  warning: { icon: AlertTriangle,color: '#facc15', border: 'rgba(250,204,21,0.5)', shadow: '0 0 30px rgba(250,204,21,0.35)' },
  info:    { icon: Info,         color: '#00f3ff', border: 'rgba(0,243,255,0.5)',  shadow: '0 0 30px rgba(0,243,255,0.35)' }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4200);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter(fn => fn !== handler); };
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(x => x.id !== id));

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-[92%] max-w-md pointer-events-none">
      {toasts.map(t => {
        const v = VARIANTS[t.type] || VARIANTS.info;
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            dir="rtl"
            style={{
              background: 'rgba(3,9,20,0.96)',
              border: `1px solid ${v.border}`,
              boxShadow: v.shadow,
              backdropFilter: 'blur(20px)',
              animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)'
            }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3.5"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${v.color}15`, border: `1px solid ${v.border}` }}
            >
              <Icon className="w-5 h-5" style={{ color: v.color }} />
            </div>
            <p className="flex-1 text-sm font-bold text-white leading-snug">{t.msg}</p>
            <button
              onClick={() => remove(t.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
