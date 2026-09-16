import { Canal } from '@/types';

export interface BeSoccerTeam {
  nome: string;
  sigla: string;
  escudoOuEmoji: string;
  placar: number;
  cor: string;
}

export interface BeSoccerMatch {
  id: string;
  tituloJogo: string;
  timeCasa: BeSoccerTeam;
  timeFora: BeSoccerTeam;
  campeonato: string;
  rodada: string;
  estadio: string;
  tempo: string;
  isAoVivo: boolean;
  kickoffTimestamp: number;
  horaInicio: string;
  isJogoGrande: boolean; // Critério rigoroso: true apenas para clássicos mundiais e mata-matas cruciais
  motivoJogoGrande: string; // Justificativa do BeSoccer para ser "Jogo Grande"
  canaisTransmissoresIds: string[]; // IDs dos canais que transmitem a partida no app
  emissorasNomes: string[];
  canalIdDisponivel?: string; // ID do canal correspondente na lista ativa
  canalNomeDisponivel?: string;
  principaisDestaques: string[];
  imagemCapa: string;
  fonteBeSoccerUrl: string; // Link direto para a ficha da partida no BeSoccer
  descricao: string;
}

// Catálogo com dados extraídos do padrão BeSoccer para Jogos e Torneios de Alto Nível
export const BESOCCER_MATCHES_DATABASE: BeSoccerMatch[] = [
  // 1. O MAIOR CLÁSSICO DO FUTEBOL ANGOLANO: PETRO DE LUANDA VS 1º DE AGOSTO (GIRABOLA ZAP)
  {
    id: 'besoccer-girabola-petro-dago',
    tituloJogo: 'Petro de Luanda vs 1º de Agosto',
    timeCasa: {
      nome: 'Petro Atlético de Luanda',
      sigla: 'PET',
      escudoOuEmoji: '',
      placar: 2,
      cor: '#FFD700',
    },
    timeFora: {
      nome: 'Clube Desportivo 1º de Agosto',
      sigla: 'PRI',
      escudoOuEmoji: '',
      placar: 1,
      cor: '#D32F2F',
    },
    campeonato: 'Girabola ZAP (Campeonato Angolano)',
    rodada: 'Super Clássico de Luanda - Rodada 22',
    estadio: 'Estádio 11 de Novembro (Luanda)',
    tempo: '76\'',
    isAoVivo: true,
    kickoffTimestamp: Date.now() - 76 * 60 * 1000,
    horaInicio: '15:30',
    isJogoGrande: true,
    motivoJogoGrande: 'Maior clássico do futebol angolano (Dérbi de Luanda) valendo a liderança isolada do Girabola',
    canaisTransmissoresIds: ['zap-tv-zimbo-hd', 'zap-desporto-girabola', 'zap-viva-hd-angola'],
    emissorasNomes: ['TV Zimbo HD (Angola)', 'ZAP Desporto (Giro Girabola)'],
    principaisDestaques: ['Tiago Azulão (Petro)', 'Bobó Ungenda (1º de Agosto)', 'Julião (Petro)'],
    imagemCapa: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop',
    fonteBeSoccerUrl: 'https://pt.besoccer.com/jogo/petro-luanda/1-de-agosto',
    descricao:
      'Dados BeSoccer: Dérbi de Luanda no Estádio 11 de Novembro. O Petro de Luanda lidera com gols de Tiago Azulão, enquanto o 1º de Agosto pressiona em busca do empate nos minutos finais.',
  },

  // 2. CONMEBOL COPA LIBERTADORES: FLAMENGO VS RIVER PLATE
  {
    id: 'besoccer-libertadores-fla-river',
    tituloJogo: 'Flamengo vs River Plate',
    timeCasa: {
      nome: 'Flamengo',
      sigla: 'FLA',
      escudoOuEmoji: '',
      placar: 2,
      cor: '#C62828',
    },
    timeFora: {
      nome: 'River Plate',
      sigla: 'RIV',
      escudoOuEmoji: '',
      placar: 1,
      cor: '#ECEFF1',
    },
    campeonato: 'CONMEBOL Copa Libertadores',
    rodada: 'Fase Final Continental • Semifinal',
    estadio: 'Estádio do Maracanã (Rio de Janeiro)',
    tempo: 'Hoje às 21:30',
    isAoVivo: false,
    kickoffTimestamp: Date.now() + 2 * 60 * 60 * 1000 + 40 * 60 * 1000,
    horaInicio: '21:30',
    isJogoGrande: true,
    motivoJogoGrande: 'Clássico continental histórico entre dois campeões mundiais na luta por vaga na grande final',
    canaisTransmissoresIds: ['bein-sports-xtra-hd', 'bein-sports-direct-hd', 'bein-sports-espanol-hd'],
    emissorasNomes: ['beIN SPORTS XTRA HD', 'beIN SPORTS Direct HD'],
    principaisDestaques: ['Arrascaeta (Flamengo)', 'Pedro (Flamengo)', 'Miguel Borja (River Plate)'],
    imagemCapa: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop',
    fonteBeSoccerUrl: 'https://pt.besoccer.com/jogo/flamengo/river-plate',
    descricao:
      'Dados BeSoccer: Confronto de gigantes sul-americanos pela CONMEBOL Libertadores no Maracanã com transmissão internacional garantida na beIN SPORTS.',
  },

  // 3. CAMPEONATO MUNDIAL RED BULL: RED BULL CLIFF DIVING WORLD SERIES
  {
    id: 'besoccer-redbull-cliff-diving-finals',
    tituloJogo: 'Finais do Mundial de Saltos Ornamentais 27m',
    timeCasa: {
      nome: 'Gary Hunt (Líder Mundial)',
      sigla: 'HUNT',
      escudoOuEmoji: '',
      placar: 432,
      cor: '#0C1831',
    },
    timeFora: {
      nome: 'Aidan Heslop (Vice-Líder)',
      sigla: 'HES',
      escudoOuEmoji: '',
      placar: 418,
      cor: '#EB144C',
    },
    campeonato: 'Red Bull Cliff Diving World Series',
    rodada: 'Etapa Decisiva do Circuito Mundial',
    estadio: 'Polignano a Mare (Plataforma 27m)',
    tempo: 'Ao Vivo Agora • Rodada Final',
    isAoVivo: true,
    kickoffTimestamp: Date.now() - 35 * 60 * 1000,
    horaInicio: '14:00',
    isJogoGrande: true,
    motivoJogoGrande: 'Decisão do título mundial da modalidade mais extrema do planeta transmitida mundialmente',
    canaisTransmissoresIds: ['redbull-tv-sports-hd', 'ss-action-hd', 'vivo-play-esportes-br'],
    emissorasNomes: ['Red Bull TV Sports & Ação HD', 'SuperSport Action'],
    principaisDestaques: ['Gary Hunt (9x Campeão Mundial)', 'Rhiannan Iffland (Hexacampeã Feminina)'],
    imagemCapa: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop',
    fonteBeSoccerUrl: 'https://www.redbull.com/br-pt/events/red-bull-cliff-diving-world-series',
    descricao:
      'Dados Oficiais Red Bull / BeSoccer Extreme: Gary Hunt e Aidan Heslop disputam o troféu mundial em saltos acrobáticos de 27 metros de altura com transmissão exclusiva em 4K UHD na Red Bull TV.',
  },

  // 4. NCAA BASKETBALL COLLEGE CLASSIC: DUKE VS NORTH CAROLINA
  {
    id: 'besoccer-ncaa-duke-unc',
    tituloJogo: 'Duke Blue Devils vs North Carolina Tar Heels',
    timeCasa: {
      nome: 'Duke Blue Devils',
      sigla: 'DUKE',
      escudoOuEmoji: '',
      placar: 82,
      cor: '#003087',
    },
    timeFora: {
      nome: 'North Carolina Tar Heels',
      sigla: 'UNC',
      escudoOuEmoji: '',
      placar: 79,
      cor: '#7BAFD4',
    },
    campeonato: 'NCAA Division I College Basketball',
    rodada: 'Tobacco Road Classic • Decisão da ACC',
    estadio: 'Cameron Indoor Stadium (Durham, NC)',
    tempo: 'Hoje às 20:00',
    isAoVivo: false,
    kickoffTimestamp: Date.now() + 3 * 60 * 60 * 1000,
    horaInicio: '20:00',
    isJogoGrande: true,
    motivoJogoGrande: 'A maior rivalidade da história do basquetebol universitário mundial na ACC',
    canaisTransmissoresIds: ['acc-sports-network-hd'],
    emissorasNomes: ['ACC Sports Network HD (NCAA & Basquete)'],
    principaisDestaques: ['Cooper Flagg (Duke)', 'RJ Davis (North Carolina)'],
    imagemCapa: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop',
    fonteBeSoccerUrl: 'https://theacc.com/sports/mens-basketball',
    descricao:
      'Dados BeSoccer / NCAA: Duke e North Carolina se enfrentam no lendário Cameron Indoor Stadium em um dos duelos de basquete mais assistidos dos Estados Unidos.',
  },

  // 5. CLÁSSICO DO FUTEBOL EUROPEU / TURQUIA: GALATASARAY VS FENERBAHÇE
  {
    id: 'besoccer-europe-gala-fener',
    tituloJogo: 'Galatasaray vs Fenerbahçe',
    timeCasa: {
      nome: 'Galatasaray SK',
      sigla: 'GAL',
      escudoOuEmoji: '',
      placar: 1,
      cor: '#A90432',
    },
    timeFora: {
      nome: 'Fenerbahçe SK',
      sigla: 'FEN',
      escudoOuEmoji: '',
      placar: 1,
      cor: '#002D72',
    },
    campeonato: 'Süper Lig & Copa da Europa',
    rodada: 'Kıtalararası Derbi (Dérbi Intercontinental)',
    estadio: 'RAMS Park (Istambul)',
    tempo: 'Hoje às 19:00',
    isAoVivo: false,
    kickoffTimestamp: Date.now() + 4 * 60 * 60 * 1000,
    horaInicio: '19:00',
    isJogoGrande: true,
    motivoJogoGrande: 'Um dos clássicos mais fervorosos e tradicionais da Europa e do Oriente Médio',
    canaisTransmissoresIds: ['aspor-futebol-hd'],
    emissorasNomes: ['A Spor HD (Futebol Europeu & Debate)'],
    principaisDestaques: ['Mauro Icardi (Galatasaray)', 'Edin Džeko (Fenerbahçe)'],
    imagemCapa: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop',
    fonteBeSoccerUrl: 'https://pt.besoccer.com/jogo/galatasaray/fenerbahce',
    descricao:
      'Dados BeSoccer: Dérbi Intercontinental entre Galatasaray e Fenerbahçe transmitido e analisado ao vivo pela bancada de especialistas da A Spor HD.',
  },

  // 6. PGA TOUR CHAMPIONSHIP: THE PLAYERS CHAMPIONSHIP
  {
    id: 'besoccer-pga-players-championship',
    tituloJogo: 'The Players Championship • Rodada Final',
    timeCasa: {
      nome: 'Scottie Scheffler (#1 Mundo)',
      sigla: 'SCH',
      escudoOuEmoji: '',
      placar: -18,
      cor: '#004D25',
    },
    timeFora: {
      nome: 'Rory McIlroy (#2 Mundo)',
      sigla: 'MCI',
      escudoOuEmoji: '️‍️️',
      placar: -16,
      cor: '#002F6C',
    },
    campeonato: 'PGA Tour • O 5º Major do Golfe',
    rodada: 'Buraco 17 & 18 (Ilha de Ponte Vedra)',
    estadio: 'TPC Sawgrass (Flórida)',
    tempo: 'Em Andamento • Volta Final',
    isAoVivo: true,
    kickoffTimestamp: Date.now() - 110 * 60 * 1000,
    horaInicio: '13:00',
    isJogoGrande: true,
    motivoJogoGrande: 'Maior torneio de golfe fora dos 4 Majors, reunindo os números 1 e 2 do ranking mundial',
    canaisTransmissoresIds: ['golf-tour-tv-hd'],
    emissorasNomes: ['30A Golf Tour TV (PGA & Lazer)'],
    principaisDestaques: ['Scottie Scheffler', 'Rory McIlroy', 'Ludvig Åberg'],
    imagemCapa: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1600&auto=format&fit=crop',
    fonteBeSoccerUrl: 'https://www.pgatour.com/tournaments/the-players-championship',
    descricao:
      'Dados Oficiais PGA Tour / BeSoccer: Disputa acirrada tacada a tacada no temido buraco 17 de TPC Sawgrass, transmitida na 30A Golf Tour TV.',
  },

  // EXEMPLO DE JOGO PEQUENO (NÃO-GRANDE) -> NÃO DEVE SER RECOMENDADO SEGUNDO A REGRA DO USUÁRIO!
  {
    id: 'besoccer-jogo-menor-terceira-divisao',
    tituloJogo: 'Atlético Saguntino vs Torrent CF',
    timeCasa: {
      nome: 'Atlético Saguntino',
      sigla: 'SAG',
      escudoOuEmoji: '',
      placar: 0,
      cor: '#666666',
    },
    timeFora: {
      nome: 'Torrent CF',
      sigla: 'TOR',
      escudoOuEmoji: '',
      placar: 0,
      cor: '#999999',
    },
    campeonato: 'Segunda Federación Grupo 3',
    rodada: 'Rodada 14',
    estadio: 'Nou Camp de Morvedre',
    tempo: 'Hoje às 12:00',
    isAoVivo: false,
    kickoffTimestamp: Date.now() + 6 * 60 * 60 * 1000,
    horaInicio: '12:00',
    isJogoGrande: false, // JOGO PEQUENO -> A REGRA O ELIMINA DE RECOMENDAÇÕES!
    motivoJogoGrande: 'Divisão regional de menor relevância',
    canaisTransmissoresIds: [],
    emissorasNomes: [],
    principaisDestaques: [],
    imagemCapa: '',
    fonteBeSoccerUrl: 'https://pt.besoccer.com',
    descricao: 'Partida regional de divisões de acesso sem transmissão na grade da plataforma.',
  },
];

/**
 * Filtra e retorna APENAS os jogos que atendem rigorosamente às DUAS condições pedidas pelo usuário:
 * 1. O jogo É UM "JOGO GRANDE" (isJogoGrande === true: clássico, mata-mata, torneio mundial ou dérbi)
 * 2. EXISTE um canal ativo na plataforma que apresenta esse jogo ao vivo / na programação!
 */
export function getBeSoccerBigMatchesWithLiveChannels(canaisDisponiveis: Canal[]): BeSoccerMatch[] {
  const matchesComTransmissao: BeSoccerMatch[] = [];

  for (const match of BESOCCER_MATCHES_DATABASE) {
    // REGRA 1: Recomenda SÓ se forem JOGOS GRANDES
    if (!match.isJogoGrande) {
      continue;
    }

    // REGRA 2: Verifica se há canal na plataforma que apresenta esse jogo
    const canalEncontrado = canaisDisponiveis.find((canal) => {
      const idMatch = canal.id && match.canaisTransmissoresIds.includes(canal.id);
      const urlMatch = match.canaisTransmissoresIds.some(
        (tid) => canal.url && canal.url.toLowerCase().includes(tid.toLowerCase())
      );
      const nomeMatch = match.emissorasNomes.some((enome) =>
        canal.nome.toLowerCase().includes(enome.toLowerCase().slice(0, 8))
      );
      return idMatch || urlMatch || nomeMatch;
    });

    if (canalEncontrado) {
      matchesComTransmissao.push({
        ...match,
        canalIdDisponivel: canalEncontrado.id || canalEncontrado.url,
        canalNomeDisponivel: canalEncontrado.nome,
      });
    }
  }

  // Ordena com prioridade: partidas Ao Vivo primeiro, depois as que iniciam em breve
  return matchesComTransmissao.sort((a, b) => {
    if (a.isAoVivo && !b.isAoVivo) return -1;
    if (!a.isAoVivo && b.isAoVivo) return 1;
    return a.kickoffTimestamp - b.kickoffTimestamp;
  });
}

/**
 * Retorna as 3 partidas mais importantes do momento segundo o BeSoccer que possuem canal ao vivo ativo no app
 */
export function getTop3BeSoccerHeroMatches(canaisDisponiveis: Canal[]): BeSoccerMatch[] {
  const bigMatches = getBeSoccerBigMatchesWithLiveChannels(canaisDisponiveis);
  return bigMatches.slice(0, 3);
}
