'use client';
import React, { useState } from 'react';
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
} from 'lucide-react';
import { WorscoiCardVisual } from './WorscoiCardVisual';
import { POSTerminalIllustration } from './POSTerminalIllustration';
import { SubscriptionPlanId } from '@/types';
import {
  createWhatsAppPaymentProofLink,
  redeemAccessToken,
} from '@/services/subscriptionService';

export interface PlanItemOption {
  id: SubscriptionPlanId;
  name: string;
  priceFormatted: string;
  priceNumber: number;
  durationFormatted: string;
  isFree?: boolean;
}

const FLOW_PLANS: PlanItemOption[] = [
  {
    id: 'free',
    name: 'Plano Grátis (1 Dia)',
    priceFormatted: 'Grátis / 24 horas',
    priceNumber: 0,
    durationFormatted: '1 Dia (24h)',
    isFree: true,
  },
  {
    id: 'diario',
    name: 'Passe Fim de Semana (3 Dias)',
    priceFormatted: '1.500 Kz / 3 dias',
    priceNumber: 1500,
    durationFormatted: '3 Dias',
  },
  {
    id: 'basico',
    name: 'Básico Esportes (30 Dias)',
    priceFormatted: '2.500 Kz / 30 dias',
    priceNumber: 2500,
    durationFormatted: '30 Dias',
  },
  {
    id: 'vip',
    name: 'VIP Esportes HD (30 Dias)',
    priceFormatted: '4.000 Kz / 30 dias',
    priceNumber: 4000,
    durationFormatted: '30 Dias',
  },
  {
    id: 'premium',
    name: 'Premium Ultra 4K (90 Dias)',
    priceFormatted: '9.500 Kz / 90 dias',
    priceNumber: 9500,
    durationFormatted: '90 Dias',
  },
  {
    id: 'anual',
    name: 'Passe Anual Campeão (365 Dias)',
    priceFormatted: '30.000 Kz / 365 dias',
    priceNumber: 30000,
    durationFormatted: '365 Dias',
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
  };
  onSelectFreePlan: () => Promise<void> | void;
  onTokenValidated: (params: {
    plan: SubscriptionPlanId;
    planName: string;
    token: string;
    expiresAt: string | null;
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

  const handlePrevPlan = () => {
    setCurrentPlanIndex((prev) => (prev > 0 ? prev - 1 : FLOW_PLANS.length - 1));
  };

  const handleNextPlan = () => {
    setCurrentPlanIndex((prev) => (prev < FLOW_PLANS.length - 1 ? prev + 1 : 0));
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('942472983');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Ao clicar em "Escolher" na Imagem 7
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
      // Caso plano pago: vai para o resumo do plano (Imagem 8)
      setCurrentScreen('summary');
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
      };

      const result = await redeemAccessToken(cleanToken, currentUserData);

      if (result.success && result.plan) {
        await onTokenValidated({
          plan: result.plan,
          planName: result.planName || result.plan,
          token: cleanToken,
          expiresAt: result.expiresAt ?? null,
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
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
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

            {/* CENTRO: NOME DO PLANO + PREÇO + CARTÃO VERMELHO VERTICAL */}
            <div className="flex-1 flex flex-col items-center justify-center my-2">
              <div className="text-center mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {selectedPlan.name}
                </h2>
                <p className="text-sm font-medium text-zinc-300 mt-0.5">
                  {selectedPlan.priceFormatted}
                </p>
              </div>

              {/* Cartão Worscoi Vertical (Imagem 7) */}
              <div className="relative">
                <WorscoiCardVisual variant="vertical" />
              </div>
            </div>

            {/* BASE: NAVEGAÇÃO DO CARROSSEL (< >) + BOTÃO "ESCOLHER" */}
            <div className="flex items-center justify-between w-full max-w-sm sm:max-w-md mx-auto pt-4 border-t border-zinc-900/80">
              {/* Botões < e > */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPlan}
                  className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 hover:border-zinc-700 transition cursor-pointer"
                  title="Plano anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPlan}
                  className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 hover:border-zinc-700 transition cursor-pointer"
                  title="Próximo plano"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Botão Escolher Branco Pill (Imagem 7) */}
              <button
                type="button"
                onClick={handleSelectPlan}
                disabled={isProcessingFree}
                className="px-9 py-3 rounded-full bg-white text-black font-extrabold text-sm sm:text-base hover:bg-zinc-200 transition shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isProcessingFree ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Ativando...</span>
                  </>
                ) : (
                  <span>Escolher</span>
                )}
              </button>
            </div>

            {/* Link de atalho direto para quem já comprou token */}
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => setCurrentScreen('validate-token')}
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
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full min-h-[520px] justify-between p-4 sm:p-6"
          >
            {/* TOPO: BOTÃO VOLTAR + FECHAR */}
            <div className="flex items-center justify-between w-full mb-3">
              <button
                type="button"
                onClick={() => setCurrentScreen('plans')}
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition cursor-pointer"
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

            {/* CENTRO: TÍTULO + CARTÃO HORIZONTAL + PILHAS BRANCAS */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm sm:max-w-md w-full mx-auto space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white text-center">
                {selectedPlan.name}
              </h2>

              {/* Cartão Worscoi Horizontal (Imagem 8) */}
              <div className="w-full flex justify-center">
                <WorscoiCardVisual variant="horizontal" />
              </div>

              {/* Lista em Pills Brancos (Imagem 8) */}
              <div className="w-full space-y-2.5 pt-2">
                {/* Linha 1: Card */}
                <div className="w-full bg-white text-black px-6 py-3.5 rounded-full flex justify-between items-center text-sm font-semibold shadow-md">
                  <span className="text-zinc-700">Card</span>
                  <span className="font-extrabold text-black text-right truncate ml-2">
                    {selectedPlan.name}
                  </span>
                </div>

                {/* Linha 2: Preço */}
                <div className="w-full bg-white text-black px-6 py-3.5 rounded-full flex justify-between items-center text-sm font-semibold shadow-md">
                  <span className="text-zinc-700">Preço</span>
                  <span className="font-extrabold text-black">
                    {selectedPlan.priceNumber.toLocaleString('pt-AO')} kz
                  </span>
                </div>

                {/* Linha 3: Tempo */}
                <div className="w-full bg-white text-black px-6 py-3.5 rounded-full flex justify-between items-center text-sm font-semibold shadow-md">
                  <span className="text-zinc-700">Tempo</span>
                  <span className="font-extrabold text-black">
                    {selectedPlan.durationFormatted}
                  </span>
                </div>

                {/* Linha 4: Total hoje */}
                <div className="w-full bg-white text-black px-6 py-3.5 rounded-full flex justify-between items-center text-sm font-semibold shadow-md">
                  <span className="text-zinc-700">Total hoje</span>
                  <span className="font-extrabold text-black">
                    {selectedPlan.priceNumber.toLocaleString('pt-AO')} kz
                  </span>
                </div>
              </div>
            </div>

            {/* BASE: BOTÃO COMPRAR VERMELHO PILL (IMAGEM 8) */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto pt-4">
              <button
                type="button"
                onClick={() => setCurrentScreen('payment')}
                className="w-full py-4 px-6 rounded-full bg-[#FF2D55] hover:bg-[#ff1744] text-white font-extrabold text-base shadow-xl shadow-[#FF2D55]/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Comprar - {selectedPlan.priceNumber.toLocaleString('pt-AO')} kz</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TELA 3 (IMAGEM 9): PAGAMENTO & WHATSAPP (MAQUININHA POS)                 */}
        {/* ========================================================================= */}
        {currentScreen === 'payment' && (
          <motion.div
            key="screen-payment"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full min-h-[520px] justify-between p-4 sm:p-6"
          >
            {/* TOPO: BOTÃO VOLTAR + FECHAR */}
            <div className="flex items-center justify-between w-full mb-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('summary')}
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition cursor-pointer"
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

              {/* Pills Brancos com Informações do Plano (Imagem 9) */}
              <div className="w-full space-y-2.5">
                {/* Linha 1: Card */}
                <div className="w-full bg-white text-black px-6 py-3.5 rounded-full flex justify-between items-center text-sm font-semibold shadow-md">
                  <span className="text-zinc-700">Card</span>
                  <span className="font-extrabold text-black text-right truncate ml-2">
                    {selectedPlan.name}
                  </span>
                </div>

                {/* Linha 2: Preço */}
                <div className="w-full bg-white text-black px-6 py-3.5 rounded-full flex justify-between items-center text-sm font-semibold shadow-md">
                  <span className="text-zinc-700">Preço</span>
                  <span className="font-extrabold text-black">
                    {selectedPlan.priceNumber.toLocaleString('pt-AO')} kz
                  </span>
                </div>
              </div>

              {/* Texto de Instrução Exato da Imagem 9 */}
              <div className="text-center px-2 space-y-1 text-xs sm:text-sm text-zinc-300 font-medium">
                <p>
                  Faça o pagamento via <span className="font-bold text-white">express</span> ou{' '}
                  <span className="font-bold text-white">pay pay</span> no nº{' '}
                  <span className="font-extrabold text-white underline decoration-[#FF2D55] decoration-2">
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

            {/* BASE: BOTÃO "JÁ TENHO A CHAVE TOKEN" VERMELHO PILL (IMAGEM 9) */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentScreen('validate-token')}
                className="py-3.5 px-7 rounded-full bg-[#FF2D55] hover:bg-[#ff1744] text-white font-extrabold text-sm shadow-xl shadow-[#FF2D55]/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Já tenho a chave token</span>
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
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full min-h-[520px] justify-between p-4 sm:p-6"
          >
            {/* TOPO: BOTÃO VOLTAR + FECHAR */}
            <div className="flex items-center justify-between w-full mb-6">
              <button
                type="button"
                onClick={() => setCurrentScreen('payment')}
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition cursor-pointer"
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
              <h2 className="text-xl sm:text-2xl font-black text-[#FF2D55] text-center tracking-wide">
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
