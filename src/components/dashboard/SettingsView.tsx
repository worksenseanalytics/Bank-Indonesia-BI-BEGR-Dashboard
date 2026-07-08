import React, { useState, useMemo } from "react";
import { 
  getPengaturanData, 
  savePengaturanData, 
  getBegrData,
  formatScore 
} from "../../data/dataUtils";
import { 
  Settings, 
  Database, 
  CheckCircle2, 
  Loader2, 
  RotateCcw, 
  Flame, 
  ShieldCheck, 
  Users, 
  Smartphone,
  Sparkles,
  Info,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const currentSettings = useMemo(() => getPengaturanData(), []);
  const begrRecords = useMemo(() => getBegrData(), []);

  const [appTitle, setAppTitle] = useState(currentSettings.appTitle);
  const [adminUser, setAdminUser] = useState(currentSettings.adminUser);
  const [targetMaturity, setTargetMaturity] = useState(currentSettings.targetMaturity);

  const [isSyncing, setIsSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Safety Confirmation Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const parsedTarget = 4.00;
      savePengaturanData({
        appTitle: appTitle.trim(),
        adminUser: adminUser.trim(),
        targetMaturity: parsedTarget
      });
      
      setIsSyncing(false);
      setSuccessMsg("Pengaturan sistem berhasil disimpan secara permanen!");
      
      // dispatch data synced to update header across workspace
      window.dispatchEvent(new CustomEvent('data-synced'));
      
      if ((window as any).addTravelNotification) {
        (window as any).addTravelNotification("edit", `Pengaturan diubah: Judul "${appTitle}"`);
      }
    } catch (err: any) {
      setIsSyncing(false);
      setErrorMsg("Gagal menyimpan: " + err.message);
    }
  };

  const handleReinitializeDatabase = () => {
    setShowResetModal(true);
    setConfirmInput("");
  };

  const executeDatabaseReset = () => {
    setShowResetModal(false);
    setIsSyncing(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (typeof (window as any).google !== 'undefined' && (window as any).google.script?.run) {
      (window as any).google.script.run
        .withSuccessHandler(() => {
          setIsSyncing(false);
          setSuccessMsg("Struktur Database Spreadsheet berhasil dibangun ulang murni!");
          setTimeout(() => window.location.reload(), 1500);
        })
        .withFailureHandler((err: any) => {
          setIsSyncing(false);
          setErrorMsg("Gagal inisialisasi GAS: " + err.message);
        })
        .setup(); // Calls setup.gs script trigger
    } else {
      setIsSyncing(false);
      setSuccessMsg("Mode Pengembang Lokal: Reset berhasil disimulasikan!");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      
      {/* 1. CONFIGURATION FORM (8 Cols) */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-6 shadow-xs lg:col-span-8 space-y-6">
        
        <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold font-sans text-slate-855 dark:text-white flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-amber-500" />
            <span>Konfigurasi Utama Sistem Konsol BEGR</span>
          </h3>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 font-semibold">Atur preferensi nama sistem dan divisi pembina budaya kerja.</p>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-150 dark:border-emerald-850 rounded-2xl text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-150 dark:border-rose-850 rounded-2xl text-rose-800 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <Info className="w-4.5 h-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4 font-medium text-xs font-sans">
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Judul Dashboard</label>
            <input
              type="text"
              required
              placeholder="Contoh: BI-BEGR Culture Dashboard"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/50 border border-slate-200 dark:border-slate-800/50 rounded-xl px-3.5 py-2.5 text-slate-855 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Admin Budker (Divisi Pembina)</label>
            <input
              type="text"
              required
              placeholder="Contoh: Evaluasi Budaya Kerja - Tahap Behavior Exploration dan Group Reflection"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/50 border border-slate-200 dark:border-slate-800/50 rounded-xl px-3.5 py-2.5 text-slate-855 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>



        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSyncing}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Simpan Preferensi</span>
            )}
          </button>
        </div>

      </form>

      {/* 2. OPERATIONAL MAINTENANCE BOX (4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Database Stats info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-5 shadow-xs space-y-4">
          <h4 className="text-[11px] font-extrabold tracking-widest text-slate-450 uppercase block border-b border-slate-100 dark:border-slate-800 pb-2">Status Pangkalan Data</h4>
          
          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Satker Terangkum</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 font-sans">{begrRecords.length} Satker</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jumlah kolom didukung</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 font-sans">94 Kolom</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ekosistem Hosting</span>
              <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg text-[10px] uppercase font-sans">Google Sheets</span>
            </div>
          </div>
        </div>

        {/* Database Re-initializer trigger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/85 rounded-[28px] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-sans text-slate-850 dark:text-white leading-none">Zona Bahaya</h4>
              <p className="text-[10px] text-slate-400 mt-1">Pemeliharaan struktur & inisiasi ulang sistem</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Membangun ulang struktur tabel 94 kolom di lembar spreadsheet aktif. Ini menyinkronkan header kolom bawaan dan mereset data ke contoh record awal.
          </p>

          <button
            type="button"
            onClick={handleReinitializeDatabase}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-650 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Inisiasi Ulang Spreadsheet</span>
          </button>
        </div>

      </div>

      {/* Safety Double-Confirmation Modal Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[28px] p-6 max-w-md w-full shadow-2xl space-y-5 transform scale-in duration-200">
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-400 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-sans text-slate-855 dark:text-white">
                  Peringatan Keamanan Kritis
                </h3>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans space-y-2.5">
              <p>
                Anda akan melakukan <strong>Inisiasi Ulang Spreadsheet</strong>. Konsekuensi dari tindakan destruktif ini meliputi:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-slate-400">
                <li>Seluruh data Satker kustom yang ada saat ini di spreadsheet akan <strong>dihapus secara permanen</strong>.</li>
                <li>Struktur tabel spreadsheet akan dipulihkan secara paksa ke format awal 94 kolom.</li>
                <li>Sistem akan menyuntikkan kembali 5 contoh record Satker default untuk keperluan demonstrasi dasbor.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Ketik kata kunci <span className="text-rose-600 dark:text-rose-400 select-all font-black">"INISIASI ULANG"</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Ketik kata kunci di sini..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/50 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-850 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={confirmInput !== "INISIASI ULANG"}
                onClick={executeDatabaseReset}
                className={cn(
                  "px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all",
                  confirmInput === "INISIASI ULANG"
                    ? "bg-rose-650 hover:bg-rose-700 text-white shadow-rose-600/10"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-transparent cursor-not-allowed shadow-none"
                )}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Bangun Ulang Sekarang</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
