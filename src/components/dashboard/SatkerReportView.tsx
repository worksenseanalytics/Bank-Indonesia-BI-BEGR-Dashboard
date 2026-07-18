import React, { useState, useMemo, useEffect } from "react";
import { 
  getBegrData, 
  formatScore 
} from "../../data/dataUtils";

// ── Gauge / Speedometer Component ──
interface SpeedometerProps {
  score: number;
  className?: string;
}

function Speedometer({ score, className }: SpeedometerProps) {
  const clamped = Math.max(1, Math.min(4, score));
  // Map score (1.00 to 4.00) to needle rotation degrees (-180 to 0)
  const deg = -180 + ((clamped - 1) / 3) * 180;

  return (
    <svg className={className} viewBox="0 0 220 130" overflow="visible">
      {/* Segment 1: Aligned (Rose-Red) */}
      <path
        d="M25 108 A85 85 0 0 1 195 108"
        fill="none"
        stroke="oklch(65% .19 25)"
        strokeWidth="26"
        strokeDasharray="52 300"
      />
      {/* Segment 2: Engaged (Amber-Yellow) */}
      <path
        d="M25 108 A85 85 0 0 1 195 108"
        fill="none"
        stroke="oklch(78% .16 85)"
        strokeWidth="26"
        strokeDasharray="52 300"
        strokeDashoffset="52"
      />
      {/* Segment 3: Enable (Green) */}
      <path
        d="M25 108 A85 85 0 0 1 195 108"
        fill="none"
        stroke="oklch(69% .17 145)"
        strokeWidth="26"
        strokeDasharray="52 300"
        strokeDashoffset="104"
      />
      {/* Segment 4: Empower (Blue) */}
      <path
        d="M25 108 A85 85 0 0 1 195 108"
        fill="none"
        stroke="oklch(64% .18 255)"
        strokeWidth="26"
        strokeDasharray="52 300"
        strokeDashoffset="156"
      />
      {/* Needle Line rotated dynamically */}
      <line
        x1="110"
        y1="108"
        x2="177"
        y2="108"
        stroke="oklch(25% .03 255)"
        strokeWidth="7"
        strokeLinecap="round"
        transform={`rotate(${deg} 110 108)`}
      />
      {/* Center Pivot Circle */}
      <circle
        cx="110"
        cy="108"
        r="10"
        fill="oklch(99% .008 255)"
        stroke="oklch(25% .03 255)"
        strokeWidth="6"
      />
    </svg>
  );
}

export function SatkerReportView() {
  const begrRecords = useMemo(() => getBegrData(), []);
  
  // State for active chosen satker
  const [selectedSatkerNo, setSelectedSatkerNo] = useState<number>(() => {
    return (window as any).selectedSatkerNo || (begrRecords.length > 0 ? begrRecords[0].no : 1);
  });

  // State for editable Periode text
  const [periode, setPeriode] = useState("Evaluasi Budaya Kerja Bank Indonesia 2026");

  // Listen to selection changes from the Layout top bar
  useEffect(() => {
    const handleSatkerChanged = (e: any) => {
      setSelectedSatkerNo(e.detail.no);
    };
    window.addEventListener('satker-changed', handleSatkerChanged);
    return () => window.removeEventListener('satker-changed', handleSatkerChanged);
  }, []);
  
  // Chosen Satker Record
  const activeRecord = useMemo(() => {
    return begrRecords.find(r => r.no === selectedSatkerNo) || begrRecords[0];
  }, [begrRecords, selectedSatkerNo]);

  // Categories helper on the 1.00 - 4.00 scale
  const getCategoryName = (score: number) => {
    if (score < 1.5) return "ALIGNED";
    if (score < 2.5) return "ENGAGED";
    if (score < 3.5) return "ENABLE";
    return "EMPOWER";
  };

  const getBadgeBgColor = (score: number) => {
    const cat = getCategoryName(score);
    if (cat === "ALIGNED") return "var(--red)";
    if (cat === "ENGAGED") return "var(--yellow)";
    if (cat === "ENABLE") return "var(--green)";
    return "var(--blue)";
  };

  if (begrRecords.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 p-8">
        Tidak ada data satuan kerja yang tersedia.
      </div>
    );
  }

  const cmlCategory = getCategoryName(activeRecord.cultureMaturityLevel);
  const cmlBgColor = cmlCategory === "ALIGNED" ? "var(--red)" :
                     cmlCategory === "ENGAGED" ? "var(--yellow)" :
                     cmlCategory === "ENABLE" ? "var(--green)" :
                     "var(--blue)";
  const cmlScoreText = `${cmlCategory} (${formatScore(activeRecord.cultureMaturityLevel)})`;

  return (
    <div className="satker-report-view">
      {/* Scoped CSS styling representing 100% template styling configurations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .satker-report-view {
          --navy: oklch(29% .12 255);
          --navy2: oklch(22% .09 255);
          --ink: oklch(25% .03 255);
          --muted: oklch(51% .03 255);
          --line: oklch(87% .025 255);
          --soft: oklch(96% .025 255);
          --paper: oklch(99% .008 255);
          --blue: oklch(64% .18 255);
          --green: oklch(69% .17 145);
          --yellow: oklch(78% .16 85);
          --red: oklch(65% .19 25);
          --shadow: 0 16px 44px oklch(25% .03 255 / .13);
          
          background: oklch(95% .018 255);
          color: var(--ink);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
          padding: 24px 18px 42px;
          min-height: 100vh;
        }

        .satker-report-view * {
          box-sizing: border-box;
        }

        /* Editbar styling */
        .satker-report-view .editbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
          width: min(1180px, 100%);
          margin: 0 auto 12px auto;
        }

        .satker-report-view .hint {
          flex: 1 1 100%;
          font-size: 11px;
          color: var(--muted);
        }

        .satker-report-view .field {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border: 1px solid var(--line);
          border-radius: 9px;
          background: var(--paper);
        }

        .satker-report-view .field label {
          font-weight: 800;
          color: var(--navy);
        }

        .satker-report-view .field input {
          width: 230px;
          border: 0;
          border-bottom: 1px solid var(--line);
          padding: 3px;
          background: transparent;
          color: var(--ink);
          outline: none;
        }

        /* Scrollable wrapper for WYSIWYG correctness */
        .satker-report-view .preview-container {
          overflow-x: auto;
          padding-bottom: 1rem;
          scrollbar-width: thin;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Page locked to exactly 1180px in screen preview to prevent wrap shifts */
        @media screen {
          .satker-report-view .page {
            width: 1180px !important;
            min-width: 1180px !important;
            height: 664px !important;
            min-height: 664px !important;
            flex-shrink: 0;
          }
        }

        .satker-report-view .page {
          padding: 10px;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 15px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .satker-report-view .topbar {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          background: var(--navy2);
          color: var(--paper);
          border-radius: 11px;
        }

        .satker-report-view .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .satker-report-view .mark {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border: 2px solid var(--yellow);
          border-radius: 50%;
          color: var(--yellow);
          font-weight: 900;
          font-size: 17px;
        }

        .satker-report-view .brand strong {
          display: block;
          font-size: 16px;
          line-height: 1.05;
        }

        .satker-report-view .brand small {
          display: block;
          color: oklch(80% .04 255);
          font-size: 9px;
        }

        .satker-report-view .office {
          padding: 7px 12px;
          text-align: right;
          border: 1px solid oklch(99% .008 255 / .22);
          border-radius: 8px;
          background: oklch(99% .008 255 / .1);
        }

        .satker-report-view .office small {
          display: block;
          color: var(--yellow);
          font-size: 9px;
          font-weight: 900;
        }

        .satker-report-view .office strong {
          font-size: 12px;
          color: var(--paper);
        }

        .satker-report-view .main {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 8px;
          margin-top: 8px;
        }

        .satker-report-view .content,
        .satker-report-view .strategic {
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--paper);
        }

        .satker-report-view .side {
          padding: 10px 8px;
        }

        .satker-report-view .side h2 {
          margin: 0;
          text-align: center;
          color: var(--navy);
          font-size: 13px;
          font-weight: 900;
        }

        .satker-report-view .sub {
          display: block;
          margin: 4px 0 8px;
          text-align: center;
          color: var(--muted);
          font-size: 10px;
        }

        .satker-report-view .meter {
          display: block;
          width: 175px !important;
          height: 101px !important;
          margin: auto;
          overflow: visible !important;
        }

        .satker-report-view .score {
          width: 145px;
          margin: 3px auto 8px;
          padding: 6px;
          text-align: center;
          border-radius: 7px;
          color: var(--paper);
          font-size: 10px;
          font-weight: 900;
        }

        .satker-report-view .legend {
          display: grid;
          gap: 4px;
        }

        .satker-report-view .legend-item {
          padding: 5px 6px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--paper);
        }

        .satker-report-view .legend-item b {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 800;
        }

        .satker-report-view .legend-item span {
          display: block;
          margin-top: 2px;
          color: var(--muted);
          font-size: 8px;
          line-height: 1.22;
        }

        .satker-report-view .aligned b { color: var(--red); }
        .satker-report-view .engaged b { color: var(--yellow); }
        .satker-report-view .enable b { color: var(--green); }
        .satker-report-view .empower { background: var(--soft); }
        .satker-report-view .empower b { color: var(--blue); }

        .satker-report-view .content {
          padding: 8px;
        }

        .satker-report-view .section-title {
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--navy);
          color: var(--paper);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .06em;
          white-space: nowrap;
        }

        .satker-report-view .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 6px;
        }

        .satker-report-view .quick {
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding: 5px 7px;
          border: 1px solid var(--line);
          border-radius: 9px;
          background: var(--paper);
        }

        .satker-report-view .quick small {
          display: block;
          font-size: 8px;
          font-weight: 800;
          color: var(--muted);
        }

        .satker-report-view .quick strong {
          display: block;
          margin-top: 2px;
          font-size: 11px;
        }

        .satker-report-view .badge {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          color: var(--paper);
          font-size: 8px;
          font-weight: 900;
          white-space: nowrap;
        }

        .satker-report-view .divider {
          height: 1px;
          margin: 8px 0;
          background: var(--line);
        }

        .satker-report-view .programs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .satker-report-view .program {
          min-height: 260px;
          padding: 6px;
          border: 1px solid var(--line);
          border-radius: 11px;
          background: var(--paper);
        }

        .satker-report-view .program-head {
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
          border-radius: 7px;
          background: var(--soft);
          color: var(--navy);
          font-size: 9px;
          font-weight: 900;
        }

        .satker-report-view .program-card {
          padding: 6px;
          margin-top: 5px;
          border: 1px solid var(--line);
          border-radius: 11px;
          box-shadow: 0 3px 9px oklch(25% .03 255 / .04);
          background: var(--paper);
        }

        .satker-report-view .program-card h3 {
          margin: 0 0 5px;
          font-size: 10px;
          color: var(--navy);
          font-weight: 800;
        }

        .satker-report-view .metric {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 5px;
          color: var(--muted);
          font-size: 8px;
          font-weight: 800;
        }

        .satker-report-view .metric .badge {
          font-size: 7px;
          padding: 3px 6px;
        }

        .satker-report-view .strategic {
          margin-top: 8px;
          overflow: visible;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .satker-report-view .strategic .section-title {
          height: 27px;
          border-radius: 8px 8px 0 0;
          font-size: 11px;
        }

        .satker-report-view .values {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          padding: 8px 10px;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .satker-report-view .value {
          min-width: 0;
          min-height: 98px;
          padding: 6px 6px;
          text-align: center;
          break-inside: avoid;
          page-break-inside: avoid;
          overflow: visible;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }

        .satker-report-view .value h3 {
          margin: 0 0 4px 0;
          color: var(--muted);
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
        }

        .satker-report-view .value .meter {
          width: 104px !important;
          height: 59px !important;
          margin: 4px auto !important;
          display: block !important;
          overflow: visible !important;
        }

        .satker-report-view .value .score {
          width: 108px;
          margin: 3px auto 0;
          padding: 4.5px;
          font-size: 8px;
          border-radius: 5px;
        }

        .satker-report-view .foot {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          padding: 6px 3px 0;
          border-top: 1px solid var(--line);
          color: var(--muted);
          font-size: 8px;
        }

        .satker-report-view .info {
          width: 15px;
          height: 15px;
          display: grid;
          place-items: center;
          border: 2px solid var(--muted);
          border-radius: 50%;
          font-weight: 900;
          flex: none;
        }

        @media(max-width: 900px) {
          .satker-report-view .main { grid-template-columns: 1fr; }
          .satker-report-view .quick-grid { grid-template-columns: repeat(2, 1fr); }
          .satker-report-view .programs { grid-template-columns: 1fr 1fr; }
          .satker-report-view .values { grid-template-columns: repeat(3, 1fr); }
        }

        @media(max-width: 600px) {
          .satker-report-view .programs { grid-template-columns: 1fr; }
          .satker-report-view .values { grid-template-columns: repeat(2, 1fr); }
          .satker-report-view .value:last-child { grid-column: 1/-1; }
          .satker-report-view .field { width: 100%; }
          .satker-report-view .field input { flex: 1; width: auto; }
        }

        /* Print formatting overlay - aligned with beautiful screen proportions */
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          .satker-report-view {
            background: #ffffff !important;
            padding: 0 !important;
            min-height: 0 !important;
          }
          .satker-report-view .editbar { display: none !important; }
          .satker-report-view .preview-container {
            overflow: visible !important;
            padding: 0 !important;
            display: block !important;
          }
          .satker-report-view .page {
            width: 1180px !important;
            min-width: 1180px !important;
            height: 664px !important;
            min-height: 664px !important;
            padding: 10px !important;
            border: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          /* Shrink gauges (speedometers) when printing */
          .satker-report-view .side .meter {
            width: 140px !important;
            height: 81px !important;
            margin: 0 auto 8px auto !important;
          }
          .satker-report-view .value .meter {
            width: 80px !important;
            height: 46px !important;
            margin: 4px auto !important;
          }
          .satker-report-view .value .score {
            width: 100% !important;
            max-width: 82px !important;
            font-size: 7px !important;
            padding: 3px !important;
            margin-top: 4px !important;
          }
          /* Shrink badges (EMPOWER, etc.) when printing */
          .satker-report-view .badge {
            font-size: 6.5px !important;
            padding: 2.5px 5px !important;
            border-radius: 4px !important;
          }
          .satker-report-view .metric .badge {
            font-size: 5.5px !important;
            padding: 2px 4px !important;
          }
        }
      ` }} />

      {/* 1. EDIT BAR (Hidden when printing) */}
      <div className="editbar" data-print-hide>
        <div className="hint">
          Bagian nilai strategis dibuat <b>fixed-height</b>, tidak boleh pemisahan halaman, judul tidak boleh baris baru, dan semua indikator tetap satu baris saat print.
        </div>
        <div className="field">
          <label>Periode</label>
          <input 
            id="periode" 
            type="text"
            value={periode} 
            onChange={(e) => setPeriode(e.target.value)} 
          />
        </div>
        <div className="field">
          <label>Satker</label>
          <input 
            id="satker" 
            type="text"
            value={activeRecord.satkerLengkap} 
            readOnly 
            className="cursor-not-allowed opacity-80"
          />
        </div>
      </div>

      {/* 2. MAIN REPORT PAGE IN SCROLL PREVIEW WRAPPER */}
      <div className="preview-container">
        <section id="satker-report-card" className="page">
          {/* Topbar */}
          <header className="topbar">
            <div className="brand">
              <div className="mark">BI</div>
              <div>
                <strong>LAPORAN BE-GR PER SATKER</strong>
                <small id="periodeText">{periode}</small>
              </div>
            </div>
            <div className="office">
              <small>
                {activeRecord.jenis === "KP" 
                  ? "KANTOR PUSAT BANK INDONESIA" 
                  : "KANTOR PERWAKILAN BANK INDONESIA"}
              </small>
              <strong id="satkerText">{activeRecord.satkerLengkap.toUpperCase()}</strong>
            </div>
          </header>

          {/* Main Section */}
          <div className="main">
            {/* Left Speedometer Panel */}
            <aside className="side">
              <h2>CULTURE MATURITY LEVEL</h2>
              <span className="sub">(CML) Speedometer</span>
              
              {/* Speedometer SVG */}
              <Speedometer score={activeRecord.cultureMaturityLevel} className="meter" />
              
              <div className="score" style={{ backgroundColor: cmlBgColor }}>
                {cmlScoreText}
              </div>

              {/* CML Legend Info */}
              <div className="legend">
                <div className="legend-item aligned">
                  <b><span>ALIGNED</span><span>&lt; 1.50</span></b>
                  <span>Program berjalan namun belum sepenuhnya efektif membangun nilai strategis.</span>
                </div>
                <div className="legend-item engaged">
                  <b><span>ENGAGED</span><span>1.50 - 2.50</span></b>
                  <span>Program berdampak pada sebagian nilai strategis.</span>
                </div>
                <div className="legend-item enable">
                  <b><span>ENABLE</span><span>2.50 - 3.50</span></b>
                  <span>Program berdampak pada seluruh nilai strategis.</span>
                </div>
                <div className="legend-item empower">
                  <b><span>EMPOWER</span><span>&gt;= 3.50</span></b>
                  <span>Program berdampak luas dan menjaga keberlanjutan.</span>
                </div>
              </div>
            </aside>

            {/* Right Content Panel */}
            <section className="content">
              <div className="section-title">PILAR EMPLOYEE VALUE PROPOSITION (EVP)</div>
              
              {/* 4 Pilar metrics */}
              <div className="quick-grid">
                <div className="quick">
                  <div>
                    <small>EVP KEPEMIMPINAN</small>
                    <strong>BI PRESTASI</strong>
                  </div>
                  <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.biPrestasi) }}>
                    {getCategoryName(activeRecord.biPrestasi)}
                  </span>
                </div>

                <div className="quick">
                  <div>
                    <small>EVP KEPEMIMPINAN</small>
                    <strong>BI DIGITAL</strong>
                  </div>
                  <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.biDigital) }}>
                    {getCategoryName(activeRecord.biDigital)}
                  </span>
                </div>

                <div className="quick">
                  <div>
                    <small>EVP KELUARGA</small>
                    <strong>BI INOVASI</strong>
                  </div>
                  <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.biInovasi) }}>
                    {getCategoryName(activeRecord.biInovasi)}
                  </span>
                </div>

                <div className="quick">
                  <div>
                    <small>EVP KESEJAHTERAAN</small>
                    <strong>BI SPIRITUAL</strong>
                  </div>
                  <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.biSpiritual) }}>
                    {getCategoryName(activeRecord.biSpiritual)}
                  </span>
                </div>
              </div>

              <div className="divider"></div>

              {/* 3 Columns for Programs */}
              <div className="programs">
                {/* Column 1: Kepemimpinan programs */}
                <div className="program">
                  <div className="program-head">PROGRAM KEPEMIMPINAN</div>
                  
                  <div className="program-card">
                    <h3>SESPI OK X KPP TOP</h3>
                    <div className="metric">
                      <span>KETERLIBATAN</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.keterlibatanSespiok) }}>
                        {getCategoryName(activeRecord.keterlibatanSespiok)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>KREATIVITAS</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.kesesuaianBiPrestasiSespiok) }}>
                        {getCategoryName(activeRecord.kesesuaianBiPrestasiSespiok)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>NNS IMPACT</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.averageNnsSespiok) }}>
                        {getCategoryName(activeRecord.averageNnsSespiok)}
                      </span>
                    </div>
                  </div>

                  <div className="program-card">
                    <h3>AKU KEREN X BTS YUK</h3>
                    <div className="metric">
                      <span>KETERLIBATAN</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.keterlibatanAkukeren) }}>
                        {getCategoryName(activeRecord.keterlibatanAkukeren)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>KREATIVITAS</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.kesesuaianBiDigitalAkukeren) }}>
                        {getCategoryName(activeRecord.kesesuaianBiDigitalAkukeren)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>NNS IMPACT</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.averageNnsAkukeren) }}>
                        {getCategoryName(activeRecord.averageNnsAkukeren)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Keluarga programs */}
                <div className="program">
                  <div className="program-head">PROGRAM KELUARGA</div>

                  <div className="program-card">
                    <h3>ONE BIG FAMILY (OBF)</h3>
                    <div className="metric">
                      <span>KETERLIBATAN</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.keterlibatanObf) }}>
                        {getCategoryName(activeRecord.keterlibatanObf)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>KREATIVITAS</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.kesesuaianBiInovasiObf) }}>
                        {getCategoryName(activeRecord.kesesuaianBiInovasiObf)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>NNS IMPACT</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.averageNnsObf) }}>
                        {getCategoryName(activeRecord.averageNnsObf)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Kesejahteraan programs */}
                <div className="program">
                  <div className="program-head">PROGRAM KESEJAHTERAAN</div>

                  <div className="program-card">
                    <h3>3H X KEJORA</h3>
                    <div className="metric">
                      <span>KETERLIBATAN</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.keterlibatan3h) }}>
                        {getCategoryName(activeRecord.keterlibatan3h)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>KREATIVITAS</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.kesesuaianBiSpiritual3h) }}>
                        {getCategoryName(activeRecord.kesesuaianBiSpiritual3h)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>NNS IMPACT</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.averageNns3h) }}>
                        {getCategoryName(activeRecord.averageNns3h)}
                      </span>
                    </div>
                  </div>

                  <div className="program-card">
                    <h3>PINTER X PASKEUN</h3>
                    <div className="metric">
                      <span>KETERLIBATAN</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.keterlibatanPinter) }}>
                        {getCategoryName(activeRecord.keterlibatanPinter)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>KREATIVITAS</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.kesesuaianBiSpiritualPinter) }}>
                        {getCategoryName(activeRecord.kesesuaianBiSpiritualPinter)}
                      </span>
                    </div>
                    <div className="metric">
                      <span>NNS IMPACT</span>
                      <span className="badge" style={{ backgroundColor: getBadgeBgColor(activeRecord.averageNnsPinter) }}>
                        {getCategoryName(activeRecord.averageNnsPinter)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Strategic Section: Gambaran Umum NNS */}
          <section className="strategic">
            <div className="section-title">GAMBARAN UMUM NILAI-NILAI STRATEGIS (NNS)</div>
            <div className="values">
              {[
                { name: "TRUST & INTEGRITY", val: activeRecord.trustIntegrity },
                { name: "PROFESSIONALISM", val: activeRecord.professionalism },
                { name: "EXCELLENCE", val: activeRecord.excellence },
                { name: "PUBLIC INTEREST", val: activeRecord.publicInterest },
                { name: "COORD. & TEAMWORK", val: activeRecord.coordinationTeamwork }
              ].map((nns) => {
                const nnsCat = getCategoryName(nns.val);
                const nnsBgColor = nnsCat === "ALIGNED" ? "var(--red)" :
                                   nnsCat === "ENGAGED" ? "var(--yellow)" :
                                   nnsCat === "ENABLE" ? "var(--green)" :
                                   "var(--blue)";
                const nnsScoreText = `${nnsCat} (${formatScore(nns.val)})`;
                return (
                  <div key={nns.name} className="value">
                    <h3>{nns.name}</h3>
                    <Speedometer score={nns.val} className="meter" />
                    <div className="score" style={{ backgroundColor: nnsBgColor }}>
                      {nnsScoreText}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <div className="foot">
            <span className="info">i</span>
            <span>CATATAN: PENILAIAN BERDASARKAN EVALUASI ACTION PLAN YANG DISUSUN OLEH SATUAN KERJA.</span>
          </div>
        </section>
      </div>
    </div>
  );
}
