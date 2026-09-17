'use client';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  Tv,
  Film,
  Heart,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export type AnalyticsTab =
  | 'visao-geral'
  | 'subscritos'
  | 'planos'
  | 'receita'
  | 'retencao'
  | 'mais-assistidos'
  | 'engajamento';

export type PeriodOption = '7d' | '30d' | '90d' | '1a';

interface WorscoiAnalyticsDashboardProps {
  onNavigateToSubscribers?: () => void;
  className?: string;
}

// -----------------------------------------------------------------------------
// DADOS REALISTAS MODELADOS PARA A PLATAFORMA DE STREAMING WORSCOI
// Moeda oficial: Kwanza Angolano (Kz / AOA)
// -----------------------------------------------------------------------------

const PLAN_DISTRIBUTION_DATA = [
  {
    id: 'vip',
    name: 'VIP Esportes HD',
    subscribers: 580,
    percentage: 40.6,
    priceKz: 4000,
    revenueKz: 2320000,
    color: '#00E676', // Emerald
    badge: 'Mais Popular',
  },
  {
    id: 'premium',
    name: 'Premium Ultra 4K',
    subscribers: 310,
    percentage: 21.7,
    priceKz: 9500,
    revenueKz: 2945000,
    color: '#3B82F6', // Blue
    badge: 'Maior Receita',
  },
  {
    id: 'basico',
    name: 'Básico Esportes',
    subscribers: 245,
    percentage: 17.2,
    priceKz: 2500,
    revenueKz: 612500,
    color: '#A855F7', // Purple
    badge: 'Estável',
  },
  {
    id: 'diario',
    name: 'Passe Fim de Semana',
    subscribers: 185,
    percentage: 13.0,
    priceKz: 1500,
    revenueKz: 277500,
    color: '#F59E0B', // Amber
    badge: 'Picos de Jogos',
  },
  {
    id: 'anual',
    name: 'Passe Anual Campeão',
    subscribers: 42,
    percentage: 2.9,
    priceKz: 30000,
    revenueKz: 1260000,
    color: '#EC4899', // Pink
    badge: 'Fidelidade Alta',
  },
  {
    id: 'free',
    name: 'Degustação (24h)',
    subscribers: 66,
    percentage: 4.6,
    priceKz: 0,
    revenueKz: 0,
    color: '#71717A', // Zinc
    badge: 'Funil de Conversão',
  },
];

// Dados temporais dos últimos 30 dias com receitas, assinantes, retenção e visualizações
const GENERATE_TIME_SERIES = () => {
  const points = [];
  const baseSubscribers = 1290;
  let currentSubs = baseSubscribers;
  let cumulativeRevenue = 5820000;

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sábado e Domingo = picos de jogos

    const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

    // Novos usuários: 2 a 8 por dia, mais altos nos fins de semana (Champions/Libertadores/Premier)
    const novos = isWeekend ? Math.floor(Math.random() * 5) + 6 : Math.floor(Math.random() * 4) + 2;
    currentSubs += novos;

    // Receita diária em Kwanzas (Kz)
    const dailyRevenue = isWeekend
      ? Math.floor(Math.random() * 80000) + 160000
      : Math.floor(Math.random() * 45000) + 75000;
    cumulativeRevenue += dailyRevenue;

    // Horas médias de retenção na plataforma (ex: 3.2h a 4.8h por usuário ativo)
    const horasMedia = isWeekend ? +(3.8 + Math.random() * 1.4).toFixed(1) : +(2.6 + Math.random() * 0.9).toFixed(1);

    // Taxa de retenção diária estimada (% que voltou no dia seguinte)
    const taxaRetencao = isWeekend ? Math.floor(Math.random() * 6) + 82 : Math.floor(Math.random() * 8) + 74;

    // Visualizações diárias totais
    const viewsTotais = isWeekend
      ? Math.floor(Math.random() * 4000) + 14000
      : Math.floor(Math.random() * 3000) + 8500;

    points.push({
      date: dateKey,
      fullDate: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek],
      isWeekend,
      novos,
      totalAssinantes: currentSubs,
      receitaKz: dailyRevenue,
      receitaAcumulada: cumulativeRevenue,
      horasMedia,
      taxaRetencao,
      viewsTotais,
    });
  }
  return points;
};

// Top Canais Mais Assistidos (Audiência, horas assistidas e espectadores únicos)
const TOP_CHANNELS_DATA = [
  {
    id: 'supersport-premier',
    name: 'SuperSport Premier League HD',
    categoria: 'Esportes',
    horasAssistidas: 14850,
    espectadores: 1840,
    adoros: 1240,
    comentarios: 680,
    share: 24.5,
    tag: 'Futebol Ao Vivo',
  },
  {
    id: 'zap-viva',
    name: 'ZAP Viva HD',
    categoria: 'Geral & Novelas',
    horasAssistidas: 11200,
    espectadores: 1520,
    adoros: 980,
    comentarios: 512,
    share: 18.5,
    tag: 'Entretenimento Nacional',
  },
  {
    id: 'tnt-sports-br',
    name: 'TNT Sports Brasil (Champions)',
    categoria: 'Esportes',
    horasAssistidas: 9840,
    espectadores: 1390,
    adoros: 1120,
    comentarios: 495,
    share: 16.2,
    tag: 'Champions & NBA',
  },
  {
    id: 'sport-tv-1',
    name: 'Sport TV 1 Portugal',
    categoria: 'Esportes',
    horasAssistidas: 8450,
    espectadores: 1180,
    adoros: 840,
    comentarios: 380,
    share: 13.9,
    tag: 'Liga Portugal & Taças',
  },
  {
    id: 'tv-zimbo',
    name: 'TV Zimbo HD',
    categoria: 'Notícias & Angola',
    horasAssistidas: 6300,
    espectadores: 960,
    adoros: 610,
    comentarios: 290,
    share: 10.4,
    tag: 'Jornalismo & Ao Vivo',
  },
  {
    id: 'dazn-laliga',
    name: 'DAZN LaLiga & Champions',
    categoria: 'Esportes',
    horasAssistidas: 5400,
    espectadores: 810,
    adoros: 730,
    comentarios: 275,
    share: 8.9,
    tag: 'Real Madrid & Barcelona',
  },
  {
    id: 'cartoon-panda',
    name: 'Canal Panda & Bonecos HD',
    categoria: 'Infantil',
    horasAssistidas: 4620,
    espectadores: 740,
    adoros: 520,
    comentarios: 140,
    share: 7.6,
    tag: 'Desenhos & Família',
  },
];

// Top Filmes Mais Assistidos na Filmoteca
const TOP_MOVIES_DATA = [
  {
    id: 'gladiador-2',
    titulo: 'Gladiador II (2024)',
    genero: 'Ação / Épico',
    ano: '2024',
    rating: '8.4',
    visualizacoes: 4890,
    horasTotais: 11250,
    conclusaoRate: 88,
    favoritos: 890,
    comentarios: 310,
  },
  {
    id: 'oppenheimer',
    titulo: 'Oppenheimer',
    genero: 'Biografia / Drama',
    ano: '2023',
    rating: '8.9',
    visualizacoes: 4120,
    horasTotais: 12360,
    conclusaoRate: 91,
    favoritos: 940,
    comentarios: 270,
  },
  {
    id: 'o-poderoso-chefao',
    titulo: 'O Poderoso Chefão (The Godfather)',
    genero: 'Clássico / Crime',
    ano: '1972',
    rating: '9.2',
    visualizacoes: 3780,
    horasTotais: 11140,
    conclusaoRate: 94,
    favoritos: 1180,
    comentarios: 415,
  },
  {
    id: 'top-gun-maverick',
    titulo: 'Top Gun: Maverick',
    genero: 'Ação / Aviação',
    ano: '2022',
    rating: '8.3',
    visualizacoes: 3450,
    horasTotais: 7245,
    conclusaoRate: 86,
    favoritos: 760,
    comentarios: 215,
  },
  {
    id: 'interestelar',
    titulo: 'Interestelar (Interstellar)',
    genero: 'Ficção Científica',
    ano: '2014',
    rating: '8.7',
    visualizacoes: 3290,
    horasTotais: 9210,
    conclusaoRate: 93,
    favoritos: 1050,
    comentarios: 380,
  },
  {
    id: 'tempos-modernos',
    titulo: 'Tempos Modernos (Chaplin)',
    genero: 'Clássico / Comédia',
    ano: '1936',
    rating: '8.5',
    visualizacoes: 2150,
    horasTotais: 3225,
    conclusaoRate: 82,
    favoritos: 490,
    comentarios: 128,
  },
];

// Dados de Coorte de Retenção de Usuários (% de usuários ativos após X dias)
const RETENTION_COHORT_DATA = [
  { dia: 'Dia 1', retencao: 96, label: 'Primeiro Acesso', perda: '4% churn' },
  { dia: 'Dia 3', retencao: 89, label: 'Pós-Fim de Semana', perda: '11% churn' },
  { dia: 'Dia 7', retencao: 84, label: '1ª Semana Ativa', perda: '16% churn' },
  { dia: 'Dia 14', retencao: 79, label: '2ª Semana Consecutiva', perda: '21% churn' },
  { dia: 'Dia 21', retencao: 74, label: 'Fidelização Inicial', perda: '26% churn' },
  { dia: 'Dia 30', retencao: 68, label: 'Fechamento de Mês', perda: '32% churn' },
  { dia: 'Dia 60', retencao: 62, label: '2 Meses Consecutivos', perda: '38% churn' },
  { dia: 'Dia 90', retencao: 57, label: 'Assinantes Longo Prazo', perda: '43% churn' },
];

// Horas assistidas por dia da semana (mostrando o comportamento da audiência)
const WEEKDAY_USAGE_DATA = [
  { dia: 'Segunda', horasMedia: 2.5, espectadores: 780, pico: '20h (ZAP & Notícias)' },
  { dia: 'Terça', horasMedia: 3.4, espectadores: 1240, pico: '20h45 (Champions League)' },
  { dia: 'Quarta', horasMedia: 3.8, espectadores: 1490, pico: '20h45 (Champions & Taças)' },
  { dia: 'Quinta', horasMedia: 3.1, espectadores: 1050, pico: '20h (Europa League)' },
  { dia: 'Sexta', horasMedia: 3.9, espectadores: 1380, pico: '21h (Filmes & Início de Rodada)' },
  { dia: 'Sábado', horasMedia: 4.9, espectadores: 1820, pico: '15h30 - 18h (Premier & LaLiga)' },
  { dia: 'Domingo', horasMedia: 5.2, espectadores: 1940, pico: '16h - 21h (Clássicos & Domingo Esportivo)' },
];

export function WorscoiAnalyticsDashboard({
  onNavigateToSubscribers,
  className = '',
}: WorscoiAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('visao-geral');
  const [period, setPeriod] = useState<PeriodOption>('30d');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'canais' | 'filmes'>('canais');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeSeriesData = useMemo(() => GENERATE_TIME_SERIES(), []);

  // Cálculos de Totais e KPIs principais
  const totals = useMemo(() => {
    const totalAssinantes = 1428;
    const novosMes = 94;
    const totalReceitaKz = PLAN_DISTRIBUTION_DATA.reduce((acc, p) => acc + p.revenueKz, 0);
    const taxaConversao = 78.4;
    const mrrKz = Math.round(totalReceitaKz / 1.15); // Receita Mensal Recorrente
    const ticketMedioKz = Math.round(totalReceitaKz / (totalAssinantes - 66));
    const tempoMedioDiario = '3h 48m';
    const totalAdoros = TOP_CHANNELS_DATA.reduce((acc, c) => acc + c.adoros, 0) + 5400;
    const totalComentarios = TOP_CHANNELS_DATA.reduce((acc, c) => acc + c.comentarios, 0) + 2150;

    return {
      totalAssinantes,
      novosMes,
      totalReceitaKz,
      taxaConversao,
      mrrKz,
      ticketMedioKz,
      tempoMedioDiario,
      totalAdoros,
      totalComentarios,
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const formatKz = (val: number) => {
    return `${val.toLocaleString('pt-AO')} Kz`;
  };

  return (
    <div
      id="worscoi-analytics-dashboard-suite"
      className={`w-full rounded-2xl sm:rounded-3xl bg-zinc-950/70 border border-zinc-800/80 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-6 ${className}`}
    >
      {/* 1. CABEÇALHO DO DASHBOARD ANALÍTICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shrink-0 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Métricas da Plataforma & Inteligência de Negócio
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                Ao Vivo • AOA (Kz)
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">
              Controle avançado de subscrições, faturamento por plano, retenção de audiência e engajamento.
            </p>
          </div>
        </div>

        {/* CONTROLES DE PERÍODO E ATUALIZAÇÃO */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Seletor de Período */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
            {(['7d', '30d', '90d', '1a'] as PeriodOption[]).map((opt) => (
              <button
                key={opt}
                type="button"
                id={`analytics-period-btn-${opt}`}
                onClick={() => setPeriod(opt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  period === opt
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Botão de Atualizar Dados */}
          <button
            type="button"
            id="analytics-refresh-btn"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Atualizar dados analíticos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00E676]' : ''}`} />
          </button>

          {/* Botão para ir à lista de assinantes */}
          {onNavigateToSubscribers && (
            <button
              type="button"
              id="analytics-view-subscribers-top-btn"
              onClick={onNavigateToSubscribers}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00E676] border border-emerald-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ver Assinantes</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CARDS DE KPIS PRINCIPAIS (6 INDICADORES DE ALTO IMPACTO) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Assinantes */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Subscritos</span>
            <Users className="w-3.5 h-3.5 text-[#00E676]" />
          </div>
          <div className="my-1">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {totals.totalAssinantes.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{totals.novosMes} este mês</span>
          </div>
        </div>

        {/* Faturamento Total */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Receita Total</span>
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">
              {formatKz(totals.totalReceitaKz)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+19.2% vs mês ant.</span>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Conversão Paga</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="my-1">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {totals.taxaConversao}%
            </span>
          </div>
          <div className="text-[10px] text-zinc-400">
            Pós-degustação 24h
          </div>
        </div>

        {/* Tempo de Retenção */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tempo Retenção</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {totals.tempoMedioDiario}
            </span>
          </div>
          <div className="text-[10px] text-amber-400 font-medium">
            Média / usuário / dia
          </div>
        </div>

        {/* Canal Líder */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Canal Nº 1</span>
            <Tv className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="my-1">
            <span className="text-xs sm:text-sm font-black text-white tracking-tight line-clamp-1">
              SuperSport PL
            </span>
          </div>
          <div className="text-[10px] text-rose-400 font-medium">
            14.850h assistidas
          </div>
        </div>

        {/* Engajamento Social */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Comunidade</span>
            <Heart className="w-3.5 h-3.5 text-[#FF2D55]" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">
              {totals.totalAdoros.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="text-[10px] text-zinc-400">
            Adoros & {totals.totalComentarios} chats
          </div>
        </div>
      </div>

      {/* 3. BARRA DE NAVEGAÇÃO ENTRE ABAS DO DASHBOARD COM ÍCONES NO ESTILO TIKTOK */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-zinc-850 custom-scrollbar select-none">
        {[
          { id: 'visao-geral', label: 'Visão Executiva', icon: TrendingUp },
          { id: 'receita', label: 'Dinheiro & Receita', icon: CreditCard },
          { id: 'planos', label: 'Tipos de Plano', icon: Award },
          { id: 'subscritos', label: 'Subscritos & Novos', icon: Users },
          { id: 'retencao', label: 'Tempo & Retenção', icon: Clock },
          { id: 'mais-assistidos', label: 'Mais Assistidos', icon: Tv },
          { id: 'engajamento', label: 'Comentários & Favoritos', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`analytics-tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-extrabold ring-1 ring-white/50'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-120 group-hover:rotate-6 ${
                isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-800/80 text-zinc-400 group-hover:text-white'
              }`}>
                <Icon className="w-3 h-3 transition-transform duration-200" />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. CONTEÚDO DINÂMICO DEPENDENDO DA ABA ATIVA */}

      {/* ABA 1: VISÃO GERAL EXECUTIVA */}
      {activeTab === 'visao-geral' && (
        <div className="space-y-6">
          {/* Linha dupla de gráficos: Receita Diária (Área) + Distribuição por Plano (Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Gráfico 1: Evolução da Receita e Assinantes (8 Colunas) */}
            <div className="lg:col-span-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Evolução do Faturamento & Novos Subscritos</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Últimos 30 Dias
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Picos acentuados nos fins de semana impulsionados por clássicos de futebol.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]"></span>
                    Receita (Kz)
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    Novos Assinantes
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E676" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradNovos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis
                      dataKey="date"
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#3f3f46' }}
                      interval={3}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px]">
                              <div className="font-bold text-white border-b border-zinc-800 pb-1 flex items-center justify-between">
                                <span>{data.fullDate} ({data.diaSemana})</span>
                                {data.isWeekend && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                                    Fim de Semana
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-zinc-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#00E676]"></span>
                                  Receita:
                                </span>
                                <strong className="text-emerald-400 font-bold">
                                  {formatKz(data.receitaKz)}
                                </strong>
                              </div>
                              <div className="flex items-center justify-between text-zinc-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                  Novos Inscritos:
                                </span>
                                <strong className="text-white font-bold">+{data.novos}</strong>
                              </div>
                              <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-zinc-800 font-normal">
                                <span>Total Assinantes:</span>
                                <span className="text-zinc-200 font-bold">{data.totalAssinantes}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="receitaKz"
                      name="Receita (Kz)"
                      stroke="#00E676"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#gradReceita)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="novos"
                      name="Novos Usuários"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#gradNovos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Distribuição por Tipo de Plano (4 Colunas - Donut) */}
            <div className="lg:col-span-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
                  <span>Planos de Assinatura</span>
                  <span className="text-[10px] text-zinc-400 font-normal">1.428 Assinantes</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Proporção de assinantes ativos por pacote.
                </p>
              </div>

              {/* Rosca / Donut Chart */}
              <div className="h-44 sm:h-48 w-full relative my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PLAN_DISTRIBUTION_DATA}
                      dataKey="subscribers"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {PLAN_DISTRIBUTION_DATA.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl text-xs space-y-1">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: data.color }}
                                />
                                <span>{data.name}</span>
                              </div>
                              <div className="text-zinc-300">
                                Assinantes: <strong className="text-white font-bold">{data.subscribers}</strong> ({data.percentage}%)
                              </div>
                              <div className="text-emerald-400 font-bold text-[11px]">
                                Arrecadação: {formatKz(data.revenueKz)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Texto Central do Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-zinc-400 font-normal">VIP + Prem.</span>
                  <span className="text-lg font-bold text-white">62.3%</span>
                </div>
              </div>

              {/* Lista dos planos com percentual */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                {PLAN_DISTRIBUTION_DATA.slice(0, 4).map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                      <span className="text-zinc-300 font-normal truncate max-w-[130px]">
                        {plan.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-normal">{plan.subscribers}</span>
                      <span className="text-zinc-200 font-bold">{plan.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Segunda linha: Top Canais & Retenção Resumida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Destaque: Canais Mais Assistidos */}
            <div className="rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#00E676]" />
                  <span>Top 4 Canais Mais Assistidos</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('mais-assistidos')}
                  className="text-xs text-[#00E676] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Todos</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {TOP_CHANNELS_DATA.slice(0, 4).map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-zinc-850 flex items-center justify-center text-[11px] font-black text-zinc-300 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                        <span className="text-[10px] text-zinc-400">{ch.tag}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400">
                        {ch.horasAssistidas.toLocaleString('pt-BR')}h
                      </div>
                      <div className="text-[10px] text-zinc-400 font-normal">
                        {ch.espectadores} telespectadores
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destaque: Retenção & Engajamento */}
            <div className="rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Tempo de Retenção & Fidelidade</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('retencao')}
                    className="text-xs text-amber-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Coortes</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 mb-3">
                  A plataforma apresenta uma taxa de retenção de 30 dias de 68%, muito acima da média de streaming (52%).
                </p>
              </div>

              {/* Barras de Retenção Rápida */}
              <div className="space-y-2">
                {RETENTION_COHORT_DATA.slice(0, 4).map((cohort) => (
                  <div key={cohort.dia} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-normal">{cohort.dia} ({cohort.label})</span>
                      <span className="font-bold text-emerald-400">{cohort.retencao}% ativo</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#00E676]"
                        style={{ width: `${cohort.retencao}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Tempo Médio: <strong className="text-white">3h 48m/dia</strong></span>
                <span>Pico Semanal: <strong className="text-white">Domingos 5.2h</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: DINHEIRO & RECEITA (FATURAMENTO EM KWANZAS KZ) */}
      {activeTab === 'receita' && (
        <div className="space-y-5">
          {/* Métricas Financeiras */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs text-zinc-400 font-medium">Receita Bruta Total</span>
              <div className="text-2xl font-black text-white mt-1">
                {formatKz(totals.totalReceitaKz)}
              </div>
              <div className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+19.2% de crescimento mensal</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs text-zinc-400 font-medium">MRR (Receita Mensal Recorrente)</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatKz(totals.mrrKz)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Base estável de assinaturas renovadas
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs text-zinc-400 font-medium">Ticket Médio (ARPU)</span>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {formatKz(totals.ticketMedioKz)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Valor médio por assinante pago
              </div>
            </div>
          </div>

          {/* Gráfico de Barras: Faturamento por Tipo de Plano */}
          <div className="rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-white tracking-tight mb-1">
              Arrecadação Financeira por Categoria de Plano (Kz)
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Comparação do montante arrecadado por cada modalidade de assinatura em Kwanzas.
            </p>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={PLAN_DISTRIBUTION_DATA}
                  margin={{ top: 15, right: 15, left: 15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#3f3f46' }}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
                            <div className="font-bold text-white border-b border-zinc-800 pb-1">
                              {data.name}
                            </div>
                            <div className="flex justify-between text-zinc-300">
                              <span>Preço Unitário:</span>
                              <strong className="text-white font-bold">{formatKz(data.priceKz)}</strong>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                              <span>Assinantes Ativos:</span>
                              <strong className="text-white font-bold">{data.subscribers}</strong>
                            </div>
                            <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-zinc-800">
                              <span>Faturamento Total:</span>
                              <strong>{formatKz(data.revenueKz)}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenueKz"
                    name="Receita em Kz"
                    radius={[6, 6, 0, 0]}
                  >
                    {PLAN_DISTRIBUTION_DATA.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: TIPOS DE PLANO & DISTRIBUIÇÃO */}
      {activeTab === 'planos' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Gráfico Donut de Planos (5 Colunas) */}
            <div className="lg:col-span-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Divisão da Base de Usuários por Plano
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  1.428 contas registradas ativas na plataforma.
                </p>
              </div>

              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PLAN_DISTRIBUTION_DATA}
                      dataKey="subscribers"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {PLAN_DISTRIBUTION_DATA.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} usuários`, 'Assinantes']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-zinc-400 font-semibold">Total Geral</span>
                  <span className="text-2xl font-black text-white">1.428</span>
                  <span className="text-[10px] text-emerald-400 font-bold">95.4% Pagos</span>
                </div>
              </div>

              <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                O plano <strong className="text-white">VIP Esportes HD</strong> representa a maior adesão (40.6%), seguido pelo <strong className="text-white">Premium Ultra 4K</strong> (21.7%).
              </div>
            </div>

            {/* Tabela Detalhada de Planos (7 Colunas) */}
            <div className="lg:col-span-7 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5">
              <h3 className="text-sm font-bold text-white tracking-tight mb-3">
                Desempenho Comercial por Pacote
              </h3>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                      <th className="pb-2">Plano</th>
                      <th className="pb-2">Preço (Kz)</th>
                      <th className="pb-2 text-center">Inscritos</th>
                      <th className="pb-2 text-center">% Base</th>
                      <th className="pb-2 text-right">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {PLAN_DISTRIBUTION_DATA.map((plan) => (
                      <tr key={plan.id} className="hover:bg-zinc-850/50 transition">
                        <td className="py-2.5 flex items-center gap-2 font-bold text-white">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                          <span>{plan.name}</span>
                        </td>
                        <td className="py-2.5 text-zinc-300 font-normal">
                          {plan.priceKz > 0 ? formatKz(plan.priceKz) : 'Grátis (24h)'}
                        </td>
                        <td className="py-2.5 text-center font-bold text-white">
                          {plan.subscribers}
                        </td>
                        <td className="py-2.5 text-center text-zinc-300 font-normal">
                          {plan.percentage}%
                        </td>
                        <td className="py-2.5 text-right font-bold text-emerald-400">
                          {formatKz(plan.revenueKz)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: SUBSCRITOS & CRESCIMENTO TEMPORAL */}
      {activeTab === 'subscritos' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Curva Contínua de Crescimento de Assinantes
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Visualização da aceleração de membros ativos ao longo do tempo.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]" />
                <span>Base Total Ativa</span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSubsGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#3f3f46' }}
                    interval={3}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 50', 'dataMax + 20']}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl text-xs space-y-1">
                            <div className="font-bold text-white">{data.fullDate}</div>
                            <div className="text-zinc-300">
                              Total Acumulado: <strong className="text-emerald-400 font-bold">{data.totalAssinantes}</strong>
                            </div>
                            <div className="text-zinc-400 text-[11px] font-normal">
                              Novos neste dia: <strong className="text-white font-bold">+{data.novos}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalAssinantes"
                    name="Total de Assinantes"
                    stroke="#00E676"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradSubsGrowth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: TEMPO DE RETENÇÃO NA PLATAFORMA (COORTES E PERMANÊNCIA) */}
      {activeTab === 'retencao' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Gráfico 1: Coorte de Retenção % (7 Colunas) */}
            <div className="lg:col-span-7 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Curva de Retenção de Coorte (D1 até D90)</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Percentual de usuários que continuam sintonizando a plataforma com frequência regular.
                </p>
              </div>

              <div className="h-60 w-full my-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={RETENTION_COHORT_DATA} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis
                      dataKey="dia"
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 100]}
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(val: number, name, item) => [
                        `${val}% de retenção (${item.payload.perda})`,
                        item.payload.label,
                      ]}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="retencao"
                      name="Taxa de Retenção"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#F59E0B', stroke: '#000', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#F59E0B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800 text-center text-xs">
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 font-normal uppercase block">Dia 1</span>
                  <strong className="text-white font-bold text-sm">96%</strong>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 font-normal uppercase block">Dia 7</span>
                  <strong className="text-emerald-400 font-bold text-sm">84%</strong>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 font-normal uppercase block">Dia 30</span>
                  <strong className="text-amber-400 font-bold text-sm">68%</strong>
                </div>
              </div>
            </div>

            {/* Gráfico 2: Horas Assistidas por Dia da Semana (5 Colunas) */}
            <div className="lg:col-span-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Horas Assistidas / Dia da Semana</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Média de horas consumidas por usuário ativo em cada dia.
                </p>
              </div>

              <div className="h-60 w-full my-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKDAY_USAGE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis
                      dataKey="dia"
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 6]}
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}h`}
                    />
                    <Tooltip
                      formatter={(val: number, name, item) => [
                        `${val} horas médias (${item.payload.pico})`,
                        'Consumo',
                      ]}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="horasMedia"
                      name="Média de Horas"
                      fill="#EC4899"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                Pico máximo: <strong className="text-white">Domingos com 5.2 horas</strong> de permanência contínua durante transmissões de rodada esportiva.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: CANAIS OU FILMES MAIS ASSISTIDOS */}
      {activeTab === 'mais-assistidos' && (
        <div className="space-y-5">
          {/* Alternador entre Canais e Filmes */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Ranking de Audiência e Conteúdos Mais Consumidos
              </h3>
              <p className="text-[11px] text-zinc-400">
                Horas totais de transmissão, espectadores simultâneos e conclusão de títulos.
              </p>
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
              <button
                type="button"
                id="analytics-filter-channels-btn"
                onClick={() => setMediaTypeFilter('canais')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mediaTypeFilter === 'canais'
                    ? 'bg-[#00E676] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Canais Ao Vivo</span>
              </button>
              <button
                type="button"
                id="analytics-filter-movies-btn"
                onClick={() => setMediaTypeFilter('filmes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mediaTypeFilter === 'filmes'
                    ? 'bg-[#00E676] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Filmes da Filmoteca</span>
              </button>
            </div>
          </div>

          {/* Seção Canais Ao Vivo */}
          {mediaTypeFilter === 'canais' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Gráfico de Barras Horizontais (7 Colunas) */}
              <div className="lg:col-span-7 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Horas Assistidas por Canal de TV
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={TOP_CHANNELS_DATA}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                      <XAxis
                        type="number"
                        stroke="#71717a"
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#71717a"
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={90}
                      />
                      <Tooltip
                        formatter={(val: number) => [`${val.toLocaleString('pt-BR')} horas`, 'Horas Assistidas']}
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#3f3f46',
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="horasAssistidas"
                        name="Horas Assistidas"
                        fill="#00E676"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lista Detalhada com Estatísticas (5 Colunas) */}
              <div className="lg:col-span-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Top Audiência & Espectadores
                </h4>
                {TOP_CHANNELS_DATA.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{ch.name}</div>
                        <div className="text-[10px] text-zinc-400">{ch.categoria} • {ch.share}% da audiência</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400">
                        {ch.horasAssistidas.toLocaleString('pt-BR')}h
                      </div>
                      <div className="text-[10px] text-zinc-400 font-normal">
                        {ch.espectadores} telespectadores
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Seção Filmes da Filmoteca */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Gráfico de Visualizações (7 Colunas) */}
              <div className="lg:col-span-7 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Visualizações Totais por Filme / Série
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={TOP_MOVIES_DATA}
                      margin={{ top: 10, right: 15, left: 0, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis
                        dataKey="titulo"
                        stroke="#71717a"
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: '#3f3f46' }}
                        angle={-15}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        stroke="#71717a"
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(val: number) => [`${val.toLocaleString('pt-BR')} plays`, 'Visualizações']}
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#3f3f46',
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="visualizacoes"
                        name="Visualizações"
                        fill="#3B82F6"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lista Detalhada de Filmes (5 Colunas) */}
              <div className="lg:col-span-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Taxa de Conclusão & Horas
                </h4>
                {TOP_MOVIES_DATA.map((movie, idx) => (
                  <div
                    key={movie.id}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{movie.titulo}</div>
                        <div className="text-[10px] text-zinc-400">
                          {movie.genero} • ★ {movie.rating}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-blue-400">
                        {movie.conclusaoRate}% concluído
                      </div>
                      <div className="text-[10px] text-zinc-400 font-normal">
                        {movie.horasTotais.toLocaleString('pt-BR')}h totais
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 7: CANAIS MAIS COMENTADOS E FAVORITOS (ENGAJAMENTO) */}
      {activeTab === 'engajamento' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Gráfico de Barras Agrupadas: Favoritos vs Comentários (7 Colunas) */}
            <div className="lg:col-span-7 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#FF2D55]" />
                    <span>Favoritos ("Adoros") vs Comentários em Tempo Real</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Comparação do volume de interações sociais nos principais canais.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55]"></span>
                    Adoros
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    Comentários
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={TOP_CHANNELS_DATA}
                    margin={{ top: 15, right: 15, left: -10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis
                      dataKey="name"
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#3f3f46' }}
                      angle={-15}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[180px]">
                              <div className="font-bold text-white border-b border-zinc-800 pb-1">
                                {data.name}
                              </div>
                              <div className="flex items-center justify-between text-rose-300">
                                <span className="flex items-center gap-1.5">
                                  <Heart className="w-3.5 h-3.5 text-[#FF2D55]" />
                                  Adoros:
                                </span>
                                <strong className="font-bold">{data.adoros}</strong>
                              </div>
                              <div className="flex items-center justify-between text-cyan-300">
                                <span className="flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                                  Comentários:
                                </span>
                                <strong className="font-bold">{data.comentarios}</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="adoros" name="Adoros / Favoritos" fill="#FF2D55" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comentarios" name="Comentários" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ranking de Engajamento Social (5 Colunas) */}
            <div className="lg:col-span-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Ranking de Interação Social
              </h4>
              <div className="space-y-2.5">
                {TOP_CHANNELS_DATA.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{ch.name}</div>
                        <div className="text-[10px] text-zinc-400 font-normal">
                          {((ch.adoros + ch.comentarios) / 10).toFixed(0)} interações/hora
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#FF2D55]">
                        <Heart className="w-3.5 h-3.5 fill-[#FF2D55]" />
                        <span>{ch.adoros}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-cyan-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{ch.comentarios}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
