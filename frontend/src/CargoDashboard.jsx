import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5229';

const CargoDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyDamaged, setShowOnlyDamaged] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/v1/cargo/results`);
      if (!response.ok) throw new Error("Veriler alınırken bir hata oluştu.");
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // İstatistiksel Hesaplamalar
  const stats = useMemo(() => {
    const totalCount = results.length;
    const damagedObj = results.filter((r) => r.finalDecision === "HASARLI");
    const damagedCount = damagedObj.length;
    const safeCount = totalCount - damagedCount;
    const damageRate = totalCount > 0 ? ((damagedCount / totalCount) * 100).toFixed(1) : 0;
    const criticalHits = results.filter((r) => r.sarsintiVerisi >= 10.0).length;

    return { totalCount, damagedCount, safeCount, damageRate, criticalHits };
  }, [results]);

  // Tablo Filtreleme
  const filteredResults = useMemo(() => {
    if (showOnlyDamaged) {
      return results.filter((r) => r.finalDecision === "HASARLI");
    }
    return results;
  }, [results, showOnlyDamaged]);

  // Grafik Verisi
  const pieData = [
    { name: "Sağlam", value: stats.safeCount, color: "#10b981" },   // emerald-500
    { name: "Hasarlı", value: stats.damagedCount, color: "#ef4444" } // red-500
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Kargo Takip YZ Paneli
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Roboflow Analizi ve IoT İvme Ölçer Canlı Veri Akışı
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filtre Toggle Butonu */}
            <button
              onClick={() => setShowOnlyDamaged(!showOnlyDamaged)}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                showOnlyDamaged 
                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400" 
                  : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {showOnlyDamaged ? "Tümünü Göster" : "Sadece Hasarlıları Göster"}
            </button>
            <button
              onClick={fetchResults}
              disabled={loading}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Yenileniyor..." : "Yenile"}
            </button>
          </div>
        </div>

        {/* Hata Durumu */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm flex items-start gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-400">API Bağlantı Hatası</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Grid (Kartlar ve Grafik) */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sol Taraf: İstatistik Kartları */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Kart 1: Toplam İşlem */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Toplam İşlem</span>
                </div>
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{stats.totalCount}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">Sistemde kayıtlı paket</div>
              </div>

              {/* Kart 2: Hasar Oranı */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Hasar Oranı</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold text-red-600 dark:text-red-400">%{stats.damageRate}</div>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">{stats.damagedCount} tespit edilen hasar</div>
              </div>

              {/* Kart 3: Kritik Darbe */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Kritik Darbe</span>
                </div>
                <div className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">{stats.criticalHits}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">&ge; 10G şiddetinde darbe listesi</div>
              </div>
            </div>

            {/* Sağ Taraf: Pie Chart */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[220px] flex flex-col">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">Karar Dağılımı</h3>
              <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={20} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tablo Paneli */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700/50">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Görsel / Dosya</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sarsıntı (G)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI Güven</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Teslimat</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Web3 Kanıtı</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
                {!loading && filteredResults.length === 0 && !error && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Buralar sakin... Görüntülenecek paket bulunamadı.</p>
                    </td>
                  </tr>
                )}
                {filteredResults.map((item) => {
                  const isDamaged = item.finalDecision === "HASARLI";
                  const highG = item.sarsintiVerisi >= 5.0;
                  const isCritical = item.sarsintiVerisi >= 10.0;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        isDamaged ? "bg-red-50/40 dark:bg-red-900/10" : ""
                      }`}
                    >
                      {/* Görsel Bilgisi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDamaged ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                           </div>
                           <div>
                             <div className="text-sm font-bold text-slate-800 dark:text-white max-w-[150px] truncate" title={item.imageName}>
                               {item.imageName}
                             </div>
                             <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                               ID: #{item.id}
                             </div>
                           </div>
                        </div>
                      </td>
                      
                      {/* Sarsıntı Verisi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold ${
                          isCritical ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" 
                          : highG ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" 
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}>
                          {item.sarsintiVerisi.toFixed(2)} G
                          {isCritical && <span title="10G+ Çok Yüksek Darbe">💥</span>}
                          {highG && !isCritical && <span title="5G+ Yüksek Darbe">🚨</span>}
                        </div>
                      </td>
                      
                      {/* AI Güveni */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-bold text-slate-700 dark:text-slate-300">%{(item.aiConfidence * 100).toFixed(1)}</div>
                        <div className="text-xs text-slate-400 mt-0.5 capitalize">{item.aiPredictionClass.replace("_", " ")}</div>
                      </td>
                      
                      {/* Durum */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black tracking-wide border ${
                           isDamaged 
                             ? "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700" 
                             : "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:border-emerald-700"
                         }`}>
                          {item.finalDecision}
                        </span>
                      </td>

                      {/* Teslimat Durumu */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status ? (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black tracking-wide border ${
                            item.status.includes("Hasar")
                              ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800"
                              : item.status.includes("Teslim Edildi") 
                              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800"
                              : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}>
                            {item.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs italic">Bilinmiyor</span>
                        )}
                      </td>

                      {/* Web3 Kanıtı (TxHash) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.txHash ? (
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${item.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-800/60 transition-all shadow-sm"
                            title={item.txHash}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Onaylı (Etherscan)
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs italic flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse"></span> Bekleniyor
                          </span>
                        )}
                      </td>

                      {/* Tarih */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{new Date(item.processedAt).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</span>
                        <div className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{new Date(item.processedAt).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargoDashboard;
