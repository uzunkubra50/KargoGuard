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
};

const fmt = (n, d = 1) => Number(n).toFixed(d);
const pct = (n) => `%${fmt(n * 100, 1)}`;

/* AI durum sınıflandırıcı — ham stringleri kullanıcıya gösterme */
const getAiStatus = (confidence, predClass) => {
  if (confidence == null || confidence === 0) return 'no_image';
  if (confidence < 0.20) return 'needs_review';
  return 'completed';
};

/* Sınıf adını kullanıcı dostu Türkçeye çevir */
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

/* PDF Rapor oluşturucu */
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

/* ══════════════ THEME TOKENS ══════════════ */
const T = {
  light: {
    bg: "bg-slate-50", surface: "bg-white", surfaceAlt: "bg-slate-50",
    border: "border-slate-200", borderSub: "border-slate-100",
    text: "text-slate-900", textSub: "text-slate-500", textMuted: "text-slate-400",
    nav: "bg-white/90 border-slate-200", tableRow: "hover:bg-indigo-50/40", tableDmg: "bg-red-50/60",
    tooltip: { background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a" },
    cards: [
      { bg:"bg-white", border:"border-slate-200", lC:"text-indigo-500", vC:"text-slate-900", sC:"text-slate-400", iB:"bg-indigo-50", iC:"text-indigo-500", ln:"from-indigo-400 to-transparent" },
      { bg:"bg-red-50", border:"border-red-200", lC:"text-red-500", vC:"text-red-700", sC:"text-red-300", iB:"bg-red-100", iC:"text-red-500", ln:"from-red-400 to-transparent" },
      { bg:"bg-emerald-50", border:"border-emerald-200", lC:"text-emerald-600", vC:"text-emerald-800", sC:"text-emerald-400", iB:"bg-emerald-100", iC:"text-emerald-600", ln:"from-emerald-400 to-transparent" },
      { bg:"bg-violet-50", border:"border-violet-200", lC:"text-violet-600", vC:"text-violet-800", sC:"text-violet-400", iB:"bg-violet-100", iC:"text-violet-600", ln:"from-violet-400 to-transparent" },
    ],
  },
  dark: {
    bg: "bg-[#0d1117]", surface: "bg-[#161b27]", surfaceAlt: "bg-[#1c2333]",
    border: "border-white/10", borderSub: "border-white/5",
    text: "text-slate-100", textSub: "text-slate-400", textMuted: "text-slate-500",
    nav: "bg-[#0d1117]/90 border-white/10", tableRow: "hover:bg-white/[0.03]", tableDmg: "bg-red-500/5",
    tooltip: { background: "#1c2333", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" },
    cards: [
      { bg:"bg-[#161b27]", border:"border-white/10", lC:"text-indigo-400", vC:"text-white", sC:"text-slate-500", iB:"bg-indigo-500/10", iC:"text-indigo-400", ln:"from-indigo-500 to-transparent" },
      { bg:"bg-red-950/40", border:"border-red-500/20", lC:"text-red-400", vC:"text-red-300", sC:"text-red-400/50", iB:"bg-red-500/10", iC:"text-red-400", ln:"from-red-500 to-transparent" },
      { bg:"bg-emerald-950/40", border:"border-emerald-500/20", lC:"text-emerald-400", vC:"text-emerald-300", sC:"text-emerald-400/50", iB:"bg-emerald-500/10", iC:"text-emerald-400", ln:"from-emerald-500 to-transparent" },
      { bg:"bg-violet-950/40", border:"border-violet-500/20", lC:"text-violet-400", vC:"text-violet-300", sC:"text-violet-400/50", iB:"bg-violet-500/10", iC:"text-violet-400", ln:"from-violet-500 to-transparent" },
    ],
  },
};

/* ══════════════ MAIN COMPONENT ══════════════ */
export default function CargoDashboard() {
  const [dark, setDark] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyDamaged, setShowOnlyDamaged] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [innerAnalysis, setInnerAnalysis] = useState(null);
  const [innerLoading, setInnerLoading] = useState(false);

  const th = dark ? T.dark : T.light;

  const fetchResults = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch("http://localhost:5229/api/cargo/results");
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
        const r = await fetch(`http://localhost:5229/api/cargo/analyze-inner/${selectedCargo.id}`);
        setInnerAnalysis(await r.json());
      } catch { setInnerAnalysis({ error: true }); }
      finally { setInnerLoading(false); }
    })();
  }, [selectedCargo]);

  const stats = useMemo(() => {
    const total = results.length;
    const damaged = results.filter(r => r.finalDecision === "HASARLI").length;
    const blockchain = results.filter(r => r.txHash).length;
    return { total, damaged, safe: total - damaged, rate: total > 0 ? ((damaged / total) * 100).toFixed(1) : 0, blockchain };
  }, [results]);

  const filtered = useMemo(() =>
    showOnlyDamaged ? results.filter(r => r.finalDecision === "HASARLI") : results,
    [results, showOnlyDamaged]);

  const pieData = [
    { name: "Sağlam", value: stats.safe, color: "#10b981" },
    { name: "Hasarlı", value: stats.damaged, color: "#ef4444" },
  ];

  const statDefs = [
    { label: "Toplam", value: stats.total, sub: "Son 10 kayıt", icon: Icons.Box },
    { label: "Hasarlı", value: stats.damaged, sub: `%${stats.rate} oran`, icon: Icons.Warning },
    { label: "Sağlam", value: stats.safe, sub: "Sorunsuz", icon: Icons.Shield },
    { label: "Zincir", value: stats.blockchain, sub: "Sepolia", icon: Icons.Link },
  ];

  /* ── Tablo için özet durum hesaplama ── */
  const getComputedStatus = (item) => {
    const isOuterDmg = item.finalDecision === "HASARLI";
    const hiG = item.sarsintiVerisi >= 5.0;
    const innerPhotoBroken = (item.deliveryFinalDecision ?? item.DeliveryFinalDecision) === "HASARLI";

    if (isOuterDmg && innerPhotoBroken) return { text: "Dış ve İç Hasar", bad: true };
    if (isOuterDmg) return { text: "Dış Yüzey Hasarı", bad: true };
    if (hiG && innerPhotoBroken) return { text: "Gizli Hasar (Darbeli)", bad: true };
    if (hiG) return { text: "Kritik Darbe İhlali", bad: true };
    if (innerPhotoBroken) return { text: "Kötü Paketleme (İç Hasar)", bad: true }; // Satıcı hatası
    
    return { text: "Sorunsuz Teslimat", bad: false };
  };

  /* ── MODAL helpers ── */
  const buildModal = (cargo) => {
    const innerPhotoBroken = innerAnalysis
      ? (innerAnalysis.isDamaged)
      : ((cargo.deliveryFinalDecision ?? cargo.DeliveryFinalDecision) === "HASARLI");
      
    const deliveryConf = innerAnalysis?.confidence ?? cargo.deliveryAiConfidence ?? cargo.DeliveryAiConfidence;
    
    const isOuterDmg = cargo.finalDecision === "HASARLI";
    const hiG = cargo.sarsintiVerisi >= 5.0;
    
    // Herhangi bir sorun varsa modal kırmızı temaya dönsün
    const anyDmg = isOuterDmg || hiG || innerPhotoBroken;
    
    const verdict = (() => {
      if (isOuterDmg && innerPhotoBroken) return "Dış ambalaj hasarı ve iç içerik hasarı birlikte tespit edildi. Sorumluluk taşıyıcı lojistik firmasındadır.";
      if (isOuterDmg) return "Dış yüzeyde fiziksel hasar tespit edildi. İçerik zarar görmese dahi ambalaj sorumluluğu taşıyıcı firmadadır.";
      
      if (hiG && innerPhotoBroken) return `Dış ambalaj sağlam olsa da taşıma sırasında ${fmt(cargo.sarsintiVerisi, 2)}G şiddetinde darbe kaydedildi ve içerik kırıldı. Sorumluluk taşıyıcı firmadadır.`;
      if (hiG) return `İçerik hasar almamış ancak taşıma esnasında ${fmt(cargo.sarsintiVerisi, 2)}G sınır aşımı darbe tespit edildi. Risk ve uyarı sorumluluğu taşıyıcıdadır.`;
      
      if (innerPhotoBroken) return "Dış ambalaj YZ denetiminden geçti ve IoT sensörü NORMAL (darbe yok) sonuç verdi. Teslimatta görülen iç hasar YETERSİZ PAKETLEME kaynaklıdır. Sorumluluk GÖNDERİCİYE (Satıcı) aittir.";
      
      return "Tüm YZ ve IoT testleri başarılı. Sorunsuz teslimat. Herhangi bir hasar tespit edilmedi.";
    })();
    
    return { deliveryConf, isOuterDmg, hiG, isInnerDmg: innerPhotoBroken, anyDmg, verdict };
  };

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className={`min-h-screen transition-colors duration-300 ${th.bg}`}>

      {/* top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />

      {/* ══════ NAV ══════ */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-6 py-3 ${th.nav}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Icons.Box className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="hidden xs:block">
              <span className={`font-black text-base sm:text-lg tracking-tight ${th.text}`}>KargoGuard</span>
              <span className="ml-2 text-[9px] font-black text-indigo-500 bg-indigo-500/10 border border-indigo-400/30 px-1.5 py-0.5 rounded-full uppercase tracking-widest">LIVE</span>
            </div>
            <span className={`xs:hidden font-black text-sm tracking-tight ${th.text}`}>KG</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* filter — icon only on mobile */}
            <button onClick={() => setShowOnlyDamaged(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                showOnlyDamaged
                  ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20"
                  : dark
                    ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              }`}>
              <Icons.Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showOnlyDamaged ? "Tümünü Göster" : "Sadece Hasarlı"}</span>
            </button>

            <button onClick={fetchResults}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition-all">
              <Icons.Refresh className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yenile</span>
            </button>

            <button onClick={() => setDark(d => !d)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border transition-all ${
                dark
                  ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
              }`}>
              {dark ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Title */}
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${th.text}`}>Yapay Zeka Lojistik Paneli</h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${th.textSub}`}>
            Roboflow & Gemini AI · IoT Sensör · Ethereum Sepolia
          </p>
        </div>

        {/* ══════ STAT CARDS ══════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statDefs.map((s, i) => {
            const c = th.cards[i];
            return (
              <div key={s.label} className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm ${c.bg} ${c.border}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${c.lC}`}>{s.label}</span>
                  <span className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${c.iB}`}>
                    <s.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${c.iC}`} />
                  </span>
                </div>
                <p className={`text-3xl sm:text-4xl font-black tracking-tight ${c.vC}`}>{s.value}</p>
                <p className={`text-[10px] sm:text-xs font-semibold mt-1 ${c.sC}`}>{s.sub}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.ln}`} />
              </div>
            );
          })}
        </div>

        {/* ══════ CHART + LIST ══════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-5">

          {/* Pie — hidden on very small, visible on sm+ */}
          <div className={`${th.surface} border ${th.border} rounded-2xl p-5 flex flex-col gap-4 shadow-sm`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${th.textMuted}`}>Dağılım</p>
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={pieData} cx="50%" cy="50%"
                    innerRadius={44} outerRadius={68} paddingAngle={4} stroke="none">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ ...th.tooltip, borderRadius: 10, fontSize: 12, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={`pt-3 space-y-2 border-t ${th.borderSub}`}>
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className={`text-xs font-bold ${th.textSub}`}>{d.name}</span>
                  </div>
                  <span className={`text-xs font-black ${th.text}`}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ CARGO LIST ══ */}
          <div className={`${th.surface} border ${th.border} rounded-2xl overflow-hidden shadow-sm`}>
            {loading && (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-48 gap-2 text-red-500 font-bold text-sm px-4 text-center">
                <Icons.Warning className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className={`flex items-center justify-center h-48 text-sm font-medium ${th.textSub}`}>
                Kayıt bulunamadı.
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <>
                {/* ── DESKTOP TABLE (md+) ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${th.borderSub}`}>
                        {["Kargo", "G-Force", "AI Güven", "Karar", "Teslimat Durumu", "Tarih", ""].map(h => (
                          <th key={h} className={`px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest ${th.textMuted} whitespace-nowrap`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(item => {
                        const dmg = item.finalDecision === "HASARLI";
                        const hiG = item.sarsintiVerisi >= 5.0;
                        const cStat = getComputedStatus(item);
                        return (
                          <tr key={item.id} className={`border-b ${th.borderSub} transition-colors ${th.tableRow} ${dmg ? th.tableDmg : ""}`}>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dmg ? "bg-red-100" : "bg-indigo-50"}`}>
                                  <Icons.Box className={`w-4 h-4 ${dmg ? "text-red-500" : "text-indigo-500"}`} />
                                </div>
                                <div>
                                  <div className={`font-bold text-xs max-w-[120px] truncate ${th.text}`} title={item.imageName}>{item.imageName}</div>
                                  <div className={`text-[10px] ${th.textMuted}`}>#{item.id}</div>
                                  {item.isFragile ? (
                                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-600">🍷 Hassas (Sensörlü)</span>
                                  ) : (
                                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500">📦 Standart (Sensörsüz)</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {item.isFragile ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${hiG ? "bg-red-100 text-red-600" : dark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                                  {hiG && "💥 "}{fmt(item.sarsintiVerisi, 2)}G
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs italic ${dark ? "text-slate-500" : "text-slate-400"}`}>
                                  Sensör Yok
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {(() => {
                                const st = getAiStatus(item.aiConfidence, item.aiPredictionClass);
                                if (st === 'no_image') return <span className={`text-xs font-bold ${dark?'text-slate-500':'text-slate-400'}`}>—</span>;
                                if (st === 'needs_review') return (
                                  <>
                                    <div className="font-black text-xs text-yellow-500">{pct(item.aiConfidence)}</div>
                                    <div className="text-[10px] mt-0.5 text-yellow-400/80">İnceleniyor</div>
                                  </>
                                );
                                return (
                                  <>
                                    <div className={`font-black text-xs ${th.text}`}>{pct(item.aiConfidence)}</div>
                                    <div className={`text-[10px] mt-0.5 capitalize ${th.textMuted}`}>{friendlyClass(item.aiPredictionClass)}</div>
                                  </>
                                );
                              })()}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${dmg ? "bg-red-100 text-red-600 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                                {dmg ? <Icons.Warning className="w-3 h-3"/> : <Icons.Check className="w-3 h-3"/>}
                                {item.finalDecision}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 max-w-[180px]">
                              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg border truncate max-w-full ${
                                cStat.bad
                                  ? "bg-red-100 border-red-200 text-red-600"
                                  : "bg-emerald-100 border-emerald-200 text-emerald-700"
                              }`} title={cStat.text}>
                                {cStat.text}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                              <div className={`text-xs font-bold ${th.text}`}>{toTRDate(item.processedAt)}</div>
                              <div className={`text-[10px] ${th.textMuted}`}>{toTRTime(item.processedAt)}</div>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <button onClick={() => setSelectedCargo(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow shadow-indigo-500/20">
                                <Icons.Eye className="w-3.5 h-3.5"/> Detay
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── MOBILE CARDS (< md) ── */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filtered.map(item => {
                    const dmg = item.finalDecision === "HASARLI";
                    const hiG = item.sarsintiVerisi >= 5.0;
                    const cStat = getComputedStatus(item);
                    return (
                      <div key={item.id} className={`p-4 transition-colors ${dmg ? th.tableDmg : ""}`}>
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: icon + name */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dmg ? "bg-red-100" : "bg-indigo-50"}`}>
                              <Icons.Box className={`w-5 h-5 ${dmg ? "text-red-500" : "text-indigo-500"}`} />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-black text-sm truncate ${th.text}`} title={item.imageName}>{item.imageName}</p>
                              <p className={`text-xs ${th.textMuted}`}>#{item.id} · {toTRDate(item.processedAt)}</p>
                              {item.isFragile ? (
                                <span className="mt-1 flex w-fit items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-600">🍷 Hassas (Sensörlü)</span>
                              ) : (
                                <span className="mt-1 flex w-fit items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500">📦 Standart (Sensörsüz)</span>
                              )}
                            </div>
                          </div>
                          {/* Right: verdict badge */}
                          <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${dmg ? "bg-red-100 text-red-600 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                            {dmg ? <Icons.Warning className="w-3 h-3"/> : <Icons.Check className="w-3 h-3"/>}
                            {item.finalDecision}
                          </span>
                        </div>

                        {/* Stats row */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.isFragile ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${hiG ? "bg-red-100 text-red-600" : dark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                              {hiG && "💥 "}{fmt(item.sarsintiVerisi, 2)}G
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] italic ${dark ? "text-slate-500" : "text-slate-400"}`}>
                              Sensör Yok
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            getAiStatus(item.aiConfidence) === 'needs_review' ? 'bg-yellow-100 text-yellow-700' : dark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.aiConfidence > 0 ? `AI ${pct(item.aiConfidence)}` : 'AI —'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            cStat.bad ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {cStat.text}
                          </span>
                        </div>

                        {/* Detay button */}
                        <button onClick={() => setSelectedCargo(item)}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow shadow-indigo-500/20">
                          <Icons.Eye className="w-4 h-4"/> Detayı Gör
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════
          MODAL — full-screen on mobile
      ══════════════════════════════════ */}
      {selectedCargo && (() => {
        const { deliveryConf, isOuterDmg, hiG, isInnerDmg, anyDmg, verdict } = buildModal(selectedCargo);
        const mp = dark
          ? { bg: "bg-[#111827]", border: "border-white/8", col: "bg-[#1c2333] border-white/5" }
          : { bg: "bg-white", border: "border-slate-200", col: "bg-slate-50 border-slate-200" };

        const BadgeEl = ({ ok, children }) => (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${ok ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-600 border-red-200"}`}>
            {ok ? <Icons.Check className="w-3.5 h-3.5"/> : <Icons.Warning className="w-3.5 h-3.5"/>}
            {children}
          </span>
        );

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-md"
            onClick={e => e.target === e.currentTarget && setSelectedCargo(null)}>
            {/* On mobile: slides from bottom (rounded top corners only). On sm+: centered card */}
            <div className={`w-full sm:max-w-5xl ${mp.bg} border-t sm:border ${mp.border} rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col sm:max-h-[92vh] max-h-[94vh] overflow-hidden`}>

              {/* drag handle (mobile) */}
              <div className="flex sm:hidden justify-center pt-3 pb-1">
                <div className={`w-10 h-1 rounded-full ${dark ? "bg-white/20" : "bg-slate-300"}`} />
              </div>

              {/* Header */}
              <div className={`flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b ${th.borderSub}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${anyDmg ? "bg-red-100" : "bg-emerald-100"}`}>
                    <Icons.Document className={`w-4 h-4 sm:w-5 sm:h-5 ${anyDmg ? "text-red-600" : "text-emerald-600"}`} />
                  </div>
                  <div>
                    <h2 className={`text-sm sm:text-base font-black tracking-tight ${th.text}`}>İç Hasar Analiz Raporu</h2>
                    <p className={`text-[10px] mt-0.5 font-semibold ${th.textMuted}`}>
                      Kargo #{selectedCargo.id} · {toTRDate(selectedCargo.processedAt)} {toTRTime(selectedCargo.processedAt)}
                      {selectedCargo.isFragile
                        ? <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-100 text-orange-600">🍷 Hassas</span>
                        : <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-500">📦 Standart</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportPDF(selectedCargo, innerAnalysis, verdict)}
                    title="PDF Rapor İndir"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all">
                    <Icons.Document className="w-3.5 h-3.5"/>PDF
                  </button>
                  <button onClick={() => setSelectedCargo(null)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${th.border} ${th.textSub} hover:text-red-500 hover:bg-red-50`}>
                    <Icons.Close className="w-4 h-4"/>
                  </button>
                </div>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto p-4 sm:p-7 flex-1">
                {/* On mobile: stacked cols. On md+: 3-col grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">

                  {/* Col 1 — Outer (YOLO + Gemini Hibrit) */}
                  <div className={`flex flex-col gap-3 border rounded-2xl p-4 ${mp.col}`}>
                    <span className="self-start text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">1. Aşama</span>
                    <p className={`text-[11px] font-black uppercase tracking-wider text-center ${th.textMuted}`}>Dış Ambalaj Analizi</p>

                    {/* Fotoğraf */}
                    <div className="rounded-xl overflow-hidden bg-slate-200 aspect-video sm:aspect-[4/3]">
                      <img src={`http://localhost:9000/kargo-images/${selectedCargo.imageName || selectedCargo.ImageName}`} alt="Dış kutu"
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = "https://placehold.co/400x300/e2e8f0/94a3b8?text=Görsel+Yok"; }}/>
                    </div>

                    {/* Güvenlik İhlali Banner'ı — kutu açılmışsa */}
                    {selectedCargo.securityBreach && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 text-white text-[11px] font-black animate-pulse">
                        <span>🔓</span> GÜVENLİK İHLALİ — Kutu açılmış tespit edildi!
                      </div>
                    )}

                    {/* YOLO + Gemini Sonuç Kutusu */}
                    <div className={`rounded-xl p-3 border ${isOuterDmg ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
                      {/* Ana karar badge */}
                      <div className="flex justify-center">
                        <BadgeEl ok={!isOuterDmg}>{isOuterDmg ? "HASARLI (Dış)" : "SAĞLAM (Dış)"}</BadgeEl>
                      </div>

                      {/* YOLO güven skoru */}
                      <p className={`text-[10px] font-semibold mt-2 text-center ${th.textMuted}`}>
                        YOLO: <strong className={th.text}>{pct(selectedCargo.aiConfidence)}</strong>
                        {selectedCargo.aiPredictionClass && (
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-bold">{selectedCargo.aiPredictionClass}</span>
                        )}
                      </p>

                      {/* Gemini Hibrit Detayları */}
                      {selectedCargo.geminiHasarTuru && (
                        <div className="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                          {/* Hasar türü + şiddet */}
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {/* Hasar Türü Chip */}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              selectedCargo.geminiHasarTuru === 'belirsiz'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : selectedCargo.geminiHasarTuru === 'saglam'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : isOuterDmg
                                    ? 'bg-red-100 text-red-600 border-red-200'
                                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}>
                              {{
                                'saglam':  '✅ Sağlam',
                                'ezik':    '💥 Ezik',
                                'yirtik':  '✂️ Yırtık',
                                'islak':   '💧 Islak',
                                'delik':   '🕳️ Delik',
                                'acilmis': '🔓 Açılmış',
                                'yanmis':  '🔥 Yanmış',
                                'belirsiz':'❓ Belirsiz'
                              }[selectedCargo.geminiHasarTuru] ?? selectedCargo.geminiHasarTuru}
                            </span>

                            {/* Şiddet Badge */}
                            {selectedCargo.geminiSiddet && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                selectedCargo.geminiSiddet === 'major'
                                  ? 'bg-red-100 text-red-600 border-red-200'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                                {selectedCargo.geminiSiddet === 'major' ? '🔴 Ağır' : '🟡 Hafif'}
                              </span>
                            )}

                            {/* Gemini Güven Skoru */}
                            {selectedCargo.geminiGuvenSkoru != null && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-600 border border-indigo-200">
                                Gemini {pct(selectedCargo.geminiGuvenSkoru)}
                              </span>
                            )}
                          </div>

                          {/* Açıklama */}
                          {selectedCargo.geminiAciklama && (
                            <p className="text-[10px] text-center text-slate-500 italic leading-relaxed">
                              "{selectedCargo.geminiAciklama}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 2 — IoT */}
                  <div className={`flex flex-col gap-3 border rounded-2xl p-4 items-center ${mp.col}`}>
                    <span className="self-start text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">2. Aşama</span>
                    <p className={`text-[11px] font-black uppercase tracking-wider ${th.textMuted}`}>IoT Sensör Verisi</p>
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full py-2">
                      {!selectedCargo.isFragile ? (
                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                          <p className="text-xs font-bold text-slate-500">Maliyet Tasarrufu</p>
                          <p className="text-[10px] text-slate-400">Sensör kullanılmıyor</p>
                        </div>
                      ) : (() => {
                        const gVal = selectedCargo.sarsintiVerisi ?? 0;
                        const MAX_G = 10;
                        /* Gauge ibre açısı: -90° = 0G (sol), +90° = 10G (sağ) */
                        const angle = (gVal / MAX_G) * 180 - 90;
                        const gColor = gVal < 2 ? '#10b981' : gVal < 4 ? '#f59e0b' : '#ef4444';
                        const cx = 60, cy = 60, r = 50;
                        const needleLen = 40;
                        const rad = (angle * Math.PI) / 180;
                        const x2 = cx + needleLen * Math.sin(rad);
                        const y2 = cy - needleLen * Math.cos(rad);
                        return (
                          <>
                            {/* SVG Gauge */}
                            <svg viewBox="0 0 120 70" className="w-36 sm:w-44">
                              {/* Arka plan yay */}
                              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={dark?'#334155':'#e2e8f0'} strokeWidth="10" strokeLinecap="round"/>
                              {/* Yeşil segment 0–2G */}
                              <path d="M 10 60 A 50 50 0 0 1 50 14" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round"/>
                              {/* Sarı segment 2–4G */}
                              <path d="M 50 14 A 50 50 0 0 1 80 15" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"/>
                              {/* Kırmızı segment 4G+ */}
                              <path d="M 80 15 A 50 50 0 0 1 110 60" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round"/>
                              {/* İbre */}
                              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={gColor} strokeWidth="3" strokeLinecap="round"/>
                              <circle cx={cx} cy={cy} r="4" fill={gColor}/>
                              {/* Değer */}
                              <text x={cx} y="50" textAnchor="middle" fontSize="14" fontWeight="900" fill={gColor}>{fmt(gVal,2)}</text>
                              <text x={cx} y="62" textAnchor="middle" fontSize="6" fill={dark?'#64748b':'#94a3b8'}>G-Force</text>
                              <text x="12" y="70" fontSize="6" fill="#10b981" fontWeight="700">0G</text>
                              <text x="98" y="70" fontSize="6" fill="#ef4444" fontWeight="700">10G</text>
                            </svg>
                            {/* Renk etiketleri */}
                            <div className="flex gap-3 text-[9px] font-bold">
                              <span className="text-emerald-500">● 0–2G Normal</span>
                              <span className="text-yellow-500">● 2–4G Dikkat</span>
                              <span className="text-red-500">● 4G+ Kritik</span>
                            </div>
                            {/* Sensör tablosu */}
                            <div className={`w-full rounded-xl overflow-hidden border ${th.border} text-[10px]`}>
                              {[['Anlık G-Force', `${fmt(gVal,2)}G`],['Kritik Eşik', '4.00G'],['Durum', gVal >= 4 ? '⚠️ Aşıldı' : '✅ Normal']].map(([k,v]) => (
                                <div key={k} className={`flex justify-between px-3 py-1.5 border-b last:border-0 ${th.borderSub}`}>
                                  <span className={th.textMuted}>{k}</span>
                                  <span className={`font-black ${gVal>=4&&k==='Durum'?'text-red-500':th.text}`}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Col 3 — Inner */}
                  <div className={`flex flex-col gap-3 border rounded-2xl p-4 ${mp.col}`}>
                    <span className="self-start text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">3. Aşama · Teslimat</span>
                    <p className={`text-[11px] font-black uppercase tracking-wider text-center ${th.textMuted}`}>İçerik Analizi</p>
                    <div className="rounded-xl overflow-hidden bg-slate-200 aspect-video sm:aspect-[4/3] relative">
                      {(innerAnalysis?.photoUrl || selectedCargo.deliveryPhotoUrl) ? (
                        <>
                          <img src={`http://localhost:9000/kargo-images/${innerAnalysis?.photoUrl || selectedCargo.deliveryPhotoUrl}`} alt="İç içerik"
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = "https://placehold.co/400x300/e2e8f0/94a3b8?text=Görsel+Yok"; }}/>
                          {isInnerDmg && <div className="absolute inset-0 bg-red-500/10"/>}
                        </>
                      ) : (
                        /* Müşteri fotoğrafı henüz yüklenmedi */
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 p-4">
                          <div className="text-3xl">📱</div>
                          <div className="text-xs font-black text-slate-700 text-center">Müşteri fotoğrafı bekleniyor</div>
                          <div className="text-[10px] text-slate-400 text-center">SMS bildirimi gönderildi · {toTRDate(selectedCargo.processedAt)} {toTRTime(selectedCargo.processedAt)}</div>
                        </div>
                      )}
                    </div>
                    {/* YZ Sonuç Kutusu */}
                    {!(innerAnalysis?.photoUrl || selectedCargo.deliveryPhotoUrl) ? (
                      <div className="rounded-xl p-3 text-center border bg-yellow-50 border-yellow-200">
                        <p className="text-[11px] font-black text-yellow-700">⏳ Müşteri onayı bekleniyor — karar verilemez</p>
                      </div>
                    ) : (
                      <div className={`rounded-xl p-3 text-center border ${isInnerDmg ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
                        {innerLoading ? (
                          <div className="flex flex-col items-center gap-2 py-1">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
                            <span className={`text-[10px] font-semibold ${th.textMuted}`}>Gemini AI analiz ediyor…</span>
                          </div>
                        ) : (() => {
                          const innerConf = deliveryConf ?? 0;
                          const innerSt = getAiStatus(innerConf, innerAnalysis?.predictionClass || selectedCargo.deliveryAiClass);
                          if (innerSt === 'needs_review') return (
                            <div className="rounded-xl p-3 bg-yellow-50 border border-yellow-200">
                              <p className="text-[11px] font-black text-yellow-700">⚡ Güven skoru düşük — fotoğrafı yeniden çekin veya manuel kontrol yapın</p>
                              <p className="text-[10px] text-yellow-500 mt-1">AI Skoru: {pct(innerConf)}</p>
                            </div>
                          );
                          const rawClass = innerAnalysis?.predictionClass || selectedCargo.deliveryAiClass || selectedCargo.DeliveryAiClass;
                          return (
                            <>
                              <BadgeEl ok={!isInnerDmg}>{isInnerDmg ? "HASARLI (İç)" : "GÜVENLİ (İç)"}</BadgeEl>
                              <p className={`text-[10px] sm:text-xs font-semibold mt-1.5 ${th.textMuted}`}>
                                Gemini AI: <strong className={isInnerDmg ? "text-red-500" : "text-emerald-600"}>
                                  {innerConf > 0 ? pct(innerConf) : "—"} {isInnerDmg ? "⚠️" : "✓"}
                                </strong>
                              </p>
                              {rawClass && rawClass !== 'tespit_edilemedi' && rawClass !== 'bilinmiyor' && (
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">
                                  Tespit: {friendlyClass(rawClass)}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer verdict */}
              <div className={`px-5 sm:px-7 py-4 sm:py-5 border-t ${th.borderSub} flex flex-col sm:flex-row items-center gap-3 sm:gap-4 ${anyDmg ? dark ? "bg-red-950/30" : "bg-red-50" : dark ? "bg-emerald-950/20" : "bg-emerald-50"}`}>
                <span className={`shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-black border ${anyDmg ? "bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20" : "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"}`}>
                  {anyDmg ? <Icons.Warning className="w-4 h-4"/> : <Icons.Shield className="w-4 h-4"/>}
                  {anyDmg ? "HASARLI" : "SAĞLAM"}
                </span>
                <div className="flex-1 text-center sm:text-left">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${th.textMuted}`}>Sistem Nihai Kararı</p>
                  <p className={`text-xs sm:text-sm font-medium ${anyDmg ? "text-red-600" : "text-emerald-700"}`}>{verdict}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  {selectedCargo.txHash ? (
                    <a href={`https://sepolia.etherscan.io/tx/${selectedCargo.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-100 border border-violet-200 text-violet-700 text-xs font-black hover:bg-violet-200 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" alt="" className="w-4 h-4"/>
                      Web3 Mühürlü
                    </a>
                  ) : !(innerAnalysis?.photoUrl || selectedCargo.deliveryPhotoUrl) ? (
                    <button disabled
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-black cursor-not-allowed opacity-60">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" alt="" className="w-4 h-4 opacity-40"/>
                      Mühürleme için müşteri fotoğrafı gerekli
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
