'use client';
import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Tv,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { redeemAccessToken, PLANS } from '@/services/subscriptionService';
import { SubscriptionPlanId } from '@/types';

interface RedeemTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenRedeemed?: (plan: SubscriptionPlanId) => void;
}

export function RedeemTokenModal({
  isOpen,
  onClose,
  onTokenRedeemed,
}: RedeemTokenModalProps) {
  const { user, userProfile, updateProfilePlan } = useAuth();
  const [tokenCode, setTokenCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    plan: SubscriptionPlanId;
    planName: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentPlanId: SubscriptionPlanId = userProfile?.plan || 'free';
  const currentPlanInfo = PLANS[currentPlanId] || PLANS.free;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mantém apenas letras e números, limitados a 5 caracteres maiúsculos
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
    setTokenCode(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenCode.length !== 5) {
      setErrorMsg('O código do token deve conter exatamente 5 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const currentUserData = {
      uid: user?.uid || userProfile?.id || 'guest_' + Date.now(),
      email: user?.email || userProfile?.email || 'espectador@playsports.tv',
      displayName: userProfile?.displayName || 'Espectador',
    };

    const res = await redeemAccessToken(tokenCode, currentUserData);

    setLoading(false);

    if (res.success && res.plan) {
      updateProfilePlan(res.plan, res.planName || res.plan, res.expiresAt, tokenCode);
      setSuccessResult({
        plan: res.plan,
        planName: res.planName || res.plan,
        message: res.message,
      });
      if (onTokenRedeemed) {
        onTokenRedeemed(res.plan);
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const resetForm = () => {
    setTokenCode('');
    setErrorMsg(null);
    setSuccessResult(null);
  };

  return (
    <div
      id="redeem-token-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="redeem-token-modal"
        className="relative w-full max-w-lg bg-[#0b0b10] border border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/90 ring-1 ring-white/10 my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Ativar Código de Acesso
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  5 Dígitos
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Digite o token oficial gerado pelo administrador para liberar seu plano.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STATUS DO PLANO ATUAL */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Seu Plano Atual
            </span>
            <div className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
              <span>{currentPlanInfo.name}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${currentPlanInfo.badgeBg} ${currentPlanInfo.badgeText} ${currentPlanInfo.badgeBorder}`}
              >
                {currentPlanInfo.badge}
              </span>
            </div>
          </div>
          {userProfile?.planExpiresAt && (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                Válido Até
              </span>
              <div className="text-xs font-mono text-zinc-300 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-emerald-400" />
                {new Date(userProfile.planExpiresAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}
        </div>

        {/* SUCESSO OU FORMULÁRIO */}
        {successResult ? (
          <div className="mt-6 space-y-4">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Plano Ativado com Sucesso!
              </h3>
              <p className="text-xs text-emerald-300 mt-1 max-w-sm mx-auto">
                {successResult.message}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Todos os canais do plano foram liberados imediatamente</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-800 transition-colors cursor-pointer"
              >
                Ativar Outro Código
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-black transition-colors cursor-pointer"
              >
                Assistir Agora
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="token-code-input"
                className="block text-xs font-bold text-zinc-300 mb-1.5"
              >
                Código do Token (5 Caracteres)
              </label>
              <div className="relative">
                <input
                  id="token-code-input"
                  type="text"
                  maxLength={5}
                  value={tokenCode}
                  onChange={handleInputChange}
                  placeholder="EX: V7K9M"
                  autoFocus
                  className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black px-4 py-3.5 rounded-2xl bg-zinc-900/90 border-2 border-zinc-800 focus:border-[#00E676] text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-500">
                  {tokenCode.length}/5
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>
                  Apenas códigos gerados e registrados no histórico do administrador são válidos.
                  Tentativas aleatórias são bloqueadas.
                </span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={tokenCode.length !== 5 || loading}
              className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                tokenCode.length === 5 && !loading
                  ? 'bg-[#00E676] hover:bg-[#00c864] text-black shadow-[#00E676]/20'
                  : 'bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Validando Token Oficial...</span>
                </>
              ) : (
                <>
                  <span>Validar e Resgatar Plano</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* GUIA DE PLANOS DISPONÍVEIS */}
        <div className="mt-6 pt-4 border-t border-zinc-850">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-[#00E676]" />
            Planos de Assinatura & Benefícios
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
              <div className="font-bold text-emerald-400">VIP Esportes (30d)</div>
              <div className="text-zinc-400 text-[10px] mt-0.5">Todos canais HD sem anúncios</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
              <div className="font-bold text-purple-400">Premium Ultra 4K (90d)</div>
              <div className="text-zinc-400 text-[10px] mt-0.5">ZAP + SuperSport + 4K</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
              <div className="font-bold text-blue-400">Básico Esportes (30d)</div>
              <div className="text-zinc-400 text-[10px] mt-0.5">Grade esportiva nacional</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850">
              <div className="font-bold text-amber-400">Passe Anual (365d)</div>
              <div className="text-zinc-400 text-[10px] mt-0.5">Acesso total por 1 ano</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
