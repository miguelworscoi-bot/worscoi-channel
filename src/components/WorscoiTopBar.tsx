'use client';
import React from 'react';
import {
  Menu,
  KeyRound,
  Crown,
  Shield,
  LogIn,
  Film,
  Tv,
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
  onNavigate,
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
      {/* LADO ESQUERDO: BOTÃO MENU MOBILE + SWITCHER TV / FILMOTECA + TÍTULO DA VIEW */}
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

        {/* CONTROLE SEGMENTADO MODERNO: TV AO VIVO & FILMOTECA */}
        <div className="flex items-center p-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md shadow-inner">
          <button
            type="button"
            id="header-tv-btn"
            onClick={() => onNavigate?.('explorar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'explorar'
                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
            title="TV ao Vivo & Esportes"
          >
            <Tv className={`w-3.5 h-3.5 ${currentView === 'explorar' ? 'text-[#00e676]' : 'text-zinc-400'}`} />
            <span>TV ao Vivo</span>
            {currentView === 'explorar' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            )}
          </button>

          <button
            type="button"
            id="header-filmoteca-btn"
            onClick={() => onNavigate?.('filmoteca')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'filmoteca'
                ? 'bg-[#FF2D55] text-white shadow-sm shadow-[#FF2D55]/40 ring-1 ring-[#FF2D55]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
            title="Filmoteca, Filmes, Séries e IMDb"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Filmoteca VOD</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-300 font-extrabold border border-amber-400/30">
              IMDb
            </span>
          </button>
        </div>

        {currentView !== 'explorar' && currentView !== 'filmoteca' && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-zinc-400 px-2 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <span className="capitalize text-zinc-300 font-bold">
              {currentView === 'painel'
                ? 'Painel de Gestão'
                : 'Assinantes & Chaves'}
            </span>
          </div>
        )}
      </div>

      {/* LADO DIREITO: CRONÔMETRO AO VIVO + BOTÕES DE ATALHO + AVATAR DO USUÁRIO */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* CRONÔMETRO DE ASSINATURA EM TEMPO REAL */}
        <SubscriptionCountdownBadge onClick={onOpenPlans} />

        {/* BOTÃO RESGATAR TOKEN */}
        <button
          type="button"
          onClick={onOpenRedeemToken}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-xs font-bold transition-all cursor-pointer hover-lift shadow-sm"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#FF2D55]" />
          <span>Resgatar Chave</span>
        </button>

        {/* BOTÃO PLANOS */}
        <button
          type="button"
          onClick={onOpenPlans}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/20 hover:from-amber-500/20 hover:to-amber-600/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer hover-lift shadow-sm"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>Planos VIP</span>
        </button>

        {/* ADMIN SHORTCUT SE FOR ADMIN */}
        {isAdmin && onOpenAdminPanel && (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-[#FF2D55] border border-[#FF2D55]/30 text-xs font-bold transition cursor-pointer hover-lift"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
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
