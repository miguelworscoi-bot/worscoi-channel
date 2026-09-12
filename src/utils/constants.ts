import { CurrencyCode } from '../types';

export const EXCHANGE_RATES: Record<CurrencyCode, { symbol: string; rate: number; prefix: string }> = {
  BRL: { symbol: 'R$', rate: 5.42, prefix: 'R$ ' },
  USD: { symbol: '$', rate: 1.0, prefix: '$' },
  EUR: { symbol: '€', rate: 0.92, prefix: '€' },
};

export function formatCurrency(amountInUSD: number, currency: CurrencyCode = 'BRL'): string {
  const config = EXCHANGE_RATES[currency];
  const converted = amountInUSD * config.rate;
  
  if (currency === 'BRL') {
    return `R$ ${converted.toFixed(2).replace('.', ',')}`;
  } else if (currency === 'EUR') {
    return `${converted.toFixed(2).replace('.', ',')} €`;
  }
  return `$${converted.toFixed(2)}`;
}

export interface StoreMetadata {
  id: string;
  name: string;
  badgeColor: string;
  iconBg: string;
  cheapSharkId?: string;
  url: string;
}

export const KNOWN_STORES: Record<string, StoreMetadata> = {
  '1': {
    id: '1',
    name: 'Steam',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800/60',
    iconBg: 'from-blue-700 to-indigo-950',
    cheapSharkId: '1',
    url: 'https://store.steampowered.com',
  },
  '25': {
    id: '25',
    name: 'Epic Games',
    badgeColor: 'bg-zinc-800 text-zinc-100 border-zinc-700',
    iconBg: 'from-zinc-700 to-zinc-950',
    cheapSharkId: '25',
    url: 'https://store.epicgames.com',
  },
  '7': {
    id: '7',
    name: 'GOG',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800/60',
    iconBg: 'from-purple-800 to-indigo-950',
    cheapSharkId: '7',
    url: 'https://www.gog.com',
  },
  '11': {
    id: '11',
    name: 'Humble Store',
    badgeColor: 'bg-red-950 text-red-300 border-red-800/60',
    iconBg: 'from-red-700 to-red-950',
    cheapSharkId: '11',
    url: 'https://www.humblebundle.com/store',
  },
  '15': {
    id: '15',
    name: 'Fanatical',
    badgeColor: 'bg-orange-950 text-orange-300 border-orange-800/60',
    iconBg: 'from-orange-700 to-amber-950',
    cheapSharkId: '15',
    url: 'https://www.fanatical.com',
  },
  '3': {
    id: '3',
    name: 'GreenManGaming',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
    iconBg: 'from-emerald-700 to-teal-950',
    cheapSharkId: '3',
    url: 'https://www.greenmangaming.com',
  },
  'psn': {
    id: 'psn',
    name: 'PlayStation',
    badgeColor: 'bg-blue-900/60 text-sky-200 border-sky-700/60',
    iconBg: 'from-blue-600 to-blue-950',
    url: 'https://store.playstation.com',
  },
  'xbox': {
    id: 'xbox',
    name: 'Xbox Store',
    badgeColor: 'bg-green-950 text-emerald-300 border-green-800/60',
    iconBg: 'from-emerald-600 to-green-950',
    url: 'https://www.xbox.com',
  },
  'nintendo': {
    id: 'nintendo',
    name: 'Nintendo eShop',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800/60',
    iconBg: 'from-rose-600 to-red-950',
    url: 'https://www.nintendo.com',
  },
};

export const GENRES_LIST = [
  'Ação',
  'RPG',
  'Aventura',
  'Estratégia',
  'Terror',
  'Mundo Aberto',
  'Indie',
  'FPS',
  'Sobrevivência',
  'Sci-Fi',
  'Simulação',
  'Luta',
];

export const PLATFORMS_LIST = ['PC', 'PlayStation', 'Xbox', 'Switch'] as const;
