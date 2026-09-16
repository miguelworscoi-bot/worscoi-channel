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
  onNavigate?: (view: WorscoiView) => void;
  onOpenMobileMenu: () => void;
  onOpenRedeemToken: () => void;
  onOpenPlans: () => void;
  onOpenUserProfile: () => void;
  onOpenAuth: () => void;
  onOpenAdminPanel?: () => void;
  onOpenLanding?: () => void;
}

export function WorscoiTopBar({
  currentView,
  canalAtivo: _canalAtivo,
  onNavigate: _onNavigate,
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
      <div className="flex items-center gap-2 sm:gap-3">
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

        {currentView !== 'explorar' && currentView !== 'filmoteca' && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-zinc-400 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <span className="capitalize text-zinc-300 font-bold">
              {currentView === 'painel'
                ? 'Painel de Gestão'
                : 'Assinantes & Chaves'}
            </span>
          </div>
        )}
      </div>

      {/* LADO DIREITO: CRONÔMETRO AO VIVO / PLANOS + ATALHO CHAVE + AVATAR */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* CRONÔMETRO DE ASSINATURA EM TEMPO REAL (OU PLANOS SE NÃO LOGADO) */}
        {userProfile ? (
          <SubscriptionCountdownBadge onClick={onOpenPlans} />
        ) : (
          <button
            type="button"
            onClick={onOpenPlans}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Planos</span>
          </button>
        )}

        {/* BOTÃO RESGATAR TOKEN */}
        <button
          type="button"
          onClick={onOpenRedeemToken}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 text-xs font-medium transition-all cursor-pointer"
          title="Resgatar chave ou código de acesso"
        >
          <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Resgatar Chave</span>
        </button>

        {/* ADMIN SHORTCUT SE FOR ADMIN */}
        {isAdmin && onOpenAdminPanel && (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-medium transition cursor-pointer"
            title="Painel Administrativo"
          >
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span>Admin</span>
          </button>
        )}

        {/* AVATAR DO USUÁRIO OU ENTRAR */}
        {!isGuestOrNull ? (
          <div
            onClick={onOpenUserProfile}
            className="relative cursor-pointer group"
            title={`Perfil de ${displayName}`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-zinc-800 border border-zinc-700 group-hover:border-zinc-500 transition shadow-sm">
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}
