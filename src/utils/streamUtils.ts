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
  const isHttpsPage =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  return forceProxy || (isHttpsPage && trimmed.startsWith('http://'));
}

/**
 * Retorna as configurações otimizadas do HLS.js para o modo de latência escolhido.
 * - Modo Estável: Maior buffer (30s) e tolerância de carregamento para redes lentas ou oscilações 3G/4G.
 * - Modo Baixa Latência: Buffer curto e sincronização agressiva para transmissão em tempo real.
 */
export function getHlsOptionsForLatencyMode(mode: LatencyMode): Record<string, unknown> {
  if (mode === 'stable') {
    return {
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 60,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000,
      liveSyncDurationCount: 5,
      liveMaxLatencyDurationCount: 10,
      manifestLoadingTimeOut: 15000,
      manifestLoadingMaxRetry: 4,
      levelLoadingTimeOut: 15000,
      levelLoadingMaxRetry: 4,
      fragLoadingTimeOut: 15000,
      fragLoadingMaxRetry: 4,
      startLevel: -1,
    };
  }

  // low-latency mode (Tempo Real)
  return {
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 20,
    maxBufferLength: 6,
    maxMaxBufferLength: 12,
    liveSyncDurationCount: 2,
    liveMaxLatencyDurationCount: 4,
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 3,
    levelLoadingTimeOut: 10000,
    levelLoadingMaxRetry: 3,
    fragLoadingTimeOut: 10000,
    fragLoadingMaxRetry: 3,
    startLevel: -1,
  };
}

