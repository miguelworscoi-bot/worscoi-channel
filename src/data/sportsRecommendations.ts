export interface PartidaFamosa {
  id: string;
  titulo: string;
  torneio: string;
  ano: string;
  dataCompleta: string;
  timeCasa: {
    nome: string;
    sigla: string;
    placar: number | string;
    escudoOuEmoji: string;
    cor: string;
  };
  timeFora: {
    nome: string;
    sigla: string;
    placar: number | string;
    escudoOuEmoji: string;
    cor: string;
  };
  destaque: string;
  descricao: string;
  duracao: string;
  qualidade: '4K UHD' | '1080p FHD' | 'HD';
  canalSugeridoNome: string; // Nome do canal que sintoniza (ex: 'beIN Sports 1')
  categoria: 'Futebol' | 'Basquete' | 'Velocidade' | 'Lutas';
  visualizacoes: string;
  banner: string;
  momentosChave: string[];
}

export interface JogoAoVivo {
  id: string;
  campeonato: string;
  fase: string;
  tempo: string; // ex: '78'' ou 'Ao Vivo'
  isAoVivo: boolean;
  timeCasa: {
    nome: string;
    sigla: string;
    placar: number;
    escudo: string;
  };
  timeFora: {
    nome: string;
    sigla: string;
    placar: number;
    escudo: string;
  };
  canalTransmissao: string; // Ex: 'beIN Sports 1', 'ZAP Viva', 'SuperSport'
  estadio: string;
  esporte: 'Futebol' | 'Basquete' | 'Tênis' | 'Lutas';
}

export const PARTIDAS_HISTORICAS: PartidaFamosa[] = [
  {
    id: 'final-copa-2022',
    titulo: 'A Maior Final da História das Copas',
    torneio: 'Copa do Mundo FIFA 2022',
    ano: '2022',
    dataCompleta: '18 de Dezembro de 2022',
    timeCasa: {
      nome: 'Argentina',
      sigla: 'ARG',
      placar: '3 (4)',
      escudoOuEmoji: '',
      cor: '#75AADB',
    },
    timeFora: {
      nome: 'França',
      sigla: 'FRA',
      placar: '3 (2)',
      escudoOuEmoji: '',
      cor: '#002654',
    },
    destaque: 'O Tri da Argentina e a coroação histórica de Lionel Messi',
    descricao:
      'Jogo alucinante com 6 gols, hat-trick de Mbappé, defesa espetacular de Dibu Martínez no último segundo da prorrogação e consagração albiceleste nos pênaltis.',
    duracao: '120 min + Pênaltis',
    qualidade: '4K UHD',
    canalSugeridoNome: 'beIN Sports 1',
    categoria: 'Futebol',
    visualizacoes: '14.8M',
    banner: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    momentosChave: ['Gol de Messi de pênalti', 'Obra de arte de Di María', 'Dois gols relâmpago de Mbappé', 'Defesa milagrosa de Dibu aos 123 min'],
  },
  {
    id: 'milagre-istambul-2005',
    titulo: 'O Milagre de Istambul',
    torneio: 'UEFA Champions League Final',
    ano: '2005',
    dataCompleta: '25 de Maio de 2005',
    timeCasa: {
      nome: 'Liverpool',
      sigla: 'LIV',
      placar: '3 (3)',
      escudoOuEmoji: '',
      cor: '#C8102E',
    },
    timeFora: {
      nome: 'Milan',
      sigla: 'MIL',
      placar: '3 (2)',
      escudoOuEmoji: '',
      cor: '#FB090B',
    },
    destaque: 'De 0x3 no intervalo ao troféu mais emblemático da Europa',
    descricao:
      'O Milan abriu 3x0 em uma aula de futebol no 1º tempo. Em 6 minutos mágicos na segunda etapa, Steven Gerrard e os Reds empataram e venceram na disputa de penalidades.',
    duracao: '120 min + Pênaltis',
    qualidade: '1080p FHD',
    canalSugeridoNome: 'SuperSport Football',
    categoria: 'Futebol',
    visualizacoes: '9.2M',
    banner: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop',
    momentosChave: ['Gol de Maldini no 1º minuto', 'Dobradinha de Crespo', 'Cabeceio de Gerrard incendiando a torcida', 'Dudek e as pernas de espaguete nos pênaltis'],
  },
  {
    id: 'el-clasico-2017',
    titulo: 'El Clásico da Camisa Erguida',
    torneio: 'LaLiga Santander',
    ano: '2017',
    dataCompleta: '23 de Abril de 2017',
    timeCasa: {
      nome: 'Real Madrid',
      sigla: 'RMA',
      placar: 2,
      escudoOuEmoji: '',
      cor: '#FFFFFF',
    },
    timeFora: {
      nome: 'Barcelona',
      sigla: 'BAR',
      placar: 3,
      escudoOuEmoji: '',
      cor: '#A50044',
    },
    destaque: 'Gol 500 de Messi aos 92 minutos no Santiago Bernabéu',
    descricao:
      'Um dos clássicos mais eletrizantes do século XXI. Sangrando em campo, Messi desequilibra o confronto com o último chute da partida e imortaliza a comemoração estendendo sua camisa 10 aos rivais.',
    duracao: '95 min',
    qualidade: '1080p FHD',
    canalSugeridoNome: 'beIN Sports 1',
    categoria: 'Futebol',
    visualizacoes: '11.5M',
    banner: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    momentosChave: ['Duelo direto Cristiano x Messi', 'Gol de empate de James aos 85 min', 'Contra-ataque letal puxado por Sergi Roberto', 'Chute cruzado de canhota de Messi aos 92 min'],
  },
  {
    id: 'final-libertadores-2019',
    titulo: 'A Virada Épica de Lima em 3 Minutos',
    torneio: 'CONMEBOL Libertadores Final',
    ano: '2019',
    dataCompleta: '23 de Novembro de 2019',
    timeCasa: {
      nome: 'Flamengo',
      sigla: 'FLA',
      placar: 2,
      escudoOuEmoji: '',
      cor: '#C3281E',
    },
    timeFora: {
      nome: 'River Plate',
      sigla: 'RIV',
      placar: 1,
      escudoOuEmoji: '',
      cor: '#FFFFFF',
    },
    destaque: 'Gabigol marca aos 89 e 92 minutos e encerra jejum de 38 anos',
    descricao:
      'O River vencia por 1x0 e dominava a grande decisão única até os 44 minutos do 2º tempo, quando Gabigol operou uma das maiores reviravoltas da história do futebol sul-americano.',
    duracao: '96 min',
    qualidade: '1080p FHD',
    canalSugeridoNome: 'beIN Sports 2',
    categoria: 'Futebol',
    visualizacoes: '8.7M',
    banner: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop',
    momentosChave: ['Gol de Borré no 1º tempo', 'Arrancada de Bruno Henrique aos 89', 'Falha de Pinola e chute firme de Gabigol aos 92', 'Festa rubro-negra no Estádio Monumental'],
  },
  {
    id: 'brasil-alemanha-2002',
    titulo: 'O Pentacampeonato Mundial do Brasil',
    torneio: 'Copa do Mundo FIFA 2002',
    ano: '2002',
    dataCompleta: '30 de Junho de 2002',
    timeCasa: {
      nome: 'Brasil',
      sigla: 'BRA',
      placar: 2,
      escudoOuEmoji: '',
      cor: '#FEDD00',
    },
    timeFora: {
      nome: 'Alemanha',
      sigla: 'GER',
      placar: 0,
      escudoOuEmoji: '',
      cor: '#000000',
    },
    destaque: 'A redenção de Ronaldo Fenômeno e o 5º título brasileiro',
    descricao:
      'Em Yokohama no Japão, a seleção brasileira com os três "Rs" (Rivaldo, Ronaldo e Ronaldinho) bateu a temida Alemanha de Oliver Kahn com 2 gols antológicos do Fenômeno.',
    duracao: '90 min',
    qualidade: 'HD',
    canalSugeridoNome: 'ZAP Viva',
    categoria: 'Futebol',
    visualizacoes: '10.3M',
    banner: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop',
    momentosChave: ['Bomba de Rivaldo e rebote de Kahn aproveitado por Ronaldo', 'Corta-luz genial de Rivaldo e segundo gol no cantinho', 'Cafu erguendo a taça com "100% Jardim Irene"'],
  },
  {
    id: 'remontada-barcelona-2017',
    titulo: 'A Inacreditável Remontada do Barça',
    torneio: 'UEFA Champions League Oitavas',
    ano: '2017',
    dataCompleta: '8 de Março de 2017',
    timeCasa: {
      nome: 'Barcelona',
      sigla: 'BAR',
      placar: 6,
      escudoOuEmoji: '',
      cor: '#A50044',
    },
    timeFora: {
      nome: 'PSG',
      sigla: 'PSG',
      placar: 1,
      escudoOuEmoji: '',
      cor: '#004170',
    },
    destaque: 'Virada histórica após perder o jogo de ida por 4x0',
    descricao:
      'Após tomar 4x0 em Paris, o Barça precisava de um milagre. O PSG marcou aos 62min, exigindo 3 gols após os 88 minutos. Neymar marcou aos 88 e 91, e deu a assistência para Sergi Roberto aos 95.',
    duracao: '95 min',
    qualidade: '1080p FHD',
    canalSugeridoNome: 'beIN Sports 1',
    categoria: 'Futebol',
    visualizacoes: '16.4M',
    banner: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200&auto=format&fit=crop',
    momentosChave: ['Cobrança de falta magistral de Neymar aos 88', 'Pênalti convertido por Neymar aos 91', 'Lançamento com cavadinha e toque salvador de Sergi Roberto aos 95'],
  },
  {
    id: 'nba-finals-2016-game7',
    titulo: 'O Título Inédito dos Cavaliers (Jogo 7)',
    torneio: 'NBA Finals 2016',
    ano: '2016',
    dataCompleta: '19 de Junho de 2016',
    timeCasa: {
      nome: 'Warriors',
      sigla: 'GSW',
      placar: 89,
      escudoOuEmoji: '',
      cor: '#1D428A',
    },
    timeFora: {
      nome: 'Cavaliers',
      sigla: 'CLE',
      placar: 93,
      escudoOuEmoji: '️',
      cor: '#860038',
    },
    destaque: 'Primeira virada de 1-3 na história das finais da NBA',
    descricao:
      'LeBron James cumpriu sua promessa para Cleveland contra o Golden State Warriors do recorde de 73 vitórias com "The Block" em Iguodala e o arremesso decisivo de Kyrie Irving.',
    duracao: '48 min',
    qualidade: '1080p FHD',
    canalSugeridoNome: 'SuperSport Football',
    categoria: 'Basquete',
    visualizacoes: '7.8M',
    banner: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop',
    momentosChave: ['Toco voador de LeBron James em Andre Iguodala', 'Bola de 3 pontos de Kyrie Irving sobre Curry', 'Lances livres finais e choro de alívio de LeBron'],
  },
];

export const JOGOS_AO_VIVO_RODADA: JogoAoVivo[] = [
  {
    id: 'jogo-live-1',
    campeonato: 'UEFA Champions League',
    fase: 'Quartas de Final',
    tempo: "74'",
    isAoVivo: true,
    timeCasa: {
      nome: 'Real Madrid',
      sigla: 'RMA',
      placar: 2,
      escudo: '',
    },
    timeFora: {
      nome: 'Manchester City',
      sigla: 'MCI',
      placar: 2,
      escudo: '',
    },
    canalTransmissao: 'beIN Sports 1',
    estadio: 'Santiago Bernabéu',
    esporte: 'Futebol',
  },
  {
    id: 'jogo-live-2',
    campeonato: 'Premier League',
    fase: 'Rodada 31',
    tempo: "83'",
    isAoVivo: true,
    timeCasa: {
      nome: 'Arsenal',
      sigla: 'ARS',
      placar: 3,
      escudo: '',
    },
    timeFora: {
      nome: 'Chelsea',
      sigla: 'CHE',
      placar: 1,
      escudo: '',
    },
    canalTransmissao: 'SuperSport Football',
    estadio: 'Emirates Stadium',
    esporte: 'Futebol',
  },
  {
    id: 'jogo-live-3',
    campeonato: 'Girabola Angola',
    fase: 'Clássico Angolano',
    tempo: "61'",
    isAoVivo: true,
    timeCasa: {
      nome: 'Petro de Luanda',
      sigla: 'PET',
      placar: 1,
      escudo: '',
    },
    timeFora: {
      nome: '1º de Agosto',
      sigla: 'PRI',
      placar: 0,
      escudo: '',
    },
    canalTransmissao: 'ZAP Viva',
    estadio: 'Estádio 11 de Novembro',
    esporte: 'Futebol',
  },
  {
    id: 'jogo-live-4',
    campeonato: 'NBA Temporada Regular',
    fase: '4º Quarto',
    tempo: '2:15 min',
    isAoVivo: true,
    timeCasa: {
      nome: 'L.A. Lakers',
      sigla: 'LAL',
      placar: 108,
      escudo: '',
    },
    timeFora: {
      nome: 'Boston Celtics',
      sigla: 'BOS',
      placar: 104,
      escudo: '',
    },
    canalTransmissao: 'beIN Sports 2',
    estadio: 'Crypto.com Arena',
    esporte: 'Basquete',
  },
];
