/**
 * file: setup.gs
 * Fungsi inisialisasi struktur data, tabel, sheet, format kolom, dan sample data KONSOL BEGR.
 * Didesain khusus untuk integrasi ekosistem Google Spreadsheet dan Google Apps Script.
 * [Update Juni 2026] Sumbu Y Dinamis, Filter Bar Tremor Select, & Premium Tooltips.
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('BI KONSOL BEGR')
    .addItem('Inisialisasi Database KONSOL BEGR', 'setupBegrSpreadsheet')
    .addToUi();
}

/**
 * Wrapper function setup() to handle initialization trigger from the SettingsView UI.
 */
function setup() {
  setupBegrSpreadsheet();
}

/**
 * Membuat sheet KONSOL BEGR dan PENGATURAN UMUM jika belum ada, 
 * lengkap dengan header, formula Google Sheets, sample data, pembekuan baris, dan penyesuaian ukuran kolom.
 */
function setupBegrSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Clear any existing caching partitions to prevent reading stale pre-setup data
  if (typeof clearCachedData === 'function') {
    clearCachedData("sheet_data_KONSOL BEGR");
    clearCachedData("sheet_data_PENGATURAN UMUM");
  }
  
  // 1. Generate 94 Headers
  const begrHeaders = Array(94).fill("");
  begrHeaders[0] = "No";
  begrHeaders[1] = "Kelompok Budker";
  begrHeaders[2] = "Jenis";
  begrHeaders[3] = "Kategori";
  begrHeaders[4] = "RUBRIK";
  begrHeaders[5] = "Satker Lengkap";
  begrHeaders[6] = "CULTURE MATURITY LEVEL";
  begrHeaders[7] = "EVP KEPEMIMPINAN";
  begrHeaders[8] = "EVP KELUARGA";
  begrHeaders[9] = "EVP KESEJAHTERAAN";
  begrHeaders[10] = "EVP Kepemimpinan P1 (K)";
  begrHeaders[11] = "EVP Kepemimpinan P2 (L)";
  begrHeaders[12] = "EVP Keluarga P1 (M)";
  begrHeaders[13] = "EVP Kesejahteraan P1 (N)";
  begrHeaders[14] = "Kreativitas Indikator 1 (O)";
  begrHeaders[15] = "Kreativitas Indikator 2 (P)";
  begrHeaders[16] = "Kreativitas Program 1 (Q)";
  begrHeaders[17] = "Col R";
  begrHeaders[18] = "Col S";
  begrHeaders[19] = "Col T";
  begrHeaders[20] = "Kreativitas Program 2 (U)";
  begrHeaders[21] = "Col V";
  begrHeaders[22] = "Col W";
  begrHeaders[23] = "Col X";
  begrHeaders[24] = "Col Y";
  begrHeaders[25] = "Col Z";
  begrHeaders[26] = "BI PRESTASI (AA)";
  begrHeaders[27] = "Col AB";
  begrHeaders[28] = "Col AC";
  begrHeaders[29] = "KETERLIBATAN (SESPIOK X KPPTOP) (AD)";
  begrHeaders[30] = "KESESUAIAN DGN EVP KEPEMIMPINAN (SESPIOK X KPPTOP) (AE)";
  begrHeaders[31] = "KESESUAIAN DGN PILAR BI PRESTASI (SESPIOK X KPPTOP) (AF)";
  begrHeaders[32] = "Col AG";
  begrHeaders[33] = "Col AH";
  begrHeaders[34] = "Col AI";
  begrHeaders[35] = "Col AJ";
  begrHeaders[36] = "Col AK";
  begrHeaders[37] = "Col AL";
  begrHeaders[38] = "BI DIGITAL (AM)";
  begrHeaders[39] = "KETERLIBATAN (AKUKEREN X BTSYUK) (AN)";
  begrHeaders[40] = "KESESUAIAN DGN EVP KEPEMIMPINAN (AKUKEREN X BTSYUK) (AO)";
  begrHeaders[41] = "KESESUAIAN DGN PILAR BI DIGITAL (AKUKEREN X BTSYUK) (AP)";
  begrHeaders[42] = "Average NNS (SESPIOK X KPPTOP) (AQ)";
  begrHeaders[43] = "Col AR";
  begrHeaders[44] = "Col AS";
  begrHeaders[45] = "Col AT";
  begrHeaders[46] = "Col AU";
  begrHeaders[47] = "Col AV";
  begrHeaders[48] = "Col AW";
  begrHeaders[49] = "Col AX";
  begrHeaders[50] = "Col AY";
  begrHeaders[51] = "BI INOVASI (AZ)";
  begrHeaders[52] = "Col BA";
  begrHeaders[53] = "Col BB";
  begrHeaders[54] = "KETERLIBATAN (OBF) (BC)";
  begrHeaders[55] = "KESESUAIAN DGN EVP KELUARGA (OBF) (BD)";
  begrHeaders[56] = "KESESUAIAN DGN PILAR BI INOVASI (OBF) (BE)";
  begrHeaders[57] = "NNS OBF (BF)";
  begrHeaders[58] = "Col BG";
  begrHeaders[59] = "Col BH";
  begrHeaders[60] = "Col BI";
  begrHeaders[61] = "Col BJ";
  begrHeaders[62] = "Col BK";
  begrHeaders[63] = "Col BL";
  begrHeaders[64] = "BI SPIRITUAL P1 (BM)";
  begrHeaders[65] = "SKOR CP 3H X KEJORA (BN)";
  begrHeaders[66] = "Deep Dive Ind 1 (BO)";
  begrHeaders[67] = "Deep Dive Ind 2 (BP)";
  begrHeaders[68] = "KETERLIBATAN (3H X KEJORA) (BQ)";
  begrHeaders[69] = "KESESUAIAN DGN EVP KESEJAHTERAAN (3H X KEJORA) (BR)";
  begrHeaders[70] = "KESESUAIAN DGN PILAR BI SPIRITUAL (3H X KEJORA) (BS)";
  begrHeaders[71] = "KETERLIBATAN (PINTER X PASKEUN) (BT)";
  begrHeaders[72] = "KESESUAIAN DGN EVP KESEJAHTERAAN (PINTER X PASKEUN) (BU)";
  begrHeaders[73] = "KESESUAIAN DGN PILAR BI SPIRITUAL (PINTER X PASKEUN) (BV)";
  begrHeaders[74] = "NNS 3H (BW)";
  begrHeaders[75] = "Col BX";
  begrHeaders[76] = "Col BY";
  begrHeaders[77] = "BI SPIRITUAL P2 (BZ)";
  begrHeaders[78] = "Col CA";
  begrHeaders[79] = "Col CB";
  begrHeaders[80] = "Col CC";
  begrHeaders[81] = "Col CD";
  begrHeaders[82] = "Col CE";
  begrHeaders[83] = "Col CF";
  begrHeaders[84] = "Col CG";
  begrHeaders[85] = "Col CH";
  begrHeaders[86] = "Col CI";
  begrHeaders[87] = "Col CJ";
  begrHeaders[88] = "Col CK";
  begrHeaders[89] = "TRUST & INTEGRITY (CL)";
  begrHeaders[90] = "PROFESSIONALISM (CM)";
  begrHeaders[91] = "EXCELLENCE (CN)";
  begrHeaders[92] = "PUBLIC INTEREST (CO)";
  begrHeaders[93] = "COORDINATION & TEAMWORK (CP)";

  // 2. Generate 5 Sample Rows (Raw Array format with 94 values)
  const generateSampleRow = (no, kelompok, jenis, kategori, rubrik, satker, scores) => {
    const row = Array(94).fill("");
    row[0] = no;
    row[1] = kelompok;
    row[2] = jenis;
    row[3] = kategori;
    row[4] = rubrik;
    row[5] = satker;
    
    // Fill in scores at specific indexes
    row[10] = scores.k;  // K
    row[11] = scores.l;  // L
    row[12] = scores.m;  // M
    row[13] = scores.n;  // N
    row[14] = scores.o;  // O
    row[15] = scores.p;  // P
    row[16] = scores.q;  // Q
    row[20] = scores.u;  // U
    row[26] = scores.aa; // AA (BI PRESTASI)
    row[29] = scores.ad; // AD (Keterlibatan SESPIOK)
    row[30] = scores.ae; // AE (Kesesuaian EVP SESPIOK)
    row[31] = scores.af; // AF (Kesesuaian Pilar SESPIOK)
    row[38] = scores.am; // AM (BI DIGITAL)
    row[39] = scores.an; // AN (Keterlibatan AKUKEREN)
    row[40] = scores.ao; // AO (Kesesuaian EVP AKUKEREN)
    row[41] = scores.ap; // AP (Kesesuaian Pilar AKUKEREN)
    row[42] = scores.aq; // AQ (NNS SESPIOK / AKUKEREN)
    row[51] = scores.az; // AZ (BI INOVASI)
    row[54] = scores.bc; // BC (Keterlibatan OBF)
    row[55] = scores.bd; // BD (Kesesuaian EVP OBF)
    row[56] = scores.be; // BE (Kesesuaian Pilar OBF)
    row[57] = scores.bf; // BF (NNS OBF)
    row[64] = scores.bm; // BM (BI SPIRITUAL P1)
    row[65] = scores.bn; // BN (Skor CP 3H)
    row[66] = scores.bo; // BO (Deep dive Ind 1)
    row[67] = scores.bp; // BP (Deep dive Ind 2)
    row[68] = scores.bq; // BQ (Keterlibatan 3H)
    row[69] = scores.br; // BR (Kesesuaian EVP 3H)
    row[70] = scores.bs; // BS (Kesesuaian Pilar 3H)
    row[71] = scores.bt; // BT (Keterlibatan PINTER)
    row[72] = scores.bu; // BU (Kesesuaian EVP PINTER)
    row[73] = scores.bv; // BV (Kesesuaian Pilar PINTER)
    row[74] = scores.bw; // BW (NNS 3H)
    row[77] = scores.bz; // BZ (BI SPIRITUAL P2)
    
    // Core Values NNS
    row[89] = scores.cl; // CL TRUST
    row[90] = scores.cm; // CM PROFESSIONALISM
    row[91] = scores.cn; // CN EXCELLENCE
    row[92] = scores.co; // CO PUBLIC INTEREST
    row[93] = scores.cp; // CP COORD
    
    // Formulas can be computed/stored or evaluated by our javascript, 
    // but in Google Sheets we write formulas directly to let Excel/Sheets compute them!
    const rIdx = no + 3; // row 3 is header, first data is row 4, and so on...
    row[6] = `=AVERAGE(K${rIdx}:N${rIdx})`;
    row[7] = `=AVERAGE(K${rIdx},L${rIdx})`;
    row[8] = `=M${rIdx}`;
    row[9] = `=N${rIdx}`;
    
    return row;
  };

  const sampleScores1 = {
    k: 4.10, l: 4.30, m: 3.90, n: 4.50, o: 4.00, p: 4.20, q: 3.90, u: 4.10, aa: 4.00,
    ad: 4.20, ae: 4.10, af: 4.00, am: 4.20, an: 3.90, ao: 4.30, ap: 4.25, aq: 4.40,
    az: 3.80, bc: 4.50, bd: 3.90, be: 3.80, bf: 4.10, bm: 4.10, bn: 4.20, bo: 4.30, bp: 4.10,
    bq: 4.10, br: 4.50, bs: 4.20, bt: 4.30, bu: 4.20, bv: 4.10, bw: 4.30, bz: 4.30,
    cl: 4.50, cm: 4.10, cn: 4.30, co: 4.00, cp: 4.40
  };

  const sampleScores2 = {
    k: 3.80, l: 3.90, m: 4.10, n: 4.00, o: 3.70, p: 3.90, q: 3.60, u: 3.90, aa: 3.95,
    ad: 3.90, ae: 3.80, af: 3.90, am: 4.10, an: 3.70, ao: 4.00, ap: 3.95, aq: 4.20,
    az: 4.20, bc: 4.00, bd: 4.15, be: 4.10, bf: 3.95, bm: 3.90, bn: 3.95, bo: 4.00, bp: 3.90,
    bq: 3.90, br: 4.10, bs: 4.00, bt: 4.00, bu: 4.05, bv: 3.90, bw: 4.10, bz: 4.10,
    cl: 4.10, cm: 4.20, cn: 3.95, co: 4.15, cp: 4.10
  };

  const sampleScores3 = {
    k: 4.30, l: 4.50, m: 4.20, n: 4.60, o: 4.40, p: 4.30, q: 4.20, u: 4.50, aa: 4.40,
    ad: 4.40, ae: 4.50, af: 4.35, am: 4.50, an: 4.20, ao: 4.40, ap: 4.50, aq: 4.60,
    az: 4.00, bc: 4.35, bd: 4.30, be: 4.20, bf: 4.40, bm: 4.20, bn: 4.45, bo: 4.50, bp: 4.40,
    bq: 4.30, br: 4.50, bs: 4.40, bt: 4.20, bu: 4.30, bv: 4.25, bw: 4.50, bz: 4.40,
    cl: 4.60, cm: 4.50, cn: 4.55, co: 4.40, cp: 4.60
  };

  const sampleScores4 = {
    k: 3.50, l: 3.70, m: 3.60, n: 3.80, o: 3.50, p: 3.60, q: 3.40, u: 3.60, aa: 3.70,
    ad: 3.60, ae: 3.50, af: 3.60, am: 3.55, an: 3.40, ao: 3.70, ap: 3.65, aq: 3.90,
    az: 3.65, bc: 3.70, bd: 3.55, be: 3.50, bf: 3.70, bm: 3.50, bn: 3.60, bo: 3.60, bp: 3.60,
    bq: 3.50, br: 3.70, bs: 3.60, bt: 3.60, bu: 3.60, bv: 3.55, bw: 3.75, bz: 3.70,
    cl: 3.80, cm: 3.70, cn: 3.60, co: 3.65, cp: 3.70
  };

  const sampleRows = [
    generateSampleRow(1, "KP A", "KP", "A", "DKEM", "Departemen Kebijakan Ekonomi & Moneter", sampleScores1),
    generateSampleRow(2, "KP A", "KP", "A", "DKMP", "Departemen Kebijakan Makroprudensial", sampleScores2),
    generateSampleRow(3, "KP B", "KP", "B", "DPMS", "Departemen Penyelenggaraan Sistem Pembayaran", sampleScores3),
    generateSampleRow(4, "KP B", "KP", "B", "DInt", "Departemen Internasional", sampleScores4),
    generateSampleRow(5, "KP C", "KP", "C", "DSSK", "Departemen Surveillance Sistem Keuangan", sampleScores1)
  ];

  const sheetConfigs = [
    {
      name: "KONSOL BEGR",
      headers: begrHeaders,
      sampleData: sampleRows,
      colFormats: begrHeaders.map((_, idx) => idx >= 6 ? "#,##0.00" : idx === 0 ? "0" : "@"),
      headerColor: "#1e293b" // Slate 800 Dark
    },
    {
      name: "PENGATURAN UMUM",
      headers: ["Kunci", "Nilai", "Keterangan"],
      sampleData: [
        ["Judul Aplikasi", "BI-BEGR Culture Dashboard", "Judul utama pada dashboard budaya kerja"],
        ["Admin Budker", "Divisi Pengembangan Budaya Kerja", "Nama pengelola program utama"],
        ["Target Maturity", "4.00", "Batas minimal target maturity level satker"]
      ],
      colFormats: ["@", "@", "@"],
      headerColor: "#1e293b"
    }
  ];

  for (let i = 0; i < sheetConfigs.length; i++) {
    const config = sheetConfigs[i];
    let sheet = ss.getSheetByName(config.name);
    
    // Buat Baru jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    } else {
      // Jika sudah ada, hapus isinya untuk inisialisasi bersih jika memanggil menu manual
      sheet.clear();
    }
    
    let headerRow = 1;
    let startRow = 2;
    let frozenRows = 1;
    
    if (config.name === "KONSOL BEGR") {
      headerRow = 3;
      startRow = 4;
      frozenRows = 3;
    }
    
    // Tulis Header
    const headerRange = sheet.getRange(headerRow, 1, 1, config.headers.length);
    headerRange.setValues([config.headers]);
    
    // Tulis Sample Data jika ditentukan
    if (config.sampleData && config.sampleData.length > 0) {
      const range = sheet.getRange(startRow, 1, config.sampleData.length, config.headers.length);
      range.setValues(config.sampleData);
    }
    
    // Formatting Estetis (Enterprise Grade Look)
    headerRange.setBackground(config.headerColor);
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setFontFamily("Arial");
    headerRange.setWrap(true);
    sheet.setRowHeight(headerRow, 40);
    
    // Bekukan baris
    sheet.setFrozenRows(frozenRows);
    
    // Format Kolom
    if (config.colFormats && config.colFormats.length > 0) {
      for (let c = 0; c < config.colFormats.length; c++) {
        const fmt = config.colFormats[c];
        const lastRow = Math.max(startRow, sheet.getLastRow());
        const colRange = sheet.getRange(startRow, c + 1, lastRow - startRow + 1, 1);
        colRange.setNumberFormat(fmt);
      }
    }
    
    // Auto-fit kolom pertama beberapa saja yang penting agar kinerjanya cepat
    const colAutoFits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    colAutoFits.forEach(c => {
      sheet.autoResizeColumn(c);
      const oldWidth = sheet.getColumnWidth(c);
      sheet.setColumnWidth(c, Math.max(80, oldWidth + 15));
    });
  }
  
  SpreadsheetApp.getUi().alert(
    "Inisialisasi Sukses!", 
    "Berhasil mengkonfigurasi tabel utama 'KONSOL BEGR' dengan 94 kolom finansial, formula otomatis, dan parameter 'PENGATURAN UMUM' secara utuh!", 
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
