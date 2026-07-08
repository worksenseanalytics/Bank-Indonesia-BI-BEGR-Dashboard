import React, { useState, useMemo, useEffect } from "react";
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  Calculator, 
  Zap, 
  Loader2, 
  Menu, 
  X, 
  Bell, 
  Search, 
  ChevronDown, 
  FileSpreadsheet, 
  FileText, 
  Database as IconDb, 
  Upload, 
  FileDown, 
  Printer, 
  Eye, 
  EyeOff,
  TrendingUp,
  Building2,
  Compass,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getPengaturanData, getBegrData, formatScore } from "../data/dataUtils";
import { captureAndPrint } from "../lib/printHelper";

export interface TravelNotification {
  id: string;
  type: 'tambah' | 'hapus' | 'edit' | 'info';
  detail: string;
  timestamp: string;
  isRead: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: "IKHTISAR BUDAYA",
    items: [
      { id: "overview", label: "OVERVIEW BI WIDE", icon: LayoutDashboard },
      { id: "ranking", label: "DASHBOARD RANKING", icon: TrendingUp },
      { id: "satker-detail", label: "DASHBOARD PER-SATKER", icon: Building2 },
    ]
  },
  {
    groupName: "DATA KONSOLIDASI",
    items: [
      { id: "data-begr", label: "DATA MASTER KONSOL", icon: Database },
    ]
  },
  {
    groupName: "PREFERENCES",
    items: [
      { id: "settings", label: "KONFIGURASI SYSTEM", icon: Settings },
    ]
  }
];

interface PageHeaderInfo {
  title: string;
  subtitle: string;
}

const getPageHeaderInfo = (tabId: string, defaultAdmin: string): PageHeaderInfo => {
  switch (tabId) {
    case "overview":
      return {
        title: "Overview BI Wide",
        subtitle: "Gambaran umum Tingkat Kematangan Budaya Kerja Nasional"
      };
    case "ranking":
      return {
        title: "Dashboard Ranking",
        subtitle: "Pemeringkatan Kinerja Kematangan Budaya Kerja per Satuan Kerja"
      };
    case "satker-detail":
      return {
        title: "Dashboard Per-Satker",
        subtitle: "Ulasan Profil Kematangan Budaya Kerja 360-Derajat Satuan Kerja Terpilih"
      };
    case "data-begr":
      return {
        title: "Data Master Konsol",
        subtitle: "Pangkalan Data Master Pemantauan Konsolidasi Budaya Kerja Terintegrasi"
      };
    case "settings":
      return {
        title: "Konfigurasi System",
        subtitle: `Preferensi Pengaturan Dasbor, Inisialisasi Database, dan Hak Akses Admin`
      };
    default:
      return {
        title: "BI-BEGR Culture Dashboard",
        subtitle: defaultAdmin
      };
  }
};

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { appTitle, adminUser } = getPengaturanData();
  const begrRecords = getBegrData();
  const { title: pageTitle, subtitle: pageSubtitle } = getPageHeaderInfo(activeTab, adminUser);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLabels, setShowLabels] = useState<boolean>(() => {
    const saved = localStorage.getItem("layout-show-labels");
    return saved !== null ? saved === "true" : true;
  });

  const toggleLabels = () => {
    setShowLabels((prev) => {
      const next = !prev;
      localStorage.setItem("layout-show-labels", String(next));
      return next;
    });
  };

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("layout-sidebar-open");
    return saved !== null ? saved === "true" : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("layout-sidebar-open", String(next));
      return next;
    });
  };

  const [lastSync, setLastSync] = useState<string>(
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [isSyncing, setIsSyncing] = useState<boolean>((window as any).isSyncing || false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<TravelNotification[]>(() => {
    const saved = localStorage.getItem('begr_culture_notifications_v1');
    return saved ? JSON.parse(saved) : [
      {
        id: "init",
        type: "info",
        detail: "Sistem Dasbor Budaya KONSOL BEGR berhasil diinisialisasi murni.",
        timestamp: "09:00",
        isRead: false
      }
    ];
  });
  
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q.length < 2) return null;
    return begrRecords.filter(r => 
      String(r.satkerLengkap || '').toLowerCase().includes(q) ||
      String(r.kelompokBudker || '').toLowerCase().includes(q) ||
      String(r.rubrik || '').toLowerCase().includes(q)
    );
  }, [searchQuery, begrRecords]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('begr_culture_notifications_v1', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.setItem('begr_culture_notifications_v1', JSON.stringify([]));
  };

  useEffect(() => {
    const handleSynced = () => {
      setLastSync(
        new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setIsSyncing(false);
    };
    
    const interval = setInterval(() => {
      setIsSyncing((window as any).isSyncing || false);
    }, 1000);

    window.addEventListener("data-synced", handleSynced);

    const handleAddNotif = (e: any) => {
      const { type, detail } = e.detail;
      const newNotif: TravelNotification = {
        id: `notif-${Date.now()}`,
        type,
        detail,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isRead: false
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        localStorage.setItem('begr_culture_notifications_v1', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('travel_add_notification' as any, handleAddNotif);
    
    (window as any).addTravelNotification = (type: 'tambah' | 'hapus' | 'edit' | 'info', detail: string) => {
      const event = new CustomEvent('travel_add_notification', { detail: { type, detail } });
      window.dispatchEvent(event);
    };

    return () => {
      window.removeEventListener("data-synced", handleSynced);
      window.removeEventListener('travel_add_notification' as any, handleAddNotif);
      clearInterval(interval);
    };
  }, []);

  const getActiveTabTitle = () => {
    for (const group of NAV_GROUPS) {
      const match = group.items.find(item => item.id === activeTab);
      if (match) return match.label;
    }
    return appTitle || "BI-BEGR Culture Dashboard";
  };

  const getPdfFileName = () => {
    switch (activeTab) {
      case "overview": return "Dashboard Overview";
      case "ranking": return "Dashboard Ranking";
      case "satker-detail": return "Dashboard Deep Dive Satker";
      case "data-begr": return "Dashboard Master Data BEGR";
      case "settings": return "Dashboard Konfigurasi Sistem";
      default: return "Dashboard";
    }
  };

  const handleSearchFocus = (rec: any) => {
    setActiveTab("data-begr");
    setSearchOpen(false);
    setSearchQuery("");
    setMobileMenuOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('app-search-focus', { detail: { query: rec.satkerLengkap } }));
    }, 150);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-row animate-in fade-in duration-350 print:h-auto print:overflow-visible print:bg-white print:text-black">
      
      {/* Print-only header — visible only during print */}
      <div data-print-header className="hidden items-center justify-between px-2 py-3 border-b-2 border-slate-300 mb-4 w-full">
        <div>
          <h1 className="text-base font-extrabold text-slate-800 tracking-tight">{appTitle || "BI-BEGR Culture Dashboard"}</h1>
          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{adminUser}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-500 font-mono">Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="text-[9px] text-slate-400 font-semibold">Halaman: {getActiveTabTitle()}</p>
        </div>
      </div>

      {/* DESKTOP SIDEBAR — visible on lg and up */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col justify-between bg-[#233C4B] dark:bg-slate-900 border border-[#1b303d] dark:border-slate-800/80 fixed left-4 top-4 bottom-4 rounded-[24px] transition-all duration-300 overflow-hidden z-30 select-none print:hidden will-change-[width]",
          showLabels ? "w-72 xl:w-80 shadow-md border-white/10" : "w-20 shadow-sm"
        )}
        data-print-hide
      >
        {/* Sidebar Header: Logo/Brand */}
        <div className={cn(
          "p-4 border-b border-white/5 flex items-center justify-between w-full transition-all duration-300",
          showLabels ? "px-4" : "justify-center px-0"
        )}>
          {showLabels ? (
            <div className="flex items-center gap-3 transition-opacity duration-300">
              <Database className="text-amber-500 w-5 h-5 shrink-0" />
              <div className="flex flex-col">
                <h1 className="text-sm font-extrabold text-white uppercase tracking-tight whitespace-nowrap">
                  {appTitle || "BI KONSOL"}
                </h1>
                <p className="text-[10px] font-semibold text-[#c7dee9] leading-tight mt-1">
                  {adminUser}
                </p>
              </div>
            </div>
          ) : null}

          {/* Tombol Menu Toggle */}
          <button
            onClick={toggleLabels}
            className={cn(
              "text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer shrink-0",
              showLabels ? "p-1 ml-2" : "p-2"
            )}
            title={showLabels ? "Kolaps Menu" : "Ekspansi Menu"}
          >
            <Menu className={showLabels ? "w-4.5 h-4.5" : "w-5 h-5"} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 w-full">
          {NAV_GROUPS.map((group, index) => (
            <div key={group.groupName} className="space-y-1.5 transition-all duration-300">
              {index > 0 && (
                <div className="border-t border-white/5 pt-4 mt-4" />
              )}
              <span className={cn(
                "text-[9px] text-[#8cb4ca] font-black uppercase tracking-wider block px-2.5 transition-all duration-300 whitespace-nowrap",
                showLabels ? "opacity-100 max-w-[220px] mb-1.5" : "opacity-0 max-w-0 overflow-hidden h-0 pointer-events-none"
              )}>
                {group.groupName}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                        showLabels ? "text-left justify-start gap-2.5" : "justify-center gap-0",
                        isActive 
                          ? "bg-amber-500 text-white shadow-sm" 
                          : "text-[#b4ccd8] hover:text-white hover:bg-white/5"
                      )}
                      title={item.label}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span className={cn(
                        "transition-all duration-300 whitespace-nowrap",
                        showLabels ? "opacity-100 max-w-[220px]" : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
                      )}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Theme Toggle */}
        <div className="p-3 border-t border-white/5 w-full">
          <div className={cn(
            "flex items-center px-3 py-1.5 rounded-xl transition-all duration-300",
            showLabels ? "bg-white/5 border border-white/5 lg:justify-start" : "bg-transparent border-transparent lg:justify-center"
          )}>
            <ThemeToggle />
            <span className={cn(
              "text-[10px] font-bold text-[#b4ccd8] transition-all duration-300 whitespace-nowrap",
              showLabels ? "ml-2 opacity-100 max-w-[150px]" : "ml-0 opacity-0 max-w-0 overflow-hidden pointer-events-none"
            )}>
              Tema Sistem
            </span>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN CONTAINER — sidebar on left, content on right */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden lg:ml-24 transition-all duration-300 print:h-auto print:overflow-visible">
        
        {/* TOP HEADER PANEL — visible on mobile/tablet as navbar, on desktop as toolbar */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 shrink-0 print:hidden" data-print-hide>
          <header className="bg-[#233C4B] lg:bg-white lg:dark:bg-slate-900 shadow-xs border border-[#1b303d] lg:border-slate-200 lg:dark:border-slate-800/80 transition-all duration-300 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 rounded-[24px]">
            
            {/* Left: Mobile Menu Trigger, Desktop Sidebar Toggle, and Title/Subtitle */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-lg lg:text-xl font-extrabold font-sans tracking-tight text-white lg:text-slate-800 lg:dark:text-white leading-tight flex flex-wrap items-center gap-2">
                  <span>{pageTitle}</span>
                </h1>
                <p className="text-[10px] lg:text-xs font-semibold text-[#c7dee9] lg:text-slate-500 lg:dark:text-slate-400 mt-1 truncate max-w-xs sm:max-w-md lg:max-w-2xl">
                  {pageSubtitle}
                </p>
              </div>
            </div>

            {/* Desktop Center Quick Search */}
            <div className="hidden md:flex flex-1 max-w-[150px] lg:max-w-[200px] xl:max-w-xs 2xl:max-w-sm mx-4 transition-all duration-300">
              <button 
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between bg-white/5 lg:bg-slate-50 lg:dark:bg-slate-800/40 hover:bg-white/10 lg:hover:bg-slate-100/80 lg:dark:hover:bg-slate-800/80 transition-all duration-200 border border-white/5 lg:border-slate-200 lg:dark:border-slate-800/50 rounded-xl px-3.5 py-1.5 text-left cursor-pointer"
              >
                <div className="flex items-center overflow-hidden">
                  <Search className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400 text-xs truncate">Cari satker, rubrik, kelompok...</span>
                </div>
                <kbd className="hidden lg:inline-block text-[9px] bg-white/10 lg:bg-slate-200 lg:dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-350 dark:text-slate-400 font-mono shrink-0">⌘K</kbd>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Sync Button */}
              <div className="flex items-center">
                <button
                  onClick={() => {
                    if (typeof (window as any).syncData === "function") {
                      (window as any).syncData();
                    } else {
                      window.dispatchEvent(new CustomEvent('data-synced'));
                    }
                  }}
                  disabled={isSyncing}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 transition-all cursor-pointer rounded-xl font-bold text-[11px] shadow-sm border",
                    isSyncing
                      ? "bg-slate-800/50 text-slate-400 border-transparent cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600 border-transparent text-white"
                  )}
                >
                  {isSyncing ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Zap className="w-4.5 h-4.5" />}
                  <span>{isSyncing ? "Sync..." : "Sinkronisasi"}</span>
                </button>
              </div>

              {/* Print Report Button */}
              <button
                onClick={() => captureAndPrint("main-content", getPdfFileName())}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1b303d] lg:bg-slate-50 lg:dark:bg-slate-850 hover:bg-white/10 lg:hover:bg-slate-100 lg:dark:hover:bg-slate-800 text-[#b4ccd8] lg:text-slate-600 lg:dark:text-slate-350 hover:text-white lg:hover:text-slate-800 lg:dark:hover:text-white transition-all cursor-pointer border border-white/5 lg:border-slate-200 lg:dark:border-slate-800 rounded-xl font-bold text-[11px] shadow-sm"
                title="Cetak laporan halaman aktif dalam mode landscape"
              >
                <Printer className="w-4.5 h-4.5 text-amber-550 shrink-0" />
                <span className="hidden xl:inline">Cetak Laporan</span>
              </button>

              {/* Import/Export Dropdown Backup */}
              <div className="relative">
                <button
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b303d] lg:bg-slate-50 lg:dark:bg-slate-850 hover:bg-white/10 lg:hover:bg-slate-100 lg:dark:hover:bg-slate-800 text-[#b4ccd8] lg:text-slate-600 lg:dark:text-slate-350 hover:text-white lg:hover:text-slate-800 lg:dark:hover:text-white transition-all cursor-pointer border border-white/5 lg:border-slate-200 lg:dark:border-slate-800 rounded-xl font-bold text-[11px] shadow-sm"
                >
                  <FileDown className="w-4.5 h-4.5 text-amber-550 shrink-0" />
                  <span className="hidden xl:inline">Cadangan</span>
                  <ChevronDown className="w-4 h-4 text-slate-450 hidden xl:inline" />
                </button>

                {exportDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 text-xs py-1.5 animate-in fade-in duration-150">
                      <div className="px-3.5 py-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-1.5 mb-1">
                        Sistem Ekspor
                      </div>
                      <button
                        onClick={() => {
                          const dataStr = JSON.stringify((window as any).appData || {}, null, 2);
                          const blob = new Blob([dataStr], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `kematangan_budaya_begr_${new Date().toISOString().split("T")[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          setExportDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer font-bold transition-colors"
                      >
                        <IconDb className="w-4 h-4 text-pink-500" />
                        <span>Backup Sistem (JSON)</span>
                      </button>

                      <label className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer font-bold m-0 transition-colors">
                        <Upload className="w-4 h-4 text-rose-500" />
                        <span>Pulihkan (Import JSON)</span>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const json = JSON.parse(event.target?.result as string);
                                if (window.confirm("Apakah Anda yakin ingin menimpa SELURUH DATA LOKAL dengan backup JSON ini?")) {
                                  (window as any).appData = json;
                                  window.dispatchEvent(new CustomEvent("data-synced"));
                                  setTimeout(() => window.location.reload(), 1000);
                                }
                              } catch (err: any) {
                                alert("Gagal mengimpor JSON: " + err.message);
                              }
                            };
                            reader.readAsText(file);
                          }}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-1.5 rounded-xl hover:bg-white/5 lg:bg-slate-50 lg:dark:bg-slate-850 hover:text-white lg:hover:text-slate-850 text-[#b4ccd8] lg:text-slate-500 lg:dark:text-slate-400 border border-white/5 lg:border-slate-200 lg:dark:border-slate-800 relative transition-transform hover:scale-105 cursor-pointer flex items-center justify-center animate-in"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-[#233C4B] lg:border-white lg:dark:border-slate-900"></span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-xl z-50 animate-in slide-in-from-top-2 duration-150">
                      <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">Log Aktivitas Organisasi</span>
                        {notifications.length > 0 && (
                          <button onClick={handleClearAll} className="text-[10px] text-rose-500 hover:underline font-bold bg-transparent border-none cursor-pointer">Hapus</button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div key={notif.id} className={cn("p-3.5 flex gap-3 text-xs transition-colors", !notif.isRead ? "bg-slate-50/70 dark:bg-slate-800/10" : "")}>
                              <div className="w-7 h-7 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center shrink-0 font-bold uppercase text-[10px]">
                                {notif.type[0]}
                              </div>
                              <div className="flex-1 space-y-1 text-left">
                                <p className="text-slate-750 dark:text-slate-200 leading-normal font-medium">{notif.detail}</p>
                                <span className="text-[10px] text-slate-400 font-mono block">{notif.timestamp}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center text-slate-400 text-xs italic">Belum ada aktivitas baru.</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle only shown on top header for mobile, since sidebar has it for desktop */}
              <div className="lg:hidden">
                <ThemeToggle />
              </div>
            </div>
          </header>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 w-full min-h-0 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 print:overflow-visible print:bg-white">
          <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 pt-4 pb-8 w-full overflow-y-auto animate-in duration-300 print:overflow-visible print:px-2 print:pt-0 print:pb-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Slide-over */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" data-print-hide>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-[280px] bg-[#233C4B] dark:bg-slate-900 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 z-50 p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="text-amber-500 w-5 h-5 animate-pulse" />
                  <span className="font-extrabold text-white text-sm uppercase leading-none">{appTitle || "BI KONSOL"}</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <ul className="space-y-2">
                {NAV_GROUPS.map((group) => (
                  <div key={group.groupName} className="space-y-1">
                    <span className="text-[10px] text-[#b4ccd8] font-bold block pb-1 border-b border-white/5">{group.groupName}</span>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left font-bold text-xs", isActive ? "bg-white/10 text-white" : "text-slate-350 hover:bg-white/5 hover:text-white")}
                        >
                          <Icon className="w-4 h-4 text-amber-500" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </ul>
            </div>
             {/* Mobile Print Button */}
             <button
               onClick={() => {
                 setMobileMenuOpen(false);
                 setTimeout(() => captureAndPrint("main-content", getPdfFileName()), 300);
               }}
               className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left font-bold text-xs text-slate-350 hover:bg-white/5 hover:text-white border border-white/5 cursor-pointer transition-colors"
             >
               <Printer className="w-4 h-4 text-amber-500" />
               <span>Cetak Laporan</span>
             </button>
           </div>
        </div>
      )}

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" data-print-hide>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in">
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4.5 h-4.5 text-slate-400 mr-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik nama Satker atau Rubrik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-750 dark:text-slate-100 text-xs py-1"
              />
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">ESC</span>
            </div>
            
            <div className="max-h-60 overflow-y-auto p-2">
              {searchResults ? (
                searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((rec) => (
                    <button
                      key={rec.no}
                      onClick={() => handleSearchFocus(rec)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl flex flex-col gap-0.5"
                    >
                      <span className="font-extrabold text-xs text-slate-850 dark:text-slate-100">{rec.satkerLengkap}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tight">{rec.kelompokBudker} • Rubrik {rec.rubrik} • Maturity {formatScore(rec.cultureMaturityLevel)}</span>
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 italic text-xs">Satker "{searchQuery}" tidak ditemukan didalam daftar</div>
                )
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">Cari satker dengan mengetik nama satker lengkap atau rubrik singkat (misal: DKEM, KP A).</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
