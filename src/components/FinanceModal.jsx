import React, { useState } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  QrCode,
  DollarSign
} from 'lucide-react';

const FinanceModal = ({ isOpen, onClose, balance = 215.50 }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [network, setNetwork] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // مبالغ السحب المحددة
  const withdrawAmounts = [14, 25, 50, 100, 200, 500, 1000];

  const depositAddresses = {
    TRC20: 'TMwMyUg4bd3JrdawAkuKukSDtvbnd28ppW',
    BEP20: '0x83482Ae471c8fc1cF13923402a57f9FE876497AA'
  };

  const networkFees = {
    TRC20: 0.05, // 5%
    BEP20: 0.03  // 3%
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const fee = activeTab === 'withdraw' ? parsedAmount * networkFees[network] : 0;
  const finalAmount = activeTab === 'withdraw' ? Math.max(0, parsedAmount - fee) : parsedAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parsedAmount <= 0) return;
    
    if (activeTab === 'withdraw' && parsedAmount > balance) {
      alert('الرصيد المتاح غير كافٍ');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(
        activeTab === 'deposit' 
          ? 'تم إرسال طلب تأكيد الإيداع بنجاح، سيتم تحديث رصيدك فور تأكيد البلوكشين.' 
          : 'تم إرسال طلب السحب بنجاح إلى المعالجة.'
      );
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 3000);
    }, 1500);
  };

  // دالة اختيار مبلغ السحب
  const handleWithdrawAmountSelect = (value) => {
    setAmount(value.toString());
  };

  return (
    <div className="fixed inset-[#000000]/80 inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      
      <div className="relative w-full max-w-lg bg-[#030914]/80 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl text-white space-y-6 animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-white tracking-wide">
            {activeTab === 'deposit' ? 'إيداع رصيد (Deposit)' : 'سحب أرباح (Withdraw)'}
          </h2>
          
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
            <button
              onClick={() => { setActiveTab('deposit'); setSuccessMsg(''); setAmount(''); }}
              className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'deposit' 
                  ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              إيداع
            </button>
            <button
              onClick={() => { setActiveTab('withdraw'); setSuccessMsg(''); setAmount(''); }}
              className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'withdraw' 
                  ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              سحب
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300">اختر شبكة التحويل (Select Network):</label>
          <div className="grid grid-cols-2 gap-3">
            {['TRC20', 'BEP20'].map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => { setNetwork(net); setAmount(''); }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  network === net 
                    ? 'border-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_12px_rgba(0,243,255,0.2)]' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-sm text-white">{net}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">رسوم: {(networkFees[net] * 100).toFixed(0)}%</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {net === 'TRC20' ? 'Tron Network (USDT)' : 'BNB Smart Chain (USDT)'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
              <p className="text-xs text-gray-400">عنوان محفظة الإيداع المخصصة لك ({network}):</p>
              
              <div className="p-3 bg-[#030914] rounded-xl border border-cyan-500/30 flex items-center justify-between gap-2 font-mono text-xs text-cyan-300 break-all">
                <span>{depositAddresses[network]}</span>
                <button 
                  onClick={() => handleCopy(depositAddresses[network])}
                  className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-all shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-yellow-400/90 pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>أرسل عملات USDT عبر شبكة {network} فقط لتفادي فقدان الأموال.</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">المبلغ المحوّل ($ USDT):</label>
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
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-cyan-400">USDT</span>
                </div>
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
        )}

        {activeTab === 'withdraw' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex justify-between items-center text-xs">
              <span className="text-gray-400">الرصيد المتاح للسحب:</span>
              <span className="font-bold text-orange-400 font-mono text-sm">${balance.toFixed(2)} USDT</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">عنوان محفظة المستلم ({network}):</label>
              <input 
                type="text" 
                placeholder={`أدخل عنوان محفظتك (${network})...`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all font-mono text-xs"
              />
            </div>

            {/* ✅ مبالغ السحب المحددة - أزرار بدلاً من حقل إدخال */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">اختر مبلغ السحب ($ USDT):</label>
              <div className="grid grid-cols-3 gap-2">
                {withdrawAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleWithdrawAmountSelect(val)}
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

            {/* عرض المبلغ المختار */}
            {amount && (
              <div className="p-2 rounded-xl bg-orange-500/5 border border-orange-500/20 text-center text-sm">
                <span className="text-gray-400">المبلغ المختار: </span>
                <span className="font-bold text-orange-400">${parseFloat(amount).toFixed(2)}</span>
              </div>
            )}

            {/* تفاصيل الرسوم والمبلغ الصافي */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>رسوم الشبكة ({(networkFees[network] * 100).toFixed(0)}%):</span>
                <span className="text-white">${fee.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/10 pt-2 text-sm">
                <span className="text-gray-300">الصافي الواصل للمحفظة:</span>
                <span className="text-green-400">${finalAmount.toFixed(2)} USDT</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !amount || parsedAmount <= 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري المعالجة...' : 'تأكيد طلب السحب'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default FinanceModal;