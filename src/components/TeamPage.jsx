import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Phone, 
  ShieldCheck, 
  DollarSign, 
  Share2, 
  Copy, 
  Check, 
  ChevronLeft, 
  Crown,
  Layers
} from 'lucide-react';

const TeamPage = ({ user, lang = 'ar' }) => {
  const [activeTab, setActiveTab] = useState('A');
  const [copied, setCopied] = useState(false);
  const [teamData, setTeamData] = useState({ A: [], B: [], C: [] });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://zeta-empire-backend.onrender.com';

  // النصوص باللغتين
  const t = {
    ar: {
      title: "شجرة الفريق والدخل السلبي",
      subtitle: "إدارة أعضاء فريقك ومتابعة العمولات التراكمية للفئات A و B و C",
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
      priorityBadge: "أولوية مباشرة"
    },
    en: {
      title: "Team Tree & Passive Income",
      subtitle: "Manage team members and track commissions across A, B, and C levels",
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
      priorityBadge: "Direct Priority"
    }
  }[lang];

  // ===== جلب بيانات الفريق الحقيقية من الخادم =====
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?._id && !user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/team/${user._id || user.id}`);
        const data = await res.json();
        if (data.success) {
          setTeamData(data.team);
        } else {
          console.error('فشل جلب الفريق:', data.message);
          // في حال فشل الجلب، نستخدم بيانات وهمية احتياطية (اختياري)
          setTeamData({
            A: [
              { id: 1, phone: "+96650***4567", vip: 3, deposit: 200, passiveProfit: 45.00, status: "Active" },
              { id: 2, phone: "+97150***7654", vip: 5, deposit: 800, passiveProfit: 192.00, status: "Active" },
              { id: 3, phone: "+96560***2233", vip: 1, deposit: 50, passiveProfit: 8.50, status: "Active" }
            ],
            B: [
              { id: 4, phone: "+96890***1122", vip: 2, deposit: 100, passiveProfit: 13.50, status: "Active" },
              { id: 5, phone: "+97455***9988", vip: 4, deposit: 400, passiveProfit: 66.00, status: "Active" }
            ],
            C: [
              { id: 6, phone: "+96279***3344", vip: 1, deposit: 50, passiveProfit: 2.50, status: "Active" }
            ]
          });
        }
      } catch (error) {
        console.error('خطأ في جلب الفريق:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
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
  ].reduce((acc, m) => acc + (m.passiveProfit || 0), 0);

  return (
    <div className={`min-h-screen bg-[#030914] text-white p-4 md:p-8 font-sans ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]">
            {t.title}
          </h1>
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

          <button
            onClick={handleCopy}
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 font-bold shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.7)] transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? t.copied : t.copyCode}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-3xl p-6 flex items-center justify-between shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <div>
              <p className="text-xs text-cyan-300/70 uppercase">{t.totalTeam}</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalMembers} <span className="text-sm font-normal text-cyan-400">أعضاء</span></h3>
            </div>
            <Users className="w-12 h-12 text-[#00f3ff] drop-shadow-[0_0_12px_#00f3ff]" />
          </div>

          <div className="bg-[#00f3ff]/[0.03] backdrop-blur-xl border border-[#00f3ff]/20 rounded-3xl p-6 flex items-center justify-between shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <div>
              <p className="text-xs text-cyan-300/70 uppercase">{t.totalPassive}</p>
              <h3 className="text-3xl font-extrabold text-green-400 mt-1">${totalPassiveEarnings.toFixed(2)}</h3>
            </div>
            <TrendingUp className="w-12 h-12 text-green-400 drop-shadow-[0_0_12px_#22c55e]" />
          </div>
        </div>

        <div className="flex gap-2 p-1.5 bg-[#00f3ff]/[0.03] border border-[#00f3ff]/20 rounded-2xl backdrop-blur-md">
          {[
            { key: 'A', name: t.classA, count: teamData.A.length, priority: true },
            { key: 'B', name: t.classB, count: teamData.B.length, priority: false },
            { key: 'C', name: t.classC, count: teamData.C.length, priority: false }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-cyan-500 to-[#00f3ff] text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-slate-950 text-[#00f3ff]' : 'bg-white/10 text-white'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'A' && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3 text-cyan-300 text-sm">
            <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_#fde047]" />
            <span>{t.priorityBadge}: الأعضاء المباشرين يمنحونك **5%** دخل سلبي يومي من إجمالي أرباح مهامهم.</span>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">جاري تحميل الفريق...</p>
            </div>
          ) : teamData[activeTab].length === 0 ? (
            <div className="text-center py-12 bg-[#00f3ff]/[0.02] border border-white/5 rounded-3xl">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">{t.noMembers}</p>
            </div>
          ) : (
            teamData[activeTab].map((member) => (
              <div 
                key={member.id}
                className="bg-[#00f3ff]/[0.04] backdrop-blur-xl border border-[#00f3ff]/20 hover:border-[#00f3ff] rounded-2xl p-5 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(0,243,255,0.05)] hover:shadow-[0_0_25px_rgba(0,243,255,0.2)]"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t.phone}</p>
                    <p className="text-lg font-mono font-bold text-white">{member.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full md:w-auto text-center md:text-right">
                  <div>
                    <p className="text-xs text-gray-400">{t.vipLevel}</p>
                    <span className="inline-block mt-0.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-bold text-xs">
                      VIP {member.vip}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">{t.contractAmount}</p>
                    <p className="text-base font-bold text-white mt-0.5">${member.deposit}</p>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-400">{t.passiveEarned}</p>
                    <p className="text-base font-extrabold text-green-400 mt-0.5">+${member.passiveProfit.toFixed(2)}</p>
                  </div>
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
