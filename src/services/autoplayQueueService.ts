import { Canal } from '@/types';
import { CANAIS_YOUTUBE } from '@/data/channelsYoutube';
import { extractYouTubeId } from '@/components/ChannelVideosModal';
import { getChannelLogo } from '@/utils/channelLogoUtils';

export interface QueueVideoItem {
  id: string;
  title: string;
  creatorName: string;
  channelId: string;
  canal: Canal;
  url: string;
  thumbnail: string;
  streamIndex?: number;
  isSameCreator: boolean;
  reason: 'mesmo-criador' | 'recomendado-historico' | 'popular';
}

export interface WatchHistoryEntry {
  url: string;
  title: string;
  creatorName: string;
  channelId: string;
  timestamp: number;
}

const STORAGE_KEY_WATCH_HISTORY = 'worscoi_watch_history_v1';
const STORAGE_KEY_AUTOPLAY_ENABLED = 'worscoi_autoplay_enabled_v1';

// Títulos descritivos refinados para vídeos conhecidos
const KNOWN_CREATOR_VIDEOS: Record<string, { title: string; creator: string }> = {
  '0e3GPea1Tyg': { title: '$456,000 Batata Quente / Squid Game na Vida Real', creator: 'MrBeast' },
  '9bqk6ZUsKyA': { title: 'Quarto de Hotel de $1 vs $1,000,000!', creator: 'MrBeast' },
  'gHzuabZUd6c': { title: 'Passagem de Avião de $1 vs $500,000!', creator: 'MrBeast' },
  'kJu5VMN3yow': { title: 'Sobrevivi 50 Horas na Antártida', creator: 'MrBeast' },
  '6Ka3X_wlZLU': { title: 'Desafio Extremo de Sobrevivência com Amigos', creator: 'Karl Jacobs' },
  'nO2dMO3BUO4': { title: 'Esconde-Esconde Extremo no Parque de Diversões', creator: 'Karl Jacobs' },
  'LVhFuyABxBE': { title: 'Real Life Trick Shots 2 - Jogadas Incríveis', creator: 'Dude Perfect' },
  'hFZFjoX2cGg': { title: 'World Record Trick Shots - Quebrando Recordes Mundiais', creator: 'Dude Perfect' },
  'd1fMvE-f2z8': { title: 'Futebol 1v1 & Desafios de Habilidade', creator: 'The Wingrove Family' },
  '0y4ZT2aaK1k': { title: 'Street Football & Dribles Lendários na Rua', creator: 'The Wingrove Family' },
  '-5DfExCscBE': { title: 'Panna Knock Out & Freestyle Skills de Elite', creator: 'The Wingrove Family' },
  'XqSrz6MKVlk': { title: 'Melhores Momentos e Bastidores do Treino', creator: 'The Wingrove Family' },
  'x6VWj8JeyIU': { title: 'Rap do Anime - Especial Acústico e Clipes', creator: 'Música & Geek' },
  'jy0sGTbP3Qs': { title: 'O Que Acontece ao Cair em um Buraco Negro?', creator: 'Ciência & Cosmos' },
  'aFwcrt0LfjY': { title: 'A Física por Trás das Coisas Mais Estranhas', creator: 'Ciência & Cosmos' },
  'zbpK7KTLoLg': { title: 'Desafio 1x1 de Basquete na Quadra dos Sonhos', creator: 'Streetball Brasil' },
};

export class AutoplayQueueService {
  /**
   * Obtém histórico recente de visualizações do usuário
   */
  static getWatchHistory(): WatchHistoryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_WATCH_HISTORY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Salva uma visualização no histórico local
   */
  static recordWatchHistory(canal: Canal, url: string, customTitle?: string): void {
    try {
      const history = this.getWatchHistory();
      const ytId = extractYouTubeId(url);
      const known = ytId ? KNOWN_CREATOR_VIDEOS[ytId] : null;

      const title =
        customTitle ||
        known?.title ||
        `${canal.nome} • Transmissão`;

      const newEntry: WatchHistoryEntry = {
        url,
        title,
        creatorName: known?.creator || canal.nome,
        channelId: canal.id,
        timestamp: Date.now(),
      };

      // Remove duplicações recentes do mesmo URL e mantém os últimos 30
      const filtered = history.filter((h) => h.url !== url);
      const updated = [newEntry, ...filtered].slice(0, 30);
      localStorage.setItem(STORAGE_KEY_WATCH_HISTORY, JSON.stringify(updated));
    } catch {
      // Ignora erro de storage
    }
  }

  /**
   * Registra um vídeo ativo no histórico do usuário
   */
  static addToWatchHistory(canal: Canal, streamIndex: number = 0, url?: string, customTitle?: string): void {
    const streams = [canal.url, ...(canal.backupUrls || [])];
    const streamUrl = url || streams[streamIndex] || canal.url;
    this.recordWatchHistory(canal, streamUrl, customTitle);
  }

  /**
   * Limpa o histórico de visualizações
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_WATCH_HISTORY);
    } catch {
      // Ignora erro
    }
  }

  /**
   * Retorna se a reprodução contínua automática está ativa
   */
  static isAutoplayEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEY_AUTOPLAY_ENABLED);
      return val !== 'false'; // Padrão: true (ativado)
    } catch {
      return true;
    }
  }

  /**
   * Alterna a reprodução contínua automática
   */
  static setAutoplayEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY_AUTOPLAY_ENABLED, enabled ? 'true' : 'false');
    } catch {
      // Ignora erro
    }
  }

  /**
   * Constrói uma fila inteligente de "Próximos Vídeos" baseada no criador e histórico
   */
  static buildQueue(
    currentCanal: Canal,
    currentStreamIndex: number = 0,
    allChannels: Canal[] = []
  ): QueueVideoItem[] {
    return this.buildNextQueue(currentCanal, currentStreamIndex, allChannels);
  }

  /**
   * Constrói uma fila inteligente de "Próximos Vídeos" baseada no criador e histórico
   */
  static buildNextQueue(
    currentCanal: Canal,
    currentStreamIndex: number = 0,
    allChannels: Canal[] = []
  ): QueueVideoItem[] {
    const queue: QueueVideoItem[] = [];
    const seenUrls = new Set<string>();

    const streams = [currentCanal.url, ...(currentCanal.backupUrls || [])];
    const currentUrl = streams[currentStreamIndex] || currentCanal.url;
    seenUrls.add(currentUrl.trim().toLowerCase());

    // 1. Prioridade Máxima: Vídeos restantes do MESMO criador / canal ativo
    streams.forEach((url, idx) => {
      const normalized = url.trim().toLowerCase();
      if (idx !== currentStreamIndex && !seenUrls.has(normalized)) {
        seenUrls.add(normalized);
        const ytId = extractYouTubeId(url);
        const known = ytId ? KNOWN_CREATOR_VIDEOS[ytId] : null;

        queue.push({
          id: `${currentCanal.id}-stream-${idx}`,
          title: known?.title || `${currentCanal.nome} • Episódio ${idx + 1}`,
          creatorName: currentCanal.nome,
          channelId: currentCanal.id,
          canal: currentCanal,
          url,
          streamIndex: idx,
          thumbnail: ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : getChannelLogo(currentCanal),
          isSameCreator: true,
          reason: 'mesmo-criador',
        });
      }
    });

    // 2. Procura canais semelhantes do mesmo grupo ou criador em CANAIS_YOUTUBE
    const currentNameLower = currentCanal.nome.toLowerCase();
    const isYt =
      currentCanal.categoria === 'YouTube' ||
      currentCanal.rede === 'YouTube' ||
      currentUrl.includes('youtube.com') ||
      currentUrl.includes('youtu.be');

    if (isYt) {
      // Procura outros canais do mesmo criador (ex: MrBeast Gaming se estiver assistindo MrBeast)
      const creatorPrefix = currentNameLower.split(' ')[0] || '';

      const sameCreatorChannels = CANAIS_YOUTUBE.filter((c) => {
        if (c.id === currentCanal.id) return false;
        const cLower = c.nome.toLowerCase();
        return (
          (creatorPrefix.length > 2 && cLower.includes(creatorPrefix)) ||
          c.handle === currentCanal.handle
        );
      });

      sameCreatorChannels.forEach((creatorChannel) => {
        const creatorStreams = [creatorChannel.url, ...(creatorChannel.backupUrls || [])];
        creatorStreams.forEach((url, idx) => {
          const normalized = url.trim().toLowerCase();
          if (!seenUrls.has(normalized)) {
            seenUrls.add(normalized);
            const ytId = extractYouTubeId(url);
            const known = ytId ? KNOWN_CREATOR_VIDEOS[ytId] : null;

            queue.push({
              id: `${creatorChannel.id}-stream-${idx}`,
              title: known?.title || `${creatorChannel.nome} • Destaque`,
              creatorName: creatorChannel.nome,
              channelId: creatorChannel.id,
              canal: creatorChannel,
              url,
              streamIndex: idx,
              thumbnail: ytId
                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                : getChannelLogo(creatorChannel),
              isSameCreator: true,
              reason: 'mesmo-criador',
            });
          }
        });
      });
    }

    // 3. Recomendações baseadas no histórico de visualização do usuário
    const history = this.getWatchHistory();
    const historyCreators = new Set(history.map((h) => h.creatorName.toLowerCase()));

    // Encontra canais relacionados nos canais do sistema ou do YouTube
    const candidateChannels = [...CANAIS_YOUTUBE, ...allChannels];

    candidateChannels.forEach((candidate) => {
      if (candidate.id === currentCanal.id) return;
      if (candidate.categoria !== currentCanal.categoria && candidate.categoria !== 'YouTube') return;

      const isFavoriteCreator = historyCreators.has(candidate.nome.toLowerCase());
      const cStreams = [candidate.url, ...(candidate.backupUrls || [])];

      cStreams.slice(0, 2).forEach((url, idx) => {
        const normalized = url.trim().toLowerCase();
        if (!seenUrls.has(normalized) && queue.length < 12) {
          seenUrls.add(normalized);
          const ytId = extractYouTubeId(url);
          const known = ytId ? KNOWN_CREATOR_VIDEOS[ytId] : null;

          queue.push({
            id: `${candidate.id}-rec-${idx}`,
            title: known?.title || candidate.nome,
            creatorName: candidate.nome,
            channelId: candidate.id,
            canal: candidate,
            url,
            streamIndex: idx,
            thumbnail: ytId
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              : getChannelLogo(candidate),
            isSameCreator: false,
            reason: isFavoriteCreator ? 'recomendado-historico' : 'popular',
          });
        }
      });
    });

    return queue;
  }

  /**
   * Consulta o próximo vídeo a ser reproduzido automaticamente sem removê-lo da fila
   */
  static peekNextVideo(
    currentCanal: Canal,
    currentStreamIndex: number = 0,
    allChannels: Canal[] = []
  ): QueueVideoItem | null {
    return this.getNextVideo(currentCanal, currentStreamIndex, allChannels);
  }

  /**
   * Retorna o próximo vídeo a ser reproduzido automaticamente
   */
  static getNextVideo(
    currentCanal: Canal,
    currentStreamIndex: number = 0,
    allChannels: Canal[] = []
  ): QueueVideoItem | null {
    const queue = this.buildNextQueue(currentCanal, currentStreamIndex, allChannels);
    return queue.length > 0 ? queue[0] : null;
  }
}

export const autoplayQueueService = AutoplayQueueService;
export type QueueItem = QueueVideoItem;
