import React, { useState, useMemo } from "react";
import { 
  getBegrData, 
  getPengaturanData, 
  formatScore,
  getCmlCategory,
  getCmlColor,
  BegrRecord
} from "../../data/dataUtils";
import { 
  Award, 
  TrendingUp, 
  Target, 
  Users, 
  Zap, 
  Heart, 
  Building,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  FileText,
  Printer,
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Filter,
  AlertCircle,
  X
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
  Cell,
  ReferenceLine,
  PieChart,
  Pie
} from "recharts";
import { CustomTooltip } from "../ui/custom-tooltip";
import { motion } from 'motion/react';
import { captureAndPrint } from "../../lib/printHelper";

export function ReportView() {
  const begrRecords = useMemo(() => getBegrData(), []);
  const { targetMaturity } = useMemo(() => getPengaturanData(), []);

  // Filter Scope: BI Wide, Kantor Pusat (KP), Kantor Perwakilan (KPw)
  const [selectedScope, setSelectedScope] = useState<"BI Wide" | "KP" | "KPw">("BI Wide");

  // Filter Dimensi Strategis: "Semua" | "EVP" | "Pilar"
  const [selectedDimensionType, setSelectedDimensionType] = useState<"Semua" | "EVP" | "Pilar">("Semua");

  // Table States
  const [searchTerm, setSearchTerm] = useState("");
  const [tableSortField, setTableSortField] = useState<string>("cultureMaturityLevel");
  const [tableSortAsc, setTableSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Semua");
  const [copiedState, setCopiedState] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Filtered records based on active scope
  const scopedRecords = useMemo(() => {
    if (selectedScope === "KP") {
      return begrRecords.filter(r => r.jenis.toUpperCase() === "KP");
    } else if (selectedScope === "KPw") {
      return begrRecords.filter(r => r.jenis.toUpperCase() !== "KP");
    }
    return begrRecords;
  }, [begrRecords, selectedScope]);

  // Calculations for general report KPIs
  const reportStats = useMemo(() => {
    if (scopedRecords.length === 0) {
      return {
        avgCml: 0,
        complianceRate: 0,
        avgEngagement: 0,
        avgNnsImpact: 0,
        totalCount: 0,
        passCount: 0,
        failCount: 0,
        alignedCount: 0,
        engagedCount: 0,
        enableCount: 0,
        empowerCount: 0
      };
    }

    const totalCml = scopedRecords.reduce((sum, r) => sum + r.cultureMaturityLevel, 0);
    const avgCml = totalCml / scopedRecords.length;

    const passCount = scopedRecords.filter(r => r.cultureMaturityLevel >= targetMaturity).length;
    const complianceRate = (passCount / scopedRecords.length) * 100;

    const avgEngagement = scopedRecords.reduce((sum, r) => sum + r.averageKeterlibatan, 0) / scopedRecords.length;
    const avgNnsImpact = scopedRecords.reduce((sum, r) => sum + r.averageDampakNns, 0) / scopedRecords.length;

    let alignedCount = 0;
    let engagedCount = 0;
    let enableCount = 0;
    let empowerCount = 0;

    scopedRecords.forEach(r => {
      const cat = getCmlCategory(r.cultureMaturityLevel);
      if (cat === "Aligned") alignedCount++;
      else if (cat === "Engaged") engagedCount++;
      else if (cat === "Enable") enableCount++;
      else if (cat === "Empower") empowerCount++;
    });

    return {
      avgCml,
      complianceRate,
      avgEngagement,
      avgNnsImpact,
      totalCount: scopedRecords.length,
      passCount,
      failCount: scopedRecords.length - passCount,
      alignedCount,
      engagedCount,
      enableCount,
      empowerCount
    };
  }, [scopedRecords, targetMaturity]);

  // Dimension Performance: EVP and BI Pillars average scores
  const dimensionData = useMemo(() => {
    if (scopedRecords.length === 0) return [];

    const counts = scopedRecords.length;
    
    // EVPs
    const evpKep = scopedRecords.reduce((sum, r) => sum + r.evpKepemimpinan, 0) / counts;
    const evpKel = scopedRecords.reduce((sum, r) => sum + r.evpKeluarga, 0) / counts;
    const evpKes = scopedRecords.reduce((sum, r) => sum + r.evpKesejahteraan, 0) / counts;

    // BI Pillars
    const pilPrestasi = scopedRecords.reduce((sum, r) => sum + r.biPrestasi, 0) / counts;
    const pilDigital = scopedRecords.reduce((sum, r) => sum + r.biDigital, 0) / counts;
    const pilInovasi = scopedRecords.reduce((sum, r) => sum + r.biInovasi, 0) / counts;
    const pilSpiritual = scopedRecords.reduce((sum, r) => sum + r.biSpiritual, 0) / counts;

    return [
      { name: "EVP Kepemimpinan", score: evpKep, type: "EVP", fill: "#f59e0b" },
      { name: "EVP Keluarga", score: evpKel, type: "EVP", fill: "#f59e0b" },
      { name: "EVP Kesejahteraan", score: evpKes, type: "EVP", fill: "#f59e0b" },
      { name: "BI Prestasi", score: pilPrestasi, type: "Pilar", fill: "#3b82f6" },
      { name: "BI Digital", score: pilDigital, type: "Pilar", fill: "#3b82f6" },
      { name: "BI Inovasi", score: pilInovasi, type: "Pilar", fill: "#3b82f6" },
      { name: "BI Spiritual", score: pilSpiritual, type: "Pilar", fill: "#3b82f6" }
    ];
  }, [scopedRecords]);

  // Filtered Dimension Data based on type selection
  const filteredDimensionData = useMemo(() => {
    if (selectedDimensionType === "Semua") return dimensionData;
    return dimensionData.filter(d => d.type === selectedDimensionType);
  }, [dimensionData, selectedDimensionType]);

  // Dimension Performance Insights
  const dimensionInsights = useMemo(() => {
    if (dimensionData.length === 0) return null;
    
    // Highest Dimension
    const sorted = [...dimensionData].sort((a, b) => b.score - a.score);
    const highest = sorted[0];
    
    // Lowest Dimension
    const lowest = sorted[sorted.length - 1];
    
    // Average score of all dimensions
    const avgScore = dimensionData.reduce((sum, d) => sum + d.score, 0) / dimensionData.length;
    const gapToTarget = avgScore - targetMaturity;

    return {
      highest,
      lowest,
      avgScore,
      gapToTarget
    };
  }, [dimensionData, targetMaturity]);

  // Top 3 and Bottom 3 Satker Performers by CML Score
  const performanceHighlights = useMemo(() => {
    if (scopedRecords.length === 0) return { top: [], bottom: [] };

    const sorted = [...scopedRecords].sort((a, b) => b.cultureMaturityLevel - a.cultureMaturityLevel);
    const top = sorted.slice(0, 3);
    const bottom = sorted.length > 3 ? sorted.slice(sorted.length - 3).reverse() : [...sorted].reverse();

    return { top, bottom };
  }, [scopedRecords]);

  // Program-Specific Performance Metrics
  const programMetrics = useMemo(() => {
    if (scopedRecords.length === 0) return [];

    const calculateProgramAvg = (
      scoreKey: keyof BegrRecord, 
      engageKey: keyof BegrRecord, 
      name: string,
      color: string
    ) => {
      const validRecords = scopedRecords.filter(r => typeof r[scoreKey] === "number" && r[scoreKey] as number > 0);
      const count = validRecords.length || 1;
      
      const avgScore = validRecords.reduce((sum, r) => sum + (r[scoreKey] as number), 0) / count;
      const avgEngage = validRecords.reduce((sum, r) => sum + (r[engageKey] as number), 0) / count;

      return {
        name,
        averageScore: avgScore,
        averageEngagement: avgEngage,
        activeSatkers: validRecords.length,
        color
      };
    };

    return [
      { ...calculateProgramAvg("skorAkhirSespiok", "keterlibatanSespiok", "SESPI OK x KPP TOP", "#6366f1") },
      { ...calculateProgramAvg("skorAkhirAkukeren", "keterlibatanAkukeren", "AKU KEREN x BTS YUK", "#06b6d4") },
      { ...calculateProgramAvg("skorAkhirObf", "keterlibatanObf", "ONE BIG FAMILY (OBF)", "#10b981") },
      { ...calculateProgramAvg("skorAkhir3h", "keterlibatan3h", "3H x KEJORA", "#fbbf24") },
      { ...calculateProgramAvg("skorAkhirPinter", "keterlibatanPinter", "PINTER x PASKEUN", "#ec4899") }
    ];
  }, [scopedRecords]);

  // CML Category mapping with colors & descriptions
  const categoriesMap = [
    { name: "Aligned", count: reportStats.alignedCount, range: "< 1.50", color: "#f43f5e", desc: "Membentuk keselarasan dasar budaya kerja" },
    { name: "Engaged", count: reportStats.engagedCount, range: "1.50 - 2.50", color: "#fbbf24", desc: "Keterlibatan aktif dalam implementasi program" },
    { name: "Enable", count: reportStats.enableCount, range: "2.50 - 3.50", color: "#22c55e", desc: "Berdaya mandiri melaksanakan nilai-nilai luhur" },
    { name: "Empower", count: reportStats.empowerCount, range: "3.50 - 4.00", color: "#3b82f6", desc: "Tingkat kemandirian budaya yang lestari & optimal" }
  ];

  // Pie chart data for CML distribution
  const pieData = useMemo(() => {
    return [
      { name: "Aligned", value: reportStats.alignedCount, color: "#f43f5e" },
      { name: "Engaged", value: reportStats.engagedCount, color: "#fbbf24" },
      { name: "Enable", value: reportStats.enableCount, color: "#22c55e" },
      { name: "Empower", value: reportStats.empowerCount, color: "#3b82f6" }
    ].filter(item => item.value > 0);
  }, [reportStats]);

  // Bento Grid KPI Laporan Utama (Menggunakan desain KPI yang ada di halaman overview)
  const kpiData = useMemo(() => {
    const cmlDiff = reportStats.avgCml - targetMaturity;

    return [
      {
        name: "Average Maturity Level (CML)",
        stat: formatScore(reportStats.avgCml),
        compareLabel: "skala 4.00",
        change: `${cmlDiff >= 0 ? "+" : ""}${cmlDiff.toFixed(2)}`,
        changeType: cmlDiff >= 0 ? "positive" : "negative",
        comparisonLabel: `vs rata-rata BI Wide (${formatScore(targetMaturity)})`,
        subtext: reportStats.avgCml >= targetMaturity ? "Di Atas Rata-rata CML" : "Di Bawah Rata-rata CML",
        icon: Award,
        colorClass: "amber"
      },
      {
        name: "% Satker di atas rata-rata",
        stat: `${reportStats.complianceRate.toFixed(1)}%`,
        compareLabel: "di atas rata-rata",
        change: `${reportStats.passCount} Satker`,
        changeType: "neutral",
        comparisonLabel: "di atas rata-rata CML",
        subtext: `${reportStats.passCount} dari ${reportStats.totalCount} Satker di atas rata-rata`,
        icon: Target,
        colorClass: "indigo"
      },
      {
        name: "Average Engagement Score",
        stat: formatScore(reportStats.avgEngagement),
        compareLabel: "skala 4.00",
        change: "AKTIF",
        changeType: "positive",
        comparisonLabel: "partisipasi program",
        subtext: "Keterlibatan Program Kebudayaan",
        icon: Users,
        colorClass: "emerald"
      },
      {
        name: "Average NNS Impact",
        stat: formatScore(reportStats.avgNnsImpact),
        compareLabel: "skala 4.00",
        change: "DAMPAK",
        changeType: "positive",
        comparisonLabel: "kontribusi korporasi",
        subtext: "Dampak Nilai-Nilai Strategis",
        icon: Zap,
        colorClass: "violet"
      }
    ];
  }, [reportStats, targetMaturity]);

  // Detailed Table records filtering, sorting, and pagination
  const filteredAndSortedTableRecords = useMemo(() => {
    let result = [...scopedRecords];

    // Search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.satkerLengkap.toLowerCase().includes(q) || 
        r.satker.toLowerCase().includes(q) ||
        r.kelompokBudker?.toLowerCase().includes(q) ||
        r.rubrik?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategoryFilter !== "Semua") {
      result = result.filter(r => getCmlCategory(r.cultureMaturityLevel) === selectedCategoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[tableSortField as keyof BegrRecord];
      let valB: any = b[tableSortField as keyof BegrRecord];

      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (typeof valA === "string" && typeof valB === "string") {
        return tableSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return tableSortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [scopedRecords, searchTerm, selectedCategoryFilter, tableSortField, tableSortAsc]);

  // Paginated table records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedTableRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedTableRecords, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedTableRecords.length / rowsPerPage) || 1;

  const handleSort = (field: string) => {
    if (tableSortField === field) {
      setTableSortAsc(!tableSortAsc);
    } else {
      setTableSortField(field);
      setTableSortAsc(false);
    }
    setCurrentPage(1);
  };

  // Clipboard export helper (Google Sheets compatible TAB format)
  const handleCopyToClipboard = () => {
    let text = "No\tSatuan Kerja\tJenis\tRubrik\tKelompok\tCML Score\tKategori\tSESPI OK\tAKU KEREN\tOBF\t3H\tPINTER\n";
    
    filteredAndSortedTableRecords.forEach((r, idx) => {
      const cat = getCmlCategory(r.cultureMaturityLevel);
      text += `${idx + 1}\t${r.satkerLengkap}\t${r.jenis}\t${r.rubrik}\t${r.kelompokBudker}\t${r.cultureMaturityLevel.toFixed(2)}\t${cat}\t${r.skorAkhirSespiok.toFixed(2)}\t${r.skorAkhirAkukeren.toFixed(2)}\t${r.skorAkhirObf.toFixed(2)}\t${r.skorAkhir3h.toFixed(2)}\t${r.skorAkhirPinter.toFixed(2)}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    });
  };

  // Modern print handler with beautiful loading feedback
  const handlePrintReport = async () => {
    try {
      setIsPrinting(true);
      await captureAndPrint("main-content", `Laporan-KPI-Konsolidasi-${selectedScope.replace(" ", "-")}`);
    } catch (err) {
      console.error("Print report error:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Controls / Slicer & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs select-none print:hidden">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Filter Cakupan Laporan</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Saring data agregasi untuk memfokuskan ringkasan laporan eksekutif</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented control scope */}
          <div className="relative flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            {(["BI Wide", "KP", "KPw"] as const).map((scope) => {
              const isActive = selectedScope === scope;
              return (
                <button
                  key={scope}
                  onClick={() => {
                    setSelectedScope(scope);
                    setCurrentPage(1);
                  }}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap z-10 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeScopeReport"
                      className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {scope === "BI Wide" ? "BI Wide" : scope === "KP" ? "Kantor Pusat" : "Kantor Perwakilan"}
                </button>
              );
            })}
          </div>

          {/* Premium PDF Export Button */}
          <button
            onClick={handlePrintReport}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-2 bg-[#233C4B] hover:bg-[#1a2d39] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className={`w-4 h-4 ${isPrinting ? "animate-pulse" : ""}`} />
            <span>{isPrinting ? "Menyiapkan PDF..." : "Ekspor PDF / Cetak"}</span>
          </button>
        </div>
      </div>

      {/* Bento Grid KPI Laporan Utama */}
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
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-55 font-sans">
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
                      <span className="size-4 flex items-center justify-center text-[#233C4B] dark:text-slate-300">
                        <Target className="w-3 h-3" />
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold font-sans ${
                        item.changeType === 'positive'
                          ? 'text-emerald-600 dark:text-emerald-500'
                          : item.changeType === 'negative'
                          ? 'text-rose-600 dark:text-rose-500'
                          : 'text-[#233C4B] dark:text-slate-300'
                      }`}
                    >
                      {item.change}
                    </span>
                  </p>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                    {item.comparisonLabel}
                  </p>
                </div>
                <div className="text-[11.5px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {item.subtext}
                </div>
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Bar Chart: EVP vs Pilar BI Comparison - REDESIGNED PREMIUM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xs transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Matriks Dimensi Strategis: EVP vs Pilar Budaya</h3>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Analisis perbandingan skor rata-rata pilar kebudayaan internal dan kesejahteraan pegawai</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:self-center">
            {/* Filter Dimensi Segmented Buttons */}
            <div className="relative flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-250/30 dark:border-slate-700/50">
              {(["Semua", "EVP", "Pilar"] as const).map((type) => {
                const isActive = selectedDimensionType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedDimensionType(type)}
                    className={`relative px-3 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer whitespace-nowrap z-10 ${
                      isActive
                        ? "text-amber-500 dark:text-amber-400"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeDimensionReport"
                        className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {type === "Semua" ? "Semua Dimensi" : type === "EVP" ? "Hanya EVP" : "Hanya Pilar"}
                  </button>
                );
              })}
            </div>

            {/* Custom Premium Legend */}
            <div className="flex items-center gap-4 text-[9px] font-extrabold border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-xs bg-gradient-to-tr from-amber-600 to-amber-400"></div>
                <span className="text-slate-600 dark:text-slate-400">EVP Pegawai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-xs bg-gradient-to-tr from-blue-600 to-blue-400"></div>
                <span className="text-slate-600 dark:text-slate-400">Pilar Budaya BI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-80 w-full mt-4 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={filteredDimensionData} margin={{ top: 25, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="evpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="pilarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
              <XAxis 
                dataKey="name" 
                interval={0}
                tickFormatter={(v) => v.replace("EVP ", "").replace("BI ", "")}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#64748b", fontSize: 9, fontWeight: "bold" }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                domain={[dataMin => Math.max(0, parseFloat((dataMin - 0.2).toFixed(2))), dataMax => Math.min(4, parseFloat((dataMax + 0.2).toFixed(2)))]}
                tick={{ fill: "#64748b", fontSize: 9, fontWeight: "bold" }}
                tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)", radius: [8, 8, 0, 0] }} />
              <ReferenceLine 
                y={targetMaturity} 
                stroke="#f43f5e" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: `Target CML (${formatScore(targetMaturity)})`, 
                  fill: "#f43f5e", 
                  fontSize: 8.5, 
                  fontWeight: "black", 
                  position: "top",
                  offset: 8
                }} 
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={45}>
                {filteredDimensionData.map((entry, index) => {
                  const barFill = entry.type === "EVP" ? "url(#evpGrad)" : "url(#pilarGrad)";
                  return <Cell key={`cell-${index}`} fill={barFill} className="transition-all duration-300 hover:opacity-90" />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Strategic Analysis Sidebar/Widgets below the Chart */}
        {dimensionInsights && (
          <div className="mt-6 pt-5 border-t border-slate-150 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Insight 1: Highest */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 p-3.5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Dimensi Terkuat (Aset Utama)</span>
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-2 truncate">
                  {dimensionInsights.highest?.name}
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Memiliki tingkat kematangan kebudayaan paling optimal di Bank Indonesia</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">Skor Rata-Rata</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black font-sans rounded-md">
                  {formatScore(dimensionInsights.highest?.score)}
                </span>
              </div>
            </div>

            {/* Insight 2: Lowest (Needs Support) */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 p-3.5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Area Prioritas Pendampingan</span>
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-2 truncate">
                  {dimensionInsights.lowest?.name}
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Memerlukan intervensi strategis dan penguatan implementasi lapangan</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">Skor Rata-Rata</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black font-sans rounded-md">
                  {formatScore(dimensionInsights.lowest?.score)}
                </span>
              </div>
            </div>

            {/* Insight 3: Deviasi Target */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 p-3.5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-[#233C4B] dark:text-blue-400 tracking-wider">Deviasi Rata-Rata Dimensi</span>
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-2">
                  Deviasi vs Target ({formatScore(targetMaturity)})
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Suku kematangan rata-rata dari seluruh pilar strategis yang ditargetkan</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">Selisih Target</span>
                <span className={`px-2 py-0.5 text-xs font-black font-sans rounded-md ${
                  dimensionInsights.gapToTarget >= 0 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {dimensionInsights.gapToTarget >= 0 ? "+" : ""}{dimensionInsights.gapToTarget.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Kematangan & Championship Program */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kematangan Category Shares with Donut Chart - REDESIGNED PREMIUM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Proporsi Klasifikasi Budaya Kerja (CML Share)</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Persentase rincian kelompok kematangan budaya kerja di seluruh Satuan Kerja</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-4 flex-1">
            {/* Interactive Donut Chart */}
            <div className="w-40 h-40 relative flex items-center justify-center shrink-0 min-w-0">
              {/* Central Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-sans">{reportStats.totalCount}</span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest -mt-0.5">Satker</span>
              </div>
              <div className="relative w-full h-full z-10">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="82%"
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legend & Breakdown Bars */}
            <div className="flex-1 space-y-4 w-full">
              {categoriesMap.map((cat) => {
                const percentage = reportStats.totalCount > 0 ? (cat.count / reportStats.totalCount) * 100 : 0;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-700 dark:text-slate-200">{cat.name}</span>
                        <span className="text-slate-400 text-[10px] font-medium font-sans">({cat.range})</span>
                      </div>
                      <span className="text-slate-800 dark:text-slate-150 font-sans">{cat.count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: cat.color, width: `${percentage}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{cat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Championship Program Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Performa Championship Program</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Ringkasan skor pencapaian dan rasio partisipasi program kebudayaan aktif</p>
          </div>

          <div className="mt-4 space-y-4 flex-1 flex flex-col justify-center">
            {programMetrics.map((prog) => (
              <div key={prog.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/25 border border-slate-150/55 dark:border-slate-800 rounded-xl gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{prog.name}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{prog.activeSatkers} Satuan Kerja Aktif</p>
                </div>
                
                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Skor Rata2</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-sans mt-0.5">{formatScore(prog.averageScore)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Partisipasi</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-sans mt-0.5">{formatScore(prog.averageEngagement)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlight Pemeringkatan: Top 3 & Bottom 3 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xs">
        <div className="mb-6">
          <div>
            <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Sorotan Eksekutif Kinerja Satuan Kerja</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Analisis unit kerja berkinerja tertinggi dan prioritas pendampingan budaya</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 3 Performers */}
          <div className="space-y-3">
            <div className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-sans text-[10px] tracking-tight rounded-lg flex items-center gap-1.5">
              <ArrowUpRight className="w-4.5 h-4.5" />
              Top 3 Satker Terbaik (Culture Champions)
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden">
              {performanceHighlights.top.map((satker, idx) => {
                const cat = getCmlCategory(satker.cultureMaturityLevel);
                const color = getCmlColor(cat);
                return (
                  <div key={satker.no} className="p-3 bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0 font-extrabold text-xs">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{satker.satkerLengkap}</p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{satker.kelompokBudker} • Rubrik {satker.rubrik}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="text-xs font-extrabold text-slate-850 dark:text-slate-100 font-sans">{formatScore(satker.cultureMaturityLevel)}</span>
                      <span className="text-[8px] font-extrabold uppercase mt-0.5 px-1.5 py-0.5 rounded-md" style={{ color, backgroundColor: `${color}15` }}>{cat}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom 3 Performers */}
          <div className="space-y-3">
            <div className="px-3.5 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold font-sans text-[10px] tracking-tight rounded-lg flex items-center gap-1.5">
              <ArrowDownRight className="w-4.5 h-4.5" />
              Prioritas Pendampingan (Below Benchmark)
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden">
              {performanceHighlights.bottom.map((satker, idx) => {
                const cat = getCmlCategory(satker.cultureMaturityLevel);
                const color = getCmlColor(cat);
                return (
                  <div key={satker.no} className="p-3 bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0 font-extrabold text-xs">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{satker.satkerLengkap}</p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{satker.kelompokBudker} • Rubrik {satker.rubrik}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="text-xs font-extrabold text-slate-850 dark:text-slate-100 font-sans">{formatScore(satker.cultureMaturityLevel)}</span>
                      <span className="text-[8px] font-extrabold uppercase mt-0.5 px-1.5 py-0.5 rounded-md" style={{ color, backgroundColor: `${color}15` }}>{cat}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section: Detail KPI Konsolidasi per Satuan Kerja */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xs select-none">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Tabel Konsolidasi Detail KPI Satuan Kerja</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Daftar lengkap capaian CML dan seluruh sub-program Championship Program (CP)</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto" data-print-hide>
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Satker / Kelompok..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <span className="text-[10px] font-extrabold text-slate-500 pl-2">CML:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => {
                  setSelectedCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-slate-750 dark:text-slate-200 border-none outline-none cursor-pointer pr-2"
              >
                <option value="Semua">Semua</option>
                <option value="Aligned">Aligned</option>
                <option value="Engaged">Engaged</option>
                <option value="Enable">Enable</option>
                <option value="Empower">Empower</option>
              </select>
            </div>

            {/* Reset Button */}
            {(searchTerm !== "" || selectedCategoryFilter !== "Semua") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategoryFilter("Semua");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-650 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                copiedState 
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {copiedState ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedState ? "Berhasil Disalin!" : "Salin ke Sheets"}</span>
            </button>
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-850">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-150 dark:border-slate-850">
                <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider w-[50px]">No</th>
                <th 
                  onClick={() => handleSort("satkerLengkap")}
                  className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 select-none transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Satuan Kerja
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider w-[80px]">Jenis</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider w-[90px]">Rubrik</th>
                <th 
                  onClick={() => handleSort("cultureMaturityLevel")}
                  className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 select-none transition-colors w-[110px]"
                >
                  <div className="flex items-center gap-1">
                    CML Score
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider w-[100px]">Kategori</th>
                <th 
                  onClick={() => handleSort("skorAkhirSespiok")}
                  className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 select-none transition-colors"
                >
                  <div className="flex items-center gap-1">
                    SESPI OK
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("skorAkhirAkukeren")}
                  className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 select-none transition-colors"
                >
                  <div className="flex items-center gap-1">
                    AKU KEREN
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("skorAkhirObf")}
                  className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 select-none transition-colors"
                >
                  <div className="flex items-center gap-1">
                    OBF
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("skorAkhir3h")}
                  className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 select-none transition-colors"
                >
                  <div className="flex items-center gap-1">
                    3H
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("skorAkhirPinter")}
                  className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 select-none transition-colors"
                >
                  <div className="flex items-center gap-1">
                    PINTER
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r, index) => {
                  const cat = getCmlCategory(r.cultureMaturityLevel);
                  const color = getCmlColor(cat);
                  const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;
                  return (
                    <tr key={r.no} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-3 text-[11px] font-extrabold text-slate-400">{serialNumber}</td>
                      <td className="p-3 text-[11.5px] font-black text-slate-800 dark:text-slate-150">
                        {r.satkerLengkap}
                      </td>
                      <td className="p-3 text-[11px] font-extrabold text-slate-500 dark:text-slate-400">{r.jenis}</td>
                      <td className="p-3 text-[11px] font-extrabold text-slate-500 dark:text-slate-400">{r.rubrik}</td>
                      <td className="p-3 text-[12px] font-black text-slate-800 dark:text-slate-100 font-sans">
                        {r.cultureMaturityLevel.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span 
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md" 
                          style={{ color, backgroundColor: `${color}15` }}
                        >
                          {cat}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">{r.skorAkhirSespiok.toFixed(2)}</td>
                      <td className="p-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">{r.skorAkhirAkukeren.toFixed(2)}</td>
                      <td className="p-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">{r.skorAkhirObf.toFixed(2)}</td>
                      <td className="p-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">{r.skorAkhir3h.toFixed(2)}</td>
                      <td className="p-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">{r.skorAkhirPinter.toFixed(2)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-xs font-bold text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <AlertCircle className="w-5 h-5 text-slate-300" />
                      Tidak ada data satuan kerja yang sesuai dengan filter
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredAndSortedTableRecords.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800" data-print-hide>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Tampilkan:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {[10, 25, 50, 100].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
              <span className="text-xs font-bold text-slate-400">
                dari {filteredAndSortedTableRecords.length} Satker
              </span>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-xs font-black rounded-lg cursor-pointer transition-colors ${
                          currentPage === pageNum
                            ? "bg-amber-500 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  
                  if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNum} className="text-slate-400 text-xs px-1 select-none">...</span>;
                  }
                  
                  return null;
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
