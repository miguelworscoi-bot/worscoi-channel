'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Flame,
  Calendar,
  RefreshCw,
  Tv,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  getMostWatchedChannelsWeekly,
  getWeeklySelectionsByDay,
  ChannelWeeklyStats,
  DayOfWeekStats,
  SELECTION_EVENT_NAME,
  ChannelSelectionLog,
  getChannelSelectionLogs,
} from '@/services/channelSelectionLogService';

interface WeeklyMostWatchedChannelsBarChartProps {
  className?: string;
}

// Cores temáticas para os canais no gráfico de barras
const BAR_COLORS = [
  '#00E676', // 1º lugar: Verde Esmeralda vibrante (Worscoi Brand)
  '#3B82F6', // 2º lugar: Azul Royal
  '#A855F7', // 3º lugar: Púrpura
  '#F59E0B', // 4º lugar: Âmbar
  '#EC4899', // 5º lugar: Rosa
  '#06B6D4', // 6º lugar: Ciano
  '#10B981', // 7º lugar: Esmeralda Suave
  '#6366F1', // 8º lugar: Índigo
];

export function WeeklyMostWatchedChannelsBarChart({
  className = '',
}: WeeklyMostWatchedChannelsBarChartProps) {
  const [activeMode, setActiveMode] = useState<'canais' | 'dias'>('canais');
  const [logs, setLogs] = useState<ChannelSelectionLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeChannelHover, setActiveChannelHover] = useState<string | null>(null);

  // Carrega os logs atuais de seleção dos usuários
  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    const current = getChannelSelectionLogs();
    setLogs(current);
    setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  // Efeito inicial e ouvinte em tempo real para seleções de canal
  useEffect(() => {
    refreshData();

    const handleChannelSelected = () => {
      const updated = getChannelSelectionLogs();
      setLogs(updated);
    };

    window.addEventListener(SELECTION_EVENT_NAME, handleChannelSelected);
    window.addEventListener('focus', handleChannelSelected);

    return () => {
      window.removeEventListener(SELECTION_EVENT_NAME, handleChannelSelected);
      window.removeEventListener('focus', handleChannelSelected);
    };
  }, [refreshData]);

  // Estatísticas dos canais mais assistidos da semana
  const channelStats = useMemo(() => {
    return getMostWatchedChannelsWeekly(logs, 7);
  }, [logs]);

  // Estatísticas agrupadas por dia da semana
  const dayStats = useMemo(() => {
    return getWeeklySelectionsByDay(logs);
  }, [logs]);

  // Dados formatados para o gráfico de canais
  const channelsChartData = useMemo(() => {
    return channelStats.channels.map((ch, idx) => ({
      ...ch,
      shortName: ch.channelName.length > 20 ? `${ch.channelName.slice(0, 18)}...` : ch.channelName,
      color: BAR_COLORS[idx % BAR_COLORS.length],
      rank: idx + 1,
    }));
  }, [channelStats.channels]);

  // Canal líder e categoria predominante
  const topChannel = channelStats.channels[0] || null;

  return (
    <div
      id="worscoi-weekly-most-watched-chart-card"
      className={`rounded-2xl sm:rounded-3xl bg-zinc-950/70 border border-zinc-800/80 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-5 ${className}`}
    >
      {/* 1. CABEÇALHO DO COMPONENTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00E676] shrink-0 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Canais Mais Assistidos da Semana
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00E676] border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                Logs dos Usuários
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">
              Frequência de cliques e seleções na grade de canais ({channelStats.startDate} a {channelStats.endDate}).
            </p>
          </div>
        </div>

        {/* CONTROLES: MUDAR MODO E RECARREGAR */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Alternador de Modo */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              id="weekly-chart-mode-channels"
              onClick={() => setActiveMode('canais')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'canais'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Top Canais</span>
            </button>
            <button
              type="button"
              id="weekly-chart-mode-days"
              onClick={() => setActiveMode('dias')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'dias'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Por Dia</span>
            </button>
          </div>

          {/* Botão Atualizar */}
          <button
            type="button"
            id="weekly-chart-refresh-btn"
            onClick={refreshData}
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Atualizar logs de seleção"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00E676]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. MINI INDICADORES DE CONTEXTO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Seleções */}
        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Seleções na Semana
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">
              {channelStats.totalWeeklySelections}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">cliques registrados</span>
          </div>
        </div>

        {/* Canal Mais Popular */}
        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              1º Mais Assistido
            </span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-xs sm:text-sm font-black text-white tracking-tight truncate block">
              {topChannel?.channelName || 'Carregando...'}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">
              {topChannel?.selections || 0} seleções ({topChannel?.percentage || 0}%)
            </span>
          </div>
        </div>

        {/* Horas Estimadas Assistidas */}
        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Tempo Estimado
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">
              {Math.round(channelStats.totalWeeklySelections * 1.35)}h
            </span>
            <span className="text-[10px] text-blue-400 font-medium block">
              Horas de audiência ativa
            </span>
          </div>
        </div>

        {/* Status dos Logs */}
        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Captura Contínua
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
          </div>
          <div className="mt-1">
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E676]" />
              Sincronizado
            </span>
            <span className="text-[10px] text-zinc-400 block">
              Salva a cada mudança no player
            </span>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICOS DE BARRAS RECHARTS */}
      {activeMode === 'canais' ? (
        /* GRÁFICO 1: BARRAS HORIZONTAIS COM OS TOP CANAIS MAIS ASSISTIDOS */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold">
              Ranking dos canais com mais reproduções iniciadas
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">
              Base: {channelStats.totalWeeklySelections} seleções
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-3 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={channelsChartData}
                margin={{ top: 10, right: 35, left: 10, bottom: 5 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    const activeData = state.activePayload[0].payload as ChannelWeeklyStats;
                    setActiveChannelHover(activeData.channelName);
                  }
                }}
                onMouseLeave={() => setActiveChannelHover(null)}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                <XAxis
                  type="number"
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickFormatter={(val) => `${val}`}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  stroke="#71717a"
                  tick={{ fill: '#d4d4d8', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChannelWeeklyStats & {
                        rank: number;
                        color: string;
                      };
                      return (
                        <div className="p-3 bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px]">
                          <div className="font-bold text-white border-b border-zinc-800 pb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              #{data.rank} {data.channelName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-zinc-300">
                            <span>Categoria:</span>
                            <span className="text-zinc-200 font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-[10px]">
                              {data.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-zinc-300">
                            <span>Seleções no Player:</span>
                            <strong className="text-[#00E676] font-bold text-sm">
                              {data.selections} vezes
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-zinc-300">
                            <span>Participação Semanal:</span>
                            <strong className="text-white font-bold">
                              {data.percentage}%
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-zinc-800 font-normal">
                            <span>Audiência Estimada:</span>
                            <span className="text-blue-400 font-bold">
                              ~{data.estimatedHours} horas
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="selections"
                  name="Seleções"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                >
                  {channelsChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.channelId}-${index}`}
                      fill={entry.color}
                      opacity={
                        activeChannelHover === null || activeChannelHover === entry.channelName
                          ? 1
                          : 0.45
                      }
                      className="transition-all duration-200 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* GRÁFICO 2: BARRAS VERTICAIS POR DIA DA SEMANA */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold">
              Volume diário de seleções de canais pelos usuários (Segunda a Domingo)
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">
              Pico nos fins de semana e noites de jogos
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-3 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dayStats}
                margin={{ top: 15, right: 15, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis
                  dataKey="dayKey"
                  stroke="#71717a"
                  tick={{ fill: '#d4d4d8', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DayOfWeekStats;
                      return (
                        <div className="p-3 bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px]">
                          <div className="font-bold text-white border-b border-zinc-800 pb-1 flex items-center justify-between">
                            <span>{data.dayName} ({data.dateStr})</span>
                            {data.isToday && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00E676] font-bold">
                                Hoje
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-zinc-300">
                            <span>Total Selecionado:</span>
                            <strong className="text-[#00E676] font-bold text-sm">
                              {data.selections} canais
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-zinc-800 font-normal">
                            <span>Canal Mais Visto:</span>
                            <span className="font-normal text-white truncate max-w-[120px]">
                              {data.topChannel}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="selections"
                  name="Seleções no Dia"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                >
                  {dayStats.map((entry, index) => (
                    <Cell
                      key={`day-cell-${index}`}
                      fill={entry.isToday ? '#00E676' : '#3B82F6'}
                      opacity={entry.isToday ? 1 : 0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. LEGENDA E TABELA RESUMIDA DOS CANAIS */}
      <div className="pt-2 border-t border-zinc-850">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {channelsChartData.slice(0, 4).map((ch) => (
            <div
              key={ch.channelId}
              className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ch.color }}
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white truncate block">
                    {ch.channelName}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    {ch.category}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-400 block">
                  {ch.selections}
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {ch.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
