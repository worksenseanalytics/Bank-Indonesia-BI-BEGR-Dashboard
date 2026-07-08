import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const SyncStatus = () => {
  const [isSyncing, setIsSyncing] = useState((window as any).isSyncing || false);
  const [progress, setProgress] = useState((window as any).syncProgress || 0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing((window as any).isSyncing);
      setProgress((window as any).syncProgress);
    }, 50);

    const handleSynced = () => {
      setIsSyncing(false);
      setProgress(100);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };

    window.addEventListener('data-synced', handleSynced);
    return () => {
      clearInterval(interval);
      window.removeEventListener('data-synced', handleSynced);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-lg dark:border-blue-900 dark:bg-[#0D121F]"
          >
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Syncing Spreadsheet...</span>
              <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <motion.div 
                  className="h-full bg-blue-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-400">{progress}%</span>
          </motion.div>
        )}

        {showSuccess && !isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 shadow-lg dark:border-green-900 dark:bg-[#0D121F]"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Data Updated</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
