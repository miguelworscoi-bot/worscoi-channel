'use client';
import React from 'react';
import { SubscriptionPlanId } from '@/types';

export interface PlanCardTheme {
  id: SubscriptionPlanId;
  name: string;
  badgeLabel: string;
  cardBg: string;
  shadowClass: string;
  ringClass: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  dotColor: string;
}

export const PLAN_CARD_THEMES: Record<SubscriptionPlanId, PlanCardTheme> = {
  free: {
    id: 'free',
    name: 'Plano Grátis Degustação',
    badgeLabel: 'TESTE 1 DIA (24H)',
    cardBg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800',
    shadowClass: 'shadow-2xl shadow-emerald-500/35',
    ringClass: 'ring-1 ring-emerald-400/40',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/40',
    dotColor: '#10B981',
  },
  diario: {
    id: 'diario',
    name: 'Passe Fim de Semana',
    badgeLabel: '3 DIAS',
    cardBg: 'bg-gradient-to-br from-[#FF2D55] via-[#E11D48] to-[#9F1239]',
    shadowClass: 'shadow-2xl shadow-[#FF2D55]/35',
    ringClass: 'ring-1 ring-[#FF2D55]/40',
    accentText: 'text-[#FF2D55]',
    accentBg: 'bg-[#FF2D55]/15',
    accentBorder: 'border-[#FF2D55]/40',
    dotColor: '#FF2D55',
  },
  basico: {
    id: 'basico',
    name: 'Básico Esportes',
    badgeLabel: 'BÁSICO (30D)',
    cardBg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-800',
    shadowClass: 'shadow-2xl shadow-blue-500/35',
    ringClass: 'ring-1 ring-blue-400/40',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500/15',
    accentBorder: 'border-blue-500/40',
    dotColor: '#3B82F6',
  },
  vip: {
    id: 'vip',
    name: 'VIP Esportes & ZAP',
    badgeLabel: 'VIP ZAP',
    cardBg: 'bg-gradient-to-br from-purple-600 via-violet-700 to-fuchsia-950',
    shadowClass: 'shadow-2xl shadow-purple-600/35',
    ringClass: 'ring-1 ring-purple-400/40',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-500/15',
    accentBorder: 'border-purple-500/40',
    dotColor: '#8B5CF6',
  },
  premium: {
    id: 'premium',
    name: 'Premium Ultra 4K',
    badgeLabel: 'ULTRA 4K',
    cardBg: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700',
    shadowClass: 'shadow-2xl shadow-orange-500/35',
    ringClass: 'ring-1 ring-orange-400/40',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/15',
    accentBorder: 'border-amber-500/40',
    dotColor: '#F59E0B',
  },
  anual: {
    id: 'anual',
    name: 'Passe Anual Campeão',
    badgeLabel: 'CAMPEÃO 365',
    cardBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-800',
    shadowClass: 'shadow-2xl shadow-yellow-500/35',
    ringClass: 'ring-1 ring-yellow-300/50',
    accentText: 'text-yellow-400',
    accentBg: 'bg-yellow-500/15',
    accentBorder: 'border-yellow-500/40',
    dotColor: '#EAB308',
  },
};

interface WorscoiCardVisualProps {
  variant?: 'vertical' | 'horizontal';
  className?: string;
  planId?: SubscriptionPlanId;
}

/**
 * Visual do Cartão Worscoi com Temas de Cores Únicos por Plano
 * Imagem 7: Vertical com anel giratório pontilhado no topo esquerdo e logotipo 'Worscoi' manuscrito vertical na base esquerda
 * Imagem 8: Horizontal com anel giratório na base esquerda e logotipo 'Worscoi' manuscrito na base direita
 */
export function WorscoiCardVisual({
  variant = 'vertical',
  className = '',
  planId = 'diario',
}: WorscoiCardVisualProps) {
  const theme = PLAN_CARD_THEMES[planId] || PLAN_CARD_THEMES.diario;

  if (variant === 'horizontal') {
    return (
      <div
        id="worscoi-card-horizontal"
        className={`relative w-72 h-44 sm:w-80 sm:h-48 md:w-96 md:h-56 rounded-3xl ${theme.cardBg} text-white p-5 sm:p-6 flex flex-col justify-between ${theme.shadowClass} ${theme.ringClass} select-none overflow-hidden transition-all duration-500 hover:scale-[1.02] ${className}`}
      >
        {/* Reflexo sutil */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

        {/* Topo do cartão: Badge do plano específico */}
        <div className="w-full flex justify-between items-start relative z-10">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-sm">
            {theme.badgeLabel}
          </span>
        </div>

        {/* Rodapé do cartão: Anel giratório na esquerda + Logo Worscoi manuscrito na direita */}
        <div className="w-full flex items-end justify-between relative z-10">
          {/* Anel de pontinhos brancos giratórios */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white animate-spin"
              style={{ animationDuration: '6s' }}
              viewBox="0 0 36 36"
              fill="none"
            >
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray="3 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Logotipo manuscrito Worscoi em branco */}
          <span
            data-logomark="true"
            style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
            className="text-3xl sm:text-4xl text-white font-bold tracking-wide font-logomark logomark-font select-none"
          >
            Worscoi
          </span>
        </div>
      </div>
    );
  }

  // Variant: Vertical (Imagem 7)
  return (
    <div
      id="worscoi-card-vertical"
      className={`relative w-60 h-[380px] sm:w-64 sm:h-[410px] md:w-72 md:h-[450px] rounded-[32px] ${theme.cardBg} text-white p-6 flex flex-col justify-between ${theme.shadowClass} ${theme.ringClass} select-none overflow-hidden transition-all duration-500 ${className}`}
    >
      {/* Reflexo suave no cartão */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15 pointer-events-none" />

      {/* Topo: Anel de pontinhos brancos giratórios na esquerda + Badge do plano na direita */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="w-9 h-9 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white animate-spin"
            style={{ animationDuration: '6s' }}
            viewBox="0 0 36 36"
            fill="none"
          >
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeDasharray="3.5 4.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-sm">
          {theme.badgeLabel}
        </span>
      </div>

      {/* Base esquerda: Logotipo Worscoi em tipografia cursiva virado na vertical (Imagem 7) */}
      <div className="relative z-10 flex items-start pl-1 pb-4">
        <span
          data-logomark="true"
          style={{
            fontFamily: "'Caveat', 'Dancing Script', cursive",
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
          className="text-3xl sm:text-4xl text-white font-bold tracking-wider font-logomark logomark-font select-none"
        >
          Worscoi
        </span>
      </div>
    </div>
  );
}
