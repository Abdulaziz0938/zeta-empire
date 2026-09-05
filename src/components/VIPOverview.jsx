import React, { useState } from 'react';
import { 
  Crown, Zap, ArrowLeft, Award, Users, DollarSign, Lock, 
  CheckCircle2, TrendingUp, Calculator, Star, RefreshCw 
} from 'lucide-react';
import { useZeta } from '../context/ZetaContext.jsx';

const VIPOverview = ({ lang = 'ar', onBack }) => {
  const { user, refreshUser } = useZeta();
  const [depositInput, setDepositInput] = useState('');
  const [calculatedCommission, setCalculatedCommission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  const vipLevels = [
    { level: 1, commission: 4.0, minDeposit: 50, referralsRequired: 0, benefits: 'عمولة يومية 4%' },
    { level: 2, commission: 4.5, minDeposit: 100, referralsRequired: 0, benefits: 'عمولة يومية 4.5%' },
    { level: 3, commission: 5.0, minDeposit: 200, referralsRequired: 0, benefits: 'عمولة يومية 5%' },
    { level: 4, commission: 5.5, minDeposit: 400, referralsRequired: 0, benefits: 'عمولة يومية 5.5%' },
    { level: 5, commission: 6.0, minDeposit: 800, referralsRequired: 10, benefits: 'عمولة يومية 6% + عمولات إحالة' },
    { level: 6, commission: 6.5, minDeposit: 1600, referralsRequired: 30, benefits: 'عمولة يومية 6.5% + راتب قائد 60$' },
    { level: 7, commission: 7.0, minDeposit: 3200, referralsRequired: 50, benefits: 'عمولة يومية 7% + راتب قائد 100$' }
  ];

  const userVip = user?.vipLevel || 0;
  const userBalance = user?.balance || 0;

  const handleCalculate = () => {
    const amount = parseFloat(depositInput);
    if (!amount || amount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح.');
      return;
    }
    let selectedLevel = vipLevels[0];
    for (let i = vipLevels.length - 1; i >= 0; i--) {
      if (amount >= vipLevels[i].minDeposit) {
        selectedLevel = vipLevels[i];
        break;
      }
    }
    const dailyProfit = amount * (selectedLevel.commission / 100);
    setCalculatedCommission({
      level: selectedLevel.level,
      deposit: amount,
      daily: dailyProfit,
      monthly: dailyProfit * 30,
      yearly: dailyProfit * 365
    });
  };

  const handlePurchaseVIP = async (targetLevel) => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    if (targetLevel <= userVip) {
      alert(`⚠️ أنت بالفعل في VIP ${userVip} أو أعلى!`);
      return;
    }
    const vipPrice = vipLevels[targetLevel - 1]?.minDeposit || 0;
    const confirmPurchase = confirm(`هل أنت متأكد من شراء VIP ${targetLevel} مقابل $${vipPrice}؟`);
    if (!confirmPurchase) return;

    setPurchaseLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/vip/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id || user.id, vipLevel: targetLevel })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        // ✅ تحديث بيانات المستخدم فوراً باستخدام Context
        await refreshUser();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert('❌ تعذر الاتصال بالخادم');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const t = {
    ar: {
      title: '📊 مستويات VIP والترقية',
      subtitle: 'اكتشف العوائد اليومية والمميزات الخاصة بكل مستوى',
      currentLevel: 'مستواك الحالي',
      level: 'المستوى',
      minDeposit: 'الحد الأدنى للإيداع',
      dailyCommission: 'العمولة اليومية',
      referrals: 'الإحالات المطلوبة',
      benefits: 'المميزات',
      status: 'الحالة',
      locked: '🔒 مغلق',
      unlocked: '✅ مفتوح',
      active: '⭐ نشط',
      upgrade: '🚀 ترقية الآن',
      notAvailable: 'غير متاح',
      calculateTitle: '🧮 حاسبة العائد اليومي',
      calculateDesc: 'أدخل مبلغ الإيداع لمعرفة العائد اليومي المتوقع',
      amountPlaceholder: 'أدخل المبلغ ($)',
      calculateBtn: 'احسب العائد',
      dailyProfit: 'الربح اليومي',
      monthlyProfit: 'الربح الشهري',
      yearlyProfit: 'الربح السنوي',
      backBtn: 'العودة للرئيسية',
      buyVip: '💰 شراء VIP',
      activeBadge: '✅ نشط',
      lockedBadge: '🔒 مغلق',
      availableBadge: '💰 متاح للشراء',
      yourLevel: 'مستواك الحالي',
      notEnoughBalance: '⚠️ رصيد غير كافٍ',
      refresh: '🔄 تحديث البيانات'
    },
    en: {
      title: '📊 VIP Levels & Upgrades',
      subtitle: 'Discover daily yields and exclusive benefits for each level',
      currentLevel: 'Your Current Level',
      level: 'Level',
      minDeposit: 'Min Deposit',
      dailyCommission: 'Daily Commission',
      referrals: 'Required Referrals',
      benefits: 'Benefits',
      status: 'Status',
      locked: '🔒 Locked',
      unlocked: '✅ Unlocked',
      active: '⭐ Active',
      upgrade: '🚀 Upgrade Now',
      notAvailable: 'Not Available',
      calculateTitle: '🧮 Daily Return Calculator',
      calculateDesc: 'Enter deposit amount to see expected daily return',
      amountPlaceholder: 'Enter amount ($)',
      calculateBtn: 'Calculate Return',
      dailyProfit: 'Daily Profit',
      monthlyProfit: 'Monthly Profit',
      yearlyProfit: 'Yearly Profit',
      backBtn: 'Back to Home',
      buyVip: '💰 Buy VIP',
      activeBadge: '✅ Active',
      lockedBadge: '🔒 Locked',
      availableBadge: '💰 Available',
      yourLevel: 'Your Current Level',
      notEnoughBalance: '⚠️ Insufficient balance',
      refresh: '🔄 Refresh Data'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة مع زر تحديث */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00f3ff] text-gray-400 hover:text-white transition-all">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 to-[#00f3ff] bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-cyan-200/70 text-sm">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshUser}
              className="px-4 py-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> {t.refresh}
            </button>
            <div className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-bold text-cyan-300">
                {t.currentLevel}: <span className="text-white text-lg">VIP {userVip}</span>
              </span>
            </div>
          </div>
        </div>

        {/* شبكة البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vipLevels.map((vip) => {
            const isActive = vip.level === userVip;
            const isPurchasable = vip.level > userVip;
            const canAfford = userBalance >= vip.minDeposit;

            let cardStyle = 'bg-white/[0.02] border-white/10 opacity-60';
            let statusText = t.locked;
            let statusIcon = <Lock className="w-3 h-3" />;
            let statusColor = 'text-gray-400';

            if (isActive) {
              cardStyle = 'bg-gradient-to-br from-green-500/20 to-cyan-500/10 border-green-500/60 shadow-[0_0_30px_rgba(34,197,94,0.3)]';
              statusText = t.activeBadge;
              statusIcon = <Star className="w-3 h-3 fill-green-400" />;
              statusColor = 'text-green-400';
            } else if (isPurchasable) {
              cardStyle = 'bg-cyan-500/5 border-cyan-500/30';
              statusText = t.availableBadge;
              statusIcon = <DollarSign className="w-3 h-3" />;
              statusColor = 'text-cyan-400';
            }

            return (
              <div key={vip.level} className={`p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 relative overflow-hidden ${cardStyle}`}>
                {/* شارة الحالة */}
                <div className={`absolute top-2 right-2 bg-white/5 border rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 ${statusColor}`}>
                  {statusIcon} {statusText}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className={`w-6 h-6 ${isActive ? 'text-yellow-400' : isPurchasable ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <span className="text-2xl font-black text-white">VIP {vip.level}</span>
                    </div>
                  </div>
                  <span className={`text-3xl font-black ${isActive ? 'text-green-400' : isPurchasable ? 'text-cyan-400' : 'text-gray-400'}`}>
                    {vip.commission}%
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">{t.minDeposit}</span>
                    <span className="font-bold text-white">${vip.minDeposit}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">{t.referrals}</span>
                    <span className="font-bold text-cyan-300">{vip.referralsRequired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.benefits}</span>
                    <span className="text-xs text-green-400 text-left">{vip.benefits}</span>
                  </div>
                </div>

                {/* زر الإجراء */}
                {isActive ? (
                  <button disabled className="w-full mt-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm border border-green-500/30 cursor-not-allowed flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {t.activeBadge}
                  </button>
                ) : isPurchasable ? (
                  <button
                    onClick={() => handlePurchaseVIP(vip.level)}
                    disabled={purchaseLoading || !canAfford}
                    className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      canAfford && !purchaseLoading
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)]'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {purchaseLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : canAfford ? (
                      `${t.buyVip} ${vip.level} بـ $${vip.minDeposit}`
                    ) : (
                      `${t.notEnoughBalance} ($${vip.minDeposit})`
                    )}
                  </button>
                ) : (
                  <button disabled className="w-full mt-4 py-2.5 rounded-xl bg-white/5 text-gray-500 font-bold text-sm border border-white/10 cursor-not-allowed flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" /> {t.locked}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* حاسبة العائد (نفسها) */}
        <div className="bg-[#00f3ff]/[0.05] backdrop-blur-2xl border border-[#00f3ff]/20 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,243,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">{t.calculateTitle}</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">{t.calculateDesc}</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              value={depositInput}
              onChange={(e) => setDepositInput(e.target.value)}
              placeholder={t.amountPlaceholder}
              className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-[#00f3ff] transition-all"
            />
            <button
              onClick={handleCalculate}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all whitespace-nowrap"
            >
              {t.calculateBtn}
            </button>
          </div>
          {calculatedCommission && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-center">
                <p className="text-xs text-gray-400">{t.dailyProfit}</p>
                <p className="text-2xl font-black text-green-400">${calculatedCommission.daily.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500">VIP {calculatedCommission.level}</p>
              </div>
              <div className="text-center border-x border-white/10 px-4">
                <p className="text-xs text-gray-400">{t.monthlyProfit}</p>
                <p className="text-2xl font-black text-cyan-400">${calculatedCommission.monthly.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">{t.yearlyProfit}</p>
                <p className="text-2xl font-black text-yellow-400">${calculatedCommission.yearly.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* زر الرجوع */}
        <div className="text-center">
          <button onClick={onBack} className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-[#00f3ff] transition-all font-bold text-sm">
            {t.backBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VIPOverview;
