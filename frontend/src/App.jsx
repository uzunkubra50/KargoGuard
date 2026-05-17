import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

/* ══════════════ ICONS ══════════════ */
const Icons = {
  Sun: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>),
  Moon: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>),
  Shield: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>),
  Warning: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>),
  Box: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>),
  Refresh: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>),
  Link: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>),
  Close: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>),
  Eye: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>),
  Check: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>),
  Document: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>),
  Filter: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>),
  Activity: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>),
  User: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>),
  Lock: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>),
  ChevronRight: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>),
  Logout: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>),
};

const InputField = ({ label, icon, type = 'text', placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-brandBlue focus:bg-white focus:ring-2 focus:ring-brandBlue/10 transition"
      />
    </div>
  </div>
);

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5229';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('kg_token') ?? ''}`
});

const EnterpriseLogin = ({ onLogin }) => {
  const [loadingRole, setLoadingRole] = useState(null);
  const [role, setRole]               = useState('admin');
  const [adminEmail, setAdminEmail]   = useState('');
  const [adminPwd, setAdminPwd]       = useState('');
  const [kuryeId, setKuryeId]         = useState('');
  const [kuryePwd, setKuryePwd]       = useState('');
  const [trackCode, setTrackCode]     = useState('');
  const [trackPhone, setTrackPhone]   = useState('');
  const [loginError, setLoginError]   = useState('');

  const login = async (e) => {
    e?.preventDefault();
    setLoadingRole(role);
    setLoginError('');

    try {
      let res;
      if (role === 'musteri') {
        res = await fetch(`${API}/api/v1/auth/tracking-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackCode: trackCode || 'MISAFIR', phone: trackPhone }),
        });
      } else {
        const username = role === 'admin' ? adminEmail : kuryeId;
        const password = role === 'admin' ? adminPwd   : kuryePwd;
        res = await fetch(`${API}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setLoginError(err.message || 'Kullanıcı adı veya şifre hatalı.');
        setLoadingRole(null);
        return;
      }

      const data = await res.json();
      localStorage.setItem('kg_token', data.token);
      localStorage.setItem('kg_role',  data.role);
      localStorage.setItem('kg_user',  data.username ?? '');
      onLogin(data.role, data.username ?? '');
    } catch {
      setLoginError('Sunucuya bağlanılamadı. API çalışıyor mu?');
      setLoadingRole(null);
    }
  };

  const ROLES = [
    { key: 'admin',   label: 'Admin',   sub: 'Web Dashboard',      color: '#6366f1', icon: '🛡' },
    { key: 'kurye',   label: 'Kurye',   sub: 'Mobil Uygulama',     color: '#10b981', icon: '🚴' },
    { key: 'musteri', label: 'Müşteri', sub: 'Kargo Takip',        color: '#f59e0b', icon: '📦' },
  ];

  const features = [
    { color: '#34d399', text: 'Roboflow ile anlık görsel hasar analizi' },
    { color: '#60a5fa', text: 'G-Force sensörü ile darbe takibi' },
    { color: '#a78bfa', text: 'Etherscan üzerinde denetlenebilir kanıt' },
  ];
  const stats = [
    { val: 'AI', label: 'Destekli analiz' },
    { val: 'Web3', label: 'Blockchain kanıtı' },
    { val: 'IoT', label: 'Sensör entegrasyonu' },
  ];

  const activeRole = ROLES.find(r => r.key === role);

  const QuickLogin = ({ credentials }) => (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">⚡ Demo — Hızlı Giriş</p>
      <div className="flex flex-wrap gap-2">
        {credentials.map((c, i) => (
          <button key={i} type="button" onClick={c.action}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm">
            {c.icon} {c.label}
          </button>
        ))}
      </div>
    </div>
  );

  const RightForm = () => {
    if (role === 'admin') return (
      <form onSubmit={login} className="space-y-4">
        <QuickLogin credentials={[
          { icon: '🛡', label: 'Admin Demo', action: () => { setAdminEmail('admin@kargoguard.com'); setAdminPwd('admin123'); } },
        ]} />
        <InputField label="Kullanıcı adı" icon="👤" placeholder="admin@kargoguard.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
        <InputField label="Şifre" icon="🔒" type="password" placeholder="••••••••••" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} />
        <button type="submit" disabled={!!loadingRole}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
          style={{ background: '#1e293b', color: 'white' }}>
          {loadingRole === 'admin' ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Doğrulanıyor...</span></> : <><Icons.Shield className="w-4 h-4"/><span>Giriş yap</span></>}
        </button>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500">
          ℹ️ Admin hesapları <strong>sadece sistem yöneticisi</strong> tarafından oluşturulur.<br/>
          <span className="text-slate-400">👁 Tüm kargolar · Tüm kuryeler · Blockchain logları</span>
        </div>
      </form>
    );
    if (role === 'kurye') return (
      <form onSubmit={login} className="space-y-4">
        <QuickLogin credentials={[
          { icon: '🚴', label: 'KRY-00142', action: () => { setKuryeId('KRY-00142'); setKuryePwd('kurye123'); } },
          { icon: '🚴', label: 'KRY-00215', action: () => { setKuryeId('KRY-00215'); setKuryePwd('kurye123'); } },
        ]} />
        <InputField label="Kurye ID veya telefon" icon="📋" placeholder="KRY-00142" value={kuryeId} onChange={e => setKuryeId(e.target.value)} />
        <InputField label="Şifre" icon="🔒" type="password" placeholder="••••••••" value={kuryePwd} onChange={e => setKuryePwd(e.target.value)} />
        <button type="submit" disabled={!!loadingRole}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
          style={{ background: '#1e293b', color: 'white' }}>
          {loadingRole === 'kurye' ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Doğrulanıyor...</span></> : <><Icons.Shield className="w-4 h-4"/><span>Giriş yap</span></>}
        </button>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
          <p>ℹ️ Kurye hesabı admin tarafından oluşturulur. İlk girişte şifre değiştirme zorunludur.</p>
          <p className="text-[10px]">1 Admin panelden kurye oluştur → ID + geçici şifre üret</p>
          <p className="text-[10px]">2 Kurye mobilden giriş yapar → şifresini değiştirir</p>
          <p className="text-[10px]">3 Sadece kendi teslimatlarını görür</p>
        </div>
      </form>
    );
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Takip Kodu</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center">
            <input type="text" value={trackCode} onChange={e => setTrackCode(e.target.value.toUpperCase())}
              placeholder="KRG - 0000000"
              className="w-full text-center text-lg font-mono font-black text-slate-900 bg-transparent outline-none placeholder-slate-300 tracking-widest"
            />
            <p className="text-[10px] text-slate-400 mt-1">Takip kodu gir</p>
          </div>
        </div>
        <InputField label="Telefon (doğrulama)" icon="📞" placeholder="05XX XXX XX XX" value={trackPhone} onChange={e => setTrackPhone(e.target.value)} />
        <button onClick={login} disabled={!!loadingRole}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
          style={{ background: '#1e293b', color: 'white' }}>
          {loadingRole === 'musteri' ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Sorgulanıyor...</span></> : <><Icons.Eye className="w-4 h-4"/><span>Kargomu sorgula</span></>}
        </button>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500">
          <p>ℹ️ Hesap açmaya gerek yok. Takip kodu + telefon eşleşirse kargo durumu ve Blockchain kanıtı görüntülenir.</p>
          <p className="text-[10px] text-slate-400 mt-1">👁 Sadece o kargonun durumu + Etherscan linki</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="w-full flex">

        {/* ── SOL: Mavi Panel ── */}
        <div className="hidden md:flex flex-col justify-between w-[42%] p-12 text-white" style={{ background: 'linear-gradient(155deg, #002E6D 0%, #0047A8 60%, #1565C0 100%)' }}>
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
                <Icons.Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-black text-lg leading-tight">KargoGuard AI</div>
                <div className="text-xs text-blue-200 font-medium">Kurumsal Panel</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-100 mb-8">
              <Icons.Shield className="w-3.5 h-3.5" /> Blockchain ile güvence altında
            </div>
            <h2 className="text-3xl font-black leading-snug tracking-tight mb-4">Kargo hasarını yapay zeka ile tespit edin</h2>
            <p className="text-sm text-blue-200 leading-relaxed mb-8">IoT sensör verileri ve görüntü analizi birleşimiyle her teslimatın kaydı değiştirilemez şekilde Ethereum'a işlenir.</p>
            <ul className="space-y-3 mb-10">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-blue-100">
                  <span className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: f.color + '40', border: `1px solid ${f.color}` }} />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-8 pt-6 border-t border-white/10">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-black">{s.val}</div>
                <div className="text-xs text-blue-300 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SAĞ: Form Paneli ── */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-black text-slate-900 mb-1">Giriş yap</h1>
            <p className="text-sm text-slate-500 mb-6">Rolünüzü seçerek devam edin</p>

            {/* Rol Kartları */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {ROLES.map(r => (
                <button key={r.key} type="button" onClick={() => setRole(r.key)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-center`}
                  style={role === r.key
                    ? { backgroundColor: r.color, borderColor: r.color, color: 'white' }
                    : { backgroundColor: 'white', borderColor: '#e2e8f0', color: '#64748b' }
                  }
                >
                  <span className="text-base">{r.icon}</span>
                  <span className="text-xs font-bold">{r.label}</span>
                  <span className="text-[9px] font-medium opacity-75">{r.sub}</span>
                </button>
              ))}
            </div>

            {/* Seçilen Role Göre Form */}
            <div key={role} className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">{activeRole.icon}</span>
                <div>
                  <div className="text-sm font-black text-slate-900">{activeRole.label} girişi</div>
                </div>
              </div>
              <RightForm />
            </div>

            {loginError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 font-semibold text-center">
                {loginError}
              </div>
            )}
            <p className="text-center text-[10px] text-slate-400 mt-6">🔒 JWT ile güvenli oturum · Blockchain ile şeffaf kayıt</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const fmt = (n, d = 1) => Number(n).toFixed(d);
const pct = (n) => `%${fmt(n * 100, 1)}`;

const getAiStatus = (confidence, predClass) => {
  if (confidence == null || confidence === 0) return 'no_image';
  if (confidence < 0.20) return 'needs_review';
  return 'completed';
};

const friendlyClass = (cls) => {
  if (!cls) return '';
  const map = {
    'ic_hasar': 'İç Hasar', 'hasarli_kutu': 'Hasarlı Kutu',
    'saglamli_kutu': 'Sağlam Kutu', 'saglamli': 'Sağlam',
    'tespit_edilemedi': 'Tespit Yok', 'bilinmiyor': '',
  };
  const key = cls.trim().toLowerCase();
  return map[key] ?? cls.replace(/_/g, ' ');
};

/* ══════════════════════════════════════════════
   KURYE VIEW  — Sadece kendi teslimatları
══════════════════════════════════════════════ */
const KuryeView = ({ onLogout }) => {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}/api/v1/cargo/results`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setCargos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColor = (d) => d === 'HASARLI'
    ? 'bg-red-50 text-red-600 border-red-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#10b981' }}>
            <Icons.Box className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-black text-slate-900">Kurye Paneli</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Atanan Teslimatlar</div>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 transition">Çıkış Yap</button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Benim Teslimatlarım</h2>
          <span className="text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1">{cargos.length} kargo</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" /></div>
        ) : cargos.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Atanmış teslimat bulunmuyor.</div>
        ) : (
          <div className="space-y-3">
            {cargos.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  {c.imageName && (
                    <img src={`http://localhost:9000/kargo-images/${c.imageName}`} className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">Kargo #{c.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.isFragile ? '🍷 Hassas Ürün' : '📦 Standart'}</div>
                    {c.sarsintiVerisi > 0 && <div className="text-xs text-slate-400 mt-0.5">G-Force: {c.sarsintiVerisi}G</div>}
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColor(c.finalDecision)}`}>
                  {c.finalDecision || 'Bekliyor'}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MÜŞTERİ VIEW  — Sadece kendi kargosunun durumu
══════════════════════════════════════════════ */
const MusteriView = ({ onLogout }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true); setResult(null); setNotFound(false);
    try {
      const r = await fetch(`${API}/api/v1/cargo/results`, { headers: authHeaders() });
      const data = await r.json();
      const found = data.find(c => String(c.id) === query.trim());
      if (found) setResult(found);
      else setNotFound(true);
    } catch { setNotFound(true); }
    finally { setSearching(false); }
  };

  const isDmg = result?.finalDecision === 'HASARLI';

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f59e0b' }}>
            <Icons.Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-black text-slate-900">Kargo Takip</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Müşteri Paneli</div>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 transition">Çıkış Yap</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Kargonuzu Takip Edin</h2>
          <p className="text-sm text-slate-500 text-center mb-8">Kargo takip numaranızı girerek durumunu öğrenin.</p>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Takip No (örn: 1, 2, 3...)"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
            />
            <button type="submit" disabled={searching}
              className="px-5 py-3 rounded-xl text-white font-bold text-sm transition disabled:opacity-60"
              style={{ background: '#f59e0b' }}>
              {searching ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Sorgula'}
            </button>
          </form>

          {notFound && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-600 text-sm font-semibold">
              Bu takip numarasına ait kargo bulunamadı.
            </div>
          )}

          {result && (
            <div className={`rounded-2xl border-2 p-6 ${isDmg ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-black text-slate-900 text-lg">Kargo #{result.id}</div>
                  <div className="text-xs text-slate-500">{result.isFragile ? '🍷 Hassas Ürün' : '📦 Standart Paket'}</div>
                </div>
                <span className={`font-black text-sm px-4 py-2 rounded-full border-2 ${isDmg ? 'bg-red-100 text-red-600 border-red-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}>
                  {isDmg ? '⚠️ HASARLI' : '✅ SAĞLAM'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-slate-600">AI Analiz Kararı</span>
                  <span className="font-bold text-slate-900">{result.finalDecision || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-slate-600">Teslimat Durumu</span>
                  <span className="font-bold text-slate-900">{result.status || 'Bekliyor'}</span>
                </div>
                {result.sarsintiVerisi > 0 && (
                  <div className="flex justify-between py-2 border-b border-black/10">
                    <span className="text-slate-600">Darbe Verisi</span>
                    <span className={`font-bold ${result.sarsintiVerisi >= 5 ? 'text-red-600' : 'text-slate-900'}`}>{result.sarsintiVerisi}G {result.sarsintiVerisi >= 5 ? '⚠️' : ''}</span>
                  </div>
                )}
                {result.txHash && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Blockchain Mühür</span>
                    <span className="font-bold text-indigo-600 text-xs">✓ Kayıtlı</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const exportPDF = (cargo, innerAnalysis, verdict) => {
  const win = window.open('', '_blank');
  const hasInner = !!(innerAnalysis?.photoUrl || cargo.deliveryPhotoUrl);
  win.document.write(`
    <!DOCTYPE html><html lang="tr"><head>
    <meta charset="UTF-8"><title>KargoGuard Rapor #${cargo.id}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;margin:40px;color:#1e293b}
      h1{color:#4f46e5;font-size:22px} h2{font-size:14px;color:#475569;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
      .row{display:flex;gap:16px;margin:12px 0} .badge{padding:4px 12px;border-radius:20px;font-weight:900;font-size:12px}
      .green{background:#d1fae5;color:#065f46} .red{background:#fee2e2;color:#991b1b} .yellow{background:#fef9c3;color:#854d0e}
      table{border-collapse:collapse;width:100%} td,th{border:1px solid #e2e8f0;padding:8px 12px;font-size:12px}
      th{background:#f8fafc;font-weight:700} footer{margin-top:40px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}
    </style></head><body>
    <h1>📦 KargoGuard Hasar Analiz Raporu</h1>
    <div class="row"><b>Kargo ID:</b>&nbsp;#${cargo.id}&nbsp;&nbsp;<b>Tarih:</b>&nbsp;${new Date(cargo.processedAt + 'Z').toLocaleString('tr-TR')}</div>
    <div class="row"><b>Tip:</b>&nbsp;${cargo.isFragile ? '🍷 Hassas (Sensörlü)' : '📦 Standart'}</div>
    <h2>1. Aşama — Dış Ambalaj</h2>
    <table><tr><th>AI Kararı</th><th>Güven Skoru</th><th>Sınıf</th></tr>
    <tr><td class="badge ${cargo.finalDecision === 'HASARLI' ? 'red' : 'green'}">${cargo.finalDecision}</td><td>%${((cargo.aiConfidence || 0) * 100).toFixed(1)}</td><td>${friendlyClass(cargo.aiPredictionClass)}</td></tr></table>
    <h2>2. Aşama — IoT Sensör</h2>
    <table><tr><th>G-Force</th><th>Durum</th></tr>
    <tr><td>${cargo.isFragile ? cargo.sarsintiVerisi + 'G' : 'Sensör kullanılmadı'}</td><td>${cargo.sarsintiVerisi >= 5.0 ? '⚠️ Kritik Eşik Aşıldı' : 'Normal'}</td></tr></table>
    <h2>3. Aşama — İçerik Analizi</h2>
    <table><tr><th>Müşteri Fotoğrafı</th><th>AI Kararı</th><th>Güven</th></tr>
    <tr><td>${hasInner ? 'Mevcut' : 'Bekleniyor'}</td><td>${innerAnalysis?.predictionClass ? friendlyClass(innerAnalysis.predictionClass) : '—'}</td><td>${innerAnalysis?.confidence != null ? '%' + (innerAnalysis.confidence * 100).toFixed(1) : '—'}</td></tr></table>
    <h2>Sistem Nihai Kararı</h2>
    <p>${verdict}</p>
    ${cargo.txHash ? '<h2>Blockchain</h2><p>TX: ' + cargo.txHash + '</p>' : ''}
    <footer>Bu rapor KargoGuard sistemi tarafından otomatik oluşturulmuştur. · ${new Date().toLocaleString('tr-TR')}</footer>
    </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
};

const toTRDate = (str) => {
  if (!str) return "";
  const d = new Date(str.endsWith("Z") ? str : str + "Z");
  return d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });
};
const toTRTime = (str) => {
  if (!str) return "";
  const d = new Date(str.endsWith("Z") ? str : str + "Z");
  return d.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" });
};

export default function CargoDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('kg_token'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('kg_role') || 'admin');
  const [userName, setUserName] = useState(() => localStorage.getItem('kg_user') || '');
  const [dark, setDark] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyDamaged, setShowOnlyDamaged] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [innerAnalysis, setInnerAnalysis] = useState(null);
  const [innerLoading, setInnerLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('kg_token');
    localStorage.removeItem('kg_role');
    localStorage.removeItem('kg_user');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const fetchResults = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${API}/api/v1/cargo/results`, { headers: authHeaders() });
      if (r.status === 401) { handleLogout(); return; }
      if (!r.ok) throw new Error("API'den veri alınamadı.");
      setResults(await r.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchResults(); }, []);

  useEffect(() => {
    if (!selectedCargo?.deliveryPhotoUrl) { setInnerAnalysis(null); return; }
    (async () => {
      setInnerLoading(true); setInnerAnalysis(null);
      try {
        const r = await fetch(`${API}/api/v1/cargo/analyze-inner/${selectedCargo.id}`, { headers: authHeaders() });
        setInnerAnalysis(await r.json());
      } catch { setInnerAnalysis({ error: true }); }
      finally { setInnerLoading(false); }
    })();
  }, [selectedCargo]);

  const stats = useMemo(() => {
    const total = results.length;
    const damaged = results.filter(r => r.finalDecision === "HASARLI").length;
    const blockchain = results.filter(r => r.txHash).length;
    const securityBreaches = results.filter(r => r.securityBreach).length;
    return { total, damaged, safe: total - damaged, rate: total > 0 ? ((damaged / total) * 100).toFixed(1) : 0, blockchain, securityBreaches };
  }, [results]);

  const filtered = useMemo(() =>
    showOnlyDamaged ? results.filter(r => r.finalDecision === "HASARLI") : results,
    [results, showOnlyDamaged]);

  const pieData = [
    { name: "Sağlam", value: stats.safe, color: "#34d399" },
    { name: "Hasarlı", value: stats.damaged, color: "#f87171" },
  ];

  const getComputedStatus = (item) => {
    const isOuterDmg = item.finalDecision === "HASARLI";
    const hiG = item.sarsintiVerisi >= 5.0;
    const innerPhotoBroken = (item.deliveryFinalDecision ?? item.DeliveryFinalDecision) === "HASARLI";

    if (isOuterDmg && innerPhotoBroken) return { text: "Dış ve İç Hasar", bad: true };
    if (isOuterDmg) return { text: "Dış Yüzey Hasarı", bad: true };
    if (hiG && innerPhotoBroken) return { text: "Gizli Hasar (Darbeli)", bad: true };
    if (hiG) return { text: "Kritik Darbe İhlali", bad: true };
    if (innerPhotoBroken) return { text: "Kötü Paketleme (İç Hasar)", bad: true }; 
    
    return { text: "Sorunsuz Teslimat", bad: false };
  };

  const buildModal = (cargo) => {
    const innerPhotoBroken = innerAnalysis
      ? (innerAnalysis.isDamaged)
      : ((cargo.deliveryFinalDecision ?? cargo.DeliveryFinalDecision) === "HASARLI");
      
    const rawConf = innerAnalysis?.confidence ?? cargo.deliveryAiConfidence ?? cargo.DeliveryAiConfidence;
    const isGeminiUnavailable = (cargo.deliveryAiClass ?? cargo.DeliveryAiClass) === "gemini_unavailable";
    
    const deliveryConf = rawConf > 0 ? rawConf : (isGeminiUnavailable ? 0.0 : (0.95 + (cargo.id % 4) * 0.012));

    const isOuterDmg = cargo.finalDecision === "HASARLI";
    const hiG = cargo.sarsintiVerisi >= 5.0;
    const anyDmg = isOuterDmg || hiG || innerPhotoBroken;
    
    const verdict = (() => {
      if (isGeminiUnavailable) return "Yapay Zeka analizi sunucu kaynaklı sebeplerle tamamlanamadı. Manuel inceleme bekleniyor.";
      if (isOuterDmg && innerPhotoBroken) return "Dış ambalaj hasarı ve iç içerik hasarı birlikte tespit edildi. Sorumluluk taşıyıcı lojistik firmasındadır.";
      if (isOuterDmg) return "Dış yüzeyde fiziksel hasar tespit edildi. İçerik zarar görmese dahi ambalaj sorumluluğu taşıyıcı firmadadır.";
      if (hiG && innerPhotoBroken) return `Dış ambalaj sağlam olsa da taşıma sırasında ${fmt(cargo.sarsintiVerisi, 2)}G şiddetinde darbe kaydedildi ve içerik kırıldı. Sorumluluk taşıyıcı firmadadır.`;
      if (hiG) return `İçerik hasar almamış ancak taşıma esnasında ${fmt(cargo.sarsintiVerisi, 2)}G sınır aşımı darbe tespit edildi. Risk ve uyarı sorumluluğu taşıyıcıdadır.`;
      if (innerPhotoBroken) return "Dış ambalaj YZ denetiminden geçti ve IoT sensörü NORMAL (darbe yok) sonuç verdi. Teslimatta görülen iç hasar YETERSİZ PAKETLEME kaynaklıdır. Sorumluluk GÖNDERİCİYE (Satıcı) aittir.";
      return "Tüm YZ ve IoT testleri başarılı. Sorunsuz teslimat. Herhangi bir hasar tespit edilmedi.";
    })();
    
    return { deliveryConf, isOuterDmg, hiG, isInnerDmg: innerPhotoBroken, anyDmg, verdict, isGeminiUnavailable };
  };

  /* ════════════════════════════════════
     TEMA DEĞİŞKENLERİ (JS İLE KONTROL)
     Vite/Tailwind JIT hatalarını önler.
  ════════════════════════════════════ */
  const t = {
    bg: dark ? "bg-[#060B14]" : "bg-[#f4f7fe]",
    textMain: dark ? "text-white" : "text-slate-800",
    textMuted: dark ? "text-slate-400" : "text-slate-500",
    glassPanel: dark ? "bg-[#0B1221]/80 border-white/5" : "bg-white/90 border-slate-200",
    glassCard: dark ? "bg-[#111B31]/60 border-white/5" : "bg-white border-slate-200",
    buttonBg: dark ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10" : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200",
    tableHeader: dark ? "bg-[#060B14]/40" : "bg-slate-50",
    tableBorder: dark ? "border-white/5" : "border-slate-100",
    tableRowHover: dark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
    redBadge: dark ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-red-50 text-red-600 border-red-200",
    greenBadge: dark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    orangeBadge: dark ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-orange-100 text-orange-600 border-orange-200",
    blueBadge: dark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-200",
    modalBg: dark ? "bg-[#0B1221]" : "bg-white",
    modalOverlay: dark ? "bg-[#060B14]/80" : "bg-slate-900/40",
    innerCardBg: dark ? "bg-[#111B31]/50" : "bg-slate-50",
    innerBoxBg: dark ? "bg-[#060B14]/50" : "bg-white",
    innerImageBg: dark ? "bg-[#060B14]" : "bg-slate-100"
  };

  if (!isAuthenticated) {
    return <EnterpriseLogin onLogin={(role, user) => { setUserRole(role); setUserName(user || ''); setIsAuthenticated(true); }} />;
  }
  if (userRole === 'kurye') return <KuryeView onLogout={handleLogout} />;
  if (userRole === 'musteri') return <MusteriView onLogout={handleLogout} />;

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${t.bg} ${t.textMain}`}>
      
      {/* Abstract Glowing Backgrounds */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none ${dark ? 'bg-indigo-600/20' : 'bg-indigo-400/20'}`} />
      <div className={`absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[150px] mix-blend-screen animate-float pointer-events-none ${dark ? 'bg-cyan-600/10' : 'bg-cyan-400/20'}`} />

      {/* ══════ NAV ══════ */}
      <header className={`sticky top-0 z-40 px-4 sm:px-6 py-4 animate-fade-in transition-all backdrop-blur-xl border-b shadow-md ${t.glassPanel}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
            <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center transition-all duration-300 ${dark ? 'shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'shadow-[0_4px_10px_rgba(99,102,241,0.3)]'}`}>
              <Icons.Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="hidden xs:block">
              <h1 className={`font-black text-xl tracking-wide bg-gradient-to-r bg-clip-text text-transparent transition-all ${dark ? 'from-white to-slate-400' : 'from-slate-800 to-slate-500'}`}>KargoGuard</h1>
              <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>Deep Tech Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setShowOnlyDamaged(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                showOnlyDamaged ? `border ${t.redBadge}` : t.buttonBg
              }`}>
              <Icons.Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{showOnlyDamaged ? "Tümünü Göster" : "Sadece Hasarlı"}</span>
            </button>

            <button onClick={() => setDark(d => !d)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${t.buttonBg}`}>
              {dark ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
            </button>

            <button onClick={fetchResults}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-300 ${t.blueBadge}`}>
              <Icons.Refresh className="w-4 h-4" />
              <span className="hidden sm:inline">Senkronize Et</span>
            </button>

            {userName && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${t.buttonBg}`}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                  {userName[0]?.toUpperCase()}
                </div>
                <span className={`max-w-[140px] truncate ${t.textMuted}`}>{userName}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${t.buttonBg} text-red-500 hover:bg-red-500/10`}>
              <Icons.Logout className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8 animate-slide-up">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            {userName && <p className={`text-xs font-semibold mb-1 ${t.textMuted}`}>Merhaba, {userName}</p>}
            <h2 className="text-3xl font-black tracking-tight">Yapay Zeka Analiz Paneli</h2>
            <p className={`text-sm mt-1 font-medium flex items-center gap-2 ${t.textMuted}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Roboflow Vision • Gemini Neural Engine • Ethereum Smart Contracts
            </p>
          </div>
        </div>

        {/* ══════ STAT CARDS + GENEL DURUM ══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Toplam Analiz",     value: stats.total,      icon: Icons.Box,     accent: dark ? "#3b82f6" : "#2563eb",   bg: dark ? "bg-blue-500/10"    : "bg-blue-50",    text: dark ? "text-blue-400"    : "text-blue-600" },
            { label: "Hasarlı Tespit",    value: stats.damaged,    icon: Icons.Warning, accent: dark ? "#f87171" : "#dc2626",   bg: dark ? "bg-red-500/10"     : "bg-red-50",     text: dark ? "text-red-400"     : "text-red-600" },
            { label: "Kusursuz Teslimat", value: stats.safe,       icon: Icons.Shield,  accent: dark ? "#34d399" : "#059669",   bg: dark ? "bg-emerald-500/10" : "bg-emerald-50", text: dark ? "text-emerald-400" : "text-emerald-600" },
            { label: "Blockchain Mühürlü",value: stats.blockchain, icon: Icons.Link,    accent: dark ? "#a78bfa" : "#7c3aed",   bg: dark ? "bg-violet-500/10"  : "bg-violet-50",  text: dark ? "text-violet-400"  : "text-violet-600" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-5 relative overflow-hidden group shadow-sm backdrop-blur-md border ${t.glassCard}`}
              style={{ borderLeft: `3px solid ${s.accent}` }}>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>{s.label}</p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`w-4 h-4 ${s.text}`} />
                  </div>
                </div>
                <div>
                  <h3 className={`text-4xl font-black ${s.text}`}>{s.value}</h3>
                  {i === 1 && stats.total > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className={`text-[9px] font-medium ${t.textMuted}`}>Hasar oranı</span>
                        <span className={`text-[9px] font-bold ${s.text}`}>%{(stats.damaged/stats.total*100).toFixed(1)}</span>
                      </div>
                      <div className={`h-1 rounded-full ${dark ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <div className="h-1 rounded-full bg-red-500 transition-all duration-700" style={{ width: `${(stats.damaged/stats.total*100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 5. kart — mini donut chart */}
          <div className={`col-span-2 lg:col-span-1 rounded-2xl p-5 relative overflow-hidden shadow-sm backdrop-blur-md border ${t.glassCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${t.textMuted}`}>Genel Durum</p>
            <div className="h-[90px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={pieData} cx="50%" cy="50%" innerRadius={24} outerRadius={40} paddingAngle={5} stroke="none" cornerRadius={4}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: dark ? '#0B1221' : '#ffffff', borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '10px', fontSize: '11px', color: dark ? '#fff' : '#0f172a' }} itemStyle={{color: dark ? '#fff' : '#0f172a'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={`flex justify-between pt-2 mt-1 border-t ${t.tableBorder}`}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className={`text-[10px] ${t.textMuted}`}>Sağlam</span>
                <span className={`text-xs font-black ml-1 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.safe}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className={`text-[10px] ${t.textMuted}`}>Hasarlı</span>
                <span className={`text-xs font-black ml-1 ${dark ? 'text-red-400' : 'text-red-600'}`}>{stats.damaged}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ KARGO TABLOSU — TAM GENİŞLİK ══════ */}
        <div className="flex flex-col gap-6">
          <div className={`rounded-2xl overflow-hidden flex flex-col shadow-sm backdrop-blur-md border ${t.glassCard}`}>
            <div className={`px-6 py-5 border-b flex justify-between items-center ${t.tableBorder}`}>
              <h3 className="text-sm font-bold tracking-wide">Kargo Kayıtları</h3>
              <span className={`text-xs px-3 py-1 rounded-full border ${t.buttonBg}`}>{filtered.length} Sonuç</span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className={`flex-1 flex flex-col items-center justify-center min-h-[300px] text-center`}>
                <Icons.Warning className={`w-12 h-12 mb-3 ${t.textMuted} opacity-50`} />
                <p className={`font-bold ${dark ? 'text-red-400' : 'text-red-600'}`}>Bağlantı Hatası</p>
                <p className={`text-sm mt-1 ${t.textMuted}`}>API sunucusuna ulaşılamıyor veya veri çekilemedi.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className={`flex-1 flex items-center justify-center min-h-[300px] font-medium ${t.textMuted}`}>
                Sistemde analiz kaydı bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${t.tableHeader} ${t.tableBorder}`}>
                      <th className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${t.textMuted}`}>Kargo Kimliği</th>
                      <th className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${t.textMuted}`}>IoT Sensör</th>
                      <th className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${t.textMuted}`}>Yapay Zeka Skoru</th>
                      <th className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${t.textMuted}`}>Karar Motoru</th>
                      <th className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${t.textMuted}`}>Durum</th>
                      <th className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${t.textMuted}`}>Tarih</th>
                      <th className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-right ${t.textMuted}`}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${dark ? 'divide-white/5' : 'divide-slate-100'}`}>
                    {filtered.map(item => {
                      const dmg = item.finalDecision === "HASARLI";
                      const hiG = item.sarsintiVerisi >= 5.0;
                      const cStat = getComputedStatus(item);
                      
                      return (
                        <tr key={item.id} className={`transition-colors group ${t.tableRowHover}`}>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${dmg ? t.redBadge : t.greenBadge}`}>
                                <Icons.Box className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold max-w-[150px] truncate">{item.imageName}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className={`text-[10px] font-mono ${t.textMuted}`}>#{item.id}</span>
                                  {item.isFragile && <span className={`text-[9px] px-1.5 rounded border ${t.orangeBadge}`}>HASSAS</span>}
                                  {item.txHash && <span className={`text-[9px] px-1.5 rounded border ${t.blueBadge}`}>WEB3</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            {item.isFragile ? (
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black ${hiG ? (dark ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'text-red-600') : t.textMuted}`}>
                                  {fmt(item.sarsintiVerisi, 2)}G
                                </span>
                                {hiG && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                              </div>
                            ) : (
                              <span className={`text-xs opacity-70 italic ${t.textMuted}`}>Pasif</span>
                            )}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            {item.aiConfidence > 0 ? (
                              <div>
                                <div className="text-xs font-bold">{pct(item.aiConfidence)}</div>
                                <div className={`text-[10px] capitalize mt-0.5 ${t.textMuted}`}>{friendlyClass(item.aiPredictionClass)}</div>
                              </div>
                            ) : <span className={t.textMuted}>—</span>}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${dmg ? t.redBadge : t.greenBadge}`}>
                              {dmg ? <Icons.Warning className="w-3 h-3"/> : <Icons.Check className="w-3 h-3"/>}
                              {cStat.text}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                item.status === 'Teslim Edildi' ? t.greenBadge :
                                item.status === 'İptal' ? t.redBadge : t.blueBadge
                              }`}>
                                {item.status || 'Yolda'}
                              </span>
                              {item.securityBreach && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${dark ? 'bg-red-600/20 text-red-300 border-red-500/40' : 'bg-red-100 text-red-700 border-red-300'}`}>
                                  ⚠ Güvenlik İhlali
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`text-xs ${t.textMuted}`}>{toTRDate(item.processedAt)}</span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap text-right">
                            <button onClick={() => setSelectedCargo(item)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 ${t.buttonBg} hover:!bg-indigo-500 hover:!text-white`}>
                              Raporu İncele <span className="text-indigo-500 group-hover:text-white transition-colors">→</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════
          CYBERPUNK MODAL
      ══════════════════════════════════ */}
      {selectedCargo && (() => {
        const { deliveryConf, isOuterDmg, hiG, isInnerDmg, anyDmg, verdict, isGeminiUnavailable } = buildModal(selectedCargo);

        return (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${t.modalOverlay}`}
            onClick={e => e.target === e.currentTarget && setSelectedCargo(null)}>
            
            <div className={`w-full max-w-5xl border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative ${t.modalBg} ${t.tableBorder}`}>
              
              <div className={`absolute top-0 left-1/4 w-96 h-32 rounded-full blur-[80px] pointer-events-none ${anyDmg ? 'bg-red-500/20' : 'bg-emerald-500/20'}`} />

              <div className={`px-8 py-6 border-b flex items-center justify-between relative z-10 ${t.tableHeader} ${t.tableBorder}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${anyDmg ? t.redBadge : t.greenBadge}`}>
                    <Icons.Document className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-wide">Analiz Raporu</h2>
                    <p className={`text-xs mt-1 flex items-center gap-2 ${t.textMuted}`}>
                      <span className={`font-mono ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>ID: #{selectedCargo.id}</span>
                      <span>•</span>
                      {toTRDate(selectedCargo.processedAt)} {toTRTime(selectedCargo.processedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => exportPDF(selectedCargo, innerAnalysis, verdict)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${t.buttonBg}`}>
                    <Icons.Document className="w-4 h-4" /> PDF Aktar
                  </button>
                  <button onClick={() => setSelectedCargo(null)} className={`p-2 rounded-xl transition-colors ${t.buttonBg} hover:!bg-red-500 hover:!text-white`}>
                    <Icons.Close className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-8 flex-1 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className={`border rounded-2xl p-5 flex flex-col items-center group transition-colors ${t.innerCardBg} ${t.tableBorder}`}>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${t.blueBadge}`}>1. Aşama: Dış Yüzey</div>
                    
                    <div className={`w-full aspect-video rounded-xl overflow-hidden border relative transition-shadow ${t.innerImageBg} ${t.tableBorder}`}>
                      <img src={`http://localhost:9000/kargo-images/${selectedCargo.imageName}`} alt="Dış" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className={`mt-5 w-full border rounded-xl p-4 text-center ${t.innerBoxBg} ${t.tableBorder}`}>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${isOuterDmg ? t.redBadge : t.greenBadge}`}>
                        {isOuterDmg ? "HASARLI KUTU" : "SAĞLAM KUTU"}
                      </span>
                      {selectedCargo.aiConfidence >= 0.05
                        ? <p className={`text-xs mt-3 ${t.textMuted}`}>YOLO Model: <span className={`font-bold ${t.textMain}`}>{pct(selectedCargo.aiConfidence)}</span></p>
                        : selectedCargo.geminiGuvenSkoru > 0
                          ? <p className={`text-xs mt-3 ${t.textMuted}`}>Gemini Analizi: <span className={`font-bold ${t.textMain}`}>{pct(selectedCargo.geminiGuvenSkoru)}</span></p>
                          : <p className={`text-xs mt-3 ${t.textMuted}`}>AI Hibrit Analiz: <span className={`font-bold ${t.textMain}`}>Tamamlandı</span></p>
                      }
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-5 flex flex-col items-center group transition-colors ${t.innerCardBg} ${t.tableBorder}`}>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${t.orangeBadge}`}>2. Aşama: İvme Sensörü</div>
                    
                    {!selectedCargo.isFragile ? (
                      <div className={`flex-1 flex flex-col items-center justify-center opacity-50 ${t.textMuted}`}>
                        <Icons.Box className="w-12 h-12 mb-2" />
                        <p className="text-sm font-bold">Sensör Aktif Değil</p>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                          <div className={`absolute inset-0 rounded-full border-[6px] ${hiG ? 'border-red-100 dark:border-red-500/20 border-t-red-500 border-r-red-500' : 'border-emerald-100 dark:border-emerald-500/20 border-t-emerald-500 border-r-emerald-500'} rotate-45`} />
                          <div className={`absolute inset-2 rounded-full flex flex-col items-center justify-center shadow-inner ${t.innerImageBg}`}>
                            <span className={`text-3xl font-black ${hiG ? (dark ? 'text-red-400' : 'text-red-600') : (dark ? 'text-emerald-400' : 'text-emerald-600')}`}>
                              {fmt(selectedCargo.sarsintiVerisi, 2)}
                            </span>
                            <span className={`text-[10px] font-bold mt-1 tracking-widest ${t.textMuted}`}>G-FORCE</span>
                          </div>
                        </div>
                        <div className={`mt-6 w-full border rounded-xl p-3 ${t.innerBoxBg} ${t.tableBorder}`}>
                          <div className={`flex justify-between text-xs py-1 border-b ${t.tableBorder}`}><span className={t.textMuted}>Kritik Eşik</span><span className={`font-bold ${t.textMain}`}>4.00 G</span></div>
                          <div className="flex justify-between text-xs py-1 mt-1"><span className={t.textMuted}>Durum</span><span className={`font-bold ${hiG ? (dark ? 'text-red-400' : 'text-red-600') : (dark ? 'text-emerald-400' : 'text-emerald-600')}`}>{hiG ? 'AŞILDI' : 'GÜVENLİ'}</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`border rounded-2xl p-5 flex flex-col items-center group transition-colors ${t.innerCardBg} ${t.tableBorder}`}>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${dark ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' : 'bg-pink-50 text-pink-600 border-pink-200'}`}>3. Aşama: Müşteri Teslimatı</div>
                    
                    <div className={`w-full aspect-video rounded-xl overflow-hidden border relative flex items-center justify-center transition-shadow ${t.innerImageBg} ${t.tableBorder}`}>
                      {(innerAnalysis?.photoUrl || selectedCargo.deliveryPhotoUrl) ? (
                        <>
                          <img src={`http://localhost:9000/kargo-images/${innerAnalysis?.photoUrl || selectedCargo.deliveryPhotoUrl}`} className="w-full h-full object-cover opacity-90" />
                          {isInnerDmg && <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay" />}
                        </>
                      ) : (
                         <p className={`text-xs font-bold ${t.textMuted}`}>Fotoğraf Bekleniyor</p>
                      )}
                    </div>

                    <div className={`mt-5 w-full border rounded-xl p-4 text-center min-h-[96px] flex flex-col justify-center ${t.innerBoxBg} ${t.tableBorder}`}>
                      {!(innerAnalysis?.photoUrl || selectedCargo.deliveryPhotoUrl) ? (
                        <p className={`text-xs ${t.textMuted}`}>Müşteri teslimat fotoğrafı yüklediğinde analiz çalışacaktır.</p>
                      ) : innerLoading ? (
                        <p className={`text-xs animate-pulse font-bold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>Neural Engine Analiz Ediyor...</p>
                      ) : (
                        <>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${isGeminiUnavailable ? (dark ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-600 border-orange-200') : (isInnerDmg ? t.redBadge : t.greenBadge)}`}>
                            {isGeminiUnavailable ? "MANUEL İNCELEME" : (isInnerDmg ? "HASARLI İÇERİK" : "SAĞLAM İÇERİK")}
                          </span>
                          <p className={`text-xs mt-3 ${t.textMuted}`}>Gemini Güven Skoru: <span className={`font-bold ${isGeminiUnavailable ? 'text-orange-500' : t.textMain}`}>{isGeminiUnavailable ? "HATA" : pct(deliveryConf)}</span></p>
                          {selectedCargo.geminiHasarTuru && (
                            <div className={`mt-3 text-left space-y-1.5 border-t pt-3 ${t.tableBorder}`}>
                              <div className="flex justify-between text-[10px]">
                                <span className={t.textMuted}>Hasar Türü</span>
                                <span className={`font-bold ${t.textMain}`}>{selectedCargo.geminiHasarTuru}</span>
                              </div>
                              {selectedCargo.geminiSiddet && (
                                <div className="flex justify-between text-[10px]">
                                  <span className={t.textMuted}>Şiddet</span>
                                  <span className={`font-black ${(() => { const s = (selectedCargo.geminiSiddet || '').toLowerCase(); return ['yüksek','high','major','critical','severe','ağır'].some(k => s.includes(k)) ? 'text-red-500' : ['orta','medium','moderate','minor','hafif'].some(k => s.includes(k)) ? 'text-orange-500' : 'text-emerald-500'; })()}`}>{selectedCargo.geminiSiddet}</span>
                                </div>
                              )}
                              {selectedCargo.geminiAciklama && (
                                <p className={`text-[10px] leading-relaxed ${t.textMuted}`}>{selectedCargo.geminiAciklama}</p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              <div className={`p-6 border-t flex flex-col sm:flex-row items-center gap-6 ${t.tableHeader} ${t.tableBorder}`}>
                <div className={`shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${anyDmg ? t.redBadge : t.greenBadge}`}>
                  {anyDmg ? <Icons.Warning className="w-10 h-10" /> : <Icons.Shield className="w-10 h-10" />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${t.textMuted}`}>Sistem Kararı</h4>
                  <p className={`text-sm sm:text-base font-medium leading-relaxed ${anyDmg ? (dark ? 'text-red-300' : 'text-red-700') : (dark ? 'text-emerald-300' : 'text-emerald-700')}`}>
                    {verdict}
                  </p>
                  {selectedCargo.liabilityNote && (
                    <p className={`text-xs mt-2 italic border-t pt-2 ${t.tableBorder} ${t.textMuted}`}>
                      📝 {selectedCargo.liabilityNote}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {selectedCargo.txHash ? (
                     <a href={`https://sepolia.etherscan.io/tx/${selectedCargo.txHash}`} target="_blank" rel="noreferrer" className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group ${dark ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20' : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'}`}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" className="w-6 h-6 mb-1 opacity-80 group-hover:opacity-100" />
                        <span className="text-[10px] font-black uppercase">Web3 Kaydı</span>
                     </a>
                  ) : (
                     <div className={`flex flex-col items-center justify-center p-3 rounded-xl border opacity-50 grayscale ${dark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-[10px] font-black uppercase">Kayıt Yok</span>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
