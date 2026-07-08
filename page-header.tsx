import React from 'react';
import { Download } from 'lucide-react';

export function PageHeader({ title, description, children, onDownload }: { title: string, description: string, children?: React.ReactNode, onDownload?: () => void }) {
  return (
    <div className="relative z-[999] rounded-2xl border border-gray-200 dark:border-gray-800/80 bg-white dark:bg-[#070D19]/40 p-6 md:p-8 backdrop-blur-md mb-6 transition-all duration-300 shadow-md">
      {/* Background radial visual accents */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between z-10">
        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/40">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
            Google Workspace Live Sync
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <span>{title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
            {description}
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
          <button 
            onClick={onDownload}
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2.5 text-center text-xs font-bold shadow-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/60 text-gray-700 dark:text-gray-200 bg-white dark:bg-[#090E1A] cursor-pointer"
          >
            Download Report
            <Download className="size-4 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
      
      {children && (
        <div className="relative z-10 mt-6 border-t border-gray-150 dark:border-gray-800/80 pt-6">
          {children}
        </div>
      )}
    </div>
  );
}

