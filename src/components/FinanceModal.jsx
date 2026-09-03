import React, { useState } from 'react';
import { 
  X, ArrowDownLeft, ArrowUpRight, Copy, Check, ShieldCheck, AlertCircle, DollarSign, Hash
} from 'lucide-react';

const FinanceModal = ({ isOpen, onClose, user, onTransactionSuccess }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [network, setNetwork] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';
  const withdrawAmounts = [14, 25, 50, 100, 200, 500, 1000];
  const depositAddresses = {
    TRC20: 'TMwMyUg4bd3JrdawAkuKukSDtvbnd28ppW',
    BEP20: '0x83482Ae471c8fc1cF13923402a57f9FE876497AA'
  };
  const networkFees = { TRC20: 0.05, BEP20: 0.03 };

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
    setErrorMsg('');
    
    if (!amount || parsedAmount <= 0) {
      setErrorMsg('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (activeTab === 'deposit' && !txHash.trim()) {
      setErrorMsg('الرجاء إدخال رقم المعاملة (TxID)');
      return;
    }
    if (activeTab === 'withdraw' && parsedAmount > user.balance) {
      setErrorMsg('الرصيد غير كافٍ');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: user._id || user.id,
        userName: user.fullName,
        phone: user.phone,
        type: activeTab,
        amount: parsedAmount,
        network,
        address: activeTab === 'withdraw' ? address : depositAddresses[network],
        txHash: activeTab === 'deposit' ? txHash : '',
        fee: activeTab === 'withdraw' ? fee : 0,
        note: activeTab === 'withdraw' ? `سحب إلى ${network}` : `إيداع عبر ${network}`
      };

      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessMsg(activeTab === 'deposit' ? '✅ تم إرسال طلب الإيداع بنجاح' : '✅ تم إرسال طلب السحب بنجاح');
        setTxHash('');
        setAddress('');
        setAmount('');
        if (onTransactionSuccess) onTransactionSuccess();
        setTimeout(() => { setSuccessMsg(''); onClose(); }, 2500);
      } else {
        setErrorMsg(data.message || 'حدث خطأ');
      }
    } catch (error) {
      setErrorMsg('تعذر الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#030914]/90 border border-[#00f3ff]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-2xl text-white space-y-6">
        <button onClick={onClose} className="absolute top-5 left-5 p-2 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black">{activeTab === 'deposit' ? 'إيداع رصيد' : 'سحب أرباح'}</h2>
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
            <button onClick={() => { setActiveTab('deposit'); setSuccessMsg(''); setErrorMsg(''); setAmount(''); setTxHash(''); }} className={`py-2.5 rounded-xl text-sm font-bold ${activeTab === 'deposit' ? 'bg-[#00f3ff] text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-gray-400'}`}><ArrowDownLeft className="w-4 h-4 inline ml-1" /> إيداع</button>
            <button onClick={() => { setActiveTab('withdraw'); setSuccessMsg(''); setErrorMsg(''); setAmount(''); setAddress(''); }} className={`py-2.5 rounded-xl text-sm font-bold ${activeTab === 'withdraw' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-gray-400'}`}><ArrowUpRight className="w-4 h-4 inline ml-1" /> سحب</button>
          </div>
        </div>

        {successMsg && <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-center">{successMsg}</div>}
        {errorMsg && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">{errorMsg}</div>}

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300">اختر الشبكة:</label>
          <div className="grid grid-cols-2 gap-3">
            {['TRC20', 'BEP20'].map((net) => (
              <button key={net} type="button" onClick={() => { setNetwork(net); setAmount(''); setTxHash(''); }} className={`p-3 rounded-2xl border text-right ${network === net ? 'border-[#00f3ff] bg-[#00f3ff]/10' : 'border-white/10 bg-white/5'}`}>
                <span className="font-bold text-white">{net}</span>
                <span className="text-[10px] text-cyan-400 block">رسوم: {(networkFees[net]*100).toFixed(0)}%</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'deposit' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-gray-400">عنوان الإيداع ({network}):</p>
              <div className="flex items-center justify-between gap-2 font-mono text-xs text-cyan-300 break-all"><span>{depositAddresses[network]}</span><button onClick={() => handleCopy(depositAddresses[network])} className="p-2 rounded-lg bg-cyan-500/20">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</button></div>
            </div>
            <div><label className="text-xs font-bold text-gray-300">المبلغ ($):</label><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white outline-none" /></div>
            <div><label className="text-xs font-bold text-gray-300 flex items-center gap-1"><Hash className="w-4 h-4" /> رقم المعاملة (TxID):</label><input type="text" placeholder="أدخل رقم المعاملة..." value={txHash} onChange={(e) => setTxHash(e.target.value)} required className="w-full bg-white/5 border border-white/10 focus:border-[#00f3ff] rounded-2xl px-4 py-3 text-white outline-none font-mono text-xs" /></div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50">{isSubmitting ? 'جاري...' : 'تأكيد الإيداع'}</button>
          </form>
        )}

        {activeTab === 'withdraw' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex justify-between"><span className="text-gray-400">الرصيد:</span><span className="font-bold text-orange-400">${user.balance}</span></div>
            <div><label className="text-xs font-bold text-gray-300">عنوان المحفظة:</label><input type="text" placeholder="أدخل العنوان..." value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-2xl px-4 py-3 text-white outline-none font-mono text-xs" /></div>
            <div><label className="text-xs font-bold text-gray-300">المبلغ:</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {withdrawAmounts.map((v) => <button type="button" key={v} onClick={() => setAmount(v.toString())} className={`py-2 rounded-xl text-xs border ${parseFloat(amount) === v ? 'bg-orange-500 border-orange-500' : 'bg-white/5 border-white/10'}`}>${v}</button>)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs"><div className="flex justify-between"><span>رسوم ({networkFees[network]*100}%):</span><span>${fee.toFixed(2)}</span></div><div className="flex justify-between font-bold border-t border-white/10 pt-2"><span>الصافي:</span><span className="text-green-400">${finalAmount.toFixed(2)}</span></div></div>
            <button type="submit" disabled={isSubmitting || !amount} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-50">{isSubmitting ? 'جاري...' : 'تأكيد السحب'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FinanceModal;
