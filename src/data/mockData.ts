// file: src/data/mockData.ts
// Data sampel default KONSOL BEGR dan PENGATURAN UMUM yang selaras dengan setup.gs

export const mockData: any = {
  "KONSOL BEGR": {
    sample_data: [
      // Format 94 kolom: No (0), Kelompok Budker (1), Jenis (2), Kategori (3), RUBRIK (4), Satker Lengkap (5),
      // CULTURE MATURITY LEVEL (6), EVP KEPEMIMPINAN (7), EVP KELUARGA (8), EVP KESEJAHTERAAN (9), ...
      [
        1, "KP A", "KP", "A", "DKEM", "Departemen Kebijakan Ekonomi & Moneter",
        4.20, 4.20, 3.90, 4.50, // 6: CML, 7: EVP Kep, 8: EVP Kel, 9: EVP Kes
        4.10, 4.30, 3.90, 4.50, // 10: Kep P1, 11: Kep P2, 12: Kel P1, 13: Kes P1
        4.00, 4.20, 3.90, 4.10, // 14: Kreativitas I1, 15: Kreativitas I2, 16: Kreativitas Prog 1, 17: col R
        4.00, 4.00, 4.10, 4.00, // 18: col S, 19: col T, 20: Kreativitas Prog 2 (U), 21: col V
        4.00, 4.00, 4.00, 4.00, // 22: col W, 23: col X, 24: col Y, 25: col Z
        4.00, 4.00, 4.00, 4.20, // 26: BI PRESTASI (AA), 27: Deep dive, 28: Persona, 29: Keterlibatan
        4.10, 4.00, 4.20, 4.50, // 30: Kesesuaian EVP, 31: Kesesuaian Pilar, 32: Avg NNS SESPIOK, 33: Trust
        4.10, 4.30, 4.00, 4.40, // 34: Prof, 35: Exc, 36: Pub, 37: Coord
        4.20, 3.90, 4.30, 4.25, // 38: BI DIGITAL (AM), 39: Keterlibatan, 40: Kesesuaian EVP, 41: Kesesuaian Pilar
        4.40, 4.20, 4.10, 4.30, // 42: Average NNS, 43: col AR, 44: col AS, 45: col AT
        4.10, 4.35, 4.20, 4.15, // 46: Trust, 47: Prof, 48: Exc, 49: Pub, 50: Coord
        3.80, 4.00, 4.20, 4.10, // 51: BI INOVASI (AZ), 52: Deep dive, 53: Persona, 54: Keterlibatan (BC)
        3.90, 3.80, 4.10, 3.90, // 55: Kesesuaian EVP, 56: Kesesuaian Pilar, 57: NNS OBF (BF), 58: col BG
        4.20, 4.10, 4.30, 4.00, // 59: Trust, 60: Prof, 61: Exc, 62: Pub, 63: Coord
        4.10, 4.20, 4.30, 4.10, // 64: BI SPIRITUAL P1 (BM), 65: Skor CP 3H (BN), 66: Deep dive 1, 67: Deep dive 2
        4.10, 4.50, 4.20, 4.30, // 68: Keterlibatan, 69: Kesesuaian EVP, 70: Kesesuaian Pilar, 71: Keterlibatan PINTER (BT)
        4.20, 4.10, 4.30, 4.10, // 72: Kesesuaian EVP, 73: Kesesuaian Pilar, 74: NNS 3H (BW), 75: col BX
        4.20, 4.10, 4.30, 4.10, // 76: col BY, 77: BI SPIRITUAL P2 (BZ), 78: col CA, 79: col CB, 80: col CC
        4.20, 4.10, 4.30, 4.10, // 81: col CD, 82: col CE, 83: col CF, 84: col CG, 85: col CH
        4.20, 4.10, 4.30, 4.10, // 86: col CI, 87: col CJ, 88: col CK
        4.50, 4.10, 4.30, 4.00, 4.40 // 89: TRUST (CL), 90: PROFESSIONALISM (CM), 91: EXCELLENCE (CN), 92: PUBLIC INTEREST (CO), 93: COORDINATION (CP)
      ],
      [
        2, "KP A", "KP", "A", "DKMP", "Departemen Kebijakan Makroprudensial",
        3.95, 3.85, 4.10, 4.00,
        3.80, 3.90, 4.10, 4.00,
        3.70, 3.90, 3.60, 3.80,
        3.80, 3.80, 3.90, 3.80,
        3.80, 3.80, 3.80, 3.80,
        3.95, 3.80, 3.90, 3.90,
        3.80, 3.90, 4.10, 4.00,
        4.10, 3.90, 4.20, 4.10,
        4.10, 3.70, 4.00, 3.95,
        4.20, 4.10, 4.10, 4.00,
        4.10, 4.00, 4.20, 4.10,
        4.20, 3.90, 4.00, 4.00,
        4.15, 4.10, 3.95, 4.00,
        4.10, 4.20, 3.95, 4.15,
        3.90, 3.95, 4.00, 3.90,
        3.90, 4.10, 4.00, 4.00,
        4.05, 3.90, 4.10, 4.00,
        4.00, 4.10, 4.00, 4.00,
        4.00, 4.10, 4.00, 4.00,
        4.00, 4.10, 4.00, 4.00,
        4.10, 4.20, 3.95, 4.15, 4.10
      ],
      [
        3, "KP B", "KP", "B", "DPMS", "Departemen Penyelenggaraan Sistem Pembayaran",
        4.40, 4.40, 4.20, 4.60,
        4.30, 4.50, 4.20, 4.60,
        4.40, 4.30, 4.20, 4.40,
        4.40, 4.40, 4.50, 4.40,
        4.40, 4.40, 4.40, 4.40,
        4.40, 4.40, 4.40, 4.40,
        4.40, 4.50, 4.35, 4.40,
        4.50, 4.40, 4.50, 4.40,
        4.50, 4.40, 4.60, 4.50,
        4.50, 4.20, 4.40, 4.50,
        4.60, 4.50, 4.40, 4.50,
        4.50, 4.40, 4.60, 4.50,
        4.00, 4.30, 4.40, 4.35,
        4.30, 4.20, 4.40, 4.30,
        4.40, 4.30, 4.50, 4.40,
        4.20, 4.45, 4.50, 4.40,
        4.30, 4.50, 4.40, 4.20,
        4.30, 4.25, 4.50, 4.30,
        4.30, 4.25, 4.50, 4.30,
        4.30, 4.25, 4.50, 4.30,
        4.30, 4.25, 4.50, 4.30,
        4.60, 4.50, 4.55, 4.40, 4.60
      ],
      [
        4, "KP B", "KP", "B", "DInt", "Departemen Internasional",
        3.65, 3.60, 3.60, 3.80,
        3.50, 3.70, 3.60, 3.80,
        3.50, 3.60, 3.40, 3.60,
        3.60, 3.60, 3.60, 3.60,
        3.60, 3.60, 3.60, 3.60,
        3.60, 3.60, 3.60, 3.60,
        3.70, 3.60, 3.50, 3.60,
        3.55, 3.40, 3.70, 3.65,
        3.90, 3.70, 3.65, 3.60,
        3.90, 3.70, 3.65, 3.60,
        3.90, 3.70, 3.65, 3.60,
        3.90, 3.70, 3.65, 3.60,
        3.65, 3.50, 3.60, 3.70,
        3.55, 3.50, 3.70, 3.60,
        3.70, 3.60, 3.75, 3.65,
        3.50, 3.60, 3.60, 3.60,
        3.50, 3.70, 3.60, 3.60,
        3.60, 3.55, 3.75, 3.60,
        3.60, 3.55, 3.75, 3.60,
        3.60, 3.55, 3.75, 3.60,
        3.60, 3.55, 3.75, 3.60,
        3.80, 3.70, 3.60, 3.65, 3.70
      ],
      [
        5, "KP C", "KP", "C", "DSSK", "Departemen Surveillance Sistem Keuangan",
        4.20, 4.20, 3.90, 4.50,
        4.10, 4.30, 3.90, 4.50,
        4.00, 4.20, 3.90, 4.10,
        4.00, 4.00, 4.10, 4.00,
        4.00, 4.00, 4.00, 4.00,
        4.00, 4.00, 4.00, 4.00,
        4.00, 4.00, 4.00, 4.20,
        4.10, 4.00, 4.20, 4.50,
        4.10, 4.30, 4.00, 4.40,
        4.20, 3.90, 4.30, 4.25,
        4.40, 4.20, 4.10, 4.30,
        4.10, 4.35, 4.20, 4.15,
        3.80, 4.00, 4.20, 4.10,
        3.90, 3.80, 4.10, 3.90,
        4.20, 4.10, 4.30, 4.00,
        4.10, 4.20, 4.30, 4.10,
        4.10, 4.50, 4.20, 4.30,
        4.20, 4.10, 4.30, 4.10,
        4.20, 4.10, 4.30, 4.10,
        4.20, 4.10, 4.30, 4.10,
        4.20, 4.10, 4.30, 4.10,
        4.50, 4.10, 4.30, 4.00, 4.40
      ]
    ]
  },
  "PENGATURAN UMUM": {
    sample_data: [
      ["Judul Aplikasi", "BI-BEGR Culture Dashboard", "Judul utama pada dashboard budaya kerja"],
      ["Admin Budker", "Evaluasi Budaya Kerja - Tahap Behavior Exploration dan Group Reflection", "Nama pengelola program utama"],
      ["Target Maturity", "4.00", "Batas minimal target maturity level satker"]
    ]
  }
};
