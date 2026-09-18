'use client';
import React from 'react';
import {
  X,
  User as UserIcon,
  CreditCard,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PLANS } from '@/services/subscriptionService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenRedeemToken?: () => void;
  onOpenAuth?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTutorial?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  onOpenPaymentPlans,
  onOpenRedeemToken,
  onOpenAuth,
  onOpenPrivacyPolicy,
  onOpenTutorial,
}: UserProfileModalProps) {
  const { user, userProfile, signOut, countdown, isAdmin } = useAuth();

  if (!isOpen) return null;

  const currentPlanId = userProfile?.plan || 'free';
  const planInfo = PLANS[currentPlanId] || PLANS.free;
  const isExpired = countdown.expired && !isAdmin;

  const displayName =
    userProfile?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Espectador');
  const userEmail = userProfile?.email || user?.email || 'espectador@worscoi.tv';

  return (
    <div
      id="user-profile-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="user-profile-modal"
        className="relative w-full max-w-md bg-[#0d0f14] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/90 ring-1 ring-white/5 my-auto animate-in fade-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO: PERFIL DO USUÁRIO & BOTÃO FECHAR */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 font-bold text-base shrink-0 shadow-inner">
              {displayName[0]?.toUpperCase() || <UserIcon className="w-5 h-5 text-zinc-300" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate tracking-tight">
                {displayName}
              </h2>
              <p className="text-xs text-zinc-400 truncate font-normal">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-user-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 group"
            title="Fechar"
          >
            <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* STATUS DO PLANO & TEMPO DE ACESSO (COMPOSIÇÃO LIMPA) */}
        <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">{planInfo.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700">
                    {planInfo.priceFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* BADGE DE STATUS */}
            {isExpired ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                Expirado
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Ativo
              </span>
            )}
          </div>

          {/* CRONÔMETRO DE VALIDADE REFINADO */}
          <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 font-normal">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Validade do Acesso:</span>
            </div>

            <div className="text-xs font-bold">
              {isAdmin ? (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Acesso Ilimitado (Admin)
                </span>
              ) : isExpired ? (
                <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Acesso Finalizado
                </span>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded border ${
                    countdown.urgency === 'critical'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                      : countdown.urgency === 'warning'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-zinc-800/80 text-zinc-200 border-zinc-700/80'
                  }`}
                >
                  {countdown.days > 0 && `${countdown.days}d `}
                  {String(countdown.hours).padStart(2, '0')}h{' '}
                  {String(countdown.minutes).padStart(2, '0')}m{' '}
                  {String(countdown.seconds).padStart(2, '0')}s
                </span>
              )}
            </div>
          </div>

          {/* TOKEN ATIVADO (SE HOUVER) */}
          {userProfile?.activatedToken && (
            <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-400 font-normal">
              <span>Código Ativo:</span>
              <span className="font-bold text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                {userProfile.activatedToken}
              </span>
            </div>
          )}

          {/* INFORMATIVO DE SOMA CUMULATIVA DE TOKENS */}
          <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-400 font-normal">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Soma de Limite Cumulativa</span>
            </span>
            <span className="text-[10px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/60">
              Novas chaves somam dias
            </span>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO: RENOVAR / ATIVAR CÓDIGO */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {onOpenPaymentPlans && (
            <button
              type="button"
              id="profile-btn-plans"
              onClick={() => {
                onClose();
                onOpenPaymentPlans();
              }}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/90 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-98 cursor-pointer border border-zinc-700/80 group"
            >
              <CreditCard className="w-3.5 h-3.5 text-zinc-300 transition-transform duration-200 group-hover:scale-125" />
              <span>{isExpired ? 'Renovar Plano' : 'Alterar Plano'}</span>
            </button>
          )}

          {onOpenRedeemToken && (
            <button
              type="button"
              id="profile-btn-redeem"
              onClick={() => {
                onClose();
                onOpenRedeemToken();
              }}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-98 cursor-pointer border border-zinc-800 group"
            >
              <KeyRound className="w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 group-hover:scale-125" />
              <span>Ativar Código</span>
            </button>
          )}
        </div>

        {/* RODAPÉ SIMPLIFICADO COM AÇÕES DE CONTA */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            {onOpenAuth && (
              <button
                type="button"
                id="profile-btn-switch"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer py-1 group"
              >
                <RefreshCw className="w-3 h-3 text-zinc-500 transition-transform duration-200 group-hover:rotate-180" />
                <span>Trocar Conta</span>
              </button>
            )}

            {onOpenPrivacyPolicy && (
              <button
                type="button"
                id="profile-btn-privacy"
                onClick={() => {
                  onClose();
                  onOpenPrivacyPolicy();
                }}
                className="text-zinc-400 hover:text-[#00E676] flex items-center gap-1 transition-all cursor-pointer py-1"
                title="Ver Política de Privacidade e Cookies"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>Privacidade & Cookies</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                type="button"
                id="profile-btn-tutorial"
                onClick={() => {
                  onClose();
                  onOpenTutorial();
                }}
                className="text-zinc-400 hover:text-[#ed3c5c] flex items-center gap-1.5 transition-all cursor-pointer py-1"
                title="Ver Tutorial do Sistema Worscoi"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Guia de Uso</span>
              </button>
            )}
          </div>

          <button
            type="button"
            id="profile-btn-signout"
            onClick={async () => {
              onClose();
              await signOut();
              if (onOpenAuth) {
                onOpenAuth();
              }
            }}
            className="px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 hover:scale-105 active:scale-95 font-medium flex items-center gap-1.5 cursor-pointer group"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
}

