import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
}

export const CustomTooltip = ({ active, payload, label, valueFormatter }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="w-56 rounded-xl border border-slate-200 bg-white text-xs shadow-md dark:border-slate-800 dark:bg-slate-900 overflow-hidden" data-print-hide>
      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
        <p className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {label}
        </p>
      </div>
      {payload.map((category: any, idx: number) => {
        // Determine if the value represents a Satker count (integer)
        const isCount = 
          category.name.toLowerCase().includes('satker') || 
          category.name.toLowerCase().includes('jumlah') || 
          category.name.toLowerCase().includes('total') ||
          category.name.toLowerCase().includes('count') ||
          category.name.toLowerCase().includes('pusat') ||
          category.name.toLowerCase().includes('perwakilan') ||
          ["aligned", "engaged", "enable", "empower"].includes(category.name.toLowerCase());

        // Format value based on type
        const formattedValue = valueFormatter 
          ? valueFormatter(category.value) 
          : category.name.toLowerCase().includes('rate') || category.name.includes('%') 
            ? `${category.value.toFixed(1)}%` 
            : typeof category.value === 'number'
              ? isCount 
                ? category.value.toFixed(0) 
                : category.value.toFixed(2)
              : category.value;

        // Determine background color
        const color = category.color || category.fill || (category.stroke === 'transparent' ? '#3b82f6' : category.stroke) || '#6366f1';

        return (
          <div
            key={idx}
            className="flex space-x-2.5 overflow-hidden border-t border-slate-100 dark:border-slate-800/80 first:border-t-0"
          >
            <span
              className="w-1 shrink-0"
              style={{ backgroundColor: color }}
              aria-hidden={true}
            />
            <div className="w-full py-2 pr-3.5 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                {category.name}
              </p>
              <div className="mt-0.5 flex items-center space-x-1 text-xs font-black text-slate-855 dark:text-slate-200">
                <span>{formattedValue}</span>
                {category.payload && category.payload.percentage !== undefined && (
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    ({category.payload.percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
