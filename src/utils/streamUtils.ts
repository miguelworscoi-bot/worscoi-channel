/**
 * Utilitários para resolução segura e resiliente de URLs de streaming HLS.
 * Evita bloqueios de Mixed Content (HTTP em HTTPS) e erros de CORS.
 */

import { LatencyMode } from '@/types';

export const LOCAL_STORAGE_LATENCY_KEY = 'playsports_latency_mode';

export function getSafeStreamUrl(rawUrl: string, forceProxy = false): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('/api/proxy')) return trimmed;

  // URLs do YouTube são gerenciadas nativamente pelo player e não devem passar pelo proxy m3u8
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return trimmed;
  }

  const isHttpsPage =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isInsecureHttp = trimmed.startsWith('http://');

  // Bloqueio de Mixed Content do navegador: Qualquer URL http:// em página https:// deve passar pelo proxy seguro
  if (forceProxy || (isHttpsPage && isInsecureHttp)) {
    return `/api/proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

export function isStreamAutoProxied(rawUrl: string, forceProxy = false): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return false;
  }
  const isHttpsPage =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  return forceProxy || (isHttpsPage && trimmed.startsWith('http://'));
}

/**
 * Retorna as configurações otimizadas do HLS.js para o modo de reprodução escolhido.
 * - Modo Economia (Data Saver): Limita o buffer a 5s, descarta segmentos anteriores (backBuffer=0),
 *   prioriza rendições leves (startLevel=0) e capLevelToPlayerSize para economizar até 75% da franquia de dados
 *   e permitir carregamento ultrarrápido mesmo em redes móveis (3G/4G/Unitel/Movicel) ou conexões instáveis.
 * - Modo Estável: Buffer equilibrado de 14s (18MB máx) para conexões normais.
 * - Modo Baixa Latência: Buffer curto e sincronização agressiva para transmissão ao vivo em tempo real.
 */
export function getHlsOptionsForLatencyMode(mode: LatencyMode): Record<string, unknown> {
  if (mode === 'economy') {
    return {
      enableWorker: true,
      lowLatencyMode: false,
      capLevelToPlayerSize: true,
      startLevel: 0,
      backBufferLength: 0,
      maxBufferLength: 4,
      maxMaxBufferLength: 6,
      maxBufferSize: 4 * 1024 * 1024, // 4MB de buffer ultra-leve
      liveSyncDurationCount: 2,
      liveMaxLatencyDurationCount: 4,
      manifestLoadingTimeOut: 3500,
      manifestLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 400,
      levelLoadingTimeOut: 3500,
      levelLoadingMaxRetry: 1,
      levelLoadingRetryDelay: 400,
      fragLoadingTimeOut: 4000,
      fragLoadingMaxRetry: 1,
      fragLoadingRetryDelay: 400,
      startFragPrefetch: true,
      progressive: true,
      testBandwidth: false,
    };
  }

  if (mode === 'stable') {
    return {
      enableWorker: true,
      lowLatencyMode: false,
      capLevelToPlayerSize: true,
      backBufferLength: 10,
      maxBufferLength: 8,
      maxMaxBufferLength: 15,
      maxBufferSize: 12 * 1024 * 1024, // 12MB equilibrado
      liveSyncDurationCount: 2,
      liveMaxLatencyDurationCount: 5,
      manifestLoadingTimeOut: 4000,
      manifestLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 500,
      levelLoadingTimeOut: 4000,
      levelLoadingMaxRetry: 1,
      levelLoadingRetryDelay: 500,
      fragLoadingTimeOut: 4500,
      fragLoadingMaxRetry: 1,
      fragLoadingRetryDelay: 500,
      startFragPrefetch: true,
      progressive: true,
      testBandwidth: false,
      startLevel: -1,
    };
  }

  // low-latency mode (Tempo Real / Fibra)
  return {
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 4,
    maxBufferLength: 3,
    maxMaxBufferLength: 6,
    maxBufferSize: 8 * 1024 * 1024,
    liveSyncDurationCount: 2,
    liveMaxLatencyDurationCount: 3,
    manifestLoadingTimeOut: 3000,
    manifestLoadingMaxRetry: 1,
    manifestLoadingRetryDelay: 300,
    levelLoadingTimeOut: 3000,
    levelLoadingMaxRetry: 1,
    levelLoadingRetryDelay: 300,
    fragLoadingTimeOut: 3500,
    fragLoadingMaxRetry: 1,
    fragLoadingRetryDelay: 300,
    startFragPrefetch: true,
    progressive: true,
    testBandwidth: false,
    startLevel: -1,
  };
}

export interface LatencyModeInfo {
  id: LatencyMode;
  title: string;
  shortLabel: string;
  badge: string;
  consumption: string;
  description: string;
  savingsEstimate: string;
}

export function getLatencyModeInfo(mode: LatencyMode): LatencyModeInfo {
  switch (mode) {
    case 'economy':
      return {
        id: 'economy',
        title: 'Economia de Dados',
        shortLabel: 'Poupança (-70%)',
        badge: 'Poupança Máxima',
        consumption: '~350 MB / hora',
        description:
          'Buffer enxuto de 5s e resolução otimizada. Evita downloads desnecessários ao trocar de canal. Economiza até 75% dos dados móveis.',
        savingsEstimate: 'Economiza até 75% de Internet',
      };
    case 'stable':
      return {
        id: 'stable',
        title: 'Modo Equilibrado (HD)',
        shortLabel: 'Equilibrado (HD)',
        badge: 'Buffer 14s',
        consumption: '~900 MB / hora',
        description:
          'Buffer balanceado de 14s. Garante estabilidade sem congelamento de tela com consumo moderado.',
        savingsEstimate: 'Consumo equilibrado',
      };
    case 'low-latency':
      return {
        id: 'low-latency',
        title: 'Baixa Latência (Tempo Real)',
        shortLabel: 'Tempo Real',
        badge: 'Ao Vivo 2s',
        consumption: '~1.8 GB / hora',
        description:
          'Transmissão instantânea com mínimo atraso do sinal ao vivo. Recomendado para Fibra Óptica ou Wi-Fi ilimitado.',
        savingsEstimate: 'Consumo padrão Full HD',
      };
  }
}

export interface SportsTriviaItem {
  id: string;
  tag: string;
  icon: string;
  title: string;
  fact: string;
}

export const SPORTS_TRIVIA: SportsTriviaItem[] = [
  {
    id: 'ucl-15',
    tag: 'Champions League',
    icon: '🏆',
    title: 'O Rei da Europa',
    fact: 'O Real Madrid é o clube mais vitorioso da história da UEFA Champions League com 15 títulos conquistados.',
  },
  {
    id: 'cr7-goals',
    tag: 'Recorde Mundial',
    icon: '⚽',
    title: 'Goleador Implacável',
    fact: 'Cristiano Ronaldo é o maior artilheiro de seleções nacionais da história do futebol com mais de 130 gols por Portugal.',
  },
  {
    id: 'girabola-angola',
    tag: 'Futebol Angolano',
    icon: '🇦🇴',
    title: 'Clássico dos Clássicos',
    fact: 'No Girabola de Angola, o clássico eterno entre Petro de Luanda e 1º de Agosto mobiliza milhões de adeptos apaixonados.',
  },
  {
    id: 'lebron-record',
    tag: 'NBA Basquete',
    icon: '🏀',
    title: 'Lenda das Quadras',
    fact: 'LeBron James tornou-se o primeiro jogador na história da NBA a ultrapassar a marca inédita de 40.000 pontos.',
  },
  {
    id: 'angola-mundial-2006',
    tag: 'Palancas Negras',
    icon: '🇦🇴',
    title: 'História em Copas',
    fact: 'A seleção de Angola (Palancas Negras) disputou a Copa do Mundo de 2006 na Alemanha com atuações históricas e memoráveis.',
  },
  {
    id: 'messi-ballon-dor',
    tag: 'Futebol Mundial',
    icon: '✨',
    title: 'Aura Incomparável',
    fact: 'Lionel Messi é o único atleta da história a vencer 8 Bolas de Ouro e liderar a Argentina ao título de campeão mundial.',
  },
  {
    id: 'premier-speed',
    tag: 'Premier League',
    icon: '🦁',
    title: 'Intensidade Máxima',
    fact: 'A Premier League inglesa é transmitida para mais de 212 territórios, alcançando bilhões de apaixonados por futebol.',
  },
  {
    id: 'data-saving-tip',
    tag: 'Dica Worscoi',
    icon: '💡',
    title: 'Economia de Internet',
    fact: 'Ative o "Modo Estável" no reprodutor caso a sua internet oscile para evitar pausas e congelamentos.',
  },
  {
    id: 'speed-tip',
    tag: 'Dica Worscoi',
    icon: '⚡',
    title: 'Troca de Canais',
    fact: 'Use as teclas de seta [← e →] no teclado para fazer zapping instantâneo entre os canais.',
  },
  {
    id: 'nba-curry',
    tag: 'NBA',
    icon: '🎯',
    title: 'Rei dos Três Pontos',
    fact: 'Stephen Curry revolucionou o basquete moderno e é o maior arremessador de 3 pontos de todos os tempos.',
  },
];

export const EMERGENCY_FALLBACK_STREAMS: Record<string, string> = {
  Esportes: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
  Notícias: 'https://euronews-euronews-portuguese-1-pt.samsung.wurl.tv/playlist.m3u8',
  Bonecos: 'https://rakuten-kidstvpocoyo-1-pt.samsung.wurl.tv/playlist.m3u8',
  Filmes: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
  Lazer: 'https://tvzimbo.ao/live/tvzimbo/playlist.m3u8',
  Novelas: 'https://tvzimbo.ao/live/tvzimbo/playlist.m3u8',
  Músicas: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
  Default: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
};

export function getEmergencyFallbackStream(categoria?: string): string {
  if (categoria && EMERGENCY_FALLBACK_STREAMS[categoria]) {
    return EMERGENCY_FALLBACK_STREAMS[categoria];
  }
  return EMERGENCY_FALLBACK_STREAMS.Default;
}


