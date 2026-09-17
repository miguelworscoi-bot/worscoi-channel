'use client';
import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight
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
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
    setTokenCode(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenCode.length !== 5) {
      setErrorMsg('Insira o código completo de 5 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const currentUserData = {
      uid: user?.uid || userProfile?.id || 'guest_' + Date.now(),
      email: user?.email || userProfile?.email || 'espectador@worscoi.tv',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="redeem-token-modal"
        className="relative w-full max-w-sm bg-[#0d0f14] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/90 ring-1 ring-white/5 my-auto animate-in fade-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO LIMPO */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 shrink-0">
              <KeyRound className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Ativar Código
              </h2>
              <p className="text-xs text-zinc-400">
                Digite seu token de 5 dígitos para liberar o acesso.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 group"
            title="Fechar"
          >
            <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* FEEDBACK DE SUCESSO OU FORMULÁRIO DE ENTRADA */}
        {successResult ? (
          <div className="mt-4 space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Plano Ativado com Sucesso!
              </h3>
              <p className="text-xs text-emerald-300/90 mt-1">
                {successResult.message}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-200 text-[11px] font-medium">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Canais e conteúdos liberados</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Outro Código
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                Assistir Agora
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="mt-4 space-y-3.5">
            <div>
              <div className="relative">
                <input
                  id="token-code-input"
                  type="text"
                  maxLength={5}
                  value={tokenCode}
                  onChange={handleInputChange}
                  placeholder="DIGITE O CÓDIGO"
                  autoFocus
                  className="w-full text-center tracking-[0.35em] font-mono text-xl font-black px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-emerald-500 text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-500">
                  {tokenCode.length}/5
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={tokenCode.length !== 5 || loading}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md group ${
                tokenCode.length === 5 && !loading
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] active:scale-98'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Validando Código...</span>
                </>
              ) : (
                <>
                  <span>Ativar Acesso</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {/* STATUS DISCRETO DO PLANO ATUAL */}
            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Plano atual:</span>
              <span className="font-semibold text-zinc-300">
                {currentPlanInfo.name}
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

