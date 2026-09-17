import { Canal } from '@/types';
import {
  CANAIS_ESPORTES,
  CANAIS_BONECOS,
  CANAIS_FILMES,
  CANAIS_NOVELAS,
  CANAIS_NOTICIAS,
  CANAIS_MUSICAS,
  CANAIS_LAZER,
  TODOS_OS_CANAIS,
  CANAIS_NOVOS_SOLICITADOS,
  CANAIS_ESPORTES_SOLICITADOS,
} from './channelsFullCatalog';
import { CANAIS_YOUTUBE } from './channelsYoutube';

export {
  CANAIS_BONECOS,
  CANAIS_ESPORTES,
  CANAIS_NOVELAS,
  CANAIS_NOTICIAS,
  CANAIS_MUSICAS,
  CANAIS_FILMES,
  CANAIS_LAZER,
  CANAIS_YOUTUBE,
  CANAIS_NOVOS_SOLICITADOS,
  CANAIS_ESPORTES_SOLICITADOS,
};

export function deduplicateCanais(list: Canal[]): Canal[] {
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const result: Canal[] = [];

  for (const item of list) {
    const id = item.id ? item.id.trim() : '';
    const url = item.url ? item.url.trim().toLowerCase() : '';

    // If ID already seen, skip
    if (id && seenIds.has(id)) continue;
    // If URL already seen, skip (prevents two channels playing the exact same signal)
    if (url && seenUrls.has(url)) continue;

    if (id) seenIds.add(id);
    if (url) seenUrls.add(url);
    result.push(item);
  }
  return result;
}

export const TODOS_OS_CANAIS_CATALOGO: Canal[] = TODOS_OS_CANAIS;
