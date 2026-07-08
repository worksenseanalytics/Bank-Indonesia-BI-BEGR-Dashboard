import { mockData } from "./mockData";

const emptyData = {
  "KONSOL BEGR": { sample_data: [] },
  "PENGATURAN UMUM": { sample_data: [] }
};

const getRawData = () => {
  if ((window as any).appData) {
    if (typeof (window as any).google === 'undefined') {
      return {
        ...mockData,
        ...(window as any).appData
      };
    }
    return (window as any).appData;
  }
  if (typeof (window as any).google !== 'undefined') return emptyData;
  return mockData;
};

const getSheetRows = (sheetName: string): any[] => {
  const rawData = getRawData();
  const sheet = rawData && rawData[sheetName];
  if (sheet && Array.isArray(sheet.sample_data)) {
    return sheet.sample_data;
  }
  return [];
};

export function parseNum(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  
  const str = String(val).trim();
  if (str.startsWith("=") || str.includes("#DIV") || str.includes("#VALUE") || str.includes("#N/A")) {
    return 0; 
  }
  
  let clean = str
    .replace(/Rp/gi, '')
    .replace(/\s+/g, '')
    .replace(/%/g, '')
    .trim();
    
  if (clean.includes(',') && !clean.includes('.')) {
    clean = clean.replace(',', '.');
  } else if (clean.includes('.') && clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  }
  
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatScore(value: number, decimals = 2): string {
  if (isNaN(value) || value === undefined || value === null) return '0.00';
  return Number(value).toFixed(decimals).replace('.', ',');
}

// 94-Column Interface Mapping Based on Exact Spreadsheet Architecture
export interface BegrRecord {
  no: number; // 0
  kelompokBudker: string; // 1
  jenis: string; // 2
  kategori: string; // 3
  rubrik: string; // 4
  satkerLengkap: string; // 5
  
  cultureMaturityLevel: number; // 6: =average(K4:N4)
  evpKepemimpinan: number; // 7: =AVERAGE(K4,L4)
  evpKeluarga: number; // 8: =M4
  evpKesejahteraan: number; // 9: =N4
  
  biPrestasi: number; // 10: =AA4
  biDigital: number; // 11: =AM4
  biInovasi: number; // 12: =AZ4
  biSpiritual: number; // 13: =AVERAGE(BM4,BZ4)
  
  averageKeterlibatan: number; // 14: =AVERAGE(AD4,AN4,BC4,BQ4,BT4)
  averageKreativitas: number; // 15
  averageKreativitasEvp: number; // 16
  averageKesesuaianEvpKepemimpinan: number; // 17
  averageKesesuaianEvpKeluarga: number; // 18
  averageKesesuaianEvpKesejahteraan: number; // 19
  averageKreativitasPilarBudker: number; // 20
  averageKesesuaianPilarBiPrestasi: number; // 21
  averageKesesuaianPilarBiDigital: number; // 22
  averageKesesuaianPilarBiInovasi: number; // 23
  averageKesesuaianPilarBiSpiritual: number; // 24
  averageDampakNns: number; // 25
  
  skorAkhirSespiok: number; // 26: =AVERAGE(AB4:AC4)
  skorDeepDiveSespiok: number; // 27
  skorPersonaWalkthroughSespiok: number; // 28
  keterlibatanSespiok: number; // 29
  kesesuaianEvpKepemimpinanSespiok: number; // 30
  kesesuaianBiPrestasiSespiok: number; // 31
  averageNnsSespiok: number; // 32
  trustIntegritySespiok: number; // 33
  professionalismSespiok: number; // 34
  excellenceSespiok: number; // 35
  publicInterestSespiok: number; // 36
  coordinationTeamworkSespiok: number; // 37
  
  skorAkhirAkukeren: number; // 38
  skorDeepDiveAkukeren: number; // 39
  skorPersonaWalkthroughAkukeren: number; // 40
  skorRealityCheckAkukeren: number; // 41
  keterlibatanAkukeren: number; // 42
  kesesuaianEvpKepemimpinanAkukeren: number; // 43
  kesesuaianBiDigitalAkukeren: number; // 44
  averageNnsAkukeren: number; // 45
  trustIntegrityAkukeren: number; // 46
  professionalismAkukeren: number; // 47
  excellenceAkukeren: number; // 48
  publicInterestAkukeren: number; // 49
  coordinationTeamworkAkukeren: number; // 50
  
  skorAkhirObf: number; // 51
  skorDeepDiveObf: number; // 52
  skorPersonaWalkthroughObf: number; // 53
  skorRealityCheckObf: number; // 54
  keterlibatanObf: number; // 55
  kesesuaianEvpKeluargaObf: number; // 56
  kesesuaianBiInovasiObf: number; // 57
  averageNnsObf: number; // 58
  trustIntegrityObf: number; // 59
  professionalismObf: number; // 60
  excellenceObf: number; // 61
  publicInterestObf: number; // 62
  coordinationTeamworkObf: number; // 63
  
  skorAkhir3h: number; // 64
  skorDeepDive3h: number; // 65
  skorPersonaWalkthrough3h: number; // 66
  skorRealityCheck3h: number; // 67
  keterlibatan3h: number; // 68
  kesesuaianEvpKesejahteraan3h: number; // 69
  kesesuaianBiSpiritual3h: number; // 70
  averageNns3h: number; // 71
  trustIntegrity3h: number; // 72
  professionalism3h: number; // 73
  excellence3h: number; // 74
  publicInterest3h: number; // 75
  coordinationTeamwork3h: number; // 76
  
  skorAkhirPinter: number; // 77
  skorDeepDivePinter: number; // 78
  skorPersonaWalkthroughPinter: number; // 79
  keterlibatanPinter: number; // 80
  kesesuaianEvpKesejahteraanPinter: number; // 81
  kesesuaianBiSpiritualPinter: number; // 82
  averageNnsPinter: number; // 83
  trustIntegrityPinter: number; // 84
  professionalismPinter: number; // 85
  excellencePinter: number; // 86
  publicInterestPinter: number; // 87
  coordinationTeamworkPinter: number; // 88
  
  trustIntegrity: number; // 89
  professionalism: number; // 90
  excellence: number; // 91
  publicInterest: number; // 92
  coordinationTeamwork: number; // 93
  
  rawArray: any[];
}

export const getBegrData = (): BegrRecord[] => {
  const rows = getSheetRows("KONSOL BEGR");
  if (!rows || rows.length === 0) return [];
  
  return rows.map((row) => {
    return {
      no: parseInt(row[0]) || 0,
      kelompokBudker: String(row[1] || '').trim(),
      jenis: String(row[2] || '').trim(),
      kategori: String(row[3] || '').trim(),
      rubrik: String(row[4] || '').trim(),
      satkerLengkap: String(row[5] || '').trim(),
      
      cultureMaturityLevel: parseNum(row[6]),
      evpKepemimpinan: parseNum(row[7]),
      evpKeluarga: parseNum(row[8]),
      evpKesejahteraan: parseNum(row[9]),
      
      biPrestasi: parseNum(row[10]),
      biDigital: parseNum(row[11]),
      biInovasi: parseNum(row[12]),
      biSpiritual: parseNum(row[13]),
      
      averageKeterlibatan: parseNum(row[14]),
      averageKreativitas: parseNum(row[15]),
      averageKreativitasEvp: parseNum(row[16]),
      averageKesesuaianEvpKepemimpinan: parseNum(row[17]),
      averageKesesuaianEvpKeluarga: parseNum(row[18]),
      averageKesesuaianEvpKesejahteraan: parseNum(row[19]),
      averageKreativitasPilarBudker: parseNum(row[20]),
      averageKesesuaianPilarBiPrestasi: parseNum(row[21]),
      averageKesesuaianPilarBiDigital: parseNum(row[22]),
      averageKesesuaianPilarBiInovasi: parseNum(row[23]),
      averageKesesuaianPilarBiSpiritual: parseNum(row[24]),
      averageDampakNns: parseNum(row[25]),
      
      skorAkhirSespiok: parseNum(row[26]),
      skorDeepDiveSespiok: parseNum(row[27]),
      skorPersonaWalkthroughSespiok: parseNum(row[28]),
      keterlibatanSespiok: parseNum(row[29]),
      kesesuaianEvpKepemimpinanSespiok: parseNum(row[30]),
      kesesuaianBiPrestasiSespiok: parseNum(row[31]),
      averageNnsSespiok: parseNum(row[32]),
      trustIntegritySespiok: parseNum(row[33]),
      professionalismSespiok: parseNum(row[34]),
      excellenceSespiok: parseNum(row[35]),
      publicInterestSespiok: parseNum(row[36]),
      coordinationTeamworkSespiok: parseNum(row[37]),
      
      skorAkhirAkukeren: parseNum(row[38]),
      skorDeepDiveAkukeren: parseNum(row[39]),
      skorPersonaWalkthroughAkukeren: parseNum(row[40]),
      skorRealityCheckAkukeren: parseNum(row[41]),
      keterlibatanAkukeren: parseNum(row[42]),
      kesesuaianEvpKepemimpinanAkukeren: parseNum(row[43]),
      kesesuaianBiDigitalAkukeren: parseNum(row[44]),
      averageNnsAkukeren: parseNum(row[45]),
      trustIntegrityAkukeren: parseNum(row[46]),
      professionalismAkukeren: parseNum(row[47]),
      excellenceAkukeren: parseNum(row[48]),
      publicInterestAkukeren: parseNum(row[49]),
      coordinationTeamworkAkukeren: parseNum(row[50]),
      
      skorAkhirObf: parseNum(row[51]),
      skorDeepDiveObf: parseNum(row[52]),
      skorPersonaWalkthroughObf: parseNum(row[53]),
      skorRealityCheckObf: parseNum(row[54]),
      keterlibatanObf: parseNum(row[55]),
      kesesuaianEvpKeluargaObf: parseNum(row[56]),
      kesesuaianBiInovasiObf: parseNum(row[57]),
      averageNnsObf: parseNum(row[58]),
      trustIntegrityObf: parseNum(row[59]),
      professionalismObf: parseNum(row[60]),
      excellenceObf: parseNum(row[61]),
      publicInterestObf: parseNum(row[62]),
      coordinationTeamworkObf: parseNum(row[63]),
      
      skorAkhir3h: parseNum(row[64]),
      skorDeepDive3h: parseNum(row[65]),
      skorPersonaWalkthrough3h: parseNum(row[66]),
      skorRealityCheck3h: parseNum(row[67]),
      keterlibatan3h: parseNum(row[68]),
      kesesuaianEvpKesejahteraan3h: parseNum(row[69]),
      kesesuaianBiSpiritual3h: parseNum(row[70]),
      averageNns3h: parseNum(row[71]),
      trustIntegrity3h: parseNum(row[72]),
      professionalism3h: parseNum(row[73]),
      excellence3h: parseNum(row[74]),
      publicInterest3h: parseNum(row[75]),
      coordinationTeamwork3h: parseNum(row[76]),
      
      skorAkhirPinter: parseNum(row[77]),
      skorDeepDivePinter: parseNum(row[78]),
      skorPersonaWalkthroughPinter: parseNum(row[79]),
      keterlibatanPinter: parseNum(row[80]),
      kesesuaianEvpKesejahteraanPinter: parseNum(row[81]),
      kesesuaianBiSpiritualPinter: parseNum(row[82]),
      averageNnsPinter: parseNum(row[83]),
      trustIntegrityPinter: parseNum(row[84]),
      professionalismPinter: parseNum(row[85]),
      excellencePinter: parseNum(row[86]),
      publicInterestPinter: parseNum(row[87]),
      coordinationTeamworkPinter: parseNum(row[88]),
      
      trustIntegrity: parseNum(row[89]),
      professionalism: parseNum(row[90]),
      excellence: parseNum(row[91]),
      publicInterest: parseNum(row[92]),
      coordinationTeamwork: parseNum(row[93]),

      rawArray: Array.isArray(row) ? row : []
    };
  }).filter(rec => rec.no > 0 && rec.satkerLengkap !== "" && rec.satkerLengkap.toLowerCase() !== "satker lengkap");
};

const apply94Formulas = (arr: any[], rowNumber: number) => {
  const r = rowNumber; // e.g. 4
  arr[6] = `=AVERAGE(K${r}:N${r})`;
  arr[7] = `=AVERAGE(K${r},L${r})`;
  arr[8] = `=M${r}`;
  arr[9] = `=N${r}`;
  
  arr[10] = `=AA${r}`;
  arr[11] = `=AM${r}`;
  arr[12] = `=AZ${r}`;
  arr[13] = `=AVERAGE(BM${r},BZ${r})`;
  
  arr[14] = `=AVERAGE(AD${r},AN${r},BC${r},BQ${r},BT${r})`;
  arr[15] = `=AVERAGE(Q${r},U${r})`;
  arr[16] = `=AVERAGE(AE${r},AO${r},BD${r},BR${r},BU${r})`;
  arr[17] = `=AVERAGE(AE${r},AR${r})`;
  arr[18] = `=BE${r}`;
  arr[19] = `=AVERAGE(BR${r},CD${r})`;
  arr[20] = `=AVERAGE(AF${r},AP${r},BE${r},BS${r},BV${r})`;
  arr[21] = `=AF${r}`;
  arr[22] = `=AS${r}`;
  arr[23] = `=BF${r}`;
  arr[24] = `=AVERAGE(BS${r},CE${r})`;
  arr[25] = `=AVERAGE(CL${r}:CP${r})`;
  
  arr[26] = `=AVERAGE(AB${r}:AC${r})`;
  arr[32] = `=AVERAGE(AH${r}:AL${r})`;
  arr[38] = `=AVERAGE(AN${r}:AP${r})`;
  arr[45] = `=AVERAGE(AU${r}:AY${r})`;
  arr[51] = `=AVERAGE(BA${r}:BC${r})`;
  arr[58] = `=AVERAGE(BH${r}:BL${r})`;
  arr[64] = `=AVERAGE(BN${r}:BP${r})`;
  arr[71] = `=AVERAGE(BU${r}:BY${r})`;
  arr[77] = `=AVERAGE(CA${r}:CB${r})`;
  arr[83] = `=AVERAGE(CG${r}:CK${r})`;
  
  return arr;
};

export const saveBegrRecord = (record: BegrRecord, allRecords: BegrRecord[]) => {
  const ssName = "KONSOL BEGR";
  
  const updateRow = (rec: BegrRecord) => {
    const arr = Array(94).fill("");
    
    // Fill text metadata
    arr[0] = rec.no;
    arr[1] = rec.kelompokBudker;
    arr[2] = rec.jenis;
    arr[3] = rec.kategori;
    arr[4] = rec.rubrik;
    arr[5] = rec.satkerLengkap;
    
    // Fill raw inputs SESPIOK
    arr[27] = rec.skorDeepDiveSespiok;
    arr[28] = rec.skorPersonaWalkthroughSespiok;
    arr[29] = rec.keterlibatanSespiok;
    arr[30] = rec.kesesuaianEvpKepemimpinanSespiok;
    arr[31] = rec.kesesuaianBiPrestasiSespiok;
    arr[33] = rec.trustIntegritySespiok;
    arr[34] = rec.professionalismSespiok;
    arr[35] = rec.excellenceSespiok;
    arr[36] = rec.publicInterestSespiok;
    arr[37] = rec.coordinationTeamworkSespiok;
    
    // AKUKEREN
    arr[39] = rec.skorDeepDiveAkukeren;
    arr[40] = rec.skorPersonaWalkthroughAkukeren;
    arr[41] = rec.skorRealityCheckAkukeren;
    arr[42] = rec.keterlibatanAkukeren;
    arr[43] = rec.kesesuaianEvpKepemimpinanAkukeren;
    arr[44] = rec.kesesuaianBiDigitalAkukeren;
    arr[46] = rec.trustIntegrityAkukeren;
    arr[47] = rec.professionalismAkukeren;
    arr[48] = rec.excellenceAkukeren;
    arr[49] = rec.publicInterestAkukeren;
    arr[50] = rec.coordinationTeamworkAkukeren;
    
    // OBF
    arr[52] = rec.skorDeepDiveObf;
    arr[53] = rec.skorPersonaWalkthroughObf;
    arr[54] = rec.skorRealityCheckObf;
    arr[55] = rec.keterlibatanObf;
    arr[56] = rec.kesesuaianEvpKeluargaObf;
    arr[57] = rec.kesesuaianBiInovasiObf;
    arr[59] = rec.trustIntegrityObf;
    arr[60] = rec.professionalismObf;
    arr[61] = rec.excellenceObf;
    arr[62] = rec.publicInterestObf;
    arr[63] = rec.coordinationTeamworkObf;
    
    // 3H
    arr[65] = rec.skorDeepDive3h;
    arr[66] = rec.skorPersonaWalkthrough3h;
    arr[67] = rec.skorRealityCheck3h;
    arr[68] = rec.keterlibatan3h;
    arr[69] = rec.kesesuaianEvpKesejahteraan3h;
    arr[70] = rec.kesesuaianBiSpiritual3h;
    arr[72] = rec.trustIntegrity3h;
    arr[73] = rec.professionalism3h;
    arr[74] = rec.excellence3h;
    arr[75] = rec.publicInterest3h;
    arr[76] = rec.coordinationTeamwork3h;
    
    // PINTER
    arr[78] = rec.skorDeepDivePinter;
    arr[79] = rec.skorPersonaWalkthroughPinter;
    arr[80] = rec.keterlibatanPinter;
    arr[81] = rec.kesesuaianEvpKesejahteraanPinter;
    arr[82] = rec.kesesuaianBiSpiritualPinter;
    arr[84] = rec.trustIntegrityPinter;
    arr[85] = rec.professionalismPinter;
    arr[86] = rec.excellencePinter;
    arr[87] = rec.publicInterestPinter;
    arr[88] = rec.coordinationTeamworkPinter;
    
    // NNS Impact
    arr[89] = rec.trustIntegrity;
    arr[90] = rec.professionalism;
    arr[91] = rec.excellence;
    arr[92] = rec.publicInterest;
    arr[93] = rec.coordinationTeamwork;
    
    // Apply formulas
    // The visual index is `rec.no`, however data row in spreadsheet is actually `rec.no + 3`
    // Why? Header is on row 3. Therefore No. 1 is row 4. No. 2 is row 5.
    const rowNumber = rec.no + 3;
    return apply94Formulas(arr, rowNumber);
  };

  const updatedRecords = allRecords.map((r) => r.no === record.no ? record : r);
  const rawRows = updatedRecords.map(updateRow);
  
  if (typeof (window as any).google !== 'undefined' && (window as any).google.script?.run) {
    const headers = generate94Headers();
    (window as any).google.script.run
      .withSuccessHandler(() => {
        console.log("Success saving records back to Sheet");
      })
      .saveSheetDataByName(ssName, headers, rawRows);
  } else {
    if (!(window as any).appData) (window as any).appData = {};
    (window as any).appData["KONSOL BEGR"] = { sample_data: rawRows };
    window.dispatchEvent(new CustomEvent('data-synced'));
  }
};

export const addBegrRecord = (record: Omit<BegrRecord, 'no'>, allRecords: BegrRecord[]) => {
  const ssName = "KONSOL BEGR";
  const newId = allRecords.length > 0 ? Math.max(...allRecords.map(r => r.no)) + 1 : 1;
  
  const constructNewRow = (rec: Omit<BegrRecord, 'no'>, newNo: number) => {
    const arr = Array(94).fill("");
    arr[0] = newNo;
    arr[1] = rec.kelompokBudker;
    arr[2] = rec.jenis;
    arr[3] = rec.kategori;
    arr[4] = rec.rubrik;
    arr[5] = rec.satkerLengkap;
    
    arr[27] = rec.skorDeepDiveSespiok;
    arr[28] = rec.skorPersonaWalkthroughSespiok;
    arr[29] = rec.keterlibatanSespiok;
    arr[30] = rec.kesesuaianEvpKepemimpinanSespiok;
    arr[31] = rec.kesesuaianBiPrestasiSespiok;
    arr[33] = rec.trustIntegritySespiok;
    arr[34] = rec.professionalismSespiok;
    arr[35] = rec.excellenceSespiok;
    arr[36] = rec.publicInterestSespiok;
    arr[37] = rec.coordinationTeamworkSespiok;
    
    arr[39] = rec.skorDeepDiveAkukeren;
    arr[40] = rec.skorPersonaWalkthroughAkukeren;
    arr[41] = rec.skorRealityCheckAkukeren;
    arr[42] = rec.keterlibatanAkukeren;
    arr[43] = rec.kesesuaianEvpKepemimpinanAkukeren;
    arr[44] = rec.kesesuaianBiDigitalAkukeren;
    arr[46] = rec.trustIntegrityAkukeren;
    arr[47] = rec.professionalismAkukeren;
    arr[48] = rec.excellenceAkukeren;
    arr[49] = rec.publicInterestAkukeren;
    arr[50] = rec.coordinationTeamworkAkukeren;
    
    arr[52] = rec.skorDeepDiveObf;
    arr[53] = rec.skorPersonaWalkthroughObf;
    arr[54] = rec.skorRealityCheckObf;
    arr[55] = rec.keterlibatanObf;
    arr[56] = rec.kesesuaianEvpKeluargaObf;
    arr[57] = rec.kesesuaianBiInovasiObf;
    arr[59] = rec.trustIntegrityObf;
    arr[60] = rec.professionalismObf;
    arr[61] = rec.excellenceObf;
    arr[62] = rec.publicInterestObf;
    arr[63] = rec.coordinationTeamworkObf;
    
    arr[65] = rec.skorDeepDive3h;
    arr[66] = rec.skorPersonaWalkthrough3h;
    arr[67] = rec.skorRealityCheck3h;
    arr[68] = rec.keterlibatan3h;
    arr[69] = rec.kesesuaianEvpKesejahteraan3h;
    arr[70] = rec.kesesuaianBiSpiritual3h;
    arr[72] = rec.trustIntegrity3h;
    arr[73] = rec.professionalism3h;
    arr[74] = rec.excellence3h;
    arr[75] = rec.publicInterest3h;
    arr[76] = rec.coordinationTeamwork3h;
    
    arr[78] = rec.skorDeepDivePinter;
    arr[79] = rec.skorPersonaWalkthroughPinter;
    arr[80] = rec.keterlibatanPinter;
    arr[81] = rec.kesesuaianEvpKesejahteraanPinter;
    arr[82] = rec.kesesuaianBiSpiritualPinter;
    arr[84] = rec.trustIntegrityPinter;
    arr[85] = rec.professionalismPinter;
    arr[86] = rec.excellencePinter;
    arr[87] = rec.publicInterestPinter;
    arr[88] = rec.coordinationTeamworkPinter;
    
    arr[89] = rec.trustIntegrity;
    arr[90] = rec.professionalism;
    arr[91] = rec.excellence;
    arr[92] = rec.publicInterest;
    arr[93] = rec.coordinationTeamwork;
    
    const rowNumber = newNo + 3;
    return apply94Formulas(arr, rowNumber);
  };

  const newRow = constructNewRow(record, newId);
  const updatedRawRows = allRecords.map(r => {
    // Re-apply formulas to ensure all row indexes are correct if they shifted
    const arr = r.rawArray.length === 94 ? [...r.rawArray] : Array(94).fill("");
    const rowNumber = r.no + 3; 
    return apply94Formulas(arr, rowNumber);
  });
  
  updatedRawRows.push(newRow);
  
  if (typeof (window as any).google !== 'undefined' && (window as any).google.script?.run) {
    const headers = generate94Headers();
    (window as any).google.script.run
      .withSuccessHandler(() => {
        console.log("Success adding new records back to Sheet");
      })
      .saveSheetDataByName(ssName, headers, updatedRawRows);
  } else {
    if (!(window as any).appData) (window as any).appData = {};
    (window as any).appData["KONSOL BEGR"] = { sample_data: updatedRawRows };
    window.dispatchEvent(new CustomEvent('data-synced'));
  }
};

export const deleteBegrRecord = (no: number, allRecords: BegrRecord[]) => {
  const ssName = "KONSOL BEGR";
  
  const filtered = allRecords.filter(r => r.no !== no);
  const updatedRawRows = filtered.map((r, idx) => {
    const newNo = idx + 1;
    const arr = r.rawArray.length === 94 ? [...r.rawArray] : Array(94).fill("");
    arr[0] = newNo;
    
    const rowNumber = newNo + 3;
    return apply94Formulas(arr, rowNumber);
  });

  if (typeof (window as any).google !== 'undefined' && (window as any).google.script?.run) {
    const headers = generate94Headers();
    (window as any).google.script.run
      .withSuccessHandler(() => {
        console.log("Success deleting record from Sheet");
      })
      .saveSheetDataByName(ssName, headers, updatedRawRows);
  } else {
    if (!(window as any).appData) (window as any).appData = {};
    (window as any).appData["KONSOL BEGR"] = { sample_data: updatedRawRows };
    window.dispatchEvent(new CustomEvent('data-synced'));
  }
};

export const getPengaturanData = () => {
  const defaults = { 
    appTitle: "BI-BEGR Culture Dashboard", 
    adminUser: "Evaluasi Budaya Kerja - Tahap Behavior Exploration dan Group Reflection",
    targetMaturity: 4.00
  };
  const rows = getSheetRows("PENGATURAN UMUM");
  if (!rows || rows.length === 0) return defaults;
  
  let appTitle = "";
  let adminUser = "";
  let targetMaturity = 4.00;
  
  for (let i = 0; i < rows.length; i++) {
    const key = String(rows[i][0] || '').trim();
    const value = String(rows[i][1] || '').trim();
    if (key === "Judul Aplikasi" && value) appTitle = value;
    if (key === "Admin Budker" && value) adminUser = value;
    if (key === "Target Maturity" && value) targetMaturity = parseNum(value) || 4.00;
  }
  
  return {
    appTitle: appTitle || defaults.appTitle,
    adminUser: adminUser || defaults.adminUser,
    targetMaturity: targetMaturity || defaults.targetMaturity
  };
};

export const savePengaturanData = (settings: { appTitle: string, adminUser: string, targetMaturity: number }) => {
  const ssName = "PENGATURAN UMUM";
  const rawRows = [
    ["Judul Aplikasi", settings.appTitle, "Judul utama pada dashboard budaya kerja"],
    ["Admin Budker", settings.adminUser, "Nama pengelola program utama"],
    ["Target Maturity", settings.targetMaturity.toString(), "Batas minimal target maturity level satker"]
  ];
  
  if (typeof (window as any).google !== 'undefined' && (window as any).google.script?.run) {
    (window as any).google.script.run.saveSheetDataByName(ssName, ["Kunci", "Nilai", "Keterangan"], rawRows);
    if (!(window as any).appData) (window as any).appData = {};
    (window as any).appData[ssName] = { sample_data: rawRows };
  } else {
    if (!(window as any).appData) (window as any).appData = {};
    (window as any).appData[ssName] = { sample_data: rawRows };
    window.dispatchEvent(new CustomEvent('data-synced'));
  }
};

const generate94Headers = (): string[] => {
  const headers = [
    "No", "Kelompok Budker", "Jenis", "Kategori", "RUBRIK", "Satker Lengkap",
    "CULTURE MATURITY LEVEL", "EVP KEPEMIMPINAN", "EVP KELUARGA", "EVP KESEJAHTERAAN",
    "BI PRESTASI", "BI DIGITAL", "BI INOVASI", "BI SPIRITUAL",
    "AVERAGE KETERLIBATAN", "AVERAGE KREATIVITAS", "AVERAGE KREATIVITAS (EVP)", 
    "AVERAGE KESESUAIAN DGN EVP KEPEMIMPINAN", "AVERAGE KESESUAIAN DGN EVP KELUARGA", 
    "AVERAGE KESESUAIAN EVP KESEJAHTERAAN", "AVERAGE KREATIVITAS (PILAR BUDKER)",
    "AVERAGE KESESUAIAN DGN PILAR BI PRESTASI", "AVERAGE KESESUAIAN DGN PILAR BI DIGITAL",
    "AVERAGE KESESUAIAN DGN PILAR BI INOVASI", "AVERAGE KESESUAIAN DGN PILAR BI SPIRITUAL",
    "AVERAGE DAMPAK NNS", 
    "SKOR AKHIR CP SESPIOK X KPPTOP", "SKOR DEEP DIVE", "SKOR PERSONA WALKTHROUGH", 
    "KETERLIBATAN (SESPIOK X KPPTOP)", "KESESUAIAN DGN EVP KEPEMIMPINAN (SESPIOK X KPPTOP)", 
    "KESESUAIAN DGN BI PRESTASI (SESPIOK X KPPTOP)", "Average NNS (SESPIOK X KPPTOP)",
    "Trust & Integrity", "Professionalism", "Excellence", "Public Interest", "Coordination & Teamwork",
    "SKOR CP AKUKEREN X BTSYUK", "SKOR DEEP DIVE", "SKOR PERSONA WALKTHROUGH", "SKOR REALITY CHECK",
    "KETERLIBATAN (AKUKEREN X BTSYUK)", "KESESUAIAN DGN EVP KEPEMIMPINAN (AKUKEREN X BTSYUK)",
    "KESESUAIAN DGN BI DIGITAL (AKUKEREN X BTSYUK)", "Average NNS (AKUKEREN X BTSYUK)",
    "Trust & Integrity", "Professionalism", "Excellence", "Public Interest", "Coordination & Teamwork",
    "SKOR CP OBF", "SKOR DEEP DIVE", "SKOR PERSONA WALKTHROUGH", "SKOR REALITY CHECK",
    "KETERLIBATAN (OBF)", "KESESUAIAN DGN EVP KELUARGA (OBF)", "KESESUAIAN DGN BI INOVASI (OBF)",
    "Average NNS (OBF)", "Trust & Integrity", "Professionalism", "Excellence", "Public Interest", "Coordination & Teamwork",
    "SKOR CP 3H X KEJORA", "SKOR DEEP DIVE", "SKOR PERSONA WALKTHROUGH", "SKOR REALITY CHECK",
    "KETERLIBATAN (3H X KEJORA)", "KESESUAIAN DGN EVP KESEJAHTERAAN (3H X KEJORA)", 
    "KESESUAIAN DGN BI SPIRITUAL (3H X KEJORA)", "Average NNS (3H X KEJORA)",
    "Trust & Integrity", "Professionalism", "Excellence", "Public Interest", "Coordination & Teamwork",
    "SKOR CP PINTER X PASKEUN", "SKOR DEEP DIVE", "SKOR PERSONA WALKTHROUGH",
    "KETERLIBATAN (PINTER X PASKEUN)", "KESESUAIAN DGN EVP KESEJAHTERAAN (PINTER X PASKEUN)",
    "KESESUAIAN DGN BI SPIRITUAL (PINTER X PASKEUN)", "Average NNS (PINTER X PASKEUN)",
    "Trust & Integrity", "Professionalism", "Excellence", "Public Interest", "Coordination & Teamwork",
    "TRUST & INTEGRITY", "PROFESSIONALISM", "EXCELLENCE", "PUBLIC INTEREST", "COORDINATION & TEAMWORK"
  ];
  
  const begrHeaders = Array(94).fill("");
  for (let i = 0; i < headers.length; i++) {
    begrHeaders[i] = headers[i];
  }
  for (let i = 0; i < 94; i++) {
    if (!begrHeaders[i]) begrHeaders[i] = `Col ${i + 1}`;
  }
  return begrHeaders;
};

export function getCmlCategory(score: number): "Aligned" | "Engaged" | "Enable" | "Empower" {
  if (score < 1.50) return "Aligned";
  if (score < 2.50) return "Engaged";
  if (score < 3.50) return "Enable";
  return "Empower";
}

export function getCmlColor(category: "Aligned" | "Engaged" | "Enable" | "Empower"): string {
  switch (category) {
    case "Aligned": return "#f43f5e";
    case "Engaged": return "#fbbf24";
    case "Enable": return "#22c55e";
    case "Empower": return "#3b82f6";
  }
}

/**
 * Calculates a safe Y-axis or X-axis numeric domain for charts.
 * Guarantees a minimum span of 1.0 to prevent microscopically small divisions
 * and duplicate tick keys/coordinates in Recharts.
 */
export function getSafeYDomain(dataMin: number, dataMax: number, absoluteMax = 4): [number, number] {
  if (isNaN(dataMin) || !isFinite(dataMin)) return [0, absoluteMax];
  if (isNaN(dataMax) || !isFinite(dataMax)) return [0, absoluteMax];
  
  let min = dataMin - 0.2;
  let max = dataMax + 0.2;
  
  // Enforce a minimum span of 1.0
  if (max - min < 1.0) {
    const center = (min + max) / 2;
    min = center - 0.5;
    max = center + 0.5;
  }
  
  // Clamp boundaries
  min = Math.max(0, min);
  max = Math.min(absoluteMax, max);
  
  // Readjust if clamping made the span less than 1.0 (near edges 0 or absoluteMax)
  if (max - min < 1.0) {
    if (min === 0) {
      max = Math.min(absoluteMax, 1.0);
    } else if (max === absoluteMax) {
      min = Math.max(0, absoluteMax - 1.0);
    }
  }
  
  return [parseFloat(min.toFixed(2)), parseFloat(max.toFixed(2))];
}

