'use client';
import React, { useState, useEffect } from 'react';
import {
  BellRing,
  X,
  Send,
  Sparkles,
  Gift,
  Tv,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Eye,
  ArrowRight,
  Radio,
  Clock,
  History,
} from 'lucide-react';
import { NotificationType, UserNotification } from '@/types';
import {
  createBroadcastNotification,
  fetchAllBroadcastNotifications,
  deleteNotification,
  formatFriendlyDateTime,
} from '@/services/notificationService';
import { useNotifications } from '@/context/NotificationContext';

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans?: () => void;
}

interface TemplatePreset {
  title: string;
  message: string;
  type: NotificationType;
  actionLabel?: string;
  actionUrl?: string;
  bonusDays?: number;
  bonusCode?: string;
}

const TEMPLATES: { label: string; icon: string; data: TemplatePreset }[] = [
  {
    label: 'Jogo Ao Vivo ⚽',
    icon: '⚽',
    data: {
      type: 'system',
      title: 'Grande Jogo Ao Vivo Agora! ⚽🔥',
      message: 'A transmissão já começou! Acompanhe o grande clássico com sinal estabilizado em alta definição e sem delay.',
      actionLabel: 'Assistir Agora',
      actionUrl: '#player',
    },
  },
  {
    label: 'Novo Canal 📺',
    icon: '📺',
    data: {
      type: 'activation',
      title: 'Novo Canal Adicionado à Grade! 📺✨',
      message: 'Acabamos de adicionar uma nova opção de entretenimento à nossa programação esportiva. Venha conferir!',
      actionLabel: 'Ver Canais',
      actionUrl: '#canais',
    },
  },
  {
    label: 'Bônus Especial 🎁',
    icon: '🎁',
    data: {
      type: 'bonus',
      title: 'Você Ganhou Acesso Bônus! 🎁⚡',
      message: 'Liberamos dias extras de acesso ao vivo e transmissões completas para todos os nossos espectadores.',
      actionLabel: 'Resgatar Bônus',
      bonusDays: 3,
      bonusCode: 'WORSCOIBONUS',
    },
  },
  {
    label: 'Manutenção / Sinal ⚡',
    icon: '⚡',
    data: {
      type: 'system',
      title: 'Estabilidade do Sinal Aprimorada 🚀',
      message: 'Nossos servidores de streaming foram otimizados com tecnologia de latência ultra-baixa para melhor experiência.',
      actionLabel: 'Continuar Assistindo',
    },
  },
];

export function CreateNotificationModal({
  isOpen,
  onClose,
}: CreateNotificationModalProps) {
  const { refreshNotifications } = useNotifications();

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [bonusDays, setBonusDays] = useState<number | undefined>(undefined);
  const [bonusCode, setBonusCode] = useState('');

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<UserNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [showPreview, setShowPreview] = useState(true);

  // Carrega histórico de notificações já transmitidas
  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const list = await fetchAllBroadcastNotifications();
      setHistory(list);
    } catch {
      // Ignora erro
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: TemplatePreset) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
    setActionLabel(tpl.actionLabel || '');
    setActionUrl(tpl.actionUrl || '');
    setBonusDays(tpl.bonusDays);
    setBonusCode(tpl.bonusCode || '');
    setFeedback({
      type: 'success',
      text: 'Modelo aplicado com sucesso! Você pode editar antes de disparar.',
    });
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Por favor, preencha o título e a mensagem da notificação.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await createBroadcastNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        actionLabel: actionLabel.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        bonusDays: type === 'bonus' && bonusDays ? Number(bonusDays) : undefined,
        bonusCode: type === 'bonus' && bonusCode.trim() ? bonusCode.trim().toUpperCase() : undefined,
      });

      setFeedback({
        type: 'success',
        text: 'Notificação disparada com sucesso! Todos os usuários da plataforma receberam o alerta.',
      });

      // Limpa os campos após envio
      setTitle('');
      setMessage('');
      setActionLabel('');
      setActionUrl('');
      setBonusDays(undefined);
      setBonusCode('');

      // Atualiza lista e notificações locais
      await loadHistory();
      await refreshNotifications();
    } catch (err) {
      console.error('Erro ao disparar notificação:', err);
      setFeedback({
        type: 'error',
        text: 'Erro ao disparar notificação. Verifique a conexão com a base.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (notifId: string) => {
    try {
      await deleteNotification(notifId, 'all');
      setHistory((prev) => prev.filter((n) => n.id !== notifId));
      setFeedback({
        type: 'success',
        text: 'Notificação removida do histórico de transmissão.',
      });
      refreshNotifications();
    } catch {
      setFeedback({
        type: 'error',
        text: 'Falha ao remover a notificação.',
      });
    }
  };

  const getTypeColor = (t: NotificationType) => {
    switch (t) {
      case 'bonus':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'plan_warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'activation':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getTypeIcon = (t: NotificationType) => {
    switch (t) {
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-400" />;
      case 'plan_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'activation':
        return <Tv className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div
      id="create-notification-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="create-notification-modal"
        className="relative w-full max-w-3xl bg-[#0d0f14] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/90 ring-1 ring-white/5 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-950/20">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Criar Notificação Global
                </h2>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 animate-ping text-emerald-400" />
                  Todos os Usuários
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ao disparar, todos os espectadores conectados recebem o alerta na tela em tempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-create-notification-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FEEDBACK STATUS */}
        {feedback && (
          <div
            className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center gap-2 shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* ABAS DO MODAL: CRIAR NOTIFICAÇÃO vs HISTÓRICO */}
        <div className="mt-3.5 flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nova Notificação</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico de Envios</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'history' ? 'bg-black/30 text-white font-bold' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {history.length}
            </span>
          </button>
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="flex-1 overflow-y-auto mt-3.5 pr-1 space-y-4">
          {activeTab === 'create' ? (
            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* MODELOS RÁPIDOS DE 1 CLIQUE */}
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Modelos Rápidos de Transmissão
                  </span>
                  <span className="text-[10px] text-zinc-500">Clique para preencher</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl.data)}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-purple-500/50 text-left transition-all hover:scale-[1.02] active:scale-98 cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 flex items-center gap-1.5">
                        <span>{tpl.icon}</span>
                        <span className="truncate">{tpl.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TIPO DE NOTIFICAÇÃO */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Tipo da Notificação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'system', label: 'Geral / Sistema', icon: Info, color: 'text-blue-400' },
                    { id: 'bonus', label: 'Bônus / Presente', icon: Gift, color: 'text-purple-400' },
                    { id: 'activation', label: 'Novidade / Canal', icon: Tv, color: 'text-emerald-400' },
                    { id: 'plan_warning', label: 'Aviso Importante', icon: AlertTriangle, color: 'text-amber-400' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = type === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id as NotificationType)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800/90 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/50'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TÍTULO */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Título da Notificação *
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    {title.length}/60 caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="notification-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                  placeholder="Ex: Grande Clássico Ao Vivo Agora! ⚽"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  required
                />
              </div>

              {/* MENSAGEM */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Mensagem para Todos os Usuários *
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    {message.length}/200 caracteres
                  </span>
                </div>
                <textarea
                  id="notification-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  placeholder="Escreva a mensagem clara e atrativa que aparecerá na tela de todos os espectadores..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                  required
                />
              </div>

              {/* CAMPOS ESPECÍFICOS DE BÔNUS (SE SELECIONADO) */}
              {type === 'bonus' && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span>Configuração do Bônus para Todos</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Dias Extras de Bônus (opcional)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={bonusDays || ''}
                        onChange={(e) =>
                          setBonusDays(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="Ex: 3"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Código / Cupom Promocional (opcional)
                      </label>
                      <input
                        type="text"
                        value={bonusCode}
                        onChange={(e) => setBonusCode(e.target.value.toUpperCase())}
                        placeholder="Ex: FIMDESEMANA"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white uppercase focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BOTÃO DE AÇÃO OPCIONAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                    Texto do Botão de Ação (opcional)
                  </label>
                  <input
                    type="text"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="Ex: Assistir Agora, Ver Planos"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                    Link de Destino (opcional)
                  </label>
                  <input
                    type="text"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="Ex: #player, #canais ou link externo"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* PRÉ-VISUALIZAÇÃO AO VIVO (LIVE PREVIEW) */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    Como os usuários verão (Pré-visualização)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[11px] text-zinc-500 hover:text-white cursor-pointer"
                  >
                    {showPreview ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                {showPreview && (
                  <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-purple-500/30 shadow-lg flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center shrink-0">
                      {getTypeIcon(type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
                        {title || 'Título da Notificação'}
                      </h4>
                      <p className="text-[11px] text-zinc-300 font-normal leading-relaxed mt-1 line-clamp-2">
                        {message || 'A mensagem que você escrever aparecerá instantaneamente como um card elegante na tela de todos os usuários.'}
                      </p>

                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <span>{actionLabel || 'Ver Notificação'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                        {bonusCode && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
                            CUPOM: {bonusCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÃO DE DISPARO */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Transmissão em massa ativada</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    id="submit-broadcast-notification-btn"
                    disabled={submitting || !title.trim() || !message.trim()}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-950/50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Disparando...' : 'Disparar para Todos os Usuários'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ABA HISTÓRICO DE ENVIOS */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">
                  Notificações Globais Enviadas ({history.length})
                </span>
                <button
                  type="button"
                  onClick={loadHistory}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3 h-3" />
                  <span>Atualizar</span>
                </button>
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Carregando histórico de transmissões...
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center text-xs text-zinc-400">
                  Nenhuma notificação global transmitida ainda. Use a aba &ldquo;Nova Notificação&rdquo; para disparar a primeira mensagem a todos os usuários.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center shrink-0 mt-0.5">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">
                              {item.title}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.2 rounded-full font-bold border uppercase ${getTypeColor(
                                item.type
                              )}`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            {item.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                            <span>{formatFriendlyDateTime(item.createdAt)}</span>
                            {item.actionLabel && (
                              <span className="text-zinc-400">• Botão: &ldquo;{item.actionLabel}&rdquo;</span>
                            )}
                            {item.bonusCode && (
                              <span className="text-purple-400 font-mono font-bold">
                                • Cupom: {item.bonusCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBroadcast(item.id)}
                        className="p-1.5 rounded-lg bg-zinc-850 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition cursor-pointer shrink-0"
                        title="Excluir notificação do feed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
