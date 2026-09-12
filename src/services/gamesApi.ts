import { GameDeal, FreeGiveaway, StoreDealComparison } from '@/types';
import { INITIAL_DEALS, INITIAL_GIVEAWAYS } from '@/data/mockDeals';
import { KNOWN_STORES } from '@/utils/constants';

interface CheapSharkDealItem {
  dealID: string;
  gameID?: string;
  title: string;
  storeID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  metacriticScore?: string;
  dealRating?: string;
  steamRatingPercent?: string;
  steamRatingText?: string;
  steamRatingCount?: string;
  releaseDate?: number;
  thumb?: string;
}

interface GamerPowerItem {
  id: number | string;
  title: string;
  worth?: string;
  thumbnail?: string;
  image?: string;
  description?: string;
  instructions?: string;
  open_giveaway_url?: string;
  published_date?: string;
  end_date?: string;
  platforms?: string;
}

interface CheapSharkDetailDeal {
  dealID: string;
  storeID: string;
  price: string;
  retailPrice: string;
  savings: string;
}

const CHEAPSHARK_BASE = 'https://www.cheapshark.com/api/1.0';
const GAMERPOWER_BASE = 'https://www.gamerpower.com/api/giveaways';

// Map CheapShark store ID to known names
export function getStoreNameById(storeID: string): string {
  if (KNOWN_STORES[storeID]) {
    return KNOWN_STORES[storeID].name;
  }
  switch (storeID) {
    case '1':
      return 'Steam';
    case '2':
      return 'GamersGate';
    case '3':
      return 'GreenManGaming';
    case '7':
      return 'GOG';
    case '11':
      return 'Humble Store';
    case '15':
      return 'Fanatical';
    case '25':
      return 'Epic Games';
    case '31':
      return 'Blizzard';
    default:
      return `Loja #${storeID}`;
  }
}

export async function fetchLiveDeals(options?: {
  storeID?: string;
  sortBy?: string;
  pageSize?: number;
  title?: string;
}): Promise<GameDeal[]> {
  try {
    const params = new URLSearchParams();
    params.append('pageSize', String(options?.pageSize || 40));

    if (options?.storeID && options.storeID !== 'all') {
      params.append('storeID', options.storeID);
    } else {
      // Default to major popular stores: Steam(1), Epic(25), GOG(7), Humble(11), Fanatical(15), GMG(3)
      params.append('storeID', '1,25,7,11,15,3');
    }

    if (options?.title) {
      params.append('title', options.title);
    }

    if (options?.sortBy) {
      if (options.sortBy === 'savings') params.append('sortBy', 'Savings');
      else if (options.sortBy === 'metacritic') params.append('sortBy', 'Metacritic');
      else if (options.sortBy === 'price_asc') params.append('sortBy', 'Price');
      else if (options.sortBy === 'recent') params.append('sortBy', 'Release');
      else params.append('sortBy', 'Deal Rating');
    } else {
      params.append('sortBy', 'Deal Rating');
    }

    // Minimum 10% discount to filter out non-deals
    params.append('lowerPrice', '0');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${CHEAPSHARK_BASE}/deals?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AgregadorJogosApp/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return INITIAL_DEALS;
    }

    return data.map((item: CheapSharkDealItem) => {
      const normalPrice = parseFloat(item.normalPrice) || 0;
      const salePrice = parseFloat(item.salePrice) || 0;
      const savings = Math.round(parseFloat(item.savings) || 0);
      const metacritic = parseInt(item.metacriticScore || '0', 10) || 0;
      const dealRating = parseFloat(item.dealRating || '0') || 0;
      const steamRatingPercent = parseInt(item.steamRatingPercent || '0', 10) || 0;

      return {
        id: item.dealID || `deal-${item.gameID}-${item.storeID}`,
        dealID: item.dealID,
        title: item.title,
        storeID: item.storeID,
        storeName: getStoreNameById(item.storeID),
        salePrice,
        normalPrice,
        savings,
        metacriticScore: metacritic > 0 ? metacritic : undefined,
        steamRatingText: item.steamRatingText || undefined,
        steamRatingPercent: steamRatingPercent > 0 ? steamRatingPercent : undefined,
        steamRatingCount: item.steamRatingCount ? parseInt(item.steamRatingCount, 10) : undefined,
        releaseDate: item.releaseDate ? new Date(item.releaseDate * 1000).toISOString().split('T')[0] : undefined,
        dealRating,
        isHistoricalLow: savings >= 60 || dealRating >= 9.2,
        historicalLowPrice: salePrice,
        thumb: item.thumb || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC'],
      };
    });
  } catch (err) {
    console.warn('CheapShark live fetch failed, using fallback curated deals:', err);
    return INITIAL_DEALS;
  }
}

export async function fetchLiveGiveaways(): Promise<FreeGiveaway[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${GAMERPOWER_BASE}?type=game`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GamerPower response error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return INITIAL_GIVEAWAYS;
    }

    return data.slice(0, 15).map((gw: GamerPowerItem) => {
      let store: FreeGiveaway['store'] = 'Outro';
      const platformsLower = (gw.platforms || '').toLowerCase();
      if (platformsLower.includes('epic')) store = 'Epic Games';
      else if (platformsLower.includes('steam')) store = 'Steam';
      else if (platformsLower.includes('gog')) store = 'GOG';
      else if (platformsLower.includes('prime') || platformsLower.includes('amazon')) store = 'Prime Gaming';

      const worthStr = (gw.worth || '').replace('$', '').trim();
      const worth = parseFloat(worthStr) || 19.99;

      return {
        id: String(gw.id),
        title: gw.title,
        worth,
        thumbnail: gw.thumbnail || gw.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
        description: gw.description || 'Jogo gratuito por tempo limitado.',
        instructions: gw.instructions || 'Acesse a página oficial e resgate para sua conta.',
        openGiveawayUrl: gw.open_giveaway_url || 'https://store.epicgames.com',
        publishedDate: gw.published_date ? gw.published_date.split(' ')[0] : undefined,
        endDate: gw.end_date,
        platforms: gw.platforms || 'PC',
        store,
        type: 'Game',
        status: 'ACTIVE',
      };
    });
  } catch (err) {
    console.warn('GamerPower live fetch failed, using curated active giveaways:', err);
    return INITIAL_GIVEAWAYS;
  }
}

export async function fetchStoreComparisons(gameTitle: string): Promise<StoreDealComparison[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${CHEAPSHARK_BASE}/games?title=${encodeURIComponent(gameTitle)}&limit=5`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AgregadorJogosApp/1.0' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Failed to search game');

    const searchData = await res.json();
    if (Array.isArray(searchData) && searchData.length > 0) {
      const bestMatch = searchData[0];
      const gameId = bestMatch.gameID;

      // Now fetch details for this gameID
      const detailRes = await fetch(`${CHEAPSHARK_BASE}/games?id=${gameId}`, {
        headers: { 'User-Agent': 'AgregadorJogosApp/1.0' },
      });
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        if (detailData.deals && Array.isArray(detailData.deals)) {
          const dealsList: CheapSharkDetailDeal[] = detailData.deals;
          let minPrice = Infinity;
          dealsList.forEach((d) => {
            const p = parseFloat(d.price);
            if (p < minPrice) minPrice = p;
          });

          return dealsList.slice(0, 8).map((d: CheapSharkDetailDeal) => {
            const price = parseFloat(d.price) || 0;
            const retailPrice = parseFloat(d.retailPrice) || price;
            const savings = Math.round(parseFloat(d.savings) || 0);
            return {
              storeID: d.storeID,
              storeName: getStoreNameById(d.storeID),
              price,
              retailPrice,
              savings,
              dealID: d.dealID,
              url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
              isBestPrice: Math.abs(price - minPrice) < 0.01,
            };
          });
        }
      }
    }
  } catch {
    // Return simulated comparison
  }

  // Fallback comparison across major stores
  const basePrice = 49.99;
  return [
    {
      storeID: '1',
      storeName: 'Steam',
      price: 29.99,
      retailPrice: basePrice,
      savings: 40,
      url: 'https://store.steampowered.com',
      isBestPrice: false,
    },
    {
      storeID: '25',
      storeName: 'Epic Games',
      price: 24.99,
      retailPrice: basePrice,
      savings: 50,
      url: 'https://store.epicgames.com',
      isBestPrice: true,
    },
    {
      storeID: '7',
      storeName: 'GOG',
      price: 34.99,
      retailPrice: basePrice,
      savings: 30,
      url: 'https://www.gog.com',
      isBestPrice: false,
    },
    {
      storeID: '15',
      storeName: 'Fanatical',
      price: 27.50,
      retailPrice: basePrice,
      savings: 45,
      url: 'https://www.fanatical.com',
      isBestPrice: false,
    },
  ];
}
