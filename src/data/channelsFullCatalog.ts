import { Canal } from '@/types';
import { CANAIS_YOUTUBE } from './channelsYoutube';
import { CANAIS_NOVOS_SOLICITADOS } from './channelsNewUserList';
import { CANAIS_ESPORTES_SOLICITADOS } from './channelsEsportesSolicitados';
import { LOGO_TNT_SPORTS, LOGO_CHAMPIONS_LEAGUE } from '@/utils/channelLogoUtils';

export const CANAIS_COMPLETOS: Canal[] = [
  {
    "id": "tnt-sports-brasil-hd",
    "nome": "TNT Sports Brasil HD (Champions League & NBA)",
    "logo": LOGO_TNT_SPORTS,
    "url": "http://45.162.64.114/SPACE/index.m3u8",
    "categoria": "Esportes",
    "pais": "BR",
    "rede": "TNT Sports",
    "grupo": "TNT Sports",
    "competicoes": [
      "Champions League",
      "NBA",
      "Paulistão"
    ]
  },
  {
    "id": "uefa-champions-league-live-hd",
    "nome": "UEFA Champions League Live HD",
    "logo": LOGO_CHAMPIONS_LEAGUE,
    "url": "https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Champions League",
    "competicoes": [
      "Champions League"
    ]
  },
  {
    "id": "rmtv-espanol-hd",
    "nome": "Real Madrid TV HD (Champions League & LaLiga)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EREAL%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EMADRID%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8",
    "categoria": "Esportes",
    "pais": "ES",
    "rede": "SuperSport",
    "grupo": "Champions League",
    "competicoes": [
      "Champions League",
      "LaLiga"
    ]
  },
  {
    "id": "rmtv-english-hd",
    "nome": "Real Madrid TV English HD",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EREAL%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EMADRID%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://rmtv.akamaized.net/hls/live/2043154/rmtv-en-web/master.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Champions League",
    "competicoes": [
      "Champions League",
      "LaLiga"
    ]
  },
  {
    "id": "espn-brasil-libertadores-hd",
    "nome": "ESPN Brasil HD (Libertadores, LaLiga & NBA)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23cc0000%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EESPN%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EBRASIL%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "http://181.78.197.59:8000/play/a07z/index.m3u8",
    "categoria": "Esportes",
    "pais": "BR",
    "rede": "ESPN",
    "grupo": "Libertadores",
    "competicoes": [
      "Libertadores",
      "LaLiga",
      "NBA"
    ]
  },
  {
    "id": "bein-sports-xtra-hd",
    "nome": "beIN SPORTS XTRA HD (Libertadores)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23562680%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EBEIN%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300ffd5%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ESPORTS%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "beIN Sports",
    "grupo": "beIN Sports",
    "competicoes": [
      "Libertadores",
      "Sudamericana"
    ]
  },
  {
    "id": "bein-sports-espanol-hd",
    "nome": "beIN SPORTS en Español HD",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23562680%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EBEIN%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300ffd5%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ESPORTS%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "beIN Sports",
    "grupo": "beIN Sports"
  },
  {
    "id": "redbull-tv-sports-hd",
    "nome": "Red Bull TV Sports & Ação HD",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3ERED%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EBULL%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "SuperSport"
  },
  {
    "id": "aspor-futebol-hd",
    "nome": "A Spor HD (Futebol Europeu & Debate)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EA%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ESPOR%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "SuperSport"
  },
  {
    "id": "acc-sports-network-hd",
    "nome": "ACC Sports Network HD (NCAA & Basquete)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EACC%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ESPORTS%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://raycom-accdn-firetv.amagi.tv/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "SuperSport"
  },
  {
    "id": "golf-tour-tv-hd",
    "nome": "30A Golf Tour TV (PGA & Lazer)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3E30A%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EGOLF%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://30a-tv.com/feeds/vidaa/golf.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "SuperSport"
  },
  {
    "id": "band-sports-br-feed",
    "nome": "BandSports HD (Futebol & Automobilismo)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23120024%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EBANDSPORTS%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EHD%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "http://45.162.64.114/BAND_SPORTS/index.m3u8",
    "categoria": "Esportes",
    "pais": "BR",
    "rede": "TNT Sports",
    "grupo": "TNT Sports"
  },
  {
    "id": "espn-4-feed-br",
    "nome": "ESPN 4 HD (Premier League & Rodada)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23cc0000%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EESPN%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3E4%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "http://45.162.64.114/ESPN_4/index.m3u8",
    "categoria": "Esportes",
    "pais": "BR",
    "rede": "ESPN",
    "grupo": "ESPN"
  },
  {
    "id": "espn-extra-feed",
    "nome": "ESPN Extra HD (Esportes Americanos)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23cc0000%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EESPN%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EEXTRA%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "http://181.78.197.59:8000/play/a07n/index.m3u8",
    "categoria": "Esportes",
    "pais": "BR",
    "rede": "ESPN",
    "grupo": "ESPN"
  },
  {
    "id": "zap-tv-zimbo-hd",
    "nome": "TV Zimbo HD (Angola)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23ff6600%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3ETV%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EZIMBO%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8",
    "categoria": "Lazer",
    "pais": "AO",
    "rede": "ZAP",
    "grupo": "ZAP Angola"
  },
  {
    "id": "zap-viva-hd-angola",
    "nome": "ZAP Viva HD (Angola)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23ff6600%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EZAP%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EVIVA%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/tracks-v6/index.fmp4.m3u8",
    "categoria": "Lazer",
    "pais": "AO",
    "rede": "ZAP",
    "grupo": "ZAP Angola"
  },
  {
    "id": "zap-kk-tv-angola",
    "nome": "KK TV Angola (ZAP 1080p)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23ff6600%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EKK%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ETV%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://w1.manasat.com/ktv-angola/smil:ktv-angola.smil/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "AO",
    "rede": "ZAP",
    "grupo": "ZAP Angola"
  },
  {
    "id": "zap-muzangala-tv",
    "nome": "Muzangala TV Angola (ZAP 1080p)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23ff6600%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EMUZANGALA%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ETV%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://5cf4a2c2512a2.streamlock.net/tvmuzangala/tvmuzangala/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "AO",
    "rede": "ZAP",
    "grupo": "ZAP Angola"
  },
  {
    "id": "5sport-1080p-",
    "nome": "5Sport (1080p)",
    "logo": "https://i.imgur.com/dRVsB89.png",
    "url": "http://stream.mcquack.net/41/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "-port-1080p-",
    "nome": ":Šport (1080p)",
    "logo": "https://i.imgur.com/oAtcxNZ.png",
    "url": "http://88.212.15.27/live/test_rtvs_sport_hevc/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "acc-network-720p-",
    "nome": "ACC Network (720p)",
    "logo": "https://i.imgur.com/TpCkbkT.png",
    "url": "http://23.239.31.26:8989/accnetwork/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "aci-sport-tv-1080p-",
    "nome": "ACI Sport TV (1080p)",
    "logo": "https://i.imgur.com/U8cHMOt.png",
    "url": "https://webstream.multistream.it/memfs/e2cb3629-c1a2-495b-b43a-9eb386f04ed8.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "adjarasport-1",
    "nome": "Adjarasport 1",
    "logo": "https://i.imgur.com/SVV5xHC.png",
    "url": "https://live20.bozztv.com/dvrfl05/gin-adjara/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "ado-tv-720p-",
    "nome": "ADO TV (720p)",
    "logo": "https://i.imgur.com/pxFamLr.png",
    "url": "https://strhls.streamakaci.tv/ortb/ortb2-multi/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Kids;Sports"
  },
  {
    "id": "africa-24-sport-1080p-",
    "nome": "Africa 24 Sport (1080p)",
    "logo": "https://i0.wp.com/africa24tv.com/wp-content/uploads/2023/12/LOGO-AFRICASPORT-4-HD-sans-fond.png?fit=512%2C107&ssl=1",
    "url": "https://africa24.vedge.infomaniak.com/livecast/ik:africa24sport/manifest.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "News;Sports"
  },
  {
    "id": "al-iraqia-sport-720p-",
    "nome": "Al Iraqia Sport (720p)",
    "logo": "https://i.imgur.com/DrrlxTO.png",
    "url": "https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alfa-sport-1080p-not-24-7-",
    "nome": "Alfa Sport (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/vhMPYIW.png",
    "url": "https://dev.aftermind.xyz/edge-hls/unitrust/alfasports/index.m3u8?token=8TXWzhY3h6jrzqEqx",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alkass-four-1080p-",
    "nome": "Alkass Four (1080p)",
    "logo": "https://i.imgur.com/iDL65Wu.png",
    "url": "https://liveeu-gcp.alkassdigital.net/alkass4-p/main.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alkass-one-1080p-",
    "nome": "Alkass One (1080p)",
    "logo": "https://i.imgur.com/10mmlha.png",
    "url": "https://liveeu-gcp.alkassdigital.net/alkass1-p/main.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alkass-shoof-1080p-",
    "nome": "Alkass SHOOF (1080p)",
    "logo": "https://shoof.alkass.net/assets/images/shoof.png",
    "url": "https://liveeu-gcp.alkassdigital.net/shooflive/main.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alkass-shoof-2-1080p-",
    "nome": "Alkass SHOOF 2 (1080p)",
    "logo": "https://shoof.alkass.net/assets/images/shoof2.png",
    "url": "https://liveeu-gcp.alkassdigital.net/shooflive2/main.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alkass-six-1080p-",
    "nome": "Alkass Six (1080p)",
    "logo": "https://i.imgur.com/CrPSPSC.png",
    "url": "https://liveeu-gcp.alkassdigital.net/alkass6-p/main.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alkass-three-1080p-",
    "nome": "Alkass Three (1080p)",
    "logo": "https://i.imgur.com/d57BdFh.png",
    "url": "https://liveeu-gcp.alkassdigital.net/alkass3-p/main.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "alkass-two-1080p-",
    "nome": "Alkass Two (1080p)",
    "logo": "https://i.imgur.com/8w61kFX.png",
    "url": "https://liveeu-gcp.alkassdigital.net/alkass2-p/main.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "arena-sport-1",
    "nome": "Arena Sport 1",
    "logo": "https://i.imgur.com/2qf67zW.png",
    "url": "http://88.212.15.19/live/test_arenasport/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "arena-sport-2",
    "nome": "Arena Sport 2",
    "logo": "https://i.imgur.com/Yq3Jf19.png",
    "url": "http://88.212.15.19/live/test_arenasport_dva/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "arena-sport-5-premium",
    "nome": "Arena Sport 5 Premium",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EARENA%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ESPORT%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://nl1.nghk.ai/SK2SRHD/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "arryadia",
    "nome": "Arryadia",
    "logo": "https://i.imgur.com/XjzK3gZ.png",
    "url": "http://149.100.11.252:8000/play/a065/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "as3-sport-tv-1080p-",
    "nome": "AS3 Sport TV (1080p)",
    "logo": "https://i.ibb.co/bRmGbsyV/A3-SPORTTV.jpg",
    "url": "https://streamtv.as3sport.online:3394/hybrid/play.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "atg-live-720p-",
    "nome": "ATG Live (720p)",
    "logo": "https://i.imgur.com/bPWFXkL.png",
    "url": "https://kanal75xto-llhls.akamaized.net/live/Data/atg-kanal-15-02a-rr/HLS-Legacy-HL/atg-kanal-15-02a-rr.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "awapa-sports-tv-1080p-not-24-7-",
    "nome": "Awapa Sports TV (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/MNw5cJH.jpg",
    "url": "https://mgv-awapa.akamaized.net/hls/live/2104282/MGV_CHANNEL15/master.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "azteca-deportes-network-1080p-",
    "nome": "Azteca Deportes Network (1080p)",
    "logo": "https://match-images.icdb.tv/5913207f2494844101287828e87625eb.jpg",
    "url": "http://181.119.66.28:8081/AZTECA-DEPORTES-HD/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "bahrain-sports-1-720p-not-24-7-",
    "nome": "Bahrain Sports 1 (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/fBpLsbC.png",
    "url": "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "bahrain-sports-2-720p-not-24-7-",
    "nome": "Bahrain Sports 2 (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/ZkuZmIo.png",
    "url": "https://5c7b683162943.streamlock.net/live/ngrp:bahrainsportstwo_all/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "band-sports-1080p-",
    "nome": "Band Sports (1080p)",
    "logo": "https://i.imgur.com/EuPvzJe.png",
    "url": "https://cdn-5.nxplay.com.br/BAND_SPORTS/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "barca-tv",
    "nome": "Barca TV",
    "logo": "https://i.imgur.com/d8x7c8i.png",
    "url": "https://live20.bozztv.com/dvrfl06/astv/astv-barca/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "bein-sports-xtra-en-espanol-1080p-",
    "nome": "beIN SPORTS XTRA en Espanol (1080p)",
    "logo": "https://i.imgur.com/V562tpO.png",
    "url": "http://201.190.41.246:9060/play/a03y/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "bek-tv-sports-west-720p-",
    "nome": "BEK TV Sports West (720p)",
    "logo": "https://i.imgur.com/1l3t5jd.png",
    "url": "https://cdn3.wowza.com/5/ZWQ1K2NYTmpFbGsr/BEK-WOWZA-1/smil:BEKPRIMEW.smil/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "belarus-5-1080p-not-24-7-",
    "nome": "Belarus-5 (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/NJsRFud.png",
    "url": "https://ngtrk.dc.beltelecom.by/ngtrk/smil:belarus5.smil/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "belarus-5-hd-1080p-",
    "nome": "Belarus-5 HD (1080p)",
    "logo": "https://i.imgur.com/NJsRFud.png",
    "url": "http://178.124.179.122:8080/BT5/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "bellator-mma",
    "nome": "Bellator MMA",
    "logo": "https://i.imgur.com/VBKoLHk.png",
    "url": "https://jmp2.uk/plu-5ebc8688f3697d00072f7cf8.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "billiard-tv-1080p-geo-blocked-",
    "nome": "Billiard TV (1080p) [Geo-blocked]",
    "logo": "https://i.imgur.com/BZijfKh.png",
    "url": "https://pb-wm04vonaerv0k.akamaized.net/billi.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "br-ndby-tv",
    "nome": "Brøndby TV",
    "logo": "https://images.pluto.tv/channels/685029cda1e091e16ff57fc8/colorLogoPNG_1750246109707.png",
    "url": "https://jmp2.uk/plu-685029cda1e091e16ff57fc8.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "canal-do-inter-720p-not-24-7-",
    "nome": "Canal do Inter (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/TQFWEIS.png",
    "url": "https://video01.soultv.com.br/internacional/internacional/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "canal-showsport-720p-",
    "nome": "Canal Showsport (720p)",
    "logo": "https://i.imgur.com/0L9tW3Z.png",
    "url": "https://livestream.lumpentv.com.ar/hls/lumpen.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "canal-sport-360",
    "nome": "Canal+ Sport 360",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/6/64/Canal%2BSport_360.png",
    "url": "https://futbol9865.ultratv13.workers.dev/deportivo111/14.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cazetv-1080i-",
    "nome": "CazeTV (1080i)",
    "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/6/64/Caz%C3%A9TV_logo.svg/1280px-Caz%C3%A9TV_logo.svg.png",
    "url": "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cbc-sport-hd-geo-blocked-",
    "nome": "CBC Sport HD [Geo-blocked]",
    "logo": "https://i.imgur.com/3mEdjuq.png",
    "url": "https://mn-nl.mncdn.com/cbcsports_live/cbcsports/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cbs-sports-hq-720p-",
    "nome": "CBS Sports HQ (720p)",
    "logo": "https://i.imgur.com/q8BENJg.png",
    "url": "https://jmp2.uk/plu-5e9f2c05172a0f0007db4786.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cctv-5-",
    "nome": "CCTV-5+",
    "logo": "https://i.imgur.com/OK8mdJV.png",
    "url": "https://myip.pdtvhd.com/Sports/streams/CCTV5pul.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cctv-16-1080p-",
    "nome": "CCTV-16 (1080p)",
    "logo": "https://i.imgur.com/ZzV6JQp.png",
    "url": "http://74.91.26.218:82/live/cctv16hd.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cctv-billiards-1080p-",
    "nome": "CCTV-Billiards (1080p)",
    "logo": "https://i.imgur.com/WK3keM9.png",
    "url": "http://38.75.136.137:98/gslb/dsdqpub/ystq.m3u8?auth=testpub",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cctv-golf-tennis-1080p-",
    "nome": "CCTV-Golf & Tennis (1080p)",
    "logo": "https://i.imgur.com/iqJJTmH.png",
    "url": "http://38.75.136.137:98/gslb/dsdqpub/gefwq.m3u8?auth=testpub",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cctv-storm-football-1080p-",
    "nome": "CCTV-Storm Football (1080p)",
    "logo": "https://i.imgur.com/Fy6HkX0.png",
    "url": "http://38.75.136.137:98/gslb/dsdqpub/fyzq.m3u8?auth=testpub",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cdn-deportes-720p-not-24-7-",
    "nome": "CDN Deportes (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/yU5LqTL.png",
    "url": "https://hls.tvabierta.net/hls/036.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cdo-1080p-",
    "nome": "CDO (1080p)",
    "logo": "https://i.imgur.com/zH3jHIT.png",
    "url": "http://cdn1tlinkgo.tlink.cl/cdo/mono.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "claro-sports-720p-",
    "nome": "Claro Sports (720p)",
    "logo": "https://i.imgur.com/n0kd17r.png",
    "url": "https://jmp2.uk/plu-6320d2755e54db000783fd87.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "colimdot-tv-720p-",
    "nome": "ColimdoT TV (720p)",
    "logo": "https://i.imgur.com/ZeUgLCa.png",
    "url": "https://cnn.livestreaminggroup.info:3132/live/colimdotvlive.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "combate-720p-",
    "nome": "Combate (720p)",
    "logo": "https://i.imgur.com/ZPYK5jr.png",
    "url": "http://143.14.134.107/167/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "cricket-gold-1080p-",
    "nome": "Cricket Gold (1080p)",
    "logo": "https://resources.cricket-australia.pulselive.com/cricket-australia/photo/2025/07/25/836eddae-4329-4542-ad17-dcd37e9d951a/Cricket-Gold-1920x1080_noBG.png",
    "url": "https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "crtv-720p-",
    "nome": "CRTV (720p)",
    "logo": "https://i2.paste.pics/bf68b159547597c39574aec9dd7c626a.png",
    "url": "https://stmv2.voxtvhd.com.br/crtvchile/crtvchile/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "-t-sport-720p-",
    "nome": "ČT Sport (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/%C4%8CT_sport_logo.png/960px-%C4%8CT_sport_logo.png",
    "url": "http://88.212.15.19/live/test_ctsport_25p/playlist.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dazn-combat-684p-",
    "nome": "DAZN Combat (684p)",
    "logo": "https://i.postimg.cc/VsW3Jsrz/logo-DAZN-Combat.png",
    "url": "https://jmp2.uk/plu-64d626ac9b414d000820e2fc.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dazn-darts-x-pluto-tv",
    "nome": "DAZN Darts x Pluto TV",
    "logo": "https://images.pluto.tv/channels/64b67f0424ade50008a3be17/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-64b67f0424ade50008a3be17.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dazn-heldinnen-x-pluto-tv",
    "nome": "DAZN Heldinnen x Pluto TV",
    "logo": "https://images.pluto.tv/channels/64afe50c5dc16600087f3227/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-64afe50c5dc16600087f3227.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dd-sports-sd-1080p-",
    "nome": "DD Sports SD (1080p)",
    "logo": "https://dtil.tmsimg.com/assets/s158255_ld_h15_aa.png?lock=720x540",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "deportes-por-movistar-plus-",
    "nome": "Deportes por Movistar Plus+",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23002b66%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EDEPORTES%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300bfff%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EPOR%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://7nyaler.streamhostingcdn.top/stream/18/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "deportes-tvc-1080p-",
    "nome": "Deportes TVC (1080p)",
    "logo": "https://i.imgur.com/Y1t8xkL.png",
    "url": "http://162.19.255.233:8080/play/UNbAl57p9hXZClOu56FCTYXmD-MOS3u5IUkeXPpBt80/m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "digi-sport-1",
    "nome": "Digi Sport 1",
    "logo": "https://i.imgur.com/5zMxDYq.png",
    "url": "https://7nyaler.streamhostingcdn.top/stream/79/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "digi-sport-2-1080p-",
    "nome": "Digi Sport 2 (1080p)",
    "logo": "https://i.imgur.com/KWDUi3v.png",
    "url": "http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2522/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "digi-sport-3-576p-",
    "nome": "Digi Sport 3 (576p)",
    "logo": "https://i.imgur.com/T1ci5UK.png",
    "url": "http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2524/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "digi-sport-4-1080p-",
    "nome": "Digi Sport 4 (1080p)",
    "logo": "https://i.imgur.com/Knj9I6f.png",
    "url": "http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2538/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "divisport-1080p-",
    "nome": "DiviSport (1080p)",
    "logo": "https://i.logos-download.com/114030/29915-s5120-904df224e4c030fefcc45adda448b6e8.png/DiviSport_Logo_2023-s5120.png",
    "url": "http://stream.mcquack.net/457/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dong-nai-tv-2-720p-",
    "nome": "Dong Nai TV 2 (720p)",
    "logo": "https://i.imgur.com/tNKPSkO.png",
    "url": "https://vtvgolive-ott3.vtvdigital.vn/live/dongnai2tv/chunklist_2.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Entertainment;Sports"
  },
  {
    "id": "draftkings-network-1080p-",
    "nome": "DraftKings Network (1080p)",
    "logo": "https://i.imgur.com/SFYhgrt.png",
    "url": "https://na.linear.zype.com/e0bd0e23-a958-4e43-8164-4f2fef8876a8/fd3614bd-90bf-4530-a277-65ae3a1720c8-zype/live.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dsports",
    "nome": "DSports",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/DirecTV_Sports_Latin_America_%282018%29.png/960px-DirecTV_Sports_Latin_America_%282018%29.png",
    "url": "http://138.121.113.175:8000/play/a0cj/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dsports-2",
    "nome": "DSports 2",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/DIRECTV_Sports_2_Latin_America_%282018%29.svg/960px-DIRECTV_Sports_2_Latin_America_%282018%29.svg.png",
    "url": "http://138.121.113.175:8000/play/a0ca/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "dynamo-kyiv-tv-1080p-",
    "nome": "Dynamo Kyiv TV (1080p)",
    "logo": "https://i.imgur.com/ymxmyyG.png",
    "url": "http://stream.mcquack.net/396/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "el-heddaf-tv-1080p-",
    "nome": "El-Heddaf TV (1080p)",
    "logo": "https://i.imgur.com/cDkIDIA.png",
    "url": "https://live.elheddaftv.com:8081/elheddaftv/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "equalympic-1080p-",
    "nome": "Equalympic (1080p)",
    "logo": "https://i.imgur.com/ixSj4H7.png",
    "url": "http://stream.mcquack.net/485/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "equidia-1080p-",
    "nome": "Equidia (1080p)",
    "logo": "https://i.imgur.com/QPpbRcZ.png",
    "url": "https://raw.githubusercontent.com/Paradise-91/ParaTV/main/streams/equidia/live2.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "ert-sports-1-1080p-",
    "nome": "ERT Sports 1 (1080p)",
    "logo": "https://i.imgur.com/EsczO2H.png",
    "url": "http://hbbtvapp.ert.gr/stream.php/v/vid_ertsports_mpeg.2ts",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "ert-sports-2-1080p-",
    "nome": "ERT Sports 2 (1080p)",
    "logo": "https://i.imgur.com/b2SNQPi.png",
    "url": "http://hbbtvapp.ert.gr/stream.php/v/vid_ertplay2_mpeg.2ts",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "espn-3-1080p-",
    "nome": "ESPN 3 (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/ESPN3_Logo.png/960px-ESPN3_Logo.png",
    "url": "http://190.83.2.182:8090/ESPN3/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "espn8-the-ocho-1080p-",
    "nome": "ESPN8 The Ocho (1080p)",
    "logo": "https://images.fubo.tv/channel-config-ui/station-logos/on-dark/espn_8_the_ocho_bw.png",
    "url": "https://d3b6q2ou5kp8ke.cloudfront.net/ESPNTheOcho.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "espn-deportes-hd-720p-",
    "nome": "ESPN Deportes HD (720p)",
    "logo": "https://imgx.fubo.tv/station_logos/espn-hd-deportes_c.png",
    "url": "http://168.228.44.241:9998/play/a0dz/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "espnews-720p-",
    "nome": "ESPNews (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/ESPNews.svg/960px-ESPNews.svg.png",
    "url": "http://41.205.93.154/ESPNNEWS/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "News;Sports"
  },
  {
    "id": "espnu-720p-",
    "nome": "ESPNU (720p)",
    "logo": "https://i.imgur.com/HiBrysh.png",
    "url": "http://23.237.104.106:8080/USA_ESPNU/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "espnu-hd-720p-",
    "nome": "ESPNU HD (720p)",
    "logo": "https://i.imgur.com/HiBrysh.png",
    "url": "http://85.237.89.160:9590/usa-s/ESPN-U-HD/index.m3u8",
    "categoria": "Esportes",
    "pais": "Global",
    "rede": "SuperSport",
    "grupo": "Sports"
  },
  {
    "id": "3cat-plats-bruts-1080p-",
    "nome": "3Cat Plats bruts (1080p)",
    "logo": "https://i.imgur.com/49ZENis.png",
    "url": "https://fast-tailor.3catdirectes.cat/v1/channel/ccma-channel2/hls.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "4ever-drama-1080p-",
    "nome": "4ever Drama (1080p)",
    "logo": "https://i.imgur.com/CD3vZU6.png",
    "url": "http://stream.mcquack.net/260/index.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "5-cops",
    "nome": "5 Cops",
    "logo": "https://i.imgur.com/QFPRaXK.png",
    "url": "https://jmp2.uk/plu-5d2c571faeb3e2738ae27933.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "5-minut-tishiny-1080p-",
    "nome": "5 minut tishiny (1080p)",
    "logo": "https://cdn2-static.ntv.ru/home/promo/24740/5minut_live.jpg",
    "url": "https://cdn-dvr.ntv.ru/5_minut_tishiny/index.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "7th-heaven",
    "nome": "7th Heaven",
    "logo": "https://images.pluto.tv/channels/6728c9c85534bb0008b320a4/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6728c9c85534bb0008b320a4.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "7th-heaven-1",
    "nome": "7th Heaven",
    "logo": "https://images.pluto.tv/channels/6728c9c85534bb0008b320a4/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6728ca75529ac9000830ab14.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "7th-heaven-2",
    "nome": "7th Heaven",
    "logo": "https://images.pluto.tv/channels/6728c9c85534bb0008b320a4/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6728cab6e482950008b76d8c.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "13-teleseries-720p-",
    "nome": "13 Teleseries (720p)",
    "logo": "https://i.imgur.com/csBNi2L.png",
    "url": "https://origin.dpsgo.com/ssai/event/f4TrySe8SoiGF8Lu3EIq1g/master.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "27-twentyseven-geo-blocked-",
    "nome": "27 TwentySeven [Geo-blocked]",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Twentyseven_logo.svg/960px-Twentyseven_logo.svg.png",
    "url": "https://live2.msf.cdn.mediaset.net/content/hls_h0_cls_vos/live/channel(ts)/index.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "48-hours",
    "nome": "48 Hours",
    "logo": "https://images.pluto.tv/channels/6176f39e709f160007ec61c3/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-62e925bc68d18a00077bb990.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "48-hours-1080p-",
    "nome": "48 Hours (1080p)",
    "logo": "https://images.pluto.tv/channels/6176f39e709f160007ec61c3/colorLogoPNG.png",
    "url": "https://dai.google.com/linear/hls/event/JUr94WL2QAiVpGNHY5n5dA/master.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "50-cent-action-720p-",
    "nome": "50 Cent Action (720p)",
    "logo": "https://provider-static.plex.tv/epg/cms/production/bcfb9977-809f-49ae-acc7-430f2c6ffb26/50CentAction_Logo_1500x1000_DarkBG_-_Chris_Connors.png",
    "url": "https://jmp2.uk/plu-68487fb3f212bedacf5a53e3.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "2900-happiness",
    "nome": "2900 Happiness",
    "logo": "https://images.pluto.tv/channels/6720bc6cdaad7f000872a6e2/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6720bc6cdaad7f000872a6e2.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "90210",
    "nome": "90210",
    "logo": "https://images.pluto.tv/channels/65a67dd13af63d0008257f17/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-65a67dd13af63d0008257f17.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "abc-5-boston-ma-wcvb-720p-",
    "nome": "ABC 5 Boston MA (WCVB) (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/en/b/bf/Court_TV_2019.png",
    "url": "https://aegis-cloudfront-1.tubi.video/c2e3094d-ad56-4c5f-9655-cd80df71fbab/playlist.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "acapulco-shore",
    "nome": "Acapulco Shore",
    "logo": "https://images.pluto.tv/channels/61a52615cbef2500072876e2/colorLogoPNG_1756972226445.png",
    "url": "https://jmp2.uk/plu-64dab1f835425100080e1e7b.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "acapulco-shore-pluto-tv",
    "nome": "Acapulco Shore Pluto TV",
    "logo": "https://images.pluto.tv/channels/61a52615cbef2500072876e2/colorLogoPNG_1756972226445.png",
    "url": "https://jmp2.uk/plu-61a52615cbef2500072876e2.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "afra-series",
    "nome": "Afra Series",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%232b092b%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EAFRA%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23f72585%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ESERIES%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://afrashls.wns.live/hls/stream.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "alerte-malibu",
    "nome": "Alerte à Malibu",
    "logo": "https://i.imgur.com/hBiB6uk.png",
    "url": "https://jmp2.uk/plu-60afaa535580be0007ac9ee4.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "all-reality-we-tv-720p-",
    "nome": "All Reality WE tv (720p)",
    "logo": "https://i.imgur.com/HZTz5HJ.png",
    "url": "https://jmp2.uk/plu-5e82530945600e0007ca076c.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "all-weddings-we-tv",
    "nome": "All Weddings We TV",
    "logo": "https://i.imgur.com/OjLCew5.png",
    "url": "https://amc-allweddings-1-us.xumo.wurl.tv/playlist.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "always-funny-videos-720p-",
    "nome": "Always Funny Videos (720p)",
    "logo": "https://i.imgur.com/vfdN5Xl.png",
    "url": "https://d24l3uppudokci.cloudfront.net/playlist.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "amedia-2-576p-",
    "nome": "Amedia 2 (576p)",
    "logo": "https://i.imgur.com/NqHla2V.png",
    "url": "http://31.148.48.15/A2/index.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "amedia-hit-1080p-",
    "nome": "Amedia Hit (1080p)",
    "logo": "https://i.imgur.com/a8ZBGBw.png",
    "url": "http://stream.mcquack.net/162/index.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "amedia-premium-720p-",
    "nome": "Amedia Premium (720p)",
    "logo": "https://i.imgur.com/UUjehw9.png",
    "url": "http://31.148.48.15/Amedia_Premium_HD/index.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "america-s-next-top-model",
    "nome": "America's Next Top Model",
    "logo": "https://images.pluto.tv/channels/6464cc595a0cd500088c7749/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6464cc595a0cd500088c7749.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "america-s-next-top-model-1",
    "nome": "America's Next Top Model",
    "logo": "https://images.pluto.tv/channels/6464cc595a0cd500088c7749/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6464cd7c7cb4b100086c71c9.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "america-s-next-top-model-2",
    "nome": "America's Next Top Model",
    "logo": "https://images.pluto.tv/channels/6464cc595a0cd500088c7749/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6464cdcaee6a2f000822a7a8.m3u8",
    "categoria": "Novelas",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Novelas & Dramas"
  },
  {
    "id": "3abn-kids-network",
    "nome": "3ABN Kids Network",
    "logo": "https://i.imgur.com/z3npqO1.png",
    "url": "https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids;Religious"
  },
  {
    "id": "adn-tv-720p-",
    "nome": "ADN TV+ (720p)",
    "logo": "https://i.imgur.com/HQZQyWt.png",
    "url": "https://d3b73b34o7cvkq.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-gz2sgqzp076kf/adn.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "animation-1080p-geo-blocked-",
    "nome": "Animation+ (1080p) [Geo-blocked]",
    "logo": "https://i.imgur.com/OIFK6JB.png",
    "url": "https://pb-ioe9d0fpkd6pp.akamaized.net/playlist.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "animax-asia-india-1080p-geo-blocked-",
    "nome": "Animax Asia India (1080p) [Geo-blocked]",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Animax.png",
    "url": "https://amg02159-kcglobal-amg02159c1-samsung-in-521.playouts.now.amagi.tv/playlist/amg02159-kcglobal-animax-samsungin/playlist.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "anime-vision-1080p-",
    "nome": "Anime Vision (1080p)",
    "logo": "https://i.imgur.com/pUpKznl.png",
    "url": "https://d1ujfw1zyymzyd.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-a6fukwkbxmex8/live/fast-channel-animevision-64527ec0/fast-channel-animevision-64527ec0.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "anime-vision-classics-1080p-",
    "nome": "Anime Vision Classics (1080p)",
    "logo": "https://i.imgur.com/mTaiEE1.png",
    "url": "https://d82pyvmcw2kdc.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-swfivzrzwamaq/live/fast-channel-animevisionclassics-efc8dc6d/fast-channel-animevisionclassics-efc8dc6d.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "anime-x-hidive",
    "nome": "ANIME x HIDIVE",
    "logo": "https://i.imgur.com/v0BlxCa.png",
    "url": "https://jmp2.uk/plu-6793eaa4bc03978b9bc63db1.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "aniplus-asia-720p-",
    "nome": "Aniplus Asia (720p)",
    "logo": "https://i.imgur.com/Im3MePy.png",
    "url": "https://amg18481-amg18481c1-amgplt0352.playout.now3.amagi.tv/playlist/amg18481-amg18481c1-amgplt0352/playlist.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "avatar",
    "nome": "Avatar",
    "logo": "https://images.pluto.tv/channels/656df599c0fc8800089c75ab/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-656df599c0fc8800089c75ab.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids;Series"
  },
  {
    "id": "avatar-1",
    "nome": "Avatar",
    "logo": "https://images.pluto.tv/channels/61c09b48d6d97900076e91c5/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-61c09b48d6d97900076e91c5.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids;Series"
  },
  {
    "id": "banijay-mr-bean-anim-1080p-",
    "nome": "Banijay Mr Bean Animé (1080p)",
    "logo": "https://static.wikia.nocookie.net/logopedia/images/2/25/Mr._Bean_Animated_Series_stacked_logo.png",
    "url": "https://amg00627-amg00627c31-rakuten-fr-3991.playouts.now.amagi.tv/playlist/amg00627-banijayfast-mrbeanfrcc-rakutenfr/playlist.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "bbc-four-cbeebies-720p-",
    "nome": "BBC Four/CBeebies (720p)",
    "logo": "https://i.imgur.com/aH0PCPy.png",
    "url": "http://193.46.58.239:8080/CbeebiesHD/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;General;Kids"
  },
  {
    "id": "bbc-three-cbbc-720p-",
    "nome": "BBC Three/CBBC (720p)",
    "logo": "https://i.imgur.com/CGXC5fp.png",
    "url": "http://193.46.58.239:8080/CBBCHD/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Family;Kids"
  },
  {
    "id": "blues-tv",
    "nome": "Blues TV",
    "logo": "https://i.imgur.com/px0CSti.png",
    "url": "https://2-fss-2.streamhoster.com/pl_138/205510-3094608-1/playlist.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "cartoon-classics-576p-",
    "nome": "Cartoon Classics (576p)",
    "logo": "https://images-3.rakuten.tv/storage/global-live-channel/translation/artwork/3227c06e-333b-4b1b-b657-3e3ab99ebd06-width200-quality90.jpeg",
    "url": "http://5.188.159.128:8070/Cartoon_Network/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "comedy-central-south-park",
    "nome": "Comedy Central South Park",
    "logo": "https://images.pluto.tv/channels/60c716084d842c00085f6e64/colorLogoPNG_1748434979824.png",
    "url": "https://jmp2.uk/plu-60c716084d842c00085f6e64.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Comedy"
  },
  {
    "id": "comedy-central-south-park-1",
    "nome": "Comedy Central South Park",
    "logo": "https://images.pluto.tv/channels/609ae66b359b270007869ff1/colorLogoPNG_1733160636316.png",
    "url": "https://jmp2.uk/plu-609ae66b359b270007869ff1.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Comedy"
  },
  {
    "id": "comedy-central-south-park-2",
    "nome": "Comedy Central South Park",
    "logo": "https://images.pluto.tv/channels/609ae66b359b270007869ff1/colorLogoPNG_1733160636316.png",
    "url": "https://jmp2.uk/plu-609ae5cd48d3200007b0a98e.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Comedy"
  },
  {
    "id": "crunchyroll-720p-",
    "nome": "Crunchyroll (720p)",
    "logo": "https://i.imgur.com/2FlIQUO.png",
    "url": "https://jmp2.uk/plu-65652f7fc0fc88000883537a.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "daria",
    "nome": "Daria",
    "logo": "https://images.pluto.tv/channels/6683b680efa2a10008e8a393/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6683b680efa2a10008e8a393.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "detective-conan",
    "nome": "Detective Conan",
    "logo": "https://images.pluto.tv/channels/629a066860ef810008267b70/solidLogoPNG.png?w=512",
    "url": "https://jmp2.uk/plu-629a066860ef810008267b70.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "detective-conan-france-720p-",
    "nome": "Detective Conan France (720p)",
    "logo": "https://images.pluto.tv/channels/62f3e8ad2a8e8000077b013d/colorLogoPNG.png?w=512",
    "url": "https://jmp2.uk/plu-62f3e8ad2a8e8000077b013d.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "detvora-1080p-",
    "nome": "Detvora+ (1080p)",
    "logo": "https://interra-cdn-europe1.b-cdn.net/logo-detvora.png",
    "url": "https://cdn.rostelekom-tv.xyz/live/WAYU4PTJ_VVz4wAQ.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Family;Kids"
  },
  {
    "id": "disney-channel-latin-america-1080p-",
    "nome": "Disney Channel Latin America (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/ff/2024_Disney_Channel_text_logo.svg",
    "url": "http://15.204.246.24:8080/DisneyHD/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-channel-latin-america-center-1080",
    "nome": "Disney Channel Latin America Center (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/ff/2024_Disney_Channel_text_logo.svg",
    "url": "http://181.78.8.199:8000/play/a0dn/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-channel-latin-america-mexico-720p",
    "nome": "Disney Channel Latin America Mexico (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/ff/2024_Disney_Channel_text_logo.svg",
    "url": "http://45.166.93.156:9999/play/a0f3/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-channel-latin-america-north-576p-",
    "nome": "Disney Channel Latin America North (576p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/ff/2024_Disney_Channel_text_logo.svg",
    "url": "http://138.121.15.230:9002/DISNEY-CHANNEL/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-channel-latin-america-panregional",
    "nome": "Disney Channel Latin America Panregional HD (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/ff/2024_Disney_Channel_text_logo.svg",
    "url": "http://45.134.141.161:2200/ARG/Disney_Channel/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-jr-1080p-geo-blocked-",
    "nome": "Disney Jr. (1080p) [Geo-blocked]",
    "logo": "https://www.dsmart.com.tr/api/v1/public/images/kanallar/disneyjr.png",
    "url": "https://saran-live.ercdn.net/disneyjunior/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-jr-latin-america-1080p-",
    "nome": "Disney Jr. Latin America (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/2024_Disney_Jr._Logo.svg",
    "url": "http://190.14.10.19:16000/play/a02d/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-jr-latin-america-576p-",
    "nome": "Disney Jr. Latin America (576p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/2024_Disney_Jr._Logo.svg",
    "url": "http://190.93.224.42/DISNEY-JR/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-jr-latin-america-north-hd-1080p-",
    "nome": "Disney Jr. Latin America North HD (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/2024_Disney_Jr._Logo.svg",
    "url": "http://181.78.14.26:4000/play/a073/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-jr-latin-america-south-1080p-",
    "nome": "Disney Jr. Latin America South (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/2024_Disney_Jr._Logo.svg",
    "url": "http://45.185.163.75:8000/play/a016/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "disney-jr-latin-america-south-hd-1080p-",
    "nome": "Disney Jr. Latin America South HD (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/2024_Disney_Jr._Logo.svg",
    "url": "http://45.134.141.161:2200/ARG/Disney_Junior/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "dreamworks-channel-asia-1080p-",
    "nome": "DreamWorks Channel Asia (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/55/960px-DreamWorks_Animation_SKG_logo_with_fishing_boy.png/330px-1024px-DreamWorks_Animation_SKG_logo_with_fishing_boy.png",
    "url": "https://cdn12.178.indevs.in/163189/dreamworks",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "dreamworks-channel-latin-america-1080p-",
    "nome": "DreamWorks Channel Latin America (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/55/960px-DreamWorks_Animation_SKG_logo_with_fishing_boy.png/330px-1024px-DreamWorks_Animation_SKG_logo_with_fishing_boy.png",
    "url": "http://138.121.15.230:9002/DREAMWORKS/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "dreiko-tv-720p-not-24-7-",
    "nome": "Dreiko TV (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/k8U0e0b.png",
    "url": "https://cloudvideo.servers10.com:8081/8020/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "energeek-720p-not-24-7-",
    "nome": "EnerGeek (720p) [Not 24/7]",
    "logo": "https://cdn.energeek.cl/logos/EG-Retro-2025_pfp.png",
    "url": "https://backend.energeek.cl/webtv/egretroweb/index.m3u8?token=ZZDemoIPTVGH",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "energeek-fan-1080p-",
    "nome": "EnerGeek Fan (1080p)",
    "logo": "https://cdn.energeek.cl/logos/EG-Fan-2025_pfp.png",
    "url": "https://backend.energeek.cl/webtv/egfanweb/index.m3u8?token=ZZDemoIPTVGH",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "esports-max-tv",
    "nome": "eSports Max TV",
    "logo": "https://i.imgur.com/OprRgQN.png",
    "url": "https://cdnlive.klicgo.net/esportsmax/live/playlist_dvr.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "etc-tv-1080p-",
    "nome": "ETC TV (1080p)",
    "logo": "https://i.postimg.cc/RVYgh7h9/ETC-Logo.png",
    "url": "http://cdn1tlinkgo.tlink.cl/etc/mono.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "extrema-kids-tv-not-24-7-",
    "nome": "Extrema Kids TV [Not 24/7]",
    "logo": "https://www.vivalivetv.com/public/files/shows/0/1/3027-294x165-FFFFFF.jpg",
    "url": "https://627bb251f23c7.streamlock.net:444/ExtremaKids/ExtremaKids/playlist.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Kids"
  },
  {
    "id": "fan-1080p-",
    "nome": "FAN (1080p)",
    "logo": "https://i.imgur.com/mDeTbaF.png",
    "url": "http://31.148.48.15/Fan/index.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Movies"
  },
  {
    "id": "filmrise-anime-720p-",
    "nome": "FilmRise Anime (720p)",
    "logo": "https://i.imgur.com/3wqeGXM.png",
    "url": "https://dvu7aia8rjlfm.cloudfront.net/master.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "geekdot-720p-",
    "nome": "Geekdot (720p)",
    "logo": "https://i.imgur.com/jML1u4O.png",
    "url": "https://stream.ichibantv.com:3764/hybrid/play.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation"
  },
  {
    "id": "giktvmx-720p-",
    "nome": "GikTVMX (720p)",
    "logo": "https://i.imgur.com/Gwz78jZ.png",
    "url": "https://pistream.ddns.net/hls/stream.m3u8",
    "categoria": "Bonecos",
    "pais": "Global",
    "rede": "Cartoon",
    "grupo": "Animation;Culture;Entertainment"
  },
  {
    "id": "00s-replay",
    "nome": "00s Replay",
    "logo": "https://images.pluto.tv/channels/62ba60f059624e000781c436/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-62ba60f059624e000781c436.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "4ever-cinema-1080p-",
    "nome": "4ever Cinema (1080p)",
    "logo": "https://i.imgur.com/vFOgVbG.png",
    "url": "http://stream.mcquack.net/258/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "24-hour-free-movies-720p-",
    "nome": "24 Hour Free Movies (720p)",
    "logo": "https://i.imgur.com/iSVnzR1.png",
    "url": "https://d1j2u714xk898n.cloudfront.net/scheduler/scheduleMaster/145.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "30a-tv-classic-movies-720p-",
    "nome": "30A TV Classic Movies (720p)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23e50914%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3E30A%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ETV%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://30a-tv.com/feeds/pzaz/30atvmovies.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "70s-cinema",
    "nome": "70s Cinema",
    "logo": "https://i.imgur.com/mgXeEE4.png",
    "url": "https://jmp2.uk/plu-5f4d878d3d19b30007d2e782.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "80s-rewind",
    "nome": "80s Rewind",
    "logo": "https://i.imgur.com/nkEeYfI.png",
    "url": "https://jmp2.uk/plu-5ca525b650be2571e3943c63.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "90s-throwback",
    "nome": "90s Throwback",
    "logo": "https://i.imgur.com/KoGko6M.png",
    "url": "https://jmp2.uk/plu-5f4d86f519358a00072b978e.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "312-406p-",
    "nome": "312 Кино (406p)",
    "logo": "https://i.ibb.co/3m9LrLj/k7gIibH.png",
    "url": "http://176.126.166.43:1935/live/312kino/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "-tv-hd-1080p-",
    "nome": "&TV HD (1080p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SYMANDTV/images/LOGO_HD/LOGO_HD_image.png",
    "url": "http://202.70.146.135:8000/play/a06c/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "-tv-international-1080p-",
    "nome": "&TV International (1080p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SYMANDTV/images/LOGO_HD/LOGO_HD_image.png",
    "url": "https://amg01117-amg01117c1-amgplt0029.playout.now3.amagi.tv/playlist/amg01117-amg01117c1-amgplt0029/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "-xplor-hd-1080p-geo-blocked-",
    "nome": "&xplor HD (1080p) [Geo-blocked]",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SYMANDXPLOR_HD/images/LOGO_HD/LOGO_HD_image.png",
    "url": "http://dksmedia.tv/play/live.php?mac=00:1A:79:B6:60:3D&stream=209743&extension=ts&play_token=mR7FwO88sY",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "abn-bible-movies-720p-",
    "nome": "ABN Bible Movies (720p)",
    "logo": "https://i.imgur.com/NCqZdaL.png",
    "url": "https://mediaserver.abnvideos.com/streams/abnbiblemovies.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies;Religious"
  },
  {
    "id": "action-24-1080p-not-24-7-",
    "nome": "Action 24 (1080p) [Not 24/7]",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/8/88/Action24-logo-small.png",
    "url": "http://actionlive.siliconweb.com/actionabr/actiontv/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "adrenalina-pura-tv",
    "nome": "Adrenalina Pura TV",
    "logo": "https://i.imgur.com/Pvid2iH.png",
    "url": "https://jmp2.uk/plu-61b790b985706b00072cb797.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "adrenalina-pura-tv-720p-",
    "nome": "Adrenalina Pura TV (720p)",
    "logo": "https://i.imgur.com/Pvid2iH.png",
    "url": "https://jmp2.uk/plu-61b793ccf571b80007b7a610.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "afghan-nobel-movies-720p-",
    "nome": "Afghan Nobel Movies (720p)",
    "logo": "https://i.ibb.co/zfdbVSm/logo-1.png",
    "url": "https://live.relentlessinnovations.net:1936/afghannobel/afghannobel/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "aflam-1080p-",
    "nome": "Aflam (1080p)",
    "logo": "https://i.imgur.com/cTLj7Yt.png",
    "url": "https://shd-amg-fast.edgenextcdn.net/tx001/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "afra-film",
    "nome": "Afra Film",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23e50914%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EAFRA%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EFILM%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "https://afrafhls.wns.live/hls/stream.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "alien-nation-by-dust-1080p-",
    "nome": "Alien Nation by DUST (1080p)",
    "logo": "https://i.imgur.com/FxYhME9.png",
    "url": "https://dqi7ayt2o24fn.cloudfront.net/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "all-time-movies-576p-",
    "nome": "All Time Movies (576p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ALL_TIME_MOVIES/images/LOGO_HD/image.png",
    "url": "https://tvsen6.aynaott.com/a2cKGQtB/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "allo-cine-1080p-",
    "nome": "Allo Cine (1080p)",
    "logo": "https://raw.githubusercontent.com/songwenhui239/Songwenhui239/refs/heads/main/Allo%20Cine.jpeg",
    "url": "https://d1yl6bf4hrzbr0.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-5km3zs4zs9sp0/allo.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "alpha-cinema-1080p-",
    "nome": "alpha Cinema (1080p)",
    "logo": "https://i.imgur.com/146OgfU.png",
    "url": "https://live.15plusmg.ru/memfs/b389173a-df4e-4171-8904-e249893e71eb.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Comedy;Family;Movies"
  },
  {
    "id": "alterna-tv-720p-not-24-7-",
    "nome": "Alterna TV (720p) [Not 24/7]",
    "logo": "https://tv.alterna.ar/alternatv.png",
    "url": "https://tv.alterna.ar/stream/hls/live.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Culture;Documentary;Entertainment;General;Movies;Music"
  },
  {
    "id": "amc-720p-",
    "nome": "AMC (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://23.239.31.26:8989/amc/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-east-720p-",
    "nome": "AMC East (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://190.11.225.124:5000/live/amc_hd/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-europe",
    "nome": "AMC Europe",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "https://dokagents.site/live/amc/mono.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-europe-bulgary-576p-",
    "nome": "AMC Europe Bulgary (576p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://hls127.freeott.top:8080/BG_AMC/video.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-europe-czech-republic",
    "nome": "AMC Europe Czech Republic",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://88.212.15.19/live/test_amc_25p/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-europe-hungary",
    "nome": "AMC Europe Hungary",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://88.212.15.19/live/amc_hun/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-europe-romania",
    "nome": "AMC Europe Romania",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "https://iron1.jarvisx1.cfd/amece/usergenrx3oq1kr.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-latin-america-1080p-",
    "nome": "AMC Latin America (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://15.204.246.24:8080/AMCHD/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-latin-america-1080p--1",
    "nome": "AMC Latin America (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://45.171.108.253:8888/AMC/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "amc-latin-america-brazil-720p-",
    "nome": "AMC Latin America Brazil (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/AMC_logo_2019.svg/960px-AMC_logo_2019.svg.png",
    "url": "http://170.83.49.66:8083/AMCHD/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "american-horrors-480p-",
    "nome": "American Horrors (480p)",
    "logo": "https://image.roku.com/developer_channels/prod/16f5571a82819e8992a748c70b256cbe63105f4b546b73d129668dc2cb701d91.png",
    "url": "http://107.167.7.162:8081/playlist/amhor/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "armenia-premium-720p-",
    "nome": "Armenia Premium (720p)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%23e50914%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EARMENIA%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%23ffd100%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3EPREMIUM%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "http://stream.mcquack.net/123/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "artflix-movie-classics-720p-",
    "nome": "Artflix Movie Classics (720p)",
    "logo": "https://i.imgur.com/5pOZQB4.png",
    "url": "https://amogonetworx-artflix-1-nl.samsung.wurl.tv/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Classic;Movies"
  },
  {
    "id": "asianet-movies-hd-720p-",
    "nome": "Asianet Movies HD (720p)",
    "logo": "https://i.imgur.com/cps67hs.png",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:asianetmovies1.smil/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "aurora-media-films-720p-",
    "nome": "Aurora Media Films (720p)",
    "logo": "https://i.imgur.com/DVC5w6H.png",
    "url": "https://cdn.streamhispanatv.net:3417/live/auroramflive.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "avi-rewind-1080p-",
    "nome": "AVI Rewind (1080p)",
    "logo": "https://zplay.cl/LogosV2/AVIREWINDS_NEW.png",
    "url": "http://45.70.201.81:8000/play/a010/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-720p-",
    "nome": "AXN (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://170.83.16.50/AXN/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn",
    "nome": "AXN",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://znty.dyndns.org:5010/hls/axn.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-adria",
    "nome": "AXN Adria",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://5.57.74.130:8000/play/a0at/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-asia-taiwan-1080p-",
    "nome": "AXN Asia Taiwan (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://125.227.210.55:4050/VideoInput/play.ts",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies;Series"
  },
  {
    "id": "axn-black-576p-",
    "nome": "AXN Black (576p)",
    "logo": "https://i.imgur.com/Peo1QiZ.png",
    "url": "http://hls127.freeott.top:8080/BG_AXN_Black/video.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-black-czech-republic",
    "nome": "AXN Black Czech Republic",
    "logo": "https://i.imgur.com/Peo1QiZ.png",
    "url": "http://88.212.15.19/live/test_black/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-black-poland-576p-",
    "nome": "AXN Black Poland (576p)",
    "logo": "https://i.imgur.com/Peo1QiZ.png",
    "url": "http://185.227.34.179:8080/axn-black/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-black-romania",
    "nome": "AXN Black Romania",
    "logo": "https://i.imgur.com/Peo1QiZ.png",
    "url": "https://saruman1.tharen1.cfd/axyblack/usergenrxi6s93hs2.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-cee",
    "nome": "AXN CEE",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://88.212.15.19/live/axn_hun/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-cee-bulgary",
    "nome": "AXN CEE Bulgary",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://85.11.144.9:4222/AXN",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-cee-czech-republic",
    "nome": "AXN CEE Czech Republic",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://88.212.15.19/live/test_axn/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-cee-romania",
    "nome": "AXN CEE Romania",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "https://cronos.mangora1.cfd/axy/usergend3h5jkc9rnd.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-crime",
    "nome": "AXN Crime",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/AXN_Crime_-_Logo.png/960px-AXN_Crime_-_Logo.png",
    "url": "http://88.212.15.19/live/viasat_film/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-latin-america-1080p-",
    "nome": "AXN Latin America (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://138.121.15.230:9002/AXN/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-latin-america-1080p--1",
    "nome": "AXN Latin America (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://15.204.246.24:8080/AXNHD/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-latin-america-chile-1080p-",
    "nome": "AXN Latin America Chile (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "https://cdn1tlinkgo.tlink.cl/axnhd/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-latin-america-mexico",
    "nome": "AXN Latin America Mexico",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://190.11.225.124:5000/live/axn_hd/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-latin-america-south",
    "nome": "AXN Latin America South",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png",
    "url": "http://45.228.235.116:8000/play/a0iy/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-movies-720p-",
    "nome": "AXN Movies (720p)",
    "logo": "https://i.imgur.com/tJQckal.png",
    "url": "http://50.7.120.34:8080/AXN_BLACK/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "axn-poland-1080p-",
    "nome": "AXN Poland (1080p)",
    "logo": "https://i.imgur.com/i5wOhkf.png",
    "url": "https://polska.hach.workers.dev/14850.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "az-cinema-1080p-",
    "nome": "Az Cinema (1080p)",
    "logo": "https://i.imgur.com/B5UN7C8.png",
    "url": "https://cdn1tlinkgo.tlink.cl/azcinema/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "b4u-bhojpuri-1080p-",
    "nome": "B4U Bhojpuri (1080p)",
    "logo": "https://i.imgur.com/NwOQUDp.png",
    "url": "https://cdnb4u.wiseplayout.com/B4U_Bhojpuri/master.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "b4u-kadak-576p-",
    "nome": "B4U Kadak (576p)",
    "logo": "https://dtil.tmsimg.com/assets/s142695_ld_h15_aa.png?lock=720x540",
    "url": "https://streams.tangotv.in/B4UKADAK/ORIGIN/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "b4u-movies-576p-",
    "nome": "B4U Movies (576p)",
    "logo": "https://i.imgur.com/M9kMFJl.png",
    "url": "https://streams.tangotv.in/B4UMOVIES/ORIGIN/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "battlestar-galactica",
    "nome": "Battlestar Galactica",
    "logo": "https://images.pluto.tv/channels/69d7ebff029c431826bd328e/colorLogoPNG_1776982986391.png",
    "url": "https://jmp2.uk/plu-69d7ebff029c431826bd328e.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies;Series"
  },
  {
    "id": "bein-box-office-1",
    "nome": "beIN Box Office 1",
    "logo": "https://i.imgur.com/MGrJFVN.png",
    "url": "https://nord.ayakkabiparti.lol/box1/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bein-box-office-2",
    "nome": "beIN Box Office 2",
    "logo": "https://i.imgur.com/Kg7oOcO.png",
    "url": "https://nord.ayakkabiparti.lol/box2/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bein-box-office-3",
    "nome": "beIN Box Office 3",
    "logo": "https://i.imgur.com/5NZur1S.png",
    "url": "https://nord.ayakkabiparti.lol/box3/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bein-movies-stars",
    "nome": "beIN Movies Stars",
    "logo": "https://i.imgur.com/eryPkrT.png",
    "url": "https://nord.ayakkabiparti.lol/bsaction1/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bein-movies-turk",
    "nome": "beIN Movies Turk",
    "logo": "https://i.imgur.com/nw8Sa2z.png",
    "url": "https://nord.ayakkabiparti.lol/bsturk/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bet-cinema",
    "nome": "BET Cinema",
    "logo": "https://images.pluto.tv/channels/58af4c093a41ca9d4ecabe96/colorLogoPNG_1759338280891.png",
    "url": "https://jmp2.uk/plu-58af4c093a41ca9d4ecabe96.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bet-comedy-movies",
    "nome": "BET Comedy Movies",
    "logo": "https://images.pluto.tv/channels/68c32d88f56983aba40052bd/colorLogoPNG_1759246622596.png",
    "url": "https://jmp2.uk/plu-68c32d88f56983aba40052bd.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bet-visionaries",
    "nome": "BET Visionaries",
    "logo": "https://images.pluto.tv/channels/663946c1b18d700008d9c168/colorLogoPNG_1759338795452.png",
    "url": "https://jmp2.uk/plu-663946c1b18d700008d9c168.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "bhojpuri-cinema-720p-",
    "nome": "Bhojpuri Cinema (720p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_BHOJPURI_CINEMA/images/LOGO_HD/image.png",
    "url": "https://live-bhojpuri.akamaized.net/liveabr/playlist.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "biz-cinema-1080p-",
    "nome": "BIZ Cinema (1080p)",
    "logo": "https://biztv.uz/static/media/biz-cinema.286b83dc.png",
    "url": "https://fl.biztv.media/cinema_720_EMfSyXgoRdiIHgldXTZICucKTIeCKO/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "blokbaster-hd-1080p-",
    "nome": "Blokbaster HD (1080p)",
    "logo": "https://i.imgur.com/KcOi4Os.png",
    "url": "http://stream.mcquack.net/364/index.m3u8",
    "categoria": "Filmes",
    "pais": "Global",
    "rede": "Telecine",
    "grupo": "Movies"
  },
  {
    "id": "2gb-sydney-1080p-",
    "nome": "2GB Sydney (1080p)",
    "logo": "https://i.ibb.co/jwM8DFG/2GB-1.png",
    "url": "https://2gblive.akamaized.net/hls/live/2033805/2GB/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "3aw-melbourne-1080p-",
    "nome": "3AW Melbourne (1080p)",
    "logo": "https://i.imgur.com/Z4MdB0S.png",
    "url": "https://3awlive.akamaized.net/hls/live/2032295/3AW/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "3cat-exclusiu-1-1080p-geo-blocked-",
    "nome": "3Cat Exclusiu 1 (1080p) [Geo-blocked]",
    "logo": "https://i.imgur.com/YQvLPT1.png",
    "url": "https://directes-tv-cat.3catdirectes.cat/live-content/oca1-hls/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News;Public"
  },
  {
    "id": "3cat-exclusiu-2-1080p-geo-blocked-",
    "nome": "3Cat Exclusiu 2 (1080p) [Geo-blocked]",
    "logo": "https://i.imgur.com/YQvLPT1.png",
    "url": "https://directes-tv-cat.3catdirectes.cat/live-content/oca2-hls/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News;Public"
  },
  {
    "id": "3cat-exclusiu-3-1080p-geo-blocked-",
    "nome": "3Cat Exclusiu 3 (1080p) [Geo-blocked]",
    "logo": "https://i.imgur.com/YQvLPT1.png",
    "url": "https://directes-tv-cat.3catdirectes.cat/live-content/oca3-hls/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News;Public"
  },
  {
    "id": "3catinfo-1080p-",
    "nome": "3CatInfo (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/3CatInfo_logo.svg/960px-3CatInfo_logo.svg.png",
    "url": "https://directes-tv-int.3catdirectes.cat/live-origin/canal324-hls/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News;Public"
  },
  {
    "id": "4dm-snoticias-tv-1080p-not-24-7-",
    "nome": "4DmásNoticias TV (1080p) [Not 24/7]",
    "logo": "https://i.ibb.co/1fb5BtN/unnamed.png",
    "url": "https://rds3.desdeparaguay.net/4dmasnoticiastv/4dmasnoticiastv/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "4tv-news-576p-",
    "nome": "4TV News (576p)",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/4_TV.png",
    "url": "https://cdn-4.pishow.tv/live/1007/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "6pr-perth-1080p-",
    "nome": "6PR Perth (1080p)",
    "logo": "https://i.imgur.com/Q9iCxg1.png",
    "url": "https://6prlive.akamaized.net/hls/live/2033806/6PR/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "6-tv-telugu-576p-",
    "nome": "6 TV Telugu (576p)",
    "logo": "https://i.imgur.com/l3EcRnZ.png",
    "url": "https://yuppparoriglin.akamaized.net/181224/smil:6tv.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "7-info",
    "nome": "7 Info",
    "logo": "https://i.imgur.com/jcl1nNR.png",
    "url": "https://video1.getstreamhosting.com:1936/8042/8042/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "7-news-720p-",
    "nome": "7 News (720p)",
    "logo": "https://i.imgur.com/PTl92P5.png",
    "url": "https://sscsott.com/7news/live/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "10-tv-720p-",
    "nome": "10 TV (720p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_10TV/images/LOGO_HD/image.png",
    "url": "https://mumbai-edge.smartplaytv.in/10TV/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "13-siam-thai-1080p-",
    "nome": "13 Siam Thai (1080p)",
    "logo": "https://i.imgur.com/FvEp1S2.png",
    "url": "https://live.x2.co.th/live/13livetv-th.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "22scope-news-1080p-",
    "nome": "22Scope News (1080p)",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/22Scope_News.png",
    "url": "https://thelegitpro.in/HDlive/22scope/index.fmp4.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "24-7-canal-de-noticias",
    "nome": "24/7 Canal de Noticias",
    "logo": "https://i.imgur.com/4hDCB1M.png",
    "url": "https://panel.host-live.com:19360/cn247tv/cn247tv.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "24-horas-1080p-",
    "nome": "24 Horas (1080p)",
    "logo": "https://i.imgur.com/CEE9zPe.png",
    "url": "http://cdn1tlinkgo.tlink.cl/24horashd/mono.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "24-horas-canarias-1080p-",
    "nome": "24 Horas Canarias (1080p)",
    "logo": "https://i.ibb.co/21sXZ3GT/24h.png",
    "url": "http://185.47.212.25:8080/24h_HD/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News;Public"
  },
  {
    "id": "24-kanal-720p-",
    "nome": "24 Kanal (720p)",
    "logo": "https://pbs.twimg.com/profile_images/1498285886714298374/EMSJzC-0_400x400.jpg",
    "url": "https://cdn15.live-tv.cloud/ua_infinitas_tv/news24-abr/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "24kz-576p-",
    "nome": "24KZ (576p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/24KZ_logo.svg/1280px-24KZ_logo.svg.png",
    "url": "https://fs.uplink.kz/24KZ/mono.m3u8?token=onlinetv",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "24-news-576p-",
    "nome": "24 News (576p)",
    "logo": "https://sund-images.sunnxt.com/202222/300x300_24News_202222_d63feca0-79ae-47ea-b75a-66c17d456f4c.png",
    "url": "https://mumt07.tangotv.in/zHjX9OFlTWENTYFOURNEWS/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "24-news-hd",
    "nome": "24 News HD",
    "logo": "https://upload.wikimedia.org/wikipedia/en/9/93/24_News_HD_Logo.png",
    "url": "https://cdn4.mjunoon.tv:8087/streamtest/146M/chunks.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "24-1080p-",
    "nome": "24 Канал (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/24_Group_Ukraine_04.png/960px-24_Group_Ukraine_04.png",
    "url": "https://streamvideol1.luxnet.ua/news24/smil:news24.stream.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "30a-georgia-hollywood-review-tv-720p-",
    "nome": "30A Georgia Hollywood Review TV (720p)",
    "logo": "https://images.axios.com/JiG3RuYBwpU_WZFeU6HHjt03FAU=/111x0:1191x1080/320x320/2023/11/09/1699558891265.jpg",
    "url": "https://30a-tv.com/gh.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Entertainment;News"
  },
  {
    "id": "30a-lionel-nation-tv",
    "nome": "30A Lionel Nation TV",
    "logo": "https://m.media-amazon.com/images/I/71dgsQwVcNL.png",
    "url": "https://30a-tv.com/ln.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "30a-loomered-tv",
    "nome": "30A Loomered TV",
    "logo": "https://cbs12.com/resources/media/0c1ecad8-fb09-4bb2-beaa-fc561dfe624a-small21x9_LoomerStill.jpg?1603419052801",
    "url": "https://30a-tv.com/loomer.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Documentary;News"
  },
  {
    "id": "92-news-hd-720p-",
    "nome": "92 News HD (720p)",
    "logo": "https://i.imgur.com/eqKrL9S.png",
    "url": "http://92news.vdn.dstreamone.net/92newshd/92hd/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "99tv-720p-",
    "nome": "99TV (720p)",
    "logo": "https://i.imgur.com/dZA4gel.png",
    "url": "https://cdn-1.pishow.tv/live/1211/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "100-news-576p-",
    "nome": "100% News (576p)",
    "logo": "https://i.imgur.com/bSXKdK5.png",
    "url": "http://85.238.112.40:8810/hls_sec/239.33.16.32-.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "Business;News"
  },
  {
    "id": "101tv-malaga",
    "nome": "101tv Malaga",
    "logo": "https://i.imgur.com/GzI3RC4.png",
    "url": "https://liveingesta318.cdnmedia.tv/101weblive/smil:malaga.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "360-1080p-",
    "nome": "360° Новости (1080p)",
    "logo": "https://i.imgur.com/YXDeX8q.png",
    "url": "https://live-vgtrksmotrim.cdnvideo.ru/vgtrksmotrim/smotrim-live-03-srt.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "360-tv-720p-not-24-7-",
    "nome": "360 TV (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/agn47sQ.png",
    "url": "https://turkmedya-live.ercdn.net/tv360/tv360.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "365-news",
    "nome": "365 News",
    "logo": "https://i.imgur.com/8I6PWof.png",
    "url": "https://cdn4.mjunoon.tv:8087/streamtest/140M/chunks.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "-24-1080p-",
    "nome": ":24 (1080p)",
    "logo": "https://i.imgur.com/tTCuczU.png",
    "url": "http://88.212.15.27/live/test_trojka_25p/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "a24-720p-",
    "nome": "A24 (720p)",
    "logo": "https://i.imgur.com/LnXQkIU.png",
    "url": "https://g5.vxral-slo.transport.edge-access.net/a12/ngrp:a24-100056_all/playlist.m3u8?sense=true",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "a-haber-1080p-",
    "nome": "A Haber (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Ahaber_Logo.png",
    "url": "https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/ahaber/ahaber.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "aaj-ki-khabar-1080p-",
    "nome": "Aaj Ki Khabar (1080p)",
    "logo": "https://m.media-amazon.com/images/I/71q8sOMPwHL.png",
    "url": "https://stream.ottlive.co.in/aajkikhabar/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "aaj-news-576p-",
    "nome": "Aaj News (576p)",
    "logo": "https://i.imgur.com/VNGnHYz.png",
    "url": "http://115.42.65.142:9981/stream/channelid/750987367",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "aaj-tak-1080p-",
    "nome": "Aaj Tak (1080p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_AAJ_TAK/images/LOGO_HD/image.png",
    "url": "http://103.213.31.109:90/AajtakHD/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "aaj-tak-hd-1080p-",
    "nome": "Aaj Tak HD (1080p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_AAJ_TAK/images/LOGO_HD/image.png",
    "url": "https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abante-tv-1080p-",
    "nome": "Abante TV (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Abante_masthead.svg",
    "url": "https://amg19223-amg19223c12-amgplt0352.playout.now3.amagi.tv/playlist/amg19223-amg19223c12-amgplt0352/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abb-takk-576p-",
    "nome": "Abb Takk (576p)",
    "logo": "https://i.imgur.com/D6IHRrP.png",
    "url": "http://115.42.65.142:9981/stream/channelid/852828604",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-wplg-dt1-miami-fl-720p-",
    "nome": "ABC (WPLG-DT1) Miami FL (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/WPLG_Local_10_%282014%2C_without_ABC_logo%29.svg/500px-WPLG_Local_10_%282014%2C_without_ABC_logo%29.svg.png",
    "url": "https://pubads.g.doubleclick.net/ssai/event/tQD6w9OJQVOobcyV3Dammw/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-720p-",
    "nome": "ABC News (720p)",
    "logo": "https://i.imgur.com/BrW7gk8.png",
    "url": "https://abc-news-dmd-streams-1.akamaized.net/out/v1/701126012d044971b3fa89406a440133/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-720p-",
    "nome": "ABC News Live (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://jmp2.uk/plu-6508be683a0d700008c534e4.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-1-720p-",
    "nome": "ABC News Live 1 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023560/abcnewshudson1/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-2-720p-",
    "nome": "ABC News Live 2 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023561/abcnewshudson2/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-3-720p-",
    "nome": "ABC News Live 3 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023562/abcnewshudson3/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-4-720p-",
    "nome": "ABC News Live 4 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023563/abcnewshudson4/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-5-720p-",
    "nome": "ABC News Live 5 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023564/abcnewshudson5/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-6-720p-",
    "nome": "ABC News Live 6 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023565/abcnewshudson6/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-7-720p-",
    "nome": "ABC News Live 7 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023566/abcnewshudson7/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-8-720p-",
    "nome": "ABC News Live 8 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023567/abcnewshudson8/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-9-720p-",
    "nome": "ABC News Live 9 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023568/abcnewshudson9/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abc-news-live-10-720p-",
    "nome": "ABC News Live 10 (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png",
    "url": "https://abcnews-streams.akamaized.net/hls/live/2023569/abcnewshudson10/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abn-andhra-jyoti-720p-",
    "nome": "ABN Andhra Jyoti (720p)",
    "logo": "https://dtil.tmsimg.com/assets/s142517_ld_h15_aa.png?lock=720x540",
    "url": "https://mumbai-edge.smartplaytv.in/ABNAJ/index.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abn-news-1080p-",
    "nome": "ABN News (1080p)",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2218%22%20fill%3D%22%230b1d3a%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2248%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2215%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%3EABN%3C%2Ftext%3E%3Ctext%20x%3D%2250%22%20y%3D%2272%22%20font-family%3D%22system-ui%2C-apple-system%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%229%22%20fill%3D%22%2300b4d8%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ENEWS%3C%2Ftext%3E%3C%2Fsvg%3E",
    "url": "http://115.42.65.142:9981/stream/channelid/966869781",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abp-ananda-1080p-",
    "nome": "ABP Ananda (1080p)",
    "logo": "https://dtil.tmsimg.com/assets/s142518_ld_h15_aa.png?lock=720x540",
    "url": "https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/ananda-livetv/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abp-asmita-1080p-",
    "nome": "ABP Asmita (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/ABP_Asmita_logo.svg/500px-ABP_Asmita_logo.svg.png",
    "url": "https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/asmita-livetv/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abp-ganga-1080p-",
    "nome": "ABP Ganga (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/ABP_Ganga.svg/500px-ABP_Ganga.svg.png",
    "url": "https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/ganga-livetv/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abp-majha-360p-",
    "nome": "ABP Majha (360p)",
    "logo": "https://dtil.tmsimg.com/assets/s142521_ld_h15_aa.png?lock=720x540",
    "url": "https://yupprestreamliveus.akamaized.net/vglive-sk-355289/majha/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "abp-news-1080p-",
    "nome": "ABP News (1080p)",
    "logo": "https://dtil.tmsimg.com/assets/s158138_ld_h15_aa.png?lock=720x540",
    "url": "https://d1rc86nwwc9fag.cloudfront.net/vglive-sk-472500/abpnews/master.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "acento-tv",
    "nome": "Acento TV",
    "logo": "https://i.imgur.com/jhiZfHf.png",
    "url": "https://acentotv01.streamprolive.com/hls/live.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "actualidad-360",
    "nome": "Actualidad 360",
    "logo": "https://i.imgur.com/3YeTu0n.png",
    "url": "https://jmp2.uk/plu-67517fae5534bb0008187997.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "acustik-tv",
    "nome": "Acustik TV",
    "logo": "https://i.imgur.com/dhiNIng.png",
    "url": "https://s5.mexside.net:1936/clientetv/clientetv/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "Global",
    "rede": "Geral",
    "grupo": "News"
  },
  {
    "id": "1hd-music-television-1080p-",
    "nome": "1HD Music Television (1080p)",
    "logo": "https://i.imgur.com/4Ww7CsR.png",
    "url": "https://stream8.cinerama.uz/1267/tracks-v1a1/mono.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "3abn-praise-him-music-network",
    "nome": "3ABN Praise Him Music Network",
    "logo": "https://i.imgur.com/iBcqT8L.png",
    "url": "https://3abn.bozztv.com/3abn1/PraiseHim/smil:PraiseHim.smil/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music;Religious"
  },
  {
    "id": "4ever-music-1080p-",
    "nome": "4ever Music (1080p)",
    "logo": "https://i.imgur.com/UJ5oaeU.png",
    "url": "http://stream.mcquack.net/257/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "4-fun-tv-576i-not-24-7-",
    "nome": "4 Fun TV (576i) [Not 24/7]",
    "logo": "https://i.imgur.com/rI1wo2l.png",
    "url": "https://stream.4fun.tv:8888/hls/4f_high/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "4-kurd",
    "nome": "4 Kurd",
    "logo": "https://www.aparatchi.com/images/chanells-logo/4kurd.svg",
    "url": "https://4kuhls.persiana.live/hls/stream.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "7-radiovisione-720p-",
    "nome": "7 RadioVisione (720p)",
    "logo": "https://radio7note.com/img/favicon/android-icon-192x192.png",
    "url": "https://stream10.xdevel.com/video1s976543-1932/stream/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "7s-music-576p-",
    "nome": "7S Music (576p)",
    "logo": "https://i.imgur.com/zDiIhdN.png",
    "url": "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "8xm-576p-",
    "nome": "8XM (576p)",
    "logo": "https://i.imgur.com/KLrfKRn.png",
    "url": "http://115.42.65.142:9981/stream/channelid/582886861",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "8xm-hd",
    "nome": "8XM HD",
    "logo": "https://i.ibb.co/Kc0xHyBb/8XM-Logo.png",
    "url": "https://cdn4.mjunoon.tv:8087/streamtest/135M/chunks.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "9x-jalwa-1080p-",
    "nome": "9X Jalwa (1080p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9X_JALWA/images/LOGO_HD/image.png",
    "url": "https://wiselp.wiseplayout.com/9X_Jalwa/master.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "9x-jhakaas-1080p-",
    "nome": "9X Jhakaas (1080p)",
    "logo": "https://dtil.tmsimg.com/assets/s90012_ld_h15_aa.png?lock=720x540",
    "url": "https://amg01281-9xmediapvtltd-9xjhakaas-samsungin-ci2cs.amagi.tv/playlist/amg01281-9xmediapvtltd-9xjhakaas-samsungin/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "9x-tashan-1080p-",
    "nome": "9X Tashan (1080p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9X_TASHAN/images/LOGO_HD/image.png",
    "url": "https://amg01281-9xmediapvtltd-9xtashan-samsungin-xz1sd.amagi.tv/playlist/amg01281-9xmediapvtltd-9xtashan-samsungin/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "9xm-1080p-",
    "nome": "9XM (1080p)",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9XM/images/LOGO_HD/image.png",
    "url": "https://9xjio.wiseplayout.com/9XM/master.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "13-festival-1080p-",
    "nome": "13 Festival (1080p)",
    "logo": "https://i.imgur.com/Ymk6j5o.png",
    "url": "https://origin.dpsgo.com/ssai/event/Nftd0fM2SXasfDlRphvUsg/master.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "15-music-1080p-",
    "nome": "15+ Music (1080p)",
    "logo": "https://i.imgur.com/kj21hwd.png",
    "url": "https://live.15plusmg.ru/memfs/ce3366b1-bf25-4e24-96bb-1adf0d44bd3d.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "30a-music-720p-",
    "nome": "30A Music (720p)",
    "logo": "https://i.imgur.com/gNWg9tl.png",
    "url": "https://30a-tv.com/music.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "51-radio-tv-480p-geo-blocked-",
    "nome": "51 Radio TV (480p) [Geo-blocked]",
    "logo": "https://www.51news.it/images/loghi/logo_tv_radio_51news.png",
    "url": "http://wms.shared.streamshow.it/canale51/canale51/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "70-80-tv-1080p-",
    "nome": "70-80 TV (1080P)",
    "logo": "https://i.imgur.com/y4kNV3Q.png",
    "url": "https://585b674743bbb.streamlock.net/9050/9050/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "88-stereo-720p-not-24-7-",
    "nome": "88 Stereo (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/i3YwORV.png",
    "url": "http://k3.usastreams.com/CableLatino/88stereo/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "98-1-pearl-fm-720p-",
    "nome": "98.1 Pearl FM (720p)",
    "logo": "https://i.imgur.com/GY750xh.jpg",
    "url": "https://live2.tensila.com/pearl-v-1.pearlfm/hls/live/mystream.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "360tunebox-1080p-",
    "nome": "360TuneBox (1080p)",
    "logo": "https://i.imgur.com/1Fyezng.png",
    "url": "https://dash3.antik.sk/live/test_360_tunebox_medium_atk/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "-viva-latino-1080p-",
    "nome": "¡Viva Latino! (1080p)",
    "logo": "https://i.imgur.com/KRakHAq.png",
    "url": "http://stream.mcquack.net/285/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "a2i-music-720p-not-24-7-",
    "nome": "A2i Music (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/Fykhzxh.jpg",
    "url": "https://stream.sen-gt.com/A2iMusic/myStream/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "aaryaa-tv-1080p-",
    "nome": "Aaryaa TV (1080p)",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/aryatvtamil.png",
    "url": "https://stream.ottlive.co.in/aryatvtamil/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "abdulmajeed-abdullah-1080p-",
    "nome": "Abdulmajeed Abdullah (1080p)",
    "logo": "https://assets.mbcmood.com/channels/1720184087Abdullah%20Majeed%20Abdullah%20banner.png",
    "url": "https://d2hng5r56zpsbw.cloudfront.net/out/v1/9c4c990f44bb4767bb46271f326dd574/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "ace-country-radio-kpvm-ld",
    "nome": "ACE Country Radio KPVM-LD",
    "logo": "https://i.imgur.com/iPtuku6.png",
    "url": "https://2-fss-1.streamhoster.com/pl_122/206858-4412960-1/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "activa-tv-720p-",
    "nome": "Activa TV (720p)",
    "logo": "https://i.imgur.com/VCUZKiw.png",
    "url": "https://streamtv.mediasector.es/hls/activatv/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "acw-ug-tv-480p-",
    "nome": "ACW UG TV (480p)",
    "logo": "https://i.imgur.com/8pzEmcJ.jpeg",
    "url": "https://live.acwugtv.com/hls/stream.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "General;Music"
  },
  {
    "id": "adria-music-television",
    "nome": "Adria Music Television",
    "logo": "https://i.imgur.com/QoDpnKg.png",
    "url": "https://adriaapp.b-cdn.net/1080p/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "ae-radio-tv-720p-not-24-7-",
    "nome": "AE Radio TV (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/425dj2i.jpeg",
    "url": "https://tls-cl.cdnz.cl/aeradio/live/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "afn-tv",
    "nome": "AFN TV",
    "logo": "https://i.imgur.com/LctanF8.png",
    "url": "https://bozztv.com/1gbw5/tintv2/tintv2/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "afrobeats-1080p-",
    "nome": "Afrobeats (1080p)",
    "logo": "https://i.imgur.com/232ndRK.png",
    "url": "https://stream.ecable.tv/afrobeats/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "aghani-aghani-tv-1080p-",
    "nome": "Aghani Aghani TV (1080p)",
    "logo": "https://i.imgur.com/o6HSfNg.png",
    "url": "https://cdn.streamlane.tv/hls/aghanitv/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "albkanale-music-tv-1080p-",
    "nome": "AlbKanale Music TV (1080p)",
    "logo": "https://i.imgur.com/JdKxscs.png",
    "url": "https://albportal.net/albkanalemusic.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "alcance-fm-play-tv",
    "nome": "Alcance FM PLAY TV",
    "logo": "https://i.imgur.com/ymcWecA.png",
    "url": "https://video.wilohosting.com:19360/alcancefmtv/alcancefmtv.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "alegria-tv-720p-",
    "nome": "Alegria TV (720p)",
    "logo": "https://i.imgur.com/MIBZ2pZ.png",
    "url": "https://lbgo.bozztv.com/ssh101/ssh101/confirmatv/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "amc-1080p-",
    "nome": "AMC (1080p)",
    "logo": "https://i.imgur.com/yj8RNnG.png",
    "url": "https://amchls.wns.live/hls/stream.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "amedia-1-576p-",
    "nome": "Amedia 1 (576p)",
    "logo": "https://i.imgur.com/2pAHdAi.png",
    "url": "http://31.148.48.15/A1/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "amusic-channel-720p-",
    "nome": "AMusic Channel (720p)",
    "logo": "https://i.imgur.com/06zuf64.png",
    "url": "http://mn-nl.mncdn.com/amusictv/amusicsrt.stream/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "andina-rtv-720p-",
    "nome": "Andina RTV (720p)",
    "logo": "https://i.imgur.com/KoQPpVh.jpeg",
    "url": "https://live-evg8.tv360.bitel.com.pe/bitel/andinatvSRT/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "andy-haryana-576p-",
    "nome": "Andy Haryana (576p)",
    "logo": "https://i.imgur.com/rmCBD3e.png",
    "url": "https://mumt03.tangotv.in/Dsly5z3HANDYHARYANA/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Culture;Music"
  },
  {
    "id": "antenne-kaernten-720p-",
    "nome": "Antenne Kaernten (720p)",
    "logo": "https://i.imgur.com/nUKFDsb.jpeg",
    "url": "https://60efd7a2b4d02.streamlock.net/a_kaernten/ngrp:livestream_all/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "antenne-steiermark-720p-",
    "nome": "Antenne Steiermark (720p)",
    "logo": "https://i.imgur.com/qnappvd.jpeg",
    "url": "https://60efd7a2b4d02.streamlock.net/a_steiermark/ngrp:livestream_all/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "antenne-vorarlberg-720p-not-24-7-",
    "nome": "Antenne Vorarlberg (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/GW750Zc.png",
    "url": "https://5857db5306b83.streamlock.net/antennevorarlberg-live/_definst_/mp4:livestream/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "arabica-tv-720p-",
    "nome": "Arabica TV (720p)",
    "logo": "https://i.imgur.com/sTOoDy1.png",
    "url": "http://istream.binarywaves.com:8081/hls/arabica/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "ary-musik-1080p-",
    "nome": "ARY Musik (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/en/b/bb/ARY_Musik_logo.png",
    "url": "https://arymusik.aryzap.com/3fd38b2c62d0c3bbd74aedabb533c03a/6459fa78/v1/01847ac7a4930b8ed5aa6ed04aba/01847ac8f5f70b8ed5aa6ed04abd/main.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "atn-music-360p-",
    "nome": "ATN Music (360p)",
    "logo": "https://www.jagobd.com/wp-content/uploads/2015/12/atnmusic.jpg?x50681",
    "url": "https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI/atnmusic.stream/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "atomic-academy-tv-480p-",
    "nome": "Atomic Academy TV (480p)",
    "logo": "https://i.imgur.com/ZbrDIbZ.png",
    "url": "https://atomic.streamnet.ro/academia.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "atomic-tv-360p-",
    "nome": "Atomic TV (360p)",
    "logo": "https://i.imgur.com/O4uI0Uy.png",
    "url": "https://atomic.streamnet.ro/atomictv.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "audiokiss-1080p-",
    "nome": "Audiokiss (1080p)",
    "logo": "https://www.audiokiss.com/audiokiss/wp-content/uploads/sites/4/2021/02/Audio_kiss800-768x405.png",
    "url": "https://master.tucableip.com/audiokisstv/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "avang-tv-1080p-",
    "nome": "Avang TV (1080p)",
    "logo": "https://i.imgur.com/3I1n7fO.png",
    "url": "https://hls.avang.live/hls/stream.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "axs-tv-720p-",
    "nome": "AXS TV (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/AXS_TV_logo.svg/960px-AXS_TV_logo.svg.png",
    "url": "http://23.239.31.26:8989/axstv/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "azahares-radio-multimedia-720p-",
    "nome": "Azahares Radio Multimedia (720p)",
    "logo": "https://i.imgur.com/g1BFoSs.png",
    "url": "https://streamyes.alsolnet.com/azaharesfm/live/playlist.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "b4u-music-576p-",
    "nome": "B4U Music (576p)",
    "logo": "https://dtil.tmsimg.com/assets/s158141_ld_h15_aa.png?lock=720x540",
    "url": "https://cdn-2.pishow.tv/live/415/master.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Music"
  },
  {
    "id": "baby-time-576p-",
    "nome": "Baby Time (576p)",
    "logo": "https://i.imgur.com/lW3WIBD.png",
    "url": "http://178.134.1.158:8081/babytime/index.m3u8",
    "categoria": "Músicas",
    "pais": "Global",
    "rede": "MTV",
    "grupo": "Kids;Music"
  },
  {
    "id": "adb-tv-1080p-",
    "nome": "ADB TV (1080p)",
    "logo": "https://i.ibb.co/HGfTJwt/ADBTV.jpg",
    "url": "https://live-tv.waytv.pt/adbtv/adbtv/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "angel-tv-portuguese-720p-",
    "nome": "Angel TV Portuguese (720p)",
    "logo": "https://i.imgur.com/qKLEGU7.png",
    "url": "https://janya-digimix.akamaized.net/vglive-sk-382409/portuese/ngrp:angelportuguese_all/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "artv-canal-parlamento-720p-not-24-7-",
    "nome": "ARTV Canal Parlamento (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/y00t9hr.png",
    "url": "https://playout172.livextend.cloud/liveiframe/_definst_/liveartvabr/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "axn-white-portugal-480p-",
    "nome": "AXN White Portugal (480p)",
    "logo": "https://i.imgur.com/47IKxmt.png",
    "url": "http://50.7.120.34:8080/AXN_WHITE/index.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "disney-channel-1080p-",
    "nome": "Disney Channel (1080p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/3/3d/2022_Disney_Channel_logo.svg",
    "url": "http://151.80.18.177:86/Disney_Channel_HD/index.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "euronews-portuguese-720p-",
    "nome": "Euronews Portuguese (720p)",
    "logo": "https://i.imgur.com/8t9mdg9.png",
    "url": "https://jmp2.uk/plu-619e6614c9d9650007a2b171.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "famatv-1080p-not-24-7-",
    "nome": "Famatv (1080p) [Not 24/7]",
    "logo": "https://i.ibb.co/tMmRp18/Fama-TV-cor-whitebg-hotizontal.jpg",
    "url": "https://tv2.fastcast4u.com:3310/live/famatvlive.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "fifa-portuguese-720p-",
    "nome": "FIFA+ Portuguese (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/FIFA%2B_(2025).svg/960px-FIFA%2B_(2025).svg.png",
    "url": "https://e3be9ac5.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/TEctYnJfRklGQVBsdXNQb3J0dWd1ZXNlX0hMUw/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "kto-504p-",
    "nome": "KTO (504p)",
    "logo": "https://i.imgur.com/EY6TsdV.png",
    "url": "http://145.239.5.177/354/index.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "kuriakos-cine-1080p-",
    "nome": "Kuriakos Cine (1080p)",
    "logo": "https://i.imgur.com/CZViCwB.jpg",
    "url": "https://w2.manasat.com/kcine/smil:kcine.smil/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "kuriakos-kids-1080p-",
    "nome": "Kuriakos Kids (1080p)",
    "logo": "https://i.imgur.com/SRX6EPY.png",
    "url": "https://w2.manasat.com/kkids/smil:kkids.smil/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "kuriakos-music-1080p-",
    "nome": "Kuriakos Music (1080p)",
    "logo": "https://i.imgur.com/Zl40NYi.jpg",
    "url": "http://195.23.211.179:1935/kmusic/smil:kmusic.smil/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "kuriakos-tv-1080p-",
    "nome": "Kuriakos TV (1080p)",
    "logo": "https://i.imgur.com/xdAW0D5.png",
    "url": "https://w1.manasat.com/ktv/smil:ktv.smil/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "man-church-online-1080p-not-24-7-",
    "nome": "Maná Church Online (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/FRDJSim.png",
    "url": "https://w2.manasat.com/church-online/smil:church-online.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "man-cirkev-online-1080p-not-24-7-",
    "nome": "Maná Cirkev Online (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/tYhXeRq.png",
    "url": "https://w2.manasat.com/cirkev-online/smil:cirkev-online.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "man-glise-online-1080p-not-24-7-",
    "nome": "Maná Église Online (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/xQYly8O.png",
    "url": "https://w2.manasat.com/eglise-online/smil:eglise-online.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "man-iglesia-online-1080p-not-24-7-",
    "nome": "Maná Iglesia Online (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/0IUvfcJ.png",
    "url": "https://w2.manasat.com/iglesia-online/smil:iglesia-online.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "man-igreja-online-1080p-not-24-7-",
    "nome": "Maná Igreja Online (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/0IUvfcJ.png",
    "url": "https://w1.manasat.com/igrejaonline/smil:igrejaonline.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "man-tserkov-onlayn-1080p-not-24-7-",
    "nome": "Maná Tserkov' Onlayn (1080p) [Not 24/7]",
    "logo": "https://i.imgur.com/PruXLqS.png",
    "url": "https://w2.manasat.com/tserkov-online/smil:tserkov-online.smil/playlist.m3u8",
    "categoria": "Notícias",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "mcm-top-1080p-",
    "nome": "MCM Top (1080p)",
    "logo": "https://i.imgur.com/EVtWQLd.png",
    "url": "http://89.33.29.118/MCM/index.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "npc-r-dio-e-tv-720p-",
    "nome": "NPC Rádio e TV (720p)",
    "logo": "https://i.imgur.com/mw1lYWE.png",
    "url": "https://stmv5.samcast.com.br/nasciparacantartv/nasciparacantartv/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "on-fm-720p-",
    "nome": "ON FM (720p)",
    "logo": "https://onfmwordpressfiles.ams3.digitaloceanspaces.com/wp-content/uploads/2023/03/17130121/logo-on-fm.png",
    "url": "https://5ce9406b73c33.streamlock.net/ONFM/livestream/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "porto-canal-720p-",
    "nome": "Porto Canal (720p)",
    "logo": "https://i.imgur.com/DwziwMY.png",
    "url": "https://pull-live-156-1.global.ssl.fastly.net/pc5865dc25400thmb-ea6bf03b14fa318f7133/smil:pc1-jhrgyuoqe5865db-68tkgb14fa318f7133f03.smil/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "r-dio-sines-720p-geo-blocked-",
    "nome": "Rádio Sines (720p) [Geo-blocked]",
    "logo": "https://i.imgur.com/Oe6F1nL.png",
    "url": "https://load-balancer.azotosolutions.com/cdnedge19/smil:live19.smil/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "rfptv-360p-",
    "nome": "RFPtv (360p)",
    "logo": "https://i.imgur.com/I60nQuR.png",
    "url": "https://video03.logicahost.com.br/rfptv/rfptv/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "PT",
    "rede": "Geral",
    "grupo": "Portugal Ao Vivo"
  },
  {
    "id": "1001-noites-720p-not-24-7-",
    "nome": "1001 Noites (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/dWA9y2J.png",
    "url": "https://cdn.jmvstream.com/w/LVW-8155/ngrp:LVW8155_41E1ciuCvO_all/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "a-e-latin-america-brazil-720p-",
    "nome": "A&E Latin America Brazil (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/A%26E_Network_logo.svg/960px-A%26E_Network_logo.svg.png",
    "url": "http://170.83.16.50/AeE/index.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "adesso-tv-720p-",
    "nome": "Adesso TV (720p)",
    "logo": "https://i.imgur.com/KgetM8j.png",
    "url": "https://cdn.jmvstream.com/w/LVW-9715/LVW9715_12B26T62tm/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "adult-swim-latin-america-brazil-720p-",
    "nome": "Adult Swim Latin America Brazil (720p)",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Adult_Swim_2003_logo.svg/960px-Adult_Swim_2003_logo.svg.png",
    "url": "http://168.197.104.22/ADULT_SWIM/index.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "agrobrasil-tv-720p-not-24-7-",
    "nome": "AgroBrasil TV (720p) [Not 24/7]",
    "logo": "https://i.imgur.com/aNkP7Zd.png",
    "url": "http://45.162.230.234:1935/agrobrasiltv/agrobrasiltv/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "agrocanal-720p-",
    "nome": "AgroCanal (720p)",
    "logo": "https://i.imgur.com/5XyopHf.png",
    "url": "http://45.162.64.114/AGRO_CANAL/index.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "agromais-720p-",
    "nome": "AgroMais (720p)",
    "logo": "https://i.imgur.com/sFcOZeo.png",
    "url": "http://45.162.64.114/AGROMAIS/index.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "alpha-channel-720p-",
    "nome": "Alpha Channel (720p)",
    "logo": "https://i.imgur.com/c1QqslA.png",
    "url": "https://5b01a3d32b65c.streamlock.net:1936/tvalpha/tvalpha/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "amazon-sat-1080p-",
    "nome": "Amazon Sat (1080p)",
    "logo": "https://i.imgur.com/7rjCS5i.png",
    "url": "https://amazonsat.brasilstream.com.br/hls/amazonsat/index.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "araruna-tv",
    "nome": "Araruna TV",
    "logo": "https://i.imgur.com/jl39ula.png",
    "url": "https://video05.logicahost.com.br/ararunatv/ararunatv/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "aratu-on",
    "nome": "Aratu On",
    "logo": "https://i.imgur.com/Ht4jCab.png",
    "url": "https://cdn.live.br1.jmvstream.com/w/LVW-9359/LVW9359_XSyReL0QVf/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "arte-1-720p-",
    "nome": "Arte 1 (720p)",
    "logo": "https://i.imgur.com/Ivnk7A6.png",
    "url": "http://45.162.64.114/ARTE1/index.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "auge-tv-720p-",
    "nome": "Auge TV (720p)",
    "logo": "https://m.media-amazon.com/images/I/81UMY8nlXHL._SL500_.png",
    "url": "https://cdn-tiva-video01-logicahost-com-br.smartbit.co/canalaugetv/canalaugetv/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "avatar-a-lenda-de-aang",
    "nome": "Avatar: A lenda de Aang",
    "logo": "https://images.pluto.tv/channels/6759eeb1bd523200083b4f29/colorLogoPNG.png",
    "url": "https://jmp2.uk/plu-6759eeb1bd523200083b4f29.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "awtv-1080p-geo-blocked-",
    "nome": "AWTV (1080p) [Geo-blocked]",
    "logo": "https://i.imgur.com/2tdMyef.png",
    "url": "https://awtv.nuvemplay.live/hls/stream.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "babyfirst",
    "nome": "Babyfirst",
    "logo": "https://i.imgur.com/WxLHBwu.png",
    "url": "https://jmp2.uk/plu-5f4fb4cf605ddf000748e16f.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "band-720p-",
    "nome": "Band (720p)",
    "logo": "https://i.imgur.com/1r5T6Pw.png",
    "url": "http://170.84.165.204/BAND_HD/index.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "bandnews-1080p-",
    "nome": "BandNews (1080p)",
    "logo": "https://i.ibb.co/0jVZBFp/u8ya-iw-R-400x400.jpg",
    "url": "https://cdn-5.nxplay.com.br/BAND_NEWS/index.m3u8",
    "categoria": "Notícias",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "bem-melhor-720p-",
    "nome": "Bem Melhor (720p)",
    "logo": "https://www.ubplay.com.br/wp-content/uploads/sites/67/2025/10/capa-site-bemmelhor.png",
    "url": "https://cdn-tiva-video01-logicahost-com-br.smartbit.co/bemmelhor/bemmelhor/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "bet-pluto-tv",
    "nome": "BET Pluto TV",
    "logo": "https://images.pluto.tv/channels/5ff768b6a4c8b80008498610/colorLogoPNG_1756804608228.png",
    "url": "https://jmp2.uk/plu-5ff768b6a4c8b80008498610.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "blitstv",
    "nome": "Blitstv",
    "logo": "https://i.imgur.com/FO4QTRf.jpeg",
    "url": "https://stmv1.transmissaodigital.com/blitstv/blitstv/playlist.m3u8",
    "categoria": "Lazer",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  },
  {
    "id": "bm-c-news-720p-",
    "nome": "BM&C News (720p)",
    "logo": "https://i.imgur.com/pOUY2Uz.png",
    "url": "https://jmp2.uk/plu-666c9c60a7efd40008f552f0.m3u8",
    "categoria": "Notícias",
    "pais": "BR",
    "rede": "Vivo",
    "grupo": "Brasil Ao Vivo"
  }
];

export const TODOS_OS_CANAIS: Canal[] = [
  ...CANAIS_ESPORTES_SOLICITADOS,
  ...CANAIS_NOVOS_SOLICITADOS,
  ...CANAIS_COMPLETOS,
  ...CANAIS_YOUTUBE,
];

export const CANAIS_ESPORTES: Canal[] = TODOS_OS_CANAIS.filter(c => c.categoria === 'Esportes');
export const CANAIS_BONECOS: Canal[] = TODOS_OS_CANAIS.filter(c => c.categoria === 'Bonecos');
export const CANAIS_FILMES: Canal[] = TODOS_OS_CANAIS.filter(c => c.categoria === 'Filmes');
export const CANAIS_NOVELAS: Canal[] = TODOS_OS_CANAIS.filter(c => c.categoria === 'Novelas');
export const CANAIS_NOTICIAS: Canal[] = TODOS_OS_CANAIS.filter(c => c.categoria === 'Notícias');
export const CANAIS_MUSICAS: Canal[] = TODOS_OS_CANAIS.filter(c => c.categoria === 'Músicas');
export const CANAIS_LAZER: Canal[] = TODOS_OS_CANAIS.filter(c => c.categoria === 'Lazer');
export { CANAIS_NOVOS_SOLICITADOS, CANAIS_ESPORTES_SOLICITADOS };
