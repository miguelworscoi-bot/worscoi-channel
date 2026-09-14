'use client';
import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Clock,
  MessageCircle,
  KeyRound,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PLANS, PAYMENT_CONFIG, isUserPlanExpired, getRemainingPlanTime } from '@/services/subscriptionService';
import { SubscriptionPlanId } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { WorscoiLogo } from './WorscoiLogo';

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
    <div
      id="payment-plans-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-[#070709] border border-zinc-900 rounded-3xl shadow-2xl shadow-black overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header do Modal com a Identidade Worscoi do Painel */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-zinc-900 bg-[#050507] shrink-0">
          <div className="flex items-center gap-3">
            <WorscoiLogo size="sm" showDot />
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Planos & Formas de Pagamento
              </h2>
              <p className="text-xs text-zinc-400">
                Ativação rápida por transferência bancária oficial para Angola e Exterior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo rolável com o mesmo padrão visual do Painel de Controle */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Banner de status se o plano expirou ou está próximo */}
          {isExpired ? (
            <div className="p-4 rounded-2xl bg-rose-950/20 border-2 border-dashed border-[#FF2D55]/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF2D55] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-[#FF2D55]">
                  Seu Período de Degustação Expirou!
                </p>
                <p className="text-zinc-300 mt-0.5 leading-relaxed">
                  Escolha um plano abaixo para efetuar o pagamento via Multicaixa Express ou PayPay. Em seguida, envie o comprovativo no WhatsApp para receber sua Chave Token de 5 dígitos instantaneamente.
                </p>
              </div>
            </div>
          ) : (
            userProfile?.plan === 'free' && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-4 h-4 text-[#FF2D55] shrink-0" />
                  <span>
                    Degustação Ativa: <strong className="text-white">{timeInfo.text}</strong> restantes.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoToRedeem}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#FF2D55]" />
                  <span>Já tenho Token (Ativar)</span>
                </button>
              </div>
            )
          )}

          {/* SEÇÃO 1: ESCOLHA O SEU PLANO (Estilo idêntico ao Painel de Controle) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Escolha o seu Plano
                </h3>
                <p className="text-xs text-zinc-400">
                  Clique para selecionar o plano desejado e ver os dados de transferência
                </p>
              </div>
              <span className="text-[11px] font-bold text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
                Moeda: Kwanzas (Kz)
              </span>
            </div>

            {/* Grid dos Planos com Bordas Tracejadas Vermelhas / Pink do Painel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paidPlans.map((planId) => {
                const plan = PLANS[planId];
                const isSelected = selectedPlanId === planId;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`rounded-2xl border-2 border-dashed p-4 transition-all duration-150 flex flex-col justify-between space-y-3 cursor-pointer group select-none relative ${
                      isSelected
                        ? 'border-[#FF2D55] bg-[#FF2D55]/10 shadow-lg shadow-[#FF2D55]/10 ring-1 ring-[#FF2D55]'
                        : 'border-[#FF2D55]/60 hover:border-[#FF2D55] bg-zinc-950/60 hover:bg-[#FF2D55]/5'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FF2D55] text-white shadow-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        MAIS POPULAR
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold tracking-tight transition ${
                            isSelected ? 'text-[#FF2D55]' : 'text-white group-hover:text-[#FF2D55]'
                          }`}
                        >
                          {plan.name}
                        </h4>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#FF2D55] bg-[#FF2D55] text-white'
                              : 'border-zinc-700'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-zinc-300">
                        {plan.priceFormatted} / {plan.durationDays} dias
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/80 space-y-1">
                      {plan.features.slice(0, 2).map((feat, idx) => (
                        <div key={idx} className="text-[10px] text-zinc-300 flex items-start gap-1">
                          <span className="text-[#FF2D55]">•</span>
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* CARD DE ATIVAÇÃO DE CHAVE TOKEN (Idêntico ao card da esquerda do painel) */}
              <div
                onClick={handleGoToRedeem}
                className="rounded-2xl border-2 border-dashed border-[#FF2D55]/70 hover:border-[#FF2D55] bg-zinc-950/50 hover:bg-[#FF2D55]/5 transition cursor-pointer flex flex-col items-center justify-center p-4 text-center group min-h-[140px]"
              >
                <KeyRound className="w-6 h-6 text-[#FF2D55] mb-2 group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm font-bold text-[#FF2D55] tracking-tight">
                  Já possui um Token?
                </span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Clique aqui para digitar seu código de 5 dígitos e liberar o sinal imediatamente
                </p>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: FORMAS DE PAGAMENTO (MULTICAIXA & PAYPAY) */}
          <div className="space-y-4 pt-4 border-t border-zinc-900/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Formas de Pagamento
                </h3>
                <p className="text-xs text-zinc-400">
                  Transfira para a conta oficial e envie o comprovativo pelo WhatsApp
                </p>
              </div>

              {/* Alternância de Abas: Multicaixa Express / PayPay no estilo Worscoi */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-850 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('multicaixa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePaymentMethod === 'multicaixa'
                      ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  Multicaixa Express
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('paypay')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePaymentMethod === 'paypay'
                      ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  PayPay
                </button>
              </div>
            </div>

            {/* Grade com Dados da Conta e Instruções de Envio */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LADO ESQUERDO (7 Colunas): Dados da Transferência com Botões de Cópia */}
              <div className="lg:col-span-7 rounded-2xl border-2 border-dashed border-[#FF2D55]/60 bg-zinc-950/60 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Número para Transferência */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-zinc-400 font-semibold">
                        {activePaymentMethod === 'multicaixa'
                          ? 'Número de Telefone Multicaixa Express:'
                          : 'Número da Conta PayPay:'}
                      </span>
                      <span className="text-[10px] font-bold text-[#FF2D55] bg-[#FF2D55]/10 px-2 py-0.5 rounded-full border border-[#FF2D55]/30 uppercase">
                        Angola (+244)
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Smartphone className="w-5 h-5 text-[#FF2D55] shrink-0" />
                        <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider truncate">
                          {PAYMENT_CONFIG.phoneFormatted}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(PAYMENT_CONFIG.phone, 'phone')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
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

                  {/* Valor do Plano Selecionado */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-zinc-400 font-semibold">
                        Valor Exato a Transferir ({selectedPlan.name}):
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        Duração: {selectedPlan.durationDays} dias
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg sm:text-xl font-black text-[#FF2D55] font-mono tracking-tight">
                          {selectedPlan.priceFormatted}
                        </span>
                      </div>
                      {selectedPlan.priceAOA ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(String(selectedPlan.priceAOA), 'amount')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
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
                </div>

                {/* Beneficiário */}
                <div className="pt-2 border-t border-zinc-900 text-xs text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF2D55] shrink-0" />
                  <span>
                    Beneficiário Oficial: <strong className="text-zinc-200">{PAYMENT_CONFIG.multicaixa.beneficiary}</strong>
                  </span>
                </div>
              </div>

              {/* LADO DIREITO (5 Colunas): Passo a Passo e Botão WhatsApp */}
              <div className="lg:col-span-5 rounded-2xl border-2 border-dashed border-[#FF2D55]/60 bg-zinc-950/60 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF2D55]" />
                    Como Concluir a Ativação:
                  </h4>
                  <ol className="space-y-1.5 text-xs text-zinc-300 list-decimal list-inside leading-relaxed">
                    {activePaymentMethod === 'multicaixa' ? (
                      <>
                        <li>Abra seu app <strong>Multicaixa Express</strong>.</li>
                        <li>Escolha <strong>Transferência</strong> e digite <strong className="text-[#FF2D55]">942472983</strong>.</li>
                        <li>Insira <strong>{selectedPlan.priceFormatted}</strong> e confirme.</li>
                        <li>Guarde ou tire print do comprovativo.</li>
                      </>
                    ) : (
                      <>
                        <li>Abra seu aplicativo <strong>PayPay</strong>.</li>
                        <li>Transfira para o número <strong className="text-[#FF2D55]">942472983</strong>.</li>
                        <li>Envie o valor exato de <strong>{selectedPlan.priceFormatted}</strong>.</li>
                        <li>Guarde o comprovativo digital gerado.</li>
                      </>
                    )}
                  </ol>
                </div>

                {/* Botão de Envio de Comprovativo com a Identidade Worscoi */}
                <div className="pt-3 border-t border-zinc-900 space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FF2D55] hover:bg-[#e0264a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF2D55]/30 transition active:scale-[0.98] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Enviar Comprovativo no WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>
                  <p className="text-[10px] text-center text-zinc-500">
                    O administrador enviará seu Token de 5 dígitos imediatamente após o envio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-zinc-900 bg-[#050507] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-pulse" />
            <span>Já efetuou o pagamento e recebeu o código no WhatsApp?</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleGoToRedeem}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-2 border border-zinc-800 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#FF2D55]" />
              <span>Ativar Token de 5 Dígitos</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold hover:bg-zinc-900 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

