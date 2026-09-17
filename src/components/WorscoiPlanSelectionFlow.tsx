'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  MessageCircle,
  Loader2,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { WorscoiCardVisual, PLAN_CARD_THEMES } from './WorscoiCardVisual';
import { POSTerminalIllustration } from './POSTerminalIllustration';
import { SubscriptionPlanId } from '@/types';
import {
  createWhatsAppPaymentProofLink,
  redeemAccessToken,
  PLANS,
} from '@/services/subscriptionService';

export interface PlanItemOption {
  id: SubscriptionPlanId;
  name: string;
  priceFormatted: string;
  priceNumber: number;
  durationFormatted: string;
  channelCountLabel?: string;
  channelsOffered?: string[];
  isFree?: boolean;
}

const FLOW_PLANS: PlanItemOption[] = [
  {
    id: 'free',
    name: 'Plano Grátis Degustação (24h)',
    priceFormatted: 'Grátis / 24 horas',
    priceNumber: 0,
    durationFormatted: '1 Dia (24h)',
    channelCountLabel: PLANS.free.channelCountLabel,
    channelsOffered: PLANS.free.channelsOffered,
    isFree: true,
  },
  {
    id: 'diario',
    name: 'Passe Fim de Semana (3 Dias)',
    priceFormatted: '1.500 Kz / 3 dias',
    priceNumber: 1500,
    durationFormatted: '3 Dias',
    channelCountLabel: PLANS.diario.channelCountLabel,
    channelsOffered: PLANS.diario.channelsOffered,
  },
  {
    id: 'basico',
    name: 'Básico Esportes & Entretenimento (30 Dias)',
    priceFormatted: '2.500 Kz / 30 dias',
    priceNumber: 2500,
    durationFormatted: '30 Dias',
    channelCountLabel: PLANS.basico.channelCountLabel,
    channelsOffered: PLANS.basico.channelsOffered,
  },
  {
    id: 'vip',
    name: 'VIP Esportes, ZAP & Filmes HD (30 Dias)',
    priceFormatted: '4.000 Kz / 30 dias',
    priceNumber: 4000,
    durationFormatted: '30 Dias',
    channelCountLabel: PLANS.vip.channelCountLabel,
    channelsOffered: PLANS.vip.channelsOffered,
  },
  {
    id: 'premium',
    name: 'Premium Ultra 4K (90 Dias)',
    priceFormatted: '9.500 Kz / 90 dias',
    priceNumber: 9500,
    durationFormatted: '90 Dias',
    channelCountLabel: PLANS.premium.channelCountLabel,
    channelsOffered: PLANS.premium.channelsOffered,
  },
  {
    id: 'anual',
    name: 'Passe Anual Campeão 365 (1 Ano)',
    priceFormatted: '30.000 Kz / 365 dias',
    priceNumber: 30000,
    durationFormatted: '365 Dias',
    channelCountLabel: PLANS.anual.channelCountLabel,
    channelsOffered: PLANS.anual.channelsOffered,
  },
];

export interface WorscoiPlanSelectionFlowProps {
  onClose: () => void;
  onBackToPreviousStep?: () => void; // Para voltar à etapa de cadastro anterior
  mode?: 'register' | 'upgrade';
  userData?: {
    name?: string;
    email?: string;
    uid?: string;
    plan?: SubscriptionPlanId;
    planExpiresAt?: string | null;
    planName?: string;
  };
  onSelectFreePlan: () => Promise<void> | void;
  onTokenValidated: (params: {
    plan: SubscriptionPlanId;
    planName: string;
    token: string;
    expiresAt: string | null;
    accumulated?: boolean;
    addedDays?: number;
    remainingDaysTotal?: number;
  }) => Promise<void> | void;
}

export function WorscoiPlanSelectionFlow({
  onClose,
  onBackToPreviousStep,
  mode: _mode = 'register',
  userData,
  onSelectFreePlan,
  onTokenValidated,
}: WorscoiPlanSelectionFlowProps) {
  // Telas do fluxo: 'plans' (Imagem 7) -> 'summary' (Imagem 8) -> 'payment' (Imagem 9) -> 'validate-token' (Imagem 10)
  const [currentScreen, setCurrentScreen] = useState<
    'plans' | 'summary' | 'payment' | 'validate-token'
  >('plans');

  // Índice do carrossel de planos (default no Passe Fim de Semana - 3 Dias, correspondendo à imagem do usuário)
  const [currentPlanIndex, setCurrentPlanIndex] = useState<number>(1);
  const selectedPlan = FLOW_PLANS[currentPlanIndex] || FLOW_PLANS[1];

  // Estado para inserção do token
  const [tokenInput, setTokenInput] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Estado para copiar telefone de pagamento
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isProcessingFree, setIsProcessingFree] = useState(false);
  const [isChoosingPlan, setIsChoosingPlan] = useState(false);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  const handlePrevPlan = () => {
    setCurrentPlanIndex((prev) => (prev > 0 ? prev - 1 : FLOW_PLANS.length - 1));
  };

  const handleNextPlan = () => {
    setCurrentPlanIndex((prev) => (prev < FLOW_PLANS.length - 1 ? prev + 1 : 0));
  };

  const handleSelectPlanByIndex = (idx: number) => {
    if (idx === currentPlanIndex) return;
    setCurrentPlanIndex(idx);
  };

  // Suporte a teclas de seta esquerda/direita no teclado
  useEffect(() => {
    if (currentScreen !== 'plans') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPlan();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPlan();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen]);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('942472983');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Ao clicar em "Escolher" na Imagem 7 com transição fluida
  const handleSelectPlan = async () => {
    if (selectedPlan.isFree) {
      // Caso plano grátis: entra directo no sistema com notificação de parabéns
      setIsProcessingFree(true);
      try {
        await onSelectFreePlan();
      } finally {
        setIsProcessingFree(false);
      }
    } else {
      // Transição cinematográfica e responsiva para a tela de resumo (Imagem 8)
      setSlideDirection(1);
      setIsChoosingPlan(true);
      setTimeout(() => {
        setCurrentScreen('summary');
        setIsChoosingPlan(false);
      }, 70);
    }
  };

  // Ao validar o token na Imagem 10
  const handleValidateTokenSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = tokenInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleanToken.length !== 5) {
      setTokenError('A chave token deve ter exatamente 5 caracteres.');
      return;
    }

    setIsValidatingToken(true);
    setTokenError(null);

    try {
      const currentUserData = {
        uid: userData?.uid || 'usr_' + Date.now(),
        email: userData?.email || 'usuario@worscoi.tv',
        displayName: userData?.name || 'Assinante Worscoi',
        currentPlan: userData?.plan,
        currentPlanExpiresAt: userData?.planExpiresAt,
        currentPlanName: userData?.planName,
      };

      const result = await redeemAccessToken(cleanToken, currentUserData);

      if (result.success && result.plan) {
        await onTokenValidated({
          plan: result.plan,
          planName: result.planName || result.plan,
          token: cleanToken,
          expiresAt: result.expiresAt ?? null,
          accumulated: result.accumulated,
          addedDays: result.addedDays,
          remainingDaysTotal: result.remainingDaysTotal,
        });
      } else {
        setTokenError(
          result.message || 'Chave token inválida ou já utilizada. Por favor, verifique o código recebido no WhatsApp.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao validar a chave token. Tente novamente.';
      setTokenError(msg);
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Link para WhatsApp com comprovativo pré-preenchido
  const whatsAppLink = createWhatsAppPaymentProofLink({
    planName: selectedPlan.name,
    priceFormatted: selectedPlan.priceFormatted,
    userName: userData?.name,
    contact: userData?.email,
    paymentMethod: 'Multicaixa Express / PayPay (942472983)',
  });

  return (
    <div
      id="worscoi-plans-flow-container"
      className="w-full h-full flex flex-col text-white font-sans select-none"
    >
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TELA 1 (IMAGEM 7): ESCOLHA O SEU PLANO (CARROSSEL)                        */}
        {/* ========================================================================= */}
        {currentScreen === 'plans' && (
          <motion.div
            key="screen-plans"
            initial={{ opacity: 0, x: slideDirection > 0 ? -24 : 24, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -32 : 32, scale: 0.98, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col h-full min-h-[520px] justify-between p-4 sm:p-6"
          >
            {/* TOPO: BOTÃO VOLTAR + TÍTULO */}
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBackToPreviousStep || onClose}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition cursor-pointer"
                  title="Voltar"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Escolha o seu Plano
                </h1>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CABEÇALHO DO PLANO ATIVO (TÍTULO, PREÇO E ETIQUETA COM TRANSIÇÃO SUAVE) */}
            <div className="text-center min-h-[68px] flex flex-col items-center justify-center mb-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPlan.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16 }}
                  className="flex flex-col items-center"
                >
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {selectedPlan.name}
                  </h2>
                  <p className="text-sm font-normal text-zinc-400 mt-0.5">
                    {selectedPlan.priceFormatted}
                  </p>
                  {selectedPlan.channelCountLabel && (
                    <span
                      className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                        PLAN_CARD_THEMES[selectedPlan.id]?.accentBg || 'bg-[#00E676]/15'
                      } ${
                        PLAN_CARD_THEMES[selectedPlan.id]?.accentText || 'text-[#00E676]'
                      } ${
                        PLAN_CARD_THEMES[selectedPlan.id]?.accentBorder || 'border-[#00E676]/30'
                      }`}
                    >
                      {selectedPlan.channelCountLabel}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* PALCO DO CARROSSEL 3D DE CARDS COM VISÃO MULTI-CARD E DRAG FLUIDO */}
            <div
              className="relative w-full h-[350px] sm:h-[375px] flex items-center justify-center overflow-hidden my-auto select-none [perspective:1200px]"
            >
              {FLOW_PLANS.map((plan, idx) => {
                const distance = idx - currentPlanIndex;
                const isCenter = distance === 0;
                const isVisible = Math.abs(distance) <= 2;

                if (!isVisible) return null;

                const xOffset =
                  distance === 0
                    ? 0
                    : distance < 0
                      ? distance === -1
                        ? -145
                        : -260
                      : distance === 1
                        ? 145
                        : 260;

                const rotateYVal =
                  distance === 0 ? 0 : distance < 0 ? 22 : -22;

                const scaleVal =
                  distance === 0
                    ? 1
                    : distance === -1 || distance === 1
                      ? 0.84
                      : 0.7;

                const opacityVal =
                  distance === 0
                    ? 1
                    : distance === -1 || distance === 1
                      ? 0.45
                      : 0.15;

                const zIndexVal = 30 - Math.abs(distance) * 10;

                return (
                  <motion.div
                    key={plan.id}
                    onClick={() => {
                      if (!isCenter) {
                        handleSelectPlanByIndex(idx);
                      } else {
                        handleSelectPlan();
                      }
                    }}
                    initial={false}
                    animate={{
                      x: xOffset,
                      scale: scaleVal,
                      rotateY: rotateYVal,
                      opacity: opacityVal,
                      zIndex: zIndexVal,
                      filter: isCenter ? 'blur(0px)' : 'blur(0.8px)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 340,
                      damping: 29,
                      mass: 0.8,
                    }}
                    drag={isCenter ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={(_e, info) => {
                      if (info.offset.x < -35 || info.velocity.x < -280) {
                        handleNextPlan();
                      } else if (info.offset.x > 35 || info.velocity.x > 280) {
                        handlePrevPlan();
                      }
                    }}
                    className={`absolute flex flex-col items-center justify-center touch-pan-y ${
                      isCenter
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-pointer hover:opacity-75 transition-opacity'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <WorscoiCardVisual
                      variant="vertical"
                      planId={plan.id}
                      className={isCenter ? 'shadow-2xl ring-2 ring-white/20' : 'shadow-lg'}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* PRÉVIA DOS CANAIS DO PLANO SELECIONADO */}
            <div className="w-full max-w-sm mx-auto mt-2 px-3 py-1.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-center">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                Canais Liberados neste Plano
              </p>
              <p className="text-xs text-zinc-200 line-clamp-1 leading-normal">
                {selectedPlan.channelsOffered && selectedPlan.channelsOffered.length > 0
                  ? selectedPlan.channelsOffered.slice(0, 5).join(' • ') +
                    (selectedPlan.channelsOffered.length > 5 ? ' e mais...' : '')
                  : 'Acesso total a todos os canais ao vivo'}
              </p>
            </div>

            {/* BASE: NAVEGAÇÃO DO CARROSSEL (< > + BOLINHAS DE CORES) + BOTÃO "ESCOLHER" */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-sm sm:max-w-md mx-auto pt-3 border-t border-zinc-900/80">
              {/* Botões < e > com Bolinhas Coloridas de Todos os Planos */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPlan}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 hover:border-zinc-700 transition cursor-pointer hover:scale-105 active:scale-95"
                  title="Plano anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Bolinhas / Pílulas Coloridas de Cada Plano */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-950/90 border border-zinc-800/80 shadow-inner">
                  {FLOW_PLANS.map((plan, idx) => {
                    const theme = PLAN_CARD_THEMES[plan.id];
                    const isCurrent = idx === currentPlanIndex;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handleSelectPlanByIndex(idx)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          isCurrent
                            ? 'w-6 h-2.5 ring-2 ring-white/70 scale-110 shadow-sm'
                            : 'w-2 h-2 opacity-40 hover:opacity-90 hover:scale-125'
                        }`}
                        style={{ backgroundColor: theme?.dotColor || '#FF2D55' }}
                        title={`${plan.name} (${plan.priceFormatted})`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNextPlan}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 hover:border-zinc-700 transition cursor-pointer hover:scale-105 active:scale-95"
                  title="Próximo plano"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Botão Escolher Branco Pill com Micro-Física e Transição Fluida */}
              <motion.button
                type="button"
                id="btn-escolher-plano"
                onClick={handleSelectPlan}
                disabled={isProcessingFree || isChoosingPlan}
                whileHover={{
                  scale: 1.04,
                  y: -1,
                  boxShadow: '0 8px 30px -4px rgba(255, 255, 255, 0.45)',
                }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                className="group relative w-full sm:w-auto px-8 py-2.5 rounded-full bg-white text-black font-extrabold text-sm sm:text-base hover:bg-zinc-100 transition-colors shadow-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 overflow-hidden"
              >
                {/* Brilho dinâmico ao passar mouse */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                {isProcessingFree ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Ativando...</span>
                  </>
                ) : isChoosingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Abrindo...</span>
                  </>
                ) : (
                  <>
                    <span>Escolher</span>
                    <ArrowRight className="w-4 h-4 text-black transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Link de atalho direto para quem já comprou token */}
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setSlideDirection(1);
                  setCurrentScreen('validate-token');
                }}
                className="text-xs text-zinc-400 hover:text-white transition underline cursor-pointer"
              >
                Já possui uma chave token de 5 dígitos? Ativar aqui
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TELA 2 (IMAGEM 8): RESUMO DO PLANO SELECIONADO                            */}
        {/* ========================================================================= */}
        {currentScreen === 'summary' && (
          <motion.div
            key="screen-summary"
            initial={{ opacity: 0, x: slideDirection > 0 ? 32 : -32, scale: 0.98, filter: 'blur(3px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -32 : 32, scale: 0.98, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col h-full min-h-[520px] justify-between p-4 sm:p-6"
          >
            {/* TOPO: BOTÃO VOLTAR + FECHAR */}
            <div className="flex items-center justify-between w-full mb-3">
              <button
                type="button"
                onClick={() => {
                  setSlideDirection(-1);
                  setCurrentScreen('plans');
                }}
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition cursor-pointer hover:scale-105 active:scale-95"
                title="Voltar aos planos"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CENTRO: TÍTULO + CARTÃO HORIZONTAL + PILHAS BRANCAS COM TRANSIÇÃO EM CASCATA */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm sm:max-w-md w-full mx-auto space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="text-base sm:text-lg font-bold text-white text-center tracking-tight"
              >
                {selectedPlan.name}
              </motion.h2>

              {/* Cartão Worscoi Horizontal com Cor Dinâmica do Plano (Imagem 8) */}
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex justify-center"
              >
                <WorscoiCardVisual variant="horizontal" planId={selectedPlan.id} />
              </motion.div>

              {/* Informações do Plano em uma Única Div Compacta e Organizada */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="w-full bg-white text-black px-5 py-3 rounded-2xl sm:rounded-3xl shadow-lg border border-zinc-100 flex flex-col divide-y divide-zinc-200/80"
              >
                {/* Linha 1: Card com indicador de cor */}
                <div className="flex justify-between items-center py-2 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: PLAN_CARD_THEMES[selectedPlan.id]?.dotColor || '#FF2D55' }}
                    />
                    <span className="text-zinc-600">Card</span>
                  </div>
                  <span className="font-extrabold text-black text-right truncate ml-2">
                    {selectedPlan.name}
                  </span>
                </div>

                {/* Linha 2: Preço */}
                <div className="flex justify-between items-center py-2 text-sm font-semibold">
                  <span className="text-zinc-600">Preço</span>
                  <span className="font-extrabold text-black">
                    {selectedPlan.priceNumber.toLocaleString('pt-AO')} kz
                  </span>
                </div>

                {/* Linha 3: Tempo */}
                <div className="flex justify-between items-center py-2 text-sm font-semibold">
                  <span className="text-zinc-600">Tempo</span>
                  <span className="font-extrabold text-black">
                    {selectedPlan.durationFormatted}
                  </span>
                </div>

                {/* Linha 4: Cobertura de Canais */}
                {selectedPlan.channelCountLabel && (
                  <div className="flex justify-between items-center py-2 text-sm font-semibold">
                    <span className="text-zinc-600">Canais Liberados</span>
                    <span className="font-extrabold text-[#00A859] text-right truncate ml-2 text-xs sm:text-sm">
                      {selectedPlan.channelCountLabel}
                    </span>
                  </div>
                )}

                {/* Linha 5: Total hoje */}
                <div className="flex justify-between items-center py-2 text-sm font-semibold">
                  <span className="text-zinc-700 font-bold">Total hoje</span>
                  <span className="font-black text-black text-base">
                    {selectedPlan.priceNumber.toLocaleString('pt-AO')} kz
                  </span>
                </div>
              </motion.div>
            </div>

            {/* BASE: BOTÃO DE PROSSEGUIR PARA PAGAMENTO */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm sm:max-w-md mx-auto pt-3"
            >
              <button
                type="button"
                onClick={() => {
                  setSlideDirection(1);
                  setCurrentScreen('payment');
                }}
                className="w-full py-4 px-6 rounded-full bg-[#FF2D55] hover:bg-[#ff1744] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#FF2D55]/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Prosseguir para Pagamento</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TELA 3 (IMAGEM 9): PAGAMENTO & WHATSAPP (MAQUININHA POS)                 */}
        {/* ========================================================================= */}
        {currentScreen === 'payment' && (
          <motion.div
            key="screen-payment"
            initial={{ opacity: 0, x: slideDirection > 0 ? 32 : -32, scale: 0.98, filter: 'blur(3px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -32 : 32, scale: 0.98, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col h-full min-h-[520px] justify-between p-4 sm:p-6"
          >
            {/* TOPO: BOTÃO VOLTAR + FECHAR */}
            <div className="flex items-center justify-between w-full mb-2">
              <button
                type="button"
                onClick={() => {
                  setSlideDirection(-1);
                  setCurrentScreen('summary');
                }}
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition cursor-pointer hover:scale-105 active:scale-95"
                title="Voltar ao resumo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CENTRO: CARTÃO BRANCO COM A MAQUININHA + PILHAS + INSTRUÇÕES */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm sm:max-w-md w-full mx-auto space-y-4">
              {/* Card Branco com a Ilustração do Terminal POS (Imagem 9) */}
              <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-xl flex items-center justify-center">
                <POSTerminalIllustration className="w-full max-w-[240px] sm:max-w-[270px]" />
              </div>

              {/* Informações do Plano em uma Única Div Compacta e Organizada (Imagem 9) */}
              <div className="w-full bg-white text-black px-5 py-3 rounded-2xl sm:rounded-3xl shadow-lg border border-zinc-100 flex flex-col divide-y divide-zinc-200/80">
                {/* Linha 1: Card com indicador de cor */}
                <div className="flex justify-between items-center py-2 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: PLAN_CARD_THEMES[selectedPlan.id]?.dotColor || '#FF2D55' }}
                    />
                    <span className="text-zinc-600">Card</span>
                  </div>
                  <span className="font-extrabold text-black text-right truncate ml-2">
                    {selectedPlan.name}
                  </span>
                </div>

                {/* Linha 2: Preço */}
                <div className="flex justify-between items-center py-2 text-sm font-semibold">
                  <span className="text-zinc-600">Preço</span>
                  <span className="font-extrabold text-black">
                    {selectedPlan.priceNumber.toLocaleString('pt-AO')} kz
                  </span>
                </div>
              </div>

              {/* Texto de Instrução Exato da Imagem 9 */}
              <div className="text-center px-2 space-y-1 text-xs sm:text-sm text-zinc-400 font-normal">
                <p>
                  Faça o pagamento via <span className="font-bold text-white">express</span> ou{' '}
                  <span className="font-bold text-white">pay pay</span> no nº{' '}
                  <span className="font-bold text-white underline decoration-[#FF2D55] decoration-2">
                    942472983
                  </span>
                  .
                </p>
                <p>
                  Envie o comprovante no <span className="font-bold text-emerald-400">whatsApp</span>{' '}
                  do mesmo numero, e receba sua chave token.
                </p>
              </div>

              {/* Botões de Ação Rápida para o Usuário (Copiar nº e Abrir WhatsApp) */}
              <div className="w-full flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copiar 942472983</span>
                    </>
                  )}
                </button>

                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Abrir WhatsApp</span>
                </a>
              </div>
            </div>

            {/* BASE: BOTÃO "JÁ TENHO A CHAVE TOKEN" VERMELHO PILL */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto pt-3 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSlideDirection(1);
                  setCurrentScreen('validate-token');
                }}
                className="w-full py-3.5 px-6 rounded-full bg-[#FF2D55] hover:bg-[#ff1744] text-white font-extrabold text-sm shadow-xl shadow-[#FF2D55]/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Já tenho a chave token</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TELA 4 (IMAGEM 10): VALIDAR CHAVE TOKEN                                   */}
        {/* ========================================================================= */}
        {currentScreen === 'validate-token' && (
          <motion.div
            key="screen-token"
            initial={{ opacity: 0, x: slideDirection > 0 ? 32 : -32, scale: 0.98, filter: 'blur(3px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -32 : 32, scale: 0.98, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col h-full min-h-[520px] justify-between p-4 sm:p-6"
          >
            {/* TOPO: BOTÃO VOLTAR + FECHAR */}
            <div className="flex items-center justify-between w-full mb-6">
              <button
                type="button"
                onClick={() => {
                  setSlideDirection(-1);
                  setCurrentScreen('payment');
                }}
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition cursor-pointer hover:scale-105 active:scale-95"
                title="Voltar às instruções"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CENTRO: "INSIRA A CHAVE TOKEN" EM VERMELHO + CAMPO PILL BRANCO + BOTÃO VALIDAR */}
            <form
              onSubmit={handleValidateTokenSubmit}
              className="flex-1 flex flex-col items-center justify-center max-w-sm sm:max-w-md w-full mx-auto space-y-6"
            >
              {/* Título Vermelho da Imagem 10 */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#FF2D55] text-center tracking-tight">
                Insira a chave token
              </h2>

              {/* Caixa de Texto Pill Branca (Imagem 10) */}
              <div className="w-full relative">
                <input
                  type="text"
                  value={tokenInput}
                  maxLength={5}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
                    setTokenInput(val);
                    if (tokenError) setTokenError(null);
                  }}
                  placeholder="EX: ABC12"
                  autoFocus
                  className="w-full bg-white text-black text-center font-black text-2xl sm:text-3xl tracking-[0.35em] py-4 px-6 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#FF2D55]/50 placeholder-zinc-300 transition uppercase select-all"
                />
              </div>

              {/* Mensagem de Erro (se houver) */}
              {tokenError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left max-w-full">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{tokenError}</span>
                </div>
              )}

              {/* Botão Validar Branco Pill (Imagem 10) */}
              <button
                type="submit"
                disabled={isValidatingToken || tokenInput.length === 0}
                className="px-14 py-3.5 rounded-full bg-white text-black font-extrabold text-base hover:bg-zinc-200 transition shadow-2xl active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isValidatingToken ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                    <span>Validando...</span>
                  </>
                ) : (
                  <span>Validar</span>
                )}
              </button>

              {/* Suporte WhatsApp se tiver dúvidas */}
              <p className="text-xs text-zinc-400 text-center pt-2">
                Ainda não recebeu o código no WhatsApp?{' '}
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Falar com suporte
                </a>
              </p>
            </form>

            {/* Espaçador inferior */}
            <div className="w-full h-8" />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
