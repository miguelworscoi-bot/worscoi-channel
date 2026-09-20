'use client';
import React, { useState, useEffect } from 'react';
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
  Gauge,
  ShieldCheck,
  RefreshCw,
  BellRing,
  Send,
  Radio,
  Sparkles,
  History,
  Play,
  Zap,
} from 'lucide-react';
import { Canal, NotificationType, UserNotification } from '@/types';
import { useAuth, UserRole } from '@/context/AuthContext';
import { SubscriberGrowthChart } from '@/components/SubscriberGrowthChart';
import {
  createBroadcastNotification,
  fetchAllBroadcastNotifications,
  deleteNotification,
  formatFriendlyDateTime,
} from '@/services/notificationService';
import { useNotifications } from '@/context/NotificationContext';
import {
  LOGO_Z_SPORTS_LALIGA,
  LOGO_Z_SPORT_1,
  LOGO_Z_SPORT_2,
} from '@/utils/channelLogoUtils';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  todosCanais: Canal[];
  customChannels: Canal[];
  onOpenAddChannel: () => void;
  onRemoveCustomChannel: (channelId: string) => void;
  onOpenSubscribers: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenCreateNotification?: () => void;
  onPlayChannel?: (canal: Canal) => void;
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
  onOpenCreateNotification,
  onPlayChannel,
}: AdminPanelModalProps) {
  const { user, userProfile, role, isAdmin, switchRole } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [switching, setSwitching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'channels' | 'notifications' | 'limits' | 'session'>('analytics');

  // Estados rápidos de envio de notificação na aba
  const [quickNotifTitle, setQuickNotifTitle] = useState('');
  const [quickNotifMessage, setQuickNotifMessage] = useState('');
  const [quickNotifType, setQuickNotifType] = useState<NotificationType>('system');
  const [quickSending, setQuickSending] = useState(false);
  const [broadcastList, setBroadcastList] = useState<UserNotification[]>([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
  const [rateLimitData, setRateLimitData] = useState<{
    enabled: boolean;
    totalRequestsTracked: number;
    totalRequestsBlocked: number;
    activeBucketsCount: number;
    limits: Record<string, string>;
  } | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(false);

  const fetchRateLimits = async () => {
    try {
      setLoadingLimits(true);
      const res = await fetch('/api/ratelimit');
      if (res.ok) {
        const json = await res.json();
        if (json.rateLimiter) {
          setRateLimitData(json.rateLimiter);
        }
      }
    } catch {
      // Falha silenciosa em dev
    } finally {
      setLoadingLimits(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRateLimits();
    }
  }, [isOpen]);

  const handleToggleRateLimit = async (enabled: boolean) => {
    try {
      setLoadingLimits(true);
      const res = await fetch('/api/ratelimit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        const json = await res.json();
        setRateLimitData(json.metrics);
        setFeedback(enabled ? 'Limits of Requests ativado com sucesso!' : 'Limits of Requests pausado.');
      }
    } catch {
      setFeedback('Falha ao atualizar status do limitador.');
    } finally {
      setLoadingLimits(false);
    }
  };

  const loadBroadcasts = async () => {
    try {
      setLoadingBroadcasts(true);
      const list = await fetchAllBroadcastNotifications();
      setBroadcastList(list);
    } catch {
      // Ignora erro
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'notifications') {
      loadBroadcasts();
    }
  }, [isOpen, activeTab]);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNotifTitle.trim() || !quickNotifMessage.trim()) return;
    try {
      setQuickSending(true);
      await createBroadcastNotification({
        title: quickNotifTitle.trim(),
        message: quickNotifMessage.trim(),
        type: quickNotifType,
      });
      setFeedback('Notificação transmitida com sucesso para todos os usuários!');
      setQuickNotifTitle('');
      setQuickNotifMessage('');
      await loadBroadcasts();
      await refreshNotifications();
    } catch {
      setFeedback('Erro ao disparar notificação.');
    } finally {
      setQuickSending(false);
    }
  };

  const handleDeleteBroadcastItem = async (id: string) => {
    try {
      await deleteNotification(id, 'all');
      setBroadcastList((prev) => prev.filter((n) => n.id !== id));
      setFeedback('Notificação removida do feed global.');
      refreshNotifications();
    } catch {
      setFeedback('Falha ao remover notificação.');
    }
  };

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

          <div className="flex items-center gap-2">
            {onOpenCreateNotification && (
              <button
                type="button"
                id="admin-header-create-notif-btn"
                onClick={() => {
                  onClose();
                  onOpenCreateNotification();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-purple-950/40 shrink-0"
                title="Criar e transmitir notificação global para todos os usuários"
              >
                <BellRing className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Criar Notificação</span>
                <span className="sm:hidden">Notificar</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 group"
              title="Fechar"
            >
              <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* FEEDBACK DE AÇÃO */}
        {feedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* BARRA DE NAVEGAÇÃO ENTRE ABAS */}
        <div className="mt-3.5 flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shrink-0 overflow-x-auto">
          <button
            type="button"
            id="admin-tab-growth"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
            id="admin-tab-notifications"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-purple-600 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Notificações</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                activeTab === 'notifications' ? 'bg-black/30 text-white' : 'bg-purple-500/20 text-purple-300'
              }`}
            >
              Global
            </span>
          </button>

          <button
            type="button"
            id="admin-tab-channels"
            onClick={() => setActiveTab('channels')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
            id="admin-tab-limits"
            onClick={() => setActiveTab('limits')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'limits'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Limits</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                rateLimitData?.enabled !== false
                  ? 'bg-emerald-500/20 text-[#00E676]'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {rateLimitData?.enabled !== false ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            id="admin-tab-session"
            onClick={() => setActiveTab('session')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
                  id="admin-btn-open-create-notification"
                  onClick={() => {
                    if (onOpenCreateNotification) {
                      onClose();
                      onOpenCreateNotification();
                    } else {
                      setActiveTab('notifications');
                    }
                  }}
                  className="p-3 rounded-xl bg-purple-950/25 hover:bg-purple-900/35 border border-purple-500/40 hover:border-purple-400/70 flex items-center justify-between text-left transition-all duration-200 hover:scale-[1.01] active:scale-99 cursor-pointer group col-span-1 sm:col-span-2 shadow-lg shadow-purple-950/20"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
                      <BellRing className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          Criar Notificação Global
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-emerald-400 animate-ping" />
                          Todos os Usuários
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Dispare avisos ao vivo, alertas ou bônus que todos os espectadores recebem na tela instantaneamente
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                    <span className="text-[11px] font-bold mr-1 hidden sm:inline">Criar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

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

          {/* ABA NOTIFICAÇÕES GLOBAIS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* BANNER DE TRANSMISSÃO */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                    <BellRing className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Transmissão Global de Notificações</h3>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-emerald-400 animate-ping" />
                        100% dos Usuários
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Qualquer notificação criada aqui chega instantaneamente na tela de todos os usuários em tempo real.
                    </p>
                  </div>
                </div>

                {onOpenCreateNotification && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateNotification();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition shrink-0 cursor-pointer shadow-md shadow-purple-950/40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Abrir Criador Completo</span>
                  </button>
                )}
              </div>

              {/* FORMULÁRIO RÁPIDO DE DISPARO */}
              <form onSubmit={handleQuickSend} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-purple-400" />
                    Disparo Rápido para Todos os Usuários
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(['system', 'bonus', 'activation', 'plan_warning'] as NotificationType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setQuickNotifType(t)}
                        className={`text-[10px] px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                          quickNotifType === t
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {t === 'system' ? 'Geral' : t === 'bonus' ? 'Bônus' : t === 'activation' ? 'Novidade' : 'Alerta'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={quickNotifTitle}
                    onChange={(e) => setQuickNotifTitle(e.target.value)}
                    placeholder="Título (ex: Grande Jogo Ao Vivo Agora! ⚽)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <textarea
                    value={quickNotifMessage}
                    onChange={(e) => setQuickNotifMessage(e.target.value)}
                    placeholder="Mensagem (ex: A transmissão começou! Acesse agora para assistir em alta definição sem travar)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-500">
                    O popup aparecerá imediatamente na tela de todos os espectadores.
                  </span>
                  <button
                    type="submit"
                    disabled={quickSending || !quickNotifTitle.trim() || !quickNotifMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{quickSending ? 'Transmitindo...' : 'Disparar Agora'}</span>
                  </button>
                </div>
              </form>

              {/* HISTÓRICO DE TRANSMISSÕES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Últimas Transmissões Globais ({broadcastList.length})
                  </span>
                  <button
                    type="button"
                    onClick={loadBroadcasts}
                    className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    Atualizar
                  </button>
                </div>

                {loadingBroadcasts ? (
                  <div className="p-4 text-center text-xs text-zinc-500">Carregando...</div>
                ) : broadcastList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center text-xs text-zinc-500">
                    Nenhuma notificação global transmitida recentemente.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {broadcastList.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70 text-xs flex items-center justify-between gap-3 hover:border-zinc-700 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{item.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-purple-500/20 text-purple-300">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.message}</p>
                          <span className="text-[10px] text-zinc-500 mt-1 block">
                            {formatFriendlyDateTime(item.createdAt)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBroadcastItem(item.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                          title="Excluir notificação do feed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 2: CANAIS */}
          {activeTab === 'channels' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* DESTAQUE CANAIS Z SPORTS */}
              <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-bold text-white">Canais Z Sports Ativos</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                    1080p FHD
                  </span>
                </div>

                <div className="space-y-1.5">
                  {[
                    {
                      id: 'z-sports-laliga-hd',
                      nome: 'Z Sports LaLiga HD',
                      desc: 'LaLiga EA Sports, Real Madrid e Barcelona',
                      logo: LOGO_Z_SPORTS_LALIGA,
                      url: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
                    },
                    {
                      id: 'z-sport-1-hd',
                      nome: 'Z Sport 1 HD',
                      desc: 'Champions League, Girabola ZAP e Premier League',
                      logo: LOGO_Z_SPORT_1,
                      url: 'https://d9ssxzmclhfo4.cloudfront.net/bein_sports.m3u8',
                    },
                    {
                      id: 'z-sport-2-hd',
                      nome: 'Z Sport 2 HD',
                      desc: 'Serie A Italiana, NBA, Unitel Basket e UFC',
                      logo: LOGO_Z_SPORT_2,
                      url: 'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
                    },
                  ].map((zCh) => (
                    <div
                      key={zCh.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs hover:border-orange-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={zCh.logo}
                          alt={zCh.nome}
                          className="w-7 h-7 rounded bg-zinc-950 object-contain p-0.5 border border-zinc-700/60 shrink-0"
                        />
                        <div className="min-w-0 truncate">
                          <p className="font-bold text-white text-[11px] truncate">{zCh.nome}</p>
                          <p className="text-[9.5px] text-zinc-400 truncate">{zCh.desc}</p>
                        </div>
                      </div>

                      {onPlayChannel && (
                        <button
                          type="button"
                          onClick={() => {
                            const found = todosCanais.find((c) => c.id === zCh.id) || {
                              id: zCh.id,
                              nome: zCh.nome,
                              categoria: 'Esportes',
                              url: zCh.url,
                              logo: zCh.logo,
                              pais: 'AO',
                              rede: 'ZAP',
                              grupo: 'ZAP Angola',
                            };
                            onClose();
                            onPlayChannel(found as Canal);
                          }}
                          className="px-2 py-1 rounded bg-orange-500 hover:bg-orange-400 text-black font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <Play className="w-2.5 h-2.5 fill-black" />
                          <span>Assistir</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
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

          {/* ABA 4: LIMITS OF REQUESTS (CONTROLE DE TAXA & ANTI-ABUSO) */}
          {activeTab === 'limits' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* CARD PRINCIPAL COM STATUS E TOGGLE */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#00E676] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Limits of Requests Engine</h3>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          rateLimitData?.enabled !== false
                            ? 'bg-emerald-500/20 text-[#00E676] border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {rateLimitData?.enabled !== false ? 'Ativado (Proteção Ligada)' : 'Desativado'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Controle dinâmico de taxa por IP contra DDoS, saturação de banda e raspagem de dados.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={loadingLimits}
                    onClick={fetchRateLimits}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Atualizar métricas"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingLimits ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>

                  <button
                    type="button"
                    disabled={loadingLimits}
                    onClick={() => handleToggleRateLimit(rateLimitData?.enabled === false)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rateLimitData?.enabled !== false
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                        : 'bg-emerald-500 text-black font-extrabold border-emerald-400 hover:bg-emerald-400'
                    }`}
                  >
                    {rateLimitData?.enabled !== false ? 'Pausar Limites' : 'Ativar Limits of Requests'}
                  </button>
                </div>
              </div>

              {/* CARDS DE MÉTRICAS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-medium">Requisições Monitoradas</div>
                  <div className="text-lg font-black text-white mt-1">
                    {rateLimitData?.totalRequestsTracked ?? 0}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Analisadas em tempo real</div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-medium">Requisições Bloqueadas</div>
                  <div className="text-lg font-black text-amber-400 mt-1">
                    {rateLimitData?.totalRequestsBlocked ?? 0}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Respostas HTTP 429</div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-medium">Clientes Simultâneos</div>
                  <div className="text-lg font-black text-cyan-400 mt-1">
                    {rateLimitData?.activeBucketsCount ?? 0}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">IPs na janela de 60s</div>
                </div>
              </div>

              {/* TABELA DE LIMITES ATIVOS */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
                <div className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#00E676]" />
                  <span>Limites Configurados Por Rota (Sliding Window 60s)</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">/api/proxy (Stream HLS & Chunks)</div>
                      <div className="text-[11px] text-zinc-400">Entrega de segmentos de vídeo ao vivo sem travamentos</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-[#00E676] font-mono font-bold text-[11px] border border-emerald-500/30">
                      240 req / 60s
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">/api/filmes (Catálogo & IMDb)</div>
                      <div className="text-[11px] text-zinc-400">Buscas de filmes, séries e metadados OMDb</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-[#00E676] font-mono font-bold text-[11px] border border-emerald-500/30">
                      120 req / 60s
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">/api/canais (Grade de IPTV)</div>
                      <div className="text-[11px] text-zinc-400">Listagem de canais categorizados por país e rede</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-[#00E676] font-mono font-bold text-[11px] border border-emerald-500/30">
                      90 req / 60s
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">/api/epg & /api/jogos (Guia e Agenda)</div>
                      <div className="text-[11px] text-zinc-400">Atualização em tempo real das partidas e grade</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-[#00E676] font-mono font-bold text-[11px] border border-emerald-500/30">
                      60 req / 60s
                    </span>
                  </div>
                </div>
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

