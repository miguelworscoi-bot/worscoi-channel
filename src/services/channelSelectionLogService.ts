import { Canal } from '@/types';

export interface ChannelSelectionLog {
  id: string;
  channelId: string;
  channelName: string;
  category: string;
  logo?: string;
  selectedAt: number; // timestamp em milissegundos
  userId?: string;
}

export interface ChannelWeeklyStats {
  channelId: string;
  channelName: string;
  category: string;
  logo?: string;
  selections: number; // Quantidade de vezes selecionado na semana
  percentage: number; // Porcentagem do total de seleções
  estimatedHours: number; // Horas estimadas assistidas
  lastSelectedAt: number;
}

export interface DayOfWeekStats {
  dayKey: string; // Ex: 'Seg', 'Ter'
  dayName: string; // Ex: 'Segunda-feira'
  dateStr: string; // Ex: '15/09'
  selections: number; // Total de canais selecionados neste dia
  topChannel: string;
  isToday: boolean;
}

export const SELECTION_LOGS_STORAGE_KEY = 'worscoi_channel_selections_v1';
export const SELECTION_EVENT_NAME = 'worscoi_channel_selected_event';

// Gera dados simulados realistas para a semana se ainda não houver dados no navegador
function generateSeedWeeklyLogs(): ChannelSelectionLog[] {
  const channels = [
    { id: 'supersport-premier', name: 'SuperSport Premier League', category: 'Esportes', weight: 34 },
    { id: 'zap-viva-hd', name: 'ZAP Viva HD', category: 'Entretenimento', weight: 28 },
    { id: 'tnt-sports-champions', name: 'TNT Sports Brasil', category: 'Esportes', weight: 24 },
    { id: 'sport-tv-1-hd', name: 'Sport TV 1 Portugal', category: 'Esportes', weight: 20 },
    { id: 'tv-zimbo-hd', name: 'TV Zimbo HD', category: 'Notícias', weight: 16 },
    { id: 'dazn-laliga', name: 'DAZN LaLiga', category: 'Esportes', weight: 13 },
    { id: 'espn-brasil', name: 'ESPN Brasil & Premier', category: 'Esportes', weight: 11 },
    { id: 'canal-panda-bonecos', name: 'Canal Panda HD', category: 'Infantil', weight: 9 },
    { id: 'cnn-portugal', name: 'CNN Portugal Ao Vivo', category: 'Notícias', weight: 7 },
  ];

  const logs: ChannelSelectionLog[] = [];
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Distribui as seleções ao longo dos últimos 7 dias
  channels.forEach((ch) => {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      // Picos maiores em dias 0, 1, 5, 6 (fins de semana e quartas de Champions)
      const dayFactor = dayOffset % 6 === 0 || dayOffset % 5 === 0 ? 1.4 : 0.8;
      const countForDay = Math.max(1, Math.round((ch.weight / 7) * dayFactor));

      for (let k = 0; k < countForDay; k++) {
        const randomTimeInDay = Math.floor(Math.random() * (ONE_DAY * 0.9));
        const timestamp = now - dayOffset * ONE_DAY - randomTimeInDay;

        logs.push({
          id: `log_${ch.id}_${dayOffset}_${k}_${Math.random().toString(36).substring(2, 7)}`,
          channelId: ch.id,
          channelName: ch.name,
          category: ch.category,
          selectedAt: timestamp,
        });
      }
    }
  });

  return logs.sort((a, b) => b.selectedAt - a.selectedAt);
}

/**
 * Obtém todos os logs de seleção armazenados
 */
export function getChannelSelectionLogs(): ChannelSelectionLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SELECTION_LOGS_STORAGE_KEY);
    if (!raw) {
      const initialLogs = generateSeedWeeklyLogs();
      localStorage.setItem(SELECTION_LOGS_STORAGE_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const seed = generateSeedWeeklyLogs();
    localStorage.setItem(SELECTION_LOGS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch (err) {
    console.warn('Erro ao carregar logs de seleção:', err);
    return [];
  }
}

/**
 * Registra um evento de seleção de canal pelo usuário
 */
export function recordChannelSelection(canal: Canal, userId?: string): ChannelSelectionLog | null {
  if (typeof window === 'undefined' || !canal || (!canal.id && !canal.nome)) {
    return null;
  }

  try {
    const channelId = canal.id || canal.url || 'canal_desconhecido';
    const channelName = canal.nome || 'Canal Desconhecido';
    const category = canal.categoria || 'Geral';
    const logo = canal.logo;

    const newLog: ChannelSelectionLog = {
      id: `sel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      channelId,
      channelName,
      category,
      logo,
      selectedAt: Date.now(),
      userId,
    };

    const currentLogs = getChannelSelectionLogs();
    // Mantém os últimos 600 logs para performance
    const updated = [newLog, ...currentLogs].slice(0, 600);

    localStorage.setItem(SELECTION_LOGS_STORAGE_KEY, JSON.stringify(updated));

    // Notifica ouvintes locais para atualização imediata dos gráficos
    window.dispatchEvent(
      new CustomEvent(SELECTION_EVENT_NAME, {
        detail: { newLog, channelId, channelName },
      })
    );

    return newLog;
  } catch (error) {
    console.warn('Erro ao registrar log de seleção de canal:', error);
    return null;
  }
}

/**
 * Calcula os canais mais assistidos da semana com base nos logs de seleção
 */
export function getMostWatchedChannelsWeekly(
  customLogs?: ChannelSelectionLog[],
  limitCount: number = 7
): {
  channels: ChannelWeeklyStats[];
  totalWeeklySelections: number;
  startDate: string;
  endDate: string;
} {
  const logs = customLogs || getChannelSelectionLogs();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const weekStart = now - ONE_WEEK_MS;

  // Filtra seleções ocorridas nos últimos 7 dias
  const weeklyLogs = logs.filter((log) => log.selectedAt >= weekStart);
  const totalWeeklySelections = weeklyLogs.length;

  // Agrupa contagem por canal
  const channelMap = new Map<
    string,
    {
      channelId: string;
      channelName: string;
      category: string;
      logo?: string;
      selections: number;
      lastSelectedAt: number;
    }
  >();

  weeklyLogs.forEach((log) => {
    const key = log.channelName.trim() || log.channelId;
    const existing = channelMap.get(key);
    if (existing) {
      existing.selections += 1;
      if (log.selectedAt > existing.lastSelectedAt) {
        existing.lastSelectedAt = log.selectedAt;
      }
      if (log.logo && !existing.logo) {
        existing.logo = log.logo;
      }
    } else {
      channelMap.set(key, {
        channelId: log.channelId,
        channelName: log.channelName,
        category: log.category,
        logo: log.logo,
        selections: 1,
        lastSelectedAt: log.selectedAt,
      });
    }
  });

  const channels: ChannelWeeklyStats[] = Array.from(channelMap.values())
    .map((item) => {
      const percentage =
        totalWeeklySelections > 0
          ? Number(((item.selections / totalWeeklySelections) * 100).toFixed(1))
          : 0;
      // Estima aproximadamente 1h20m por seleção de canal
      const estimatedHours = Number((item.selections * 1.35).toFixed(1));

      return {
        ...item,
        percentage,
        estimatedHours,
      };
    })
    .sort((a, b) => b.selections - a.selections)
    .slice(0, limitCount);

  const startD = new Date(weekStart);
  const endD = new Date(now);

  const formatShort = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

  return {
    channels,
    totalWeeklySelections,
    startDate: formatShort(startD),
    endDate: formatShort(endD),
  };
}

/**
 * Agrupa as seleções dos últimos 7 dias por dia da semana
 */
export function getWeeklySelectionsByDay(customLogs?: ChannelSelectionLog[]): DayOfWeekStats[] {
  const logs = customLogs || getChannelSelectionLogs();
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const fullDayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  const now = new Date();
  const result: DayOfWeekStats[] = [];

  // Constrói os 7 dias passados
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const dayLogs = logs.filter(
      (l) => l.selectedAt >= d.getTime() && l.selectedAt < nextD.getTime()
    );

    // Identifica o canal líder do dia
    const chCounts: Record<string, number> = {};
    dayLogs.forEach((l) => {
      chCounts[l.channelName] = (chCounts[l.channelName] || 0) + 1;
    });

    let topCh = 'Nenhum';
    let maxC = 0;
    Object.entries(chCounts).forEach(([name, c]) => {
      if (c > maxC) {
        maxC = c;
        topCh = name;
      }
    });

    const dayOfWeekIdx = d.getDay();
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

    result.push({
      dayKey: dayNames[dayOfWeekIdx],
      dayName: fullDayNames[dayOfWeekIdx],
      dateStr,
      selections: dayLogs.length,
      topChannel: topCh,
      isToday: i === 0,
    });
  }

  return result;
}

/**
 * Limpa o histórico de logs de seleção
 */
export function clearChannelSelectionLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SELECTION_LOGS_STORAGE_KEY);
  } catch (err) {
    console.warn('Erro ao limpar logs de seleção:', err);
  }
}
