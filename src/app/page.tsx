'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { Canal, LatencyMode, WorscoiView, FiltroAtivo } from '@/types';
import { Tv } from 'lucide-react';
import { LOCAL_STORAGE_LATENCY_KEY } from '@/utils/streamUtils';
import { CANAIS_PADRAO } from '@/app/api/canais/route';
import { WorscoiSidebar } from '@/components/WorscoiSidebar';
import { WorscoiTopBar } from '@/components/WorscoiTopBar';
import { PlayerHero } from '@/components/PlayerHero';
import { WorscoiControlPanel } from '@/components/WorscoiControlPanel';
import { WorscoiSubscribersView } from '@/components/WorscoiSubscribersView';
import { WorscoiFilmotecaView } from '@/components/WorscoiFilmotecaView';
import { WorscoiLoginModal } from '@/components/WorscoiLoginModal';
import { CinemaPlayer } from '@/components/CinemaPlayer';
import { AddChannelModal } from '@/components/AddChannelModal';
import { AdminPanelModal } from '@/components/AdminPanelModal';
import { SubscribersModal } from '@/components/SubscribersModal';
import { RedeemTokenModal } from '@/components/RedeemTokenModal';
import { PaymentPlansModal } from '@/components/PaymentPlansModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { SubscriptionExpiredModal } from '@/components/SubscriptionExpiredModal';
import { FreePlanBlockedModal } from '@/components/FreePlanBlockedModal';
import { CongratulationsNotification } from '@/components/CongratulationsNotification';
import { LandingScreen } from '@/components/LandingScreen';
import { useAuth } from '@/context/AuthContext';
import { autoplayQueueService } from '@/services/autoplayQueueService';

const LOCAL_STORAGE_FAVORITES_KEY = 'playsports_favorites';
const LOCAL_STORAGE_CUSTOM_KEY = 'playsports_custom_channels';

export default function Home() {
  const {
    user,
    isAdmin,
    signOut,
    isAccountClosedDueToExpiration,
    closeExpiredNotice,
    isFreePlanBlocked,
    freePlanBlockedDetails,
    closeFreePlanBlockedAlert,
  } = useAuth();
  const [currentView, setCurrentView] = useState<WorscoiView>('explorar');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasVisitedFilmoteca, setHasVisitedFilmoteca] = useState(false);

  // Mantém Filmoteca pré-carregada na memória após primeira visita para transição instantânea
  useEffect(() => {
    if (currentView === 'filmoteca') {
      setHasVisitedFilmoteca(true);
    }
  }, [currentView]);

  const [canais, setCanais] = useState<Canal[]>(CANAIS_PADRAO);
  const [customChannels, setCustomChannels] = useState<Canal[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<Canal | null>(CANAIS_PADRAO[0] || null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtivo>('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [failoverNotice, setFailoverNotice] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(false);
  const [latencyMode, setLatencyMode] = useState<LatencyMode>('economy');
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  // Modais do sistema
  const [isLandingOpen, setIsLandingOpen] = useState<boolean>(() => {
    try {
      const entered = sessionStorage.getItem('playsports_landing_entered');
      return entered !== 'true';
    } catch {
      return true;
    }
  });
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMiniPlayerDismissed, setIsMiniPlayerDismissed] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    userName?: string;
    planName?: string;
    message?: string;
  } | null>(null);

  // Carrega favoritos e canais personalizados do localStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
      if (storedFavs) {
        const parsed = JSON.parse(storedFavs);
        if (Array.isArray(parsed)) setFavorites(parsed);
      }

      const storedCustom = localStorage.getItem(LOCAL_STORAGE_CUSTOM_KEY);
      if (storedCustom) {
        const parsedCustom = JSON.parse(storedCustom);
        if (Array.isArray(parsedCustom)) setCustomChannels(parsedCustom);
      }

      const storedLatency =
        localStorage.getItem(LOCAL_STORAGE_LATENCY_KEY) ||
        localStorage.getItem('futebol_ao_vivo_latency_mode');
      if (
        storedLatency === 'economy' ||
        storedLatency === 'stable' ||
        storedLatency === 'low-latency'
      ) {
        setLatencyMode(storedLatency);
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    }
  }, []);

  // Carrega lista atualizada de canais da API
  useEffect(() => {
    fetch('/api/canais')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const seenIds = new Set<string>();
          const seenUrls = new Set<string>();
          const clean: Canal[] = [];
          for (const item of data) {
            const idKey = (item.id || '').trim();
            const urlKey = (item.url || '').trim().toLowerCase();
            if (idKey && seenIds.has(idKey)) continue;
            if (urlKey && seenUrls.has(urlKey)) continue;
            if (idKey) seenIds.add(idKey);
            if (urlKey) seenUrls.add(urlKey);
            clean.push(item);
          }
          setCanais(clean);
          setCanalAtivo((prev) => prev || clean[0]);
        }
      })
      .catch(() => {
        // Mantém CANAIS_PADRAO já carregados
      });
  }, []);

  // Combina canais personalizados com os canais da API sem IDs duplicados
  const todosCanais = useMemo(() => {
    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();
    const result: Canal[] = [];
    for (const c of [...customChannels, ...canais]) {
      const idKey = (c.id || '').trim();
      const urlKey = (c.url || '').trim().toLowerCase();
      if (idKey && seenIds.has(idKey)) continue;
      if (urlKey && seenUrls.has(urlKey)) continue;
      if (idKey) seenIds.add(idKey);
      if (urlKey) seenUrls.add(urlKey);
      result.push(c);
    }
    return result;
  }, [customChannels, canais]);

  // Garante que haja um canal ativo
  useEffect(() => {
    if (!canalAtivo && todosCanais.length > 0) {
      setCanalAtivo(todosCanais[0]);
    }
  }, [todosCanais, canalAtivo]);

  // Checa se o canal está favoritado
  const isCanalFavorited = useCallback(
    (canal?: Canal | null): boolean => {
      if (!canal) return false;
      if (canal.id && favorites.includes(canal.id)) return true;
      if (canal.url && favorites.includes(canal.url)) return true;
      return false;
    },
    [favorites]
  );

  // Toggle favorito com persistência
  const toggleFavorite = useCallback((canal: Canal) => {
    setTimeout(() => {
      const chave = canal.id || canal.url;
      setFavorites((prev) => {
        const isFav =
          (canal.id && prev.includes(canal.id)) ||
          (canal.url && prev.includes(canal.url));

        const nextFavorites = isFav
          ? prev.filter((u) => u !== canal.id && u !== canal.url)
          : [...prev, chave];

        try {
          localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(nextFavorites));
        } catch {
          // Ignora erro
        }
        return nextFavorites;
      });
    }, 0);
  }, []);

  // Troca de canal ativo
  const handleSelectCanal = useCallback((canal: Canal) => {
    setTimeout(() => {
      setCanalAtivo((prev) => {
        const isSame = prev
          ? prev.id && canal.id
            ? prev.id === canal.id
            : prev.url === canal.url
          : false;

        if (isSame) return prev;
        return canal;
      });
      setStreamIndex(0);
      setFailoverNotice(null);
      setIsMobileMenuOpen(false);
      setIsMiniPlayerDismissed(false);
    }, 0);
  }, []);

  // Navegação de canais (Zapping Anterior / Próximo)
  const currentCanalIndex = todosCanais.findIndex(
    (c) => (canalAtivo?.id && c.id ? c.id === canalAtivo.id : c.url === canalAtivo?.url)
  );

  const handleNextCanal = useCallback(() => {
    setTimeout(() => {
      if (todosCanais.length === 0) return;
      const nextIdx = (currentCanalIndex + 1) % todosCanais.length;
      handleSelectCanal(todosCanais[nextIdx]);
    }, 0);
  }, [currentCanalIndex, todosCanais, handleSelectCanal]);

  const handlePrevCanal = useCallback(() => {
    setTimeout(() => {
      if (todosCanais.length === 0) return;
      const prevIdx = (currentCanalIndex - 1 + todosCanais.length) % todosCanais.length;
      handleSelectCanal(todosCanais[prevIdx]);
    }, 0);
  }, [currentCanalIndex, todosCanais, handleSelectCanal]);

  // Failover automático quando o player dispara erro
  const handlePlayerError = useCallback(() => {
    setTimeout(() => {
      if (!canalAtivo) return;
      const streams = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
      const isYouTube =
        canalAtivo.categoria === 'YouTube' ||
        canalAtivo.rede === 'YouTube' ||
        canalAtivo.url.includes('youtube.com') ||
        canalAtivo.url.includes('youtu.be');

      if (isYouTube) {
        const nextIndex = streamIndex + 1;
        if (nextIndex < streams.length) {
          setFailoverNotice(
            `Alternando para vídeo alternativo (${nextIndex + 1}/${streams.length})...`
          );
          setStreamIndex(nextIndex);
          setTimeout(() => setFailoverNotice(null), 4000);
        } else {
          setFailoverNotice('Vídeo com restrição no player.');
        }
        return;
      }

      if (!useProxy) {
        setFailoverNotice('Sinal direto instável. Ativando conexão protegida...');
        setUseProxy(true);
        setTimeout(() => setFailoverNotice(null), 4000);
        return;
      }

      const nextIndex = streamIndex + 1;
      if (nextIndex < streams.length) {
        setFailoverNotice(
          `Alternando para o servidor reserva (${nextIndex + 1}/${streams.length})...`
        );
        setStreamIndex(nextIndex);
        setTimeout(() => setFailoverNotice(null), 4000);
      } else {
        setFailoverNotice('Sintonizando próximo canal...');
        setTimeout(() => {
          setFailoverNotice(null);
          handleNextCanal();
        }, 1500);
      }
    }, 0);
  }, [canalAtivo, streamIndex, useProxy, handleNextCanal]);

  const handleVideoEnded = useCallback(() => {
    if (!canalAtivo) return;
    if (autoplayQueueService.isAutoplayEnabled()) {
      const nextItem = autoplayQueueService.peekNextVideo(canalAtivo, streamIndex, todosCanais);
      if (nextItem) {
        if (nextItem.canal.id === canalAtivo.id && typeof nextItem.streamIndex === 'number') {
          setStreamIndex(nextItem.streamIndex);
          return;
        }
        handleSelectCanal(nextItem.canal);
        if (typeof nextItem.streamIndex === 'number') {
          setTimeout(() => setStreamIndex(nextItem.streamIndex), 50);
        }
        return;
      }
    }
    const streams = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
    if (streamIndex < streams.length - 1) {
      setStreamIndex(streamIndex + 1);
    } else {
      handleNextCanal();
    }
  }, [canalAtivo, streamIndex, todosCanais, handleSelectCanal, handleNextCanal]);

  // Alterna o modo de latência e consumo de dados
  const handleToggleLatencyMode = useCallback((forcedMode?: LatencyMode) => {
    setTimeout(() => {
      setLatencyMode((current) => {
        const nextMode: LatencyMode =
          forcedMode ||
          (current === 'economy'
            ? 'stable'
            : current === 'stable'
            ? 'low-latency'
            : 'economy');
        try {
          localStorage.setItem(LOCAL_STORAGE_LATENCY_KEY, nextMode);
        } catch {
          // Ignora erro
        }
        return nextMode;
      });
    }, 0);
  }, []);

  const handleDeleteCustomChannel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCustom = customChannels.filter((c) => c.id !== id);
    setCustomChannels(nextCustom);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(nextCustom));
    } catch {
      // Ignora erro
    }
  };

  const handleStreamChange = useCallback((idx: number) => {
    setTimeout(() => {
      setStreamIndex(idx);
    }, 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    setTimeout(() => {
      setIsMuted((prev) => !prev);
    }, 0);
  }, []);

  const handleToggleProxy = useCallback(() => {
    setTimeout(() => {
      setUseProxy((prev) => !prev);
    }, 0);
  }, []);

  const handleClearFailoverNotice = useCallback(() => {
    setTimeout(() => {
      setFailoverNotice(null);
    }, 0);
  }, []);

  const handleAddStreamToCanal = useCallback((url: string) => {
    setTimeout(() => {
      if (!canalAtivo) return;
      const currentBackups = canalAtivo.backupUrls || [];
      if (!currentBackups.includes(url) && canalAtivo.url !== url) {
        const updatedCanal: Canal = {
          ...canalAtivo,
          backupUrls: [...currentBackups, url],
        };
        setCanalAtivo(updatedCanal);
        const newIndex = updatedCanal.backupUrls!.length;
        setStreamIndex(newIndex);
      }
    }, 0);
  }, [canalAtivo]);

  const handleEnterPlayer = useCallback(
    (canal?: Canal) => {
      if (canal) {
        handleSelectCanal(canal);
      }
      setIsLandingOpen(false);
      try {
        sessionStorage.setItem('playsports_landing_entered', 'true');
      } catch {
        // Ignora erro
      }
    },
    [handleSelectCanal]
  );

  const handleOpenLoginModal = (mode: 'login' | 'register' = 'login') => {
    setLoginModalMode(mode);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsLandingOpen(false);
    try {
      sessionStorage.setItem('playsports_landing_entered', 'true');
    } catch {
      // Ignora erro
    }
  }, []);

  // Se o usuário estiver autenticado (não convidado espectador), avança para o app
  useEffect(() => {
    if (user && user.email && user.email !== 'espectador@playsports.tv' && !user.isAnonymous) {
      setIsLandingOpen(false);
      try {
        sessionStorage.setItem('playsports_landing_entered', 'true');
      } catch {
        // Ignora erro
      }
    }
  }, [user]);

  // Se o usuário não for administrador, não tem acesso às telas de painel ou assinantes
  useEffect(() => {
    if (!isAdmin && (currentView === 'painel' || currentView === 'assinantes')) {
      setCurrentView('explorar');
    }
  }, [isAdmin, currentView]);

  const handleLogout = () => {
    signOut();
    setIsLandingOpen(true);
    setLoginModalMode('login');
    setIsLoginModalOpen(true);
    try {
      sessionStorage.removeItem('playsports_landing_entered');
    } catch {
      // Ignora erro
    }
  };

  if (isLandingOpen) {
    return (
      <main className="min-h-screen w-full bg-[#050508] text-zinc-100 antialiased font-sans">
        <LandingScreen
          onEnterPlayer={handleEnterPlayer}
          onOpenLogin={() => handleOpenLoginModal('login')}
          onOpenRegister={() => handleOpenLoginModal('register')}
          onOpenPlans={() => setIsPaymentModalOpen(true)}
          onOpenRedeemToken={() => setIsRedeemModalOpen(true)}
          featuredChannels={todosCanais}
        />

        {/* MODAL WORSCOI DE LOGIN */}
        <WorscoiLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          initialMode={loginModalMode}
          onLoginSuccess={handleLoginSuccess}
          onCelebration={(data) => {
            setIsLandingOpen(false);
            try {
              sessionStorage.setItem('playsports_landing_entered', 'true');
            } catch {
              // Ignora erro
            }
            setCelebrationData({ isOpen: true, ...data });
          }}
        />

        {/* MODAL DE PLANOS E PAGAMENTO */}
        <PaymentPlansModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onOpenRedeemToken={() => {
            setIsPaymentModalOpen(false);
            setIsRedeemModalOpen(true);
          }}
          onCelebration={(data) => {
            setIsLandingOpen(false);
            try {
              sessionStorage.setItem('playsports_landing_entered', 'true');
            } catch {
              // Ignora erro
            }
            setCelebrationData({ isOpen: true, ...data });
          }}
        />

        {/* MODAL DE RESGATE DE TOKEN */}
        <RedeemTokenModal
          isOpen={isRedeemModalOpen}
          onClose={() => setIsRedeemModalOpen(false)}
        />

        {/* NOTIFICAÇÃO DE PARABÉNS PELO PLANO ATIVADO */}
        {celebrationData && (
          <CongratulationsNotification
            isOpen={celebrationData.isOpen}
            onClose={() => setCelebrationData(null)}
            userName={celebrationData.userName}
            planName={celebrationData.planName}
            message={celebrationData.message}
          />
        )}
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#070709] text-zinc-100 antialiased font-sans">
      {/* SIDEBAR WORSCOI DESKTOP COM OS CANAIS REAIS */}
      <div className="hidden lg:block shrink-0 h-full">
        <WorscoiSidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          todosCanais={todosCanais}
          canalAtivo={canalAtivo}
          onSelectCanal={handleSelectCanal}
          onLogout={handleLogout}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          filtroAtivo={filtroAtivo}
          onSelectFiltro={setFiltroAtivo}
          customChannels={customChannels}
          onDeleteCustomChannel={handleDeleteCustomChannel}
          isAdmin={isAdmin}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* DRAWER DA SIDEBAR NO MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-[#050507] z-10 animate-in slide-in-from-left duration-200">
            <WorscoiSidebar
              currentView={currentView}
              onNavigate={(view) => {
                setCurrentView(view);
                setIsMobileMenuOpen(false);
              }}
              todosCanais={todosCanais}
              canalAtivo={canalAtivo}
              onSelectCanal={handleSelectCanal}
              onLogout={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              filtroAtivo={filtroAtivo}
              onSelectFiltro={setFiltroAtivo}
              customChannels={customChannels}
              onDeleteCustomChannel={handleDeleteCustomChannel}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO PRINCIPAL DIREITA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[#070709]">
        {/* BARRA SUPERIOR COM AVATAR DO USUÁRIO E ATALHOS */}
        <WorscoiTopBar
          currentView={currentView}
          canalAtivo={canalAtivo}
          onNavigate={(view) => setCurrentView(view)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenRedeemToken={() => setIsRedeemModalOpen(true)}
          onOpenPlans={() => setIsPaymentModalOpen(true)}
          onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
          onOpenAuth={() => handleOpenLoginModal('login')}
          onOpenAdminPanel={isAdmin ? () => setIsAdminPanelOpen(true) : undefined}
        />

        {/* CORPO CENTRAL DINÂMICO BASEADO NA ABA ATIVA */}
        <div
          className={`flex-1 w-full p-3 sm:p-6 flex flex-col items-center overflow-y-auto custom-scrollbar ${
            currentView === 'explorar' ? 'justify-center' : 'justify-start'
          }`}
        >
          {/* REPRODUTOR DE TV (PERMANECE MONTADO PARA PiP E CONTINUIDADE AO NAVEGAR, MAS PAUSA E DESAPARECE NA FILMOTECA) */}
          <div
            className={
              currentView === 'explorar'
                ? 'w-full max-w-5xl mx-auto py-1 my-auto flex flex-col items-center justify-center transition-all duration-150 ease-out'
                : isMiniPlayerDismissed || currentView === 'filmoteca'
                ? 'pointer-events-none opacity-0 fixed -bottom-96 -right-96 w-1 h-1 overflow-hidden select-none'
                : 'contents'
            }
          >
            <PlayerHero
              canalAtivo={canalAtivo}
              streamIndex={streamIndex}
              onStreamChange={handleStreamChange}
              onAddStreamUrl={handleAddStreamToCanal}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              useProxy={useProxy}
              onToggleProxy={handleToggleProxy}
              latencyMode={latencyMode}
              onToggleLatencyMode={handleToggleLatencyMode}
              isCinemaMode={isCinemaMode}
              onEnterCinemaMode={() => setTimeout(() => setIsCinemaMode(true), 0)}
              isFavorited={isCanalFavorited(canalAtivo)}
              onToggleFavorite={() => canalAtivo && toggleFavorite(canalAtivo)}
              failoverNotice={failoverNotice}
              onClearFailoverNotice={handleClearFailoverNotice}
              onPlayerError={handlePlayerError}
              onNextCanal={handleNextCanal}
              onPrevCanal={handlePrevCanal}
              onOpenPaymentPlans={() => setTimeout(() => setIsPaymentModalOpen(true), 0)}
              onOpenRedeemToken={() => setTimeout(() => setIsRedeemModalOpen(true), 0)}
              onVideoEnded={handleVideoEnded}
              isMiniMode={currentView !== 'explorar'}
              onRestoreFromMiniMode={() => setTimeout(() => setCurrentView('explorar'), 0)}
              onDismissMiniMode={() => setTimeout(() => setIsMiniPlayerDismissed(true), 0)}
              todosCanais={todosCanais}
              onSelectCanal={handleSelectCanal}
              isPlaybackPaused={currentView === 'filmoteca'}
            />
          </div>

          {/* BOTÃO FLUTUANTE DISCRETO PARA RESTAURAR O MINI-PLAYER SE DISPENSADO (NÃO EXIBE NA FILMOTECA) */}
          {currentView !== 'explorar' && currentView !== 'filmoteca' && isMiniPlayerDismissed && canalAtivo && (
            <button
              type="button"
              id="restore-mini-player-pill"
              onClick={() => setIsMiniPlayerDismissed(false)}
              className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 shadow-xl backdrop-blur-md transition cursor-pointer text-xs group ring-1 ring-zinc-700/50"
              title="Restaurar reprodutor flutuante"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-pulse" />
              <span className="font-semibold max-w-[120px] truncate">{canalAtivo.nome}</span>
              <Tv className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF2D55] transition-colors" />
            </button>
          )}

          {/* VISTA 2: PAINEL DE CONTROLE (MÉTRICAS & GESTÃO COM TRANSIÇÃO RÁPIDA) */}
          {currentView === 'painel' && (
            <div className="w-full animate-in fade-in duration-150 ease-out">
              <WorscoiControlPanel
                onNavigateToSubscribers={() => setCurrentView('assinantes')}
                onOpenTokenGenerator={() => setIsSubscribersModalOpen(true)}
                onSelectPlan={() => setIsPaymentModalOpen(true)}
              />
            </div>
          )}

          {/* VISTA 3: ASSINANTES (CHAVES DE ACESSO & ASSINATURAS COM TRANSIÇÃO RÁPIDA) */}
          {currentView === 'assinantes' && (
            <div className="w-full animate-in fade-in duration-150 ease-out">
              <WorscoiSubscribersView
                onBackToControlPanel={() => setCurrentView('painel')}
                onOpenTokenGenerator={() => setIsSubscribersModalOpen(true)}
              />
            </div>
          )}

          {/* VISTA 4: FILMOTECA & CINEMA VOD (TRANSIÇÃO INSTANTÂNEA E PERSISTÊNCIA DE ESTADO) */}
          <div
            className={`w-full ${
              currentView === 'filmoteca'
                ? 'block animate-in fade-in duration-150 ease-out'
                : 'hidden'
            }`}
          >
            {(hasVisitedFilmoteca || currentView === 'filmoteca') && (
              <WorscoiFilmotecaView
                onBackToTV={() => setCurrentView('explorar')}
              />
            )}
          </div>
        </div>
      </div>

      {/* MODAL MODO CINEMA */}
      <AnimatePresence>
        {isCinemaMode && canalAtivo && (
          <CinemaPlayer
            key="active-cinema-player-modal"
            canalAtivo={canalAtivo}
            streamIndex={streamIndex}
            onStreamChange={handleStreamChange}
            onAddStreamUrl={handleAddStreamToCanal}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            useProxy={useProxy}
            onToggleProxy={handleToggleProxy}
            latencyMode={latencyMode}
            onToggleLatencyMode={handleToggleLatencyMode}
            onClose={() => setIsCinemaMode(false)}
            failoverNotice={failoverNotice}
            onClearFailoverNotice={handleClearFailoverNotice}
            onPlayerError={handlePlayerError}
            onNextCanal={handleNextCanal}
            onPrevCanal={handlePrevCanal}
            onVideoEnded={handleVideoEnded}
            onOpenPaymentPlans={() => {
              setIsCinemaMode(false);
              setIsPaymentModalOpen(true);
            }}
            onOpenRedeemToken={() => {
              setIsCinemaMode(false);
              setIsRedeemModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL DE CONTA ENCERRADA POR EXPIRAÇÃO DO CRONÔMETRO */}
      <SubscriptionExpiredModal
        isOpen={isAccountClosedDueToExpiration}
        onClose={closeExpiredNotice}
        onOpenPaymentPlans={() => {
          closeExpiredNotice();
          setIsPaymentModalOpen(true);
        }}
        onOpenRedeemToken={() => {
          closeExpiredNotice();
          setIsRedeemModalOpen(true);
        }}
        onOpenLogin={() => {
          closeExpiredNotice();
          setIsLoginModalOpen(true);
        }}
      />

      {/* ALERTA AMIGÁVEL: BLOQUEIO DE PLANO GRATUITO JÁ UTILIZADO (DEVICEID OU E-MAIL) */}
      <FreePlanBlockedModal
        isOpen={isFreePlanBlocked}
        onClose={closeFreePlanBlockedAlert}
        details={freePlanBlockedDetails}
        onOpenPaymentPlans={() => {
          closeFreePlanBlockedAlert();
          setIsPaymentModalOpen(true);
        }}
        onOpenRedeemToken={() => {
          closeFreePlanBlockedAlert();
          setIsRedeemModalOpen(true);
        }}
      />

      {/* MODAL DE GERADOR DE TOKENS & ASSINANTES */}
      <SubscribersModal
        isOpen={isSubscribersModalOpen}
        onClose={() => setIsSubscribersModalOpen(false)}
      />

      {/* MODAL DE RESGATE DE TOKEN */}
      <RedeemTokenModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
      />

      {/* MODAL DE PLANOS E PAGAMENTO */}
      <PaymentPlansModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onOpenRedeemToken={() => {
          setIsPaymentModalOpen(false);
          setIsRedeemModalOpen(true);
        }}
        onCelebration={(data) => setCelebrationData({ isOpen: true, ...data })}
      />

      {/* NOTIFICAÇÃO DE PARABÉNS PELO PLANO ATIVADO */}
      {celebrationData && (
        <CongratulationsNotification
          isOpen={celebrationData.isOpen}
          onClose={() => setCelebrationData(null)}
          userName={celebrationData.userName}
          planName={celebrationData.planName}
          message={celebrationData.message}
        />
      )}

      {/* MODAL DE PERFIL DO USUÁRIO */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        onOpenPaymentPlans={() => {
          setIsUserProfileModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
        onOpenRedeemToken={() => {
          setIsUserProfileModalOpen(false);
          setIsRedeemModalOpen(true);
        }}
        onOpenAuth={() => {
          setIsUserProfileModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* MODAL DE ADMIN */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        todosCanais={todosCanais}
        customChannels={customChannels}
        onOpenAddChannel={() => setIsModalOpen(true)}
        onRemoveCustomChannel={(id) => {
          const atualizados = customChannels.filter((c) => c.id !== id);
          setCustomChannels(atualizados);
          try {
            localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(atualizados));
          } catch {
            // Ignora
          }
        }}
        onOpenSubscribers={() => setIsSubscribersModalOpen(true)}
        onOpenPaymentPlans={() => setIsPaymentModalOpen(true)}
      />

      {/* MODAL DE ADICIONAR CANAL */}
      <AddChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddChannel={(novo) => {
          const atualizados = [novo, ...customChannels];
          setCustomChannels(atualizados);
          try {
            localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(atualizados));
          } catch {
            // Ignora
          }
          setCanalAtivo(novo);
        }}
      />

      {/* MODAL WORSCOI DE LOGIN NO APP PRINCIPAL */}
      <WorscoiLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={loginModalMode}
        onLoginSuccess={handleLoginSuccess}
        onCelebration={(data) => {
          setCelebrationData({ isOpen: true, ...data });
        }}
      />
    </main>
  );
}
