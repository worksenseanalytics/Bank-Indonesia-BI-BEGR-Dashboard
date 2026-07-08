import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingPopupProps {
  isOpen: boolean;
  message?: string;
}

export function ProcessingPopup({ isOpen, message = "Menyimpan Data..." }: ProcessingPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5 animate-in zoom-in-95 duration-200 min-w-[280px]">
        <div className="w-16 h-16 bg-patina/10 dark:bg-patina/20 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-patina animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{message}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mohon tunggu sebentar...</p>
        </div>
      </div>
    </div>
  );
}
