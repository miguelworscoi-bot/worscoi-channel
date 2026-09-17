'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType } from '@/types';

interface NotificationToastProps {
  onOpenNotifications: () => void;
  onOpenPlans: () => void;
}

export function NotificationToast({
  onOpenNotifications,
  onOpenPlans,
}: NotificationToastProps) {
  const { activeToast, dismissToast } = useNotifications();

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'activation':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'plan_warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'plan_expired':
        return <Lock className="w-5 h-5 text-rose-400" />;
      case 'bonus':
        return <Gift className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'activation':
        return 'border-emerald-500/40 shadow-emerald-950/30';
      case 'plan_warning':
        return 'border-amber-500/40 shadow-amber-950/30';
      case 'plan_expired':
        return 'border-rose-500/40 shadow-rose-950/30';
      case 'bonus':
        return 'border-purple-500/40 shadow-purple-950/30';
      default:
        return 'border-zinc-700/60 shadow-black/40';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.92 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-[#0d0e12]/95 backdrop-blur-md border rounded-2xl p-4 shadow-2xl ${getBorderColor(
          activeToast.type
        )} text-white`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center shrink-0">
            {getIconForType(activeToast.type)}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
              {activeToast.title}
            </h4>
            <p className="text-[11px] text-zinc-300 font-normal leading-relaxed mt-1 line-clamp-2">
              {activeToast.message}
            </p>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => {
                  dismissToast();
                  onOpenNotifications();
                }}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Ver Notificação</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {(activeToast.type === 'plan_warning' || activeToast.type === 'plan_expired') && (
                <button
                  type="button"
                  onClick={() => {
                    dismissToast();
                    onOpenPlans();
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer ml-auto"
                >
                  Planos
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="p-1 text-zinc-500 hover:text-white rounded-lg transition shrink-0 cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
