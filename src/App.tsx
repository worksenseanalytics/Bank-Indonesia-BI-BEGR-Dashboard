import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { OverviewView } from './components/dashboard/OverviewView';
import { RankingView } from './components/dashboard/RankingView';
import { SatkerDetailView } from './components/dashboard/SatkerDetailView';
import { SatkerReportView } from './components/dashboard/SatkerReportView';
import { ReportView } from './components/dashboard/ReportView';
import { BeforeTripView } from './components/dashboard/BeforeTripView'; // Used as Data Master view
import { SettingsView } from './components/dashboard/SettingsView';
import { ThemeProvider } from './components/ThemeProvider';
import { SyncStatus } from './components/ui/SyncStatus';
import { getPengaturanData } from './data/dataUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = getPengaturanData();
    document.title = s.appTitle || "BI-BEGR Culture Dashboard";
    
    const handleSync = () => {
      const sUpdated = getPengaturanData();
      document.title = sUpdated.appTitle || "BI-BEGR Culture Dashboard";
      setTick(t => t + 1); // trigger state sync reload across panels
    };

    window.addEventListener('data-synced', handleSync);
    return () => window.removeEventListener('data-synced', handleSync);
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="begr-culture-theme">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <React.Fragment key={tick}>
          {activeTab === "overview" && <OverviewView setActiveTab={setActiveTab} />}
          {activeTab === "ranking" && <RankingView />}
          {activeTab === "satker-detail" && <SatkerDetailView />}
          {activeTab === "satker-report" && <SatkerReportView />}
          {activeTab === "report" && <ReportView />}
          {activeTab === "data-begr" && <BeforeTripView />}
          {activeTab === "settings" && <SettingsView />}
        </React.Fragment>
      </Layout>
      <SyncStatus />
    </ThemeProvider>
  );
}
