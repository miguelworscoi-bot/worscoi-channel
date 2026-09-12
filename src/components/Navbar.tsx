import React from 'react';
import { Gamepad2, Search, Gift, Heart, Scale, Flame, RefreshCw, X } from 'lucide-react';
import { CurrencyCode } from '@/types';
import { Link, usePathname } from '@/app/navigation';

interface NavbarProps {
  activeTab?: 'deals' | 'freebies' | 'comparator' | 'wishlist';
  setActiveTab?: (tab: 'deals' | 'freebies' | 'comparator' | 'wishlist') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  wishlistCount: number;
  freebiesCount: number;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab: propActiveTab,
  setActiveTab,
  currency,
  setCurrency,
  searchQuery,
  setSearchQuery,
  wishlistCount,
  freebiesCount,
  onRefresh,
  isLoading,
}) => {
  const pathname = usePathname();

  // Determine current active tab from pathname or prop
  const currentTab = propActiveTab || (
    pathname === '/gratis'
      ? 'freebies'
      : pathname === '/comparador'
      ? 'comparator'
      : pathname === '/desejos'
      ? 'wishlist'
      : 'deals'
  );

  const handleTabClick = (tab: 'deals' | 'freebies' | 'comparator' | 'wishlist') => {
    if (setActiveTab) setActiveTab(tab);
  };
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link 
            href="/"
            id="brand-logo" 
            onClick={() => handleTabClick('deals')}
            className="flex items-center gap-3 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white font-['Space_Grotesk']">
                  Agregador<span className="text-emerald-400">Jogos</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" title="Ao vivo" />
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wider uppercase font-medium">
                Ofertas & Jogos Grátis
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar jogos (ex: Elden Ring, Resident Evil, Cyberpunk)..."
                className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Nav Actions & Currency Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
              {(['BRL', 'USD', 'EUR'] as CurrencyCode[]).map((curr) => (
                <button
                  key={curr}
                  id={`currency-btn-${curr.toLowerCase()}`}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    currency === curr
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr === 'BRL' ? 'R$' : curr === 'USD' ? '$' : '€'}
                </button>
              ))}
            </div>

            {/* Refresh Live Button */}
            <button
              id="refresh-deals-btn"
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar dados ao vivo"
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg border border-slate-800/80 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar jogos..."
              className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                id="mobile-clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-900 pt-2 text-sm">
          <Link
            href="/"
            id="nav-tab-deals"
            onClick={() => handleTabClick('deals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              currentTab === 'deals'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Promoções & Ofertas</span>
          </Link>

          <Link
            href="/gratis"
            id="nav-tab-freebies"
            onClick={() => handleTabClick('freebies')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all relative ${
              currentTab === 'freebies'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>Jogos Grátis</span>
            {freebiesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full">
                {freebiesCount}
              </span>
            )}
          </Link>

          <Link
            href="/comparador"
            id="nav-tab-comparator"
            onClick={() => handleTabClick('comparator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              currentTab === 'comparator'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-sky-400" />
            <span>Comparar Lojas</span>
          </Link>

          <Link
            href="/desejos"
            id="nav-tab-wishlist"
            onClick={() => handleTabClick('wishlist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ml-auto ${
              currentTab === 'wishlist'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
            <span>Desejos</span>
            {wishlistCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
