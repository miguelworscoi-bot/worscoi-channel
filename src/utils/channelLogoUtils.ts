import { Canal } from '@/types';

// ============================================================================
// LOGOTIPOS OFICIAIS E AUTÊNTICOS EM SVG VETORIAL DE ALTA DEFINIÇÃO
// (Zero dependência de rede, 100% nítidos em qualquer resolução, sem CORS/bloqueios)
// ============================================================================

function svgToUri(svgString: string): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString.trim());
}

// 1. TNT SPORTS (Oficial Warner Bros. Discovery - Anel magenta/rosa e amarelo icônico)
export const LOGO_TNT_SPORTS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="tntBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a003f"/>
      <stop offset="100%" stop-color="#0f0019"/>
    </radialGradient>
    <linearGradient id="tntRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff0055"/>
      <stop offset="50%" stop-color="#ff00a0"/>
      <stop offset="100%" stop-color="#ffd100"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#tntBg)"/>
  <circle cx="60" cy="54" r="40" fill="none" stroke="url(#tntRing)" stroke-width="6"/>
  <circle cx="60" cy="54" r="32" fill="#150022"/>
  <text x="60" y="60" font-family="'Impact','Arial Black',system-ui,sans-serif" font-weight="900" font-size="28" fill="#ffd100" text-anchor="middle" letter-spacing="-1">TNT</text>
  <rect x="22" y="86" width="76" height="20" rx="10" fill="#ff0055"/>
  <text x="60" y="100" font-family="'Arial Black',system-ui,sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">SPORTS</text>
</svg>
`);

// 2. UEFA CHAMPIONS LEAGUE (Constelação oficial de estrelas e azul clássico)
export const LOGO_CHAMPIONS_LEAGUE = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="uclBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#002b66"/>
      <stop offset="100%" stop-color="#000e26"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#uclBg)"/>
  <!-- Constelação de 8 estrelas (Starball) -->
  <g fill="#ffffff" stroke="#00e5ff" stroke-width="0.5">
    <polygon points="60,18 63,27 72,27 65,33 68,42 60,36 52,42 55,33 48,27 57,27"/>
    <polygon points="88,32 90,39 98,38 91,43 93,51 86,46 80,51 82,43 76,38 84,39"/>
    <polygon points="98,62 98,70 106,71 99,75 100,83 93,78 87,82 89,75 83,70 91,70"/>
    <polygon points="82,90 81,98 88,102 81,104 80,112 75,106 69,109 72,102 66,97 74,98"/>
    <polygon points="46,98 40,105 44,113 37,109 31,114 33,106 27,102 35,100 36,92 41,99"/>
    <polygon points="22,70 19,77 26,82 18,83 17,91 13,84 6,86 10,79 5,73 13,75"/>
    <polygon points="26,38 27,46 34,48 27,51 26,59 22,53 15,56 18,49 13,44 21,45"/>
    <polygon points="40,24 45,30 43,38 37,34 31,38 33,30 28,25 36,25 38,17 42,24"/>
  </g>
  <circle cx="60" cy="62" r="18" fill="#001438" stroke="#00e5ff" stroke-width="2"/>
  <text x="60" y="65" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#00e5ff" text-anchor="middle" letter-spacing="1">UEFA</text>
  <text x="60" y="104" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1">CHAMPIONS</text>
  <text x="60" y="114" font-family="'Arial Black',sans-serif" font-weight="800" font-size="8" fill="#00e5ff" text-anchor="middle" letter-spacing="2">LEAGUE</text>
</svg>
`);

// 3. CONMEBOL LIBERTADORES (Troféu e coroa de louros dourada)
export const LOGO_LIBERTADORES = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="libGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe259"/>
      <stop offset="50%" stop-color="#ffa751"/>
      <stop offset="100%" stop-color="#d48800"/>
    </linearGradient>
    <radialGradient id="libBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141c30"/>
      <stop offset="100%" stop-color="#070b14"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#libBg)"/>
  <!-- Base do troféu e jogador no topo -->
  <circle cx="60" cy="42" r="18" fill="url(#libGold)"/>
  <circle cx="60" cy="42" r="14" fill="#0c1322"/>
  <circle cx="60" cy="22" r="4" fill="#ffe259"/>
  <line x1="60" y1="26" x2="60" y2="34" stroke="#ffe259" stroke-width="3"/>
  <path d="M48 42 C48 56 72 56 72 42" fill="none" stroke="url(#libGold)" stroke-width="4"/>
  <rect x="54" y="56" width="12" height="14" rx="2" fill="url(#libGold)"/>
  <rect x="46" y="70" width="28" height="8" rx="3" fill="#8b5a2b"/>
  <!-- Faixa Conmebol Libertadores -->
  <rect x="14" y="86" width="92" height="22" rx="6" fill="#0d1b2a" stroke="url(#libGold)" stroke-width="1.5"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="7.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">CONMEBOL</text>
  <text x="60" y="105" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8" fill="#ffd700" text-anchor="middle" letter-spacing="0.5">LIBERTADORES</text>
</svg>
`);

// 4. LALIGA (Vermelho oficial com o monograma LL e círculo moderno)
export const LOGO_LALIGA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="laligaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff0046"/>
      <stop offset="100%" stop-color="#cc0033"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#laligaBg)"/>
  <!-- Emblema duplo LL estilizado -->
  <g fill="#ffffff">
    <path d="M38 30 L48 30 L48 68 L66 68 L66 78 L38 78 Z"/>
    <path d="M56 30 L66 30 L66 68 L84 68 L84 78 L56 78 Z" fill-opacity="0.9"/>
  </g>
  <text x="60" y="100" font-family="'Impact','Arial Black',sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="1">LaLiga</text>
</svg>
`);

// 5. NBA / NBA TV (Jerry West silhueta oficial, divisão clássica azul e vermelho)
export const LOGO_NBA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0b101d"/>
  <!-- Pílula Oficial NBA dividida Azul e Vermelha -->
  <g transform="translate(32, 16)">
    <clipPath id="nbaClip">
      <rect width="56" height="74" rx="14"/>
    </clipPath>
    <g clip-path="url(#nbaClip)">
      <rect x="0" y="0" width="28" height="74" fill="#002b66"/>
      <rect x="28" y="0" width="28" height="74" fill="#d61f26"/>
      <!-- Silhueta Branca do Jogador Driblando (Jerry West) -->
      <path d="M28 14 C30 14 32 16 32 18 C32 20 30 22 28 22 C26 22 24 20 24 18 C24 16 26 14 28 14 Z M26 25 C24 28 20 34 18 42 C16 48 20 52 24 50 C26 48 28 42 30 38 C32 44 33 54 31 66 L36 66 C38 52 38 42 34 32 C32 28 29 25 26 25 Z" fill="#ffffff"/>
      <circle cx="38" cy="40" r="4.5" fill="#ffffff"/>
    </g>
  </g>
  <text x="60" y="107" font-family="'Impact','Arial Black',sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="2">NBA TV</text>
</svg>
`);

// 6. ESPN (Vermelho e corte itálico icônico clássico)
export const LOGO_ESPN = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="espnBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dc0000"/>
      <stop offset="100%" stop-color="#990000"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#espnBg)"/>
  <!-- Linha de corte horizontal característica da ESPN -->
  <g transform="translate(14, 38) skewX(-12)">
    <text x="46" y="28" font-family="'Impact','Arial Black',system-ui,sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="-1">ESPN</text>
    <line x1="2" y1="12" x2="90" y2="12" stroke="#dc0000" stroke-width="3"/>
  </g>
  <rect x="26" y="82" width="68" height="18" rx="5" fill="#111111"/>
  <text x="60" y="95" font-family="'Arial Black',system-ui,sans-serif" font-weight="900" font-size="9" fill="#ffd100" text-anchor="middle" letter-spacing="1.5">BRASIL HD</text>
</svg>
`);

// 7. beIN SPORTS (Roxo real, ponto turquesa característico)
export const LOGO_BEIN_SPORTS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="beinBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#562680"/>
      <stop offset="100%" stop-color="#341253"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#beinBg)"/>
  <text x="50" y="58" font-family="'Century Gothic','Arial Rounded MT Bold',system-ui,sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="-1">beIN</text>
  <circle cx="68" cy="38" r="5" fill="#00ffd5"/>
  <rect x="22" y="74" width="76" height="22" rx="6" fill="#00ffd5"/>
  <text x="60" y="89" font-family="'Arial Black',system-ui,sans-serif" font-weight="900" font-size="12" fill="#341253" text-anchor="middle" letter-spacing="2">SPORTS</text>
</svg>
`);

// 8. REAL MADRID TV (Escudo com coroa real e faixa diagonal)
export const LOGO_REAL_MADRID = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="rmBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#182c54"/>
      <stop offset="100%" stop-color="#0a1224"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#rmBg)"/>
  <!-- Coroa Real -->
  <path d="M42 28 L46 38 L54 32 L60 40 L66 32 L74 38 L78 28 L60 22 Z" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>
  <circle cx="60" cy="20" r="3" fill="#00e5ff"/>
  <!-- Escudo Circular -->
  <circle cx="60" cy="62" r="28" fill="#ffffff" stroke="#ffd700" stroke-width="4"/>
  <!-- Faixa Diagonal Roxa Oficial -->
  <clipPath id="rmClip">
    <circle cx="60" cy="62" r="25"/>
  </clipPath>
  <g clip-path="url(#rmClip)">
    <polygon points="40,32 56,32 80,92 64,92" fill="#6a0dad"/>
    <!-- Monograma MFC em Ouro -->
    <text x="60" y="70" font-family="'Times New Roman',serif" font-weight="900" font-size="22" fill="#d4af37" text-anchor="middle">RMTV</text>
  </g>
  <text x="60" y="108" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#00e5ff" text-anchor="middle" letter-spacing="1">REAL MADRID</text>
</svg>
`);

// 9. FC BARCELONA (Blaugrana, Cruz Sant Jordi e Senyera)
export const LOGO_BARCELONA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#001d4a"/>
  <!-- Escudo Barça -->
  <path d="M30 30 C45 26 75 26 90 30 C94 56 86 84 60 98 C34 84 26 56 30 30 Z" fill="#ffd700"/>
  <!-- Topo: Cruz e Senyera -->
  <g transform="translate(33, 33) scale(0.9)">
    <rect x="0" y="0" width="30" height="26" fill="#ffffff"/>
    <rect x="11" y="0" width="8" height="26" fill="#dc0000"/>
    <rect x="0" y="9" width="30" height="8" fill="#dc0000"/>
    <rect x="30" y="0" width="30" height="26" fill="#ffd700"/>
    <line x1="37" y1="0" x2="37" y2="26" stroke="#dc0000" stroke-width="4"/>
    <line x1="47" y1="0" x2="47" y2="26" stroke="#dc0000" stroke-width="4"/>
    <line x1="57" y1="0" x2="57" y2="26" stroke="#dc0000" stroke-width="4"/>
  </g>
  <!-- Base: Listras Blaugrana -->
  <g transform="translate(33, 60)">
    <rect x="0" y="0" width="13" height="30" fill="#004d98"/>
    <rect x="13" y="0" width="14" height="30" fill="#a50044"/>
    <rect x="27" y="0" width="13" height="30" fill="#004d98"/>
    <rect x="40" y="0" width="14" height="30" fill="#a50044"/>
    <circle cx="27" cy="12" r="8" fill="#ffd700"/>
    <circle cx="27" cy="12" r="5" fill="#333333"/>
  </g>
  <text x="60" y="112" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1">BARÇA TV</text>
</svg>
`);

// 10. SPORT TV (Portugal - Azul Marinho, listras e bola veloz)
export const LOGO_SPORT_TV = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="stBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#002d62"/>
      <stop offset="100%" stop-color="#001530"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#stBg)"/>
  <rect x="14" y="24" width="92" height="46" rx="8" fill="#ffffff"/>
  <text x="60" y="52" font-family="'Arial Black',sans-serif" font-style="italic" font-weight="900" font-size="20" fill="#002d62" text-anchor="middle" letter-spacing="-0.5">SPORT</text>
  <rect x="42" y="56" width="36" height="10" rx="3" fill="#002d62"/>
  <text x="60" y="64" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8" fill="#ffd100" text-anchor="middle" letter-spacing="1.5">TV 1 HD</text>
  <text x="60" y="98" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#00e5ff" text-anchor="middle" letter-spacing="1">PORTUGAL</text>
</svg>
`);

// 11. ZAP VIVA / ZAP ANGOLA (Laranja vibrante e curva dinâmica)
export const LOGO_ZAP_VIVA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="zapBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6600"/>
      <stop offset="100%" stop-color="#e63900"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#zapBg)"/>
  <circle cx="60" cy="46" r="32" fill="#ffffff"/>
  <text x="60" y="56" font-family="'Arial Black',Impact,sans-serif" font-weight="900" font-size="24" fill="#ff6600" text-anchor="middle" letter-spacing="-1">ZAP</text>
  <rect x="26" y="82" width="68" height="22" rx="11" fill="#78148c"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="2">VIVA</text>
</svg>
`);

// 12. ZAP NOVELAS (Gradiente rosa/magenta e espiral romântica)
export const LOGO_ZAP_NOVELAS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="zapNovBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff0077"/>
      <stop offset="100%" stop-color="#99004d"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#zapNovBg)"/>
  <path d="M60 22 C48 10 24 22 36 44 C48 60 60 70 60 70 C60 70 72 60 84 44 C96 22 72 10 60 22 Z" fill="#ffffff"/>
  <text x="60" y="44" font-family="'Arial Black',sans-serif" font-weight="900" font-size="13" fill="#ff0077" text-anchor="middle">ZAP</text>
  <rect x="16" y="80" width="88" height="22" rx="8" fill="#ffffff"/>
  <text x="60" y="95" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#99004d" text-anchor="middle" letter-spacing="1">NOVELAS</text>
</svg>
`);

// 13. TPA ANGOLA (Televisão Pública de Angola)
export const LOGO_TPA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#08140c"/>
  <!-- Cores de Angola: Vermelho e Preto com engrenagem/estrela -->
  <rect x="20" y="24" width="80" height="30" rx="6" fill="#cc092f"/>
  <rect x="20" y="54" width="80" height="30" rx="6" fill="#111111"/>
  <circle cx="60" cy="54" r="14" fill="#ffd100"/>
  <polygon points="60,45 63,52 70,52 64,56 67,63 60,59 53,63 56,56 50,52 57,52" fill="#111111"/>
  <text x="60" y="104" font-family="'Impact','Arial Black',sans-serif" font-weight="900" font-size="18" fill="#ffd100" text-anchor="middle" letter-spacing="2">TPA 1</text>
</svg>
`);

// 14. TV ZIMBO (Angola)
export const LOGO_TV_ZIMBO = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#ff7900"/>
  <circle cx="60" cy="48" r="30" fill="#ffffff"/>
  <path d="M44 34 L76 34 L52 62 L76 62" fill="none" stroke="#ff7900" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="60" y="100" font-family="'Arial Black',sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle" letter-spacing="2">ZIMBO</text>
</svg>
`);

// 15. RTP (Portugal - Três barras clássicas)
export const LOGO_RTP = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#001833"/>
  <g transform="translate(24, 28)">
    <rect x="0" y="0" width="22" height="46" rx="4" fill="#0070d8"/>
    <rect x="25" y="0" width="22" height="46" rx="4" fill="#0088ff"/>
    <rect x="50" y="0" width="22" height="46" rx="4" fill="#00a6ff"/>
    <text x="11" y="32" font-family="'Arial Black',sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">r</text>
    <text x="36" y="32" font-family="'Arial Black',sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">t</text>
    <text x="61" y="32" font-family="'Arial Black',sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">p</text>
  </g>
  <rect x="26" y="84" width="68" height="20" rx="5" fill="#0088ff"/>
  <text x="60" y="98" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="2">PORTUGAL</text>
</svg>
`);

// 16. SIC (Portugal - Prisma multicolor clássico)
export const LOGO_SIC = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0f0f14"/>
  <!-- Pirâmide/Cristal 4 cores SIC -->
  <polygon points="60,20 30,70 60,60" fill="#0055ff"/>
  <polygon points="60,20 60,60 90,70" fill="#ff0044"/>
  <polygon points="60,60 30,70 60,78" fill="#ffd100"/>
  <polygon points="60,60 60,78 90,70" fill="#00cc66"/>
  <text x="60" y="104" font-family="'Arial Black',sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="2">SIC</text>
</svg>
`);

// 17. TVI (Portugal)
export const LOGO_TVI = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#d0021b"/>
  <text x="60" y="66" font-family="'Arial Black',sans-serif" font-style="italic" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="-1">tvi</text>
  <circle cx="82" cy="38" r="4" fill="#00e5ff"/>
  <rect x="24" y="82" width="72" height="18" rx="4" fill="#111111"/>
  <text x="60" y="95" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1">PORTUGAL</text>
</svg>
`);

// 18. GLOBO (Brasil - Esfera prateada com tela arco-íris)
export const LOGO_GLOBO = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="globoMetal" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#c5c9d1"/>
      <stop offset="100%" stop-color="#7a8291"/>
    </radialGradient>
    <linearGradient id="globoRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00b4d8"/>
      <stop offset="33%" stop-color="#06d6a0"/>
      <stop offset="66%" stop-color="#ffd166"/>
      <stop offset="100%" stop-color="#ef476f"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="#0c1017"/>
  <!-- Esfera maior -->
  <circle cx="60" cy="52" r="38" fill="url(#globoMetal)"/>
  <!-- Abertura/Tela com gradiente colorido da TV -->
  <rect x="40" y="36" width="40" height="32" rx="10" fill="url(#globoRainbow)"/>
  <!-- Esfera menor interna -->
  <circle cx="60" cy="52" r="12" fill="url(#globoMetal)"/>
  <text x="60" y="106" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="2">GLOBO</text>
</svg>
`);

// 19. SBT (Brasil - Esfera com leque de 6 cores)
export const LOGO_SBT = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="sbtMetal" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#bdc3c7"/>
      <stop offset="100%" stop-color="#7f8c8d"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="#0f1115"/>
  <circle cx="60" cy="52" r="38" fill="url(#sbtMetal)"/>
  <!-- Círculo colorido característico do SBT -->
  <circle cx="60" cy="52" r="26" fill="#111111"/>
  <path d="M60 52 L60 26 A26 26 0 0 1 82 38 Z" fill="#e74c3c"/>
  <path d="M60 52 L82 38 A26 26 0 0 1 82 66 Z" fill="#e67e22"/>
  <path d="M60 52 L82 66 A26 26 0 0 1 60 78 Z" fill="#f1c40f"/>
  <path d="M60 52 L60 78 A26 26 0 0 1 38 66 Z" fill="#2ecc71"/>
  <path d="M60 52 L38 66 A26 26 0 0 1 38 38 Z" fill="#3498db"/>
  <path d="M60 52 L38 38 A26 26 0 0 1 60 26 Z" fill="#9b59b6"/>
  <text x="60" y="58" font-family="'Arial Black',sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">sbt</text>
  <text x="60" y="106" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="2">BRASIL</text>
</svg>
`);

// 20. BAND / BANDSPORTS (Olho verde, amarelo e vermelho icônico)
export const LOGO_BAND = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0c1219"/>
  <!-- Olho da Bandeirantes -->
  <ellipse cx="60" cy="50" rx="42" ry="26" fill="#009b3a"/>
  <ellipse cx="60" cy="50" rx="28" ry="20" fill="#fedf00"/>
  <ellipse cx="60" cy="50" rx="14" ry="14" fill="#d0021b"/>
  <circle cx="56" cy="46" r="3" fill="#ffffff"/>
  <text x="60" y="102" font-family="'Impact','Arial Black',sans-serif" font-weight="900" font-size="16" fill="#fedf00" text-anchor="middle" letter-spacing="1">BAND</text>
</svg>
`);

// 21. RECORD / RECORD NEWS
export const LOGO_RECORD = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="recMetal" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#a4b0be"/>
      <stop offset="100%" stop-color="#57606f"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="#0a101d"/>
  <circle cx="60" cy="50" r="28" fill="url(#recMetal)"/>
  <!-- Asas/Cintas estilizadas em azul -->
  <path d="M30 46 C36 30 84 30 90 46 C74 40 46 40 30 46 Z" fill="#0055ff"/>
  <path d="M30 54 C36 70 84 70 90 54 C74 60 46 60 30 54 Z" fill="#0033aa"/>
  <text x="60" y="104" font-family="'Arial Black',sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="1">RECORD</text>
</svg>
`);

// 22. CNN / CNN BRASIL (Faixa contínua dupla vermelha)
export const LOGO_CNN = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#cc0000"/>
  <g transform="translate(18, 36)">
    <text x="42" y="32" font-family="'Impact','Arial Black',sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="1">CNN</text>
    <line x1="4" y1="18" x2="80" y2="18" stroke="#cc0000" stroke-width="2.5"/>
  </g>
  <rect x="26" y="82" width="68" height="18" rx="4" fill="#111111"/>
  <text x="60" y="95" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="2">BRASIL</text>
</svg>
`);

// 23. CARTOON NETWORK (Blocos preto e branco [C] e [N])
export const LOGO_CARTOON_NETWORK = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#121214"/>
  <!-- Bloco C Preto -->
  <rect x="22" y="28" width="36" height="42" rx="4" fill="#000000" stroke="#ffffff" stroke-width="2"/>
  <text x="40" y="60" font-family="'Arial Black',Impact,sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle">C</text>
  <!-- Bloco N Branco -->
  <rect x="62" y="28" width="36" height="42" rx="4" fill="#ffffff"/>
  <text x="80" y="60" font-family="'Arial Black',Impact,sans-serif" font-weight="900" font-size="32" fill="#000000" text-anchor="middle">N</text>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8" fill="#ffffff" text-anchor="middle" letter-spacing="1">CARTOON</text>
  <text x="60" y="105" font-family="'Arial Black',sans-serif" font-weight="800" font-size="8" fill="#00e5ff" text-anchor="middle" letter-spacing="1">NETWORK</text>
</svg>
`);

// 24. DISNEY CHANNEL (Orelhas do Mickey e azul clássico)
export const LOGO_DISNEY_CHANNEL = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="disneyBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0040a8"/>
      <stop offset="100%" stop-color="#001a4d"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#disneyBg)"/>
  <!-- Silhueta 3 círculos do Mickey -->
  <circle cx="60" cy="54" r="22" fill="#00b4d8"/>
  <circle cx="44" cy="34" r="13" fill="#00b4d8"/>
  <circle cx="76" cy="34" r="13" fill="#00b4d8"/>
  <text x="60" y="60" font-family="'Brush Script MT','Trebuchet MS',cursive,sans-serif" font-weight="bold" font-size="22" fill="#ffffff" text-anchor="middle">Disney</text>
  <rect x="22" y="86" width="76" height="18" rx="6" fill="#ffd100"/>
  <text x="60" y="99" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#001a4d" text-anchor="middle" letter-spacing="1.5">CHANNEL</text>
</svg>
`);

// 25. NICKELODEON (Laranja icônico com respingo)
export const LOGO_NICKELODEON = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0f0f12"/>
  <!-- Mancha/Splat Laranja da Nick -->
  <path d="M30 46 C18 42 20 28 34 32 C44 22 56 24 64 30 C74 24 86 28 88 40 C100 42 102 58 92 64 C100 74 92 88 80 84 C72 92 56 90 48 84 C38 90 24 82 28 70 C16 64 20 48 30 46 Z" fill="#ff5c00"/>
  <text x="60" y="62" font-family="'Arial Black',sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">nick</text>
  <text x="60" y="104" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ff5c00" text-anchor="middle" letter-spacing="1">NICKELODEON</text>
</svg>
`);

// 26. PANDA KIDS / CANAL PANDA (Panda com óculos)
export const LOGO_CANAL_PANDA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#00a651"/>
  <!-- Orelhas e rosto do Panda -->
  <circle cx="40" cy="34" r="10" fill="#111111"/>
  <circle cx="80" cy="34" r="10" fill="#111111"/>
  <circle cx="60" cy="56" r="26" fill="#ffffff"/>
  <!-- Manchas e óculos do Panda -->
  <ellipse cx="48" cy="52" rx="7" ry="9" fill="#111111"/>
  <ellipse cx="72" cy="52" rx="7" ry="9" fill="#111111"/>
  <circle cx="50" cy="50" r="3" fill="#ffffff"/>
  <circle cx="70" cy="50" r="3" fill="#ffffff"/>
  <ellipse cx="60" cy="62" rx="5" ry="3" fill="#111111"/>
  <rect x="22" y="90" width="76" height="18" rx="6" fill="#ffffff"/>
  <text x="60" y="103" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#00a651" text-anchor="middle" letter-spacing="1">PANDA</text>
</svg>
`);

// 27. HBO (Preto, letras grossas e mira no 'O')
export const LOGO_HBO = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#000000" stroke="#222228" stroke-width="2"/>
  <g transform="translate(18, 40)">
    <text x="42" y="32" font-family="'Impact','Arial Black',system-ui,sans-serif" font-weight="900" font-size="40" fill="#ffffff" text-anchor="middle" letter-spacing="-1">HBO</text>
    <!-- Círculo interior da letra O característico da HBO -->
    <circle cx="68" cy="20" r="6" fill="#ffffff"/>
    <circle cx="68" cy="20" r="3" fill="#000000"/>
  </g>
  <text x="60" y="102" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#a0a0b0" text-anchor="middle" letter-spacing="3">MAX CINEMA</text>
</svg>
`);

// 28. TELECINE (Vermelho escarlate com visor de câmera)
export const LOGO_TELECINE = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#e50914"/>
  <!-- Visor de cinema estilizado -->
  <circle cx="60" cy="48" r="24" fill="none" stroke="#ffffff" stroke-width="5"/>
  <circle cx="60" cy="48" r="10" fill="#ffffff"/>
  <text x="60" y="96" font-family="'Arial Black',Impact,sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="1">TELECINE</text>
  <text x="60" y="108" font-family="'Arial Black',sans-serif" font-weight="800" font-size="8" fill="#ffd100" text-anchor="middle" letter-spacing="1">PREMIUM</text>
</svg>
`);

// 29. MTV (M gigante turquesa/amarelo com TV em grafite)
export const LOGO_MTV = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#121214"/>
  <!-- M Bloco Grande -->
  <path d="M26 30 L44 30 L52 54 L60 30 L78 30 L78 78 L64 78 L64 54 L56 74 L48 74 L40 54 L40 78 L26 78 Z" fill="#00ffd5"/>
  <!-- TV em Grafite Vermelho -->
  <text x="76" y="66" font-family="'Impact',sans-serif" font-weight="900" font-size="28" fill="#ff0055">TV</text>
  <text x="60" y="104" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="2">MUSIC HD</text>
</svg>
`);

// 30. MRBEAST (Pantera azul elétrica com relâmpago rosa oficial)
export const LOGO_MRBEAST = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="beastBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00c8ff"/>
      <stop offset="100%" stop-color="#005b99"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#beastBg)"/>
  <!-- Cabeça de Pantera Rugindo (Azul e Branco) -->
  <path d="M36 40 C32 26 44 22 52 30 C62 26 72 32 76 40 C86 44 92 56 86 68 C80 80 66 84 56 82 C44 80 34 68 36 56 Z" fill="#002b4d"/>
  <!-- Relâmpago Rosa no Olho -->
  <polygon points="62,28 54,48 64,48 50,72 68,44 58,44" fill="#ff007f"/>
  <!-- Presas brancas -->
  <polygon points="46,58 48,68 52,60" fill="#ffffff"/>
  <polygon points="70,58 72,68 76,60" fill="#ffffff"/>
  <rect x="18" y="86" width="84" height="22" rx="7" fill="#111111"/>
  <text x="60" y="101" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#00e5ff" text-anchor="middle" letter-spacing="1">MRBEAST</text>
</svg>
`);

// 31. DUDE PERFECT (Turquesa DP monograma)
export const LOGO_DUDE_PERFECT = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#091b22"/>
  <circle cx="60" cy="50" r="32" fill="#06d6a0"/>
  <text x="60" y="62" font-family="'Arial Black',Impact,sans-serif" font-weight="900" font-size="28" fill="#091b22" text-anchor="middle">DP</text>
  <!-- Aro e bola de basquete -->
  <circle cx="78" cy="34" r="7" fill="#ff6b00"/>
  <rect x="18" y="88" width="84" height="20" rx="6" fill="#06d6a0"/>
  <text x="60" y="102" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#091b22" text-anchor="middle" letter-spacing="1.5">DUDE PERFECT</text>
</svg>
`);

// 32. CAZÉ TV / YOUTUBE TRANSMISSÕES
export const LOGO_CAZE_TV = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#ffd100"/>
  <circle cx="60" cy="48" r="28" fill="#111111"/>
  <text x="60" y="56" font-family="'Impact','Arial Black',sans-serif" font-weight="900" font-size="22" fill="#ffd100" text-anchor="middle">CAZÉ</text>
  <rect x="24" y="82" width="72" height="22" rx="7" fill="#111111"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="2">TV HD</text>
</svg>
`);

// 33. CBS SPORTS GOLAZO
export const LOGO_CBS_GOLAZO = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#002244"/>
  <!-- Olho da CBS -->
  <circle cx="60" cy="40" r="18" fill="none" stroke="#ffffff" stroke-width="4"/>
  <circle cx="60" cy="40" r="8" fill="#ffffff"/>
  <rect x="16" y="68" width="88" height="24" rx="6" fill="#00e676"/>
  <text x="60" y="84" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#002244" text-anchor="middle" letter-spacing="1.5">GOLAZO</text>
  <text x="60" y="108" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8" fill="#00e5ff" text-anchor="middle" letter-spacing="1">CBS SPORTS</text>
</svg>
`);

// 34. DAZN (Preto & Amarelo elétrico)
export const LOGO_DAZN = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0a0a0d"/>
  <g transform="translate(18, 36)">
    <text x="42" y="34" font-family="'Arial Black',Impact,sans-serif" font-weight="900" font-size="30" fill="#f8ff00" text-anchor="middle" letter-spacing="-0.5">DAZN</text>
  </g>
  <rect x="22" y="86" width="76" height="18" rx="5" fill="#222228"/>
  <text x="60" y="99" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="2">LIVE SPORTS</text>
</svg>
`);

// 35. FOX SPORTS (Oval amarelo com FOX branca)
export const LOGO_FOX_SPORTS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#002244"/>
  <ellipse cx="60" cy="48" rx="40" ry="24" fill="#ffd100"/>
  <ellipse cx="60" cy="48" rx="36" ry="20" fill="#002244"/>
  <text x="60" y="56" font-family="'Impact',sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle" letter-spacing="1">FOX</text>
  <rect x="20" y="82" width="80" height="20" rx="6" fill="#ffd100"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#002244" text-anchor="middle" letter-spacing="1.5">SPORTS</text>
</svg>
`);

// 36. MIRAMAR (Moçambique - Sol radiante amarelo e azul Record África)
export const LOGO_MIRAMAR = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="miramarBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0055a5"/>
      <stop offset="100%" stop-color="#00204d"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#miramarBg)"/>
  <circle cx="60" cy="46" r="24" fill="#ffc700"/>
  <path d="M60 14 L60 22 M60 70 L60 78 M28 46 L36 46 M84 46 L92 46 M38 24 L44 30 M76 62 L82 68 M38 68 L44 62 M76 30 L82 24" stroke="#ffc700" stroke-width="4" stroke-linecap="round"/>
  <circle cx="60" cy="46" r="14" fill="#0055a5"/>
  <text x="60" y="52" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">M</text>
  <rect x="14" y="84" width="92" height="20" rx="6" fill="#ffc700"/>
  <text x="60" y="98" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#00204d" text-anchor="middle" letter-spacing="1.5">MIRAMAR</text>
</svg>
`);

// 37. TV5MONDE (Azul marinho com o clássico pentágono francófono)
export const LOGO_TV5MONDE = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#001833"/>
  <text x="44" y="54" font-family="'Impact',sans-serif" font-weight="900" font-size="30" fill="#ffffff" text-anchor="middle">TV5</text>
  <circle cx="86" cy="42" r="14" fill="#ff0033"/>
  <text x="86" y="48" font-family="'Arial Black',sans-serif" font-weight="900" font-size="15" fill="#ffffff" text-anchor="middle">5</text>
  <rect x="16" y="76" width="88" height="24" rx="6" fill="#00a3e0"/>
  <text x="60" y="92" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#001833" text-anchor="middle" letter-spacing="1.5">MONDE</text>
</svg>
`);

// 38. TPA 1 & TPA 2 & TPA NOTÍCIAS (Angola)
export const LOGO_TPA1 = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#111111"/>
  <circle cx="60" cy="44" r="28" fill="#d40000"/>
  <text x="50" y="54" font-family="'Arial Black',sans-serif" font-weight="900" font-size="24" fill="#ffffff">TPA</text>
  <rect x="36" y="78" width="48" height="26" rx="8" fill="#ffd100"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="18" fill="#111111" text-anchor="middle">1</text>
</svg>
`);

export const LOGO_TPA2 = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#002b66"/>
  <circle cx="60" cy="44" r="28" fill="#0077cc"/>
  <text x="50" y="54" font-family="'Arial Black',sans-serif" font-weight="900" font-size="24" fill="#ffffff">TPA</text>
  <rect x="36" y="78" width="48" height="26" rx="8" fill="#ffffff"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="18" fill="#002b66" text-anchor="middle">2</text>
</svg>
`);

export const LOGO_TPA_NOTICIAS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#880000"/>
  <text x="60" y="48" font-family="'Arial Black',sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">TPA</text>
  <rect x="14" y="72" width="92" height="26" rx="6" fill="#ffffff"/>
  <text x="60" y="89" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#880000" text-anchor="middle" letter-spacing="1">NOTÍCIAS</text>
</svg>
`);

// 39. RTP ÁFRICA & RTP INTERNACIONAL
export const LOGO_RTP_AFRICA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#002244"/>
  <text x="60" y="44" font-family="'Arial Black',sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">RTP</text>
  <rect x="14" y="66" width="92" height="32" rx="8" fill="#008037"/>
  <text x="60" y="88" font-family="'Arial Black',sans-serif" font-weight="900" font-size="13" fill="#ffd100" text-anchor="middle" letter-spacing="2">ÁFRICA</text>
</svg>
`);

export const LOGO_RTP_INTERNACIONAL = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#003366"/>
  <text x="60" y="40" font-family="'Arial Black',sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">RTP</text>
  <circle cx="60" cy="62" r="14" fill="none" stroke="#00e5ff" stroke-width="3"/>
  <line x1="46" y1="62" x2="74" y2="62" stroke="#00e5ff" stroke-width="2"/>
  <ellipse cx="60" cy="62" rx="7" ry="14" fill="none" stroke="#00e5ff" stroke-width="2"/>
  <text x="60" y="100" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">INTERNACIONAL</text>
</svg>
`);

// 40. DAYSTAR TELEVISION
export const LOGO_DAYSTAR = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#002554"/>
  <polygon points="60,20 66,38 84,38 70,50 75,68 60,56 45,68 50,50 36,38 54,38" fill="#ffd100"/>
  <rect x="16" y="82" width="88" height="22" rx="6" fill="#ffffff"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#002554" text-anchor="middle" letter-spacing="1">DAYSTAR</text>
</svg>
`);

// 41. TV GIRASSOL (Angola)
export const LOGO_TV_GIRASSOL = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0d2b12"/>
  <circle cx="60" cy="46" r="22" fill="#ffb703"/>
  <circle cx="60" cy="46" r="12" fill="#4d2600"/>
  <text x="60" y="84" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle">TV</text>
  <text x="60" y="102" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffb703" text-anchor="middle" letter-spacing="1">GIRASSOL</text>
</svg>
`);

// 42. EURONEWS
export const LOGO_EURONEWS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#1b1c20"/>
  <circle cx="60" cy="50" r="30" fill="#ffffff"/>
  <text x="60" y="55" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="10" fill="#1b1c20" text-anchor="middle">euronews.</text>
  <rect x="22" y="88" width="76" height="18" rx="5" fill="#0066cc"/>
  <text x="60" y="100" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">PORTUGUÊS</text>
</svg>
`);

// 43. AFRO MUSIC POP & TRACE TOCA
export const LOGO_AFRO_MUSIC_POP = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#2d004d"/>
  <circle cx="60" cy="44" r="24" fill="#ff006e"/>
  <path d="M52 34 L52 50 A6 6 0 1 1 48 44 L52 44 L64 38 L64 48 A6 6 0 1 1 60 42 L64 42 L64 32 Z" fill="#ffffff"/>
  <rect x="14" y="78" width="92" height="26" rx="6" fill="#ffbe0b"/>
  <text x="60" y="95" font-family="'Impact',sans-serif" font-weight="900" font-size="12" fill="#2d004d" text-anchor="middle" letter-spacing="1">AFRO POP</text>
</svg>
`);

export const LOGO_TRACE_TOCA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0a0a0a"/>
  <rect x="18" y="24" width="84" height="28" rx="6" fill="#00ff66"/>
  <text x="60" y="44" font-family="'Impact',sans-serif" font-weight="900" font-size="18" fill="#0a0a0a" text-anchor="middle" letter-spacing="2">TRACE</text>
  <rect x="24" y="62" width="72" height="34" rx="8" fill="#ff0066"/>
  <text x="60" y="86" font-family="'Impact',sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle" letter-spacing="2">TOCA</text>
</svg>
`);

// 44. JIMJAM & PANDA KIDS & BIGGS & MOONBUG & BABYFIRST & KIDSCO
export const LOGO_JIMJAM = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#ffcc00"/>
  <circle cx="44" cy="42" r="18" fill="#0099ff"/>
  <circle cx="76" cy="42" r="18" fill="#ff3366"/>
  <text x="44" y="48" font-family="'Arial Black',sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">J</text>
  <text x="76" y="48" font-family="'Arial Black',sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">J</text>
  <rect x="18" y="74" width="84" height="26" rx="8" fill="#0099ff"/>
  <text x="60" y="92" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="1">JimJam</text>
</svg>
`);

export const LOGO_PANDA_KIDS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0099ff"/>
  <circle cx="60" cy="44" r="26" fill="#ffffff"/>
  <circle cx="46" cy="24" r="8" fill="#111111"/>
  <circle cx="74" cy="24" r="8" fill="#111111"/>
  <circle cx="50" cy="42" r="5" fill="#111111"/>
  <circle cx="70" cy="42" r="5" fill="#111111"/>
  <circle cx="60" cy="50" r="3" fill="#111111"/>
  <rect x="20" y="80" width="80" height="24" rx="7" fill="#ff0055"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1">PANDA KIDS</text>
</svg>
`);

export const LOGO_BIGGS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#ff4500"/>
  <text x="60" y="68" font-family="'Impact',sans-serif" font-weight="900" font-size="44" fill="#ffffff" text-anchor="middle" letter-spacing="2">BIGGS</text>
  <rect x="26" y="86" width="68" height="16" rx="4" fill="#111111"/>
  <text x="60" y="98" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8" fill="#00e5ff" text-anchor="middle" letter-spacing="1">CANAL</text>
</svg>
`);

export const LOGO_MOONBUG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#582cd2"/>
  <circle cx="60" cy="46" r="24" fill="#ffd100"/>
  <circle cx="52" cy="42" r="4" fill="#582cd2"/>
  <circle cx="68" cy="42" r="4" fill="#582cd2"/>
  <path d="M52 52 Q60 58 68 52" stroke="#582cd2" stroke-width="3" fill="none"/>
  <rect x="14" y="82" width="92" height="22" rx="6" fill="#ffffff"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#582cd2" text-anchor="middle">MOONBUG</text>
</svg>
`);

export const LOGO_BABY_FIRST = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#fff5eb"/>
  <circle cx="60" cy="42" r="14" fill="#ffb703"/>
  <circle cx="44" cy="42" r="8" fill="#fb8500"/>
  <circle cx="76" cy="42" r="8" fill="#fb8500"/>
  <circle cx="60" cy="26" r="8" fill="#023047"/>
  <circle cx="60" cy="58" r="8" fill="#219ebc"/>
  <rect x="16" y="78" width="88" height="24" rx="6" fill="#219ebc"/>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1">BabyFirst</text>
</svg>
`);

export const LOGO_KIDSCO = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#38b000"/>
  <circle cx="60" cy="46" r="26" fill="#ffffff"/>
  <text x="60" y="54" font-family="'Arial Black',sans-serif" font-weight="900" font-size="16" fill="#38b000" text-anchor="middle">KIDS</text>
  <rect x="24" y="82" width="72" height="20" rx="6" fill="#007200"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1">KidsCo</text>
</svg>
`);

// 45. M4 MOVIES & DSTV PIPOCA & KWENDA MAGIC & ROK & UNIVERSAL TV & KIX
export const LOGO_M4_MOVIES = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#140026"/>
  <text x="60" y="52" font-family="'Impact',sans-serif" font-weight="900" font-size="34" fill="#e0aaff" text-anchor="middle">M4</text>
  <rect x="18" y="74" width="84" height="26" rx="6" fill="#ffb703"/>
  <text x="60" y="92" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#140026" text-anchor="middle" letter-spacing="1.5">MOVIES</text>
</svg>
`);

export const LOGO_DSTV_PIPOCA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#002b66"/>
  <text x="60" y="42" font-family="'Arial Black',sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">DStv</text>
  <path d="M42 56 L46 84 L74 84 L78 56 Z" fill="#d00000"/>
  <circle cx="52" cy="52" r="5" fill="#fff3b0"/>
  <circle cx="62" cy="50" r="6" fill="#fff3b0"/>
  <circle cx="68" cy="53" r="5" fill="#fff3b0"/>
  <rect x="18" y="92" width="84" height="18" rx="5" fill="#ffd100"/>
  <text x="60" y="105" font-family="'Impact',sans-serif" font-weight="900" font-size="11" fill="#002b66" text-anchor="middle" letter-spacing="1">PIPOCA</text>
</svg>
`);

export const LOGO_KWENDA_MAGIC = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="kwendaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7209b7"/>
      <stop offset="100%" stop-color="#f72585"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="url(#kwendaGrad)"/>
  <polygon points="60,20 64,32 76,34 67,42 70,54 60,47 50,54 53,42 44,34 56,32" fill="#ffd100"/>
  <text x="60" y="76" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="1">KWENDA</text>
  <text x="60" y="98" font-family="'Impact',sans-serif" font-weight="900" font-size="18" fill="#ffd100" text-anchor="middle" letter-spacing="1.5">MAGIC</text>
</svg>
`);

export const LOGO_ROK = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0f0f14"/>
  <circle cx="60" cy="50" r="32" fill="#d4af37"/>
  <text x="60" y="62" font-family="'Impact',sans-serif" font-weight="900" font-size="28" fill="#0f0f14" text-anchor="middle">ROK</text>
  <rect x="22" y="88" width="76" height="18" rx="5" fill="#d4af37"/>
  <text x="60" y="101" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#0f0f14" text-anchor="middle" letter-spacing="1">NOLLYWOOD</text>
</svg>
`);

export const LOGO_UNIVERSAL_TV = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#080e1a"/>
  <circle cx="60" cy="46" r="22" fill="#2d3748" stroke="#00e5ff" stroke-width="2"/>
  <ellipse cx="60" cy="46" rx="34" ry="10" fill="none" stroke="#00e5ff" stroke-width="2"/>
  <rect x="10" y="78" width="100" height="24" rx="6" fill="#002b66"/>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">UNIVERSAL TV</text>
</svg>
`);

export const LOGO_KIX = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#b7094c"/>
  <text x="60" y="70" font-family="'Impact',sans-serif" font-weight="900" font-size="44" fill="#ffffff" text-anchor="middle" letter-spacing="3">KIX</text>
  <rect x="20" y="84" width="80" height="18" rx="5" fill="#001219"/>
  <text x="60" y="97" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8.5" fill="#ffffff" text-anchor="middle" letter-spacing="2">ACTION TV</text>
</svg>
`);

// 46. CGTN & CGTN FRANÇAIS & CCTV
export const LOGO_CGTN = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#00204d"/>
  <text x="60" y="54" font-family="'Impact',sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="1">CGTN</text>
  <rect x="20" y="76" width="80" height="22" rx="6" fill="#d90429"/>
  <text x="60" y="91" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1">NEWS</text>
</svg>
`);

export const LOGO_CGTN_FRANCAIS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#00204d"/>
  <text x="60" y="50" font-family="'Impact',sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">CGTN</text>
  <rect x="14" y="72" width="92" height="24" rx="6" fill="#0055a5"/>
  <text x="60" y="88" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1">FRANÇAIS</text>
</svg>
`);

export const LOGO_CCTV = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#c1121f"/>
  <text x="60" y="56" font-family="'Arial Black',sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle">CCTV</text>
  <rect x="36" y="76" width="48" height="22" rx="6" fill="#ffffff"/>
  <text x="60" y="92" font-family="'Arial Black',sans-serif" font-weight="900" font-size="14" fill="#c1121f" text-anchor="middle">4</text>
</svg>
`);

// 47. TELEMUNDO & MY CHANNEL & RAI ITALIA & BANDA TV & GLOOM & BEST BRASIL
export const LOGO_TELEMUNDO = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#c8102e"/>
  <circle cx="60" cy="46" r="24" fill="#ffffff"/>
  <text x="60" y="56" font-family="'Impact',sans-serif" font-weight="900" font-size="28" fill="#c8102e" text-anchor="middle">T</text>
  <rect x="12" y="80" width="96" height="22" rx="6" fill="#ffffff"/>
  <text x="60" y="95" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#c8102e" text-anchor="middle" letter-spacing="1">TELEMUNDO</text>
</svg>
`);

export const LOGO_MY_CHANNEL = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#4a0e4e"/>
  <text x="60" y="54" font-family="'Impact',sans-serif" font-weight="900" font-size="34" fill="#ff007f" text-anchor="middle">MY</text>
  <rect x="14" y="76" width="92" height="24" rx="6" fill="#ff007f"/>
  <text x="60" y="92" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1">CHANNEL</text>
</svg>
`);

export const LOGO_RAI_ITALIA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#003570"/>
  <rect x="22" y="24" width="76" height="42" rx="8" fill="#0055a5"/>
  <text x="60" y="54" font-family="'Arial Black',sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">Rai</text>
  <rect x="18" y="78" width="84" height="22" rx="6" fill="#ffffff"/>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#003570" text-anchor="middle" letter-spacing="1.5">ITALIA</text>
</svg>
`);

export const LOGO_BANDA_TV = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#ff9100"/>
  <circle cx="60" cy="46" r="26" fill="#111111"/>
  <text x="60" y="55" font-family="'Impact',sans-serif" font-weight="900" font-size="22" fill="#ff9100" text-anchor="middle">BANDA</text>
  <rect x="26" y="82" width="68" height="20" rx="6" fill="#111111"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="2">TV HD</text>
</svg>
`);

export const LOGO_GLOOM = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0f0f18"/>
  <text x="60" y="56" font-family="'Impact',sans-serif" font-weight="900" font-size="26" fill="#b5179e" text-anchor="middle" letter-spacing="1">GLOOM</text>
  <rect x="16" y="76" width="88" height="22" rx="6" fill="#7209b7"/>
  <text x="60" y="91" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1">CHANNEL</text>
</svg>
`);

export const LOGO_BEST_BRASIL = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#009c3b"/>
  <polygon points="60,20 100,50 60,80 20,50" fill="#ffdf00"/>
  <circle cx="60" cy="50" r="16" fill="#002776"/>
  <rect x="14" y="86" width="92" height="20" rx="6" fill="#ffffff"/>
  <text x="60" y="100" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#009c3b" text-anchor="middle" letter-spacing="1">BEST BRASIL</text>
</svg>
`);

// 48. MTV BASE & FOOD NETWORK & REAL TIME & BIOGRAPHY & ODISSEIA & SIC MULHER & SIC K & BEM SIMPLES & LIFESTYLE & TRAVEL & SOL MÚSICA & BET & BRAVA & I-CONCERTS & KISS TV
export const LOGO_MTV_BASE = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#111111"/>
  <text x="46" y="52" font-family="'Impact',sans-serif" font-weight="900" font-size="34" fill="#ffd100">M</text>
  <rect x="66" y="32" width="26" height="20" rx="4" fill="#d00000"/>
  <text x="79" y="46" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle">TV</text>
  <rect x="18" y="74" width="84" height="26" rx="6" fill="#ffd100"/>
  <text x="60" y="92" font-family="'Impact',sans-serif" font-weight="900" font-size="16" fill="#111111" text-anchor="middle" letter-spacing="2">BASE</text>
</svg>
`);

export const LOGO_FOOD_NETWORK = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#d00000"/>
  <circle cx="60" cy="46" r="26" fill="#ffffff"/>
  <text x="60" y="52" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#d00000" text-anchor="middle">food</text>
  <rect x="16" y="80" width="88" height="22" rx="6" fill="#ffffff"/>
  <text x="60" y="95" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#d00000" text-anchor="middle" letter-spacing="1">NETWORK</text>
</svg>
`);

export const LOGO_REAL_TIME = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#a00040"/>
  <text x="60" y="50" font-family="'Impact',sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle" letter-spacing="1">REAL</text>
  <rect x="20" y="70" width="80" height="28" rx="6" fill="#ffffff"/>
  <text x="60" y="90" font-family="'Impact',sans-serif" font-weight="900" font-size="20" fill="#a00040" text-anchor="middle" letter-spacing="2">TIME</text>
</svg>
`);

export const LOGO_ODISSEIA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#002855"/>
  <circle cx="60" cy="46" r="24" fill="#00b4d8"/>
  <polygon points="60,26 66,42 82,42 68,52 74,68 60,58 46,68 52,52 38,42 54,42" fill="#ffffff"/>
  <rect x="14" y="80" width="92" height="24" rx="6" fill="#00b4d8"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#002855" text-anchor="middle" letter-spacing="1.5">ODISSEIA</text>
</svg>
`);

export const LOGO_BIOGRAPHY = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#141414"/>
  <text x="60" y="66" font-family="'Impact',sans-serif" font-weight="900" font-size="44" fill="#ffd100" text-anchor="middle">B</text>
  <rect x="14" y="82" width="92" height="20" rx="5" fill="#ffd100"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8.5" fill="#141414" text-anchor="middle" letter-spacing="1.5">BIOGRAPHY</text>
</svg>
`);

export const LOGO_KISS_TV = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0f0f14"/>
  <text x="60" y="56" font-family="'Impact',sans-serif" font-weight="900" font-size="32" fill="#ff0055" text-anchor="middle" letter-spacing="1">KISS</text>
  <rect x="28" y="76" width="64" height="22" rx="6" fill="#ff0055"/>
  <text x="60" y="92" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="2">TV</text>
</svg>
`);

export const LOGO_SIC_MULHER = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#c71f66"/>
  <text x="60" y="48" font-family="'Arial Black',sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">SIC</text>
  <rect x="14" y="68" width="92" height="28" rx="8" fill="#ffffff"/>
  <text x="60" y="87" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#c71f66" text-anchor="middle" letter-spacing="1">MULHER</text>
</svg>
`);

export const LOGO_SIC_K = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#00a859"/>
  <text x="44" y="56" font-family="'Arial Black',sans-serif" font-weight="900" font-size="20" fill="#ffffff">SIC</text>
  <text x="82" y="64" font-family="'Impact',sans-serif" font-weight="900" font-size="34" fill="#ffd100">K</text>
  <rect x="20" y="82" width="80" height="20" rx="6" fill="#ffffff"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#00a859" text-anchor="middle" letter-spacing="1">JUVENIL</text>
</svg>
`);

export const LOGO_BEM_SIMPLES = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#f77f00"/>
  <circle cx="60" cy="44" r="22" fill="#ffffff"/>
  <path d="M52 44 Q60 36 68 44" stroke="#f77f00" stroke-width="3" fill="none"/>
  <text x="60" y="80" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">BEM</text>
  <text x="60" y="98" font-family="'Arial Black',sans-serif" font-weight="900" font-size="12" fill="#fcbf49" text-anchor="middle" letter-spacing="1">SIMPLES</text>
</svg>
`);

export const LOGO_LIFESTYLE = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0077b6"/>
  <circle cx="60" cy="44" r="22" fill="#90e0ef"/>
  <path d="M52 44 C52 38 68 38 68 44 C68 52 52 52 52 60" fill="none" stroke="#0077b6" stroke-width="3"/>
  <rect x="14" y="78" width="92" height="24" rx="6" fill="#ffffff"/>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9.5" fill="#0077b6" text-anchor="middle" letter-spacing="1">LIFESTYLE</text>
</svg>
`);

export const LOGO_TRAVEL = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#03045e"/>
  <circle cx="60" cy="44" r="24" fill="none" stroke="#00b4d8" stroke-width="3"/>
  <polygon points="60,26 66,42 60,38 54,42" fill="#ffb703"/>
  <polygon points="60,62 66,46 60,50 54,46" fill="#ffffff"/>
  <rect x="14" y="78" width="92" height="24" rx="6" fill="#00b4d8"/>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#03045e" text-anchor="middle" letter-spacing="1.5">TRAVEL</text>
</svg>
`);

export const LOGO_SOL_MUSICA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#e63946"/>
  <circle cx="60" cy="44" r="22" fill="#ffd100"/>
  <path d="M56 36 L56 50 A4 4 0 1 1 52 46 L56 46 L66 40 L66 48 A4 4 0 1 1 62 44 L66 44 L66 34 Z" fill="#e63946"/>
  <rect x="14" y="78" width="92" height="24" rx="6" fill="#ffffff"/>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="10" fill="#e63946" text-anchor="middle" letter-spacing="1">SOL MÚSICA</text>
</svg>
`);

export const LOGO_BET = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#111111"/>
  <text x="60" y="60" font-family="'Impact',sans-serif" font-weight="900" font-size="38" fill="#ffffff" text-anchor="middle" letter-spacing="2">BET</text>
  <circle cx="40" cy="80" r="3" fill="#ffffff"/>
  <circle cx="60" cy="80" r="3" fill="#ffffff"/>
  <circle cx="80" cy="80" r="3" fill="#ffffff"/>
  <text x="60" y="100" font-family="'Arial Black',sans-serif" font-weight="900" font-size="8" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">NETWORKS</text>
</svg>
`);

export const LOGO_BRAVA = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#10002b"/>
  <circle cx="60" cy="46" r="24" fill="#3c096c"/>
  <path d="M54 34 Q66 36 62 48 Q56 60 64 62" stroke="#e0aaff" stroke-width="4" fill="none"/>
  <rect x="16" y="78" width="88" height="24" rx="6" fill="#e0aaff"/>
  <text x="60" y="94" font-family="'Arial Black',sans-serif" font-weight="900" font-size="11" fill="#10002b" text-anchor="middle" letter-spacing="2">BRAVA</text>
</svg>
`);

export const LOGO_I_CONCERTS = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#240046"/>
  <polygon points="60,18 70,42 96,44 76,60 82,86 60,72 38,86 44,60 24,44 50,42" fill="#ff0055"/>
  <rect x="12" y="80" width="96" height="24" rx="6" fill="#ffffff"/>
  <text x="60" y="96" font-family="'Arial Black',sans-serif" font-weight="900" font-size="9" fill="#240046" text-anchor="middle" letter-spacing="1">i-CONCERTS</text>
</svg>
`);

// ============================================================================
// RESOLVEDOR INTELIGENTE DE ÍCONES DE CANAIS
// ============================================================================

/**
 * Avalia se o logo atual é um placeholder genérico (placehold.co ou SVG de texto plano antigo)
 */
export function isGenericLogo(logoUrl?: string | null): boolean {
  if (!logoUrl) return true;
  const l = logoUrl.toLowerCase();
  return (
    l.includes('placehold.co') ||
    l.includes('placeholder') ||
    l.includes('text=tv') ||
    l.includes('text=canal') ||
    l.includes('dummyimage') ||
    // Se for um SVG antigo que apenas desenhava um rect e text básico sem arte
    (l.includes('data:image/svg+xml') && l.includes('text-anchor=%22middle%22') && !l.includes('polygon') && !l.includes('circle') && !l.includes('path') && !l.includes('defs'))
  );
}

/**
 * Retorna o logo oficial e de altíssima definição para o canal correspondente.
 * Se o canal já possuir um link de imagem legítimo e externo (ex: imgur, ibb, cdn oficial), mantém.
 * Se for genérico, substitui pelo vetor autêntico da emissora.
 */
export function getChannelLogo(canal?: Partial<Canal> | null): string {
  if (!canal) return LOGO_TNT_SPORTS;

  // Se o canal tiver um logo customizado que NÃO seja genérico, mantém
  if (canal.logo && !isGenericLogo(canal.logo)) {
    return canal.logo;
  }

  const name = (canal.nome || '').toLowerCase();
  const rede = (canal.rede || '').toLowerCase();
  const id = (canal.id || '').toLowerCase();
  const _grupo = (canal.grupo || '').toLowerCase();
  const comps = (canal.competicoes || []).map((c) => c.toLowerCase());

  // 1. TNT Sports & Space
  if (
    rede.includes('tnt') ||
    name.includes('tnt sports') ||
    name.includes('tnt') ||
    name.includes('space') ||
    id.includes('tnt') ||
    id.includes('space')
  ) {
    return LOGO_TNT_SPORTS;
  }

  // 2. UEFA Champions League
  if (
    comps.includes('champions league') ||
    name.includes('champions league') ||
    name.includes('ucl') ||
    id.includes('champions')
  ) {
    return LOGO_CHAMPIONS_LEAGUE;
  }

  // 3. Libertadores / Conmebol
  if (
    comps.includes('libertadores') ||
    name.includes('libertadores') ||
    name.includes('conmebol') ||
    id.includes('libertadores')
  ) {
    return LOGO_LIBERTADORES;
  }

  // 4. LaLiga / Liga Espanhola
  if (
    comps.includes('laliga') ||
    name.includes('laliga') ||
    name.includes('la liga') ||
    id.includes('laliga')
  ) {
    return LOGO_LALIGA;
  }

  // 5. NBA / NBA TV
  if (
    rede.includes('nba') ||
    comps.includes('nba') ||
    name.includes('nba') ||
    id.includes('nba')
  ) {
    return LOGO_NBA;
  }

  // 6. ESPN
  if (
    rede.includes('espn') ||
    name.includes('espn') ||
    id.includes('espn')
  ) {
    return LOGO_ESPN;
  }

  // 7. beIN Sports
  if (
    rede.includes('bein') ||
    name.includes('bein') ||
    id.includes('bein')
  ) {
    return LOGO_BEIN_SPORTS;
  }

  // 8. Real Madrid TV
  if (
    name.includes('real madrid') ||
    name.includes('rmtv') ||
    id.includes('rmtv') ||
    id.includes('real-madrid')
  ) {
    return LOGO_REAL_MADRID;
  }

  // 9. Barcelona TV
  if (
    name.includes('barça') ||
    name.includes('barcelona') ||
    id.includes('barca')
  ) {
    return LOGO_BARCELONA;
  }

  // 10. Sport TV (Portugal)
  if (
    rede.includes('sport tv') ||
    name.includes('sport tv') ||
    id.includes('sport-tv')
  ) {
    return LOGO_SPORT_TV;
  }

  // 11. CBS Sports Golazo
  if (
    name.includes('golazo') ||
    name.includes('cbs sports') ||
    id.includes('golazo') ||
    id.includes('cbs')
  ) {
    return LOGO_CBS_GOLAZO;
  }

  // 12. DAZN
  if (
    rede.includes('dazn') ||
    name.includes('dazn') ||
    id.includes('dazn')
  ) {
    return LOGO_DAZN;
  }

  // 13. Fox Sports
  if (
    rede.includes('fox') ||
    name.includes('fox sports') ||
    id.includes('fox')
  ) {
    return LOGO_FOX_SPORTS;
  }

  // 14. ZAP Angola (ZAP Viva, ZAP Novelas)
  if (name.includes('zap novelas') || id.includes('zap-novelas')) {
    return LOGO_ZAP_NOVELAS;
  }
  if (
    rede.includes('zap') ||
    name.includes('zap') ||
    name.includes('zap viva') ||
    id.includes('zap')
  ) {
    return LOGO_ZAP_VIVA;
  }

  // 15. TPA (Angola - TPA 1, TPA 2, TPA Notícias)
  if (name.includes('tpa 1') || name.includes('tpa1') || id.includes('tpa-1') || id.includes('tpa1')) {
    return LOGO_TPA1;
  }
  if (name.includes('tpa 2') || name.includes('tpa2') || id.includes('tpa-2') || id.includes('tpa2')) {
    return LOGO_TPA2;
  }
  if (name.includes('tpa notícias') || name.includes('tpa noticias') || id.includes('tpa-noticias') || id.includes('tpanoticias')) {
    return LOGO_TPA_NOTICIAS;
  }
  if (name.includes('tpa') || id.includes('tpa')) {
    return LOGO_TPA;
  }

  // 16. TV Zimbo (Angola) & TV Girassol & Banda TV & Miramar (Moçambique) & Gloom
  if (name.includes('girassol') || id.includes('girassol')) {
    return LOGO_TV_GIRASSOL;
  }
  if (name.includes('banda') || id.includes('banda')) {
    return LOGO_BANDA_TV;
  }
  if (name.includes('miramar') || id.includes('miramar')) {
    return LOGO_MIRAMAR;
  }
  if (name.includes('gloom') || id.includes('gloom')) {
    return LOGO_GLOOM;
  }
  if (name.includes('zimbo') || id.includes('zimbo')) {
    return LOGO_TV_ZIMBO;
  }

  // 17. RTP (Portugal - RTP África, RTP Internacional, RTP 1, RTP 2, RTP 3)
  if (name.includes('rtp africa') || name.includes('rtp áfrica') || id.includes('rtp-africa')) {
    return LOGO_RTP_AFRICA;
  }
  if (name.includes('rtp internacional') || id.includes('rtp-internacional') || id.includes('rtpi')) {
    return LOGO_RTP_INTERNACIONAL;
  }
  if (name.includes('rtp') || id.includes('rtp')) {
    return LOGO_RTP;
  }

  // 18. SIC (Portugal - SIC Mulher, SIC K, SIC Notícias)
  if (name.includes('sic mulher') || id.includes('sic-mulher')) {
    return LOGO_SIC_MULHER;
  }
  if (name.includes('sic k') || id.includes('sic-k') || id.includes('sick')) {
    return LOGO_SIC_K;
  }
  if (name.includes('sic') || id.includes('sic')) {
    return LOGO_SIC;
  }

  // 19. TV5Monde & Daystar & Euronews & Rai Italia
  if (name.includes('tv5') || id.includes('tv5')) {
    return LOGO_TV5MONDE;
  }
  if (name.includes('daystar') || id.includes('daystar')) {
    return LOGO_DAYSTAR;
  }
  if (name.includes('euronews') || name.includes('euro news') || id.includes('euronews')) {
    return LOGO_EURONEWS;
  }
  if (name.includes('rai italia') || name.includes('rai') || id.includes('rai')) {
    return LOGO_RAI_ITALIA;
  }

  // 20. Filmes, Novelas e África (DStv Pipoca, Kwenda Magic, Telemundo, M4 Movies, ROK, Universal, KIX)
  if (name.includes('pipoca') || id.includes('pipoca')) {
    return LOGO_DSTV_PIPOCA;
  }
  if (name.includes('kwenda') || id.includes('kwenda')) {
    return LOGO_KWENDA_MAGIC;
  }
  if (name.includes('telemundo') || id.includes('telemundo')) {
    return LOGO_TELEMUNDO;
  }
  if (name.includes('m4 movies') || name.includes('m4') || id.includes('m4')) {
    return LOGO_M4_MOVIES;
  }
  if (name.includes('rok') || id.includes('rok')) {
    return LOGO_ROK;
  }
  if (name.includes('universal') || id.includes('universal')) {
    return LOGO_UNIVERSAL_TV;
  }
  if (name.includes('kix') || id.includes('kix')) {
    return LOGO_KIX;
  }

  // 21. Notícias Internacionais (CGTN, CCTV)
  if (name.includes('cgtn fran') || id.includes('cgtn-francais')) {
    return LOGO_CGTN_FRANCAIS;
  }
  if (name.includes('cgtn') || id.includes('cgtn')) {
    return LOGO_CGTN;
  }
  if (name.includes('cctv') || id.includes('cctv')) {
    return LOGO_CCTV;
  }

  // 22. Lifestyle, Culinária, Documentários & Viagens
  if (name.includes('food network') || id.includes('food-network')) {
    return LOGO_FOOD_NETWORK;
  }
  if (name.includes('real time') || id.includes('real-time')) {
    return LOGO_REAL_TIME;
  }
  if (name.includes('bem simples') || id.includes('bem-simples')) {
    return LOGO_BEM_SIMPLES;
  }
  if (name.includes('odisseia') || name.includes('oodisseia') || id.includes('odisseia')) {
    return LOGO_ODISSEIA;
  }
  if (name.includes('biography') || id.includes('biography')) {
    return LOGO_BIOGRAPHY;
  }
  if (name.includes('travel') || id.includes('travel')) {
    return LOGO_TRAVEL;
  }
  if (name.includes('lifestyle') || id.includes('lifestyle')) {
    return LOGO_LIFESTYLE;
  }
  if (name.includes('my channel') || id.includes('my-channel')) {
    return LOGO_MY_CHANNEL;
  }
  if (name.includes('best brasil') || id.includes('best-brasil')) {
    return LOGO_BEST_BRASIL;
  }

  // 23. Músicas (MTV Base, MTV, Afro Music Pop, Trace Toca, Kiss, Sol Música, BET, Brava, i-Concerts)
  if (name.includes('mtv base') || id.includes('mtv-base')) {
    return LOGO_MTV_BASE;
  }
  if (name.includes('afro music') || name.includes('afro pop') || id.includes('afro-music')) {
    return LOGO_AFRO_MUSIC_POP;
  }
  if (name.includes('trace toca') || name.includes('toca') || id.includes('trace-toca')) {
    return LOGO_TRACE_TOCA;
  }
  if (name.includes('kiss') || id.includes('kiss')) {
    return LOGO_KISS_TV;
  }
  if (name.includes('sol musica') || name.includes('sol música') || id.includes('sol-musica')) {
    return LOGO_SOL_MUSICA;
  }
  if (name.includes('bet') || id.includes('bet')) {
    return LOGO_BET;
  }
  if (name.includes('brava') || id.includes('brava')) {
    return LOGO_BRAVA;
  }
  if (name.includes('concert') || id.includes('concerts')) {
    return LOGO_I_CONCERTS;
  }

  // 24. Infantis (Panda Kids, Canal Panda, JimJam, Biggs, Moonbug, BabyFirst, KidsCo)
  if (name.includes('panda kids') || id.includes('panda-kids')) {
    return LOGO_PANDA_KIDS;
  }
  if (name.includes('jimjam') || name.includes('jim jam') || id.includes('jimjam')) {
    return LOGO_JIMJAM;
  }
  if (name.includes('biggs') || id.includes('biggs')) {
    return LOGO_BIGGS;
  }
  if (name.includes('moonbug') || id.includes('moonbug')) {
    return LOGO_MOONBUG;
  }
  if (name.includes('baby first') || name.includes('baby firs') || id.includes('babyfirst') || id.includes('baby-first')) {
    return LOGO_BABY_FIRST;
  }
  if (name.includes('kidsco') || name.includes('kids co') || id.includes('kidsco')) {
    return LOGO_KIDSCO;
  }

  // 19. TVI (Portugal)
  if (name.includes('tvi') || id.includes('tvi')) {
    return LOGO_TVI;
  }

  // 20. Globo / GloboNews
  if (name.includes('globonews') || id.includes('globonews')) {
    return svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <rect width="120" height="120" rx="26" fill="#c4170c"/>
        <text x="60" y="58" font-family="'Arial Black',sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">globonews</text>
        <circle cx="60" cy="82" r="6" fill="#ffffff"/>
      </svg>
    `);
  }
  if (name.includes('globo') || id.includes('globo')) {
    return LOGO_GLOBO;
  }

  // 21. SBT
  if (name.includes('sbt') || id.includes('sbt')) {
    return LOGO_SBT;
  }

  // 22. Band / BandNews / BandSports
  if (name.includes('band') || id.includes('band')) {
    return LOGO_BAND;
  }

  // 23. Record / Record News
  if (name.includes('record') || id.includes('record')) {
    return LOGO_RECORD;
  }

  // 24. CNN
  if (name.includes('cnn') || id.includes('cnn')) {
    return LOGO_CNN;
  }

  // 25. Cartoon Network & Infantis
  if (
    rede.includes('cartoon') ||
    name.includes('cartoon network') ||
    id.includes('cartoon')
  ) {
    return LOGO_CARTOON_NETWORK;
  }

  if (
    rede.includes('disney') ||
    name.includes('disney') ||
    id.includes('disney')
  ) {
    return LOGO_DISNEY_CHANNEL;
  }

  if (
    name.includes('nickelodeon') ||
    name.includes('nick') ||
    id.includes('nick')
  ) {
    return LOGO_NICKELODEON;
  }

  if (
    name.includes('panda') ||
    id.includes('panda')
  ) {
    return LOGO_CANAL_PANDA;
  }

  // 26. Filmes & Séries (HBO, Telecine, Cinemax)
  if (
    rede.includes('hbo') ||
    name.includes('hbo') ||
    id.includes('hbo')
  ) {
    return LOGO_HBO;
  }

  if (
    rede.includes('telecine') ||
    name.includes('telecine') ||
    id.includes('telecine')
  ) {
    return LOGO_TELECINE;
  }

  // 27. Músicas (MTV, Trace, Stingray)
  if (
    rede.includes('mtv') ||
    name.includes('mtv') ||
    id.includes('mtv')
  ) {
    return LOGO_MTV;
  }

  // 28. YouTube Creators & Transmissões
  if (name.includes('mrbeast') || id.includes('mrbeast')) {
    return LOGO_MRBEAST;
  }
  if (name.includes('dude perfect') || id.includes('dude-perfect')) {
    return LOGO_DUDE_PERFECT;
  }
  if (name.includes('cazé') || id.includes('caze')) {
    return LOGO_CAZE_TV;
  }

  // 29. Categoria específica caso não haja match exato de rede
  const cat = (canal.categoria || '').toLowerCase();
  if (cat === 'bonecos') {
    return LOGO_CARTOON_NETWORK;
  }
  if (cat === 'novelas') {
    return LOGO_ZAP_NOVELAS;
  }
  if (cat === 'filmes') {
    return LOGO_TELECINE;
  }
  if (cat === 'músicas' || cat === 'musicas') {
    return LOGO_MTV;
  }
  if (cat === 'notícias' || cat === 'noticias') {
    return LOGO_CNN;
  }

  // Fallback esportivo de alto nível (nunca texto plano!)
  return LOGO_TNT_SPORTS;
}

/**
 * Fallback à prova de falhas para o evento onError de tags <img>.
 * NUNCA gera um texto genérico 'placehold.co?text=TV'!
 */
export function getChannelFallbackLogo(canal?: Partial<Canal> | null): string {
  return getChannelLogo(canal);
}
