const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join('c:', 'Users', 'IKHSAN KAMAL', 'Downloads', 'remix_-bi', 'src', 'components', 'dashboard', 'BeforeTripView.tsx');

const content = `import React, { useState, useMemo, useRef } from "react";
import { 
  getBegrData, 
  saveBegrRecord, 
  addBegrRecord, 
  deleteBegrRecord, 
  getPengaturanData, 
  formatScore, 
  parseNum,
  BegrRecord 
} from "../../data/dataUtils";
import { 
  Plus, Trash2, Edit2, Search, Filter, FileSpreadsheet, FileText, 
  CheckCircle, AlertTriangle, ChevronRight, X, Sliders, Database, Target
} from "lucide-react";

const InputNumber = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</label>
    <input 
      type="number" step="0.01" min="0" max="5" 
      value={value} 
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-white"
    />
  </div>
);

export function BeforeTripView() {
  const [records, setRecords] = useState<BegrRecord[]>(() => getBegrData());
  const { targetMaturity } = useMemo(() => getPengaturanData(), []);

  // UI States
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "info" | "error" | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("SEMUA");
  const [filterRubrik, setFilterRubrik] = useState("SEMUA");
  const [filterKategori, setFilterKategori] = useState("SEMUA");
  const [filterKelulusan, setFilterKelulusan] = useState("SEMUA");

  // Modal States
  const [selectedRecord, setSelectedRecord] = useState<BegrRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeTab, setActiveTab] = useState("SESPIOK");

  // Form Metadata
  const [formSatker, setFormSatker] = useState("");
  const [formKelompok, setFormKelompok] = useState("KP A");
  const [formJenis, setFormJenis] = useState("KP");
  const [formKategori, setFormKategori] = useState("A");
  const [formRubrik, setFormRubrik] = useState("DKEM");

  // Form Data Model
  const [formData, setFormData] = useState<any>({});

  const showToast = (msg: string, type: "success" | "info" | "error") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => { setToastMsg(""); setToastType(""); }, 4500);
  };

  const initFormData = (rec: BegrRecord | null) => {
    setFormData({
      // SESPIOK
      skorDeepDiveSespiok: rec?.skorDeepDiveSespiok || 4.0,
      skorPersonaWalkthroughSespiok: rec?.skorPersonaWalkthroughSespiok || 4.0,
      keterlibatanSespiok: rec?.keterlibatanSespiok || 4.0,
      kesesuaianEvpKepemimpinanSespiok: rec?.kesesuaianEvpKepemimpinanSespiok || 4.0,
      kesesuaianBiPrestasiSespiok: rec?.kesesuaianBiPrestasiSespiok || 4.0,
      trustIntegritySespiok: rec?.trustIntegritySespiok || 4.0,
      professionalismSespiok: rec?.professionalismSespiok || 4.0,
      excellenceSespiok: rec?.excellenceSespiok || 4.0,
      publicInterestSespiok: rec?.publicInterestSespiok || 4.0,
      coordinationTeamworkSespiok: rec?.coordinationTeamworkSespiok || 4.0,

      // AKUKEREN
      skorDeepDiveAkukeren: rec?.skorDeepDiveAkukeren || 4.0,
      skorPersonaWalkthroughAkukeren: rec?.skorPersonaWalkthroughAkukeren || 4.0,
      skorRealityCheckAkukeren: rec?.skorRealityCheckAkukeren || 4.0,
      keterlibatanAkukeren: rec?.keterlibatanAkukeren || 4.0,
      kesesuaianEvpKepemimpinanAkukeren: rec?.kesesuaianEvpKepemimpinanAkukeren || 4.0,
      kesesuaianBiDigitalAkukeren: rec?.kesesuaianBiDigitalAkukeren || 4.0,
      trustIntegrityAkukeren: rec?.trustIntegrityAkukeren || 4.0,
      professionalismAkukeren: rec?.professionalismAkukeren || 4.0,
      excellenceAkukeren: rec?.excellenceAkukeren || 4.0,
      publicInterestAkukeren: rec?.publicInterestAkukeren || 4.0,
      coordinationTeamworkAkukeren: rec?.coordinationTeamworkAkukeren || 4.0,

      // OBF
      skorDeepDiveObf: rec?.skorDeepDiveObf || 4.0,
      skorPersonaWalkthroughObf: rec?.skorPersonaWalkthroughObf || 4.0,
      skorRealityCheckObf: rec?.skorRealityCheckObf || 4.0,
      keterlibatanObf: rec?.keterlibatanObf || 4.0,
      kesesuaianEvpKeluargaObf: rec?.kesesuaianEvpKeluargaObf || 4.0,
      kesesuaianBiInovasiObf: rec?.kesesuaianBiInovasiObf || 4.0,
      trustIntegrityObf: rec?.trustIntegrityObf || 4.0,
      professionalismObf: rec?.professionalismObf || 4.0,
      excellenceObf: rec?.excellenceObf || 4.0,
      publicInterestObf: rec?.publicInterestObf || 4.0,
      coordinationTeamworkObf: rec?.coordinationTeamworkObf || 4.0,

      // 3H
      skorDeepDive3h: rec?.skorDeepDive3h || 4.0,
      skorPersonaWalkthrough3h: rec?.skorPersonaWalkthrough3h || 4.0,
      skorRealityCheck3h: rec?.skorRealityCheck3h || 4.0,
      keterlibatan3h: rec?.keterlibatan3h || 4.0,
      kesesuaianEvpKesejahteraan3h: rec?.kesesuaianEvpKesejahteraan3h || 4.0,
      kesesuaianBiSpiritual3h: rec?.kesesuaianBiSpiritual3h || 4.0,
      trustIntegrity3h: rec?.trustIntegrity3h || 4.0,
      professionalism3h: rec?.professionalism3h || 4.0,
      excellence3h: rec?.excellence3h || 4.0,
      publicInterest3h: rec?.publicInterest3h || 4.0,
      coordinationTeamwork3h: rec?.coordinationTeamwork3h || 4.0,

      // PINTER
      skorDeepDivePinter: rec?.skorDeepDivePinter || 4.0,
      skorPersonaWalkthroughPinter: rec?.skorPersonaWalkthroughPinter || 4.0,
      keterlibatanPinter: rec?.keterlibatanPinter || 4.0,
      kesesuaianEvpKesejahteraanPinter: rec?.kesesuaianEvpKesejahteraanPinter || 4.0,
      kesesuaianBiSpiritualPinter: rec?.kesesuaianBiSpiritualPinter || 4.0,
      trustIntegrityPinter: rec?.trustIntegrityPinter || 4.0,
      professionalismPinter: rec?.professionalismPinter || 4.0,
      excellencePinter: rec?.excellencePinter || 4.0,
      publicInterestPinter: rec?.publicInterestPinter || 4.0,
      coordinationTeamworkPinter: rec?.coordinationTeamworkPinter || 4.0,

      // NNS
      trustIntegrity: rec?.trustIntegrity || 4.0,
      professionalism: rec?.professionalism || 4.0,
      excellence: rec?.excellence || 4.0,
      publicInterest: rec?.publicInterest || 4.0,
      coordinationTeamwork: rec?.coordinationTeamwork || 4.0,
    });
  };

  const handleOpenEdit = (rec: BegrRecord) => {
    setSelectedRecord(rec);
    setIsEditing(true);
    setIsAddingNew(false);
    setActiveTab("SESPIOK");
    
    setFormSatker(rec.satkerLengkap);
    setFormKelompok(rec.kelompokBudker);
    setFormJenis(rec.jenis || "KP");
    setFormKategori(rec.kategori || "A");
    setFormRubrik(rec.rubrik);
    
    initFormData(rec);
  };

  const handleOpenAdd = () => {
    setSelectedRecord(null);
    setIsEditing(false);
    setIsAddingNew(true);
    setActiveTab("SESPIOK");
    
    setFormSatker("");
    setFormKelompok("KP A");
    setFormJenis("KP");
    setFormKategori("A");
    setFormRubrik("DKEM");
    
    initFormData(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSatker.trim()) {
      showToast("Nama Satker lengkap tidak boleh kosong!", "error");
      return;
    }

    const payload: any = {
      kelompokBudker: formKelompok.trim(),
      jenis: formJenis,
      kategori: formKategori,
      rubrik: formRubrik.trim().toUpperCase(),
      satkerLengkap: formSatker.trim(),
      rawArray: selectedRecord ? selectedRecord.rawArray : [],
      ...formData
    };

    if (isEditing && selectedRecord) {
      const updatedRecord: BegrRecord = { ...payload, no: selectedRecord.no };
      saveBegrRecord(updatedRecord, records);
      showToast(\`Satker \${formSatker} berhasil diperbarui!\`, "success");
      setIsEditing(false);
      setSelectedRecord(null);
    } else {
      addBegrRecord(payload, records);
      showToast(\`Satker baru \${formSatker} berhasil didaftarkan!\`, "success");
      setIsAddingNew(false);
    }

    setTimeout(() => { setRecords(getBegrData()); }, 100);
  };

  const handleDelete = (no: number, name: string) => {
    if (window.confirm(\`Apakah Anda yakin ingin menghapus Satker "\${name}"? Tindakan ini bersifat permanen.\`)) {
      deleteBegrRecord(no, records);
      showToast(\`Satker \${name} berhasil dihapus!\`, "success");
      setTimeout(() => setRecords(getBegrData()), 100);
    }
  };

  // Filters logic
  const uniqueKelompoks = useMemo(() => ["SEMUA", ...Array.from(new Set(records.map(r => r.kelompokBudker))).filter(Boolean)], [records]);
  const uniqueRubriks = useMemo(() => ["SEMUA", ...Array.from(new Set(records.map(r => r.rubrik))).filter(Boolean)], [records]);
  const uniqueKategoris = useMemo(() => ["SEMUA", ...Array.from(new Set(records.map(r => r.kategori))).filter(Boolean)], [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = String(r.satkerLengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(r.kelompokBudker || '').toLowerCase().includes(searchQuery.toLowerCase());
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
    return {
      total, passing, failing: total - passing,
      passPercent: total > 0 ? Math.round((passing / total) * 100) : 0,
      avgCml: total > 0 ? filteredRecords.reduce((sum, r) => sum + (r.cultureMaturityLevel || 0), 0) / total : 0
    };
  }, [filteredRecords, targetMaturity]);

  const renderTabContent = () => {
    const updateField = (key: string, val: number) => setFormData((prev: any) => ({ ...prev, [key]: val }));
    
    if (activeTab === "SESPIOK") return (
      <div className="grid grid-cols-2 gap-4">
        <InputNumber label="Skor Deep Dive" value={formData.skorDeepDiveSespiok} onChange={v => updateField('skorDeepDiveSespiok', v)} />
        <InputNumber label="Skor Persona Walkthrough" value={formData.skorPersonaWalkthroughSespiok} onChange={v => updateField('skorPersonaWalkthroughSespiok', v)} />
        <InputNumber label="Keterlibatan" value={formData.keterlibatanSespiok} onChange={v => updateField('keterlibatanSespiok', v)} />
        <InputNumber label="Kesesuaian EVP Kepemimpinan" value={formData.kesesuaianEvpKepemimpinanSespiok} onChange={v => updateField('kesesuaianEvpKepemimpinanSespiok', v)} />
        <InputNumber label="Kesesuaian BI Prestasi" value={formData.kesesuaianBiPrestasiSespiok} onChange={v => updateField('kesesuaianBiPrestasiSespiok', v)} />
        <InputNumber label="Trust & Integrity" value={formData.trustIntegritySespiok} onChange={v => updateField('trustIntegritySespiok', v)} />
        <InputNumber label="Professionalism" value={formData.professionalismSespiok} onChange={v => updateField('professionalismSespiok', v)} />
        <InputNumber label="Excellence" value={formData.excellenceSespiok} onChange={v => updateField('excellenceSespiok', v)} />
        <InputNumber label="Public Interest" value={formData.publicInterestSespiok} onChange={v => updateField('publicInterestSespiok', v)} />
        <InputNumber label="Coordination & Teamwork" value={formData.coordinationTeamworkSespiok} onChange={v => updateField('coordinationTeamworkSespiok', v)} />
      </div>
    );
    if (activeTab === "AKUKEREN") return (
      <div className="grid grid-cols-2 gap-4">
        <InputNumber label="Skor Deep Dive" value={formData.skorDeepDiveAkukeren} onChange={v => updateField('skorDeepDiveAkukeren', v)} />
        <InputNumber label="Skor Persona Walkthrough" value={formData.skorPersonaWalkthroughAkukeren} onChange={v => updateField('skorPersonaWalkthroughAkukeren', v)} />
        <InputNumber label="Skor Reality Check" value={formData.skorRealityCheckAkukeren} onChange={v => updateField('skorRealityCheckAkukeren', v)} />
        <InputNumber label="Keterlibatan" value={formData.keterlibatanAkukeren} onChange={v => updateField('keterlibatanAkukeren', v)} />
        <InputNumber label="Kesesuaian EVP Kepemimpinan" value={formData.kesesuaianEvpKepemimpinanAkukeren} onChange={v => updateField('kesesuaianEvpKepemimpinanAkukeren', v)} />
        <InputNumber label="Kesesuaian BI Digital" value={formData.kesesuaianBiDigitalAkukeren} onChange={v => updateField('kesesuaianBiDigitalAkukeren', v)} />
        <InputNumber label="Trust & Integrity" value={formData.trustIntegrityAkukeren} onChange={v => updateField('trustIntegrityAkukeren', v)} />
        <InputNumber label="Professionalism" value={formData.professionalismAkukeren} onChange={v => updateField('professionalismAkukeren', v)} />
        <InputNumber label="Excellence" value={formData.excellenceAkukeren} onChange={v => updateField('excellenceAkukeren', v)} />
        <InputNumber label="Public Interest" value={formData.publicInterestAkukeren} onChange={v => updateField('publicInterestAkukeren', v)} />
        <InputNumber label="Coordination & Teamwork" value={formData.coordinationTeamworkAkukeren} onChange={v => updateField('coordinationTeamworkAkukeren', v)} />
      </div>
    );
    if (activeTab === "OBF") return (
      <div className="grid grid-cols-2 gap-4">
        <InputNumber label="Skor Deep Dive" value={formData.skorDeepDiveObf} onChange={v => updateField('skorDeepDiveObf', v)} />
        <InputNumber label="Skor Persona Walkthrough" value={formData.skorPersonaWalkthroughObf} onChange={v => updateField('skorPersonaWalkthroughObf', v)} />
        <InputNumber label="Skor Reality Check" value={formData.skorRealityCheckObf} onChange={v => updateField('skorRealityCheckObf', v)} />
        <InputNumber label="Keterlibatan" value={formData.keterlibatanObf} onChange={v => updateField('keterlibatanObf', v)} />
        <InputNumber label="Kesesuaian EVP Keluarga" value={formData.kesesuaianEvpKeluargaObf} onChange={v => updateField('kesesuaianEvpKeluargaObf', v)} />
        <InputNumber label="Kesesuaian BI Inovasi" value={formData.kesesuaianBiInovasiObf} onChange={v => updateField('kesesuaianBiInovasiObf', v)} />
        <InputNumber label="Trust & Integrity" value={formData.trustIntegrityObf} onChange={v => updateField('trustIntegrityObf', v)} />
        <InputNumber label="Professionalism" value={formData.professionalismObf} onChange={v => updateField('professionalismObf', v)} />
        <InputNumber label="Excellence" value={formData.excellenceObf} onChange={v => updateField('excellenceObf', v)} />
        <InputNumber label="Public Interest" value={formData.publicInterestObf} onChange={v => updateField('publicInterestObf', v)} />
        <InputNumber label="Coordination & Teamwork" value={formData.coordinationTeamworkObf} onChange={v => updateField('coordinationTeamworkObf', v)} />
      </div>
    );
    if (activeTab === "3H") return (
      <div className="grid grid-cols-2 gap-4">
        <InputNumber label="Skor Deep Dive" value={formData.skorDeepDive3h} onChange={v => updateField('skorDeepDive3h', v)} />
        <InputNumber label="Skor Persona Walkthrough" value={formData.skorPersonaWalkthrough3h} onChange={v => updateField('skorPersonaWalkthrough3h', v)} />
        <InputNumber label="Skor Reality Check" value={formData.skorRealityCheck3h} onChange={v => updateField('skorRealityCheck3h', v)} />
        <InputNumber label="Keterlibatan" value={formData.keterlibatan3h} onChange={v => updateField('keterlibatan3h', v)} />
        <InputNumber label="Kesesuaian EVP Kesejahteraan" value={formData.kesesuaianEvpKesejahteraan3h} onChange={v => updateField('kesesuaianEvpKesejahteraan3h', v)} />
        <InputNumber label="Kesesuaian BI Spiritual" value={formData.kesesuaianBiSpiritual3h} onChange={v => updateField('kesesuaianBiSpiritual3h', v)} />
        <InputNumber label="Trust & Integrity" value={formData.trustIntegrity3h} onChange={v => updateField('trustIntegrity3h', v)} />
        <InputNumber label="Professionalism" value={formData.professionalism3h} onChange={v => updateField('professionalism3h', v)} />
        <InputNumber label="Excellence" value={formData.excellence3h} onChange={v => updateField('excellence3h', v)} />
        <InputNumber label="Public Interest" value={formData.publicInterest3h} onChange={v => updateField('publicInterest3h', v)} />
        <InputNumber label="Coordination & Teamwork" value={formData.coordinationTeamwork3h} onChange={v => updateField('coordinationTeamwork3h', v)} />
      </div>
    );
    if (activeTab === "PINTER") return (
      <div className="grid grid-cols-2 gap-4">
        <InputNumber label="Skor Deep Dive" value={formData.skorDeepDivePinter} onChange={v => updateField('skorDeepDivePinter', v)} />
        <InputNumber label="Skor Persona Walkthrough" value={formData.skorPersonaWalkthroughPinter} onChange={v => updateField('skorPersonaWalkthroughPinter', v)} />
        <InputNumber label="Keterlibatan" value={formData.keterlibatanPinter} onChange={v => updateField('keterlibatanPinter', v)} />
        <InputNumber label="Kesesuaian EVP Kesejahteraan" value={formData.kesesuaianEvpKesejahteraanPinter} onChange={v => updateField('kesesuaianEvpKesejahteraanPinter', v)} />
        <InputNumber label="Kesesuaian BI Spiritual" value={formData.kesesuaianBiSpiritualPinter} onChange={v => updateField('kesesuaianBiSpiritualPinter', v)} />
        <InputNumber label="Trust & Integrity" value={formData.trustIntegrityPinter} onChange={v => updateField('trustIntegrityPinter', v)} />
        <InputNumber label="Professionalism" value={formData.professionalismPinter} onChange={v => updateField('professionalismPinter', v)} />
        <InputNumber label="Excellence" value={formData.excellencePinter} onChange={v => updateField('excellencePinter', v)} />
        <InputNumber label="Public Interest" value={formData.publicInterestPinter} onChange={v => updateField('publicInterestPinter', v)} />
        <InputNumber label="Coordination & Teamwork" value={formData.coordinationTeamworkPinter} onChange={v => updateField('coordinationTeamworkPinter', v)} />
      </div>
    );
    if (activeTab === "NNS") return (
      <div className="grid grid-cols-2 gap-4">
        <InputNumber label="Trust & Integrity" value={formData.trustIntegrity} onChange={v => updateField('trustIntegrity', v)} />
        <InputNumber label="Professionalism" value={formData.professionalism} onChange={v => updateField('professionalism', v)} />
        <InputNumber label="Excellence" value={formData.excellence} onChange={v => updateField('excellence', v)} />
        <InputNumber label="Public Interest" value={formData.publicInterest} onChange={v => updateField('publicInterest', v)} />
        <InputNumber label="Coordination & Teamwork" value={formData.coordinationTeamwork} onChange={v => updateField('coordinationTeamwork', v)} />
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={\`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-white font-sans text-xs animate-in slide-in-from-top-3 duration-200 \${toastType === "success" ? "bg-emerald-600" : "bg-rose-600"}\`}>
          <CheckCircle className="w-4.5 h-4.5" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Satker</dt>
          <dd className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</dd>
        </div>
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-indigo-500 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rerata Maturity Level</dt>
          <dd className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">{formatScore(stats.avgCml)}</dd>
        </div>
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Memenuhi Target</dt>
          <dd className="mt-2 text-3xl font-bold text-emerald-600">{stats.passing}</dd>
        </div>
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Di Bawah Target</dt>
          <dd className="mt-2 text-3xl font-bold text-rose-600">{stats.failing}</dd>
        </div>
      </dl>

      {/* Datatable Wrapper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[28px] overflow-hidden shadow-xs">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-150 flex justify-between items-center">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Konsol Data Master</h3>
          <div className="flex gap-2">
             <button onClick={handleOpenAdd} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition">
               <Plus className="w-3.5 h-3.5" />
               <span>Tambah Satker</span>
             </button>
          </div>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold uppercase w-12">No</th>
                <th className="py-3 px-4 font-bold uppercase">Satuan Kerja</th>
                <th className="py-3 px-4 font-bold uppercase w-28">Kelompok</th>
                <th className="py-3 px-4 font-bold uppercase w-28 text-center bg-slate-100">Maturity</th>
                <th className="py-3 px-4 font-bold uppercase text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-center">{r.no}</td>
                  <td className="py-3 px-4 font-bold">{r.satkerLengkap}</td>
                  <td className="py-3 px-4">{r.kelompokBudker}</td>
                  <td className="py-3 px-4 text-center font-bold">{formatScore(r.cultureMaturityLevel)}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenEdit(r)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(r.no, r.satkerLengkap)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {(isAddingNew || isEditing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {isEditing ? \`Edit Data: \${formSatker}\` : "Registrasi Satker Baru"}
              </h2>
              <button onClick={() => { setIsAddingNew(false); setIsEditing(false); }} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100">
                <div className="col-span-full">
                  <label className="text-xs font-bold text-slate-500">Nama Satuan Kerja</label>
                  <input type="text" value={formSatker} onChange={e => setFormSatker(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Kelompok Budker</label>
                  <input type="text" value={formKelompok} onChange={e => setFormKelompok(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Rubrik</label>
                  <input type="text" value={formRubrik} onChange={e => setFormRubrik(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
                {["SESPIOK", "AKUKEREN", "OBF", "3H", "PINTER", "NNS"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={\`px-4 py-2 text-sm font-bold border-b-2 whitespace-nowrap transition-colors \${activeTab === tab ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-800"}\`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                {renderTabContent()}
              </div>

            </div>

            <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3">
              <button onClick={() => { setIsAddingNew(false); setIsEditing(false); }} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Batal</button>
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600">
                {isEditing ? "Simpan Perubahan" : "Simpan Data Baru"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(FILE_PATH, content);
console.log('Done generating BeforeTripView.tsx');
