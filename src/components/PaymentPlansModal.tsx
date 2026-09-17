'use client';
import React from 'react';
import { WorscoiPlanSelectionFlow } from './WorscoiPlanSelectionFlow';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionPlanId } from '@/types';

interface PaymentPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRedeemToken?: () => void;
  onCelebration?: (data: {
    userName?: string;
    planName?: string;
    message?: string;
  }) => void;
}

export function PaymentPlansModal({
  isOpen,
  onClose,
  onOpenRedeemToken: _onOpenRedeemToken,
  onCelebration,
}: PaymentPlansModalProps) {
  const { user, userProfile, updateProfilePlan } = useAuth();

  if (!isOpen) return null;

  // Se o usuário selecionou o plano grátis na tela de planos (caso ainda não tenha utilizado)
  const handleSelectFreePlan = async () => {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      updateProfilePlan('free', 'Plano Gratuito (Teste 24h)', expiresAt, null);
      onClose();

      if (onCelebration) {
        onCelebration({
          userName: userProfile?.displayName || 'Assinante',
          planName: 'Plano Grátis de 1 Dia (24 Horas)',
          message:
            'O seu plano gratuito de 1 dia foi ativado com sucesso! Aproveite todas as transmissões ao vivo em HD.',
        });
      }
    } catch {
      onClose();
    }
  };

  // Quando o usuário valida a chave token obtida no WhatsApp (Imagem 10)
  const handleTokenValidated = async (params: {
    plan: SubscriptionPlanId;
    planName: string;
    token: string;
    expiresAt: string | null;
    accumulated?: boolean;
    addedDays?: number;
    remainingDaysTotal?: number;
  }) => {
    updateProfilePlan(
      params.plan,
      params.planName,
      params.expiresAt,
      params.token,
      {
        accumulated: params.accumulated,
        addedDays: params.addedDays,
        remainingDaysTotal: params.remainingDaysTotal,
      }
    );
    onClose();

    if (onCelebration) {
      const celebrationMsg =
        params.accumulated && params.addedDays
          ? `Foram somados +${params.addedDays} dias ao seu limite restante! Agora você tem ${params.remainingDaysTotal} dias de acesso liberado sem limites.`
          : 'A sua chave token foi validada com sucesso e seu plano foi ativado! Aproveite todas as transmissões sem limites.';

      onCelebration({
        userName: userProfile?.displayName || user?.displayName || 'Assinante',
        planName: params.planName,
        message: celebrationMsg,
      });
    }
  };

  return (
    <div
      id="payment-plans-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="payment-plans-modal-card"
        className="relative w-full max-w-md sm:max-w-lg bg-[#050507] border border-zinc-900 rounded-3xl shadow-2xl shadow-black overflow-hidden my-auto min-h-[600px]"
      >
        <WorscoiPlanSelectionFlow
          mode="upgrade"
          userData={{
            name: userProfile?.displayName || user?.displayName || 'Assinante Worscoi',
            email: userProfile?.email || user?.email || '',
            uid: user?.uid || userProfile?.id,
            plan: userProfile?.plan,
            planExpiresAt: userProfile?.planExpiresAt,
            planName: userProfile?.planName,
          }}
          onClose={onClose}
          onSelectFreePlan={handleSelectFreePlan}
          onTokenValidated={handleTokenValidated}
        />
      </div>
    </div>
  );
}
