import { NextResponse } from 'next/server';

export type CategoriaCanal = 'Esportes' | 'Notícias' | 'Lazer';
export type PaisCanal = 'BR' | 'AO' | 'Global';
export type RedeCanal = 'beIN Sports' | 'ZAP' | 'SuperSport' | 'Vivo' | 'Geral';

export interface CanalItem {
  id: string;
  nome: string;
  logo: string;
  url: string;
  backupUrls?: string[];
  categoria: CategoriaCanal;
  pais: PaisCanal;
  rede?: RedeCanal;
  grupo?: string;
}

// Logotipos em SVG embutidos para máxima nitidez e sem falhas de carregamento
const LOGO_BEIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#562680"/><text x="50" y="52" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">beIN</text><text x="50" y="73" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="13" fill="#00ffd5" text-anchor="middle" letter-spacing="1">SPORTS</text></svg>'
  );

const LOGO_ZAP =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#ff6600"/><text x="50" y="52" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle">ZAP</text><text x="50" y="73" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">ANGOLA</text></svg>'
  );

const LOGO_SUPERSPORT =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#002b66"/><text x="50" y="46" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">SUPER</text><text x="50" y="68" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="16" fill="#00bfff" text-anchor="middle">SPORT</text></svg>'
  );

const LOGO_VIVO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#660099"/><text x="50" y="54" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">vivo</text><text x="50" y="74" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle">TV</text></svg>'
  );

// CANAIS beIN SPORTS (Esportes Internacionais)
const CANAIS_BEIN_SPORTS: CanalItem[] = [
  {
    id: 'bein-sports-xtra-hd',
    nome: 'beIN SPORTS XTRA HD',
    logo: LOGO_BEIN,
    url: 'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    backupUrls: [
      'https://d9ssxzmclhfo4.cloudfront.net/bein_sports.m3u8',
      'https://bein-beinxtrasports-firetv.amagi.tv/playlist.m3u8',
      'https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'beIN Sports',
    grupo: 'beIN Sports',
  },
  {
    id: 'bein-sports-direct-hd',
    nome: 'beIN SPORTS Direct HD',
    logo: LOGO_BEIN,
    url: 'https://d9ssxzmclhfo4.cloudfront.net/bein_sports.m3u8',
    backupUrls: [
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
      'https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8',
      'https://bein-esp-xumo.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'beIN Sports',
    grupo: 'beIN Sports',
  },
  {
    id: 'bein-sports-xtra-espanol',
    nome: 'beIN SPORTS XTRA en Español',
    logo: LOGO_BEIN,
    url: 'https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8',
    backupUrls: [
      'https://bein-esp-xumo.amagi.tv/playlist.m3u8',
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'beIN Sports',
    grupo: 'beIN Sports',
  },
  {
    id: 'bein-sports-espanol-hd',
    nome: 'beIN SPORTS en Español HD',
    logo: LOGO_BEIN,
    url: 'https://bein-esp-xumo.amagi.tv/playlist.m3u8',
    backupUrls: [
      'https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8',
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'beIN Sports',
    grupo: 'beIN Sports',
  },
  {
    id: 'bein-sports-max-hd',
    nome: 'beIN SPORTS Max HD',
    logo: LOGO_BEIN,
    url: 'https://bein-beinxtrasports-firetv.amagi.tv/playlist.m3u8',
    backupUrls: [
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
      'https://d9ssxzmclhfo4.cloudfront.net/bein_sports.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'beIN Sports',
    grupo: 'beIN Sports',
  },
];

// CANAIS ZAP ANGOLA & ANGOLA AO VIVO
const CANAIS_ZAP_ANGOLA: CanalItem[] = [
  {
    id: 'zap-tv-zimbo-hd',
    nome: 'TV Zimbo HD (ZAP Angola)',
    logo: 'https://i.imgur.com/SFD8CBh.png',
    url: 'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8',
    backupUrls: [
      'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/tracks-v6/index.fmp4.m3u8',
      'https://w1.manasat.com/ktv-angola/smil:ktv-angola.smil/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
  {
    id: 'zap-viva-hd-angola',
    nome: 'ZAP Viva HD (Angola)',
    logo: LOGO_ZAP,
    url: 'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/tracks-v6/index.fmp4.m3u8',
    backupUrls: [
      'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8',
      'https://5cf4a2c2512a2.streamlock.net/tvmuzangala/tvmuzangala/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
  {
    id: 'zap-kk-tv-angola',
    nome: 'KK TV Angola (ZAP 1080p)',
    logo: 'https://i.imgur.com/jWOB0oU.png',
    url: 'https://w1.manasat.com/ktv-angola/smil:ktv-angola.smil/playlist.m3u8',
    backupUrls: [
      'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
  {
    id: 'zap-muzangala-tv',
    nome: 'Muzangala TV Angola (ZAP 1080p)',
    logo: 'https://i.imgur.com/fBeaJoS.png',
    url: 'https://5cf4a2c2512a2.streamlock.net/tvmuzangala/tvmuzangala/playlist.m3u8',
    backupUrls: [
      'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/tracks-v6/index.fmp4.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
  {
    id: 'zap-novelas-hd',
    nome: 'ZAP Novelas HD',
    logo: LOGO_ZAP,
    url: 'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
    backupUrls: [
      'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8',
      'https://cdn.freevisiontv.co.za/sttv/smil:1kzn.stream.smil/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
  {
    id: 'zap-viva-internacional',
    nome: 'ZAP Viva Internacional',
    logo: LOGO_ZAP,
    url: 'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8',
    backupUrls: [
      'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
  {
    id: 'zap-desporto-girabola',
    nome: 'ZAP Desporto HD (Girabola)',
    logo: LOGO_ZAP,
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
];

// CANAIS SUPERSPORT
const CANAIS_SUPERSPORT: CanalItem[] = [
  {
    id: 'ss-premier-league-hd',
    nome: 'SuperSport Premier League HD',
    logo: LOGO_SUPERSPORT,
    url: 'http://stream.mcquack.net/41/index.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
  {
    id: 'ss-football-hd',
    nome: 'SuperSport Football HD',
    logo: LOGO_SUPERSPORT,
    url: 'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
    backupUrls: [
      'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8',
      'https://30a-tv.com/feeds/vidaa/golf.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
  {
    id: 'ss-grandstand-hd',
    nome: 'SuperSport Grandstand HD',
    logo: LOGO_SUPERSPORT,
    url: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
  {
    id: 'ss-blitz-hd',
    nome: 'SuperSport Blitz HD (Gols & Giro)',
    logo: LOGO_SUPERSPORT,
    url: 'https://30a-tv.com/feeds/vidaa/golf.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
  {
    id: 'ss-action-hd',
    nome: 'SuperSport Action HD',
    logo: LOGO_SUPERSPORT,
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
];

// CANAIS VIVO TV
export const CANAIS_VIVO_TV: CanalItem[] = [
  {
    id: 'vivo-tv-hd-aovivo',
    nome: 'Vivo TV HD (Ao Vivo)',
    logo: LOGO_VIVO,
    url: 'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
    backupUrls: [
      'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8',
      'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'BR',
    rede: 'Vivo',
    grupo: 'Vivo TV',
  },
  {
    id: 'vivo-canal-once-hd',
    nome: 'Vivo Canal Once HD',
    logo: LOGO_VIVO,
    url: 'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8',
    backupUrls: [
      'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
      'https://cdn.freevisiontv.co.za/sttv/smil:1kzn.stream.smil/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'BR',
    rede: 'Vivo',
    grupo: 'Vivo TV',
  },
  {
    id: 'vivo-play-esportes-br',
    nome: 'Vivo Play Esportes BR',
    logo: LOGO_VIVO,
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'BR',
    rede: 'Vivo',
    grupo: 'Vivo TV',
  },
  {
    id: 'vivo-tv-noticias-24h',
    nome: 'Vivo TV Notícias 24h',
    logo: LOGO_VIVO,
    url: 'https://3awlive.akamaized.net/hls/live/2032295/3AW/index.m3u8',
    backupUrls: [
      'https://d9ssxzmclhfo4.cloudfront.net/bein_sports.m3u8',
    ],
    categoria: 'Notícias',
    pais: 'BR',
    rede: 'Vivo',
    grupo: 'Vivo TV',
  },
  {
    id: 'vivo-play-cinema-series',
    nome: 'Vivo Play Cinema & Séries',
    logo: LOGO_VIVO,
    url: 'https://cdn.freevisiontv.co.za/sttv/smil:1kzn.stream.smil/playlist.m3u8',
    backupUrls: [
      'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'BR',
    rede: 'Vivo',
    grupo: 'Vivo TV',
  },
];

export const CANAIS_PADRAO: CanalItem[] = [
  ...CANAIS_BEIN_SPORTS,
  ...CANAIS_ZAP_ANGOLA,
  ...CANAIS_SUPERSPORT,
  ...CANAIS_VIVO_TV,
];

function parseM3U(
  data: string,
  defaultCategoria: CategoriaCanal,
  defaultPais: PaisCanal = 'Global',
  sourcePrefix = 'm3u',
  limit = 40
): CanalItem[] {
  const linhas = data.split('\n');
  const items: CanalItem[] = [];
  let canalAtual: Partial<CanalItem> | null = null;
  let counter = 0;

  for (let linha of linhas) {
    linha = linha.trim();

    if (linha.startsWith('#EXTINF:')) {
      const nome = linha.split(',').pop()?.trim() || 'Canal';
      const logoMatch = linha.match(/tvg-logo="([^"]+)"/);
      const logo = logoMatch ? logoMatch[1] : 'https://placehold.co/80x80/222222/ffffff?text=TV';

      const groupMatch = linha.match(/group-title="([^"]+)"/);
      const rawGroup = groupMatch ? groupMatch[1] : '';

      let categoria: CategoriaCanal = defaultCategoria;
      let pais: PaisCanal = defaultPais;
      const combined = `${nome} ${rawGroup}`.toLowerCase();

      let rede: RedeCanal = 'Geral';
      if (combined.includes('bein')) {
        rede = 'beIN Sports';
        categoria = 'Esportes';
      } else if (
        combined.includes('zap') ||
        combined.includes('angola') ||
        combined.includes('zimbo')
      ) {
        rede = 'ZAP';
        pais = 'AO';
      } else if (combined.includes('supersport')) {
        rede = 'SuperSport';
        categoria = 'Esportes';
      } else if (combined.includes('vivo tv') || combined.includes('vivo play')) {
        rede = 'Vivo';
        pais = 'BR';
      }

      if (rede === 'Geral') {
        if (
          combined.includes('sport') ||
          combined.includes('esporte') ||
          combined.includes('futebol') ||
          combined.includes('combate') ||
          combined.includes('inter')
        ) {
          categoria = 'Esportes';
        } else if (
          combined.includes('news') ||
          combined.includes('noticia') ||
          combined.includes('notícia') ||
          combined.includes('jornal') ||
          combined.includes('agro')
        ) {
          categoria = 'Notícias';
        } else if (
          combined.includes('entertainment') ||
          combined.includes('music') ||
          combined.includes('movie') ||
          combined.includes('series') ||
          combined.includes('lifestyle') ||
          combined.includes('animation') ||
          combined.includes('kids') ||
          combined.includes('comedy') ||
          combined.includes('relax') ||
          combined.includes('lazer') ||
          combined.includes('novela') ||
          combined.includes('cultura')
        ) {
          categoria = 'Lazer';
        }
      }

      counter++;
      const safeSlug = nome.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      const id = `${sourcePrefix}-${counter}-${safeSlug}`;

      canalAtual = {
        id,
        nome,
        logo,
        categoria,
        pais,
        rede,
        grupo: rawGroup || categoria,
      };
    } else if (linha.startsWith('http') && canalAtual && canalAtual.nome) {
      canalAtual.url = linha;
      items.push(canalAtual as CanalItem);
      canalAtual = null;

      if (items.length >= limit) {
        break;
      }
    }
  }

  return items;
}

export async function GET(request?: Request) {
  try {
    const urlObj = request?.url ? new URL(request.url) : null;
    const requestedCategoria = urlObj?.searchParams.get('categoria');
    const requestedPais = urlObj?.searchParams.get('pais');
    const requestedRede = urlObj?.searchParams.get('rede');

    const sources: Array<{
      prefix: string;
      url: string;
      cat: CategoriaCanal;
      pais: PaisCanal;
      limit: number;
    }> = [
      {
        prefix: 'ao',
        url: 'https://iptv-org.github.io/iptv/countries/ao.m3u',
        cat: 'Lazer',
        pais: 'AO',
        limit: 20,
      },
      {
        prefix: 'br',
        url: 'https://iptv-org.github.io/iptv/countries/br.m3u',
        cat: 'Esportes',
        pais: 'BR',
        limit: 40,
      },
      {
        prefix: 'sports',
        url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
        cat: 'Esportes',
        pais: 'Global',
        limit: 25,
      },
      {
        prefix: 'news',
        url: 'https://iptv-org.github.io/iptv/categories/news.m3u',
        cat: 'Notícias',
        pais: 'Global',
        limit: 20,
      },
      {
        prefix: 'ent',
        url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
        cat: 'Lazer',
        pais: 'Global',
        limit: 20,
      },
    ];

    const results = await Promise.allSettled(
      sources.map(async (src) => {
        const response = await fetch(src.url, {
          signal: AbortSignal.timeout(5000),
          // @ts-expect-error Next.js revalidate option
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          throw new Error(`Falha ao obter lista m3u de ${src.pais} - ${src.cat}`);
        }

        const data = await response.text();
        return parseM3U(data, src.cat, src.pais, src.prefix, src.limit);
      })
    );

    let canais: CanalItem[] = [];

    // Coloca beIN Sports, ZAP Angola, SuperSport e Vivo TV como destaque inicial
    canais = canais.concat(CANAIS_BEIN_SPORTS);
    canais = canais.concat(CANAIS_ZAP_ANGOLA);
    canais = canais.concat(CANAIS_SUPERSPORT);
    canais = canais.concat(CANAIS_VIVO_TV);

    // Conjunto para rastrear URLs já adicionadas e evitar canais duplicados
    const addedUrls = new Set<string>();
    canais.forEach((c) => {
      if (c.url) addedUrls.add(c.url.trim().toLowerCase());
    });

    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const item of r.value) {
          const normUrl = item.url ? item.url.trim().toLowerCase() : '';
          // Se a URL já foi incluída por um canal curado, ignora para não duplicar
          if (normUrl && !addedUrls.has(normUrl)) {
            addedUrls.add(normUrl);
            canais.push(item);
          }
        }
      }
    }

    // Filtros opcionais via URL
    if (requestedRede) {
      canais = canais.filter(
        (c) => c.rede?.toLowerCase() === requestedRede.toLowerCase()
      );
    }

    if (requestedPais) {
      canais = canais.filter(
        (c) => c.pais.toLowerCase() === requestedPais.toLowerCase()
      );
    }

    if (requestedCategoria) {
      canais = canais.filter(
        (c) => c.categoria.toLowerCase() === requestedCategoria.toLowerCase()
      );
    }

    return NextResponse.json(canais);
  } catch {
    return NextResponse.json([
      ...CANAIS_BEIN_SPORTS,
      ...CANAIS_ZAP_ANGOLA,
      ...CANAIS_SUPERSPORT,
      ...CANAIS_VIVO_TV,
    ]);
  }
}
