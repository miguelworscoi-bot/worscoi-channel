import ReactPlayer from 'react-player';
import HlsVideoElement from 'hls-video-element/react';

let isPlayerConfigured = false;

/**
 * Registra o reprodutor universal HLS (hls-video-element/HLS.js) no ReactPlayer v3.
 * Isso garante que todas as streams HLS, URLs do proxy e transmissões ao vivo
 * sejam processadas diretamente pelo motor HLS.js através de MediaSource Extensions,
 * evitando que o player caia no fallback de elemento nativo <video> que causa o erro
 * "Failed to load because no supported source was found".
 */
export function initPlayerCustomPlugins(): void {
  if (isPlayerConfigured) return;
  isPlayerConfigured = true;

  try {
    const customHlsPlayer = {
      key: 'hls-universal',
      name: 'hls.js-universal',
      canPlay: (src: string | string[]) => {
        if (!src) return false;
        if (Array.isArray(src)) {
          return src.some((s) => typeof s === 'string' && customHlsPlayer.canPlay(s));
        }
        if (typeof src !== 'string') return false;

        const trimmed = src.trim();
        if (!trimmed) return false;

        // Não intercepta provedores de terceiros suportados nativamente
        if (
          trimmed.includes('youtube.com') ||
          trimmed.includes('youtu.be') ||
          trimmed.includes('vimeo.com') ||
          trimmed.includes('twitch.tv') ||
          trimmed.includes('tiktok.com') ||
          trimmed.includes('wistia.com') ||
          trimmed.includes('spotify.com')
        ) {
          return false;
        }

        // Não intercepta arquivos estáticos de vídeo puro (MP4/WebM/OGG) ou áudio
        if (/\.(mp4|webm|ogv|mov|m4v|mp3|wav|ogg|aac)($|\?)/i.test(trimmed)) {
          return false;
        }

        // Intercepta qualquer URL HLS (.m3u8), proxy de stream ou fluxo de live streaming
        if (
          trimmed.includes('.m3u8') ||
          trimmed.includes('/api/proxy') ||
          trimmed.startsWith('http://') ||
          trimmed.startsWith('https://')
        ) {
          return true;
        }

        return false;
      },
      canEnablePIP: () => true,
      player: HlsVideoElement,
    };

    ReactPlayer.addCustomPlayer(customHlsPlayer);
  } catch (err) {
    console.warn('Falha ao registrar reprodutor universal HLS:', err);
  }
}

// Inicialização imediata ao importar o módulo
initPlayerCustomPlugins();
