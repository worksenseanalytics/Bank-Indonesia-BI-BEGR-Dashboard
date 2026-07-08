import React, { useState, useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from "@/lib/utils";

export interface OverviewKPICardProps {
  title: string;
  data: any[];
  dataKey: string;
  colorHex: string;
  valueFormatter?: (val: number) => string;
  hideChart?: boolean;
}

export function OverviewKPICard({ title, data, dataKey, colorHex, valueFormatter, hideChart = false }: OverviewKPICardProps) {
  const [activePayload, setActivePayload] = useState<any | null>(null);
  const { theme } = useTheme();

  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, [theme]);

  const formatter = valueFormatter || ((val: any) => typeof val === 'number' ? val.toLocaleString() : String(val));

  // Find the latest index that has some valid data (not all zeros / future empty rows)
  const defaultIndex = useMemo(() => {
    if (!data || data.length === 0) return 0;
    
    // 1. Walk backwards to find a row where the specific KPI metric has a non-zero value
    for (let i = data.length - 1; i >= 0; i--) {
      const item = data[i];
      if (item) {
        const val = item[dataKey];
        if (typeof val === 'number' && val !== 0) {
          return i;
        }
      }
    }
    
    // 2. Fallback: walk backwards to find ANY active record with numeric activity in that row
    for (let i = data.length - 1; i >= 0; i--) {
      const item = data[i];
      if (item) {
        const hasAnyActivity = Object.values(item).some(v => typeof v === 'number' && v !== 0);
        if (hasAnyActivity) return i;
      }
    }
    
    // 3. Absolute fallback to the last item
    return data.length - 1;
  }, [data, dataKey]);

  const activeIndex = useMemo(() => {
    if (activePayload) {
      const idx = data.findIndex(d => (d.date || d.tanggal) === (activePayload.date || activePayload.tanggal));
      return idx !== -1 ? idx : defaultIndex;
    }
    return defaultIndex;
  }, [activePayload, data, defaultIndex]);
     
  const currentItem = activePayload || (data && data.length > 0 ? data[defaultIndex] : null);
  const previousItem = activeIndex > 0 ? data[activeIndex - 1] : null;

  const currentVal = currentItem ? currentItem[dataKey] : 0;
  const previousVal = previousItem ? previousItem[dataKey] : undefined;

  const isNumeric = typeof currentVal === 'number';
  const percentageChange = (isNumeric && previousVal && typeof previousVal === 'number') 
    ? ((currentVal - previousVal) / previousVal) * 100 
    : undefined;
  const absoluteChange = (isNumeric && previousVal !== undefined && typeof previousVal === 'number') 
    ? currentVal - previousVal 
    : undefined;

  const formatChange = () => {
    if (!isNumeric || percentageChange === undefined || isNaN(percentageChange)) return '--';
    const formattedPercentage = `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;
    const formattedAbsolute = `${absoluteChange !== undefined && absoluteChange >= 0 ? '+' : '-'}${formatter(Math.abs(absoluteChange || 0))}`;
    return `${formattedPercentage} (${formattedAbsolute})`;
  }

  const displayValue = formatter(currentVal);
  const dateLabel = `On ${currentItem ? (currentItem.date || currentItem.tanggal) : ''}`;

  const safeDataKey = useMemo(() => {
    return dataKey.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  }, [dataKey]);

  return (
    <div 
      className={cn(
        "relative w-full rounded-lg border p-5 text-left shadow-md bg-white dark:bg-[#070D19]",
        "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700",
        "transition-all duration-300 hover:shadow-lg flex flex-col justify-between overflow-hidden group",
        hideChart ? 'h-auto' : 'h-full'
      )}
      style={{
        borderLeft: `4px solid ${colorHex}`
      }}
    >
      <dl>
        <dt className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {title}
        </dt>
        <dd className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1.5 tracking-tight">
          {displayValue}
        </dd>
        <dd className="mt-2 flex items-baseline justify-between gap-1.5">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
            {dateLabel}
          </span>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-bold whitespace-nowrap",
              formatChange() === '--'
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                : percentageChange !== undefined && percentageChange > 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
            )}
          >
            {formatChange()}
          </span>
        </dd>
      </dl>

      {!hideChart && (
        <div className="h-24 w-full mt-4 -mb-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart 
              data={data} 
              margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (state && state.activePayload) {
                  setActivePayload(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => {
                setActivePayload(null);
              }}
            >
              <defs>
                <linearGradient id={`gradient-${safeDataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorHex} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={colorHex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={() => null} 
                cursor={{ stroke: isDark ? '#374151' : '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false}
                tick={({ x, y, payload, index }) => {
                  if (index === 0 || index === data.length - 1) {
                    return (
                      <text 
                        x={x} 
                        y={y + 10} 
                        textAnchor={index === 0 ? "start" : "end"} 
                        fill={isDark ? '#6b7280' : '#9ca3af'} 
                        className="text-[10px] font-medium"
                      >
                        {payload.value}
                      </text>
                    );
                  }
                  return null;
                }}
                tickMargin={10}
              />
              <Area 
                type="linear" 
                dataKey={dataKey} 
                stroke={colorHex} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#gradient-${safeDataKey})`}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: colorHex }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
