'use client';
import React from 'react';
import {
  X,
  User as UserIcon,
  CreditCard,
  Clock,
  KeyRound,
  CheckCircle2,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PLANS } from '@/services/subscriptionService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenRedeemToken?: () => void;
  onOpenAuth?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  onOpenPaymentPlans,
  onOpenRedeemToken,
  onOpenAuth,
}: UserProfileModalProps) {
  const { user, userProfile, signOut, countdown, isAdmin, deviceTrial } = useAuth();

  if (!isOpen) return null;

  const currentPlanId = userProfile?.plan || 'free';
  const planInfo = PLANS[currentPlanId] || PLANS.free;
  const isExpired = countdown.expired && !isAdmin;

  return (
    <div
      id="user-profile-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="user-profile-modal"
        className="relative w-full max-w-lg bg-[#0b0b10] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/90 ring-1 ring-white/10 my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00E676] shrink-0 font-bold text-lg">
              {userProfile?.displayName?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() || <UserIcon className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Minha Conta de Assinante
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Espectador
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Detalhes do seu perfil, plano contratado e validade do acesso.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-user-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DETALHES DO USUÁRIO */}
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Nome de Exibição</span>
              <span className="font-bold text-white">
                {userProfile?.displayName || 'Espectador Esportivo'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Identificação / E-mail</span>
              <span className="font-mono text-zinc-300">
                {userProfile?.email || user?.email || 'espectador@playsports.tv'}
              </span>
            </div>
            {userProfile?.createdAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Membro desde</span>
                <span className="text-zinc-300">
                  {new Date(userProfile.createdAt).toLocaleDateString('pt-AO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* STATUS DO PLANO */}
          <div
            className={`p-4 rounded-2xl border ${
              isExpired
                ? 'bg-red-950/20 border-red-500/40'
                : 'bg-gradient-to-br from-emerald-950/30 to-zinc-900/60 border-emerald-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isExpired
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-emerald-500/20 text-[#00E676] border border-emerald-500/40'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white">{planInfo.name}</h3>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase border ${planInfo.badgeBg} ${planInfo.badgeText} ${planInfo.badgeBorder}`}
                    >
                      {planInfo.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {planInfo.priceFormatted} • Duração:{' '}
                    {planInfo.durationDays ? `${planInfo.durationDays} dias` : 'Vitalício'}
                  </p>
                </div>
              </div>

              {isExpired ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse shrink-0">
                  Expirado
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativo
                </span>
              )}
            </div>

            {/* TEMPO RESTANTE & CRONÔMETRO EM TEMPO REAL */}
            <div className="mt-3 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Tempo Restante (Em Tempo Real):</span>
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    isExpired
                      ? 'bg-red-500/20 text-red-400'
                      : countdown.urgency === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                      : countdown.urgency === 'warning'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isExpired ? '00:00:00 (Expirado)' : countdown.formattedClock}
                </span>
              </div>

              {/* MOSTRADOR DIGITAL SEGUNDO A SEGUNDO */}
              {!isAdmin && !isExpired && (
                <div className="grid grid-cols-4 gap-2 bg-black/40 border border-zinc-800 rounded-xl p-2.5 text-center my-2">
                  <div className="bg-zinc-900/80 rounded-lg py-1 px-1 border border-zinc-800/80">
                    <div className="font-mono text-base font-black text-white">{countdown.days}</div>
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Dias</div>
                  </div>
                  <div className="bg-zinc-900/80 rounded-lg py-1 px-1 border border-zinc-800/80">
                    <div className="font-mono text-base font-black text-white">
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Horas</div>
                  </div>
                  <div className="bg-zinc-900/80 rounded-lg py-1 px-1 border border-zinc-800/80">
                    <div className="font-mono text-base font-black text-white">
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Minutos</div>
                  </div>
                  <div className="bg-zinc-900/80 rounded-lg py-1 px-1 border border-zinc-800/80">
                    <div className="font-mono text-base font-black text-emerald-400">
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Segundos</div>
                  </div>
                </div>
              )}

              {/* REGRA: MESMO COM LOGOUT O RELÓGIO CONTINUA A CONTAR */}
              <div className="text-[11px] text-zinc-400 leading-snug flex items-center gap-1.5 mt-2 bg-zinc-900/40 p-2 rounded-lg border border-zinc-850">
                <span className="text-amber-400 shrink-0">⏱️</span>
                <span>
                  O cronômetro sincroniza em tempo real contínuo: mesmo se você fechar a aba ou fizer logout, a contagem de tempo segue correndo ininterruptamente.
                </span>
              </div>

              {/* STATUS DO DISPOSITIVO (1 ACESSO POR APARELHO) */}
              {deviceTrial && (
                <div className="mt-2 text-[10px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      Dispositivo:{' '}
                      <span className="font-mono text-zinc-300">
                        {deviceTrial.trialRecord?.deviceId
                          ? `${deviceTrial.trialRecord.deviceId.slice(0, 14)}...`
                          : 'Aparelho Registrado'}
                      </span>
                    </span>
                  </div>
                  <span className={deviceTrial.isExpired ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {deviceTrial.isExpired ? 'Teste Concluído' : 'Dispositivo Ativo'}
                  </span>
                </div>
              )}
            </div>

            {userProfile?.activatedToken && (
              <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Token ativado: </span>
                <span className="font-mono font-bold text-emerald-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  {userProfile.activatedToken}
                </span>
              </div>
            )}
          </div>

          {/* AÇÕES PARA O ESPECTADOR (RENOVAR OU ATIVAR TOKEN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {onOpenPaymentPlans && (
              <button
                type="button"
                id="profile-btn-plans"
                onClick={() => {
                  onClose();
                  onOpenPaymentPlans();
                }}
                className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{isExpired ? 'Renovar Plano' : 'Ver Planos & Pagamento'}</span>
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
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
              >
                <KeyRound className="w-4 h-4 text-[#00E676]" />
                <span>Ativar Código (5 Dígitos)</span>
              </button>
            )}
          </div>
        </div>

        {/* RODAPÉ COM SAIR DA CONTA */}
        <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Encerrar Sessão</span>
            </button>

            {onOpenAuth && (
              <button
                type="button"
                id="profile-btn-switch"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition cursor-pointer"
              >
                Trocar de Conta
              </button>
            )}
          </div>

          <button
            type="button"
            id="profile-btn-close"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-750 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
