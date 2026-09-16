'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ShieldAlert, Sparkles, KeyRound, LogIn, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PLANS } from '@/services/subscriptionService';

export interface SubscriptionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans?: () => void;
  onOpenRedeem?: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenRedeemToken?: () => void;
  onOpenLogin?: () => void;
}

export const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({
  isOpen,
  onClose,
  onOpenPlans,
  onOpenRedeem,
  onOpenPaymentPlans,
  onOpenRedeemToken,
  onOpenLogin,
}) => {
  const { userProfile, deviceTrial } = useAuth();

  if (!isOpen) return null;

  const handleOpenPlans = onOpenPaymentPlans || onOpenPlans || (() => {});
  const handleOpenRedeem = onOpenRedeemToken || onOpenRedeem || (() => {});
  const handleOpenLogin = onOpenLogin || (() => {});

  const planInfo = userProfile?.plan ? PLANS[userProfile.plan] : null;

  return (
    <AnimatePresence>
      <div
        id="subscription-expired-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          id="subscription-expired-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-lg bg-[#0F1015] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/40 overflow-hidden text-center"
        >
          {/* Luz de fundo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Botão fechar */}
          <button
            type="button"
            id="close-expired-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
            title="Fechar aviso"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ícone de Alerta com Cronômetro */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-zinc-950 rounded-full border border-rose-500/40">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </span>
          </div>

          {/* Título e Relógio Zero */}
          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            Sua Assinatura Expirou!
          </h2>
          <p className="text-sm text-zinc-400 mb-5">
            O tempo de acesso contratado para a sua conta chegou ao fim.
          </p>

          {/* Mostrador Digital Zero */}
          <div className="bg-black/60 border border-rose-500/30 rounded-2xl p-4 mb-5 shadow-inner">
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">
              Tempo Restante
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-rose-500 tracking-wider">
              00:00:00
            </div>
            <div className="text-xs text-rose-400/80 mt-1 font-medium">
              Conta e transmissões temporariamente pausadas
            </div>
          </div>

          {/* Detalhe da Conta & Regra de 1 Acesso por Aparelho */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 text-left text-xs text-zinc-300 space-y-2 mb-6">
            <div className="flex justify-between items-center text-zinc-400 pb-2 border-b border-zinc-800">
              <span>Conta vinculada:</span>
              <span className="font-mono text-zinc-200 truncate max-w-[200px]">
                {userProfile?.email || 'Espectador'}
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Plano encerrado:</span>
              <span className="font-semibold text-white">
                {planInfo?.name || userProfile?.planName || 'Plano Gratuito (Teste 24h)'}
              </span>
            </div>
            {deviceTrial?.hasClaimed && (
              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-amber-300/90 leading-relaxed">
                <strong>Aviso anti-abuso:</strong> Cada aparelho físico tem direito a 1 único teste gratuito de 24 horas. Para continuar assistindo, escolha um de nossos planos ou ative um código.
              </div>
            )}
          </div>

          {/* Ações de Recuperação e Renovação */}
          <div className="space-y-2.5">
            <button
              type="button"
              id="expired-renew-plan-btn"
              onClick={() => {
                onClose();
                handleOpenPlans();
              }}
              className="w-full py-3.5 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ver Planos & Renovar (a partir de 1.500 Kz)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="expired-redeem-btn"
                onClick={() => {
                  onClose();
                  handleOpenRedeem();
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Ativar Código (5 Dígitos)</span>
              </button>

              <button
                type="button"
                id="expired-switch-account-btn"
                onClick={() => {
                  onClose();
                  handleOpenLogin();
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Entrar com Outra Conta</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
