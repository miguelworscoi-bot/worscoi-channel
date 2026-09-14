'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, Tv, X, PartyPopper } from 'lucide-react';

export interface CongratulationsNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  userName?: string;
  message?: string;
  planName?: string;
  autoCloseSeconds?: number;
}

export function CongratulationsNotification({
  isOpen,
  onClose,
  title = 'Parabéns!',
  userName,
  message,
  planName = 'Plano Gratuito de 1 Dia (24 Horas)',
  autoCloseSeconds = 8,
}: CongratulationsNotificationProps) {
  useEffect(() => {
    if (!isOpen || !autoCloseSeconds) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseSeconds * 1000);
    return () => clearTimeout(timer);
  }, [isOpen, autoCloseSeconds, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="congratulations-notification-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#0A0A0E] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 overflow-hidden text-center"
        >
          {/* Luz de fundo esmeralda / festa */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 right-0 w-48 h-48 bg-[#FF2D55]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Botão fechar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Ícone de Sucesso Animado */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 mb-5 flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0A0E] rounded-[14px] flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>
          </div>

          {/* Título */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {title} {userName ? `${userName}!` : ''}
            </h2>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>

          {/* Selo do Plano Ativado */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mt-2 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{planName} ativado</span>
          </div>

          {/* Mensagem descritiva */}
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {message || (
              <>
                Sua conta foi criada e o seu acesso já está liberado. Aproveite todas as transmissões esportivas ao vivo, canais e filmes em alta definição sem interrupções!
              </>
            )}
          </p>

          {/* Botão de Ação: Começar a Assistir */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm sm:text-base transition shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Tv className="w-4 h-4" />
            <span>Começar a Assistir Agora</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
