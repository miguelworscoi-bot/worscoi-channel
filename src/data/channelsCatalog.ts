import { Canal } from '@/types';
import { CANAIS_BONECOS } from './channelsBonecos';
import { CANAIS_ESPORTES } from './channelsEsportes';
import { CANAIS_NOVELAS } from './channelsNovelas';
import { CANAIS_NOTICIAS } from './channelsNoticias';
import { CANAIS_MUSICAS } from './channelsMusicas';
import { CANAIS_FILMES } from './channelsFilmes';
import { CANAIS_YOUTUBE } from './channelsYoutube';

export {
  CANAIS_BONECOS,
  CANAIS_ESPORTES,
  CANAIS_NOVELAS,
  CANAIS_NOTICIAS,
  CANAIS_MUSICAS,
  CANAIS_FILMES,
  CANAIS_YOUTUBE,
};

export function deduplicateCanais(list: Canal[]): Canal[] {
  const seenIds = new Set<string>();
  const result: Canal[] = [];
  for (const item of list) {
    const id = item.id ? item.id.trim() : (item.url ? item.url.trim().toLowerCase() : '');
    if (id && seenIds.has(id)) continue;
    if (id) seenIds.add(id);
    result.push(item);
  }
  return result;
}

export const TODOS_OS_CANAIS_CATALOGO: Canal[] = deduplicateCanais([
  ...CANAIS_ESPORTES,
  ...CANAIS_BONECOS,
  ...CANAIS_YOUTUBE,
  ...CANAIS_FILMES,
  ...CANAIS_NOVELAS,
  ...CANAIS_NOTICIAS,
  ...CANAIS_MUSICAS,
]);
