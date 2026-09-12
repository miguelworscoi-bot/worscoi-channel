import { Canal } from '@/types';
import {
  getOfficialChannelSchedule,
  ProgramaOficialCanal,
} from '@/services/channelScheduleService';
import {
  getTop3BeSoccerHeroMatches,
  getBeSoccerBigMatchesWithLiveChannels,
  BeSoccerMatch,
} from '@/services/besoccerService';

export interface JogoInfoReal {
  campeonato: string;
  rodada: string;
  estadio: string;
  tempo: string; // Ex: "76'", "Intervalo", "Hoje às 21:30"
  isAoVivo: boolean;
  timeCasa: {
    nome: string;
    sigla: string;
    escudoOuEmoji: string;
    placar: number;
    cor?: string;
  };
  timeFora: {
    nome: string;
    sigla: string;
    escudoOuEmoji: string;
    placar: number;
    cor?: string;
  };
  principaisDestaques: string[];
  imagemCapa?: string;
  tituloJogo?: string;
  kickoffTimestamp?: number;
  fonteBeSoccerUrl?: string;
  motivoJogoGrande?: string;
}

export type CategoriaPrograma =
  | 'Futebol'
  | 'Basquete'
  | 'Esportes'
  | 'Jornalismo'
  | 'Entretenimento'
  | 'Variedades'
  | 'Debate';

export interface ProgramaCanal {
  id: string;
  canalId?: string;
  canalNome: string;
  canalLogo?: string;
  canalRede?: string;
  titulo: string;
  descricao: string;
  horario: string; // Ex: "15:30 - 17:30"
  horaInicio: string;
  horaFim: string;
  status: 'no_ar' | 'a_seguir' | 'mais_tarde';
  progressoPorcentagem: number; // 0 - 100
  categoria: CategoriaPrograma;
  destaque: boolean;
  qualidade: '4K UHD' | '1080p FHD' | 'HD';
  imagemCapa?: string;
  kickoffTimestamp?: number;
  jogo?: JogoInfoReal;
  // Campos BeSoccer e Site Oficial
  fonteOficialNome?: string;
  fonteOficialUrl?: string;
  fonteBeSoccerUrl?: string;
  verificadoNoSiteOficial?: boolean;
  isJogoGrande?: boolean;
  motivoJogoGrande?: string;
}

/**
 * Converte um jogo do BeSoccer para o formato ProgramaCanal para renderização e integração
 */
export function convertBeSoccerMatchToProgramaCanal(
  match: BeSoccerMatch,
  canalCorrespondente?: Canal
): ProgramaCanal {
  const cNome = canalCorrespondente?.nome || match.canalNomeDisponivel || match.emissorasNomes[0] || 'Canal Esportivo';
  const cId = canalCorrespondente?.id || match.canalIdDisponivel;
  const cLogo = canalCorrespondente?.logo;
  const cRede = canalCorrespondente?.rede || 'SuperSport';

  let categoria: CategoriaPrograma = 'Futebol';
  const campLower = match.campeonato.toLowerCase();
  if (campLower.includes('basquete') || campLower.includes('ncaa')) {
    categoria = 'Basquete';
  } else if (campLower.includes('cliff') || campLower.includes('diving') || campLower.includes('golf') || campLower.includes('red bull')) {
    categoria = 'Esportes';
  }

  return {
    id: `besoccer-${match.id}`,
    canalId: cId,
    canalNome: cNome,
    canalLogo: cLogo,
    canalRede: cRede,
    titulo: match.tituloJogo,
    descricao: match.descricao,
    horario: `${match.horaInicio} - ${match.isAoVivo ? 'Ao Vivo Agora' : 'Hoje'}`,
    horaInicio: match.horaInicio,
    horaFim: '',
    status: match.isAoVivo ? 'no_ar' : 'a_seguir',
    progressoPorcentagem: match.isAoVivo ? 75 : 0,
    categoria,
    destaque: true,
    qualidade: '4K UHD',
    imagemCapa: match.imagemCapa,
    kickoffTimestamp: match.kickoffTimestamp,
    fonteOficialNome: `BeSoccer • Transmissão em ${match.emissorasNomes[0]}`,
    fonteOficialUrl: match.fonteBeSoccerUrl,
    fonteBeSoccerUrl: match.fonteBeSoccerUrl,
    verificadoNoSiteOficial: true,
    isJogoGrande: match.isJogoGrande,
    motivoJogoGrande: match.motivoJogoGrande,
    jogo: {
      campeonato: match.campeonato,
      rodada: match.rodada,
      estadio: match.estadio,
      tempo: match.tempo,
      isAoVivo: match.isAoVivo,
      tituloJogo: match.tituloJogo,
      imagemCapa: match.imagemCapa,
      kickoffTimestamp: match.kickoffTimestamp,
      fonteBeSoccerUrl: match.fonteBeSoccerUrl,
      motivoJogoGrande: match.motivoJogoGrande,
      timeCasa: {
        nome: match.timeCasa.nome,
        sigla: match.timeCasa.sigla,
        escudoOuEmoji: match.timeCasa.escudoOuEmoji,
        placar: match.timeCasa.placar,
        cor: match.timeCasa.cor,
      },
      timeFora: {
        nome: match.timeFora.nome,
        sigla: match.timeFora.sigla,
        escudoOuEmoji: match.timeFora.escudoOuEmoji,
        placar: match.timeFora.placar,
        cor: match.timeFora.cor,
      },
      principaisDestaques: match.principaisDestaques,
    },
  };
}

/**
 * Obtém a programação oficial do canal diretamente baseada nos guias dos portais oficiais das emissoras
 */
export function getChannelSchedule(canal: Canal, now: Date = new Date()): ProgramaCanal[] {
  const scheduleOficial: ProgramaOficialCanal[] = getOfficialChannelSchedule(canal, now);

  return scheduleOficial.map((p) => ({
    id: p.id,
    canalId: p.canalId || canal.id,
    canalNome: p.canalNome,
    canalLogo: p.canalLogo || canal.logo,
    canalRede: p.canalRede || canal.rede,
    titulo: p.titulo,
    descricao: p.descricao,
    horario: p.horario,
    horaInicio: p.horaInicio,
    horaFim: p.horaFim,
    status: p.status,
    progressoPorcentagem: p.progressoPorcentagem,
    categoria: p.categoria,
    destaque: p.destaque,
    qualidade: p.qualidade,
    imagemCapa: p.imagemCapa,
    kickoffTimestamp: p.kickoffTimestamp,
    fonteOficialNome: p.fonteOficialNome,
    fonteOficialUrl: p.fonteOficialUrl,
    verificadoNoSiteOficial: p.verificadoNoSiteOficial,
    isJogoGrande: p.isJogoGrande,
  }));
}

/**
 * Extrai todos os jogos de futebol e esportes reais com transmissão ao vivo ou agendados,
 * utilizando o BeSoccer e os sites oficiais das emissoras.
 */
export function extractLiveAndTodayMatches(canais: Canal[], now: Date = new Date()): {
  jogosAoVivo: ProgramaCanal[];
  jogosDeHoje: ProgramaCanal[];
  todosProgramasNoAr: ProgramaCanal[];
} {
  const jogosAoVivo: ProgramaCanal[] = [];
  const jogosDeHoje: ProgramaCanal[] = [];
  const todosProgramasNoAr: ProgramaCanal[] = [];

  // 1. Coleta todos os programas no ar a partir dos sites oficiais dos canais
  canais.forEach((canal) => {
    const schedule = getChannelSchedule(canal, now);
    schedule.forEach((item) => {
      if (item.status === 'no_ar') {
        todosProgramasNoAr.push(item);
      }
    });
  });

  // 2. Extrai jogos do BeSoccer que atendem à regra do usuário:
  // "recomenda só se forem jogos grandes e se há canais que apresentam esses jogos ao vivo"
  const beSoccerBigMatches = getBeSoccerBigMatchesWithLiveChannels(canais);

  beSoccerBigMatches.forEach((match) => {
    const canalCorrespondente = canais.find(
      (c) =>
        (c.id && match.canaisTransmissoresIds.includes(c.id)) ||
        (c.url && match.canaisTransmissoresIds.some((tid) => c.url.toLowerCase().includes(tid.toLowerCase())))
    );

    const programaMatch = convertBeSoccerMatchToProgramaCanal(match, canalCorrespondente);

    if (match.isAoVivo) {
      jogosAoVivo.push(programaMatch);
    } else {
      jogosDeHoje.push(programaMatch);
    }
  });

  return { jogosAoVivo, jogosDeHoje, todosProgramasNoAr };
}

/**
 * Retorna as 3 partidas mais importantes do momento extraídas do BeSoccer
 * que atendem à regra: SÓ JOGOS GRANDES com canal transmissor ativo no app.
 */
export function getTop3ImportantMatches(canais: Canal[], now: Date = new Date()): ProgramaCanal[] {
  const top3BeSoccer = getTop3BeSoccerHeroMatches(canais);

  if (top3BeSoccer.length > 0) {
    return top3BeSoccer.map((match) => {
      const canalCorrespondente = canais.find(
        (c) =>
          (c.id && match.canaisTransmissoresIds.includes(c.id)) ||
          (c.url && match.canaisTransmissoresIds.some((tid) => c.url.toLowerCase().includes(tid.toLowerCase())))
      );
      return convertBeSoccerMatchToProgramaCanal(match, canalCorrespondente);
    });
  }

  // Fallback seguro se não houver canais carregados ainda
  const { jogosAoVivo, jogosDeHoje } = extractLiveAndTodayMatches(canais, now);
  const todos = [...jogosAoVivo, ...jogosDeHoje];
  return todos.slice(0, 3);
}
