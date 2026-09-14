'use client';
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { SubscriptionPlanId } from '@/types';

interface WorscoiControlPanelProps {
  onNavigateToSubscribers: () => void;
  onOpenTokenGenerator: () => void;
  onSelectPlan?: (planId: SubscriptionPlanId) => void;
}

const REVENUE_DATA = [
  { hora: '9h', valor: 4200, label: 'R$ 4.200,00' },
  { hora: '10h', valor: 5900, label: 'R$ 5.900,00' },
  { hora: '11h', valor: 4800, label: 'R$ 4.800,00' },
  { hora: '12h', valor: 800, label: 'R$ 800,00' },
  { hora: '13h', valor: 2100, label: 'R$ 2.100,00' },
  { hora: '14h', valor: 1100, label: 'R$ 1.100,00' },
  { hora: '15h', valor: 3800, label: 'R$ 3.800,00' },
  { hora: '16h', valor: 2300, label: 'R$ 2.300,00' },
  { hora: '17h', valor: 1800, label: 'R$ 1.800,00' },
  { hora: '18h', valor: 2200, label: 'R$ 2.200,00' },
  { hora: '19h', valor: 1900, label: 'R$ 1.900,00' },
];

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
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Painel de controle
        </h1>
      </div>

      {/* SEÇÃO SUPERIOR: GERAR CHAVE TOKEN (ESQUERDA) + ESCOLHA O SEU PLANO (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LADO ESQUERDO: CARD COM BORDA TRACEJADA "GERAR CHAVE TOKEN" */}
        <div className="lg:col-span-3 flex flex-col">
          <div
            onClick={onOpenTokenGenerator}
            className="w-full h-44 rounded-2xl border-2 border-dashed border-[#FF2D55]/70 hover:border-[#FF2D55] bg-zinc-950/50 hover:bg-[#FF2D55]/5 transition cursor-pointer flex flex-col items-center justify-center p-4 text-center group"
          >
            <span className="text-base sm:text-lg font-bold text-[#FF2D55] group-hover:scale-105 transition tracking-tight">
              Gerar Chave token
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">
              Criar tokens de 5 dígitos para novos assinantes
            </p>
          </div>
        </div>

        {/* LADO DIREITO: ESCOLHA O SEU PLANO */}
        <div className="lg:col-span-9 space-y-3">
          <div className="text-center lg:text-left">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Escolha o seu Plano
            </h2>
          </div>

          {/* GRID DOS 5 PLANOS COM BORDAS TRACEJADAS VERMELHAS / PINK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {planCards.map((plan) => {
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanPreview(plan.id);
                    if (onSelectPlan) onSelectPlan(plan.id);
                  }}
                  className={`rounded-2xl border-2 border-dashed border-[#FF2D55]/70 hover:border-[#FF2D55] bg-zinc-950/60 p-4 transition flex flex-col justify-between space-y-3 cursor-pointer group ${
                    selectedPlanPreview === plan.id ? 'ring-1 ring-[#FF2D55]' : ''
                  }`}
                >
                  <div className="space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight group-hover:text-[#FF2D55] transition">
                      {plan.name}
                    </h3>
                    <div className="text-xs font-semibold text-zinc-300">
                      {plan.price}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900/80 space-y-1">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="text-[10px] text-zinc-300 flex items-start gap-1">
                        <span className="text-[#FF2D55]">•</span>
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

      {/* SEÇÃO DO MEIO: CRESCIMENTO DE ASSINANTES */}
      <div className="space-y-4 pt-4 border-t border-zinc-900/60">
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Crescimento de Assinantes
          </h2>
        </div>

        {/* 4 CARDS DE MÉTRICA COM BORDAS TRACEJADAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border-2 border-dashed border-[#FF2D55]/70 bg-zinc-950/60 p-4 text-center">
            <span className="text-xs font-semibold text-zinc-400 block">Total</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              1.428
            </span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#FF2D55]/70 bg-zinc-950/60 p-4 text-center">
            <span className="text-xs font-semibold text-zinc-400 block">Novos</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
              +94
            </span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#FF2D55]/70 bg-zinc-950/60 p-4 text-center">
            <span className="text-xs font-semibold text-zinc-400 block">Assinantes pagos</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              1.120
            </span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#FF2D55]/70 bg-zinc-950/60 p-4 text-center">
            <span className="text-xs font-semibold text-zinc-400 block">Conversão Paga</span>
            <span className="text-xl sm:text-2xl font-black text-[#FF2D55] mt-1 block">
              78.4%
            </span>
          </div>
        </div>

        {/* GRÁFICO DE CRESCIMENTO DE ASSINANTES / RECEITA */}
        <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/95 p-4 sm:p-6 shadow-xl shadow-black/40">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="hora"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  domain={[0, 6000]}
                  ticks={[0, 2000, 4000, 6000]}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${val.toLocaleString('pt-BR')},00`}
                  tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')},00`, 'Receita']}
                  labelFormatter={(label) => `Horário: ${label}`}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#00E5FF"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#curveFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: BOTÃO VER ASSINANTES */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNavigateToSubscribers}
          className="px-8 py-3 rounded-full bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white font-bold text-sm shadow-lg shadow-[#FF2D55]/30 transition cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <span>Ver assinantes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
