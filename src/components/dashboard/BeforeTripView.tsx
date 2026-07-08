import React, { useState, useMemo } from "react";
import { 
  getBegrData, 
  getPengaturanData, 
  formatScore, 
  BegrRecord 
} from "../../data/dataUtils";
import { 
  Search, Filter, FileSpreadsheet, FileText, 
  CheckCircle, AlertTriangle, Sliders, Database, Target, ChevronDown, X
} from "lucide-react";

export function BeforeTripView() {
  const [records] = useState<BegrRecord[]>(() => getBegrData());
  const { targetMaturity } = useMemo(() => getPengaturanData(), []);

  // UI States
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "info" | "error" | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("SEMUA");
  const [filterRubrik, setFilterRubrik] = useState("SEMUA");
  const [filterKategori, setFilterKategori] = useState("SEMUA");
  const [filterKelulusan, setFilterKelulusan] = useState("SEMUA");

  const showToast = (msg: string, type: "success" | "info" | "error") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => { setToastMsg(""); setToastType(""); }, 4500);
  };

  // Wire search updates
  React.useEffect(() => {
    const handleSearchEvent = (e: any) => {
      const q = e?.detail?.query || "";
      setSearchQuery(q);
      // Reset all page-level filters to show the searched Satker
      setFilterKelompok("SEMUA");
      setFilterRubrik("SEMUA");
      setFilterKategori("SEMUA");
      setFilterKelulusan("SEMUA");
    };
    window.addEventListener("app-search-focus" as any, handleSearchEvent);
    return () => window.removeEventListener("app-search-focus" as any, handleSearchEvent);
  }, []);

  // Filters logic
  const uniqueKelompoks = useMemo(() => ["SEMUA", ...Array.from(new Set(records.map(r => r.kelompokBudker))).filter(Boolean)], [records]);
  const uniqueRubriks = useMemo(() => ["SEMUA", ...Array.from(new Set(records.map(r => r.rubrik))).filter(Boolean)], [records]);
  const uniqueKategoris = useMemo(() => ["SEMUA", ...Array.from(new Set(records.map(r => r.kategori))).filter(Boolean)], [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = String(r.satkerLengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(r.kelompokBudker || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(r.rubrik || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchKelompok = filterKelompok === "SEMUA" || r.kelompokBudker === filterKelompok;
      const matchRubrik = filterRubrik === "SEMUA" || r.rubrik === filterRubrik;
      const matchKategori = filterKategori === "SEMUA" || r.kategori === filterKategori;
      let matchPass = true;
      if (filterKelulusan === "MEMENUHI") matchPass = r.cultureMaturityLevel >= targetMaturity;
      else if (filterKelulusan === "DI_BAWAH") matchPass = r.cultureMaturityLevel < targetMaturity;
      return matchSearch && matchKelompok && matchRubrik && matchKategori && matchPass;
    });
  }, [records, searchQuery, filterKelompok, filterRubrik, filterKategori, filterKelulusan, targetMaturity]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const passing = filteredRecords.filter(r => r.cultureMaturityLevel >= targetMaturity).length;
    const failing = total - passing;
    return {
      total, 
      passing, 
      failing,
      passPercent: total > 0 ? Math.round((passing / total) * 100) : 0,
      failPercent: total > 0 ? Math.round((failing / total) * 100) : 0,
      avgCml: total > 0 ? filteredRecords.reduce((sum, r) => sum + (r.cultureMaturityLevel || 0), 0) / total : 0
    };
  }, [filteredRecords, targetMaturity]);

  // Export Logic
  React.useEffect(() => {
    const handleGlobalExportExcel = () => handleExportCSV();
    const handleGlobalExportCSV = () => handleExportCSV();
    const handleGlobalExportTXT = () => handleExportTxt();
    window.addEventListener("global-export-excel-data-begr", handleGlobalExportExcel);
    window.addEventListener("global-export-csv-data-begr", handleGlobalExportCSV);
    window.addEventListener("global-export-txt-data-begr", handleGlobalExportTXT);
    return () => {
      window.removeEventListener("global-export-excel-data-begr", handleGlobalExportExcel);
      window.removeEventListener("global-export-csv-data-begr", handleGlobalExportCSV);
      window.removeEventListener("global-export-txt-data-begr", handleGlobalExportTXT);
    };
  }, [filteredRecords]);

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showToast("Tidak ada data untuk diekspor!", "error");
      return;
    }
    const headers = ["No", "Kelompok Budker", "Jenis", "Kategori", "Rubrik", "Satker Lengkap", "Culture Maturity Level", "EVP Kepemimpinan", "EVP Keluarga", "EVP Kesejahteraan"];
    const rows = filteredRecords.map(r => [
      r.no, `"${r.kelompokBudker}"`, `"${r.jenis}"`, `"${r.kategori}"`, `"${r.rubrik}"`, `"${r.satkerLengkap}"`,
      r.cultureMaturityLevel.toFixed(2), r.evpKepemimpinan.toFixed(2), r.evpKeluarga.toFixed(2), r.evpKesejahteraan.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KONSOL_BEGR_EXPORT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Ekspor CSV Berhasil!", "success");
  };

  const handleExportTxt = () => {
    if (filteredRecords.length === 0) return;
    let txt = `==================================================\n       LAPORAN CAPAIAN BEGR CULTURE SYSTEM\n==================================================\nTarget Maturity Level CML: ${targetMaturity.toFixed(2)}\n\n`;
    filteredRecords.forEach(r => {
      txt += `[No: ${r.no}] ${r.satkerLengkap}\n - Ruang Kerja/Rubrik : ${r.kelompokBudker} / ${r.rubrik}\n - Maturity Level   : ${r.cultureMaturityLevel.toFixed(2)} (${r.cultureMaturityLevel >= targetMaturity ? "DI ATAS RATA-RATA" : "DI BAWAH RATA-RATA"})\n - EVP (Kep/Kel/Kes) : ${r.evpKepemimpinan.toFixed(2)} / ${r.evpKeluarga.toFixed(2)} / ${r.evpKesejahteraan.toFixed(2)}\n--------------------------------------------------\n`;
    });
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Capaian_Maturity_Budker_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Ekspor Laporan TXT Berhasil!", "success");
  };

  const avgCmlDiff = stats.avgCml - targetMaturity;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-white font-sans text-xs animate-in slide-in-from-top-3 duration-200 ${toastType === "success" ? "bg-emerald-600" : toastType === "error" ? "bg-rose-600" : "bg-sky-600"}`}>
          {toastType === "success" ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertTriangle className="w-4.5 h-4.5" />}
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Terfilter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Satker</dt>
          </div>
          <dd className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {stats.total}
          </dd>
          <dd className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Dari {records.length} keseluruhan unit</span>
          </dd>
        </div>
        
        {/* Rata-Rata Maturity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rerata Maturity</dt>
          </div>
          <dd className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{formatScore(stats.avgCml)}</span>
            <span className="text-[13px] text-slate-400 font-medium">/ 4.00</span>
          </dd>
          <dd className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs">
            <span className={`font-bold ${avgCmlDiff >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {avgCmlDiff >= 0 ? "+" : ""}{avgCmlDiff.toFixed(2)}
            </span>
            <span className="ml-2 font-medium text-slate-500">vs rata-rata BI Wide ({formatScore(targetMaturity)})</span>
          </dd>
        </div>

        {/* Memenuhi Target */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Di Atas Rata-rata</dt>
          </div>
          <dd className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {stats.passing}
          </dd>
          <dd className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs">
            <span className="font-bold text-emerald-500">{stats.passPercent}%</span>
            <span className="ml-2 font-medium text-slate-500">dari satker aktif terfilter</span>
          </dd>
        </div>

        {/* Di Bawah Target */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Di Bawah Rata-rata</dt>
          </div>
          <dd className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {stats.failing}
          </dd>
          <dd className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs">
            <span className="font-bold text-rose-500">{stats.failPercent}%</span>
            <span className="ml-2 font-medium text-slate-500">dari satker aktif terfilter</span>
          </dd>
        </div>
      </dl>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[17px] font-bold font-sans text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                Konsolidasi Data Master
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-black tracking-widest uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/40">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                Read-Only
              </span>
            </div>
            <p className="text-[12.5px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 leading-relaxed">
              Pemantauan performa budaya kerja Satuan Kerja secara komprehensif
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial md:w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari satker, kelompok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/50 border border-slate-200 dark:border-slate-800/50 outline-none rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400 transition-all font-medium"
              />
            </div>

            {/* Reset Button */}
            {(searchQuery !== "" || filterKelompok !== "SEMUA" || filterRubrik !== "SEMUA" || filterKategori !== "SEMUA" || filterKelulusan !== "SEMUA") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterKelompok("SEMUA");
                  setFilterRubrik("SEMUA");
                  setFilterKategori("SEMUA");
                  setFilterKelulusan("SEMUA");
                }}
                className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-650 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 rounded-xl p-1 shrink-0">
              <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-1 text-slate-600 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-700/80 font-bold text-xs rounded-lg transition" title="Ekspor CSV">
                <FileSpreadsheet className="w-3 h-3 text-emerald-500" /><span>CSV</span>
              </button>
              <button onClick={handleExportTxt} className="flex items-center gap-1 px-3 py-1 text-slate-600 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-700/80 font-bold text-xs rounded-lg transition" title="Ekspor Txt">
                <FileText className="w-3 h-3 text-sky-500" /><span>Text</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="w-full">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Kelompok Budker
            </label>
            <div className="relative mt-2">
              <select 
                value={filterKelompok} 
                onChange={(e) => setFilterKelompok(e.target.value)} 
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer appearance-none shadow-xs transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {uniqueKelompoks.map(k => <option key={k} value={k}>{k === "SEMUA" ? "Semua Kelompok" : k}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Rubrik
            </label>
            <div className="relative mt-2">
              <select 
                value={filterRubrik} 
                onChange={(e) => setFilterRubrik(e.target.value)} 
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer appearance-none shadow-xs transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {uniqueRubriks.map(r => <option key={r} value={r}>{r === "SEMUA" ? "Semua Rubrik" : r}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Kategori
            </label>
            <div className="relative mt-2">
              <select 
                value={filterKategori} 
                onChange={(e) => setFilterKategori(e.target.value)} 
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer appearance-none shadow-xs transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {uniqueKategoris.map(kat => <option key={kat} value={kat}>{kat === "SEMUA" ? "Semua Kategori" : `Kategori ${kat}`}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Status Rata-rata CML
            </label>
            <div className="relative mt-2">
              <select 
                value={filterKelulusan} 
                onChange={(e) => setFilterKelulusan(e.target.value)} 
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer appearance-none shadow-xs transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="MEMENUHI">Di Atas Rata-rata (≥ {formatScore(targetMaturity)})</option>
                <option value="DI_BAWAH">Di Bawah Rata-rata (&lt; {formatScore(targetMaturity)})</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Datatable Monitoring */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-150/80 dark:border-slate-800/70">
                <th className="py-3.5 px-4 text-slate-450 dark:text-slate-500 font-extrabold uppercase w-12 text-center tracking-wider text-[9.5px]">No</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-350 font-extrabold uppercase min-w-[220px] tracking-wider text-[9.5px]">Satuan Kerja (Satker)</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-350 font-extrabold uppercase text-center w-28 tracking-wider text-[9.5px]">Kelompok</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-350 font-extrabold uppercase text-center w-24 tracking-wider text-[9.5px]">Rubrik</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-350 font-extrabold uppercase text-center w-14 tracking-wider text-[9.5px]">Kategori</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-355 font-extrabold uppercase text-center w-28 tracking-wider text-[9.5px] bg-slate-100/30 dark:bg-slate-800/10">Maturity Level</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-350 font-extrabold uppercase text-center w-20 tracking-wider text-[9.5px]">EVP Kep</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-350 font-extrabold uppercase text-center w-20 tracking-wider text-[9.5px]">EVP Kel</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-350 font-extrabold uppercase text-center w-20 tracking-wider text-[9.5px]">EVP Kes</th>
                <th className="py-3.5 px-4 text-slate-700 dark:text-slate-355 font-extrabold uppercase text-center w-28 tracking-wider text-[9.5px] bg-slate-100/30 dark:bg-slate-800/10">Keterangan CML</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Target className="w-8 h-8 opacity-20 mb-1" />
                      <span>Tidak ada data satker yang memenuhi kriteria pencarian</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => {
                  const isPass = r.cultureMaturityLevel >= targetMaturity;
                  return (
                    <tr key={i} className="border-b border-slate-100/80 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 dark:text-slate-500 font-bold">{r.no}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">
                        {r.satkerLengkap}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-[10.5px] uppercase tracking-wider font-bold">
                          {r.kelompokBudker}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500 dark:text-slate-400">{r.rubrik}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500 dark:text-slate-400">{r.kategori}</td>
                      
                      <td className="py-3.5 px-4 text-center bg-slate-50/40 dark:bg-slate-800/20">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black shadow-xs ${isPass ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200/50 dark:ring-emerald-500/30' : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200/50 dark:ring-rose-500/30'}`}>
                          {formatScore(r.cultureMaturityLevel)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">{formatScore(r.evpKepemimpinan)}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">{formatScore(r.evpKeluarga)}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">{formatScore(r.evpKesejahteraan)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {isPass ? (
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-black text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /><span>Above Average</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-black text-rose-500 bg-rose-50/50 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-500/20">
                              <AlertTriangle className="w-3 h-3" /><span>Below Average</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
