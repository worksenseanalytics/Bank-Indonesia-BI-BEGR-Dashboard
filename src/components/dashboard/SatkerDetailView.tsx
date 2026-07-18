import React, { useState, useMemo } from "react";
import { 
  getBegrData, 
  formatScore, 
  getCmlCategory, 
  getCmlColor,
  getSafeYDomain 
} from "../../data/dataUtils";
import { CustomTooltip } from "../ui/custom-tooltip";
import { 
  Award, 
  Compass, 
  ChevronDown, 
  LayoutDashboard, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  HelpCircle,
  Lightbulb,
  Zap,
  Info,
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
  Heart,
  Search,
  Sliders,
  Maximize2,
  X
} from "lucide-react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from "recharts";

export function SatkerDetailView() {
  const begrRecords = useMemo(() => getBegrData(), []);
  
  // State for active chosen satker
  const [selectedSatkerNo, setSelectedSatkerNo] = useState<number>(() => {
    return begrRecords.length > 0 ? begrRecords[0].no : 1;
  });
  const [selectedCp, setSelectedCp] = useState<"Sespiok" | "Akukeren" | "Obf" | "3h" | "Pinter">("Sespiok");
  const [cpSortOrder, setCpSortOrder] = useState<"default" | "asc" | "desc">("default");

  type RecordItem = ReturnType<typeof getBegrData>[0];

  // Group begrRecords by kelompokBudker (e.g. "KP A", "KPw B", etc.) or jenis
  const groupedRecordsByKelompok = useMemo<Record<string, RecordItem[]>>(() => {
    const groups: Record<string, RecordItem[]> = {};
    begrRecords.forEach(rec => {
      const groupName = rec.kelompokBudker || "Lainnya";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(rec);
    });
    return groups;
  }, [begrRecords]);

  // States for custom searchable dropdown Satker
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCpDropdownOpen, setIsCpDropdownOpen] = useState(false);
  const [isCpChartExpanded, setIsCpChartExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered grouped records for custom dropdown
  const filteredGroupedRecords = useMemo<Record<string, RecordItem[]>>(() => {
    if (!searchQuery.trim()) return groupedRecordsByKelompok;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, RecordItem[]> = {};
    
    Object.keys(groupedRecordsByKelompok).forEach((groupName) => {
      const records = groupedRecordsByKelompok[groupName];
      const matched = records.filter(rec => 
        rec.satkerLengkap.toLowerCase().includes(query) ||
        rec.rubrik.toLowerCase().includes(query) ||
        (rec.kelompokBudker && rec.kelompokBudker.toLowerCase().includes(query)) ||
        (rec.jenis && rec.jenis.toLowerCase().includes(query))
      );
      if (matched.length > 0) {
        filtered[groupName] = matched;
      }
    });
    
    return filtered;
  }, [groupedRecordsByKelompok, searchQuery]);

  // Chosen Satker Record
  const activeRecord = useMemo(() => {
    return begrRecords.find(r => r.no === selectedSatkerNo) || begrRecords[0];
  }, [begrRecords, selectedSatkerNo]);

  // Overall BI Wide Averages
  const biWideAverages = useMemo(() => {
    if (begrRecords.length === 0) return { cml: 0, evpKep: 0, evpKel: 0, evpKes: 0, prest: 0, dig: 0, inov: 0, spiri: 0 };
    const count = begrRecords.length;
    return {
      cml: begrRecords.reduce((sum, r) => sum + r.cultureMaturityLevel, 0) / count,
      evpKep: begrRecords.reduce((sum, r) => sum + r.evpKepemimpinan, 0) / count,
      evpKel: begrRecords.reduce((sum, r) => sum + r.evpKeluarga, 0) / count,
      evpKes: begrRecords.reduce((sum, r) => sum + r.evpKesejahteraan, 0) / count,
      prest: begrRecords.reduce((sum, r) => sum + r.biPrestasi, 0) / count,
      dig: begrRecords.reduce((sum, r) => sum + r.biDigital, 0) / count,
      inov: begrRecords.reduce((sum, r) => sum + r.biInovasi, 0) / count,
      spiri: begrRecords.reduce((sum, r) => sum + r.biSpiritual, 0) / count
    };
  }, [begrRecords]);

  // Peer Subgroup/Category Averages (KP or KPw subgroup peer average)
  const peerAverages = useMemo(() => {
    if (!activeRecord || begrRecords.length === 0) return { cml: 0, evpKep: 0, evpKel: 0, evpKes: 0, prest: 0, dig: 0, inov: 0, spiri: 0 };
    const peerType = activeRecord.jenis.toUpperCase(); // "KP" or "KPw" (or custom)
    const peers = begrRecords.filter(r => r.jenis.toUpperCase() === peerType);
    const count = peers.length || 1;
    return {
      typeLabel: peerType === "KP" ? "Kantor Pusat (KP)" : "Kantor Perwakilan (KPw)",
      cml: peers.reduce((sum, r) => sum + r.cultureMaturityLevel, 0) / count,
      evpKep: peers.reduce((sum, r) => sum + r.evpKepemimpinan, 0) / count,
      evpKel: peers.reduce((sum, r) => sum + r.evpKeluarga, 0) / count,
      evpKes: peers.reduce((sum, r) => sum + r.evpKesejahteraan, 0) / count,
      prest: peers.reduce((sum, r) => sum + r.biPrestasi, 0) / count,
      dig: peers.reduce((sum, r) => sum + r.biDigital, 0) / count,
      inov: peers.reduce((sum, r) => sum + r.biInovasi, 0) / count,
      spiri: peers.reduce((sum, r) => sum + r.biSpiritual, 0) / count
    };
  }, [begrRecords, activeRecord]);

  // Compute Active CML Category Details 
  const cmlCategory = useMemo(() => {
    if (!activeRecord) return "Aligned";
    return getCmlCategory(activeRecord.cultureMaturityLevel);
  }, [activeRecord]);

  const cmlColor = useMemo(() => {
    return getCmlColor(cmlCategory);
  }, [cmlCategory]);

  // Championship Program (CP) Detail Component Chart Data
  const cpDetailChartData = useMemo(() => {
    if (!activeRecord) return [];
    
    const data: { name: string; score: number; color: string }[] = [];
    
    if (selectedCp === "Sespiok") {
      data.push({ name: "Skor Akhir CP", score: activeRecord.skorAkhirSespiok, color: "#6366f1" });
      data.push({ name: "Deep Dive Culture", score: activeRecord.skorDeepDiveSespiok, color: "#4f46e5" });
      data.push({ name: "Persona Walkthrough", score: activeRecord.skorPersonaWalkthroughSespiok, color: "#818cf8" });
      data.push({ name: "Kesesuaian EVP", score: activeRecord.kesesuaianEvpKepemimpinanSespiok, color: "#10b981" });
      data.push({ name: "Kesesuaian Pilar Budker", score: activeRecord.kesesuaianBiPrestasiSespiok, color: "#06b6d4" });
      data.push({ name: "Trust & Integrity", score: activeRecord.trustIntegritySespiok, color: "#f59e0b" });
      data.push({ name: "Professionalism", score: activeRecord.professionalismSespiok, color: "#f59e0b" });
      data.push({ name: "Excellence", score: activeRecord.excellenceSespiok, color: "#f59e0b" });
      data.push({ name: "Public Interest", score: activeRecord.publicInterestSespiok, color: "#f59e0b" });
      data.push({ name: "Coordination & Teamwork", score: activeRecord.coordinationTeamworkSespiok, color: "#f59e0b" });
    } else if (selectedCp === "Akukeren") {
      data.push({ name: "Skor Akhir CP", score: activeRecord.skorAkhirAkukeren, color: "#6366f1" });
      data.push({ name: "Deep Dive Culture", score: activeRecord.skorDeepDiveAkukeren, color: "#4f46e5" });
      data.push({ name: "Persona Walkthrough", score: activeRecord.skorPersonaWalkthroughAkukeren, color: "#818cf8" });
      data.push({ name: "Reality Check", score: activeRecord.skorRealityCheckAkukeren, color: "#f43f5e" });
      data.push({ name: "Kesesuaian EVP", score: activeRecord.kesesuaianEvpKepemimpinanAkukeren, color: "#10b981" });
      data.push({ name: "Kesesuaian Pilar Budker", score: activeRecord.kesesuaianBiDigitalAkukeren, color: "#06b6d4" });
      data.push({ name: "Trust & Integrity", score: activeRecord.trustIntegrityAkukeren, color: "#f59e0b" });
      data.push({ name: "Professionalism", score: activeRecord.professionalismAkukeren, color: "#f59e0b" });
      data.push({ name: "Excellence", score: activeRecord.excellenceAkukeren, color: "#f59e0b" });
      data.push({ name: "Public Interest", score: activeRecord.publicInterestAkukeren, color: "#f59e0b" });
      data.push({ name: "Coordination & Teamwork", score: activeRecord.coordinationTeamworkAkukeren, color: "#f59e0b" });
    } else if (selectedCp === "Obf") {
      data.push({ name: "Skor Akhir CP", score: activeRecord.skorAkhirObf, color: "#6366f1" });
      data.push({ name: "Deep Dive Culture", score: activeRecord.skorDeepDiveObf, color: "#4f46e5" });
      data.push({ name: "Persona Walkthrough", score: activeRecord.skorPersonaWalkthroughObf, color: "#818cf8" });
      data.push({ name: "Reality Check", score: activeRecord.skorRealityCheckObf, color: "#f43f5e" });
      data.push({ name: "Kesesuaian EVP", score: activeRecord.kesesuaianEvpKeluargaObf, color: "#10b981" });
      data.push({ name: "Kesesuaian Pilar Budker", score: activeRecord.kesesuaianBiInovasiObf, color: "#06b6d4" });
      data.push({ name: "Trust & Integrity", score: activeRecord.trustIntegrityObf, color: "#f59e0b" });
      data.push({ name: "Professionalism", score: activeRecord.professionalismObf, color: "#f59e0b" });
      data.push({ name: "Excellence", score: activeRecord.excellenceObf, color: "#f59e0b" });
      data.push({ name: "Public Interest", score: activeRecord.publicInterestObf, color: "#f59e0b" });
      data.push({ name: "Coordination & Teamwork", score: activeRecord.coordinationTeamworkObf, color: "#f59e0b" });
    } else if (selectedCp === "3h") {
      data.push({ name: "Skor Akhir CP", score: activeRecord.skorAkhir3h, color: "#6366f1" });
      data.push({ name: "Deep Dive Culture", score: activeRecord.skorDeepDive3h, color: "#4f46e5" });
      data.push({ name: "Persona Walkthrough", score: activeRecord.skorPersonaWalkthrough3h, color: "#818cf8" });
      data.push({ name: "Reality Check", score: activeRecord.skorRealityCheck3h, color: "#f43f5e" });
      data.push({ name: "Kesesuaian EVP", score: activeRecord.kesesuaianEvpKesejahteraan3h, color: "#10b981" });
      data.push({ name: "Kesesuaian Pilar Budker", score: activeRecord.kesesuaianBiSpiritual3h, color: "#06b6d4" });
      data.push({ name: "Trust & Integrity", score: activeRecord.trustIntegrity3h, color: "#f59e0b" });
      data.push({ name: "Professionalism", score: activeRecord.professionalism3h, color: "#f59e0b" });
      data.push({ name: "Excellence", score: activeRecord.excellence3h, color: "#f59e0b" });
      data.push({ name: "Public Interest", score: activeRecord.publicInterest3h, color: "#f59e0b" });
      data.push({ name: "Coordination & Teamwork", score: activeRecord.coordinationTeamwork3h, color: "#f59e0b" });
    } else if (selectedCp === "Pinter") {
      data.push({ name: "Skor Akhir CP", score: activeRecord.skorAkhirPinter, color: "#6366f1" });
      data.push({ name: "Deep Dive Culture", score: activeRecord.skorDeepDivePinter, color: "#4f46e5" });
      data.push({ name: "Persona Walkthrough", score: activeRecord.skorPersonaWalkthroughPinter, color: "#818cf8" });
      data.push({ name: "Kesesuaian EVP", score: activeRecord.kesesuaianEvpKesejahteraanPinter, color: "#10b981" });
      data.push({ name: "Kesesuaian Pilar Budker", score: activeRecord.kesesuaianBiSpiritualPinter, color: "#06b6d4" });
      data.push({ name: "Trust & Integrity", score: activeRecord.trustIntegrityPinter, color: "#f59e0b" });
      data.push({ name: "Professionalism", score: activeRecord.professionalismPinter, color: "#f59e0b" });
      data.push({ name: "Excellence", score: activeRecord.excellencePinter, color: "#f59e0b" });
      data.push({ name: "Public Interest", score: activeRecord.publicInterestPinter, color: "#f59e0b" });
      data.push({ name: "Coordination & Teamwork", score: activeRecord.coordinationTeamworkPinter, color: "#f59e0b" });
    }
    
    const mapped = data.map(d => ({
      ...d,
      score: parseFloat(d.score.toFixed(2))
    }));

    if (cpSortOrder === "asc") {
      return [...mapped].sort((a, b) => a.score - b.score);
    } else if (cpSortOrder === "desc") {
      return [...mapped].sort((a, b) => b.score - a.score);
    }
    return mapped;
  }, [selectedCp, activeRecord, cpSortOrder]);

  // 1. EVP Dimensions Chart Data Mapping
  const evpChartData = useMemo(() => {
    if (!activeRecord) return [];
    return [
      {
        subject: "Kepemimpinan",
        "Skor Satker": parseFloat(activeRecord.evpKepemimpinan.toFixed(2)),
        "Rata-rata BI Wide": parseFloat(biWideAverages.evpKep.toFixed(2)),
        "Rata-rata Peer": parseFloat(peerAverages.evpKep.toFixed(2))
      },
      {
        subject: "Keluarga",
        "Skor Satker": parseFloat(activeRecord.evpKeluarga.toFixed(2)),
        "Rata-rata BI Wide": parseFloat(biWideAverages.evpKel.toFixed(2)),
        "Rata-rata Peer": parseFloat(peerAverages.evpKel.toFixed(2))
      },
      {
        subject: "Kesejahteraan",
        "Skor Satker": parseFloat(activeRecord.evpKesejahteraan.toFixed(2)),
        "Rata-rata BI Wide": parseFloat(biWideAverages.evpKes.toFixed(2)),
        "Rata-rata Peer": parseFloat(peerAverages.evpKes.toFixed(2))
      }
    ];
  }, [activeRecord, biWideAverages, peerAverages]);

  // EVP Chart Safe Domain
  const evpDomain = useMemo(() => {
    if (evpChartData.length === 0) return [0, 4] as [number, number];
    const scores = evpChartData.flatMap(d => [d["Skor Satker"], d["Rata-rata BI Wide"], d["Rata-rata Peer"]]);
    return getSafeYDomain(Math.min(...scores), Math.max(...scores));
  }, [evpChartData]);

  // 2. BI Pillars Chart Data Mapping
  const pilarChartData = useMemo(() => {
    if (!activeRecord) return [];
    return [
      {
        subject: "BI Prestasi",
        "Skor Satker": parseFloat(activeRecord.biPrestasi.toFixed(2)),
        "Rata-rata BI Wide": parseFloat(biWideAverages.prest.toFixed(2)),
        "Rata-rata Peer": parseFloat(peerAverages.prest.toFixed(2))
      },
      {
        subject: "BI Digital",
        "Skor Satker": parseFloat(activeRecord.biDigital.toFixed(2)),
        "Rata-rata BI Wide": parseFloat(biWideAverages.dig.toFixed(2)),
        "Rata-rata Peer": parseFloat(peerAverages.dig.toFixed(2))
      },
      {
        subject: "BI Inovasi",
        "Skor Satker": parseFloat(activeRecord.biInovasi.toFixed(2)),
        "Rata-rata BI Wide": parseFloat(biWideAverages.inov.toFixed(2)),
        "Rata-rata Peer": parseFloat(peerAverages.inov.toFixed(2))
      },
      {
        subject: "BI Spiritual",
        "Skor Satker": parseFloat(activeRecord.biSpiritual.toFixed(2)),
        "Rata-rata BI Wide": parseFloat(biWideAverages.spiri.toFixed(2)),
        "Rata-rata Peer": parseFloat(peerAverages.spiri.toFixed(2))
      }
    ];
  }, [activeRecord, biWideAverages, peerAverages]);

  // Pilar Chart Safe Domain
  const pilarDomain = useMemo(() => {
    if (pilarChartData.length === 0) return [0, 4] as [number, number];
    const scores = pilarChartData.flatMap(d => [d["Skor Satker"], d["Rata-rata BI Wide"], d["Rata-rata Peer"]]);
    return getSafeYDomain(Math.min(...scores), Math.max(...scores));
  }, [pilarChartData]);

  // CP Detail Component Safe Domain
  const cpDetailDomain = useMemo(() => {
    if (cpDetailChartData.length === 0) return [0, 4] as [number, number];
    const scores = cpDetailChartData.map(d => d.score);
    return getSafeYDomain(Math.min(...scores), Math.max(...scores));
  }, [cpDetailChartData]);

  // 3. Dynamic Evaluation Program Sessi Dynamics RADAR Chart
  // Displays score dynamics across the 5 main assessment sessions
  const programDynamicsData = useMemo(() => {
    if (!activeRecord) return [];
    return [
      { subject: "SESPIOK X KPPTOP", Skor: parseFloat(activeRecord.skorAkhirSespiok.toFixed(2)) },
      { subject: "AKUKEREN X BTSYUK", Skor: parseFloat(activeRecord.skorAkhirAkukeren.toFixed(2)) },
      { subject: "OBF (BI INOVASI)", Skor: parseFloat(activeRecord.skorAkhirObf.toFixed(2)) },
      { subject: "3H X KEJORA", Skor: parseFloat(activeRecord.skorAkhir3h.toFixed(2)) },
      { subject: "PINTER X PASKEUN", Skor: parseFloat(activeRecord.skorAkhirPinter.toFixed(2)) }
    ];
  }, [activeRecord]);

  // 3.1. Dampak NNS Core Values per Championship Program Mapping
  const nnsCpComparisonData = useMemo(() => {
    if (!activeRecord) return [];
    return [
      {
        subject: "Trust & Integrity",
        "3H x KEJORA": parseFloat(activeRecord.trustIntegrity3h.toFixed(2)),
        "AKU KEREN x BTS YUK": parseFloat(activeRecord.trustIntegrityAkukeren.toFixed(2)),
        "ONE BIG FAMILY (OBF)": parseFloat(activeRecord.trustIntegrityObf.toFixed(2)),
        "PINTER x PASKEUN": parseFloat(activeRecord.trustIntegrityPinter.toFixed(2)),
        "SESPI OK x KPP TOP": parseFloat(activeRecord.trustIntegritySespiok.toFixed(2)),
      },
      {
        subject: "Professionalism",
        "3H x KEJORA": parseFloat(activeRecord.professionalism3h.toFixed(2)),
        "AKU KEREN x BTS YUK": parseFloat(activeRecord.professionalismAkukeren.toFixed(2)),
        "ONE BIG FAMILY (OBF)": parseFloat(activeRecord.professionalismObf.toFixed(2)),
        "PINTER x PASKEUN": parseFloat(activeRecord.professionalismPinter.toFixed(2)),
        "SESPI OK x KPP TOP": parseFloat(activeRecord.professionalismSespiok.toFixed(2)),
      },
      {
        subject: "Excellence",
        "3H x KEJORA": parseFloat(activeRecord.excellence3h.toFixed(2)),
        "AKU KEREN x BTS YUK": parseFloat(activeRecord.excellenceAkukeren.toFixed(2)),
        "ONE BIG FAMILY (OBF)": parseFloat(activeRecord.excellenceObf.toFixed(2)),
        "PINTER x PASKEUN": parseFloat(activeRecord.excellencePinter.toFixed(2)),
        "SESPI OK x KPP TOP": parseFloat(activeRecord.excellenceSespiok.toFixed(2)),
      },
      {
        subject: "Public Interest",
        "3H x KEJORA": parseFloat(activeRecord.publicInterest3h.toFixed(2)),
        "AKU KEREN x BTS YUK": parseFloat(activeRecord.publicInterestAkukeren.toFixed(2)),
        "ONE BIG FAMILY (OBF)": parseFloat(activeRecord.publicInterestObf.toFixed(2)),
        "PINTER x PASKEUN": parseFloat(activeRecord.publicInterestPinter.toFixed(2)),
        "SESPI OK x KPP TOP": parseFloat(activeRecord.publicInterestSespiok.toFixed(2)),
      },
      {
        subject: "Teamwork",
        "3H x KEJORA": parseFloat(activeRecord.coordinationTeamwork3h.toFixed(2)),
        "AKU KEREN x BTS YUK": parseFloat(activeRecord.coordinationTeamworkAkukeren.toFixed(2)),
        "ONE BIG FAMILY (OBF)": parseFloat(activeRecord.coordinationTeamworkObf.toFixed(2)),
        "PINTER x PASKEUN": parseFloat(activeRecord.coordinationTeamworkPinter.toFixed(2)),
        "SESPI OK x KPP TOP": parseFloat(activeRecord.coordinationTeamworkSespiok.toFixed(2)),
      }
    ];
  }, [activeRecord]);

  // 4. Dampak NNS Core Values Data Mapping
  const nnsDampakData = useMemo(() => {
    if (!activeRecord) return [];
    return [
      { name: "Trust & Integrity", Skor: parseFloat(activeRecord.trustIntegrity.toFixed(2)) },
      { name: "Professionalism", Skor: parseFloat(activeRecord.professionalism.toFixed(2)) },
      { name: "Excellence", Skor: parseFloat(activeRecord.excellence.toFixed(2)) },
      { name: "Public Interest", Skor: parseFloat(activeRecord.publicInterest.toFixed(2)) },
      { name: "Teamwork", Skor: parseFloat(activeRecord.coordinationTeamwork.toFixed(2)) }
    ];
  }, [activeRecord]);

  if (begrRecords.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
        No records available for unit deep dive analysis.
      </div>
    );
  }

  // Render comparative metrics block
  const renderCompareIndicator = (unitVal: number, biVal: number, peerVal: number) => {
    const biDiff = unitVal - biVal;
    const peerDiff = unitVal - peerVal;

    return (
      <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          BI Wide: 
          <span className={`font-bold font-sans ${biDiff >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {biDiff >= 0 ? `+${formatScore(biDiff)}` : `${formatScore(biDiff)}`}
          </span>
        </span>
        <span className="hidden sm:inline-block text-slate-300">•</span>
        <span className="flex items-center gap-1">
          {peerAverages.typeLabel}: 
          <span className={`font-bold font-sans ${peerDiff >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {peerDiff >= 0 ? `+${formatScore(peerDiff)}` : `${formatScore(peerDiff)}`}
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SATKER DROPDOWN SELECTION */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-visible z-30">
        {/* Decorative background elements wrapped in overflow-hidden */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 p-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mx-20 -my-20 opacity-50" />
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          <div>
            <h3 className="text-lg font-bold font-sans tracking-tight text-slate-855 dark:text-white mb-1">Eksplorasi Profil Satker</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">Pilih Satuan Kerja untuk melihat evaluasi kematangan secara mendetail.</p>
          </div>
        </div>

        {/* Custom Searchable Dropdown Selector */}
        <div className="relative z-20 w-full md:w-96">
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setSearchQuery(""); // Reset pencarian saat dibuka
            }}
            className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm cursor-pointer transition-all flex items-center justify-between min-h-[52px]"
          >
            <div className="whitespace-normal break-words pr-2">
              <span className="block text-slate-855 dark:text-slate-100 font-bold leading-snug">
                {activeRecord ? activeRecord.satkerLengkap : "Pilih Satker..."}
              </span>
              {activeRecord && (
                <span className="block text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  KATEGORI: {activeRecord.kelompokBudker} ({activeRecord.jenis})
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Transparent Backdrop to close dropdown on click outside */}
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Custom Dropdown Menu List with Search Box */}
          {isDropdownOpen && (
            <div className="absolute right-0 left-0 md:left-auto md:w-[480px] mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[380px]">
              {/* Search Box */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                <input
                  type="text"
                  placeholder="Cari Satuan Kerja..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 py-1"
                  autoFocus
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Grouped Items List */}
              <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] scrollbar-thin">
                {Object.keys(filteredGroupedRecords).length > 0 ? (
                  Object.keys(filteredGroupedRecords).map((groupName) => {
                    const records = filteredGroupedRecords[groupName];
                    return (
                      <div key={groupName} className="flex flex-col">
                        <div className="bg-slate-50/80 dark:bg-slate-950/40 px-4 py-2 text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                          Kelompok: {groupName}
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-900">
                          {records.map((rec) => {
                            const isSelected = rec.no === selectedSatkerNo;
                            return (
                              <button
                                key={rec.no}
                                type="button"
                                onClick={() => {
                                  setSelectedSatkerNo(rec.no);
                                  setIsDropdownOpen(false);
                                  setSearchQuery("");
                                }}
                                className={`w-full text-left px-4 py-3 text-xs sm:text-sm transition-all cursor-pointer flex flex-col gap-1 ${
                                  isSelected 
                                    ? "bg-blue-50/75 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-500" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-l-2 border-transparent"
                                }`}
                              >
                                <span className="font-bold block leading-relaxed whitespace-normal break-words">
                                  {rec.satkerLengkap}
                                </span>
                                <span className={`block text-[10px] sm:text-xs font-semibold ${isSelected ? "text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
                                  Rubrik: {rec.rubrik} • Jenis: {rec.jenis}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs sm:text-sm text-slate-400 font-semibold">
                    Tidak ada satuan kerja yang cocok.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CML (Core Maturity Level) BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Identity & CML Badge Card (Tremor-Style) */}
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-tight font-sans">{activeRecord.jenis}</span>
              <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-tight font-sans">{activeRecord.kelompokBudker}</span>
            </div>
            
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight uppercase">{activeRecord.satkerLengkap}</h4>
            <p className="text-xs text-slate-400 font-sans font-medium">RUBRIK KODE: {activeRecord.rubrik}</p>
          </div>

          <div className="p-4 rounded-xl text-white space-y-2" style={{ backgroundColor: cmlColor }}>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/70">KATEGORI LEVEL kematangan</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold tracking-tight uppercase">{cmlCategory}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-sans font-bold">{formatScore(activeRecord.cultureMaturityLevel)}</span>
            </div>
            <p className="text-xs font-medium leading-normal text-white/90 pt-1.5 border-t border-white/10">
              Evaluasi kepatuhan budaya kerja tergolong ke tingkat <span className="font-bold underline">{cmlCategory}</span> bersandarkan ketetapan target nasional.
            </p>
          </div>
        </div>

        {/* 1. Skor CML (Core Maturity Level) Ring Representation (Tremor-Style) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Skor CML Satker</dt>
              <Award className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h4 className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Culture Maturity Level</h4>
          </div>

          <div className="py-2 flex items-center justify-center relative">
            {/* Speedometer ring structure */}
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="8" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  className="fill-none" 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - (activeRecord.cultureMaturityLevel / 4))}`}
                  strokeLinecap="round"
                  style={{ stroke: cmlColor, transition: "stroke-dashoffset 0.8s ease-in-out" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold font-sans text-slate-800 dark:text-white">{formatScore(activeRecord.cultureMaturityLevel)}</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wide">dari 4,00</span>
              </div>
            </div>
          </div>

          <div>
            {renderCompareIndicator(activeRecord.cultureMaturityLevel, biWideAverages.cml, peerAverages.cml)}
          </div>
        </div>
      </div>

      {/* 3. CORE PILAR & EVP CHARTS BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Skor Pilar Budaya Kerja Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-sm">
          <div className="mb-4 border-b border-slate-50 dark:border-slate-850 pb-2.5">
            <div>
              <h3 className="text-sm md:text-base font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Skor Pilar Budaya Kerja Bank Indonesia</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Komparasi capaian Satker pada 4 Pilar utama program budker</p>
            </div>
          </div>

          <div key="pilar-chart-wrapper" className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart id="satker-pilar-bar-chart" data={pilarChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11.5, fontWeight: "bold" }} axisLine={false} tickLine={false} />
                <YAxis domain={pilarDomain} tick={{ fill: "#64748b", fontSize: 11.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11.5px", fontWeight: "bold" }} />
                <Bar dataKey="Rata-rata BI Wide" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="Rata-rata Peer" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="Skor Satker" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Skor EVP Dimensions Group Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-sm">
          <div className="mb-4 border-b border-slate-50 dark:border-slate-850 pb-2.5">
            <div>
              <h3 className="text-sm md:text-base font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Skor Dimensi Employee Value Proposition (EVP)</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Komparasi Satker dengan Rata-rata BI Wide dan Satker selevel</p>
            </div>
          </div>

          <div key="evp-chart-wrapper" className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart id="satker-evp-bar-chart" data={evpChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11.5, fontWeight: "bold" }} axisLine={false} tickLine={false} />
                <YAxis domain={evpDomain} tick={{ fill: "#64748b", fontSize: 11.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11.5px", fontWeight: "bold" }} />
                <Bar dataKey="Rata-rata BI Wide" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="Rata-rata Peer" fill="#fbbf24" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="Skor Satker" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. CHAMPIONSHIP PROGRAM & NNS IMPACT BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Detail Komponen Penilaian per CP (Tremor-Style) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[28px] shadow-sm flex flex-col justify-between space-y-1.5 relative overflow-visible z-20">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Detail Komponen Championship Program (CP)</h3>
                  <button
                    type="button"
                    onClick={() => setIsCpChartExpanded(true)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0 cursor-pointer"
                    title="Perbesar Tampilan Grafik (Popup)"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Inspeksi detail parameter penilaian setiap program budaya</h4>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0 w-full sm:w-auto" data-print-hide>
                {/* Segmented Control for Sort Order */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shadow-xs w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setCpSortOrder("default")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer rounded-lg ${
                      cpSortOrder === "default"
                        ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title="Urutan Asli"
                  >
                    Asli
                  </button>
                  <button
                    type="button"
                    onClick={() => setCpSortOrder("asc")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer rounded-lg ${
                      cpSortOrder === "asc"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title="Urutkan Terendah"
                  >
                    Terendah
                  </button>
                  <button
                    type="button"
                    onClick={() => setCpSortOrder("desc")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer rounded-lg ${
                      cpSortOrder === "desc"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title="Urutkan Tertinggi"
                  >
                    Tertinggi
                  </button>
                </div>

                <div className="relative shrink-0 z-30 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsCpDropdownOpen(!isCpDropdownOpen)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2 text-xs font-extrabold text-slate-700 dark:text-slate-200 outline-none cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-1.5 relative w-full sm:min-w-[180px] transition-all text-left"
                  >
                    <span>
                      {selectedCp === "Sespiok" && "SESPI OK x KPP TOP"}
                      {selectedCp === "Akukeren" && "AKU KEREN x BTS YUK"}
                      {selectedCp === "Obf" && "ONE BIG FAMILY (OBF)"}
                      {selectedCp === "3h" && "3H x KEJORA"}
                      {selectedCp === "Pinter" && "PINTER x PASKEUN"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 absolute right-3.5 transition-transform duration-200 ${isCpDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Backdrop transparan untuk menutup dropdown */}
                  {isCpDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-30 bg-transparent" 
                      onClick={() => setIsCpDropdownOpen(false)}
                    />
                  )}

                  {/* Dropdown Menu */}
                  {isCpDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden w-60 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { id: "Sespiok", label: "SESPI OK x KPP TOP" },
                          { id: "Akukeren", label: "AKU KEREN x BTS YUK" },
                          { id: "Obf", label: "ONE BIG FAMILY (OBF)" },
                          { id: "3h", label: "3H x KEJORA" },
                          { id: "Pinter", label: "PINTER x PASKEUN" }
                        ].map((item) => {
                          const isSelected = selectedCp === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedCp(item.id as any);
                                setIsCpDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-bold whitespace-normal break-words transition-colors cursor-pointer ${
                                isSelected 
                                  ? "bg-blue-50/75 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-l-2 border-blue-500" 
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-l-2 border-transparent"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
  
          <div className="h-[400px] w-full relative overflow-y-auto scrollbar-thin pr-1 mt-3 min-w-0">
            <div key={`cp-detail-wrapper-${selectedCp}-${cpSortOrder}`} style={{ height: `${Math.max(380, cpDetailChartData.length * 35)}px`, width: "100%", minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  id="satker-cp-detail-bar-chart"
                  layout="vertical"
                  data={cpDetailChartData}
                  margin={{ top: 2, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                  <XAxis type="number" domain={cpDetailDomain} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: "#64748b", fontSize: 9.5, fontWeight: "bold" }} 
                    axisLine={false} 
                    tickLine={false} 
                    width={180}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
                    {cpDetailChartData.map((entry, index) => (
                      <Cell key={`cell-cp-detail-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Radar Dinamika Capaian CP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm md:text-base font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Radar Dinamika Championship Program</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Dinamika rata-rata skor 5 Championship Program</p>
          </div>

          <div className="h-[400px] w-full flex items-center justify-center relative min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart id="satker-cp-radar-chart" cx="50%" cy="50%" outerRadius="75%" data={programDynamicsData}>
                <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800/25" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: "800" }} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} tickLine={false} />
                <Radar name="Skor Akhir CP" dataKey="Skor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} strokeWidth={2.5} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 5. NNS COMPARISON & IMPACT DETAILS BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Komparasi Dampak NNS per Championship Program */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
          <div className="mb-4 border-b border-slate-50 dark:border-slate-850 pb-2.5">
            <div>
              <h3 className="text-sm md:text-base font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Komparasi Championship Program Budaya Kerja</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Gambaran Perilaku NNS</p>
            </div>
          </div>

          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart id="satker-nns-cp-comparison-chart" data={nnsCpComparisonData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "9px", fontWeight: "bold", paddingTop: "5px" }} />
                <Bar dataKey="3H x KEJORA" fill="#fbbf24" radius={[3, 3, 0, 0]} />
                <Bar dataKey="AKU KEREN x BTS YUK" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ONE BIG FAMILY (OBF)" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PINTER x PASKEUN" fill="#ec4899" radius={[3, 3, 0, 0]} />
                <Bar dataKey="SESPI OK x KPP TOP" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dampak NNS Core Values Horizontal Bars Representation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-sm flex flex-col justify-between space-y-6">
          <div className="border-b border-slate-50 dark:border-slate-850 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">Dampak Nilai-Nilai Strategis (NNS)</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Pengaruh Core Values Bank Indonesia dalam perilaku kerja sehari-hari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 py-2">
            {nnsDampakData.map((dmp) => (
              <div key={dmp.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                  <span className="font-sans">{dmp.name}</span>
                  <span className="font-sans text-[13px] text-slate-800 dark:text-slate-100">{formatScore(dmp.Skor)} <span className="text-[10px] text-slate-400 font-medium font-sans">/ 4,00</span></span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-800" 
                    style={{ 
                      width: `${Math.min(100, (dmp.Skor / 4) * 100)}%`,
                      backgroundColor: cmlColor
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 italic text-center pt-3 border-t border-slate-100 dark:border-slate-850">
            Nilai NNS berperan penting sebagai parameter sekunder untuk penilaian kematangan.
          </p>
        </div>

      </div>

      {/* EXPANDED CP CHART POPUP MODAL */}
      {isCpChartExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          {/* Modal Backdrop click to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => setIsCpChartExpanded(false)} />
          
          {/* Modal Content container */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 dark:text-blue-400">Tampilan Diperluas (Fullscreen)</span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-850 dark:text-slate-100">
                  {activeRecord.satkerLengkap}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                  Indikator Evaluasi CP: <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {selectedCp === "Sespiok" && "SESPI OK x KPP TOP"}
                    {selectedCp === "Akukeren" && "AKU KEREN x BTS YUK"}
                    {selectedCp === "Obf" && "ONE BIG FAMILY (OBF)"}
                    {selectedCp === "3h" && "3H x KEJORA"}
                    {selectedCp === "Pinter" && "PINTER x PASKEUN"}
                  </span>
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setIsCpChartExpanded(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                title="Tutup Tampilan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 scrollbar-thin">
              <div className="bg-blue-50/40 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100/30 dark:border-blue-900/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-blue-800/80 dark:text-blue-300 font-semibold">
                  Tampilan visualisasi penuh ini mempermudah Anda menganalisis pencapaian nilai indikator mikro tanpa adanya pemotongan teks sumbu label.
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Segmented Control for Sort Order in Modal */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCpSortOrder("default")}
                      className={`px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer rounded-lg ${
                        cpSortOrder === "default"
                          ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title="Urutan Asli"
                    >
                      Asli
                    </button>
                    <button
                      type="button"
                      onClick={() => setCpSortOrder("asc")}
                      className={`px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer rounded-lg ${
                        cpSortOrder === "asc"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title="Urutkan Terendah"
                    >
                      Terendah
                    </button>
                    <button
                      type="button"
                      onClick={() => setCpSortOrder("desc")}
                      className={`px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer rounded-lg ${
                        cpSortOrder === "desc"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title="Urutkan Tertinggi"
                    >
                      Tertinggi
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
                    <span>Komponen Skor</span>
                  </div>
                </div>
              </div>

              {/* Chart Expanded Canvas */}
              <div key={`cp-detail-fullscreen-wrapper-${selectedCp}-${cpSortOrder}`} className="w-full relative min-w-0" style={{ height: `${Math.max(450, cpDetailChartData.length * 45)}px`, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    id="satker-cp-detail-expanded-bar-chart"
                    layout="vertical"
                    data={cpDetailChartData}
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                    <XAxis type="number" domain={[0, 4]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" ? parseFloat(v.toFixed(2)).toString() : v} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: "bold" }} 
                      axisLine={false} 
                      tickLine={false} 
                      width={220}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18}>
                      {cpDetailChartData.map((entry, index) => (
                        <Cell key={`cell-cp-detail-expanded-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCpChartExpanded(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Tutup Tampilan Fullscreen
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
