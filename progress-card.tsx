import React from 'react';

export interface ProgressDetail {
  name: string;
  value: string | number;
  percentageValue: number;
}

interface ProgressCardProps {
  title: string;
  total: string | number;
  details?: ProgressDetail[];
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendLabel?: string;
}

export function ProgressCard({ title, total, details, trend, trendLabel }: ProgressCardProps) {
  return (
    <div className="rounded-xl border p-6 text-left shadow-md bg-white dark:bg-[#090E1A] border-gray-300 dark:border-gray-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </dt>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
              <span className="ml-1 text-gray-400 dark:text-gray-500 font-normal">{trendLabel}</span>
            </div>
          )}
        </div>
        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-50">
          {total}
        </dd>
      </div>
      {details && details.length > 0 && (
        <div className="mt-4 space-y-3">
          {details.map((item) => (
            <dd key={item.name} className="flex flex-col lg:flex-row lg:items-center lg:space-x-3">
              <p className="flex shrink-0 items-center justify-between space-x-2 text-sm lg:w-5/12">
                <span className="truncate text-gray-500 dark:text-gray-400">
                  {item.name}
                </span>
                <span className="whitespace-nowrap font-semibold text-gray-900 dark:text-gray-50">
                  {item.value}{' '}
                  <span className="font-normal text-gray-400 dark:text-gray-500">
                    ({item.percentageValue}%)
                  </span>
                </span>
              </p>
              <div className="mt-2 lg:mt-0 flex-1">
                <div className="flex w-full h-2 bg-gray-200 rounded-full dark:bg-gray-800 overflow-hidden">
                  <div
                    className="flex flex-col justify-center rounded-full bg-blue-500 transition-all duration-200 ease-out dark:bg-blue-600"
                    style={{ width: `${Math.max(0, Math.min(100, item.percentageValue))}%` }}
                  />
                </div>
              </div>
            </dd>
          ))}
        </div>
      )}
    </div>
  );
}
