/**
 * Utilitários para resolução segura e resiliente de URLs de streaming HLS.
 * Evita bloqueios de Mixed Content (HTTP em HTTPS) e erros de CORS.
 */

import { LatencyMode, VideoQuality, VideoQualityOption } from '@/types';

export const LOCAL_STORAGE_LATENCY_KEY = 'playsports_latency_mode';
export const LOCAL_STORAGE_QUALITY_KEY = 'worscoi_video_quality';

export const VIDEO_QUALITY_OPTIONS: VideoQualityOption[] = [
  {
    id: 'auto',
    label: 'Automático (Adaptativo)',
    shortLabel: 'Auto',
    resolution: 'Dinâmica',
    description: 'Ajusta a nitidez automaticamente de acordo com a velocidade e estabilidade da sua rede.',
  },
  {
    id: '360p',
    label: '360p • Sinal Fraco / Poupança',
    shortLabel: '360p',
    resolution: '640x360',
    description: 'Ideal para conexões lentas, dados móveis ou sinal oscilante. Mantém o vídeo reproduzindo sem travar.',
    recommendedForLowSignal: true,
  },
  {
    id: '480p',
    label: '480p • Definição Padrão (SD)',
    shortLabel: '480p',
    resolution: '854x480',
    description: 'Equilíbrio sólido entre estabilidade e nitidez, com consumo moderado.',
  },
  {
    id: '720p',
    label: '720p • Alta Definição (HD)',
    shortLabel: '720p',
    resolution: '1280x720',
    description: 'Imagem limpa e nítida para conexões residenciais estáveis.',
  },
  {
    id: '1080p',
    label: '1080p • Máxima Definição (Full HD)',
    shortLabel: '1080p',
    resolution: '1920x1080',
    description: 'Máxima fidelidade visual para redes de alta velocidade e Fibra Óptica.',
  },
];

export function getSafeStreamUrl(rawUrl: string, forceProxy = false): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('/api/proxy')) return trimmed;

  // URLs do YouTube são gerenciadas nativamente pelo player e não devem passar pelo proxy m3u8
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return trimmed;
  }

  const isHttpsPage =
    typeof window === 'undefined' || window.location.protocol === 'https:';
  const isInsecureHttp = trimmed.startsWith('http://');

  // Bloqueio de Mixed Content e CORS do navegador: Qualquer URL http:// ou quando forçado deve passar pelo proxy seguro
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
    typeof window === 'undefined' || window.location.protocol === 'https:';
  return forceProxy || (isHttpsPage && trimmed.startsWith('http://'));
}

/**
 * Retorna as configurações otimizadas do HLS.js para o modo de reprodução e qualidade escolhidos.
 * - Modo 360p / Sinal Fraco: Resolução leve, startLevel=0, timeouts e retries ampliados para garantir reprodução
 *   ininterrupta mesmo com sinal ruim, conexões móveis lentas (3G/4G) ou redes oscilantes.
 * - Modo Economia (Data Saver): Limita o buffer a 8s, descarta segmentos anteriores (backBuffer=0),
 *   prioriza rendições leves (startLevel=0) e capLevelToPlayerSize para economizar até 75% da franquia de dados.
 * - Modo Estável: Buffer equilibrado de 20s (24MB máx) para conexões normais.
 * - Modo Baixa Latência: Buffer curto e sincronização agressiva para transmissão ao vivo em tempo real.
 */
export function getHlsOptionsForLatencyMode(
  mode: LatencyMode,
  quality: VideoQuality = 'auto'
): Record<string, unknown> {
  // Configuração específica para 360p (Sinal Ruim / Poupança Máxima):
  // Mesmo com oscilação severa na rede, prioriza o stream mais leve e tolera atrasos de carregamento
  if (quality === '360p') {
    return {
      enableWorker: true,
      lowLatencyMode: false,
      capLevelToPlayerSize: true,
      startLevel: 0,
      autoLevelCapping: 0,
      backBufferLength: 0,
      maxBufferLength: 8,
      maxMaxBufferLength: 14,
      maxBufferSize: 5 * 1024 * 1024, // 5MB
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 8,
      manifestLoadingTimeOut: 20000,
      manifestLoadingMaxRetry: 6,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: 20000,
      levelLoadingMaxRetry: 6,
      levelLoadingRetryDelay: 1000,
      fragLoadingTimeOut: 25000,
      fragLoadingMaxRetry: 7,
      fragLoadingRetryDelay: 1000,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 8,
      maxBufferHole: 0.8,
      startFragPrefetch: true,
      progressive: true,
      testBandwidth: false,
      abrEwmaDefaultEstimate: 350000,
      abrBandWidthFactor: 0.65,
    };
  }

  if (quality === '480p') {
    return {
      enableWorker: true,
      lowLatencyMode: false,
      capLevelToPlayerSize: true,
      startLevel: 1,
      backBufferLength: 8,
      maxBufferLength: 12,
      maxMaxBufferLength: 20,
      maxBufferSize: 10 * 1024 * 1024,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 6,
      manifestLoadingTimeOut: 15000,
      manifestLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 900,
      levelLoadingTimeOut: 15000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 900,
      fragLoadingTimeOut: 18000,
      fragLoadingMaxRetry: 5,
      fragLoadingRetryDelay: 900,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 6,
      maxBufferHole: 0.5,
      startFragPrefetch: true,
      progressive: true,
      testBandwidth: false,
      abrEwmaDefaultEstimate: 750000,
      abrBandWidthFactor: 0.75,
    };
  }

  if (mode === 'economy') {
    return {
      enableWorker: true,
      lowLatencyMode: false,
      capLevelToPlayerSize: true,
      startLevel: 0,
      backBufferLength: 0,
      maxBufferLength: 8,
      maxMaxBufferLength: 14,
      maxBufferSize: 6 * 1024 * 1024, // 6MB
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 6,
      manifestLoadingTimeOut: 14000,
      manifestLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 800,
      levelLoadingTimeOut: 14000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 800,
      fragLoadingTimeOut: 18000,
      fragLoadingMaxRetry: 5,
      fragLoadingRetryDelay: 800,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 6,
      maxBufferHole: 0.6,
      startFragPrefetch: true,
      progressive: true,
      testBandwidth: false,
      abrEwmaDefaultEstimate: 450000,
      abrBandWidthFactor: 0.7,
    };
  }

  if (mode === 'stable') {
    return {
      enableWorker: true,
      lowLatencyMode: false,
      capLevelToPlayerSize: true,
      backBufferLength: 15,
      maxBufferLength: 20,
      maxMaxBufferLength: 40,
      maxBufferSize: 24 * 1024 * 1024, // 24MB buffer robusto para evitar travamentos
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 7,
      manifestLoadingTimeOut: 15000,
      manifestLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: 15000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 1000,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 5,
      fragLoadingRetryDelay: 1000,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 5,
      maxBufferHole: 0.5,
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
    backBufferLength: 6,
    maxBufferLength: 6,
    maxMaxBufferLength: 12,
    maxBufferSize: 12 * 1024 * 1024,
    liveSyncDurationCount: 2,
    liveMaxLatencyDurationCount: 4,
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 3,
    manifestLoadingRetryDelay: 600,
    levelLoadingTimeOut: 10000,
    levelLoadingMaxRetry: 3,
    levelLoadingRetryDelay: 600,
    fragLoadingTimeOut: 12000,
    fragLoadingMaxRetry: 4,
    fragLoadingRetryDelay: 600,
    nudgeOffset: 0.1,
    nudgeMaxRetry: 4,
    maxBufferHole: 0.5,
    startFragPrefetch: true,
    progressive: true,
    testBandwidth: false,
    startLevel: -1,
  };
}

/**
 * Aplica diretamente a resolução desejada na instância HLS.js ativa.
 * Suporta auto, 360p, 480p, 720p, 1080p selecionando o nível correspondente de forma resiliente.
 */
export function applyQualityToHls(hlsInstance: unknown, quality: VideoQuality): boolean {
  if (!hlsInstance || typeof hlsInstance !== 'object') return false;
  const hls = hlsInstance as {
    levels?: Array<{ height?: number; bitrate?: number }>;
    currentLevel?: number;
    autoLevelCapping?: number;
    loadLevel?: number;
  };

  if (quality === 'auto') {
    hls.currentLevel = -1;
    hls.autoLevelCapping = -1;
    return true;
  }

  if (!Array.isArray(hls.levels) || hls.levels.length === 0) {
    return false;
  }

  const targetHeight =
    quality === '360p'
      ? 360
      : quality === '480p'
      ? 480
      : quality === '720p'
      ? 720
      : 1080;

  // Busca o nível mais próximo ou o menor nível disponível se for 360p
  let bestIdx = 0;
  let minDiff = Infinity;

  hls.levels.forEach((lvl, idx) => {
    const h = lvl.height || 0;
    if (h > 0) {
      const diff = Math.abs(h - targetHeight);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = idx;
      }
    }
  });

  // Se o usuário solicitou 360p para sinal ruim, garante que não escolha um nível 1080p se houver um menor
  if (quality === '360p') {
    let lowestIdx = 0;
    let lowestHeight = Infinity;
    hls.levels.forEach((lvl, idx) => {
      const h = lvl.height || 0;
      if (h > 0 && h < lowestHeight) {
        lowestHeight = h;
        lowestIdx = idx;
      }
    });
    bestIdx = lowestIdx;
  }

  hls.currentLevel = bestIdx;
  hls.autoLevelCapping = bestIdx;
  return true;
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
    icon: '',
    title: 'O Rei da Europa',
    fact: 'O Real Madrid é o clube mais vitorioso da história da UEFA Champions League com 15 títulos conquistados.',
  },
  {
    id: 'cr7-goals',
    tag: 'Recorde Mundial',
    icon: '',
    title: 'Goleador Implacável',
    fact: 'Cristiano Ronaldo é o maior artilheiro de seleções nacionais da história do futebol com mais de 130 gols por Portugal.',
  },
  {
    id: 'girabola-angola',
    tag: 'Futebol Angolano',
    icon: '',
    title: 'Clássico dos Clássicos',
    fact: 'No Girabola de Angola, o clássico eterno entre Petro de Luanda e 1º de Agosto mobiliza milhões de adeptos apaixonados.',
  },
  {
    id: 'lebron-record',
    tag: 'NBA Basquete',
    icon: '',
    title: 'Lenda das Quadras',
    fact: 'LeBron James tornou-se o primeiro jogador na história da NBA a ultrapassar a marca inédita de 40.000 pontos.',
  },
  {
    id: 'angola-mundial-2006',
    tag: 'Palancas Negras',
    icon: '',
    title: 'História em Copas',
    fact: 'A seleção de Angola (Palancas Negras) disputou a Copa do Mundo de 2006 na Alemanha com atuações históricas e memoráveis.',
  },
  {
    id: 'messi-ballon-dor',
    tag: 'Futebol Mundial',
    icon: '',
    title: 'Aura Incomparável',
    fact: 'Lionel Messi é o único atleta da história a vencer 8 Bolas de Ouro e liderar a Argentina ao título de campeão mundial.',
  },
  {
    id: 'premier-speed',
    tag: 'Premier League',
    icon: '',
    title: 'Intensidade Máxima',
    fact: 'A Premier League inglesa é transmitida para mais de 212 territórios, alcançando bilhões de apaixonados por futebol.',
  },
  {
    id: 'data-saving-tip',
    tag: 'Dica Worscoi',
    icon: '',
    title: 'Economia de Internet',
    fact: 'Ative o "Modo Estável" no reprodutor caso a sua internet oscile para evitar pausas e congelamentos.',
  },
  {
    id: 'speed-tip',
    tag: 'Dica Worscoi',
    icon: '',
    title: 'Troca de Canais',
    fact: 'Use as teclas de seta [← e →] no teclado para fazer zapping instantâneo entre os canais.',
  },
  {
    id: 'nba-curry',
    tag: 'NBA',
    icon: '',
    title: 'Rei dos Três Pontos',
    fact: 'Stephen Curry revolucionou o basquete moderno e é o maior arremessador de 3 pontos de todos os tempos.',
  },
];

export const EMERGENCY_FALLBACK_STREAMS: Record<string, string> = {
  Esportes: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
  Notícias: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
  Bonecos: 'https://cdn.freevisiontv.co.za/sttv/smil:1kzn.stream.smil/playlist.m3u8',
  Filmes: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
  Lazer: 'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
  Novelas: 'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8',
  Músicas: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
  Default: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
};

export function getEmergencyFallbackStream(categoria?: string): string {
  if (categoria && EMERGENCY_FALLBACK_STREAMS[categoria]) {
    return EMERGENCY_FALLBACK_STREAMS[categoria];
  }
  return EMERGENCY_FALLBACK_STREAMS.Default;
}


