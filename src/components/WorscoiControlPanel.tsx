'use client';
import React, { useState } from 'react';
import { ArrowRight, KeyRound, Check, Receipt, Sparkles } from 'lucide-react';
import { SubscriptionPlanId } from '@/types';
import { WorscoiAnalyticsDashboard } from './WorscoiAnalyticsDashboard';
import { WeeklyMostWatchedChannelsBarChart } from './WeeklyMostWatchedChannelsBarChart';
import { WorscoiReceiptModal } from './WorscoiReceiptModal';

interface WorscoiControlPanelProps {
  onNavigateToSubscribers: () => void;
  onOpenTokenGenerator: () => void;
  onOpenReceiptGenerator?: () => void;
  onSelectPlan?: (planId: SubscriptionPlanId) => void;
}

export function WorscoiControlPanel({
  onNavigateToSubscribers,
  onOpenTokenGenerator,
  onOpenReceiptGenerator,
  onSelectPlan,
}: WorscoiControlPanelProps) {
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptPlanId, setReceiptPlanId] = useState<SubscriptionPlanId>('vip');

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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 select-none">
      {/* TÍTULO E AÇÕES SUPERIORES DO PAINEL DE CONTROLE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-900/90">
        <div className="text-center sm:text-left">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Painel de Controle
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visão geral de assinaturas, planos ativos, geração de recibos e tokens
          </p>
        </div>

        {/* BOTÕES DE AÇÃO NO CABEÇALHO */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <button
            id="btn-gerar-recibo-header"
            type="button"
            onClick={() => handleOpenReceipt()}
            className="group px-4 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-300 hover:text-emerald-200 font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Receipt className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>Gerar Recibo</span>
          </button>

          <button
            id="btn-gerar-token-header"
            type="button"
            onClick={onOpenTokenGenerator}
            className="group px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 text-zinc-200 hover:text-white font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <KeyRound className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Gerar Token</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO SUPERIOR: AÇÕES RÁPIDAS (ESQUERDA) + ESCOLHA O SEU PLANO (DIREITA) */}
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
          <div className="text-center lg:text-left">
            <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">
              Planos de Assinatura
            </h2>
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

