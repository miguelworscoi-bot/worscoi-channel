export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export type LatencyMode = 'economy' | 'stable' | 'low-latency';

export type SubscriptionPlanId = 'free' | 'diario' | 'basico' | 'vip' | 'premium' | 'anual';

export interface PlanInfo {
  id: SubscriptionPlanId;
  name: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  durationDays: number;
  priceFormatted: string;
  priceAOA?: number;
  popular?: boolean;
  description: string;
  features: string[];
  channelsOffered?: string[];
  channelCountLabel?: string;
}

export interface AccessTokenRecord {
  id: string;
  code: string; // 5 caracteres alfanuméricos únicos (ex: X7K9P)
  plan: SubscriptionPlanId;
  planName: string;
  durationDays: number;
  status: 'active' | 'used' | 'revoked';
  createdAt: string;
  createdBy?: string;
  usedAt?: string | null;
  usedByUserId?: string | null;
  usedByEmail?: string | null;
  notes?: string;
}

export interface SubscriberUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  plan: SubscriptionPlanId;
  planName: string;
  planExpiresAt?: string | null;
  activatedToken?: string | null;
  createdAt: string;
  lastActive?: string;
}

export type FiltroAtivo =
  | 'Todos'
  | 'Favoritos'
  | 'Bonecos'
  | 'Esportes'
  | 'Novelas'
  | 'Notícias'
  | 'Músicas'
  | 'Filmes'
  | 'Libertadores'
  | 'Champions League'
  | 'TNT Sports'
  | 'LaLiga'
  | 'NBA'
  | 'MLS'
  | 'beIN Sports'
  | 'ZAP Angola'
  | 'SuperSport'
  | 'Vivo TV'
  | 'Brasil'
  | 'Portugal'
  | 'Futebol'
  | 'Lazer'
  | 'YouTube'
  | 'Meus Canais';

export type CategoriaCanalGeral =
  | 'Bonecos'
  | 'Esportes'
  | 'Novelas'
  | 'Notícias'
  | 'Músicas'
  | 'Filmes'
  | 'Lazer'
  | 'YouTube';

export interface Canal {
  id?: string;
  nome: string;
  logo: string;
  url: string;
  backupUrls?: string[];
  categoria?: CategoriaCanalGeral;
  pais?: 'BR' | 'AO' | 'PT' | 'ES' | 'US' | 'FR' | 'DE' | 'JP' | 'NL' | 'UK' | 'Global' | string;
  rede?:
    | 'TNT Sports'
    | 'beIN Sports'
    | 'ZAP'
    | 'SuperSport'
    | 'Vivo'
    | 'ESPN'
    | 'DAZN'
    | 'Sport TV'
    | 'Sky Sports'
    | 'Movistar'
    | 'Ziggo'
    | 'NBA TV'
    | 'Fox Sports'
    | 'Disney'
    | 'Cartoon'
    | 'Anime'
    | 'Telecine'
    | 'HBO'
    | 'MTV'
    | 'Stingray'
    | 'Trace'
    | 'YouTube'
    | 'Personalizado'
    | 'Geral'
    | string;
  grupo?: string;
  competicoes?: string[];
  isCustom?: boolean;
  handle?: string;
  verified?: boolean;
  likesCount?: string;
  commentsCount?: string;
  hashtags?: string[];
  soundtrack?: string;
  minPlan?: SubscriptionPlanId;
}

export type WorscoiView = 'explorar' | 'painel' | 'assinantes' | 'filmoteca';

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

export interface ImdbDetalhes {
  imdbId: string;
  titulo: string;
  tituloOriginal?: string;
  ano: string;
  classificacao?: string; // e.g. "PG-13", "TV-MA", "16+"
  duracao?: string; // e.g. "152 min"
  genero?: string;
  diretor?: string;
  roteirista?: string;
  elenco: string[]; // Lista de atores individuais
  elencoTexto: string; // "Christian Bale, Heath Ledger, Aaron Eckhart"
  sinopse: string;
  sinopseLocal?: string;
  notaImdb: string; // e.g. "9.0"
  votosImdb?: string; // e.g. "2,980,120"
  metascore?: string;
  premios?: string;
  capa?: string;
  tipo?: 'filme' | 'serie' | 'anime';
  totalTemporadas?: number;
  pais?: string;
  idioma?: string;
  urlImdb: string;
  fonte?: 'omdb' | 'imdb_suggestion' | 'catalogo';
}
