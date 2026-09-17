'use client';
import React, { useState } from 'react';
import {
  Crown,
  Tv,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Users,
  KeyRound,
  ArrowRight,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { Canal } from '@/types';
import { useAuth, UserRole } from '@/context/AuthContext';
import { SubscriberGrowthChart } from '@/components/SubscriberGrowthChart';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  todosCanais: Canal[];
  customChannels: Canal[];
  onOpenAddChannel: () => void;
  onRemoveCustomChannel: (channelId: string) => void;
  onOpenSubscribers: () => void;
  onOpenPaymentPlans?: () => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  todosCanais,
  customChannels,
  onOpenAddChannel,
  onRemoveCustomChannel,
  onOpenSubscribers,
  onOpenPaymentPlans,
}: AdminPanelModalProps) {
  const { user, userProfile, role, isAdmin, switchRole } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'channels' | 'session'>('analytics');

  if (!isOpen) return null;
  if (!isAdmin) return null;

  const handleRoleToggle = async (newRole: UserRole) => {
    setSwitching(true);
    setFeedback(null);
    try {
      await switchRole(newRole);
      setFeedback(`Sessão alterada para: ${newRole === 'admin' ? 'Administrador' : 'Usuário Normal'}`);
    } catch {
      setFeedback('Erro ao alternar permissão da sessão.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      id="admin-panel-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="admin-panel-modal"
        className="relative w-full max-w-4xl bg-[#0d0f14] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/90 ring-1 ring-white/5 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO LIMPO E DIRETO */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Painel de Administração
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/25">
                  {role === 'admin' ? 'Admin' : 'Espectador'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Gerenciamento de assinantes, grade de canais e permissões.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 group"
            title="Fechar"
          >
            <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* FEEDBACK DE AÇÃO */}
        {feedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* BARRA DE NAVEGAÇÃO ENTRE ABAS */}
        <div className="mt-3.5 flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shrink-0">
          <button
            type="button"
            id="admin-tab-growth"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            id="admin-tab-channels"
            onClick={() => setActiveTab('channels')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Canais</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'channels' ? 'bg-black/20 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {todosCanais.length}
            </span>
          </button>

          <button
            type="button"
            id="admin-tab-session"
            onClick={() => setActiveTab('session')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'session'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Permissões</span>
          </button>
        </div>

        {/* CONTEÚDO COM SCROLL SUAVE */}
        <div className="flex-1 overflow-y-auto mt-3.5 pr-1 space-y-3.5">
          {/* ABA 1: VISÃO GERAL & CRESCIMENTO */}
          {activeTab === 'analytics' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* ATALHOS RÁPIDOS E DIRETOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="admin-btn-open-subscribers"
                  onClick={() => {
                    onClose();
                    onOpenSubscribers();
                  }}
                  className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between text-left transition-all duration-200 hover:scale-[1.01] active:scale-99 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        Gerenciar Assinantes
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Lista de usuários e gerador de tokens
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-zinc-500 group-hover:text-white transition-colors">
                    <KeyRound className="w-3.5 h-3.5 mr-1" />
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {onOpenPaymentPlans && (
                  <button
                    type="button"
                    id="admin-btn-open-plans"
                    onClick={() => {
                      onClose();
                      onOpenPaymentPlans();
                    }}
                    className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between text-left transition-all duration-200 hover:scale-[1.01] active:scale-99 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Tabela de Planos
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Preços, prazos e métodos de pagamento
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                )}
              </div>

              {/* GRÁFICO RECHARTS */}
              <div className="rounded-xl border border-zinc-800/70 overflow-hidden">
                <SubscriberGrowthChart
                  onOpenSubscribersModal={() => {
                    onClose();
                    onOpenSubscribers();
                  }}
                />
              </div>
            </div>
          )}

          {/* ABA 2: CANAIS */}
          {activeTab === 'channels' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">
                  Grade Geral ({todosCanais.length} canais ativos)
                </span>
                <button
                  type="button"
                  id="admin-btn-add-channel"
                  onClick={() => {
                    onClose();
                    onOpenAddChannel();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Canal</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {customChannels.length === 0 ? (
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center text-xs text-zinc-400">
                    Nenhum canal personalizado criado. Os {todosCanais.length} canais padrão estão ativos na transmissão.
                  </div>
                ) : (
                  customChannels.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70 text-xs hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-white">{c.nome}</span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {c.categoria || 'Geral'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveCustomChannel(c.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Remover canal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABA 3: PERMISSÕES & SESSÃO */}
          {activeTab === 'session' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Conta Ativa
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {userProfile?.displayName || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-zinc-400">{user?.email}</div>
                </div>

                {/* ALTERNADOR DE MODO */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                  <button
                    type="button"
                    id="role-switch-user"
                    disabled={switching}
                    onClick={() => handleRoleToggle('user')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      role === 'user'
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Usuário Comum
                  </button>
                  <button
                    type="button"
                    id="role-switch-admin"
                    disabled={switching}
                    onClick={() => handleRoleToggle('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-amber-400 text-black font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Administrador
                  </button>
                </div>
              </div>

              {/* RESUMO SIMPLIFICADO DO PAPEL */}
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
                <span>Permissão ativa:</span>
                <span className="font-semibold text-zinc-200">
                  {role === 'admin' ? 'Acesso administrativo irrestrito' : 'Visualização como espectador'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ MINIMALISTA */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistema Operacional</span>
          </div>
          <span className="text-zinc-400 font-normal">Worscoi Channel</span>
        </div>
      </div>
    </div>
  );
}

