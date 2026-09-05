import React, { useState, useEffect } from 'react';
import { 
  X, ArrowDownLeft, ArrowUpRight, Copy, Check, 
  ShieldCheck, AlertCircle, Clock, Info, Wallet, User 
} from 'lucide-react';

const FinanceModal = ({ isOpen, onClose, balance = 0, user }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [network, setNetwork] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // حالات خاصة بـ Sham Cash (للسحب فقط)
  const [shamCashName, setShamCashName] = useState('');
  const [shamCashAddress, setShamCashAddress] = useState('');
  
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  // ✅ إعادة تعيين الشبكة عند التبديل بين التبويبات
  useEffect(() => {
    if (activeTab === 'deposit' && network === 'ShamCash') {
      setNetwork('TRC20');
    }
  }, [activeTab, network]);

  if (!isOpen) return null;

  // ✅ دالة التحقق من صلاحية السحب (التوقيت والأيام)
  const isWithdrawAllowed = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = الأحد
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;

    if (dayOfWeek === 0) {
      return { allowed: false, reason: '⚠️ السحب غير متاح يوم الأحد' };
    }
    if (currentTime >= 12 && currentTime < 16) {
      return { allowed: true, reason: '✅ السحب متاح الآن' };
    } else {
      return {
        allowed: false,
        reason: '⏰ السحب متاح فقط من الساعة 12 ظهراً حتى 4 عصراً'
      };
    }
  };

  const withdrawStatus = isWithdrawAllowed();

  const withdrawAmounts = [14, 25, 50, 100, 200, 500, 1000];
  const depositAddresses = {
    TRC20: 'TMwMyUg4bd3JrdawAkuKukSDtvbnd28ppW',
    BEP20: '0x83482Ae471c8fc1cF13923402a57f9FE876497AA'
  };
  
  // رسوم الشبكات
  const networkFees = {
    TRC20: 0.05,   // 5%
    BEP20: 0.03,   // 3%
    ShamCash: 0.04 // 4%
  };

  // ✅ قوائم الشبكات حسب التبويب
  const depositNetworks = ['TRC20', 'BEP20'];
  const withdrawNetworks = ['TRC20', 'BEP20', 'ShamCash'];
  const currentNetworks = activeTab === 'deposit' ? depositNetworks : withdrawNetworks;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const fee = activeTab === 'withdraw' ? parsedAmount * networkFees[network] : 0;
  const finalAmount = activeTab === 'withdraw' ? Math.max(0, parsedAmount - fee) : parsedAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = user?._id || user?.id;
    if (!userId) {
      alert('⚠️ خطأ: لم يتم العثور على معرف المستخدم. الرجاء تسجيل الخروج والدخول مرة أخرى.');
      return;
    }

    if (!amount || parsedAmount <= 0) {
      alert('⚠️ الرجاء إدخال مبلغ صحيح.');
      return;
    }

    if (activeTab === 'withdraw') {
      if (!withdrawStatus.allowed) {
        alert(withdrawStatus.reason);
        return;
      }
      if (parsedAmount > balance) {
        alert('⚠️ الرصيد المتاح غير كافٍ');
        return;
      }
      
      // ✅ التحقق من حقول Sham Cash (فقط إذا كانت الشبكة محددة)
      if (network === 'ShamCash') {
        if (!shamCashName.trim()) {
          alert('⚠️ الرجاء إدخال اسم حساب Sham Cash');
          return;
        }
        if (!shamCashAddress.trim()) {
          alert('⚠️ الرجاء إدخال عنوان محفظة Sham Cash');
          return;
        }
      }
    }

    if (activeTab === 'deposit' && !txHash.trim()) {
      alert('⚠️ الرجاء إدخال رقم المعاملة (Transaction Hash)');
      return;
    }

    setIsSubmitting(true);
    try {
      // بناء بيانات العنوان حسب الشبكة
      let finalAddress = address;
      if (network === 'ShamCash') {
        finalAddress = JSON.stringify({
          name: shamCashName,
          wallet: shamCashAddress
        });
      } else if (activeTab === 'deposit') {
        finalAddress = depositAddresses[network];
      }

      const payload = {
        userId,
        userName: user?.fullName || 'مستخدم',
        phone: user?.phone || '000',
        type: activeTab,
        amount: parsedAmount,
        network: network === 'ShamCash' ? 'ShamCash' : network,
        address: finalAddress,
        txHash: activeTab === 'deposit' ? txHash : '',
        fee: activeTab === 'withdraw' ? fee : 0,
        note: activeTab === 'deposit' ? 'طلب إيداع' : `طلب سحب عبر ${network}`
      };

      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(activeTab === 'deposit' ? '✅ تم إرسال طلب الإيداع بنجاح' : '✅ تم إرسال طلب السحب');
        // إعادة تعيين الحقول الخاصة بـ Sham Cash
        setShamCashName('');
        setShamCashAddress('');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 3000);
      } else {
        alert('❌ ' + (data.message || 'حدث خطأ غير معروف'));
      }
    } catch (error) {
      alert('❌ تعذر الاتصال بالخادم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة مساعدة لعرض اسم الشبكة
  const getNetworkLabel = (net) => {
    const labels = {
      TRC20: 'Tron (USDT)',
      BEP20: 'BSC (USDT)',
      ShamCash: 'شام كاش (USDT)'
    };
    return labels[net] || net;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#030914]/95 border border-[#00f3ff]/40 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl text-white max-h-[85vh] flex flex-col">
        
        {/* الرأس الثابت */}
        <div className="sticky top-0 z-10 bg-[#030914]/95 rounded-t-3xl px-6 pt-6 pb-3 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-wide">
              {activeTab === 'deposit' ? 'إيداع رصيد' : 'سحب أرباح'}
            </h2>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl mt-2">
              <button
                onClick={() => {
                  setActiveTab('deposit');
                  setSuccessMsg('');
                  setAmount('');
                  setTxHash('');
                  setNetwork('TRC20');
                }}
                className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'deposit'
                    ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" /> إيداع
              </button>
              <button
                onClick={() => {
                  setActiveTab('withdraw');
                  setSuccessMsg('');
                  setAmount('');
                  setAddress('');
                  setShamCashName('');
                  setShamCashAddress('');
                  setNetwork('TRC20');
                }}
                className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'withdraw'
                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> سحب
              </button>
            </div>
          </div>
        </div>

        {/* المحتوى القابل للتمرير */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          
          {/* عرض قواعد السحب (فقط في تبويب السحب) */}
          {activeTab === 'withdraw' && (
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>📋 قواعد السحب</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1 pr-4">
                <p>• <span className="text-white">الأيام:</span> جميع الأيام ما عدا <span className="text-red-400 font-bold">الأحد</span></p>
                <p>• <span className="text-white">الوقت:</span> من <span className="text-yellow-400 font-bold">12:00 ظهراً</span> إلى <span className="text-yellow-400 font-bold">4:00 عصراً</span></p>
                <p>• <span className="text-white">المبالغ المسموحة:</span> {withdrawAmounts.join('، ')} $</p>
                {!withdrawStatus.allowed && (
                  <div className="mt-2 p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                    {withdrawStatus.reason}
                  </div>
                )}
                {withdrawStatus.allowed && (
                  <div className="mt-2 p-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold text-center">
                    ✅ السحب متاح الآن
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ✅ اختيار الشبكة حسب التبويب (الإيداع: TRC20/BEP20 فقط، السحب: + ShamCash) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300">اختر شبكة التحويل:</label>
            <div className={`grid ${currentNetworks.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
              {currentNetworks.map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => {
                    setNetwork(net);
                    setAmount('');
                    if (net !== 'ShamCash') {
                      setShamCashName('');
                      setShamCashAddress('');
                    }
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    network === net
                      ? 'border-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{getNetworkLabel(net)}</div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-1">
                    رسوم: {(networkFees[net] * 100).toFixed(0)}%
                  </div>
                  {net === 'ShamCash' && activeTab === 'withdraw' && (
                    <div className="text-[8px] text-yellow-400/70 mt-1">💳 للسحب فقط</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'deposit' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                <p className="text-xs text-gray-400">
                  عنوان محفظة الإيداع المخصصة لك ({network}):
                </p>
                <div className="p-3 bg-[#030914] rounded-xl border border-cyan-500/30 flex items-center justify-between gap-2 font-mono text-xs text-cyan-300 break-all">
                  <span>{depositAddresses[network]}</span>
                  <button
                    onClick={() => handleCopy(depositAddresses[network])}
                    className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-all shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] text-yellow-400/90 pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>أرسل USDT عبر شبكة {network} فقط</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">
                    المبلغ المحوّل ($ USDT):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="أدخل المبلغ..."
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all font-mono text-sm"
                    />
                    <span className="absolute left-4 top-3.5 text-xs font-bold text-cyan-400">
                      USDT
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">
                    📝 رقم المعاملة (Transaction Hash):
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل رقم المعاملة من محفظتك..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all font-mono text-xs"
                  />
                  <p className="text-[10px] text-gray-400">
                    انسخه من محفظتك بعد إرسال التحويل.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري التأكيد...' : 'تأكيد عملية الإيداع'}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex justify-between items-center text-xs">
                <span className="text-gray-400">الرصيد المتاح:</span>
                <span className="font-bold text-orange-400 font-mono text-sm">
                  ${balance.toFixed(2)} USDT
                </span>
              </div>

              {/* ✅ إذا كانت الشبكة Sham Cash، نعرض حقول خاصة (اسم + عنوان محفظة) */}
              {network === 'ShamCash' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                      <User className="w-4 h-4 text-cyan-400" />
                      اسم حساب Sham Cash:
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل اسم الحساب في Sham Cash..."
                      value={shamCashName}
                      onChange={(e) => setShamCashName(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                      <Wallet className="w-4 h-4 text-cyan-400" />
                      عنوان محفظة Sham Cash (USDT):
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل عنوان محفظة Sham Cash (USDT)..."
                      value={shamCashAddress}
                      onChange={(e) => setShamCashAddress(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all font-mono text-xs"
                    />
                    <p className="text-[10px] text-gray-400">
                      سيتم إرسال USDT إلى هذه المحفظة عبر Sham Cash.
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">
                    عنوان محفظة المستلم ({network}):
                  </label>
                  <input
                    type="text"
                    placeholder={`أدخل عنوان محفظتك (${network})...`}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all font-mono text-xs"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  اختر مبلغ السحب ($ USDT):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {withdrawAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        parseFloat(amount) === val
                          ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-orange-400 hover:text-white'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {amount && (
                <div className="p-2 rounded-xl bg-orange-500/5 border border-orange-500/20 text-center text-sm">
                  <span className="text-gray-400">المبلغ المختار: </span>
                  <span className="font-bold text-orange-400">
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>رسوم الشبكة ({(networkFees[network] * 100).toFixed(0)}%):</span>
                  <span className="text-white">${fee.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between font-bold border-t border-white/10 pt-2 text-sm">
                  <span className="text-gray-300">الصافي الواصل:</span>
                  <span className="text-green-400">${finalAmount.toFixed(2)} USDT</span>
                </div>
                {network === 'ShamCash' && (
                  <div className="text-[10px] text-cyan-400/70 text-center pt-1 border-t border-white/5 mt-1">
                    ↪️ التحويل عبر Sham Cash إلى: {shamCashName || '(سيتم تحديده)'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !amount ||
                  parsedAmount <= 0 ||
                  !withdrawStatus.allowed
                }
                className={`w-full py-4 rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all ${
                  !withdrawStatus.allowed
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                }`}
              >
                {isSubmitting
                  ? 'جاري المعالجة...'
                  : !withdrawStatus.allowed
                  ? '⛔ غير متاح الآن'
                  : `تأكيد طلب السحب عبر ${network === 'ShamCash' ? 'شام كاش' : network}`}
              </button>
            </form>
          )}
        </div>

        <div className="h-2 bg-transparent" />
      </div>
    </div>
  );
};

export default FinanceModal;
