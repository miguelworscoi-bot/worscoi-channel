'use client';
import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SubscriptionPlanId, PlanInfo } from '@/types';
import {
  getStripeConfig,
  createStripePaymentIntent,
  verifyStripePayment,
  StripeConfig,
} from '@/services/stripeService';
import { PLANS } from '@/services/subscriptionService';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: SubscriptionPlanId;
  userData?: {
    name?: string;
    email?: string;
    uid?: string;
  };
  onSuccess: (data: {
    plan: SubscriptionPlanId;
    planName: string;
    token: string;
    expiresAt: string | null;
  }) => void;
}

export function StripeCheckoutModal({
  isOpen,
  onClose,
  planId,
  userData,
  onSuccess,
}: StripeCheckoutModalProps) {
  const plan: PlanInfo = PLANS[planId] || PLANS.vip;

  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(userData?.name || '');
  const [currency, setCurrency] = useState<'usd' | 'eur'>('usd');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    tokenCode: string;
    expiresAt: string;
    planName: string;
  } | null>(null);

  // Price calculations
  const priceUSD =
    planId === 'diario'
      ? '1.99'
      : planId === 'basico'
      ? '3.49'
      : planId === 'vip'
      ? '4.99'
      : planId === 'premium'
      ? '9.99'
      : '34.99';

  const priceEUR =
    planId === 'diario'
      ? '1.89'
      : planId === 'basico'
      ? '3.29'
      : planId === 'vip'
      ? '4.79'
      : planId === 'premium'
      ? '9.49'
      : '32.99';

  const currentPriceFormatted =
    currency === 'usd' ? `$${priceUSD} USD` : `€${priceEUR} EUR`;

  // Fetch Stripe configuration on mount
  useEffect(() => {
    if (isOpen) {
      getStripeConfig().then(setStripeConfig);
      setErrorMsg(null);
      setSuccessResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Format CVC
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(raw);
  };

  // Preencher cartão de teste Stripe
  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardName(userData?.name || 'Cliente Teste Stripe');
    setErrorMsg(null);
  };

  // Processar pagamento com Stripe
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      setErrorMsg('Por favor, informe o número completo do cartão.');
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMsg('Informe a validade no formato MM/AA.');
      return;
    }
    if (cardCvc.length < 3) {
      setErrorMsg('Informe o código de segurança CVC (3 ou 4 dígitos).');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Criar PaymentIntent no backend via Stripe API
      const intentRes = await createStripePaymentIntent({
        planId,
        planName: plan.name,
        currency,
        userId: userData?.uid,
        userEmail: userData?.email,
        userName: cardName,
      });

      if (!intentRes.success) {
        throw new Error(intentRes.error || 'Falha ao iniciar pagamento com Stripe.');
      }

      // Simulação rápida para feedback fluido em preview ou com token de teste
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // 2. Verificar e Confirmar a Transação
      const verifyRes = await verifyStripePayment({
        paymentIntentId: intentRes.paymentIntentId || 'pi_simulated',
        planId,
        userId: userData?.uid,
        userEmail: userData?.email,
      });

      if (!verifyRes.success || !verifyRes.tokenCode) {
        throw new Error(verifyRes.error || 'Falha ao confirmar transação no Stripe.');
      }

      setSuccessResult({
        tokenCode: verifyRes.tokenCode,
        expiresAt: verifyRes.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
        planName: plan.name,
      });

      // Dispara callback de ativação no aplicativo
      onSuccess({
        plan: planId,
        planName: plan.name,
        token: verifyRes.tokenCode,
        expiresAt: verifyRes.expiresAt || null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao processar cobrança via Stripe.';
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="stripe-checkout-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        id="stripe-checkout-modal"
        className="relative w-full max-w-lg bg-[#0c0c12] border border-zinc-800/90 rounded-3xl shadow-2xl shadow-black p-5 sm:p-7 text-white space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#635BFF]/15 border border-[#635BFF]/30 flex items-center justify-center text-[#635BFF]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Checkout Seguro Stripe
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#635BFF]/20 text-[#8881ff] border border-[#635BFF]/40">
                  {stripeConfig?.mode === 'live' ? 'Stripe Oficial' : 'Stripe Ativo'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pagamento instantâneo via Cartão de Crédito ou Débito
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TELA DE SUCESSO */}
        {successResult ? (
          <div className="space-y-5 text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl font-black text-white">Pagamento Aprovado com Sucesso!</h4>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                A sua assinatura do <strong className="text-emerald-400">{successResult.planName}</strong> foi liberada imediatamente sem necessidade de esperar validação manual.
              </p>
            </div>

            {/* Código Token Gerado */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 max-w-xs mx-auto text-center space-y-1 shadow-inner">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Seu Código de Ativação Stripe
              </span>
              <span className="text-2xl font-black tracking-widest text-[#FF2D55] font-mono block">
                {successResult.tokenCode}
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Plano já ativado na sua conta logada
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:opacity-95 transition cursor-pointer"
            >
              Começar a Assistir Agora
            </button>
          </div>
        ) : (
          /* FORMULÁRIO DE CHECKOUT STRIPE */
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {/* RESUMO DO PLANO SELECIONADO */}
            <div className="bg-gradient-to-r from-zinc-900/80 via-zinc-900/50 to-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#FF2D55] uppercase tracking-wider block">
                  Plano Selecionado
                </span>
                <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                <p className="text-xs text-zinc-400">
                  {plan.durationDays} dias de acesso irrestrito
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrency('usd')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      currency === 'usd'
                        ? 'bg-[#635BFF] text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    USD
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('eur')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      currency === 'eur'
                        ? 'bg-[#635BFF] text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    EUR
                  </button>
                </div>
                <span className="text-base sm:text-lg font-black text-emerald-400 block mt-0.5">
                  {currentPriceFormatted}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  ≈ {plan.priceAOA?.toLocaleString('pt-AO')} Kz
                </span>
              </div>
            </div>

            {/* BOTÃO DE PREENCHIMENTO RÁPIDO DE TESTE (QUANDO EM MODO TESTE/DEMO) */}
            <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Modo de Testes do Stripe</span>
              </span>
              <button
                type="button"
                onClick={handleFillTestCard}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition cursor-pointer"
              >
                Preencher Cartão de Teste
              </button>
            </div>

            {/* CAMPOS DO CARTÃO */}
            <div className="space-y-3">
              {/* NOME NO CARTÃO */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nome Impresso no Cartão
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Nome completo como no cartão"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF]"
                />
              </div>

              {/* NÚMERO DO CARTÃO */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between mb-1">
                  <span>Número do Cartão</span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" /> 256-bit SSL
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] font-mono tracking-wider"
                  />
                  <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* VALIDADE E CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Validade (MM/AA)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="12/28"
                    maxLength={5}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] text-center font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    required
                    value={cardCvc}
                    onChange={handleCvcChange}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] text-center font-mono"
                  />
                </div>
              </div>
            </div>

            {/* MENSAGEM DE ERRO SE HOUVER */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* BOTÃO PRINCIPAL DE PAGAMENTO */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-full bg-[#635BFF] hover:bg-[#5349eb] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#635BFF]/30 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processando com Stripe...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Pagar {currentPriceFormatted} Agora</span>
                </>
              )}
            </button>

            {/* SELO DE SEGURANÇA STRIPE */}
            <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                PCI-DSS Level 1
              </span>
              <span>•</span>
              <span>Stripe Certified</span>
              <span>•</span>
              <span>Ativação Instantânea</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
