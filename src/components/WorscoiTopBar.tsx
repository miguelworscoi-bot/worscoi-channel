'use client';
import React from 'react';
import {
  Menu,
  KeyRound,
  Crown,
  Shield,
  LogIn,
  Bell,
} from 'lucide-react';
import { WorscoiLogo } from './WorscoiLogo';
import { SubscriptionCountdownBadge } from './SubscriptionCountdownBadge';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
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
  onOpenNotifications?: () => void;
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
  onOpenNotifications,
}: WorscoiTopBarProps) {
  const { user, userProfile, isAdmin } = useAuth();
  const { unreadCount, openNotifications } = useNotifications();

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
          className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:scale-115 active:scale-90 lg:hidden transition-all duration-200 cursor-pointer shadow-sm"
          title="Abrir menu de canais"
        >
          <Menu className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
        </button>

        <div className="lg:hidden">
          <WorscoiLogo size="sm" />
        </div>

        {currentView !== 'explorar' && currentView !== 'filmoteca' && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-zinc-400 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="capitalize text-zinc-200 font-bold">
              {currentView === 'painel'
                ? 'Painel de Gestão'
                : 'Assinantes & Chaves'}
            </span>
          </div>
        )}
      </div>

      {/* LADO DIREITO: CRONÔMETRO AO VIVO / PLANOS + ATALHO CHAVE + NOTIFICAÇÕES + AVATAR NO ESTILO TIKTOK */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* CRONÔMETRO DE ASSINATURA EM TEMPO REAL (OU PLANOS SE NÃO LOGADO) */}
        {userProfile ? (
          <SubscriptionCountdownBadge onClick={onOpenPlans} />
        ) : (
          <button
            type="button"
            onClick={onOpenPlans}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-amber-400/50 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center transition-all duration-200 group-hover:scale-120 group-hover:rotate-6">
              <Crown className="w-3 h-3 text-amber-400" />
            </div>
            <span>Planos</span>
          </button>
        )}

        {/* BOTÃO RESGATAR TOKEN */}
        <button
          type="button"
          onClick={onOpenRedeemToken}
          className="hidden sm:flex group items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-zinc-700 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          title="Resgatar chave ou código de acesso"
        >
          <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center transition-all duration-200 group-hover:scale-120 group-hover:rotate-12">
            <KeyRound className="w-3 h-3 text-zinc-400 group-hover:text-white" />
          </div>
          <span className="hidden md:inline">Resgatar Chave</span>
        </button>

        {/* ADMIN SHORTCUT SE FOR ADMIN */}
        {isAdmin && onOpenAdminPanel && (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="hidden sm:flex group items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 hover:border-emerald-400/50 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            title="Painel Administrativo"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center transition-all duration-200 group-hover:scale-120 group-hover:-rotate-6">
              <Shield className="w-3 h-3 text-emerald-400" />
            </div>
            <span>Admin</span>
          </button>
        )}

        {/* BOTÃO CENTRAL DE NOTIFICAÇÕES (BÔNUS, EXPIRAÇÃO, ATIVAÇÃO) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenNotifications) {
              onOpenNotifications();
            } else {
              openNotifications();
            }
          }}
          className="relative group p-2 sm:px-2.5 sm:py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
          title={unreadCount > 0 ? `${unreadCount} nova(s) notificação(ões)` : 'Notificações e Avisos'}
        >
          <div className="w-5 h-5 flex items-center justify-center transition-transform duration-200 group-hover:scale-120 group-hover:rotate-12">
            <Bell className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white" />
          </div>
          {unreadCount > 0 && (
            <span className="min-w-4 h-4 px-1 rounded-full bg-[#FF2D55] text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* AVATAR DO USUÁRIO OU ENTRAR */}
        {!isGuestOrNull ? (
          <div
            onClick={onOpenUserProfile}
            className="relative cursor-pointer group"
            title={`Perfil de ${displayName}`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-zinc-800 border border-zinc-700 group-hover:border-[#FF2D55] group-hover:scale-110 group-hover:shadow-[0_0_10px_rgba(255,45,85,0.35)] transition-all duration-200 shadow-sm">
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
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center transition-transform duration-200 group-hover:scale-120 group-hover:translate-x-0.5">
              <LogIn className="w-3.5 h-3.5" />
            </div>
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}
