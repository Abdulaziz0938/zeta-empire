import React, { useState } from 'react';
import { 
  Lock, Phone, User, KeyRound, Gift, Eye, EyeOff, 
  ShieldCheck, Zap, Globe 
} from 'lucide-react';

const AuthPortal = ({ onAuthSuccess, lang = 'ar', setLang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    withdrawPin: ['', '', '', '', '', ''],
    referralCode: ''
  });

  const [errors, setErrors] = useState({});

  const t = {
    ar: {
      loginTab: "تسجيل الدخول",
      registerTab: "حساب جديد",
      titleLogin: "مرحباً بعودتك",
      titleRegister: "إنشاء حساب جديد",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      password: "كلمة السر",
      confirmPassword: "تأكيد كلمة السر",
      withdrawPin: "رمز السحب (6 أرقام)",
      referralCode: "كود الدعوة (اختياري)",
      submitLogin: "تسجيل الدخول",
      submitRegister: "إنشاء الحساب",
      hasAccount: "لديك حساب بالفعل؟",
      noAccount: "ليس لديك حساب؟",
      pinNotice: "أدخل 6 أرقام لرمز السحب",
      demoLogin: "🚀 دخول تجريبي (حساب عادي)"
    },
    en: {
      loginTab: "Sign In",
      registerTab: "Sign Up",
      titleLogin: "Welcome Back",
      titleRegister: "Create Account",
      fullName: "Full Name",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      withdrawPin: "Withdrawal PIN (6 Digits)",
      referralCode: "Referral Code",
      submitLogin: "Sign In",
      submitRegister: "Create Account",
      hasAccount: "Already have an account?",
      noAccount: "Don't have an account?",
      pinNotice: "Enter 6 digits for your PIN",
      demoLogin: "🚀 Demo Login (Regular User)"
    }
  }[lang];

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...formData.withdrawPin];
    newPin[index] = value.slice(-1);
    setFormData({ ...formData, withdrawPin: newPin });
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.withdrawPin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setApiError('');
  };

  // ✅ الدخول التجريبي (يبقى للاختبار لكنه يعطي بيانات وهمية)
  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onAuthSuccess) {
        onAuthSuccess({
          fullName: "مستخدم تجريبي",
          phone: "+966 50 000 0000",
          vipLevel: 3,
          balance: 215.50,
          totalDeposit: 200,
          totalWithdrawal: 50,
          totalEarnings: 65.50,
          referralEarnings: 15.50,
          dailyEarnings: 10.00,
          weeklyEarnings: 45.00,
          monthlyEarnings: 180.00,
          inviteCode: "DEMO123",
          tasksCompletedToday: 0,
          isAdmin: false
        });
      }
    }, 800);
  };

  const validateForm = () => {
    const newErrors = {};
    let hasError = false;

    if (!formData.phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
      hasError = true;
    }
    if (!formData.password) {
      newErrors.password = 'كلمة السر مطلوبة';
      hasError = true;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'الاسم الكامل مطلوب';
        hasError = true;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'كلمات السر غير متطابقة';
        hasError = true;
        alert('❌ خطأ: كلمات السر غير متطابقة!');
      }
      if (formData.withdrawPin.join('').length < 6) {
        newErrors.withdrawPin = 'أدخل رمز السحب المكون من 6 أرقام';
        hasError = true;
        alert('❌ خطأ: رمز السحب يجب أن يكون 6 أرقام!');
      }
    }

    setErrors(newErrors);
    if (hasError) {
      alert('⚠️ يرجى تصحيح الأخطاء في النموذج.');
      return false;
    }
    return true;
  };

  // ============================================================
  // ✅✅✅ القسم الجديد: الاتصال بقاعدة البيانات الحقيقية ✅✅✅
  // ============================================================

  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const cleanPhone = formData.phone.replace(/\s/g, '').replace(/^\+/, '');
      let endpoint, payload, response;

      if (isLogin) {
        // ✅ تسجيل الدخول الحقيقي
        endpoint = `${API_BASE}/api/auth/login`;
        payload = { phone: cleanPhone, password: formData.password };
      } else {
        // ✅ إنشاء حساب جديد حقيقي
        endpoint = `${API_BASE}/api/auth/register`;
        payload = {
          fullName: formData.fullName,
          phone: cleanPhone,
          password: formData.password,
          withdrawPin: formData.withdrawPin.join(''),
          inviteCode: formData.referralCode || "ZETA" + Math.floor(1000 + Math.random() * 9000),
          vipLevel: 0,
          balance: 0,
          totalDeposit: 0,
          totalWithdrawal: 0,
          totalEarnings: 0,
          referralEarnings: 0,
          dailyEarnings: 0,
          weeklyEarnings: 0,
          monthlyEarnings: 0,
          isAdmin: false
        };
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // ✅ نجاح تسجيل الدخول / إنشاء الحساب
        const userData = data.user;
        // التحقق من حساب الأدمن الخاص
        if (isLogin && cleanPhone === '999999999' && formData.password === 'admin0965') {
          userData.isAdmin = true;
          userData.fullName = "المدير الفائق";
          userData.vipLevel = 7;
          userData.balance = 9999.99;
        }
        alert(isLogin ? '✅ تم تسجيل الدخول بنجاح!' : '✅ تم إنشاء الحساب بنجاح!');
        onAuthSuccess(userData);
      } else {
        // ❌ فشل من الخادم
        setApiError(data.message || 'حدث خطأ، يرجى المحاولة مرة أخرى.');
        alert('❌ ' + (data.message || 'حدث خطأ!'));
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال بالخادم:', error);
      setApiError('تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
      alert('❌ تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030914] text-white flex items-center justify-center p-4 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00f3ff]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-xl bg-[#030914]/80 border border-[#00f3ff]/30 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,243,255,0.15)] backdrop-blur-2xl space-y-6">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-[#00f3ff] p-0.5 shadow-[0_0_15px_#00f3ff]">
              <div className="w-full h-full bg-[#030914] rounded-[10px] flex items-center justify-center text-cyan-300 font-black">ZE</div>
            </div>
            <span className="font-extrabold text-lg text-white tracking-wider">ZETA CENTER</span>
          </div>
          <button type="button" onClick={() => setLang && setLang(lang === 'ar' ? 'en' : 'ar')} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00f3ff] text-xs font-bold transition-all flex items-center gap-2 text-cyan-400">
            <Globe className="w-4 h-4" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>

        <button 
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 fill-slate-950" />
          {t.demoLogin}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs"><span className="px-4 bg-[#030914] text-gray-500">أو سجل بالطريقة العادية</span></div>
        </div>

        {/* ✅ عرض خطأ API */}
        {apiError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
          <button onClick={() => { setIsLogin(true); setErrors({}); setApiError(''); }} className={`py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${isLogin ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
            {t.loginTab}
          </button>
          <button onClick={() => { setIsLogin(false); setErrors({}); setApiError(''); }} className={`py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${!isLogin ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
            {t.registerTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">{t.fullName}</label>
              <input type="text" name="fullName" placeholder="أدخل اسمك الكامل..." value={formData.fullName} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 pr-10 text-white placeholder-gray-500 outline-none text-sm" />
              {errors.fullName && <p className="text-[11px] text-red-400">{errors.fullName}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">{t.phone}</label>
            <input type="text" name="phone" placeholder="+966 5x xxx xxxx" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 pr-10 text-white placeholder-gray-500 outline-none text-sm font-mono" />
            {errors.phone && <p className="text-[11px] text-red-400">{errors.phone}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">{t.password}</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 pr-10 pl-10 text-white placeholder-gray-500 outline-none text-sm font-mono" />
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-3 text-gray-400 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
            {errors.password && <p className="text-[11px] text-red-400">{errors.password}</p>}
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">{t.confirmPassword}</label>
                <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 pr-10 text-white placeholder-gray-500 outline-none text-sm font-mono" />
                {errors.confirmPassword && <p className="text-[11px] text-red-400">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-cyan-300 flex items-center gap-1"><KeyRound className="w-4 h-4 text-[#00f3ff]" /> {t.withdrawPin}</label>
                  <button type="button" onClick={() => setShowPin(!showPin)} className="text-[10px] text-gray-400 hover:text-white">{showPin ? 'إخفاء' : 'إظهار'}</button>
                </div>
                <div className="grid grid-cols-6 gap-2" dir="ltr">
                  {formData.withdrawPin.map((digit, idx) => (
                    <input key={idx} id={`pin-input-${idx}`} type={showPin ? "text" : "password"} maxLength={1} value={digit} onChange={(e) => handlePinChange(idx, e.target.value)} onKeyDown={(e) => handlePinKeyDown(idx, e)} className="w-full h-12 bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-xl text-center text-lg font-black text-cyan-300 outline-none font-mono" />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">{t.pinNotice}</p>
                {errors.withdrawPin && <p className="text-[11px] text-red-400">{errors.withdrawPin}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">{t.referralCode}</label>
                <input type="text" name="referralCode" placeholder="ZETA-8890" value={formData.referralCode} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 pr-10 text-white placeholder-gray-500 outline-none text-sm font-mono uppercase" />
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
            {isLoading ? 'جاري المعالجة...' : (isLogin ? t.submitLogin : t.submitRegister)}
          </button>

        </form>

        <div className="text-center pt-2 border-t border-white/5 text-xs text-gray-400">
          <span>{isLogin ? t.noAccount : t.hasAccount} </span>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setErrors({}); setApiError(''); }} className="text-cyan-400 font-bold hover:underline">{isLogin ? t.registerTab : t.loginTab}</button>
        </div>

      </div>
    </div>
  );
};

export default AuthPortal;
