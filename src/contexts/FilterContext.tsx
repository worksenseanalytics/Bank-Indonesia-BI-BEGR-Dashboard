import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FilterState {
  platform: string;
  hari: string;
  bulan: string;
  tahun: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    platform: 'all',
    hari: '',
    bulan: '',
    tahun: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const handleSync = () => {
      setFilters(prev => ({ ...prev }));
    };
    window.addEventListener('data-synced', handleSync);
    return () => window.removeEventListener('data-synced', handleSync);
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
}
