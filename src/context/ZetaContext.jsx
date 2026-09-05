import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const ZetaContext = createContext();

export const ZetaProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

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

  // تحديث دوري احتياطي (كل 15 ثانية)
  useEffect(() => {
    if (isLoggedIn && user?.phone) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        await refreshUser();
      }, 15000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
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

  // ✅ تحديث فوري باستخدام بيانات من الخادم (بدون انتظار API)
  const updateUserDirectly = (userData) => {
    if (!userData) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('zeta_user', JSON.stringify(updatedUser));
    console.log('⚡ تحديث فوري للمستخدم:', updatedUser.fullName, 'الرصيد:', updatedUser.balance);
  };

  // ✅ تحديث بالاتصال بالخادم (دوري أو يدوي)
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
        console.log('✅ تم تحديث بيانات المستخدم (من الخادم):', updatedUser.fullName, 'الرصيد:', updatedUser.balance);
        return updatedUser;
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
    updateUser,
    updateUserDirectly // ✅ دالة جديدة للتحديث الفوري
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
