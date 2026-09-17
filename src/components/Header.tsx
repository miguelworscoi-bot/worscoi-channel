'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Star,
  Plus,
  Radio,
  X,
  ArrowRight,
  LogOut,
  User as UserIcon,
  Crown,
  KeyRound,
  Users,
  CreditCard,
  Leaf,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Canal, FiltroAtivo, LatencyMode } from '@/types';
import { getChannelQuality, getNetworkBadge, getSportTag } from '@/utils/channelUtils';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';
import { useAuth } from '@/context/AuthContext';
import { PLANS, isUserPlanExpired, getRemainingPlanTime } from '@/services/subscriptionService';

interface HeaderProps {
  filtroAtivo: FiltroAtivo;
  onSelectFiltro: (filtro: FiltroAtivo) => void;
  totalFavoritos: number;
  onOpenAddChannel: () => void;
  onOpenAdminPanel: () => void;
  onOpenSubscribers?: () => void;
  onOpenRedeemToken: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenUserProfile?: () => void;
  onOpenAuth?: () => void;
  todosCanais: Canal[];
  onSelectCanal: (canal: Canal) => void;
  latencyMode?: LatencyMode;
  onToggleLatencyMode?: (mode?: LatencyMode) => void;
}

export function Header({
  filtroAtivo,
  onSelectFiltro,
  totalFavoritos,
  onOpenAddChannel,
  onOpenAdminPanel,
  onOpenSubscribers,
  onOpenRedeemToken,
  onOpenPaymentPlans,
  onOpenUserProfile,
  onOpenAuth,
  todosCanais,
  onSelectCanal,
  latencyMode,
  onToggleLatencyMode,
}: HeaderProps) {
  const { user, userProfile, isAdmin, signOut } = useAuth();
  const isPlanExpired = !isAdmin && isUserPlanExpired(userProfile);
  const remainingTime = getRemainingPlanTime(userProfile);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl/Cmd + K or '/')
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement !== inputRef.current)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsDropdownOpen(true);
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered preview channels for dropdown
  const filteredInstantChannels = searchQuery.trim()
    ? todosCanais
        .filter((c) => {
          const q = searchQuery.toLowerCase();
          return (
            c.nome.toLowerCase().includes(q) ||
            (c.rede && c.rede.toLowerCase().includes(q)) ||
            (c.grupo && c.grupo.toLowerCase().includes(q)) ||
            getSportTag(c).toLowerCase().includes(q)
          );
        })
        .slice(0, 7)
    : [];

  const handleSelectSearchResult = (canal: Canal) => {
    onSelectCanal(canal);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-zinc-800/80 transition-all"
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E676] to-emerald-600 text-black font-black shadow-lg shadow-[#00E676]/20 ring-1 ring-[#00E676]/50 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  PLAY<span className="text-[#00E676] drop-shadow-[0_0_12px_rgba(0,230,118,0.4)]">SPORTS</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-normal hidden sm:block">
                TV e Esportes Ao Vivo
              </p>
            </div>
          </div>
        </div>

        {/* BUSCA GLOBAL CENTRALIZADA COM DROPDOWN INTELIGENTE */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#00E676] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              id="global-search-input"
              type="text"
              placeholder="Buscar canal, emissora ou modalidade esportiva..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-[#121214] border border-zinc-800/90 hover:border-zinc-700 focus:border-[#00E676] rounded-xl pl-10 pr-16 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 pointer-events-none">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="pointer-events-auto text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-normal text-zinc-400 bg-zinc-900 border border-zinc-800 rounded">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* DROPDOWN DE RESULTADOS INSTANTÂNEOS */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div
              id="global-search-dropdown"
              className="absolute left-0 right-0 mt-2 bg-[#121214] border border-zinc-800/90 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="p-2 border-b border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-3">
                <span>Resultados correspondentes ({filteredInstantChannels.length})</span>
                <span className="text-zinc-500 text-[10px]">Clique para sintonizar</span>
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/40">
                {filteredInstantChannels.length > 0 ? (
                  filteredInstantChannels.map((c) => {
                    const quality = getChannelQuality(c);
                    const badge = getNetworkBadge(c);
                    const sport = getSportTag(c);

                    return (
                      <div
                        key={c.id || c.url}
                        onClick={() => handleSelectSearchResult(c)}
                        className="flex items-center justify-between gap-3 p-2.5 hover:bg-zinc-800/60 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getChannelLogo(c)}
                            alt={c.nome}
                            className="w-9 h-9 rounded-lg object-contain bg-zinc-950 p-0.5 border border-zinc-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getChannelFallbackLogo(c);
                            }}
                          />
                          <div className="truncate">
                            <p className="text-sm font-bold text-zinc-100 group-hover:text-[#00E676] truncate transition-colors tracking-tight">
                              {c.nome}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] font-normal text-zinc-400">
                              <span className="text-zinc-300">{badge.label}</span>
                              <span>•</span>
                              <span className="text-zinc-400">{sport}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                            {quality}
                          </span>
                          <span className="text-[10px] font-bold text-[#00E676] opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                            Assistir <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    Nenhum canal encontrado para &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS: ASSINANTES + ADMIN PANEL + NOVO CANAL + ATIVAR TOKEN + FAVORITOS + SESSÃO + LOGOUT */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Botão Meus Assinantes (Exclusivo Admin) */}
          {isAdmin && onOpenSubscribers ? (
            <button
              type="button"
              id="header-my-subscribers-btn"
              onClick={onOpenSubscribers}
              className="text-xs px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
              title="Ver Meus Assinantes, Planos Ativos e Gerador de Tokens"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Meus Assinantes</span>
            </button>
          ) : null}

          {/* Botão Painel Admin (Apenas e estritamente para Administrador) */}
          {isAdmin && (
            <button
              type="button"
              id="header-admin-panel-btn"
              onClick={onOpenAdminPanel}
              className="text-xs px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
              title="Abrir Painel Administrativo de Gestão e Métricas"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Painel Admin</span>
            </button>
          )}

          {/* Botão Planos & Formas de Pagamento (Multicaixa Express & PayPay: 942472983) */}
          {onOpenPaymentPlans && (
            <button
              type="button"
              id="header-payment-plans-btn"
              onClick={onOpenPaymentPlans}
              className={`text-xs px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 ${
                isPlanExpired
                  ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
              title="Ver Planos Esportivos e Pagamento via Multicaixa Express ou PayPay (Nº 942 472 983)"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {isPlanExpired ? 'Renovar Plano' : 'Planos & Pagamentos'}
              </span>
              <span className="sm:hidden">
                {isPlanExpired ? 'Expirou' : 'Planos'}
              </span>
            </button>
          )}

          {/* Botão Ativar Código de Acesso / Token */}
          <button
            type="button"
            id="header-redeem-token-btn"
            onClick={onOpenRedeemToken}
            className="text-xs px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00E676] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
            title="Ativar código de 5 caracteres para desbloquear planos esportivos"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#00E676]" />
            <span className="hidden sm:inline">Ativar Token</span>
          </button>

          {/* Botão Adicionar Canal (Exclusivo ou indicado para Admin) */}
          {isAdmin ? (
            <button
              type="button"
              id="header-add-channel-btn"
              onClick={onOpenAddChannel}
              className="text-xs px-3 py-2 rounded-xl border border-[#00E676]/40 bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
              title="Cadastrar canal personalizado HLS"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo Canal</span>
            </button>
          ) : null}

          {/* Botão de Economia de Dados & Desempenho de Rede */}
          {latencyMode && onToggleLatencyMode && (
            <button
              type="button"
              id="header-data-saver-pill"
              onClick={() => onToggleLatencyMode()}
              className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 ${
                latencyMode === 'economy'
                  ? 'bg-emerald-500/15 border-[#00E676]/60 text-[#00E676] font-bold shadow-emerald-950/30 ring-1 ring-[#00E676]/30'
                  : latencyMode === 'stable'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-semibold hover:bg-cyan-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-500/20'
              }`}
              title={
                latencyMode === 'economy'
                  ? 'Modo Economia de Dados ATIVO (Poupa até 75% de internet). Clique para alternar.'
                  : latencyMode === 'stable'
                  ? 'Modo Equilibrado HD (Buffer 14s). Clique para alternar.'
                  : 'Modo Baixa Latência (Tempo Real). Clique para alternar.'
              }
            >
              {latencyMode === 'economy' ? (
                <>
                  <Leaf className="w-3.5 h-3.5 text-[#00E676]" />
                  <span className="hidden md:inline">Poupar Internet</span>
                  <span className="md:hidden">Poupar</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#00E676] text-black">
                    -75%
                  </span>
                </>
              ) : latencyMode === 'stable' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Modo HD</span>
                  <span className="md:hidden">HD</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Ao Vivo</span>
                  <span className="md:hidden">Live</span>
                </>
              )}
            </button>
          )}

          {/* Pill de Favoritos com Contador e Glow */}
          <button
            type="button"
            id="header-favorites-pill"
            onClick={() => onSelectFiltro(filtroAtivo === 'Favoritos' ? 'Todos' : 'Favoritos')}
            className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer select-none ${
              filtroAtivo === 'Favoritos'
                ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-500/20 glow-amber-sm'
                : 'bg-[#121214] text-amber-300 border-zinc-800/90 hover:border-amber-500/50 hover:bg-zinc-800/40'
            }`}
            title="Filtrar canais favoritos"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filtroAtivo === 'Favoritos'
                  ? 'fill-black text-black'
                  : 'fill-amber-400 text-amber-400'
              }`}
            />
            <span className="font-semibold hidden sm:inline">Favoritos</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                filtroAtivo === 'Favoritos'
                  ? 'bg-black/20 text-black'
                  : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
              }`}
            >
              {totalFavoritos}
            </span>
          </button>

          {/* Status HLS Pulse */}
          <div
            className="hidden xl:flex items-center gap-2 bg-[#121214] border border-zinc-800/90 rounded-xl px-3 py-1.5 text-xs select-none"
            title="Transmissão ao vivo HLS com failover automático ativo"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
            </span>
            <span className="text-[11px] font-bold text-zinc-300 tracking-wider uppercase">
              HLS LIVE
            </span>
          </div>

          {/* User Account / Badge de Role & Plano / Sair */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-zinc-800">
              <button
                type="button"
                id="header-user-profile-badge"
                onClick={isAdmin ? onOpenAdminPanel : onOpenUserProfile}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
                title={`Sessão: ${isAdmin ? 'Administrador' : 'Assinante / Espectador'} (${userProfile?.displayName || user.email}) • Plano: ${PLANS[userProfile?.plan || 'free']?.name}. Clique para abrir seu perfil.`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                      : 'bg-[#00E676]/20 text-[#00E676] ring-1 ring-[#00E676]/40'
                  }`}
                >
                  {userProfile?.displayName?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() || <UserIcon className="w-3 h-3" />}
                </div>
                <div className="hidden lg:flex items-center gap-1.5">
                  <span className="max-w-[80px] truncate font-medium">
                    {userProfile?.displayName || user.email?.split('@')[0]}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-amber-400 text-black'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isAdmin ? 'ADMIN' : 'USUÁRIO'}
                  </span>
                  {isPlanExpired ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                      EXPIRADO
                    </span>
                  ) : userProfile?.plan && userProfile.plan !== 'free' ? (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${
                        PLANS[userProfile.plan]?.badgeBg
                      } ${PLANS[userProfile.plan]?.badgeText} ${PLANS[userProfile.plan]?.badgeBorder}`}
                    >
                      {PLANS[userProfile.plan]?.badge}
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {remainingTime.text}
                    </span>
                  )}
                </div>
              </button>

              <button
                type="button"
                id="header-signout-btn"
                onClick={() => signOut()}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!user && (
            <button
              type="button"
              id="header-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold text-xs transition-all shadow-md shadow-[#00E676]/20 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
