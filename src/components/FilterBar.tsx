import React from 'react';
import { ArrowUpDown, LayoutGrid, List, RotateCcw, Flame, Check } from 'lucide-react';
import { FilterOptions, SortOption, CurrencyCode } from '@/types';
import { formatCurrency } from '@/utils/constants';

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  totalResults: number;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  currency: CurrencyCode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalResults,
  viewMode,
  setViewMode,
  currency,
}) => {
  const storeList = [
    { id: 'all', name: 'Todas as Lojas' },
    { id: '1', name: 'Steam' },
    { id: '25', name: 'Epic Games' },
    { id: '7', name: 'GOG' },
    { id: '11', name: 'Humble Store' },
    { id: '15', name: 'Fanatical' },
    { id: '3', name: 'GreenManGaming' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'deal_rating', label: 'Melhor Custo-Benefício' },
    { value: 'savings', label: 'Maior Desconto (%)' },
    { value: 'price_asc', label: 'Menor Preço' },
    { value: 'metacritic', label: 'Melhor Avaliação (Metacritic)' },
    { value: 'recent', label: 'Lançamentos Recentes' },
  ];

  const priceThresholds = [
    { label: 'Todos', value: null },
    { label: `Até ${formatCurrency(5, currency)}`, value: 5 },
    { label: `Até ${formatCurrency(10, currency)}`, value: 10 },
    { label: `Até ${formatCurrency(20, currency)}`, value: 20 },
    { label: `Até ${formatCurrency(40, currency)}`, value: 40 },
  ];

  const discountThresholds = [
    { label: 'Todos', value: 0 },
    { label: '30%+', value: 30 },
    { label: '50%+', value: 50 },
    { label: '75%+', value: 75 },
    { label: '90%+', value: 90 },
  ];

  const handleStoreToggle = (storeId: string) => {
    setFilters((prev) => {
      if (storeId === 'all') {
        return { ...prev, selectedStores: [] };
      }
      const exists = prev.selectedStores.includes(storeId);
      if (exists) {
        return { ...prev, selectedStores: prev.selectedStores.filter((id) => id !== storeId) };
      } else {
        return { ...prev, selectedStores: [...prev.selectedStores, storeId] };
      }
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      selectedStores: [],
      selectedPlatforms: [],
      selectedGenres: [],
      maxPrice: null,
      minDiscount: 0,
      minMetacritic: 0,
      onlyFree: false,
      onlyHistoricalLow: false,
      sortBy: 'deal_rating',
    });
  };

  const isStoreSelected = (storeId: string) => {
    if (storeId === 'all') return filters.selectedStores.length === 0;
    return filters.selectedStores.includes(storeId);
  };

  const hasActiveFilters =
    filters.selectedStores.length > 0 ||
    filters.maxPrice !== null ||
    filters.minDiscount > 0 ||
    filters.minMetacritic > 0 ||
    filters.onlyHistoricalLow ||
    filters.search.length > 0;

  return (
    <div id="filter-controls-container" className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 space-y-4">
      
      {/* Stores Selection Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
          Lojas:
        </span>
        {storeList.map((store) => {
          const selected = isStoreSelected(store.id);
          return (
            <button
              key={store.id}
              id={`store-filter-btn-${store.id}`}
              onClick={() => handleStoreToggle(store.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {selected && <Check className="w-3 h-3" />}
              {store.name}
            </button>
          );
        })}
      </div>

      {/* Second Row: Price chips & Discount chips & Metacritic */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
        
        {/* Quick Price Thresholds */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Preço:</span>
          {priceThresholds.map((pt, idx) => (
            <button
              key={idx}
              onClick={() => setFilters((prev) => ({ ...prev, maxPrice: pt.value }))}
              className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                filters.maxPrice === pt.value
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-slate-800/60'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>

        {/* Discount Thresholds */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Desconto:</span>
          {discountThresholds.map((dt, idx) => (
            <button
              key={idx}
              onClick={() => setFilters((prev) => ({ ...prev, minDiscount: dt.value }))}
              className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                filters.minDiscount === dt.value
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-slate-800/60'
              }`}
            >
              {dt.label}
            </button>
          ))}
        </div>

        {/* Metacritic 80+ toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, minMetacritic: prev.minMetacritic === 80 ? 0 : 80 }))
            }
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
              filters.minMetacritic >= 80
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-semibold'
                : 'bg-slate-950/60 text-slate-400 border-slate-800/60 hover:bg-slate-800'
            }`}
          >
            <span>Metascore 80+</span>
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyHistoricalLow: !prev.onlyHistoricalLow }))
            }
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
              filters.onlyHistoricalLow
                ? 'bg-teal-950 text-teal-300 border-teal-700 font-semibold'
                : 'bg-slate-950/60 text-slate-400 border-slate-800/60 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Menor Preço Histórico</span>
          </button>
        </div>
      </div>

      {/* Third Row: Count, Sort Dropdown, View Mode, Clear filters */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800/80 flex-wrap text-xs">
        
        {/* Results count */}
        <div className="flex items-center gap-2 text-slate-400">
          <span>
            Exibindo <strong className="text-white">{totalResults}</strong> ofertas encontradas
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 ml-2 font-medium hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Sort and View Mode */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-select-dropdown"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
              }
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View mode buttons */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              id="view-list-btn"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
