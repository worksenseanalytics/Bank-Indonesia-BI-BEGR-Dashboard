import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  getBegrData, 
  formatScore, 
  getCmlCategory, 
  getCmlColor 
} from "../../data/dataUtils";
import { 
  Trophy,
  AlertTriangle,
  ChevronDown,
  Download,
  Printer
} from "lucide-react";
import { captureAndPrint } from "../../lib/printHelper";

export function RankingView() {
  const begrRecords = useMemo(() => getBegrData(), []);
  
  // Calculate average CML of BI-Wide
  const avgCmlBiWide = useMemo(() => {
    if (begrRecords.length === 0) return 0;
    const total = begrRecords.reduce((sum, r) => sum + r.cultureMaturityLevel, 0);
    return total / begrRecords.length;
  }, [begrRecords]);
  
  // Filter states
  const [scope, setScope] = useState<"BI Wide" | "KP Wide" | "KPw Wide">("BI Wide");
  const [subGroup, setSubGroup] = useState<string>("All"); // filter by kelompokBudker
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rankingType, setRankingType] = useState<"CML" | "EVP" | "Pilar">("CML");
  const [evpDimension, setEvpDimension] = useState<"Kepemimpinan" | "Keluarga" | "Kesejahteraan">("Kepemimpinan");
  const [pilarDimension, setPilarDimension] = useState<"BI Prestasi" | "BI Digital" | "BI Inovasi" | "BI Spiritual">("BI Prestasi");
  const [sortOrder, setSortOrder] = useState<"DESC" | "ASC">("DESC");
  const [rankLimit, setRankLimit] = useState<5 | 12>(5);

  // Ref & position state for fixed-position dropdown (breaks out of overflow:hidden parents)
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  // Recompute dropdown position whenever it opens or window resizes/scrolls
  useEffect(() => {
    if (!isDropdownOpen) {
      setDropdownRect(null);
      return;
    }
    const compute = () => {
      if (dropdownTriggerRef.current) {
        const rect = dropdownTriggerRef.current.getBoundingClientRect();
        setDropdownRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
      }
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [isDropdownOpen]);

  // Get list of unique sub-groups (kelompokBudker)
  const uniqueSubGroups = useMemo(() => {
    const groups = begrRecords.map(r => r.kelompokBudker).filter(g => g);
    return ["All", ...Array.from(new Set(groups))];
  }, [begrRecords]);

  // Apply Slicer & Filters
  const filteredRecords = useMemo(() => {
    let result = [...begrRecords];

    // Filter by Scope
    if (scope === "KP Wide") {
      result = result.filter(r => r.jenis.toUpperCase() === "KP");
    } else if (scope === "KPw Wide") {
      result = result.filter(r => r.jenis.toUpperCase() !== "KP");
    }

    // Filter by Sub-group (kelompokBudker)
    if (subGroup !== "All") {
      result = result.filter(r => r.kelompokBudker === subGroup);
    }

    return result;
  }, [begrRecords, scope, subGroup]);

  // Calculate scores for Active Ranking Type
  const rankedData = useMemo(() => {
    const data = filteredRecords.map(r => {
      let score = 0;
      let label = "";

      if (rankingType === "CML") {
        score = r.cultureMaturityLevel;
        label = "CML Score";
      } else if (rankingType === "EVP") {
        if (evpDimension === "Kepemimpinan") {
          score = r.evpKepemimpinan;
          label = "EVP Kepemimpinan";
        } else if (evpDimension === "Keluarga") {
          score = r.evpKeluarga;
          label = "EVP Keluarga";
        } else {
          score = r.evpKesejahteraan;
          label = "EVP Kesejahteraan";
        }
      } else if (rankingType === "Pilar") {
        if (pilarDimension === "BI Prestasi") {
          score = r.biPrestasi;
          label = "BI Prestasi";
        } else if (pilarDimension === "BI Digital") {
          score = r.biDigital;
          label = "BI Digital";
        } else if (pilarDimension === "BI Inovasi") {
          score = r.biInovasi;
          label = "BI Inovasi";
        } else {
          score = r.biSpiritual;
          label = "BI Spiritual";
        }
      }

      return {
        ...r,
        activeScore: score,
        scoreLabel: label
      };
    });

    // Sort by score based on sortOrder
    return data.sort((a, b) => {
      return sortOrder === "DESC" 
        ? b.activeScore - a.activeScore 
        : a.activeScore - b.activeScore;
    });
  }, [filteredRecords, rankingType, evpDimension, pilarDimension, sortOrder]);

  // Highlight Top 5 & Bottom 5 indices bounding (always absolute highest & lowest regardless of sort order)
  const tableWithRankings = useMemo(() => {
    const sortedAbsolute = [...rankedData].sort((a, b) => b.activeScore - a.activeScore);
    const top5Ids = sortedAbsolute.slice(0, 5).map(r => r.no);
    const bottom5Ids = sortedAbsolute.length > 5 
      ? sortedAbsolute.slice(sortedAbsolute.length - 5).map(r => r.no) 
      : [];

    return rankedData.map((item, index) => {
      const position = index + 1;
      const isTop5 = top5Ids.includes(item.no);
      const isBottom5 = bottom5Ids.includes(item.no);

      return {
        ...item,
        rank: position,
        isTop5,
        isBottom5
      };
    });
  }, [rankedData]);

  const displayedRankings = useMemo(() => {
    return tableWithRankings.slice(0, rankLimit);
  }, [tableWithRankings, rankLimit]);

  // Quick stats computed (always absolute highest & lowest regardless of sort order)
  const stats = useMemo(() => {
    if (tableWithRankings.length === 0) return { highest: null, lowest: null };
    const sortedAbsolute = [...tableWithRankings].sort((a, b) => b.activeScore - a.activeScore);
    return {
      highest: sortedAbsolute[0],
      lowest: sortedAbsolute[sortedAbsolute.length - 1]
    };
  }, [tableWithRankings]);

  // Export & Print actions
  const handlePrint = () => {
    captureAndPrint("main-content", "Dashboard Ranking");
  };

  const handleExportCSV = () => {
    const headers = ["Posisi Ranking", "Nama Satker", "Kelompok Budker", "Kategori", "SKOR", "CML Kategori", "Keterangan CML BI-Wide"];
    const rows = tableWithRankings.map(r => [
      r.rank,
      r.satkerLengkap,
      r.kelompokBudker,
      r.jenis,
      r.activeScore.toFixed(2),
      getCmlCategory(r.cultureMaturityLevel),
      r.cultureMaturityLevel >= avgCmlBiWide ? "Di Atas Rata-rata" : "Di Bawah Rata-rata"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ranking_budaya_${rankingType}_${scope}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. FILTER DAN PANEL KONTROL SLICER */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-sm" data-print-hide>
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mx-24 -my-24 pointer-events-none" />
        
        <div className="relative z-10 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5">
          <h3 className="text-base font-bold font-sans text-slate-855 dark:text-white tracking-tight">Penyaringan & Penyelarasan Peringkat</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Saring dan bandingkan nilai satuan kerja secara interaktif berdasarkan pilar budaya kerja.</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Scope Slicer */}
          <div className="w-full">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Scope Wilayah
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
              {(["BI Wide", "KP Wide", "KPw Wide"] as const).map(s => {
                const isActive = scope === s;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setScope(s);
                      setSubGroup("All");
                    }}
                    className={`py-2.5 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? "bg-amber-500 text-white shadow-xs" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
                    }`}
                  >
                    {s === "BI Wide" ? "BI Wide" : s === "KP Wide" ? "KP" : "KPw"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub Group Organization (Kelompok Budker) Selector */}
          <div className="w-full" id="subgroup-dropdown-container">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Sub-Group Organisasi
            </label>
            <div className="relative mt-2">
              {/* Trigger Button */}
              <button
                ref={dropdownTriggerRef}
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs cursor-pointer transition-all flex items-center justify-between"
              >
                <span className="truncate">
                  {subGroup === "All" ? "Semua Sub-Group (BI Wide)" : subGroup}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isDropdownOpen ? "transform rotate-180" : ""}`} />
              </button>

              {/* Fixed-position dropdown — immune to overflow:hidden on any ancestor */}
              {isDropdownOpen && dropdownRect && (
                <>
                  {/* Full-page backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-[9998] cursor-default"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  {/* Dropdown panel rendered in fixed space */}
                  <ul
                    role="listbox"
                    style={{
                      position: "fixed",
                      top: dropdownRect.top,
                      left: dropdownRect.left,
                      width: dropdownRect.width,
                      zIndex: 9999,
                    }}
                    className="max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl ring-1 ring-black/5 outline-none divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    {uniqueSubGroups.map(grp => {
                      const isSelected = subGroup === grp;
                      return (
                        <li
                          key={grp}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSubGroup(grp);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-4 py-3 text-xs font-bold text-left cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          {grp === "All" ? "Semua Sub-Group (BI Wide)" : grp}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Ranking Category Pivot */}
          <div className="w-full">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Pilar Utama Penilaian
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
              {(["CML", "EVP", "Pilar"] as const).map(t => {
                const isActive = rankingType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setRankingType(t)}
                    className={`py-2.5 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? "bg-amber-500 text-white shadow-xs" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
                    }`}
                  >
                    {t === "CML" ? "Skor CML" : t === "EVP" ? "EVP Index" : "Pilar BI"}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Dynamic Parameter Sub-Slicers */}
        {(rankingType === "EVP" || rankingType === "Pilar") && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in slide-in-from-top-1 duration-200">
            {rankingType === "EVP" ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Dimensi EVP Aktif:</span>
                <div className="flex flex-wrap gap-2">
                  {(["Kepemimpinan", "Keluarga", "Kesejahteraan"] as const).map(dim => {
                    const isActive = evpDimension === dim;
                    return (
                      <button
                        key={dim}
                        onClick={() => setEvpDimension(dim)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isActive 
                            ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                            : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {dim}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Pilar Budaya Kerja Aktif:</span>
                <div className="flex flex-wrap gap-2">
                  {(["BI Prestasi", "BI Digital", "BI Inovasi", "BI Spiritual"] as const).map(pil => {
                    const isActive = pilarDimension === pil;
                    return (
                      <button
                        key={pil}
                        onClick={() => setPilarDimension(pil)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isActive 
                            ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                            : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {pil}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. HIGHLIGHT KARTU PREMIUM (TOP VS BOTTOM) */}
      {/* 2. HIGHLIGHT KARTU PREMIUM (TOP VS BOTTOM) (Tremor-Style) */}
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-5" data-print-hide>
        {stats.highest && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Top Performer
                </dt>
              </div>
              <dd className="mt-2.5 flex items-baseline space-x-2">
                <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
                  {formatScore(stats.highest.activeScore)}
                </p>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                  {stats.highest.scoreLabel}
                </p>
              </dd>
            </div>
            <dd className="mt-4 flex flex-col gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center space-x-1.5">
                <p className="flex items-center">
                  <svg className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 8l6 6H6z" />
                  </svg>
                  <span className="text-[13px] font-bold font-sans text-emerald-600 dark:text-emerald-500">
                    {getCmlCategory(stats.highest.cultureMaturityLevel)}
                  </span>
                </p>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                  tingkat kematangan budaya
                </p>
              </div>
              <div className="text-[13px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider truncate">
                {stats.highest.satkerLengkap} ({stats.highest.kelompokBudker})
              </div>
            </dd>
          </div>
        )}
        
        {stats.lowest && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <dt className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Perlu Perhatian Khusus
                </dt>
              </div>
              <dd className="mt-2.5 flex items-baseline space-x-2">
                <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
                  {formatScore(stats.lowest.activeScore)}
                </p>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                  {stats.lowest.scoreLabel}
                </p>
              </dd>
            </div>
            <dd className="mt-4 flex flex-col gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center space-x-1.5">
                <p className="flex items-center">
                  <svg className="size-4 shrink-0 text-rose-600 dark:text-rose-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 16l-6-6h12z" />
                  </svg>
                  <span className="text-[13px] font-bold font-sans text-rose-600 dark:text-rose-500">
                    {getCmlCategory(stats.lowest.cultureMaturityLevel)}
                  </span>
                </p>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                  tingkat kematangan budaya
                </p>
              </div>
              <div className="text-[13px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider truncate">
                {stats.lowest.satkerLengkap} ({stats.lowest.kelompokBudker})
              </div>
            </dd>
          </div>
        )}
      </dl>

      {/* 3. TABEL UTAMA PERINGKAT — PREMIUM REDESIGN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[15px] font-bold font-sans text-slate-800 dark:text-white tracking-tight">Tabel Peringkat Satker</h3>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold rounded-lg font-sans">
                  {tableWithRankings.length} Unit
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold rounded-md">
                  {scope}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold leading-relaxed">
                Urutan berdasarkan parameter aktif:{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {rankingType === "CML" ? "Culture Maturity Level" : rankingType === "EVP" ? `EVP ${evpDimension}` : `Pilar ${pilarDimension}`}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0" data-print-hide>
              {/* Arah Pengurutan (ASC/DESC) */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(["DESC", "ASC"] as const).map(o => {
                  const isActive = sortOrder === o;
                  return (
                    <button
                      key={o}
                      onClick={() => setSortOrder(o)}
                      className={`px-3 py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
                        isActive 
                          ? "bg-amber-500 text-white shadow-xs" 
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
                      }`}
                    >
                      {o === "DESC" ? "Tertinggi" : "Terendah"}
                    </button>
                  );
                })}
              </div>

              {/* Batas Tampilan (Top 5 / Top 12) */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {([5, 12] as const).map(limit => {
                  const isActive = rankLimit === limit;
                  return (
                    <button
                      key={limit}
                      onClick={() => setRankLimit(limit)}
                      className={`px-3 py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
                        isActive 
                          ? "bg-amber-500 text-white shadow-xs" 
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
                      }`}
                    >
                      Top {limit}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-500 dark:text-slate-400 text-[11px] rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
              <button 
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-white text-[11px] rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legend strip */}
        <div className="mx-6 mb-4 flex items-center gap-5 text-[10.5px] font-bold text-slate-400 dark:text-slate-500" data-print-hide>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Top 5 Performer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Bottom 5 Performer</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.08em]">
                <th className="py-3 px-6 w-16 text-center">#</th>
                <th className="py-3 px-4">Satuan Kerja</th>
                <th className="py-3 px-4 w-36 text-center">Sub-Group</th>
                <th className="py-3 px-4 w-24 text-center">Jenis</th>
                <th className="py-3 px-4 w-52">Skor Aktif</th>
                <th className="py-3 px-6 w-28 text-center">Level CML</th>
                <th className="py-3 px-6 w-36 text-center">Keterangan CML</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {displayedRankings.length > 0 ? (
                displayedRankings.map((rec) => {
                  const cmlCat = getCmlCategory(rec.cultureMaturityLevel);
                  const cmlClr = getCmlColor(cmlCat);
                  const maxScore = tableWithRankings[0]?.activeScore || 1;
                  const pct = Math.max(8, (rec.activeScore / maxScore) * 100);
                  
                  // Determine row accent
                  const isTop3 = rec.rank <= 3;
                  let rowClass = "hover:bg-slate-50/60 dark:hover:bg-slate-800/20";
                  let accentBorder = "border-l-2 border-l-transparent";
                  let rankColor = "text-slate-400 dark:text-slate-500";
                  let rankBg = "";
                  
                  if (rec.isTop5) {
                    rowClass = "bg-emerald-500/[0.015] hover:bg-emerald-500/[0.04]";
                    accentBorder = "border-l-2 border-l-transparent";
                  } else if (rec.isBottom5) {
                    rowClass = "bg-rose-500/[0.015] hover:bg-rose-500/[0.04]";
                    accentBorder = "border-l-2 border-l-transparent";
                  }

                  if (rec.rank === 1) {
                    rankBg = "bg-gradient-to-br from-amber-400 to-amber-500 text-white";
                    rankColor = "";
                  } else if (rec.rank === 2) {
                    rankBg = "bg-gradient-to-br from-slate-300 to-slate-400 text-white dark:from-slate-500 dark:to-slate-600";
                    rankColor = "";
                  } else if (rec.rank === 3) {
                    rankBg = "bg-gradient-to-br from-amber-600 to-amber-700 text-white";
                    rankColor = "";
                  }

                  // Progress bar color based on score context & premium gradients (McKinsey-standard)
                  let barColor = "bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-amber-600/90 dark:to-yellow-500/90";
                  if (rec.isTop5) {
                    barColor = "bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-600/90 dark:to-teal-500/90";
                  } else if (rec.isBottom5) {
                    barColor = "bg-gradient-to-r from-rose-500 to-orange-400 dark:from-rose-600/90 dark:to-orange-500/95";
                  }

                  return (
                    <tr key={rec.no} className={`transition-colors border-b border-slate-50 dark:border-slate-800/30 group ${rowClass}`}>
                      {/* POSISI */}
                      <td className={`py-3.5 px-6 text-center ${accentBorder}`}>
                        {isTop3 ? (
                          <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center font-black text-[11px] shadow-sm ${rankBg}`}>
                            {rec.rank}
                          </span>
                        ) : (
                          <span className={`font-bold font-sans text-[12px] ${rankColor}`}>
                            {rec.rank}
                          </span>
                        )}
                      </td>

                      {/* SATKER */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[12.5px] group-hover:text-slate-950 dark:group-hover:text-white transition-colors leading-snug block">
                            {rec.satkerLengkap}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans tracking-wider font-semibold uppercase">
                            {rec.rubrik}
                          </span>
                        </div>
                      </td>

                      {/* SUB-GROUP */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-450 font-sans bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-700/40">
                          {rec.kelompokBudker}
                        </span>
                      </td>

                      {/* JENIS */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[9.5px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                          rec.jenis.toUpperCase() === "KP"
                            ? "bg-indigo-50/70 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100/40 dark:border-indigo-900/20"
                            : "bg-amber-50/70 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100/40 dark:border-amber-900/20"
                        }`}>
                          {rec.jenis}
                        </span>
                      </td>

                      {/* SKOR AKTIF — with progress bar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold font-sans text-[13px] text-slate-800 dark:text-slate-100 w-11 shrink-0 text-right tabular-nums tracking-tight">
                            {formatScore(rec.activeScore)}
                          </span>
                          <div className="flex-1 h-2 bg-slate-100/70 dark:bg-slate-900/40 rounded-full p-[1px] border border-slate-200/50 dark:border-slate-800/40 shadow-inner flex items-center">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* CML LEVEL */}
                      <td className="py-3.5 px-6 text-center">
                        <span 
                          className="text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest text-white inline-block"
                          style={{ backgroundColor: cmlClr }}
                        >
                          {cmlCat}
                        </span>
                      </td>

                      {/* KETERANGAN CML */}
                      <td className="py-3.5 px-6 text-center">
                        {rec.cultureMaturityLevel >= avgCmlBiWide ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 inline-block">
                            Above Average
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10 inline-block">
                            Below Average
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-xs font-semibold">
                    Tidak ada record satker yang sesuai dengan kombinasi saringan aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-semibold">
            Menampilkan {displayedRankings.length} dari {tableWithRankings.length} satuan kerja
          </span>
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-sans font-bold">
            {scope} / {rankingType === "CML" ? "CML" : rankingType === "EVP" ? `EVP-${evpDimension}` : `Pilar-${pilarDimension}`}
          </span>
        </div>
      </div>

    </div>
  );
}
