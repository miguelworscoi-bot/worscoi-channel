export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export interface GameDeal {
  id: string;
  dealID: string;
  title: string;
  storeID: string;
  storeName: string;
  storeIcon?: string;
  salePrice: number; // in USD base or converted
  normalPrice: number;
  savings: number; // percentage, e.g. 75
  metacriticScore?: number;
  steamRatingText?: string;
  steamRatingPercent?: number;
  steamRatingCount?: number;
  releaseDate?: string;
  thumb: string;
  banner?: string;
  dealRating?: number;
  isHistoricalLow?: boolean;
  historicalLowPrice?: number;
  genres?: string[];
  platforms?: ('PC' | 'PlayStation' | 'Xbox' | 'Switch')[];
  internalName?: string;
}

export interface FreeGiveaway {
  id: string;
  title: string;
  worth: number; // in USD
  thumbnail: string;
  description: string;
  instructions: string;
  openGiveawayUrl: string;
  publishedDate?: string;
  endDate?: string;
  platforms: string;
  store: 'Epic Games' | 'Steam' | 'GOG' | 'Prime Gaming' | 'Outro';
  type: 'Game' | 'DLC' | 'Loot';
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'UPCOMING';
}

export interface StoreDealComparison {
  storeID: string;
  storeName: string;
  storeIcon?: string;
  price: number;
  retailPrice: number;
  savings: number;
  dealID?: string;
  url: string;
  isBestPrice: boolean;
}

export interface WishlistItem {
  id: string;
  title: string;
  thumb: string;
  targetPrice?: number;
  addedAt: string;
  storeName: string;
  currentPrice: number;
  normalPrice: number;
  savings: number;
  dealID: string;
}

export type SortOption =
  | 'savings'
  | 'price_asc'
  | 'price_desc'
  | 'metacritic'
  | 'deal_rating'
  | 'recent';

export interface FilterOptions {
  search: string;
  selectedStores: string[];
  selectedPlatforms: string[];
  selectedGenres: string[];
  maxPrice: number | null;
  minDiscount: number;
  minMetacritic: number;
  onlyFree: boolean;
  onlyHistoricalLow: boolean;
  sortBy: SortOption;
}
