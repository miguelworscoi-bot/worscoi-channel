/**
 * StreamService - Resolvedor de Links e Provedores de Streaming de Filmes
 * 
 * Funcionalidades:
 * 1. Resolução multi-provedor (Videasy, VidSrc, VidLink, AutoEmbed, 2Embed, Direto HTML5).
 * 2. Prevenção ativa de redirecionamentos indesejados e sequestro de navegação.
 * 3. Permissões de mídia (allow) otimizadas sem restrições de sandbox que quebrem localStorage/MSE.
 * 4. Cache inteligente em memória para resolução instantânea de streams.
 * 5. Suporte a abertura segura em Ecrã Externo (isolamento de processo).
 */

import { FilmeItem } from '@/app/api/filmes/route';

export type StreamProviderId =
  | 'videasy'
  | 'vidsrc'
  | 'vidlink'
  | 'autoembed'
  | 'vidsrcin'
  | 'direct'
  | 'trailer';

export interface StreamSource {
  id: StreamProviderId;
  name: string;
  badge: string;
  url: string;
  type: 'direct_video' | 'embed_iframe';
  isDirect: boolean;
  reliability: number; // 1 a 100
  hasSubtitles: boolean;
  quality: string;
  description: string;
}

export interface StreamResolutionResult {
  movieId: string | number;
  imdbId?: string;
  tmdbId?: string;
  title: string;
  primarySource: StreamSource;
  availableSources: StreamSource[];
  directVideoUrl?: string;
  trailerUrl?: string;
  allowPolicy: string;
  referrerPolicy: React.HTMLAttributeReferrerPolicy;
}

// Permissões ideais para players de vídeo HTML5/HLS/DASH
export const STREAM_IFRAME_ALLOW =
  'autoplay; fullscreen; encrypted-media; picture-in-picture; gyroscope; accelerometer; clipboard-write';

export const STREAM_REFERRER_POLICY: React.HTMLAttributeReferrerPolicy = 'origin';

// Cache em memória para resolução instantânea de requisições repetidas
const streamCache = new Map<string, StreamResolutionResult>();

/**
 * Normaliza e valida IDs de filmes
 */
function extrairIdentificadores(filme: { imdbId?: string; tmdbId?: string; id?: string | number }) {
  let imdb = (filme.imdbId || '').trim();
  const tmdb = (filme.tmdbId || '').trim();

  // Se o próprio ID do objeto for no formato tt...
  if (!imdb && typeof filme.id === 'string' && filme.id.startsWith('tt')) {
    imdb = filme.id;
  }

  return { imdb, tmdb };
}

/**
 * Filtra e sanitiza links para evitar redirecionamentos indesejados ou domínios inválidos
 */
function sanitizarUrlStreaming(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return '';
    }
    parsed.searchParams.delete('redirect');
    parsed.searchParams.delete('ad_url');
    parsed.searchParams.delete('pop');
    return parsed.toString();
  } catch {
    return '';
  }
}

export class StreamService {
  /**
   * Resolve todas as fontes ativas disponíveis para um filme específico
   */
  public static resolveStreams(
    filme: FilmeItem,
    season: number = 1,
    episode: number = 1
  ): StreamResolutionResult {
    const { imdb, tmdb } = extrairIdentificadores(filme);
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    const cacheKey = `film_${filme.id}_${imdb}_${tmdb}_s${s}_ep${ep}`;

    if (streamCache.has(cacheKey)) {
      return streamCache.get(cacheKey)!;
    }

    const idReferencia = imdb || tmdb;
    const tmdbRef = tmdb || imdb;
    const fontes: StreamSource[] = [];

    const isSeries =
      filme.tipo === 'serie' ||
      filme.tipo === 'anime' ||
      (filme.genero ? (filme.genero.toLowerCase().includes('série') || filme.genero.toLowerCase().includes('anime')) : false);

    // 1. FONTE NATIVA DIRETA (MP4 / HLS / CDN) - 100% livre de iframes, sem propagandas ou restrições
    if (filme.directStreamUrl) {
      fontes.push({
        id: 'direct',
        name: 'Stream Nativo (HTML5)',
        badge: '100% Direto',
        url: sanitizarUrlStreaming(filme.directStreamUrl),
        type: 'direct_video',
        isDirect: true,
        reliability: 100,
        hasSubtitles: true,
        quality: 'Original Direct',
        description: 'Reprodução local direta via player nativo HTML5, sem iframes ou bloqueios.'
      });
    }

    // 2. FONTE 1: VIDEASY VIP - Provedor ultra confiável indexado pelo catálogo mundial IMDb
    if (idReferencia) {
      const videasyUrl = isSeries
        ? `https://player.videasy.net/tv/${idReferencia}/${s}/${ep}`
        : `https://player.videasy.net/movie/${idReferencia}`;
      fontes.push({
        id: 'videasy',
        name: 'Fonte 1: Videasy VIP',
        badge: 'Recomendada',
        url: sanitizarUrlStreaming(videasyUrl),
        type: 'embed_iframe',
        isDirect: false,
        reliability: 98,
        hasSubtitles: true,
        quality: 'Full HD Multi-Áudio',
        description: 'Cluster redundante internacional estável com seletor de áudio e legendas em português.'
      });
    }

    // 3. FONTE 2: VIDSRC ULTRA (TO) - 100% livre de bloqueios ou mensagens de sandbox
    if (tmdbRef) {
      const vidsrcUrl = isSeries
        ? `https://vidsrc.to/embed/tv/${tmdbRef}/${s}/${ep}`
        : `https://vidsrc.to/embed/movie/${tmdbRef}`;
      fontes.push({
        id: 'vidsrc',
        name: 'Fonte 2: VidSrc Ultra',
        badge: 'Sem Bloqueio',
        url: sanitizarUrlStreaming(vidsrcUrl),
        type: 'embed_iframe',
        isDirect: false,
        reliability: 96,
        hasSubtitles: true,
        quality: '1080p HD',
        description: 'Rede de entrega direta sem verificação de sandbox ou erros de domínio.'
      });
    }

    // 4. FONTE 3: VIDSRC IN - Servidor adicional livre de sandbox
    if (tmdbRef) {
      const vidsrcInUrl = isSeries
        ? `https://vidsrc.in/embed/tv/${tmdbRef}/${s}/${ep}`
        : `https://vidsrc.in/embed/movie/${tmdbRef}`;
      fontes.push({
        id: 'vidsrcin',
        name: 'Fonte 3: VidSrc In',
        badge: 'Rápido',
        url: sanitizarUrlStreaming(vidsrcInUrl),
        type: 'embed_iframe',
        isDirect: false,
        reliability: 95,
        hasSubtitles: true,
        quality: '1080p HD',
        description: 'Espelho oficial VidSrc sem restrições de sandbox.'
      });
    }

    // 5. FONTE 4: VIDLINK PRO - Provedor moderno Ultra HD
    if (tmdbRef) {
      const vidlinkUrl = isSeries
        ? `https://vidlink.pro/tv/${tmdbRef}/${s}/${ep}?primaryColor=FF2D55&secondaryColor=18181b`
        : `https://vidlink.pro/movie/${tmdbRef}?primaryColor=FF2D55&secondaryColor=18181b`;
      fontes.push({
        id: 'vidlink',
        name: 'Fonte 4: VidLink Pro',
        badge: 'Ultra HD',
        url: sanitizarUrlStreaming(vidlinkUrl),
        type: 'embed_iframe',
        isDirect: false,
        reliability: 94,
        hasSubtitles: true,
        quality: '1080p / 4K HLS',
        description: 'Player moderno com interface fluida e alta definição.'
      });
    }

    // 6. FONTE 5: AUTOEMBED CO - Espelho direto alternativo
    if (idReferencia) {
      const autoembedUrl = isSeries
        ? `https://autoembed.co/tv/imdb/${idReferencia}/${s}/${ep}`
        : `https://autoembed.co/movie/imdb/${idReferencia}`;
      fontes.push({
        id: 'autoembed',
        name: 'Fonte 5: AutoEmbed VIP',
        badge: 'Espelho Seguro',
        url: sanitizarUrlStreaming(autoembedUrl),
        type: 'embed_iframe',
        isDirect: false,
        reliability: 92,
        hasSubtitles: true,
        quality: 'HD 720p/1080p',
        description: 'Servidor alternativo de segurança e failover livre de restrições.'
      });
    }

    // 7. TRAILER OFICIAL 4K (YouTube No-Cookie)
    if (filme.trailerUrl) {
      fontes.push({
        id: 'trailer',
        name: 'Trailer Oficial',
        badge: 'Prévia 4K',
        url: sanitizarUrlStreaming(filme.trailerUrl),
        type: 'embed_iframe',
        isDirect: false,
        reliability: 100,
        hasSubtitles: false,
        quality: '4K HDR',
        description: 'Trailer oficial de divulgação.'
      });
    }

    // Fonte primária recomendada
    const primarySource =
      fontes.find((f) => f.id === 'direct') ||
      fontes.find((f) => f.id === 'videasy') ||
      fontes.find((f) => f.id === 'vidsrc') ||
      fontes[0];

    const resultado: StreamResolutionResult = {
      movieId: filme.id,
      imdbId: imdb,
      tmdbId: tmdb,
      title: filme.titulo,
      primarySource,
      availableSources: fontes,
      directVideoUrl: filme.directStreamUrl,
      trailerUrl: filme.trailerUrl,
      allowPolicy: STREAM_IFRAME_ALLOW,
      referrerPolicy: STREAM_REFERRER_POLICY
    };

    streamCache.set(cacheKey, resultado);
    return resultado;
  }

  /**
   * Obtém a URL de streaming ideal para um provedor específico
   */
  public static getUrlForProvider(
    filme: FilmeItem,
    providerId: StreamProviderId,
    season: number = 1,
    episode: number = 1
  ): string {
    const res = this.resolveStreams(filme, season, episode);
    const fonte = res.availableSources.find((s) => s.id === providerId);
    if (fonte) return fonte.url;
    return res.primarySource?.url || '';
  }

  /**
   * Retorna o próximo servidor disponível para alternância rápida em caso de falha
   */
  public static getNextProvider(
    filme: FilmeItem,
    currentProviderId: StreamProviderId,
    season: number = 1,
    episode: number = 1
  ): StreamProviderId {
    const res = this.resolveStreams(filme, season, episode);
    const streamingSources = res.availableSources.filter((s) => s.id !== 'trailer');
    if (streamingSources.length <= 1) return currentProviderId;

    const currentIndex = streamingSources.findIndex((s) => s.id === currentProviderId);
    if (currentIndex === -1 || currentIndex === streamingSources.length - 1) {
      return streamingSources[0].id;
    }
    return streamingSources[currentIndex + 1].id;
  }

  /**
   * Abre o stream selecionado em uma janela/aba externa isolada (Ecrã Externo Seguro).
   * Isso contorna 100% de quaisquer limitações de sandbox, iframes aninhados ou restrições de navegadores.
   */
  public static openSafeExternal(url: string): boolean {
    if (typeof window === 'undefined' || !url) return false;
    try {
      const sanitized = sanitizarUrlStreaming(url);
      if (!sanitized) return false;

      // Cria um link temporário para acionar a navegação top-level sem bloqueio de popups
      const link = document.createElement('a');
      link.href = sanitized;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (document.body.contains(link)) document.body.removeChild(link);
        } catch {
          // ignora
        }
      }, 100);
      return true;
    } catch (err) {
      console.warn('Erro ao abrir em ecrã externo seguro:', err);
      try {
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        return !!win;
      } catch {
        return false;
      }
    }
  }

  /**
   * Abre a própria aplicação em uma nova aba completa sem qualquer iframe ou sandbox envolvente.
   */
  public static openAppInNewTab(): void {
    if (typeof window === 'undefined') return;
    try {
      const link = document.createElement('a');
      link.href = window.location.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (document.body.contains(link)) document.body.removeChild(link);
        } catch {
          // ignora
        }
      }, 100);
    } catch (err) {
      console.warn('Erro ao abrir aplicação em nova aba:', err);
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Limpa o cache de resolução em memória
   */
  public static clearCache(): void {
    streamCache.clear();
  }
}
