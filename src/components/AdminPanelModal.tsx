'use client';
import React, { useState } from 'react';
import {
  Crown,
  Tv,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Users,
  Activity,
  KeyRound,
  ArrowRight,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { Canal } from '@/types';
import { useAuth, UserRole } from '@/context/AuthContext';
import { PAYMENT_CONFIG } from '@/services/subscriptionService';
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'session' | 'channels'>('analytics');

  if (!isOpen) return null;
  if (!isAdmin) return null;

  const handleRoleToggle = async (newRole: UserRole) => {
    setSwitching(true);
    setFeedback(null);
    try {
      await switchRole(newRole);
      setFeedback(`Sessão alterada com sucesso para: ${newRole === 'admin' ? 'Administrador' : 'Usuário Normal'}`);
    } catch {
      setFeedback('Erro ao alternar o papel da sessão.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      id="admin-panel-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="admin-panel-modal"
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Painel de Administração
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {role === 'admin' ? 'Acesso Total' : 'Modo Espectador'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Métricas de crescimento de assinantes, controle de sessões e canais do sistema.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* NAVEGAÇÃO POR ABAS DO PAINEL DE ADMINISTRAÇÃO */}
        <div className="mt-4 flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto">
          <button
            type="button"
            id="admin-tab-growth"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#00E676] text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Crescimento (30 Dias)</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                activeTab === 'analytics' ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              Recharts
            </span>
          </button>

          <button
            type="button"
            id="admin-tab-session"
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'session'
                ? 'bg-[#00E676] text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sessão & Permissões</span>
          </button>

          <button
            type="button"
            id="admin-tab-channels"
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'channels'
                ? 'bg-[#00E676] text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Grade de Canais</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'channels' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {todosCanais.length}
            </span>
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: CRESCIMENTO DE ASSINANTES (RECHARTS) */}
        {activeTab === 'analytics' && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            {/* COMPONENTE DE GRÁFICO RECHARTS DOS ÚLTIMOS 30 DIAS */}
            <SubscriberGrowthChart
              onOpenSubscribersModal={() => {
                onClose();
                onOpenSubscribers();
              }}
            />

            {/* BOTÃO EM DESTAQUE: MEUS ASSINANTES & GERADOR DE TOKENS (SOLICITADO) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-emerald-500/10 border border-amber-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">Meus Assinantes & Tokens</h3>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase bg-[#00E676] text-black">
                        Tokens 5 Dígitos
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-0.5 max-w-md">
                      Veja todos os usuários do site, tipo de plano ativo, gere tokens de 5 caracteres alfanuméricos 100% válidos e consulte o histórico completo.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="admin-btn-open-subscribers"
                  onClick={() => {
                    onClose();
                    onOpenSubscribers();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 shrink-0 hover:scale-[1.02] active:scale-98"
                >
                  <Users className="w-4 h-4" />
                  <span>Ver Meus Assinantes</span>
                  <KeyRound className="w-3.5 h-3.5 opacity-70" />
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ATALHO PLANOS & MÉTODOS DE PAGAMENTO (MULTICAIXA & PAYPAY: 942472983) */}
            {onOpenPaymentPlans && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Planos de Assinatura & Pagamentos</h4>
                    <p className="text-[11px] text-zinc-400">
                      Multicaixa Express & PayPay: <span className="text-emerald-400 font-mono font-bold">{PAYMENT_CONFIG.phoneFormatted}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="admin-btn-open-plans"
                  onClick={() => {
                    onClose();
                    onOpenPaymentPlans();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 font-bold text-xs border border-zinc-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver Tabela de Preços</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: SESSÃO & MATRIZ DE PERMISSÕES */}
        {activeTab === 'session' && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            {/* CARD DE SESSÃO ATIVA & ALTERNADOR RÁPIDO */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Sessão Conectada
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {userProfile?.displayName || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-zinc-400">{user?.email}</div>
                </div>

                {/* TOGGLE INTERATIVO DE SESSÃO */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                  <button
                    type="button"
                    id="role-switch-user"
                    disabled={switching}
                    onClick={() => handleRoleToggle('user')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      role === 'user'
                        ? 'bg-[#00E676] text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Usuário Normal
                  </button>
                  <button
                    type="button"
                    id="role-switch-admin"
                    disabled={switching}
                    onClick={() => handleRoleToggle('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Administrador
                  </button>
                </div>
              </div>
            </div>

            {/* MATRIZ COMPARATIVA DE PERMISSÕES */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Matriz de Permissões das Sessões
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Bloco Usuário Normal */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Sessão: Usuário Normal</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-zinc-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Assistir transmissões HLS ao vivo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Alternar áudios e servidores espelho</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Favoritar e filtrar canais esportivos</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-500">
                      <XCircle className="w-3.5 h-3.5 text-red-500/80" />
                      <span>Adicionar ou remover canais da grade</span>
                    </li>
                  </ul>
                </div>

                {/* Bloco Administrador */}
                <div className="p-3.5 rounded-2xl bg-amber-950/15 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">Sessão: Administrador</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Todas as permissões do usuário comum</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cadastrar novos canais M3U8</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Excluir canais adicionados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acesso ao Painel Admin e diagnósticos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: GRADE DE CANAIS */}
        {activeTab === 'channels' && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-[#00E676]" />
                Grade de Canais ({todosCanais.length} ativos)
              </h3>
              {isAdmin && (
                <button
                  type="button"
                  id="admin-btn-add-channel"
                  onClick={() => {
                    onClose();
                    onOpenAddChannel();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Canal</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {customChannels.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-center text-xs text-zinc-500">
                  Nenhum canal customizado adicionado ainda. Os {todosCanais.length} canais padrão estão carregados.
                </div>
              ) : (
                customChannels.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white">{c.nome}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {c.categoria || 'Geral'}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onRemoveCustomChannel(c.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Excluir canal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STATUS DO AMBIENTE */}
        <div className="mt-5 pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Motor HLS e Firestore: Operacionais</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700/60 transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
}
