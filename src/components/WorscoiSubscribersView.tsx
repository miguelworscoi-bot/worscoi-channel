'use client';
import React, { useState } from 'react';
import {
  ArrowLeft,
  KeyRound,
  Trash2,
  RefreshCw,
  Search,
  Clock,
  Crown,
} from 'lucide-react';
import { SubscriptionPlanId } from '@/types';
import { SubscribersPlanRevenueChart } from './SubscribersPlanRevenueChart';

interface SubscriberRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  planName: string;
  planId: SubscriptionPlanId;
  validity: string;
  status: 'active' | 'expiring' | 'expired';
}

interface WorscoiSubscribersViewProps {
  onBackToControlPanel: () => void;
  onOpenTokenGenerator: () => void;
}

const INITIAL_SUBSCRIBERS: SubscriberRow[] = [
  {
    id: 'sub-1',
    name: 'Lucas Oliveira',
    email: 'lucas.oliveira@email.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    planName: 'VIP Esportes HD (30 Dias)',
    planId: 'vip',
    validity: '30/10/2026',
    status: 'active',
  },
  {
    id: 'sub-2',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    planName: 'Premium Ultra 4K (90 Dias)',
    planId: 'premium',
    validity: '15/12/2026',
    status: 'active',
  },
  {
    id: 'sub-3',
    name: 'Gabriel Santos',
    email: 'gabriel.santos@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    planName: 'Passe Anual Campeão (365 Dias)',
    planId: 'anual',
    validity: '22/09/2027',
    status: 'active',
  },
  {
    id: 'sub-4',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    planName: 'Básico Esportes (30 Dias)',
    planId: 'basico',
    validity: '05/11/2026',
    status: 'active',
  },
  {
    id: 'sub-5',
    name: 'Rafael Moreira',
    email: 'rafael.moreira@email.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    planName: 'Passe Fim de Semana (3 Dias)',
    planId: 'diario',
    validity: '18/10/2026',
    status: 'expiring',
  },
];

export function WorscoiSubscribersView({
  onBackToControlPanel,
  onOpenTokenGenerator,
}: WorscoiSubscribersViewProps) {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>(INITIAL_SUBSCRIBERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRenew = (id: string) => {
    setSubscribers((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            validity: '15/11/2026',
            status: 'active',
          };
        }
        return sub;
      })
    );
  };

  const handleRevoke = (id: string) => {
    if (confirm('Deseja realmente revogar o acesso deste assinante?')) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 select-none">
      {/* CABEÇALHO COM BOTÃO VOLTAR E TÍTULO CENTRAL */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToControlPanel}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Assinantes
        </h1>

        <button
          type="button"
          onClick={onOpenTokenGenerator}
          className="flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-full bg-[#FF2D55] hover:bg-[#FF2D55]/90 transition cursor-pointer shadow-md shadow-[#FF2D55]/30"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Gerar Chave</span>
        </button>
      </div>

      {/* 4 CARDS DE MÉTRICA COM DESIGN REFINADO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-4 text-center hover-lift shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 block">Assinantes Ativos</span>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block tracking-tight">
            1.120
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-4 text-center hover-lift shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 block">Assinantes Novos</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block tracking-tight">
            +94
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-4 text-center hover-lift shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 block">Tokens Resgatados</span>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block tracking-tight">
            874
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-4 text-center hover-lift shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 block">Tokens Disponíveis</span>
          <span className="text-xl sm:text-2xl font-black text-[#FF2D55] mt-1 block tracking-tight">
            126
          </span>
        </div>
      </div>

      {/* GRÁFICO 100% FUNCIONAL: FLUXO DE SUBSCRITORES, TIPOS DE PLANO E DINHEIRO GANHO */}
      <SubscribersPlanRevenueChart />

      {/* TABELA DE ASSINANTES */}
      <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-850">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar assinante por nome ou plano..."
              className="w-full bg-zinc-900 text-xs text-zinc-200 placeholder-zinc-500 rounded-full pl-8 pr-3 py-2 border border-zinc-800 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <span className="text-xs text-zinc-500">
            Mostrando {filtered.length} de {subscribers.length} assinantes
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-3">Avatar</th>
                <th className="py-3 px-3">Nome</th>
                <th className="py-3 px-3">Tipo de Plano Ativo</th>
                <th className="py-3 px-3">Validade</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60 text-xs">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-900/40 transition">
                  {/* AVATAR COM ANEL NEON */}
                  <td className="py-3 px-3">
                    <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#FF2D55] via-purple-500 to-amber-400">
                      <img
                        src={sub.avatar}
                        alt={sub.name}
                        className="w-full h-full rounded-full object-cover bg-zinc-900"
                      />
                    </div>
                  </td>

                  {/* NOME E EMAIL */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{sub.name}</div>
                    <div className="text-[11px] text-zinc-500">{sub.email}</div>
                  </td>

                  {/* PLANO ATIVO */}
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FF2D55]/10 text-[#FF2D55] border border-[#FF2D55]/30">
                      <Crown className="w-3 h-3" />
                      <span>{sub.planName}</span>
                    </span>
                  </td>

                  {/* VALIDADE */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{sub.validity}</span>
                    </div>
                  </td>

                  {/* AÇÕES */}
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRenew(sub.id)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer"
                        title="Renovar Plano (+30 dias)"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRevoke(sub.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Revogar Acesso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WorscoiSubscribersView;

