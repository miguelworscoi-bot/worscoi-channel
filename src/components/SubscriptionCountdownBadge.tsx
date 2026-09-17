'use client';
import React from 'react';
import { Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PLANS } from '@/services/subscriptionService';

interface SubscriptionCountdownBadgeProps {
  onClick?: () => void;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export const SubscriptionCountdownBadge: React.FC<SubscriptionCountdownBadgeProps> = ({
  onClick,
  className = '',
  showIcon = true,
  compact = false,
}) => {
  const { userProfile, isAdmin, countdown } = useAuth();

  if (!userProfile) return null;

  if (isAdmin) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-700 text-zinc-300 select-none ${
          onClick ? 'cursor-pointer hover:border-zinc-500 transition-colors' : ''
        } ${className}`}
        title="Conta com Privilégios Administrativos (Acesso Ilimitado)"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-zinc-300">Admin</span>
        {!compact && <span className="text-zinc-400 font-normal text-[11px]">• Ilimitado</span>}
      </div>
    );
  }

  const planId = userProfile.plan || 'free';
  const planInfo = PLANS[planId];
  const planBadgeText = planInfo?.badge || (planId === 'free' ? 'Teste' : 'Plano');

  let colorClasses = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
  let iconColor = 'text-emerald-400';

  if (countdown.expired) {
    colorClasses = 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse';
    iconColor = 'text-rose-400';
  } else if (countdown.urgency === 'critical') {
    colorClasses = 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse ring-1 ring-rose-500/30';
    iconColor = 'text-rose-400';
  } else if (countdown.urgency === 'warning') {
    colorClasses = 'bg-amber-500/15 border-amber-500/40 text-amber-300';
    iconColor = 'text-amber-400';
  }

  return (
    <button
      type="button"
      id="subscription-countdown-badge"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-all select-none shadow-sm ${colorClasses} ${
        onClick ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'cursor-default'
      } ${className}`}
      title={`Plano: ${userProfile.planName || planBadgeText} • Restam ${countdown.formattedClock} • Clique para gerenciar`}
    >
      {showIcon && (
        countdown.expired ? (
          <AlertTriangle className={`w-3.5 h-3.5 ${iconColor}`} />
        ) : (
          <Clock className={`w-3.5 h-3.5 ${iconColor}`} />
        )
      )}
      {!compact && (
        <span className="text-[11px] font-semibold text-zinc-400 hidden sm:inline">
          {planBadgeText}:
        </span>
      )}
      <span className="tracking-tight">
        {countdown.formattedClock}
      </span>
    </button>
  );
};
