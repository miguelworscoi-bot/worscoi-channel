import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  GameDeal,
  FreeGiveaway,
  WishlistItem,
  CurrencyCode,
  FilterOptions,
} from '@/types';
import { fetchLiveDeals, fetchLiveGiveaways } from '@/services/gamesApi';
import { INITIAL_DEALS, INITIAL_GIVEAWAYS } from '@/data/mockDeals';

interface AppContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  deals: GameDeal[];
  giveaways: FreeGiveaway[];
  isLoading: boolean;
  selectedDeal: GameDeal | null;
  setSelectedDeal: (deal: GameDeal | null) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  wishlist: WishlistItem[];
  toggleWishlist: (deal: GameDeal, targetPrice?: number) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  refreshData: () => Promise<void>;
  filteredDeals: GameDeal[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [deals, setDeals] = useState<GameDeal[]>(INITIAL_DEALS);
  const [giveaways, setGiveaways] = useState<FreeGiveaway[]>(INITIAL_GIVEAWAYS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDeal, setSelectedDeal] = useState<GameDeal | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
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

  // Wishlist in localStorage
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('agregador_jogos_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agregador_jogos_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const refreshData = async () => {
    setIsLoading(true);
    showToast('Atualizando dados das lojas...');
    try {
      const [newDeals, newGiveaways] = await Promise.all([
        fetchLiveDeals({ pageSize: 40 }),
        fetchLiveGiveaways(),
      ]);
      if (newDeals && newDeals.length > 0) setDeals(newDeals);
      if (newGiveaways && newGiveaways.length > 0) setGiveaways(newGiveaways);
      showToast('Preços e promoções atualizados com sucesso!');
    } catch (err) {
      console.error('Falha ao atualizar dados:', err);
      showToast('Usando catálogo em cache.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      try {
        const [liveDeals, liveGiveaways] = await Promise.all([
          fetchLiveDeals({ pageSize: 40 }),
          fetchLiveGiveaways(),
        ]);
        if (liveDeals && liveDeals.length > 0) setDeals(liveDeals);
        if (liveGiveaways && liveGiveaways.length > 0) setGiveaways(liveGiveaways);
      } catch (err) {
        console.warn('API fallback active:', err);
      }
    };
    initFetch();
  }, []);

  const toggleWishlist = (deal: GameDeal, targetPrice?: number) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === deal.id || item.title === deal.title);
      if (exists) {
        showToast(`"${deal.title}" removido da lista de desejos`);
        return prev.filter((item) => item.id !== deal.id && item.title !== deal.title);
      } else {
        const newItem: WishlistItem = {
          id: deal.id,
          title: deal.title,
          targetPrice: targetPrice || deal.salePrice,
          currentPrice: deal.salePrice,
          normalPrice: deal.normalPrice,
          savings: deal.savings,
          storeName: deal.storeName,
          dealID: deal.dealID,
          thumb: deal.thumb,
          addedAt: new Date().toISOString(),
        };
        showToast(`"${deal.title}" adicionado aos favoritos!`);
        return [newItem, ...prev];
      }
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removido da lista.');
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Lista de desejos limpa.');
  };

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const query = (filters.search || searchQuery).toLowerCase().trim();
      if (query && !deal.title.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.selectedStores.length > 0 && !filters.selectedStores.includes(deal.storeID)) {
        return false;
      }
      if (filters.maxPrice !== null && deal.salePrice > filters.maxPrice) {
        return false;
      }
      if (filters.minDiscount > 0 && deal.savings < filters.minDiscount) {
        return false;
      }
      if (filters.minMetacritic > 0 && (!deal.metacriticScore || deal.metacriticScore < filters.minMetacritic)) {
        return false;
      }
      if (filters.onlyHistoricalLow && !deal.isHistoricalLow) {
        return false;
      }
      if (filters.onlyFree && deal.salePrice > 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'savings':
          return b.savings - a.savings;
        case 'price_asc':
          return a.salePrice - b.salePrice;
        case 'price_desc':
          return b.salePrice - a.salePrice;
        case 'metacritic':
          return (b.metacriticScore || 0) - (a.metacriticScore || 0);
        case 'deal_rating':
        default:
          return (b.dealRating || 0) - (a.dealRating || 0);
      }
    });
  }, [deals, filters, searchQuery]);

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        deals,
        giveaways,
        isLoading,
        selectedDeal,
        setSelectedDeal,
        viewMode,
        setViewMode,
        toastMessage,
        showToast,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshData,
        filteredDeals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
