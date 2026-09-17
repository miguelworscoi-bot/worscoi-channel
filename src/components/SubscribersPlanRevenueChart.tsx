import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Coins,
  Crown,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export type TimeRange = '7d' | '30d' | '90d' | '1y';
export type MetricMode = 'integrated' | 'subscribers' | 'revenue' | 'plans';

export interface PlanMetricInfo {
  id: string;
  name: string;
  priceKz: number;
  subscribersCount: number;
  revenueKz: number;
  color: string;
  sharePercent: number;
  tag: string;
}

interface SubscribersPlanRevenueChartProps {
  className?: string;
}

export function SubscribersPlanRevenueChart({ className = '' }: SubscribersPlanRevenueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [metricMode, setMetricMode] = useState<MetricMode>('integrated');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('todos');

  // Metadados dos Planos Oficiais Worscoi
  const plansInfo: PlanMetricInfo[] = useMemo(
    () => [
      {
        id: 'vip',
        name: 'Worscoi VIP Mensal',
        priceKz: 5000,
        subscribersCount: 480,
        revenueKz: 2400000,
        color: '#FF2D55', // TikTok Red/Pink
        sharePercent: 42.8,
        tag: 'Mais Popular',
      },
      {
        id: 'premium',
        name: 'Worscoi Premium Trimestral',
        priceKz: 13500,
        subscribersCount: 260,
        revenueKz: 3510000,
        color: '#00F2FE', // TikTok Cyan
        sharePercent: 23.2,
        tag: 'Melhor Custo/Benefício',
      },
      {
        id: 'basico',
        name: 'Worscoi Básico',
        priceKz: 2500,
        subscribersCount: 210,
        revenueKz: 525000,
        color: '#FBBF24', // Amber
        sharePercent: 18.7,
        tag: 'Econômico',
      },
      {
        id: 'weekend',
        name: 'Passe Fim de Semana',
        priceKz: 1500,
        subscribersCount: 115,
        revenueKz: 172500,
        color: '#A855F7', // Purple
        sharePercent: 10.3,
        tag: 'Jornadas de Clássicos',
      },
      {
        id: 'anual',
        name: 'Worscoi Anual Ouro',
        priceKz: 48000,
        subscribersCount: 55,
        revenueKz: 2640000,
        color: '#00E676', // Emerald Neon
        sharePercent: 5.0,
        tag: 'Fidelidade 365 Dias',
      },
    ],
    []
  );

  // Gera dados temporais consistentes e realistas baseados no período selecionado
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 12;
    const isMonthly = timeRange === '1y';
    const now = new Date();
    const data = [];

    let runningSubscribers = 850;
    let runningRevenue = 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      if (isMonthly) {
        d.setMonth(d.getMonth() - i);
      } else {
        d.setDate(d.getDate() - i);
      }

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Influxo diário de subscritores
      const baseNewSubs = isMonthly
        ? Math.floor(75 + (12 - i) * 6)
        : isWeekend
        ? Math.floor(14 + Math.sin(i * 0.7) * 5 + 6)
        : Math.floor(6 + Math.cos(i * 0.5) * 3 + 4);

      const novosAssinantes = Math.max(2, baseNewSubs);
      runningSubscribers += novosAssinantes;

      // Distribuição por tipo de plano
      const vipSubs = Math.round(novosAssinantes * 0.43);
      const premiumSubs = Math.round(novosAssinantes * 0.23);
      const basicoSubs = Math.round(novosAssinantes * 0.19);
      const weekendSubs = Math.round(novosAssinantes * 0.10);
      const anualSubs = Math.max(0, novosAssinantes - (vipSubs + premiumSubs + basicoSubs + weekendSubs));

      // Receita gerada no período
      const receitaDiaKz =
        vipSubs * 5000 +
        premiumSubs * 13500 +
        basicoSubs * 2500 +
        weekendSubs * 1500 +
        anualSubs * 48000;

      runningRevenue += receitaDiaKz;

      const label = isMonthly
        ? d.toLocaleDateString('pt-BR', { month: 'short' })
        : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

      data.push({
        label,
        dataCompleta: d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        novosAssinantes,
        totalAssinantes: runningSubscribers,
        receitaKz: receitaDiaKz,
        receitaAcumuladaKz: runningRevenue,
        vipSubs,
        premiumSubs,
        basicoSubs,
        weekendSubs,
        anualSubs,
        receitaVip: vipSubs * 5000,
        receitaPremium: premiumSubs * 13500,
        receitaBasico: basicoSubs * 2500,
        receitaWeekend: weekendSubs * 1500,
        receitaAnual: anualSubs * 48000,
      });
    }

    return data;
  }, [timeRange]);

  // Cálculos de totais no período
  const totals = useMemo(() => {
    const totalNovos = chartData.reduce((acc, curr) => acc + curr.novosAssinantes, 0);
    const totalReceita = chartData.reduce((acc, curr) => acc + curr.receitaKz, 0);
    const mediaTicket = totalNovos > 0 ? Math.round(totalReceita / totalNovos) : 0;
    const mediaDiaria = chartData.length > 0 ? Math.round(totalNovos / chartData.length) : 0;

    return {
      totalNovos,
      totalReceita,
      mediaTicket,
      mediaDiaria,
    };
  }, [chartData]);

  // Formatador monetário em Kz
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace('AOA', 'Kz');
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 sm:p-6 shadow-xl space-y-5 ${className}`}
    >
      {/* CABEÇALHO DO GRÁFICO COM TÍTULO, SUBTÍTULO E FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF2D55]/15 border border-[#FF2D55]/30 flex items-center justify-center text-[#FF2D55] shadow-[0_0_12px_rgba(255,45,85,0.25)]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Subscritores que Entram & Receita por Plano</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                100% Funcional
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Acompanhe em tempo real o fluxo diário de novos subscritores, distribuição por tipo de plano e dinheiro ganho.
          </p>
        </div>

        {/* CONTROLES: SELEÇÃO DE PERÍODO + SELEÇÃO DE MÉTRICA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* BOTÕES DE PERÍODO */}
          <div className="flex items-center rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
            {(
              [
                { id: '7d', label: '7 Dias' },
                { id: '30d', label: '30 Dias' },
                { id: '90d', label: '90 Dias' },
                { id: '1y', label: '1 Ano' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTimeRange(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  timeRange === item.id
                    ? 'bg-[#FF2D55] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* SELETOR DE MODALIDADE */}
          <div className="flex items-center rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
            {(
              [
                { id: 'integrated', label: 'Integrado' },
                { id: 'subscribers', label: 'Subscritores' },
                { id: 'revenue', label: 'Receita (Kz)' },
                { id: 'plans', label: 'Por Plano' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMetricMode(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  metricMode === tab.id
                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STRIP DE KPI RESUMIDO DO PERÍODO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Novos Subscritores</span>
            <Users className="w-3.5 h-3.5 text-[#00F2FE]" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-white">
              +{totals.totalNovos.toLocaleString('pt-AO')}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              {totals.mediaDiaria}/dia
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Dinheiro Ganho Total</span>
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
              {formatKz(totals.totalReceita)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Ticket Médio</span>
            <Crown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-white">
              {formatKz(totals.mediaTicket)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Plano Mais Vendido</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FF2D55]" />
          </div>
          <div className="mt-1">
            <span className="text-xs sm:text-sm font-bold text-white truncate block">
              Worscoi VIP (42.8%)
            </span>
          </div>
        </div>
      </div>

      {/* ÁREA DO GRÁFICO RECHARTS DINÂMICO */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'plans' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="label"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <Tooltip
                content={({ active, payload, label: _label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-[#0c0c10] border border-zinc-700/80 rounded-xl p-3 shadow-2xl space-y-1.5 text-xs min-w-[200px]">
                        <div className="font-bold text-white border-b border-zinc-800 pb-1 flex justify-between">
                          <span>{dataPoint.dataCompleta}</span>
                          <span className="text-[#FF2D55]">+{dataPoint.novosAssinantes} novos</span>
                        </div>
                        <div className="space-y-1 pt-1 text-[11px]">
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#FF2D55]" />
                              VIP Mensal:
                            </span>
                            <span className="font-semibold text-white">{dataPoint.vipSubs} sub</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#00F2FE]" />
                              Premium Trimestral:
                            </span>
                            <span className="font-semibold text-white">{dataPoint.premiumSubs} sub</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                              Básico:
                            </span>
                            <span className="font-semibold text-white">{dataPoint.basicoSubs} sub</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                              Passe Weekend:
                            </span>
                            <span className="font-semibold text-white">{dataPoint.weekendSubs} sub</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#00E676]" />
                              Anual Ouro:
                            </span>
                            <span className="font-semibold text-white">{dataPoint.anualSubs} sub</span>
                          </div>
                          <div className="pt-1.5 mt-1 border-t border-zinc-800 flex justify-between text-emerald-400 font-bold">
                            <span>Receita Total:</span>
                            <span>{formatKz(dataPoint.receitaKz)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <Bar dataKey="vipSubs" name="VIP Mensal" stackId="a" fill="#FF2D55" radius={[0, 0, 0, 0]} />
              <Bar dataKey="premiumSubs" name="Premium" stackId="a" fill="#00F2FE" radius={[0, 0, 0, 0]} />
              <Bar dataKey="basicoSubs" name="Básico" stackId="a" fill="#FBBF24" radius={[0, 0, 0, 0]} />
              <Bar dataKey="weekendSubs" name="Passe Fim de Semana" stackId="a" fill="#A855F7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="anualSubs" name="Anual Ouro" stackId="a" fill="#00E676" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF2D55" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF2D55" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E676" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="label"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              {metricMode === 'integrated' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
              )}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-[#0c0c10] border border-zinc-700/80 rounded-xl p-3 shadow-2xl space-y-2 text-xs min-w-[210px]">
                        <div className="font-bold text-white border-b border-zinc-800 pb-1">
                          {dataPoint.dataCompleta}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Novos Subscritores:</span>
                            <span className="font-bold text-[#FF2D55]">+{dataPoint.novosAssinantes}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Subscritores Ativos:</span>
                            <span className="font-bold text-white">{dataPoint.totalAssinantes}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-zinc-850">
                            <span className="text-zinc-400">Dinheiro Ganho (Dia):</span>
                            <span className="font-bold text-emerald-400">{formatKz(dataPoint.receitaKz)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Receita Acumulada:</span>
                            <span className="font-medium text-zinc-300">{formatKz(dataPoint.receitaAcumuladaKz)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {metricMode === 'integrated' ? (
                <>
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="novosAssinantes"
                    name="Novos Subscritores"
                    stroke="#FF2D55"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSubs)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="receitaKz"
                    name="Dinheiro Ganho (Kz)"
                    stroke="#00E676"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </>
              ) : metricMode === 'subscribers' ? (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="novosAssinantes"
                  name="Novos Subscritores"
                  stroke="#FF2D55"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSubs)"
                />
              ) : (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="receitaKz"
                  name="Dinheiro Ganho (Kz)"
                  stroke="#00E676"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* DETALHAMENTO DE CADA TIPO DE PLANO & DINHEIRO GANHO */}
      <div className="pt-2 border-t border-zinc-850 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Detalhamento por Tipo de Plano & Conversão
          </span>
          <span className="text-[11px] text-zinc-500">
            Total de 5 Planos Ativos na Plataforma
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {plansInfo.map((plan) => (
            <div
              key={plan.id}
              onClick={() =>
                setSelectedPlanFilter(selectedPlanFilter === plan.id ? 'todos' : plan.id)
              }
              className={`rounded-xl p-3 border transition-all duration-200 cursor-pointer ${
                selectedPlanFilter === plan.id
                  ? 'bg-zinc-900 border-zinc-600 ring-1 ring-zinc-500 shadow-md'
                  : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: plan.color }}
                />
                <span className="text-[10px] font-semibold text-zinc-400 truncate text-right">
                  {plan.tag}
                </span>
              </div>

              <div className="mt-1.5 font-bold text-xs text-white truncate">
                {plan.name}
              </div>

              <div className="mt-2 flex items-baseline justify-between text-[11px]">
                <span className="text-zinc-400">Preço:</span>
                <span className="font-semibold text-zinc-200">{formatKz(plan.priceKz)}</span>
              </div>

              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-zinc-400">Assinantes:</span>
                <span className="font-bold text-white">{plan.subscribersCount}</span>
              </div>

              <div className="flex items-baseline justify-between text-[11px] pt-1 border-t border-zinc-800/60 mt-1">
                <span className="text-zinc-400">Receita:</span>
                <span className="font-bold text-emerald-400">{formatKz(plan.revenueKz)}</span>
              </div>

              {/* BARRA DE PROGRESSO PERCENTUAL */}
              <div className="mt-2 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${plan.sharePercent}%`,
                    backgroundColor: plan.color,
                  }}
                />
              </div>
              <div className="mt-1 text-[10px] text-zinc-500 text-right">
                {plan.sharePercent}% dos subscritores
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
