import { Canal } from '@/types';

export const LOCAL_STORAGE_RECENTS_KEY = 'worscoi_recent_channels';
export const MAX_RECENT_CHANNELS = 15;

export interface CanalRecente extends Canal {
  viewedAt: number;
}

/**
 * Obtém a lista de canais recentes salvos no localStorage.
 */
export function getStoredRecentChannels(): CanalRecente[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CanalRecente =>
        Boolean(item && typeof item === 'object' && (item.id || item.url) && item.nome)
    );
  } catch (error) {
    console.warn('Erro ao carregar canais recentes do localStorage:', error);
    return [];
  }
}

/**
 * Adiciona ou move um canal para o topo da lista de recentes no localStorage.
 */
export function addChannelToRecents(canal: Canal): CanalRecente[] {
  if (typeof window === 'undefined' || !canal || (!canal.id && !canal.url)) {
    return [];
  }

  try {
    const current = getStoredRecentChannels();

    // Filtra ocorrência anterior se já existia
    const filtered = current.filter((item) => {
      if (canal.id && item.id) {
        return item.id !== canal.id;
      }
      return item.url !== canal.url;
    });

    const novoRecente: CanalRecente = {
      ...canal,
      viewedAt: Date.now(),
    };

    const updated = [novoRecente, ...filtered].slice(0, MAX_RECENT_CHANNELS);
    localStorage.setItem(LOCAL_STORAGE_RECENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Erro ao salvar canal recente no localStorage:', error);
    return [];
  }
}

/**
 * Remove um canal específico da lista de recentes.
 */
export function removeChannelFromRecents(channelIdentifier: string): CanalRecente[] {
  if (typeof window === 'undefined' || !channelIdentifier) return [];

  try {
    const current = getStoredRecentChannels();
    const updated = current.filter(
      (item) => item.id !== channelIdentifier && item.url !== channelIdentifier
    );
    localStorage.setItem(LOCAL_STORAGE_RECENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Erro ao remover canal recente do localStorage:', error);
    return [];
  }
}

/**
 * Limpa todos os canais recentes do localStorage.
 */
export function clearStoredRecentChannels(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_RECENTS_KEY);
  } catch (error) {
    console.warn('Erro ao limpar canais recentes do localStorage:', error);
  }
}

/**
 * Formata um timestamp de visualização em texto amigável em português.
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Recentemente';
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes === 1) return 'Há 1 minuto';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return 'Há 1 hora';
  if (diffHours < 24) return `Há ${diffHours} horas`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  return `Há ${diffDays} dias`;
}
