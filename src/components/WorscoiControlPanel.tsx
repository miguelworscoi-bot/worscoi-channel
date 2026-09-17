'use client';
import React, { useState } from 'react';
import {
  ArrowRight,
  KeyRound,
  Check,
  Receipt,
  Sparkles,
  Tv,
  Plus,
  Trash2,
  Settings,
  Shield,
  CreditCard,
  Phone,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { SubscriptionPlanId, Canal } from '@/types';
import { useAuth, UserRole } from '@/context/AuthContext';
import { PAYMENT_CONFIG } from '@/services/subscriptionService';
import { WorscoiAnalyticsDashboard } from './WorscoiAnalyticsDashboard';
import { WeeklyMostWatchedChannelsBarChart } from './WeeklyMostWatchedChannelsBarChart';
import { WorscoiReceiptModal } from './WorscoiReceiptModal';

interface WorscoiControlPanelProps {
  onNavigateToSubscribers: () => void;
  onOpenTokenGenerator: () => void;
  onOpenReceiptGenerator?: () => void;
  onSelectPlan?: (planId: SubscriptionPlanId) => void;
  todosCanais?: Canal[];
  customChannels?: Canal[];
  onOpenAddChannel?: () => void;
  onRemoveCustomChannel?: (channelId: string) => void;
  onOpenPlayerSettings?: () => void;
}

export function WorscoiControlPanel({
  onNavigateToSubscribers,
  onOpenTokenGenerator,
  onOpenReceiptGenerator,
  onSelectPlan,
  todosCanais = [],
  customChannels = [],
  onOpenAddChannel,
  onRemoveCustomChannel,
  onOpenPlayerSettings,
}: WorscoiControlPanelProps) {
  const { user, userProfile, role, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptPlanId, setReceiptPlanId] = useState<SubscriptionPlanId>('vip');
  const [roleFeedback, setRoleFeedback] = useState<string | null>(null);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const handleOpenReceipt = (planId?: SubscriptionPlanId) => {
    if (planId) {
      setReceiptPlanId(planId);
    }
    if (onOpenReceiptGenerator) {
      onOpenReceiptGenerator();
    } else {
      setIsReceiptModalOpen(true);
    }
  };

  const handleRoleToggle = async (newRole: UserRole) => {
    setIsSwitchingRole(true);
    setRoleFeedback(null);
    try {
      await switchRole(newRole);
      setRoleFeedback(
        `Sessão alterada para: ${newRole === 'admin' ? 'Administrador' : 'Espectador'}`
      );
    } catch {
      setRoleFeedback('Erro ao alternar permissão da sessão.');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const planCards = [
    {
      id: 'diario' as SubscriptionPlanId,
      name: 'Passe Fim de Semana (3 Dias)',
      price: '1.500 Kz / 3 dias',
      description:
        'Perfeito para os clássicos e jogos decisivos de sexta a domingo da Champions, Premier e La Liga.',
      features: [
        '3 Dias de Acesso Total e Ilimitado',
        'Transmissão Full HD 1080p',
      ],
    },
    {
      id: 'basico' as SubscriptionPlanId,
      name: 'Básico Esportes (30 Dias)',
      price: '2.500 Kz / 30 dias',
      description:
        'Acesso completo de 1 mês aos principais canais esportivos nacionais e internacionais em HD.',
      features: [
        'Grade Esportiva Essencial (30 dias)',
        'Transmissão HD Estável',
      ],
    },
    {
      id: 'vip' as SubscriptionPlanId,
      name: 'VIP Esportes HD (30 Dias)',
      price: '4.000 Kz / 30 dias',
      description:
        'O plano mais vendido! Todos os canais esportivos, ZAP, SuperSport e canais internacionais sem cortes.',
      features: [
        'Todos os Canais Liberados (ZAP & SuperSport)',
        'Zero Anúncios & Sem Travamentos',
      ],
    },
    {
      id: 'premium' as SubscriptionPlanId,
      name: 'Premium Ultra 4K (90 Dias)',
      price: '9.500 Kz / 90 dias',
      description:
        '3 meses de esportes ao vivo com economia de 2.500 Kz. Máxima prioridade de servidor e qualidade 4K.',
      features: [
        '90 Dias de Acesso Contínuo',
        'Economia de 2.500 Kz',
        'Resolução Ultra HD 4K',
      ],
    },
    {
      id: 'anual' as SubscriptionPlanId,
      name: 'Passe Anual Campeão (365 Dias)',
      price: '30.000 Kz / 365 dias',
      description:
        '1 ano completo de futebol e esportes ao vivo sem se preocupar. Inclui tokens de cortesia para convidados.',
      features: [
        '365 Dias de Acesso Total Irrestrito',
        'Todas as Ligas, Copas & Torneios Mundiais',
        '2 Tokens Bônus de Cortesia para Amigos',
      ],
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 select-none">
      {/* TÍTULO E AÇÕES SUPERIORES DO PAINEL DE CONTROLE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-zinc-900/90">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Painel de Controle
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {role === 'admin' ? 'Administrador' : 'Espectador'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão de canais, métricas de assinantes, configurações da plataforma e geração de recibos
          </p>
        </div>

        {/* BOTÕES DE AÇÃO NO CABEÇALHO */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {onOpenAddChannel && (
            <button
              id="btn-adicionar-canal-header"
              type="button"
              onClick={onOpenAddChannel}
              className="group px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 text-zinc-200 hover:text-white font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Adicionar novo canal à grade"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Novo Canal</span>
            </button>
          )}

          <button
            id="btn-gerar-recibo-header"
            type="button"
            onClick={() => handleOpenReceipt()}
            className="group px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-300 hover:text-emerald-200 font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>Gerar Recibo</span>
          </button>

          <button
            id="btn-gerar-token-header"
            type="button"
            onClick={onOpenTokenGenerator}
            className="group px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 text-zinc-200 hover:text-white font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Gerar Token</span>
          </button>
        </div>
      </div>

      {/* SELETOR DE ABAS PRINCIPAIS: VISÃO GERAL vs CONFIGURAÇÕES */}
      <div className="flex items-center gap-2 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl w-full sm:w-fit">
        <button
          type="button"
          id="btn-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850/50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Visão Geral & Métricas</span>
        </button>

        <button
          type="button"
          id="btn-tab-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850/50'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span>Configurações do Sistema</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL (MÉTRICAS, PLANOS E CARDS) */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* SEÇÃO SUPERIOR: AÇÕES RÁPIDAS + PLANOS DE ASSINATURA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LADO ESQUERDO: AÇÕES RÁPIDAS (GERAR TOKEN & GERAR RECIBO) */}
            <div className="lg:col-span-3 flex flex-col gap-3.5">
              {/* CARD GERAR CHAVE TOKEN */}
              <button
                id="btn-card-gerar-token"
                type="button"
                onClick={onOpenTokenGenerator}
                className="w-full h-36 rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center p-4 text-center group shadow-sm"
              >
                <div className="tiktok-icon-badge w-11 h-11 rounded-full bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-110 group-hover:rotate-12 group-hover:border-zinc-500 group-hover:text-white transition-all duration-200 mb-2 shadow-md">
                  <KeyRound className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition tracking-tight">
                  Gerar Chave Token
                </span>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  Criar tokens de 5 dígitos para novos assinantes
                </p>
              </button>

              {/* CARD GERAR RECIBO DE PAGAMENTO */}
              <button
                id="btn-card-gerar-recibo"
                type="button"
                onClick={() => handleOpenReceipt()}
                className="w-full h-36 rounded-2xl border border-emerald-900/40 hover:border-emerald-700/60 bg-gradient-to-b from-emerald-950/20 via-zinc-900/50 to-zinc-900/40 hover:from-emerald-950/35 hover:to-zinc-850/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center p-4 text-center group shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-12 group-hover:border-emerald-500 group-hover:text-emerald-300 transition-all duration-200 mb-2 shadow-md">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition tracking-tight flex items-center gap-1">
                  <span>Gerar Recibo</span>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </span>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  Emitir comprovativo oficial em PDF ou WhatsApp
                </p>
              </button>
            </div>

            {/* LADO DIREITO: ESCOLHA O SEU PLANO */}
            <div className="lg:col-span-9 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">
                  Planos de Assinatura
                </h2>
                <span className="text-xs text-zinc-400">
                  Preços oficiais em Kwanzas (Kz)
                </span>
              </div>

              {/* GRID DOS PLANOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {planCards.map((plan) => {
                  const isSelected = selectedPlanPreview === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanPreview(plan.id);
                        if (onSelectPlan) onSelectPlan(plan.id);
                      }}
                      className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer group shadow-sm ${
                        isSelected
                          ? 'border-zinc-400 bg-zinc-850/90'
                          : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-tight group-hover:text-white transition">
                          {plan.name}
                        </h3>
                        <div className="text-xs font-semibold text-zinc-300">
                          {plan.price}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">
                          {plan.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="text-[10px] text-zinc-400 flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SEÇÃO EM DESTAQUE: GRÁFICO DE BARRAS DOS CANAIS MAIS ASSISTIDOS DA SEMANA */}
          <div className="pt-2 border-t border-zinc-900/80">
            <WeeklyMostWatchedChannelsBarChart />
          </div>

          {/* SEÇÃO PRINCIPAL DE INTELIGÊNCIA ANALÍTICA & MÉTRICAS */}
          <div className="pt-2 border-t border-zinc-900/80">
            <WorscoiAnalyticsDashboard onNavigateToSubscribers={onNavigateToSubscribers} />
          </div>

          {/* SEÇÃO INFERIOR: BOTÃO VER ASSINANTES */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onNavigateToSubscribers}
              className="group px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 shadow-md"
            >
              <span>Ver Assinantes</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110" />
            </button>
          </div>
        </div>
      )}

      {/* ABA 2: CONFIGURAÇÕES DO SISTEMA (CANAIS, PAGAMENTOS, SESSÃO E TOKENS) */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* FEEDBACK DE SUCESSO/ERRO */}
          {roleFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{roleFeedback}</span>
            </div>
          )}

          {/* 1. GESTÃO E CONFIGURAÇÃO DA GRADE DE CANAIS */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Gestão da Grade de Canais
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {todosCanais.length} canais ativos na transmissão oficial da Worscoi TV
                  </p>
                </div>
              </div>

              {onOpenAddChannel && (
                <button
                  type="button"
                  id="settings-btn-add-channel"
                  onClick={onOpenAddChannel}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Novo Canal</span>
                </button>
              )}
            </div>

            {/* LISTA DE CANAIS PERSONALIZADOS */}
            <div>
              <div className="text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                <span>Canais Personalizados Adicionados:</span>
                <span className="text-[11px] text-zinc-400">
                  {customChannels.length} canal(is) configurado(s)
                </span>
              </div>

              {customChannels.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-center text-xs text-zinc-400">
                  Nenhum canal personalizado foi criado. Todos os canais padrão estão transmitindo sem interrupções.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {customChannels.map((canal) => (
                    <div
                      key={canal.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <span className="font-semibold text-white mr-2">{canal.nome}</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                            {canal.categoria || 'Geral'}
                          </span>
                        </div>
                      </div>

                      {onRemoveCustomChannel && (
                        <button
                          type="button"
                          onClick={() => onRemoveCustomChannel(canal.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Remover canal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. CONFIGURAÇÕES OFICIAIS DE PAGAMENTO & WHATSAPP */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Configurações de Pagamento & Contactos
                </h3>
                <p className="text-xs text-zinc-400">
                  Informações oficiais exibidas aos clientes no fluxo de contratação
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Multicaixa Express (MCX):</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
                    Ativo
                  </span>
                </div>
                <div className="text-sm font-bold text-white tracking-wider">
                  {PAYMENT_CONFIG.phoneFormatted}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Beneficiário: {PAYMENT_CONFIG.multicaixa.beneficiary}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">PayPay Angola:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
                    Ativo
                  </span>
                </div>
                <div className="text-sm font-bold text-white tracking-wider">
                  {PAYMENT_CONFIG.phoneFormatted}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Beneficiário: {PAYMENT_CONFIG.paypay.beneficiary}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp de Envio de Comprovativos:</span>
              </div>
              <span className="font-semibold text-zinc-200">
                +244 942 472 983
              </span>
            </div>
          </div>

          {/* 3. CONFIGURAÇÕES DE REGRAS DE TOKENS & LIMITE CUMULATIVO */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Regras de Tokens & Limite Cumulativo
                </h3>
                <p className="text-xs text-zinc-400">
                  Como o sistema processa ativações sequenciais de chaves
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-emerald-900/30 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Soma Cumulativa de Tokens (Token Stacking)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      HABILITADO
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Quando um assinante possui dias restantes (ex: restam 2 dias) e ativa uma nova chave de 3 dias, o sistema soma automaticamente o limite total para 5 dias, sem perder nenhum segundo do plano anterior.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Degustação Gratuita (Teste 24 Horas)</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                      1 DIA / DISPOSITIVO
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Cada aparelho tem direito a 24 horas ininterruptas de degustação com proteção por impressão digital única para evitar reusos indevidos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. CONFIGURAÇÕES DE SESSÃO & PERMISSÕES */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Permissões & Conta de Administrador
                </h3>
                <p className="text-xs text-zinc-400">
                  Conta oficial autorizada: miguelworscoi@gmail.com
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Conta Logada
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {userProfile?.displayName || user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-zinc-400">{user?.email || 'Sessão Local'}</div>
              </div>

              {/* ALTERNADOR DE MODO DE TESTE */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  id="settings-role-switch-user"
                  disabled={isSwitchingRole}
                  onClick={() => handleRoleToggle('user')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    role === 'user'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Modo Espectador
                </button>
                <button
                  type="button"
                  id="settings-role-switch-admin"
                  disabled={isSwitchingRole}
                  onClick={() => handleRoleToggle('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'bg-amber-400 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Modo Administrador
                </button>
              </div>
            </div>
          </div>

          {/* 5. AJUSTES RÁPIDOS DO REPRODUTOR */}
          {onOpenPlayerSettings && (
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Ajustes de Latência & Servidores do Reprodutor
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Configurar Modo Estável, Baixa Latência e Economia de Dados
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPlayerSettings}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                Abrir Ajustes
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE GERAÇÃO DE RECIBOS */}
      <WorscoiReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        prefillPlanId={receiptPlanId}
      />
    </div>
  );
}

export default WorscoiControlPanel;
