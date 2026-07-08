import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const CACHE_KEY = 'dashboard_cached_data';
const REQUIRED_SHEETS = [
  "KONSOL BEGR",
  "PENGATURAN UMUM"
];

// ----- IndexedDB Helper -----
const IDB_DB_NAME = 'DashboardDB';
const IDB_STORE_NAME = 'cacheStore';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function setIDB(key: string, val: any) {
  try {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.put(val, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("IndexedDB Setup Failed", e);
  }
}

async function getIDB(key: string): Promise<any> {
  try {
    const db = await initDB();
    return new Promise<any>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("IndexedDB Read Failed", e);
    return null;
  }
}
// ----------------------------

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Load cache async from IndexedDB
getIDB(CACHE_KEY).then(cached => {
  if (cached && !(window as any).isSyncing) {
    (window as any).appData = cached;
    window.dispatchEvent(new CustomEvent('data-synced'));
  }
}).catch(e => console.error("Failed to load cache:", e));

(window as any).isSyncing = false;
(window as any).syncProgress = 0;

(window as any).syncData = async (callback?: () => void) => {
  if ((window as any).isSyncing) return;
  (window as any).isSyncing = true;
  (window as any).syncProgress = 0;
  
  if (typeof (window as any).google !== 'undefined' && (window as any).google.script?.run) {
    const newData: any = { warnings: [] };
    let completedSteps = 0;

    const fetchSheet = (name: string) => {
      return new Promise<void>((resolve) => {
        (window as any).google.script.run
          .withSuccessHandler(async (serverData: any) => {
            if (serverData?.compressed && serverData?.payload) {
              try {
                // RUN CALCULATION & PARSING IN MAIN THREAD (AVOID WEB WORKER BLOB CSP ISSUES IN GAS)
                const binaryString = atob(serverData.payload);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const ds = new DecompressionStream('gzip');
                const stream = new Response(bytes).body!.pipeThrough(ds);
                const decompressedText = await new Response(stream).text();
                const parsed = JSON.parse(decompressedText);

                serverData.sample_data = parsed;
                delete serverData.payload;
                delete serverData.compressed;
              } catch (e) {
                console.error(`Decompression failed for ${name}:`, e);
                serverData.sample_data = [];
                serverData.error = `Decompression failed: ${(e as Error).message}`;
              }
            }
            
            newData[name] = serverData;
            if (serverData.error) newData.warnings.push(serverData.error);
            completedSteps++;
            (window as any).syncProgress = Math.round((completedSteps / REQUIRED_SHEETS.length) * 100);
            resolve();
          })
          .withFailureHandler((err: any) => {
            console.error(`Error fetching ${name}:`, err);
            newData[name] = { sample_data: [] };
            newData.warnings.push(`Gagal memuat ${name}: ${err.message}`);
            completedSteps++;
            (window as any).syncProgress = Math.round((completedSteps / REQUIRED_SHEETS.length) * 100);
            resolve();
          })
          .getSheetDataByName(name);
      });
    };

    // Concurrent fetch using Promise.all speeds up loading significantly
    await Promise.all(REQUIRED_SHEETS.map(sheet => fetchSheet(sheet)));

    (window as any).appData = newData;
    try {
      await setIDB(CACHE_KEY, newData);
    } catch (e) {
      console.error("Failed to save cache to IDB:", e);
    }
    
    (window as any).isSyncing = false;
    
    // Dispatch a custom event so components can force update if needed
    window.dispatchEvent(new CustomEvent('data-synced'));
    
    if (newData.warnings && newData.warnings.length > 0) {
      console.warn("Sync Warnings:", newData.warnings);
    }
    
    if (callback) callback();
  } else {
    // Local dev simulation
    for (let i = 0; i <= 100; i += 25) {
      (window as any).syncProgress = i;
      await new Promise(r => setTimeout(r, 100));
    }
    (window as any).isSyncing = false;
    if (callback) callback();
  }
};

// Start initial load
if (typeof (window as any).google !== 'undefined' && (window as any).google.script?.run) {
  // Always render immediately (using cache if exists)
  renderApp();
  // Trigger background sync
  (window as any).syncData();
} else {
  // Running locally
  renderApp();
}

