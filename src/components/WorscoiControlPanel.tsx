'use client';
import React, { useState } from 'react';
import { ArrowRight, KeyRound, Check } from 'lucide-react';
import { SubscriptionPlanId } from '@/types';
import { WorscoiAnalyticsDashboard } from './WorscoiAnalyticsDashboard';
import { WeeklyMostWatchedChannelsBarChart } from './WeeklyMostWatchedChannelsBarChart';

interface WorscoiControlPanelProps {
  onNavigateToSubscribers: () => void;
  onOpenTokenGenerator: () => void;
  onSelectPlan?: (planId: SubscriptionPlanId) => void;
}

export function WorscoiControlPanel({
  onNavigateToSubscribers,
  onOpenTokenGenerator,
  onSelectPlan,
}: WorscoiControlPanelProps) {
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<string | null>(null);

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
      {/* TÍTULO CENTRAL: PAINEL DE CONTROLE */}
      <div className="text-center">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Painel de Controle
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Visão geral de assinaturas, planos ativos e geração de tokens
        </p>
      </div>

      {/* SEÇÃO SUPERIOR: GERAR CHAVE TOKEN (ESQUERDA) + ESCOLHA O SEU PLANO (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LADO ESQUERDO: CARD REFINADO "GERAR CHAVE TOKEN" */}
        <div className="lg:col-span-3 flex flex-col">
          <button
            type="button"
            onClick={onOpenTokenGenerator}
            className="w-full h-44 rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center p-5 text-center group shadow-sm"
          >
            <div className="tiktok-icon-badge w-12 h-12 rounded-full bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-120 group-hover:rotate-12 group-hover:border-zinc-500 group-hover:text-white transition-all duration-200 mb-2.5 shadow-md">
              <KeyRound className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition tracking-tight">
              Gerar Chave Token
            </span>
            <p className="text-[11px] text-zinc-400 mt-1">
              Criar tokens de 5 dígitos para novos assinantes
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
    </div>
  );
}

export default WorscoiControlPanel;

