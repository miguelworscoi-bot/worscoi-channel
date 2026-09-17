'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Sparkles,
  KeyRound,
  MessageCircle,
  X,
  Tv,
  CheckCircle2,
  Smartphone,
  Mail,
} from 'lucide-react';

export interface FreePlanBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenRedeemToken?: () => void;
  details?: {
    email?: string;
    deviceId?: string;
    message?: string;
    reason?: 'device_already_used' | 'email_already_used' | 'trial_expired';
  } | null;
}

export const FreePlanBlockedModal: React.FC<FreePlanBlockedModalProps> = ({
  isOpen,
  onClose,
  onOpenPaymentPlans,
  onOpenRedeemToken,
  details,
}) => {
  if (!isOpen) return null;

  const handleOpenPlans = () => {
    onClose();
    if (onOpenPaymentPlans) onOpenPaymentPlans();
  };

  const handleOpenRedeem = () => {
    onClose();
    if (onOpenRedeemToken) onOpenRedeemToken();
  };

  const maskedDeviceId = details?.deviceId
    ? details.deviceId.length > 16
      ? `${details.deviceId.slice(0, 8)}...${details.deviceId.slice(-6)}`
      : details.deviceId
    : 'Aparelho atual';

  const userEmail = details?.email || 'Espectador';

  return (
    <AnimatePresence>
      <div
        id="free-plan-blocked-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          id="free-plan-blocked-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-lg bg-[#0F1015] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/40 overflow-hidden text-center"
        >
          {/* Luz de Fundo Ambience */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Botão Fechar */}
          <button
            type="button"
            id="close-free-blocked-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ícone com Destaque Dourado/Âmbar */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-zinc-950 rounded-full border border-amber-500/40">
              <Tv className="w-4 h-4 text-amber-300" />
            </span>
          </div>

          {/* Título & Mensagem Amigável */}
          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Período Gratuito Já Utilizado
          </h2>
          <p className="text-sm text-zinc-300 mb-5 leading-relaxed">
            {details?.message ||
              'Identificamos que este aparelho ou e-mail já aproveitou o teste gratuito de 24 horas anteriormente. Para garantir transmissões fluidas e sem travamentos, cada dispositivo tem direito a 1 degustação.'}
          </p>

          {/* Cartão de Verificação Única de Hardware e E-mail */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 text-left text-xs space-y-2.5 mb-5 shadow-inner">
            <div className="flex items-center justify-between text-zinc-400 font-normal pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                Dispositivo Verificado:
              </span>
              <span className="font-normal text-zinc-200 text-[11px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {maskedDeviceId}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-400 font-normal pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                Conta / E-mail:
              </span>
              <span className="font-normal text-zinc-200 text-[11px] truncate max-w-[200px]">
                {userEmail}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-400 pt-0.5">
              <span className="font-medium">Status do Teste:</span>
              <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Concluído anteriormente
              </span>
            </div>
          </div>

          {/* Destaque de Planos Acessíveis */}
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-zinc-200 mb-5 text-left">
            <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assine a partir de apenas 1.500 Kz:</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-normal">
              Libere imediatamente todos os canais de Esportes (Libertadores, TNT Sports, Premier League), Desenhos, Filmes e Novelas em Full HD com transmissão estável.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2.5">
            <button
              type="button"
              id="upgrade-to-paid-plan-btn"
              onClick={handleOpenPlans}
              className="w-full py-3.5 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF2D55] via-rose-600 to-[#FF2D55] hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ver Planos & Assinar (a partir de 1.500 Kz)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="blocked-redeem-code-btn"
                onClick={handleOpenRedeem}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Ativar Código (5 Dígitos)</span>
              </button>

              <a
                href="https://wa.me/244942472983?text=Ol%C3%A1%21+Meu+teste+gratuito+terminou+e+gostaria+de+assinar+um+plano+PlaySports."
                target="_blank"
                rel="noreferrer"
                id="blocked-whatsapp-support-btn"
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 hover:border-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Suporte</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
