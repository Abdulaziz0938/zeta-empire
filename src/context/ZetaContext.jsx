import React, { createContext, useState, useContext, useEffect } from 'react';

// ===== إنشاء السياق =====
const ZetaContext = createContext();

// ===== مزود السياق =====
export const ZetaProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('zeta_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('zeta_user');
  };

  const refreshUser = async () => {
    if (!user?.phone) return;
    const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.phone}`);
      const data = await res.json();
      if (data.success) {
        const updatedUser = data.user;
        setUser(updatedUser);
        localStorage.setItem('zeta_user', JSON.stringify(updatedUser));
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
