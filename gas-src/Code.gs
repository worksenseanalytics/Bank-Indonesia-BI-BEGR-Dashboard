// =======================================================================
// [Update 8 Juli 2026 14:41 WIB] UI Redesign (Sumbu Y Dinamis, Filter Bar Tremor Select, Premium Tooltips)
// =======================================================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard-for-Spreadsheet')
    .setTitle('BI-BEGR Culture Dashboard - KONSOL BEGR')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Get data for a specific sheet. Uses caching for high-performance reads.
 */
function getSheetDataByName(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const actualSheetName = (sheetName === "KONSOL BEGR" || sheetName === "KONSOL_BEGR") ? "KONSOL BEGR" : sheetName;
  
  // 1. Attempt to retrieve data from cache first (Latency reduction)
  const cached = getCachedData("sheet_data_" + actualSheetName);
  if (cached) {
    return cached;
  }

  const sheet = ss.getSheetByName(actualSheetName);
  
  if (!sheet) {
    if (actualSheetName === "PENGATURAN UMUM") {
      // Return default configuration if PENGATURAN UMUM sheet is missing
      const defaults = [
        ["Judul Aplikasi", "BI-BEGR Culture Dashboard", "Judul utama pada dashboard budaya kerja"],
        ["Admin Budker", "Evaluasi Budaya Kerja - Tahap Behavior Exploration dan Group Reflection", "Nama pengelola program utama"],
        ["Target Maturity", "4.00", "Batas minimal target maturity level satker"]
      ];
      const jsonString = JSON.stringify(defaults);
      const blob = Utilities.newBlob(jsonString, 'application/json');
      const zippedBlob = Utilities.gzip(blob);
      const base64Str = Utilities.base64Encode(zippedBlob.getBytes());
      const response = { compressed: true, payload: base64Str };
      
      // Store defaults in cache (valid for 10 minutes)
      setCachedData("sheet_data_" + actualSheetName, response, 600);
      return response;
    }
    return { sample_data: [], error: `Sheet '${actualSheetName}' tidak ditemukan.` };
  }
  
  const data = sheet.getDataRange().getValues();
  
  let startRowIndex = 1; // Default skip 1 row (header row 1, data starts row 2)
  if (actualSheetName === "KONSOL BEGR") {
    // Skip 2 rows at the top, row 3 is the header (index 2). Data rows start at index 3 (row 4)
    startRowIndex = 3;
  }
  
  if (data.length <= startRowIndex) return { sample_data: [] };
  
  let resultRows = [];
  const MAX_ROWS = 3000;
  
  for (let i = startRowIndex; i < data.length; i++) {
    const row = data[i];
    const isEmpty = row.every(cell => cell === "" || cell === null || cell === undefined);
    if (isEmpty) continue;
    
    const formattedRow = row.map(cell => {
      if (cell instanceof Date) {
        return Utilities.formatDate(cell, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
      }
      return cell;
    });
    
    resultRows.push(formattedRow);
    if (resultRows.length >= MAX_ROWS) break;
  }

  // Payload Compression (GZIP + Base64) to bypass GAS limits and speed up transfer
  const jsonString = JSON.stringify(resultRows);
  const blob = Utilities.newBlob(jsonString, 'application/json');
  const zippedBlob = Utilities.gzip(blob);
  const base64Str = Utilities.base64Encode(zippedBlob.getBytes());

  const response = { 
    compressed: true, 
    payload: base64Str 
  };

  // Cache compiled payload for 10 minutes
  setCachedData("sheet_data_" + actualSheetName, response, 600);

  return response;
}

/**
 * Atomic sheet writer. Clears selected sheet and writes headers + data.
 * This guarantees absolute data consistency and avoids complex index mutations.
 */
function saveSheetDataByName(sheetName, headers, rawRows) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const actualSheetName = (sheetName === "KONSOL BEGR" || sheetName === "KONSOL_BEGR") ? "KONSOL BEGR" : sheetName;
    
    // Invalidate/clear cache before writing to guarantee immediate consistency
    clearCachedData("sheet_data_" + actualSheetName);

    let sheet = ss.getSheetByName(actualSheetName);
    if (!sheet) {
      sheet = ss.insertSheet(actualSheetName);
    }
    
    if (actualSheetName === "KONSOL BEGR") {
      // Clear content from row 3 onwards to preserve whatever is in row 1 & 2
      const lastRow = Math.max(3, sheet.getLastRow());
      const lastCol = Math.max(94, sheet.getLastColumn());
      if (lastRow >= 3) {
        sheet.getRange(3, 1, lastRow - 2, lastCol).clearContent();
      }
      
      // Write headers on row 3
      if (headers && headers.length > 0) {
        const headerRange = sheet.getRange(3, 1, 1, headers.length);
        headerRange.setValues([headers]);
      }
      
      // Write data starting from row 4
      if (rawRows && rawRows.length > 0) {
        const range = sheet.getRange(4, 1, rawRows.length, headers.length);
        range.setValues(rawRows);
      }
    } else {
      sheet.clear();
      
      if (headers && headers.length > 0) {
        sheet.appendRow(headers);
      }
      
      if (rawRows && rawRows.length > 0) {
        const range = sheet.getRange(2, 1, rawRows.length, headers.length);
        range.setValues(rawRows);
      }
    }
    
    SpreadsheetApp.flush();
    return { success: true, message: `Sheet '${actualSheetName}' successfully updated with ${rawRows.length} rows.` };
  } catch (error) {
    return { success: false, error: error.message || "Unknown error occurred on Google Sheets" };
  }
}

/**
 * Reads fragmented cache data from CacheService (bypassing the 100KB limit).
 * @param {string} key - Cache master key
 * @returns {any|null} Decoded object data or null
 */
function getCachedData(key) {
  try {
    const cache = CacheService.getScriptCache();
    const numChunksStr = cache.get(key + "_chunks");
    if (!numChunksStr) return null;
    
    const numChunks = parseInt(numChunksStr, 10);
    let dataStr = "";
    for (let i = 0; i < numChunks; i++) {
      const chunk = cache.get(key + "_" + i);
      if (chunk === null) return null; // Treat any missing chunk as cache miss
      dataStr += chunk;
    }
    return JSON.parse(dataStr);
  } catch (e) {
    console.warn("[getCachedData] Failed to read cache key:", key, e.message);
    return null;
  }
}

/**
 * Stores data in CacheService with secure 90KB partitioning.
 * @param {string} key - Cache master key
 * @param {any} data - Object data to cache
 * @param {number} [expireSec] - Expiration duration in seconds (default 600s)
 */
function setCachedData(key, data, expireSec) {
  try {
    const cache = CacheService.getScriptCache();
    const dataStr = JSON.stringify(data);
    const chunkSize = 90 * 1024; // 90KB safety buffer below 100KB limit
    const numChunks = Math.ceil(dataStr.length / chunkSize);
    const expiration = expireSec || 600;
    
    const cachePayload = {};
    cachePayload[key + "_chunks"] = String(numChunks);
    
    for (let i = 0; i < numChunks; i++) {
      cachePayload[key + "_" + i] = dataStr.substring(i * chunkSize, (i + 1) * chunkSize);
    }
    
    cache.putAll(cachePayload, expiration);
  } catch (e) {
    console.warn("[setCachedData] Failed to write cache key:", key, e.message);
  }
}

/**
 * Cleanly purges fragmented cache keys from CacheService.
 * @param {string} key - Cache master key
 */
function clearCachedData(key) {
  try {
    const cache = CacheService.getScriptCache();
    const numChunksStr = cache.get(key + "_chunks");
    const keysToRemove = [key + "_chunks"];
    
    if (numChunksStr) {
      const numChunks = parseInt(numChunksStr, 10);
      for (let i = 0; i < numChunks; i++) {
        keysToRemove.push(key + "_" + i);
      }
    } else {
      // Fallback: purge potential partitions opportunistically
      for (let i = 0; i < 15; i++) {
        keysToRemove.push(key + "_" + i);
      }
    }
    cache.removeAll(keysToRemove);
  } catch (e) {
    console.warn("[clearCachedData] Failed to clear cache key:", key, e.message);
  }
}

