import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Share2, Copy, Check, Crown, User, RefreshCw } from 'lucide-react';
import { useZeta } from '../context/ZetaContext.jsx';

const TeamPage = ({ lang = 'ar' }) => {
  const { user, refreshUser } = useZeta();
  const [activeTab, setActiveTab] = useState('A');
  const [copied, setCopied] = useState(false);
  const [teamData, setTeamData] = useState({ A: [], B: [], C: [] });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030914] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل بيانات المستخدم...</p>
        </div>
      </div>
    );
  }

  const t = {
    ar: {
      title: "شجرة الفريق والدخل السلبي",
      subtitle: "إدارة أعضاء فريقك ومتابعة العمولات التراكمية",
      inviteLink: "كود الدعوة الخاص بك",
      copyCode: "نسخ الكود",
      copied: "تم النسخ!",
      totalTeam: "إجمالي الفريق",
      totalPassive: "إجمالي الدخل السلبي",
      classA: "الفئة A (مباشر 5%)",
      classB: "الفئة B (فرعي 3%)",
      classC: "الفئة C (فرعي 1%)",
      phone: "رقم الهاتف",
      vipLevel: "المستوى",
      contractAmount: "مبلغ العقد",
      passiveEarned: "الدخل السلبي منه",
      noMembers: "لا يوجد أعضاء في هذه الفئة حالياً",
      priorityBadge: "أولوية مباشرة",
      totalReferrals: "إجمالي الإحالات",
      loading: "جاري تحميل بيانات الفريق..."
    },
    en: {
      title: "Team Tree & Passive Income",
      subtitle: "Manage team members and track commissions",
      inviteLink: "Your Invitation Code",
      copyCode: "Copy Code",
      copied: "Copied!",
      totalTeam: "Total Team Members",
      totalPassive: "Total Passive Earnings",
      classA: "Class A (Direct 5%)",
      classB: "Class B (Sub 3%)",
      classC: "Class C (Sub 1%)",
      phone: "Phone Number",
      vipLevel: "Level",
      contractAmount: "Contract Value",
      passiveEarned: "Passive Profit",
      noMembers: "No members found in this class yet",
      priorityBadge: "Direct Priority",
      totalReferrals: "Total Referrals",
      loading: "Loading team data..."
    }
  }[lang];

  const fetchTeamData = async () => {
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }
    const userId = user._id || user.id;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/team/${userId}`);
      const data = await res.json();
      if (data.success) {
        setTeamData({
          A: data.team.A || [],
          B: data.team.B || [],
          C: data.team.C || []
        });
      } else {
        console.warn('⚠️ فشل جلب بيانات الفريق:', data.message);
      }
    } catch (error) {
      console.error('❌ فشل جلب بيانات الفريق:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [user]);

  const inviteCode = user?.inviteCode || "ZETA" + Math.floor(1000 + Math.random() * 9000);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalMembers = teamData.A.length + teamData.B.length + teamData.C.length;
  const totalPassiveEarnings = [
    ...teamData.A, ...teamData.B, ...teamData.C
  ].reduce((acc, m) => acc + (m.totalDeposit ? m.totalDeposit * 0.05 : 0), 0);
  const totalReferrals = user?.referrals || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030914] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]">{t.title}</h1>
          <p className="text-cyan-200/70 text-sm md:text-base">{t.subtitle}</p>
        </div>

        <div className="bg-[#00f3ff]/[0.05] backdrop-blur-xl border border-[#00f3ff]/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,243,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00f3ff]/10 border border-[#00f3ff]/40 flex items-center justify-center text-[#00f3ff]">
              <Share2 className="w-6 h-6 drop-shadow-[0_0_8px_#00f3ff]" />
            </div>
            <div>
              <p className="text-xs text-cyan-300/70">{t.inviteLink}</p>
              <h3 className="text-2xl font-mono font-bold text-white tracking-widest">{inviteCode}</h3>
            </div>
          </div>
          <button onClick={handleCopy} className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.7)] transition-all flex items-center justify-center gap-2">
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? t.copied : t.copyCode}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-3xl p-6 flex items-center justify-between shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <div><p className="text-xs text-cyan-300/70 uppercase">{t.totalTeam}</p><h3 className="text-3xl font-extrabold text-white mt-1">{totalMembers} <span className="text-sm font-normal text-cyan-400">أعضاء</span></h3></div>
            <Users className="w-12 h-12 text-[#00f3ff] drop-shadow-[0_0_12px_#00f3ff]" />
          </div>
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-3xl p-6 flex items-center justify-between shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <div><p className="text-xs text-cyan-300/70 uppercase">{t.totalPassive}</p><h3 className="text-3xl font-extrabold text-green-400 mt-1">${totalPassiveEarnings.toFixed(2)}</h3></div>
            <TrendingUp className="w-12 h-12 text-green-400 drop-shadow-[0_0_12px_#22c55e]" />
          </div>
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-3xl p-6 flex items-center justify-between shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <div><p className="text-xs text-cyan-300/70 uppercase">{t.totalReferrals}</p><h3 className="text-3xl font-extrabold text-yellow-400 mt-1">{totalReferrals}</h3></div>
            <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_12px_#fde047]" />
          </div>
        </div>

        <div className="flex gap-2 p-1.5 bg-[#00f3ff]/[0.03] border border-[#00f3ff]/20 rounded-2xl backdrop-blur-md">
          {[
            { key: 'A', name: t.classA, count: teamData.A.length, priority: true },
            { key: 'B', name: t.classB, count: teamData.B.length, priority: false },
            { key: 'C', name: t.classC, count: teamData.C.length, priority: false }
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.key ? 'bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <span>{tab.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-slate-950 text-[#00f3ff]' : 'bg-white/10 text-white'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {activeTab === 'A' && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3 text-cyan-300 text-sm">
            <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_#fde047]" />
            <span>{t.priorityBadge}: الأعضاء المباشرين يمنحونك 5% دخل سلبي يومي من إجمالي أرباح مهامهم.</span>
          </div>
        )}

        <div className="space-y-4">
          {teamData[activeTab].length === 0 ? (
            <div className="text-center py-12 bg-[#00f3ff]/[0.02] border border-white/5 rounded-3xl">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">{t.noMembers}</p>
            </div>
          ) : (
            teamData[activeTab].map((member, idx) => (
              <div key={idx} className="bg-[#00f3ff]/[0.04] backdrop-blur-xl border border-[#00f3ff]/20 hover:border-[#00f3ff] rounded-2xl p-5 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(0,243,255,0.05)] hover:shadow-[0_0_25px_rgba(0,243,255,0.2)]">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t.phone}</p>
                    <p className="text-lg font-mono font-bold text-white">{member.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full md:w-auto text-center md:text-right">
                  <div><p className="text-xs text-gray-400">{t.vipLevel}</p><span className="inline-block mt-0.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-bold text-xs">VIP {member.vipLevel || 0}</span></div>
                  <div><p className="text-xs text-gray-400">{t.contractAmount}</p><p className="text-base font-bold text-white mt-0.5">${member.totalDeposit || 0}</p></div>
                  <div className="col-span-2 md:col-span-1"><p className="text-xs text-gray-400">{t.passiveEarned}</p><p className="text-base font-extrabold text-green-400 mt-0.5">+${((member.totalDeposit || 0) * 0.05).toFixed(2)}</p></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
