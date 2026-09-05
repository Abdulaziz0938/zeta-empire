import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const ZetaContext = createContext();

export const ZetaProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // ===== تحميل البيانات من localStorage عند بدء التطبيق =====
  useEffect(() => {
    const savedUser = localStorage.getItem('zeta_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('❌ فشل تحليل بيانات المستخدم:', e);
        localStorage.removeItem('zeta_user');
      }
    }
    setLoading(false);
  }, []);

  // ===== تحديث دوري كل 15 ثانية (كحل احتياطي) =====
  useEffect(() => {
    // بدء التحديث الدوري فقط إذا كان المستخدم مسجلاً
    if (isLoggedIn && user?.phone) {
      // تنظيف الـ interval السابق
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // إنشاء interval جديد
      intervalRef.current = setInterval(async () => {
        console.log('🔄 تحديث دوري للبيانات (كل 15 ثانية)...');
        await refreshUser();
      }, 15000); // 15 ثانية
    } else {
      // إيقاف التحديث الدوري إذا لم يكن هناك مستخدم
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // تنظيف عند إزالة المكون
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoggedIn, user?.phone]);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('zeta_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('zeta_user');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const refreshUser = async () => {
    if (!user?.phone) {
      console.warn('⚠️ لا يوجد مستخدم لتحديثه');
      return null;
    }
    const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.phone}`);
      const data = await res.json();
      if (data.success) {
        const updatedUser = data.user;
        setUser(updatedUser);
        localStorage.setItem('zeta_user', JSON.stringify(updatedUser));
        console.log('✅ تم تحديث بيانات المستخدم:', updatedUser.fullName, 'الرصيد:', updatedUser.balance);
        return updatedUser;
      } else {
        console.warn('⚠️ فشل تحديث بيانات المستخدم:', data.message);
      }
    } catch (error) {
      console.error('❌ فشل تحديث بيانات المستخدم:', error);
    }
    return null;
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('zeta_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    refreshUser,
    updateUser
  };

  return (
    <ZetaContext.Provider value={value}>
      {children}
    </ZetaContext.Provider>
  );
};

export const useZeta = () => {
  const context = useContext(ZetaContext);
  if (!context) {
    throw new Error('useZeta must be used within a ZetaProvider');
  }
  return context;
};
