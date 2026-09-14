'use client';
import React from 'react';
import {
  Menu,
  KeyRound,
  Crown,
  Shield,
  LogIn,
} from 'lucide-react';
import { WorscoiLogo } from './WorscoiLogo';
import { SubscriptionCountdownBadge } from './SubscriptionCountdownBadge';
import { useAuth } from '@/context/AuthContext';
import { WorscoiView, Canal } from '@/types';

interface WorscoiTopBarProps {
  currentView: WorscoiView;
  canalAtivo?: Canal | null;
  onOpenMobileMenu: () => void;
  onOpenRedeemToken: () => void;
  onOpenPlans: () => void;
  onOpenUserProfile: () => void;
  onOpenAuth: () => void;
  onOpenAdminPanel?: () => void;
}

export function WorscoiTopBar({
  currentView,
  canalAtivo: _canalAtivo,
  onOpenMobileMenu,
  onOpenRedeemToken,
  onOpenPlans,
  onOpenUserProfile,
  onOpenAuth,
  onOpenAdminPanel,
}: WorscoiTopBarProps) {
  const { user, userProfile, isAdmin } = useAuth();

  const isGuestOrNull = !user || Boolean('isAnonymous' in user && user.isAnonymous);
  const displayName = userProfile?.displayName || user?.displayName || 'Usuário';
  const avatarUrl =
    userProfile?.photoURL ||
    user?.photoURL ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <header
      className={`w-full flex items-center justify-between px-4 sm:px-8 py-3 select-none z-30 transition-all ${
        currentView === 'explorar'
          ? 'bg-transparent border-b border-zinc-900/30'
          : 'border-b border-zinc-900/80 bg-[#050507]/90 backdrop-blur-md sticky top-0'
      }`}
    >
      {/* LADO ESQUERDO: BOTÃO MENU MOBILE + TÍTULO DA VIEW */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 lg:hidden transition cursor-pointer"
          title="Abrir menu de canais"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <WorscoiLogo size="sm" />
        </div>

        {currentView !== 'explorar' && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span className="capitalize text-zinc-300">
              {currentView === 'painel'
                ? 'Painel de Controle'
                : 'Gestão de Assinantes'}
            </span>
          </div>
        )}
      </div>

      {/* LADO DIREITO: CRONÔMETRO AO VIVO + BOTÕES DE ATALHO + AVATAR DO USUÁRIO */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* CRONÔMETRO DE ASSINATURA EM TEMPO REAL */}
        <SubscriptionCountdownBadge onClick={onOpenPlans} />

        {currentView !== 'explorar' && (
          <>
            {/* BOTÃO RESGATAR TOKEN */}
            <button
              type="button"
              onClick={onOpenRedeemToken}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#FF2D55]" />
              <span>Resgatar Chave</span>
            </button>

            {/* BOTÃO PLANOS */}
            <button
              type="button"
              onClick={onOpenPlans}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Planos VIP</span>
            </button>

            {/* ADMIN SHORTCUT SE FOR ADMIN */}
            {isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-[#FF2D55] border border-[#FF2D55]/30 text-xs font-bold transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </>
        )}

        {/* AVATAR DO USUÁRIO (EXATAMENTE NO CANTO SUPERIOR DIREITO COMO NA REFERÊNCIA) */}
        {!isGuestOrNull ? (
          <div
            onClick={onOpenUserProfile}
            className="relative cursor-pointer group"
            title={`Perfil de ${displayName}`}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#FF2D55] via-purple-500 to-amber-400 group-hover:scale-105 transition shadow-md shadow-[#FF2D55]/20">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full rounded-full object-cover bg-zinc-900"
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white font-bold text-xs shadow-md shadow-[#FF2D55]/20 transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}
