import React, { useState, useMemo } from "react";
import { 
  getBegrData, 
  getPengaturanData, 
  formatScore,
  getCmlCategory,
  getCmlColor
} from "../../data/dataUtils";
import { CustomTooltip } from "../ui/custom-tooltip";
import { 
  Award, 
  Compass, 
  TrendingUp, 
  Target, 
  Users, 
  Zap, 
  Heart, 
  ShieldCheck, 
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Building
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Cell,
  ReferenceLine
} from "recharts";

interface OverviewViewProps {
  setActiveTab: (tab: string) => void;
}

export function OverviewView({ setActiveTab }: OverviewViewProps) {
  const begrRecords = useMemo(() => getBegrData(), []);
  const { appTitle, adminUser, targetMaturity } = useMemo(() => getPengaturanData(), []);
  const [activeTabDist, setActiveTabDist] = useState("BI Wide");
  const [showTargetComparison, setShowTargetComparison] = useState(false);
  const [isYAxisDynamic, setIsYAxisDynamic] = useState(true);

  // 1. Rata-rata CML di 3 cakupan (BI Wide, KP, KPw)
  // 1. Rata-rata CML di 3 cakupan (BI Wide, KP, KPw) beserta kepatuhannya
  const cmlScopes = useMemo(() => {
    if (begrRecords.length === 0) {
      return { 
        biWide: 0, kp: 0, kpw: 0, 
        biCount: 0, kpCount: 0, kpwCount: 0,
        biPassingCount: 0, kpPassingCount: 0, kpwPassingCount: 0,
        biPassingPercent: 0, kpPassingPercent: 0, kpwPassingPercent: 0
      };
    }

    const kpRecords = begrRecords.filter(r => r.jenis.toUpperCase() === "KP");
    const kpwRecords = begrRecords.filter(r => r.jenis.toUpperCase() !== "KP");

    const sumBi = begrRecords.reduce((s, r) => s + r.cultureMaturityLevel, 0);
    const sumKp = kpRecords.reduce((s, r) => s + r.cultureMaturityLevel, 0);
    const sumKpw = kpwRecords.reduce((s, r) => s + r.cultureMaturityLevel, 0);

    const biWideAvg = sumBi / begrRecords.length;
    const kpAvg = kpRecords.length > 0 ? sumKp / kpRecords.length : 0;
    const kpwAvg = kpwRecords.length > 0 ? sumKpw / kpwRecords.length : 0;

    const biPass = begrRecords.filter(r => r.cultureMaturityLevel >= targetMaturity).length;
    const kpPass = kpRecords.filter(r => r.cultureMaturityLevel >= biWideAvg).length;
    const kpwPass = kpwRecords.filter(r => r.cultureMaturityLevel >= biWideAvg).length;

    return {
      biWide: biWideAvg,
      kp: kpAvg,
      kpw: kpwAvg,
      biCount: begrRecords.length,
      kpCount: kpRecords.length,
      kpwCount: kpwRecords.length,
      biPassingCount: biPass,
      kpPassingCount: kpPass,
      kpwPassingCount: kpwPass,
      biPassingPercent: (biPass / begrRecords.length) * 100,
      kpPassingPercent: kpRecords.length > 0 ? (kpPass / kpRecords.length) * 100 : 0,
      kpwPassingPercent: kpwRecords.length > 0 ? (kpwPass / kpwRecords.length) * 100 : 0
    };
  }, [begrRecords, targetMaturity]);

  const kpiData = useMemo(() => {
    const biDiff = cmlScopes.biWide - targetMaturity;
    const kpDiff = cmlScopes.kp - cmlScopes.biWide;
    const kpwDiff = cmlScopes.kpw - cmlScopes.biWide;

    return [
      {
        name: "Rata-rata CML BI Wide",
        stat: formatScore(cmlScopes.biWide),
        compareLabel: "skala 4.00",
        change: `${biDiff >= 0 ? "+" : ""}${biDiff.toFixed(2)}`,
        changeType: biDiff >= 0 ? "positive" : "negative",
        comparisonLabel: `vs rata-rata BI Wide (${formatScore(targetMaturity)})`,
        subtext: `${cmlScopes.biPassingPercent.toFixed(1)}% Satker di atas rata-rata (${cmlScopes.biPassingCount}/${cmlScopes.biCount})`,
        icon: Award,
        colorClass: "amber"
      },
      {
        name: "CML Kantor Pusat (KP)",
        stat: formatScore(cmlScopes.kp),
        compareLabel: "skala 4.00",
        change: `${kpDiff >= 0 ? "+" : ""}${kpDiff.toFixed(2)}`,
        changeType: kpDiff >= 0 ? "positive" : "negative",
        comparisonLabel: `vs rata-rata BI Wide (${formatScore(cmlScopes.biWide)})`,
        subtext: `${cmlScopes.kpPassingPercent.toFixed(1)}% Satker di atas rata-rata (${cmlScopes.kpPassingCount}/${cmlScopes.kpCount})`,
        icon: Building,
        colorClass: "indigo"
      },
      {
        name: "CML Kantor Perwakilan",
        stat: formatScore(cmlScopes.kpw),
        compareLabel: "skala 4.00",
        change: `${kpwDiff >= 0 ? "+" : ""}${kpwDiff.toFixed(2)}`,
        changeType: kpwDiff >= 0 ? "positive" : "negative",
        comparisonLabel: `vs rata-rata BI Wide (${formatScore(cmlScopes.biWide)})`,
        subtext: `${cmlScopes.kpwPassingPercent.toFixed(1)}% Satker di atas rata-rata (${cmlScopes.kpwPassingCount}/${cmlScopes.kpwCount})`,
        icon: Users,
        colorClass: "emerald"
      },
      {
        name: "Target CML BI-Wide",
        stat: formatScore(targetMaturity),
        compareLabel: "standard CML",
        change: "ACUAN",
        changeType: "neutral",
        comparisonLabel: "Batas Target CML",
        subtext: "Target Kematangan CML",
        icon: Target,
        colorClass: "violet"
      }
    ];
  }, [cmlScopes, targetMaturity]);

  const iconColors: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
    indigo: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    violet: "bg-violet-500/10 text-violet-500 dark:text-violet-400"
  };

  const borderColors: Record<string, string> = {
    amber: "border-l-4 border-l-amber-500",
    indigo: "border-l-4 border-l-indigo-500",
    emerald: "border-l-4 border-l-emerald-500",
    violet: "border-l-4 border-l-violet-500"
  };


  // 2. Sebaran Distribusi CML berdasarkan Level : Aligned, Engaged, Enable, Empower (Tabular Data)
  const summaryDistribution = useMemo(() => {
    const initLevels = () => ({ Aligned: 0, Engaged: 0, Enable: 0, Empower: 0 });
    const biList = initLevels();
    const kpList = initLevels();
    const kpwList = initLevels();

    begrRecords.forEach(r => {
      const cat = getCmlCategory(r.cultureMaturityLevel);
      biList[cat]++;
      if (r.jenis.toUpperCase() === "KP") {
        kpList[cat]++;
      } else {
        kpwList[cat]++;
      }
    });

    const createScopeData = (name: string, count: number, percent: number, list: typeof biList) => {
      const details = [
        { name: "Aligned", value: list.Aligned, color: "#f43f5e" },
        { name: "Engaged", value: list.Engaged, color: "#fbbf24" },
        { name: "Enable", value: list.Enable, color: "#22c55e" },
        { name: "Empower", value: list.Empower, color: "#3b82f6" }
      ];
      const chartData = details.map(d => ({
        "Level Kematangan": d.name,
        "Jumlah Satker": d.value,
        percentage: count > 0 ? (d.value / count) * 100 : 0
      }));

      return {
        name,
        total: count,
        passingPercent: percent,
        chartData,
        details
      };
    };

    return [
      createScopeData("BI Wide", cmlScopes.biCount, cmlScopes.biPassingPercent, biList),
      createScopeData("Kantor Pusat", cmlScopes.kpCount, cmlScopes.kpPassingPercent, kpList),
      createScopeData("Kantor Perwakilan", cmlScopes.kpwCount, cmlScopes.kpwPassingPercent, kpwList)
    ];
  }, [begrRecords, cmlScopes]);

  // 2.b. Komparasi Kematangan KP vs KPw (Grouped Bar Chart Data)
  const kpKpwComparisonChartData = useMemo(() => {
    const kpList = { Aligned: 0, Engaged: 0, Enable: 0, Empower: 0 };
    const kpwList = { Aligned: 0, Engaged: 0, Enable: 0, Empower: 0 };

    begrRecords.forEach(r => {
      const cat = getCmlCategory(r.cultureMaturityLevel);
      if (r.jenis.toUpperCase() === "KP") {
        kpList[cat]++;
      } else {
        kpwList[cat]++;
      }
    });

    return [
      { name: "Aligned", "Kantor Pusat": kpList.Aligned, "Kantor Perwakilan": kpwList.Aligned },
      { name: "Engaged", "Kantor Pusat": kpList.Engaged, "Kantor Perwakilan": kpwList.Engaged },
      { name: "Enable", "Kantor Pusat": kpList.Enable, "Kantor Perwakilan": kpwList.Enable },
      { name: "Empower", "Kantor Pusat": kpList.Empower, "Kantor Perwakilan": kpwList.Empower }
    ];
  }, [begrRecords]);

  // 2.c. Championship Program (CP) Averages
  const cpChartData = useMemo(() => {
    if (begrRecords.length === 0) return [];
    
    const kpRecs = begrRecords.filter(r => r.jenis.toUpperCase() === "KP");
    const kpwRecs = begrRecords.filter(r => r.jenis.toUpperCase() !== "KP");

    const countAll = begrRecords.length;
    const countKp = kpRecs.length || 1;
    const countKpw = kpwRecs.length || 1;

    const items = [
      {
        name: "SESPI OK x KPP TOP",
        shortName: "SESPI OK",
        "BI Wide": begrRecords.reduce((s, r) => s + r.skorAkhirSespiok, 0) / countAll,
        "Kantor Pusat": kpRecs.reduce((s, r) => s + r.skorAkhirSespiok, 0) / countKp,
        "Kantor Perwakilan": kpwRecs.reduce((s, r) => s + r.skorAkhirSespiok, 0) / countKpw,
        color: "#6366f1"
      },
      {
        name: "AKU KEREN x BTS YUK",
        shortName: "AKU KEREN",
        "BI Wide": begrRecords.reduce((s, r) => s + r.skorAkhirAkukeren, 0) / countAll,
        "Kantor Pusat": kpRecs.reduce((s, r) => s + r.skorAkhirAkukeren, 0) / countKp,
        "Kantor Perwakilan": kpwRecs.reduce((s, r) => s + r.skorAkhirAkukeren, 0) / countKpw,
        color: "#06b6d4"
      },
      {
        name: "ONE BIG FAMILY (OBF)",
        shortName: "OBF",
        "BI Wide": begrRecords.reduce((s, r) => s + r.skorAkhirObf, 0) / countAll,
        "Kantor Pusat": kpRecs.reduce((s, r) => s + r.skorAkhirObf, 0) / countKp,
        "Kantor Perwakilan": kpwRecs.reduce((s, r) => s + r.skorAkhirObf, 0) / countKpw,
        color: "#10b981"
      },
      {
        name: "3H x KEJORA",
        shortName: "3H",
        "BI Wide": begrRecords.reduce((s, r) => s + r.skorAkhir3h, 0) / countAll,
        "Kantor Pusat": kpRecs.reduce((s, r) => s + r.skorAkhir3h, 0) / countKp,
        "Kantor Perwakilan": kpwRecs.reduce((s, r) => s + r.skorAkhir3h, 0) / countKpw,
        color: "#fbbf24"
      },
      {
        name: "PINTER x PASKEUN",
        shortName: "PINTER",
        "BI Wide": begrRecords.reduce((s, r) => s + r.skorAkhirPinter, 0) / countAll,
        "Kantor Pusat": kpRecs.reduce((s, r) => s + r.skorAkhirPinter, 0) / countKp,
        "Kantor Perwakilan": kpwRecs.reduce((s, r) => s + r.skorAkhirPinter, 0) / countKpw,
        color: "#ec4899"
      }
    ];

    return items.map(d => ({
      ...d,
      "BI Wide": parseFloat(d["BI Wide"].toFixed(2)),
      "Kantor Pusat": parseFloat(d["Kantor Pusat"].toFixed(2)),
      "Kantor Perwakilan": parseFloat(d["Kantor Perwakilan"].toFixed(2)),
    }));
  }, [begrRecords]);

  // 3. Rata-rata Skor Employee Value Proposition (EVP - 3 Dimensi) & Pilar (4 Pilar)
  const evpPilarAvgData = useMemo(() => {
    if (begrRecords.length === 0) return [];
    
    const count = begrRecords.length;
    return [
      // EVP
      { parameter: "EVP Kepemimpinan", "Rata-rata Skor": parseFloat((begrRecords.reduce((s, r) => s + r.evpKepemimpinan, 0) / count).toFixed(2)), category: "EVP" },
      { parameter: "EVP Keluarga", "Rata-rata Skor": parseFloat((begrRecords.reduce((s, r) => s + r.evpKeluarga, 0) / count).toFixed(2)), category: "EVP" },
      { parameter: "EVP Kesejahteraan", "Rata-rata Skor": parseFloat((begrRecords.reduce((s, r) => s + r.evpKesejahteraan, 0) / count).toFixed(2)), category: "EVP" },
      // Pilar
      { parameter: "BI Prestasi", "Rata-rata Skor": parseFloat((begrRecords.reduce((s, r) => s + r.biPrestasi, 0) / count).toFixed(2)), category: "Pilar" },
      { parameter: "BI Digital", "Rata-rata Skor": parseFloat((begrRecords.reduce((s, r) => s + r.biDigital, 0) / count).toFixed(2)), category: "Pilar" },
      { parameter: "BI Inovasi", "Rata-rata Skor": parseFloat((begrRecords.reduce((s, r) => s + r.biInovasi, 0) / count).toFixed(2)), category: "Pilar" },
      { parameter: "BI Spiritual", "Rata-rata Skor": parseFloat((begrRecords.reduce((s, r) => s + r.biSpiritual, 0) / count).toFixed(2)), category: "Pilar" }
    ];
  }, [begrRecords]);

  const evpPilarChartData = useMemo(() => {
    return evpPilarAvgData.map(d => ({
      parameter: d.parameter,
      "Skor Aktual": d["Rata-rata Skor"],
      "Target CML": targetMaturity,
      category: d.category
    }));
  }, [evpPilarAvgData, targetMaturity]);

  // Radar Nilai NNS Core Values
  const radarNNSData = useMemo(() => {
    if (begrRecords.length === 0) return [];
    
    let trust = 0, prof = 0, excel = 0, pub = 0, coord = 0;
    begrRecords.forEach(r => {
      trust += r.trustIntegrity;
      prof += r.professionalism;
      excel += r.excellence;
      pub += r.publicInterest;
      coord += r.coordinationTeamwork;
    });
    
    const count = begrRecords.length;
    return [
      { subject: "Trust & Integrity", Skor: parseFloat((trust / count).toFixed(2)) },
      { subject: "Professionalism", Skor: parseFloat((prof / count).toFixed(2)) },
      { subject: "Excellence", Skor: parseFloat((excel / count).toFixed(2)) },
      { subject: "Public Interest", Skor: parseFloat((pub / count).toFixed(2)) },
      { subject: "Coordination", Skor: parseFloat((coord / count).toFixed(2)) }
    ];
  }, [begrRecords]);

  // Sorting Top & Bottom Satkers
  const sortedSatkers = useMemo(() => {
    return [...begrRecords].sort((a, b) => b.cultureMaturityLevel - a.cultureMaturityLevel);
  }, [begrRecords]);

  const topSatkers = useMemo(() => sortedSatkers.slice(0, 3), [sortedSatkers]);
  const bottomSatkers = useMemo(() => [...sortedSatkers].reverse().slice(0, 3), [sortedSatkers]);

  if (begrRecords.length === 0) {
    const isSyncing = (window as any).isSyncing;
    return (
      <div className="py-16 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 p-8 text-center shadow-sm">
        {isSyncing ? (
          <>
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            <h3 className="text-lg font-semibold text-slate-855 dark:text-slate-100 font-sans">Memuat Database...</h3>
            <p className="text-slate-400 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
              Sedang mengambil data terbaru dari Google Sheets. Mohon tunggu sebentar.
            </p>
          </>
        ) : (
          <>
            <Compass className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold text-slate-855 dark:text-slate-100 font-sans">Database Budaya Kerja Kosong</h3>
            <p className="text-slate-400 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
              Belum menemukan data di sheet "KONSOL BEGR" atau inisialisasi sheet belum dijalankan.
            </p>
            <button 
              onClick={() => setActiveTab("settings")}
              className="mt-6 px-4 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs rounded-xl transition cursor-pointer"
            >
              Konfigurasi System
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-0">
      <div data-print-page="1" className="space-y-6">
      
      {/* A.1. THREE SCOPE CML AVERAGES CARDS (Tremor-Style) */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((item) => {
          return (
            <div 
              key={item.name} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <dt className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {item.name}
                  </dt>
                </div>
                <dd className="mt-1 flex items-baseline space-x-2">
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
                    {item.stat}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {item.compareLabel}
                  </p>
                </dd>
              </div>
              <dd className="mt-3 flex flex-col gap-1 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center space-x-1.5">
                  <p className="flex items-center">
                    {item.changeType === 'positive' ? (
                      <svg className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 8l6 6H6z" />
                      </svg>
                    ) : item.changeType === 'negative' ? (
                      <svg className="size-4 shrink-0 text-rose-600 dark:text-rose-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 16l-6-6h12z" />
                      </svg>
                    ) : (
                      <span className="size-4 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Target className="w-3 h-3" />
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold font-sans ${
                        item.changeType === 'positive'
                          ? 'text-emerald-600 dark:text-emerald-500'
                          : item.changeType === 'negative'
                          ? 'text-rose-600 dark:text-rose-500'
                          : 'text-violet-600 dark:text-violet-400'
                      }`}
                    >
                      {item.change}
                    </span>
                  </p>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                    {item.comparisonLabel}
                  </p>
                </div>
                <div className="text-[11.5px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">
                  {item.subtext}
                </div>
              </dd>
            </div>
          );
        })}
      </dl>

      {/* A.2. SEBARAN CML & RATA-RATA EVP/PILAR (BARIS 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribusi CML Stacked Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col mb-4 border-b border-slate-50 dark:border-slate-850 pb-2.5">
              <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Sebaran Distribusi Level Kematangan CML</h3>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Konsistensi spektrum warna: Aligned (Rose-Red), Engaged (Amber-Yellow), Enable (Green), Empower (Blue)</p>
            </div>

            {/* Custom Tabs List (Tremor-Style) */}
            <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
              {summaryDistribution.map((tab, idx) => {
                const isActive = activeTabDist === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTabDist(tab.name)}
                    className={`flex-1 text-left p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition cursor-pointer relative ${
                      isActive 
                        ? "bg-slate-50/70 dark:bg-slate-850/40 border-b-2 border-b-amber-500" 
                        : "border-b border-transparent"
                    } ${idx < summaryDistribution.length - 1 ? "border-r border-slate-200 dark:border-slate-800" : ""}`}
                  >
                    <span className="text-[11.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {tab.name}
                    </span>
                    <span className="text-lg font-extrabold text-slate-855 dark:text-slate-100 block mt-1 leading-none">
                      {tab.total} <span className="text-[11.5px] font-normal text-slate-455 dark:text-slate-555">Satker</span>
                    </span>
                    <span className="text-[11.5px] font-bold mt-1.5 block leading-none">
                      <span className="text-emerald-600 dark:text-emerald-500">
                        {tab.passingPercent.toFixed(1)}%
                      </span>{" "}
                      <span className="text-slate-400 dark:text-slate-500">di atas rata-rata</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Region Data Render */}
            {(() => {
              const selectedRegion = summaryDistribution.find(r => r.name === activeTabDist) || summaryDistribution[0];
              return (
                <div>
                  <div className="h-44 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart
                        data={selectedRegion.chartData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                        <XAxis dataKey="Level Kematangan" tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Jumlah Satker" radius={[4, 4, 0, 0]}>
                          {selectedRegion.details.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <ul role="list" className="mt-4 divide-y divide-slate-100 dark:divide-slate-855/60 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {selectedRegion.details.map((item) => {
                      const percentage = selectedRegion.total > 0 ? (item.value / selectedRegion.total) * 100 : 0;
                      return (
                        <li key={item.name} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-2.5 h-2.5 rounded-xs shrink-0"
                              style={{ backgroundColor: item.color }}
                              aria-hidden={true}
                            />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                          </div>
                          <span className="text-slate-900 dark:text-slate-100 font-extrabold text-sm">
                            {item.value} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Satker</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">({percentage.toFixed(1)}%)</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}
          </div>
        </div>

        {/* EVP & PILAR AVERAGES GAGAH */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="w-full flex-1 flex flex-col justify-between">
            <div className="flex flex-col mb-4 border-b border-slate-50 dark:border-slate-850 pb-2.5">
              <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Rata-Rata EVP & Pilar Budaya Kerja</h3>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Nilai agregat 3 Dimensi EVP dan 4 Pilar Budaya Kerja BI Wide</p>
            </div>

            <div className="h-64 w-full flex-1 min-h-[240px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={evpPilarChartData}
                  margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                  <XAxis dataKey="parameter" interval={0} tickFormatter={(v) => v.replace("EVP ", "").replace("BI ", "")} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} />
                  <YAxis 
                    domain={isYAxisDynamic ? [dataMin => Math.max(0, dataMin - 0.2), dataMax => Math.min(4, dataMax + 0.2)] : [0, 4]} 
                    tick={{ fill: "#64748b", fontSize: 11.5 }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Bar dataKey="Skor Aktual" radius={[4, 4, 0, 0]}>
                    {evpPilarChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-aktual-${index}`} 
                        fill={entry.category === "EVP" ? "#6366f1" : "#06b6d4"} 
                      />
                    ))}
                  </Bar>
                  
                  {showTargetComparison ? (
                    <Bar dataKey="Target CML" fill="#94a3b8" opacity={0.35} radius={[4, 4, 0, 0]} />
                  ) : (
                    <ReferenceLine y={targetMaturity} stroke="#f59e0b" strokeDasharray="3 3" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
            <div className="flex items-center space-x-3">
              <button
                role="switch"
                aria-checked={showTargetComparison}
                onClick={() => setShowTargetComparison(!showTargetComparison)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showTargetComparison ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    showTargetComparison ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <label 
                className="text-xs font-extrabold text-slate-500 dark:text-slate-400 select-none cursor-pointer"
                onClick={() => setShowTargetComparison(!showTargetComparison)}
              >
                Bandingkan berdampingan dengan Target CML ({formatScore(targetMaturity)})
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <button
                role="switch"
                aria-checked={isYAxisDynamic}
                onClick={() => setIsYAxisDynamic(!isYAxisDynamic)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isYAxisDynamic ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isYAxisDynamic ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <label 
                className="text-xs font-extrabold text-slate-500 dark:text-slate-400 select-none cursor-pointer"
                onClick={() => setIsYAxisDynamic(!isYAxisDynamic)}
              >
                Skala Sumbu Y Dinamis (Auto Fit)
              </label>
            </div>
          </div>
        </div>

      </div>
      </div>

      <div data-print-page="2" className="space-y-6">
      {/* A.3. RADAR NNS & KOMPARASI KP VS KPW (BARIS 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Radar NNS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-5">
            <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Radar Nilai-Nilai Strategis</h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 font-semibold">Gambaran terbangunnya perilaku utama NNS</p>
          </div>

          <div className="h-[300px] w-full flex items-center justify-center relative min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarNNSData}>
                <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800/25" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11, fontWeight: "800" }} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: "#94a3b8", fontSize: 9.5, fontWeight: "600" }} axisLine={false} tickLine={false} />
                <Radar name="Nilai Rata-rata" dataKey="Skor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Komparasi Kematangan KP vs KPw (Grouped Bar Chart Baru) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-50 dark:border-slate-850 pb-2.5 mb-4">
            <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Komparasi Culture Maturity Level KP vs KPw</h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Distribusi level CML berdasarkan kelompok wilayah</p>
          </div>

          <ul role="list" className="flex gap-10 mb-6 text-sm font-semibold text-slate-550 dark:text-slate-400">
            <li>
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs bg-[#3b82f6] dark:bg-[#3b82f6]"
                  aria-hidden={true}
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Kantor Pusat
                </p>
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                <p className="text-lg font-extrabold text-slate-855 dark:text-slate-100 font-sans leading-none">
                  {cmlScopes.kpCount} <span className="text-xs text-slate-455 dark:text-slate-555 font-normal">Satker</span>
                </p>
                <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/25 px-1.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-450">
                  {cmlScopes.kpPassingPercent.toFixed(0)}% di atas rata-rata
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs bg-[#06b6d4] dark:bg-[#06b6d4]"
                  aria-hidden={true}
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Kantor Perwakilan
                </p>
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                <p className="text-lg font-extrabold text-slate-855 dark:text-slate-100 font-sans leading-none">
                  {cmlScopes.kpwCount} <span className="text-xs text-slate-455 dark:text-slate-555 font-normal">Satker</span>
                </p>
                <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/25 px-1.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-450">
                  {cmlScopes.kpwPassingPercent.toFixed(0)}% di atas rata-rata
                </span>
              </div>
            </li>
          </ul>

          <div className="h-64 w-full relative min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={kpKpwComparisonChartData}
                margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11, fontWeight: "bold" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Kantor Pusat" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Kantor Perwakilan" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* A.4. CHAMPIONSHIP PROGRAM (CP) AVERAGES PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Chart (3/5 cols) */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 border-b border-slate-50 dark:border-slate-850 pb-2.5">
              <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Rata-Rata Skor per Championship Program (CP)</h3>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Rata-rata skor akhir BI Wide, Kantor Pusat (KP), dan Kantor Perwakilan (KPw) untuk 5 Championship Program</p>
            </div>
            <div className="h-68 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={cpChartData}
                  margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                  <XAxis dataKey="shortName" tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[dataMin => Math.max(0, parseFloat((dataMin - 0.2).toFixed(2))), dataMax => Math.min(4, parseFloat((dataMax + 0.2).toFixed(2)))]} tick={{ fill: "#64748b", fontSize: 11.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                  <Bar dataKey="BI Wide" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Kantor Perwakilan" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Kantor Pusat" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table (2/5 cols) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="w-full">
            <div className="mb-4 border-b border-slate-50 dark:border-slate-850 pb-2.5">
              <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Rangkuman Kinerja CP</h3>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Tabel perbandingan nilai rata-rata program budaya</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5">Program</th>
                    <th className="py-2.5 text-center">BI Wide</th>
                    <th className="py-2.5 text-center">KPw</th>
                    <th className="py-2.5 text-center">KP</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {cpChartData.map((entry, index) => (
                    <tr key={index} className="border-b border-slate-50 dark:border-slate-800/30 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="font-extrabold text-slate-700 dark:text-slate-200 truncate text-[11.5px]" title={entry.name}>{entry.shortName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-extrabold font-sans text-[11px] text-amber-600 dark:text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded">
                          {entry["BI Wide"].toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-extrabold font-sans text-[11px] text-emerald-600 dark:text-emerald-450 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                          {entry["Kantor Perwakilan"].toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-extrabold font-sans text-[11px] text-indigo-600 dark:text-indigo-450 bg-indigo-500/5 px-1.5 py-0.5 rounded">
                          {entry["Kantor Pusat"].toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div data-print-page="3" className="space-y-6">
      {/* TOP/BOTTOM PERFORMERS - 2 COLUMN GRID AT THE BOTTOM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 3 Satkers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-5">
            <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Top 3 BI Wide</h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 font-semibold">Satker dengan Culture Maturity Level Tertinggi</p>
          </div>
          
          <div className="space-y-4">
            {topSatkers.map((satker, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              // Border and background highlighting representing premium ranks (without medals/trophies)
              let borderHighlightClass = "";
              let cardBgClass = "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 shadow-xs";
              let rankLabel = "";
              let rankLabelColor = "";
              
              if (isFirst) {
                borderHighlightClass = "";
                cardBgClass = "bg-gradient-to-r from-amber-500/[0.03] to-transparent dark:from-amber-550/[0.02] dark:to-transparent border-slate-200 dark:border-slate-800 shadow-xs";
                rankLabel = "PERINGKAT I (UTAMA)";
                rankLabelColor = "text-amber-600 dark:text-amber-500";
              } else if (isSecond) {
                borderHighlightClass = "";
                rankLabel = "PERINGKAT II";
                rankLabelColor = "text-slate-555 dark:text-slate-400";
              } else if (isThird) {
                borderHighlightClass = "";
                rankLabel = "PERINGKAT III";
                rankLabelColor = "text-[#cc8548] dark:text-[#dd9659]";
              }

              const cat = getCmlCategory(satker.cultureMaturityLevel);
              const catColor = getCmlColor(cat);

              return (
                <div 
                  key={satker.no} 
                  className={`group relative overflow-hidden flex flex-col p-4 border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default ${cardBgClass} ${borderHighlightClass}`}
                >
                  {/* Watermark Number */}
                  <span className="absolute -right-1 -bottom-4 text-7xl font-black font-sans text-slate-100/60 dark:text-slate-800/20 pointer-events-none select-none tracking-tighter opacity-70 group-hover:scale-105 group-hover:text-slate-200/50 dark:group-hover:text-slate-850/35 transition-all duration-300 z-0">
                    {`0${index + 1}`}
                  </span>

                  <div className="relative z-10 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      {/* Rank Label */}
                      <span className={`text-[11.5px] font-extrabold tracking-widest uppercase block mb-1 ${rankLabelColor}`}>
                        {rankLabel}
                      </span>
                      {/* Satker Name */}
                      <p className={`font-extrabold text-slate-855 dark:text-slate-100 truncate leading-normal group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors ${isFirst ? "text-[15px]" : "text-[14px]"}`}>
                        {satker.satkerLengkap}
                      </p>
                      {/* Sub-info */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11.5px] text-slate-400 font-sans uppercase tracking-tight">
                          {satker.kelompokBudker} • {satker.rubrik}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: catColor }}>
                          {cat}
                        </span>
                      </div>
                    </div>

                    {/* CML Score Badge */}
                    <div className="flex flex-col items-end shrink-0 pl-3">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-450 font-sans bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-xl shadow-xs border border-emerald-500/10">
                        {formatScore(satker.cultureMaturityLevel)}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">CML Score</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom 3 Satkers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-5">
            <h3 className="text-base font-bold font-sans text-slate-855 dark:text-slate-100 tracking-tight">Bottom 3 BI Wide</h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 font-semibold">Satker prioritas penguatan Budaya Kerja</p>
          </div>

          <div className="space-y-4">
            {bottomSatkers.map((satker, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              // Border and background highlighting representing priority ranks
              let borderHighlightClass = "";
              let cardBgClass = "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 shadow-xs";
              let priorityLabel = "";
              let priorityLabelColor = "";
              
              if (isFirst) {
                borderHighlightClass = "";
                cardBgClass = "bg-gradient-to-r from-rose-500/[0.03] to-transparent dark:from-rose-550/[0.02] dark:to-transparent border-slate-200 dark:border-slate-800 shadow-xs";
                priorityLabel = "PRIORITAS I (KRITIS)";
                priorityLabelColor = "text-rose-600 dark:text-rose-500";
              } else if (isSecond) {
                borderHighlightClass = "";
                priorityLabel = "PRIORITAS II";
                priorityLabelColor = "text-amber-600 dark:text-amber-500";
              } else if (isThird) {
                borderHighlightClass = "";
                priorityLabel = "PRIORITAS III";
                priorityLabelColor = "text-yellow-600 dark:text-yellow-500";
              }

              const cat = getCmlCategory(satker.cultureMaturityLevel);
              const catColor = getCmlColor(cat);

              return (
                <div 
                  key={satker.no} 
                  className={`group relative overflow-hidden flex flex-col p-4 border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default ${cardBgClass} ${borderHighlightClass}`}
                >
                  {/* Watermark Number */}
                  <span className="absolute -right-1 -bottom-4 text-7xl font-black font-sans text-slate-100/60 dark:text-slate-800/20 pointer-events-none select-none tracking-tighter opacity-70 group-hover:scale-105 group-hover:text-slate-200/50 dark:group-hover:text-slate-850/35 transition-all duration-300 z-0">
                    {`0${index + 1}`}
                  </span>

                  <div className="relative z-10 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      {/* Priority Label */}
                      <span className={`text-[11.5px] font-extrabold tracking-widest uppercase block mb-1 ${priorityLabelColor}`}>
                        {priorityLabel}
                      </span>
                      {/* Satker Name */}
                      <p className={`font-extrabold text-slate-855 dark:text-slate-100 truncate leading-normal group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors ${isFirst ? "text-[15px]" : "text-[14px]"}`}>
                        {satker.satkerLengkap}
                      </p>
                      {/* Sub-info */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11.5px] text-slate-400 font-sans uppercase tracking-tight">
                          {satker.kelompokBudker} • {satker.rubrik}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: catColor }}>
                          {cat}
                        </span>
                      </div>
                    </div>

                    {/* CML Score Badge */}
                    <div className="flex flex-col items-end shrink-0 pl-3">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-450 font-sans bg-rose-500/10 dark:bg-rose-500/20 px-2.5 py-1 rounded-xl shadow-xs border border-rose-500/10">
                        {formatScore(satker.cultureMaturityLevel)}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">CML Score</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER QUICK REDIRECT */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/70 dark:from-slate-900/60 dark:to-slate-900/20 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs" data-print-hide>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-855 dark:text-slate-100 uppercase tracking-wider mb-1.5">Eksplorasi Matriks Budaya Kerja</h4>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-semibold">
              Akses modul <strong className="font-extrabold text-slate-750 dark:text-slate-200">Peringkat Satker</strong> untuk evaluasi performansi relatif antarunit, atau modul <strong className="font-extrabold text-slate-750 dark:text-slate-200">Analisis Unit</strong> untuk visualisasi ulasan komparatif 360-derajat pada satuan kerja tertentu.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
          <button 
            onClick={() => setActiveTab("ranking")}
            className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-slate-700 dark:text-slate-300 text-xs rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span>Peringkat Satker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setActiveTab("satker-detail")}
            className="px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span>Analisis Unit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      </div>

    </div>
  );
}
