import { NextResponse } from 'next/server';
import { TODOS_OS_CANAIS_CATALOGO } from '@/data/channelsCatalog';

export type CategoriaCanal =
  | 'Esportes'
  | 'Notícias'
  | 'Lazer'
  | 'Bonecos'
  | 'Novelas'
  | 'Músicas'
  | 'Filmes';
export type PaisCanal =
  | 'BR'
  | 'AO'
  | 'PT'
  | 'ES'
  | 'US'
  | 'FR'
  | 'DE'
  | 'JP'
  | 'NL'
  | 'UK'
  | 'Global';
export type RedeCanal =
  | 'TNT Sports'
  | 'beIN Sports'
  | 'ZAP'
  | 'SuperSport'
  | 'Vivo'
  | 'ESPN'
  | 'DAZN'
  | 'Sport TV'
  | 'Sky Sports'
  | 'Movistar'
  | 'Ziggo'
  | 'NBA TV'
  | 'Fox Sports'
  | 'Disney'
  | 'Cartoon'
  | 'Anime'
  | 'Telecine'
  | 'HBO'
  | 'MTV'
  | 'Stingray'
  | 'Trace'
  | 'Geral'
  | string;


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
  competicoes?: string[];
}

// Logotipos em SVG embutidos para máxima nitidez e sem falhas de carregamento
const LOGO_TNT_SPORTS =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#120024"/><circle cx="50" cy="50" r="38" fill="#e50914" opacity="0.15"/><text x="50" y="46" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="20" fill="#ffd100" text-anchor="middle">TNT</text><text x="50" y="70" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="1">SPORTS</text></svg>'
  );

const LOGO_CHAMPIONS =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#001438"/><polygon points="50,15 54,28 67,28 56,36 60,49 50,41 40,49 44,36 33,28 46,28" fill="#ffffff"/><text x="50" y="68" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="11" fill="#00e5ff" text-anchor="middle" letter-spacing="0.5">CHAMPIONS</text><text x="50" y="82" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1">LEAGUE</text></svg>'
  );

const LOGO_LIBERTADORES =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#0b1329"/><path d="M40 28 L60 28 L56 46 C56 52 44 52 44 46 Z" fill="#ffd700"/><rect x="47" y="52" width="6" height="10" fill="#ffd700"/><rect x="42" y="62" width="16" height="4" rx="2" fill="#ffd700"/><text x="50" y="78" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="8.5" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">LIBERTADORES</text><text x="50" y="90" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="7" fill="#ffd700" text-anchor="middle" letter-spacing="1">CONMEBOL</text></svg>'
  );

const LOGO_LALIGA =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#ff0046"/><text x="50" y="52" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">LaLiga</text><text x="50" y="74" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1">ESPAÑA</text></svg>'
  );

const LOGO_NBA =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#002b66"/><path d="M50 14 L80 14 C86 14 90 18 90 24 L90 76 C90 82 86 86 80 86 L50 86 Z" fill="#d61f26"/><text x="50" y="56" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">NBA</text><text x="50" y="76" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="10" fill="#ffd100" text-anchor="middle" letter-spacing="1">LIVE HD</text></svg>'
  );

const LOGO_MLS =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#0c1831"/><polygon points="50,15 82,24 82,58 50,85 18,58 18,24" fill="#002447" stroke="#00c853" stroke-width="4"/><text x="50" y="50" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle">MLS</text><text x="50" y="68" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="9" fill="#00e676" text-anchor="middle" letter-spacing="1">SOCCER</text></svg>'
  );

const LOGO_ESPN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#cc0000"/><text x="50" y="58" font-family="system-ui,-apple-system,sans-serif" font-style="italic" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">ESPN</text><text x="50" y="78" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">SPORTS</text></svg>'
  );

const LOGO_CBS_GOLAZO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#002855"/><text x="50" y="44" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle">CBS SPORTS</text><text x="50" y="70" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="16" fill="#00ff88" text-anchor="middle" letter-spacing="1">GOLAZO</text></svg>'
  );

const LOGO_REALMADRID =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#1c0038"/><circle cx="50" cy="46" r="28" fill="none" stroke="#ffd700" stroke-width="3"/><text x="50" y="52" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">RMTV</text><text x="50" y="74" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="10" fill="#00d2ff" text-anchor="middle" letter-spacing="1">HD LIVE</text></svg>'
  );

const LOGO_FOX_SPORTS =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#002244"/><text x="50" y="50" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">FOX</text><text x="50" y="72" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="12" fill="#ffd100" text-anchor="middle" letter-spacing="1">SPORTS</text></svg>'
  );

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

const LOGO_REDBULL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#0c1831"/><text x="50" y="44" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="14" fill="#eb144c" text-anchor="middle" letter-spacing="1">RED BULL</text><text x="50" y="70" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">TV</text></svg>'
  );

const LOGO_ASPOR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#008037"/><text x="50" y="46" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">A</text><text x="50" y="72" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="15" fill="#ffffff" text-anchor="middle" letter-spacing="1">SPOR</text></svg>'
  );

const LOGO_ACC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#013ca6"/><text x="50" y="48" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">ACC</text><text x="50" y="70" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="12" fill="#ffd100" text-anchor="middle">SPORTS</text></svg>'
  );

const LOGO_GOLF =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#004d25"/><text x="50" y="48" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle">GOLF</text><text x="50" y="70" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="12" fill="#80e0a7" text-anchor="middle">TOUR</text></svg>'
  );

const LOGO_VIVO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#660099"/><text x="50" y="54" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">vivo</text><text x="50" y="74" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle">TV</text></svg>'
  );

// CANAIS TNT SPORTS (Champions League, Paulistão & NBA)
export const CANAIS_TNT_SPORTS: CanalItem[] = [
  {
    id: 'tnt-sports-brasil-hd',
    nome: 'TNT Sports Brasil HD (Champions League & NBA)',
    logo: LOGO_TNT_SPORTS,
    url: 'http://45.162.64.114/SPACE/index.m3u8',
    backupUrls: [
      'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8',
      'http://45.162.64.114/BAND_SPORTS/index.m3u8',
      'https://cdn1.ayitistream.com/NBATV/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'BR',
    rede: 'TNT Sports',
    grupo: 'TNT Sports',
    competicoes: ['Champions League', 'NBA', 'Paulistão'],
  },
  {
    id: 'space-tnt-sports-feed-hd',
    nome: 'Space HD (TNT Sports Feed 2 - Champions & NBA)',
    logo: LOGO_TNT_SPORTS,
    url: 'http://45.162.64.114/SPACE/index.m3u8',
    backupUrls: [
      'http://45.162.64.114/BAND_SPORTS/index.m3u8',
      'https://cdn1.ayitistream.com/NBATV/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'BR',
    rede: 'TNT Sports',
    grupo: 'TNT Sports',
    competicoes: ['Champions League', 'NBA'],
  },
];

// CANAIS CHAMPIONS LEAGUE (UEFA Champions League)
export const CANAIS_CHAMPIONS_LEAGUE: CanalItem[] = [
  {
    id: 'uefa-champions-league-live-hd',
    nome: 'UEFA Champions League Live HD',
    logo: LOGO_CHAMPIONS,
    url: 'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8',
    backupUrls: [
      'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
      'http://45.162.64.114/SPACE/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'Champions League',
    competicoes: ['Champions League'],
  },
  {
    id: 'cbs-sports-golazo-champions',
    nome: 'CBS Sports Golazo HD (UEFA Champions League & MLS)',
    logo: LOGO_CBS_GOLAZO,
    url: 'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8',
    backupUrls: [
      'https://jmp2.uk/plu-63a0e33a45264d000850ed7e.m3u8',
      'http://45.162.64.114/SPACE/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'Champions League',
    competicoes: ['Champions League', 'MLS', 'Serie A'],
  },
  {
    id: 'rmtv-espanol-champions',
    nome: 'Real Madrid TV HD (Champions League & LaLiga)',
    logo: LOGO_REALMADRID,
    url: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
    backupUrls: [
      'https://rmtv.akamaized.net/hls/live/2043154/rmtv-en-web/master.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'Champions League',
    competicoes: ['Champions League', 'LaLiga'],
  },
  {
    id: 'rmtv-english-champions',
    nome: 'Real Madrid TV HD English (Champions League Live)',
    logo: LOGO_REALMADRID,
    url: 'https://rmtv.akamaized.net/hls/live/2043154/rmtv-en-web/master.m3u8',
    backupUrls: [
      'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'Champions League',
    competicoes: ['Champions League', 'LaLiga'],
  },
];

// CANAIS LIBERTADORES (CONMEBOL Libertadores & Sul-Americana)
export const CANAIS_LIBERTADORES: CanalItem[] = [
  {
    id: 'espn-brasil-libertadores-hd',
    nome: 'ESPN Brasil HD (Libertadores, LaLiga & NBA)',
    logo: LOGO_ESPN,
    url: 'http://181.78.197.59:8000/play/a07z/index.m3u8',
    backupUrls: [
      'http://45.162.64.114/ESPN_4/index.m3u8',
      'http://181.78.197.59:8000/play/a07n/index.m3u8',
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'BR',
    rede: 'ESPN',
    grupo: 'Libertadores',
    competicoes: ['Libertadores', 'LaLiga', 'NBA'],
  },
  {
    id: 'bein-sports-espanol-libertadores',
    nome: 'beIN SPORTS en Español HD (Libertadores & Sudamericana)',
    logo: LOGO_LIBERTADORES,
    url: 'https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8',
    backupUrls: [
      'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
      'https://d9ssxzmclhfo4.cloudfront.net/bein_sports.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'beIN Sports',
    grupo: 'Libertadores',
    competicoes: ['Libertadores', 'Sudamericana'],
  },
  {
    id: 'bein-sports-xtra-libertadores',
    nome: 'beIN SPORTS XTRA HD (Copa Libertadores & Sul-Americana)',
    logo: LOGO_BEIN,
    url: 'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    backupUrls: [
      'https://d9ssxzmclhfo4.cloudfront.net/bein_sports.m3u8',
      'https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'beIN Sports',
    grupo: 'Libertadores',
    competicoes: ['Libertadores', 'Sudamericana'],
  },
];

// CANAIS LALIGA (Campeonato Espanhol LaLiga)
export const CANAIS_LALIGA: CanalItem[] = [
  {
    id: 'laliga-rmtv-oficial',
    nome: 'LaLiga Oficial RMTV HD (Jogos & Análises LaLiga)',
    logo: LOGO_LALIGA,
    url: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
    backupUrls: [
      'https://rmtv.akamaized.net/hls/live/2043154/rmtv-en-web/master.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'LaLiga',
    competicoes: ['LaLiga', 'Champions League'],
  },
  {
    id: 'espn-deportes-laliga-hd',
    nome: 'ESPN Deportes HD (LaLiga Santander & Copa del Rey)',
    logo: LOGO_ESPN,
    url: 'http://168.228.44.241:9998/play/a0dz/index.m3u8',
    backupUrls: [
      'http://181.78.197.59:8000/play/a07z/index.m3u8',
      'http://45.162.64.114/ESPN_4/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'ESPN',
    grupo: 'LaLiga',
    competicoes: ['LaLiga', 'Copa del Rey', 'MLS'],
  },
  {
    id: 'espn-4-laliga-hd',
    nome: 'ESPN 4 HD (LaLiga, Premier League & NBA)',
    logo: LOGO_ESPN,
    url: 'http://45.162.64.114/ESPN_4/index.m3u8',
    backupUrls: [
      'http://181.78.197.59:8000/play/a07n/index.m3u8',
      'http://181.78.197.59:8000/play/a07z/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'BR',
    rede: 'ESPN',
    grupo: 'LaLiga',
    competicoes: ['LaLiga', 'Premier League', 'NBA'],
  },
];

// CANAIS NBA (Basquete NBA ao vivo e 24h)
export const CANAIS_NBA: CanalItem[] = [
  {
    id: 'nba-tv-live-hd',
    nome: 'NBA TV Live HD (Jogos Ao Vivo & Melhores Momentos)',
    logo: LOGO_NBA,
    url: 'https://cdn1.ayitistream.com/NBATV/index.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      'http://45.162.64.114/SPACE/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'NBA TV',
    grupo: 'NBA',
    competicoes: ['NBA', 'Basquete'],
  },
  {
    id: 'space-nba-live-hd',
    nome: 'Space HD (Noites de NBA TNT Sports)',
    logo: LOGO_TNT_SPORTS,
    url: 'http://45.162.64.114/SPACE/index.m3u8',
    backupUrls: [
      'https://cdn1.ayitistream.com/NBATV/index.m3u8',
      'http://45.162.64.114/ESPN_4/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'BR',
    rede: 'TNT Sports',
    grupo: 'NBA',
    competicoes: ['NBA', 'Champions League'],
  },
  {
    id: 'acc-sports-basketball-hd',
    nome: 'ACC Sports Network HD (Basquete & Estrelas da NBA)',
    logo: LOGO_ACC,
    url: 'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
    backupUrls: [
      'https://cdn1.ayitistream.com/NBATV/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'NBA',
    competicoes: ['NBA', 'Basquete NCAA'],
  },
];

// CANAIS MLS (Major League Soccer)
export const CANAIS_MLS: CanalItem[] = [
  {
    id: 'cbs-golazo-mls-hd',
    nome: 'CBS Sports Golazo HD (MLS & Concacaf Champions Cup)',
    logo: LOGO_MLS,
    url: 'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8',
    backupUrls: [
      'https://jmp2.uk/plu-63a0e33a45264d000850ed7e.m3u8',
      'http://85.237.89.160:9590/usa-s/FOX-SPORTS-1/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'MLS',
    competicoes: ['MLS', 'Champions League'],
  },
  {
    id: 'fox-sports-1-mls-hd',
    nome: 'Fox Sports 1 HD (MLS Major League Soccer Ao Vivo)',
    logo: LOGO_FOX_SPORTS,
    url: 'http://85.237.89.160:9590/usa-s/FOX-SPORTS-1/index.m3u8',
    backupUrls: [
      'https://tvsen7.aynascope.net/foxsports2/index.m3u8',
      'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'Fox Sports',
    grupo: 'MLS',
    competicoes: ['MLS', 'Concacaf'],
  },
  {
    id: 'fox-sports-2-mls-hd',
    nome: 'Fox Sports 2 HD (MLS Futebol & Concacaf)',
    logo: LOGO_FOX_SPORTS,
    url: 'https://tvsen7.aynascope.net/foxsports2/index.m3u8',
    backupUrls: [
      'http://85.237.89.160:9590/usa-s/FOX-SPORTS-1/index.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'Fox Sports',
    grupo: 'MLS',
    competicoes: ['MLS', 'Concacaf'],
  },
];

// CANAIS beIN SPORTS (Esportes Internacionais)
export const CANAIS_BEIN_SPORTS: CanalItem[] = [
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
export const CANAIS_ZAP_ANGOLA: CanalItem[] = [
  {
    id: 'zap-tv-zimbo-hd',
    nome: 'TV Zimbo HD (Angola)',
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
    nome: 'TV Zimbo Desporto (Giro Girabola)',
    logo: 'https://i.imgur.com/SFD8CBh.png',
    url: 'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8',
    backupUrls: [
      'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/tracks-v6/index.fmp4.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'AO',
    rede: 'ZAP',
    grupo: 'ZAP Angola',
  },
];

// CANAIS SUPERSPORT & ESPORTES GLOBAIS
export const CANAIS_SUPERSPORT: CanalItem[] = [
  {
    id: 'redbull-tv-sports-hd',
    nome: 'Red Bull TV Sports & Ação HD',
    logo: LOGO_REDBULL,
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
  {
    id: 'aspor-futebol-hd',
    nome: 'A Spor HD (Futebol Europeu & Debate)',
    logo: LOGO_ASPOR,
    url: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
  {
    id: 'acc-sports-network-hd',
    nome: 'ACC Sports Network HD (NCAA & Basquete)',
    logo: LOGO_ACC,
    url: 'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
    backupUrls: [
      'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    ],
    categoria: 'Esportes',
    pais: 'Global',
    rede: 'SuperSport',
    grupo: 'SuperSport',
  },
  {
    id: 'golf-tour-tv-hd',
    nome: '30A Golf Tour TV (PGA & Lazer)',
    logo: LOGO_GOLF,
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
    nome: 'SuperSport Action (Red Bull Extreme)',
    logo: LOGO_SUPERSPORT,
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrls: [
      'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
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
    nome: 'Vivo TV HD (Variedades & Lazer)',
    logo: LOGO_VIVO,
    url: 'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
    backupUrls: [
      'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8',
      'https://cdn.freevisiontv.co.za/sttv/smil:1kzn.stream.smil/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'BR',
    rede: 'Vivo',
    grupo: 'Vivo TV',
  },
  {
    id: 'vivo-canal-once-hd',
    nome: 'Canal Once HD (Cultura, Notícias & Esportes)',
    logo: LOGO_VIVO,
    url: 'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8',
    backupUrls: [
      'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8',
    ],
    categoria: 'Lazer',
    pais: 'BR',
    rede: 'Vivo',
    grupo: 'Vivo TV',
  },
  {
    id: 'vivo-play-esportes-br',
    nome: 'Red Bull Esportes & Ação Ao Vivo',
    logo: LOGO_REDBULL,
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
    nome: '3AW Notícias & Jornalismo 24h',
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
    nome: 'Free Vision TV (Cinema & Séries)',
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

export function deduplicateCanais<T extends { id?: string; url?: string }>(items: T[]): T[] {
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const id = item.id ? item.id.trim() : '';
    const url = item.url ? item.url.trim().toLowerCase() : '';
    if (id && seenIds.has(id)) continue;
    if (url && seenUrls.has(url)) continue;
    if (id) seenIds.add(id);
    if (url) seenUrls.add(url);
    result.push(item);
  }
  return result;
}

export const CANAIS_PADRAO: CanalItem[] = deduplicateCanais([
  ...(TODOS_OS_CANAIS_CATALOGO as CanalItem[]),
]);

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
      const competicoes: string[] = [];

      let rede: RedeCanal = 'Geral';
      if (combined.includes('tnt') || combined.includes('space')) {
        rede = 'TNT Sports';
        categoria = 'Esportes';
        competicoes.push('Champions League', 'NBA');
      } else if (combined.includes('bein')) {
        rede = 'beIN Sports';
        categoria = 'Esportes';
        if (combined.includes('libertadores') || combined.includes('sudamericana')) {
          competicoes.push('Libertadores');
        }
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
      } else if (combined.includes('nba')) {
        rede = 'NBA TV';
        categoria = 'Esportes';
        competicoes.push('NBA');
      } else if (combined.includes('espn')) {
        rede = 'ESPN';
        categoria = 'Esportes';
      } else if (combined.includes('fox sport')) {
        rede = 'Fox Sports';
        categoria = 'Esportes';
      }

      if (combined.includes('libertadores')) competicoes.push('Libertadores');
      if (combined.includes('champions')) competicoes.push('Champions League');
      if (combined.includes('laliga') || combined.includes('la liga')) competicoes.push('LaLiga');
      if (combined.includes('nba')) competicoes.push('NBA');
      if (combined.includes('mls') || combined.includes('major league soccer')) competicoes.push('MLS');

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
          combined.includes('kids') ||
          combined.includes('animation') ||
          combined.includes('boneco') ||
          combined.includes('desenho') ||
          combined.includes('cartoon') ||
          combined.includes('infantil') ||
          combined.includes('anime')
        ) {
          categoria = 'Bonecos';
        } else if (
          combined.includes('novela') ||
          combined.includes('drama') ||
          combined.includes('telenovela')
        ) {
          categoria = 'Novelas';
        } else if (
          combined.includes('movie') ||
          combined.includes('cinema') ||
          combined.includes('filme') ||
          combined.includes('series') ||
          combined.includes('cine')
        ) {
          categoria = 'Filmes';
        } else if (
          combined.includes('music') ||
          combined.includes('musica') ||
          combined.includes('música') ||
          combined.includes('sound') ||
          combined.includes('hits')
        ) {
          categoria = 'Músicas';
        } else if (
          combined.includes('news') ||
          combined.includes('noticia') ||
          combined.includes('notícia') ||
          combined.includes('jornal') ||
          combined.includes('agro')
        ) {
          categoria = 'Notícias';
        } else {
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
        competicoes: competicoes.length > 0 ? competicoes : undefined,
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

    let canais: CanalItem[] = [...CANAIS_PADRAO];

    // Conjuntos para rastrear IDs e URLs já adicionados e garantir sinal exclusivo por canal
    const addedIds = new Set<string>();
    const addedUrls = new Set<string>();
    canais.forEach((c) => {
      if (c.id) addedIds.add(c.id);
      if (c.url) addedUrls.add(c.url.trim().toLowerCase());
    });

    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const item of r.value) {
          const itemUrl = item.url ? item.url.trim().toLowerCase() : '';
          if (item.id && !addedIds.has(item.id) && itemUrl && !addedUrls.has(itemUrl)) {
            addedIds.add(item.id);
            addedUrls.add(itemUrl);
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
    return NextResponse.json(CANAIS_PADRAO);
  }
}
