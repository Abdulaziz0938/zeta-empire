import React, { useState, useEffect } from 'react';
import { useZeta } from '../context/ZetaContext.jsx';

const WorkPage = ({ lang = 'ar' }) => {
  const { user, refreshUser } = useZeta();

  // ✅ إذا لم يكن هناك مستخدم، نعرض شاشة تحميل
  if (!user) {
    return (
      <div className="min-h-screen bg-[#030914] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">جاري تحميل بيانات المستخدم...</p>
        </div>
      </div>
    );
  }

  // ✅ عرض بسيط للتأكد من أن البيانات تظهر (نسخة اختبارية)
  return (
    <div className="min-h-screen bg-[#030914] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
        <h1 className="text-3xl font-black text-cyan-300 mb-4">🚀 منصة المهام اليومية</h1>
        <p className="text-gray-300 text-lg mb-6">مرحباً <span className="text-white font-bold">{user.fullName}</span> 👋</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400 text-sm">مستوى VIP</p>
            <p className="text-2xl font-bold text-yellow-400">{user.vipLevel}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400 text-sm">المهام اليومية</p>
            <p className="text-2xl font-bold text-cyan-400">{user.tasksCompletedToday || 0} / 5</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400 text-sm">الرصيد</p>
            <p className="text-2xl font-bold text-green-400">${user.balance || 0}</p>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <p className="text-green-400">✅ صفحة المهام تعمل الآن بنجاح!</p>
          <p className="text-gray-500 text-sm mt-1">جميع البيانات قادمة من الخادم الحقيقي.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-5 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
          >
            تحديث الصفحة
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkPage;
