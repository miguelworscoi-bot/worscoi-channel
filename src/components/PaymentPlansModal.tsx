'use client';
import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Clock,
  Crown,
  MessageCircle,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { PLANS, PAYMENT_CONFIG, isUserPlanExpired, getRemainingPlanTime } from '@/services/subscriptionService';
import { SubscriptionPlanId } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface PaymentPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRedeemToken?: () => void;
  defaultSelectedPlan?: SubscriptionPlanId;
}

export function PaymentPlansModal({
  isOpen,
  onClose,
  onOpenRedeemToken,
  defaultSelectedPlan = 'vip',
}: PaymentPlansModalProps) {
  const { userProfile } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(
    defaultSelectedPlan === 'free' ? 'vip' : defaultSelectedPlan
  );
  const [activePaymentMethod, setActivePaymentMethod] = useState<'multicaixa' | 'paypay'>('multicaixa');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const isExpired = isUserPlanExpired(userProfile);
  const timeInfo = getRemainingPlanTime(userProfile);
  const selectedPlan = PLANS[selectedPlanId] || PLANS.vip;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    const url = PAYMENT_CONFIG.whatsappMessage(selectedPlan.name, selectedPlan.priceFormatted);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGoToRedeem = () => {
    onClose();
    if (onOpenRedeemToken) {
      onOpenRedeemToken();
    }
  };

  const paidPlans: SubscriptionPlanId[] = ['diario', 'basico', 'vip', 'premium', 'anual'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Planos & Formas de Pagamento
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Multicaixa & PayPay
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Ativação rápida via código de 5 dígitos para Angola e internacional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Banner de status se o plano expirou ou está próximo */}
          {isExpired ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-red-300">
                  Seu Plano Gratuito de 1 Dia Expirou!
                </p>
                <p className="text-zinc-300 mt-0.5">
                  O período de teste gratuito de 24 horas terminou. Escolha um plano abaixo para efetuar o pagamento via Multicaixa Express ou PayPay e receba seu Token de 5 dígitos para continuar assistindo.
                </p>
              </div>
            </div>
          ) : userProfile?.plan === 'free' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-amber-300">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  Plano Gratuito Ativo: <strong>{timeInfo.text}</strong> de degustação restante (após 1 dia expira).
                </span>
              </div>
              <button
                onClick={handleGoToRedeem}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Ativar Token
              </button>
            </div>
          )}

          {/* Seleção dos Planos em Grade */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                1. Escolha o seu Plano Esportivo:
              </label>
              <span className="text-xs text-zinc-400">Valores em Kwanzas (Kz)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paidPlans.map((planId) => {
                const plan = PLANS[planId];
                const isSelected = selectedPlanId === planId;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/20'
                        : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        MAIS POPULAR
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder}`}>
                          {plan.badge}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-sm sm:text-base mt-2">
                        {plan.name}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
                          {plan.priceFormatted}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/60 space-y-1.5">
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Métodos de Pagamento em Destaque */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  2. Pague por Multicaixa Express ou PayPay:
                </label>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Transfira diretamente para o número oficial e envie o comprovativo no WhatsApp.
                </p>
              </div>

              {/* Botões de alternância de abas de pagamento */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('multicaixa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activePaymentMethod === 'multicaixa'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>Multicaixa Express</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('paypay')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activePaymentMethod === 'paypay'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>PayPay</span>
                </button>
              </div>
            </div>

            {/* Caixa com os Dados do Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card Esquerdo: Número e Valor para Cópia */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 font-medium">
                      {activePaymentMethod === 'multicaixa' ? 'Número Multicaixa Express:' : 'Número PayPay:'}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Angola (+244)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider">
                        {PAYMENT_CONFIG.phoneFormatted}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(PAYMENT_CONFIG.phone, 'phone')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copiedField === 'phone' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 font-medium">Valor a transferir ({selectedPlan.name}):</span>
                    <span className="text-xs text-zinc-400 font-medium">{selectedPlan.durationDays} dias</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="text-lg sm:text-xl font-bold text-emerald-400">
                        {selectedPlan.priceFormatted}
                      </span>
                    </div>
                    {selectedPlan.priceAOA ? (
                      <button
                        onClick={() => handleCopy(String(selectedPlan.priceAOA), 'amount')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        {copiedField === 'amount' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Valor</span>
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Beneficiário Oficial: <strong>{PAYMENT_CONFIG.multicaixa.beneficiary}</strong></span>
                </div>
              </div>

              {/* Card Direito: Passo a passo */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Como Concluir seu Pagamento:
                  </h4>
                  <ol className="space-y-2 text-xs text-zinc-300 list-decimal list-inside leading-relaxed">
                    {activePaymentMethod === 'multicaixa' ? (
                      <>
                        <li>Abra seu aplicativo <strong>Multicaixa Express</strong>.</li>
                        <li>Escolha <strong>Transferência</strong> e digite o número <strong className="text-emerald-400">942472983</strong>.</li>
                        <li>Insira o valor de <strong>{selectedPlan.priceFormatted}</strong> e confirme com o seu PIN.</li>
                        <li>Guarde o comprovativo da operação.</li>
                      </>
                    ) : (
                      <>
                        <li>Abra seu aplicativo <strong>PayPay</strong>.</li>
                        <li>Selecione <strong>Transferir</strong> para o número <strong className="text-emerald-400">942472983</strong>.</li>
                        <li>Insira o valor de <strong>{selectedPlan.priceFormatted}</strong> e confirme o envio.</li>
                        <li>Guarde o comprovativo digital gerado.</li>
                      </>
                    )}
                  </ol>
                </div>

                {/* Botão de Envio de Comprovativo WhatsApp */}
                <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2">
                  <button
                    onClick={handleOpenWhatsApp}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    <span>Enviar Comprovativo no WhatsApp (+244 942 472 983)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                  <p className="text-[11px] text-center text-zinc-400">
                    O administrador liberará seu Token de 5 dígitos imediatamente após o envio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com atalho para ativação do Token */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/70 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Já efetuou o pagamento e recebeu seu código?</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleGoToRedeem}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-zinc-700 transition"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Já tenho um Token (Ativar Agora)</span>
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold hover:bg-zinc-800/80 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
