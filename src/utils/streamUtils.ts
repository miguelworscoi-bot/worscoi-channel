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

