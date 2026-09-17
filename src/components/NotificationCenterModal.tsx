'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Gift,
  Info,
  Calendar,
  Clock,
  Trash2,
  CheckCheck,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType } from '@/types';
import { formatFriendlyDateTime } from '@/services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans: () => void;
  onOpenRedeemToken: () => void;
}

export function NotificationCenterModal({
  isOpen,
  onClose,
  onOpenPlans,
  onOpenRedeemToken,
}: NotificationCenterModalProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'activation':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'plan_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'plan_expired':
        return <Lock className="w-4 h-4 text-rose-400" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBadgeStyleForType = (type: NotificationType) => {
    switch (type) {
      case 'activation':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'plan_warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'plan_expired':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'bonus':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'activation':
        return 'Ativação do Plano';
      case 'plan_warning':
        return 'Alerta de Final do Plano';
      case 'plan_expired':
        return 'Fim do Plano';
      case 'bonus':
        return 'Bônus Especial';
      default:
        return 'Aviso do Sistema';
    }
  };

  return (
    <AnimatePresence>
      <div
        id="notification-center-backdrop"
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-end sm:justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
      >
        <div
          onClick={onClose}
          className="absolute inset-0"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-lg bg-[#0e0f14] border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        >
          {/* CABEÇALHO */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-200 shadow-sm">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#FF2D55] text-[9px] font-bold text-white ring-2 ring-[#0e0f14]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Central de Notificações</span>
                </h2>
                <p className="text-xs text-zinc-400 font-normal">
                  Ativações de planos, alertas de validade e mensagens de bônus
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 text-xs font-normal flex items-center gap-1 transition cursor-pointer"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Lidas</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAll()}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 text-xs font-normal transition cursor-pointer"
                  title="Limpar todas as notificações"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* FILTROS DE CATEGORIA */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-950/40 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-white text-zinc-950 font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('activation')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                activeFilter === 'activation'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Ativações
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('plan_warning')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                activeFilter === 'plan_warning'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Alertas
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('bonus')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                activeFilter === 'bonus'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Bônus
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('plan_expired')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                activeFilter === 'plan_expired'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Expirados
            </button>
          </div>

          {/* LISTA DE NOTIFICAÇÕES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-zinc-600" />
                </div>
                <p className="text-sm font-bold text-zinc-300">Nenhuma notificação encontrada</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs font-normal">
                  Suas mensagens de ativação de plano, avisos de vencimento e bônus recebidos aparecerão aqui.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isActivation = notif.type === 'activation';
                const isWarning = notif.type === 'plan_warning';
                const isExpired = notif.type === 'plan_expired';
                const isBonus = notif.type === 'bonus';

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                    }}
                    className={`relative group rounded-2xl p-4 transition-all duration-200 border select-none ${
                      notif.read
                        ? 'bg-zinc-900/35 border-zinc-800/60 hover:bg-zinc-900/50'
                        : 'bg-zinc-900/85 border-zinc-700/80 shadow-lg ring-1 ring-white/10'
                    }`}
                  >
                    {/* Topo do Card: Badge de Tipo e Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyleForType(
                            notif.type
                          )}`}
                        >
                          {getIconForType(notif.type)}
                          <span>{getTypeLabel(notif.type)}</span>
                        </span>

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-pulse" title="Não lida" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {formatFriendlyDateTime(notif.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded transition cursor-pointer"
                          title="Excluir notificação"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Título */}
                    <h3 className="text-sm font-bold text-white tracking-tight mb-1">
                      {notif.title}
                    </h3>

                    {/* Mensagem Principal */}
                    <p className="text-xs text-zinc-300 font-normal leading-relaxed mb-3">
                      {notif.message}
                    </p>

                    {/* DESTAQUE DE ATIVAÇÃO DO PLANO: DIA E HORA EXATOS DE ATIVAÇÃO */}
                    {isActivation && notif.activatedAt && (
                      <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-emerald-300">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            Dia e Hora da Ativação:
                          </span>
                          <span className="font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-emerald-500/30">
                            {formatFriendlyDateTime(notif.activatedAt)}
                          </span>
                        </div>

                        {notif.expiresAt && (
                          <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-emerald-500/20 font-normal">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              Acesso Válido Até:
                            </span>
                            <span className="text-zinc-200">
                              {formatFriendlyDateTime(notif.expiresAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DESTAQUE DE BÔNUS: CÓDIGO OU DIAS EXTRAS */}
                    {isBonus && (notif.bonusCode || notif.bonusDays) && (
                      <div className="mb-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between">
                        <div>
                          {notif.bonusDays && (
                            <span className="text-purple-300 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              +{notif.bonusDays} Dias de Acesso Liberado
                            </span>
                          )}
                          {notif.bonusCode && (
                            <span className="text-[11px] text-zinc-400 font-normal block mt-0.5">
                              Código Promocional: <span className="text-white font-bold">{notif.bonusCode}</span>
                            </span>
                          )}
                        </div>

                        {notif.bonusCode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(notif.bonusCode!);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-sm"
                          >
                            {copiedCode === notif.bonusCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-300" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* BOTÕES DE AÇÃO CONTEXTUAIS */}
                    <div className="flex items-center gap-2 pt-1">
                      {(isWarning || isExpired) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onOpenPlans();
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <span>Renovar Meu Plano</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(isBonus || isWarning) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onOpenRedeemToken();
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Resgatar Código</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RODAPÉ */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400 font-normal">
            <span>Worscoi Notificações</span>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition font-normal"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
