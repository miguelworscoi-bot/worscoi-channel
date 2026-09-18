'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canal, LatencyMode, WorscoiView, FiltroAtivo } from '@/types';
import { Tv } from 'lucide-react';
import { LOCAL_STORAGE_LATENCY_KEY, getEmergencyFallbackStream } from '@/utils/streamUtils';
import { CANAIS_PADRAO } from '@/app/api/canais/route';
import { WorscoiSidebar } from '@/components/WorscoiSidebar';
import { WorscoiTopBar } from '@/components/WorscoiTopBar';
import { PlayerHero } from '@/components/PlayerHero';
import WorscoiControlPanel from '@/components/WorscoiControlPanel';
import WorscoiSubscribersView from '@/components/WorscoiSubscribersView';
import WorscoiFilmotecaView from '@/components/WorscoiFilmotecaView';

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
import { NotificationCenterModal } from '@/components/NotificationCenterModal';
import { NotificationToast } from '@/components/NotificationToast';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal';
import { LandingScreen } from '@/components/LandingScreen';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { autoplayQueueService } from '@/services/autoplayQueueService';
import {
  getStoredRecentChannels,
  addChannelToRecents,
  removeChannelFromRecents,
  clearStoredRecentChannels,
  CanalRecente,
} from '@/utils/recentChannelsUtils';
import { recordChannelSelection } from '@/services/channelSelectionLogService';

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
  const {
    isOpen: isNotificationsOpen,
    openNotifications,
    closeNotifications,
  } = useNotifications();
  const [currentView, setCurrentView] = useState<WorscoiView>('explorar');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [canais, setCanais] = useState<Canal[]>(CANAIS_PADRAO);
  const [customChannels, setCustomChannels] = useState<Canal[]>([]);
  const [recentChannels, setRecentChannels] = useState<CanalRecente[]>([]);
  // Por definição, o player dos canais inicia sem reprodução antes de o usuário escolher seu canal
  const [canalAtivo, setCanalAtivo] = useState<Canal | null>(null);
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
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [privacyModalDefaultTab, setPrivacyModalDefaultTab] = useState<'terms' | 'cookies'>('terms');
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

      const storedRecents = getStoredRecentChannels();
      if (Array.isArray(storedRecents)) setRecentChannels(storedRecents);

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
      setUseProxy(false);
      setIsMobileMenuOpen(false);
      setIsMiniPlayerDismissed(false);

      // Salva no localStorage como canal recente e registra no log de seleções da semana
      const updated = addChannelToRecents(canal);
      setRecentChannels(updated);
      recordChannelSelection(canal, user?.uid);
    }, 0);
  }, [user?.uid]);

  // Sincroniza canais recentes sempre que o canal ativo mudar
  useEffect(() => {
    if (canalAtivo && (canalAtivo.id || canalAtivo.url)) {
      const updated = addChannelToRecents(canalAtivo);
      setRecentChannels(updated);
      recordChannelSelection(canalAtivo, user?.uid);
    }
  }, [canalAtivo, user?.uid]);

  const handleClearRecentChannels = useCallback(() => {
    clearStoredRecentChannels();
    setRecentChannels([]);
  }, []);

  const handleRemoveRecentChannel = useCallback(
    (channelIdentifier: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const updated = removeChannelFromRecents(channelIdentifier);
      setRecentChannels(updated);
    },
    []
  );

  // Navegação de canais (Zapping Anterior / Próximo)
  const currentCanalIndex = canalAtivo
    ? todosCanais.findIndex(
        (c) => (canalAtivo.id && c.id ? c.id === canalAtivo.id : c.url === canalAtivo.url)
      )
    : -1;

  const handleNextCanal = useCallback(() => {
    setTimeout(() => {
      if (todosCanais.length === 0) return;
      const nextIdx = currentCanalIndex >= 0 ? (currentCanalIndex + 1) % todosCanais.length : 0;
      handleSelectCanal(todosCanais[nextIdx]);
    }, 0);
  }, [currentCanalIndex, todosCanais, handleSelectCanal]);

  const handlePrevCanal = useCallback(() => {
    setTimeout(() => {
      if (todosCanais.length === 0) return;
      const prevIdx =
        currentCanalIndex >= 0
          ? (currentCanalIndex - 1 + todosCanais.length) % todosCanais.length
          : todosCanais.length - 1;
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
        // Se todas as fontes falharem, aciona imediatamente o sinal de contingência da categoria para garantir que a tela não fique preta
        const emergencyFallback = getEmergencyFallbackStream(canalAtivo.categoria);
        if (emergencyFallback && !streams.includes(emergencyFallback)) {
          setFailoverNotice('Conectando ao sinal de contingência da categoria...');
          const currentBackups = canalAtivo.backupUrls || [];
          const updatedCanal: Canal = {
            ...canalAtivo,
            backupUrls: [...currentBackups, emergencyFallback],
          };
          setCanalAtivo(updatedCanal);
          setStreamIndex(updatedCanal.backupUrls.length);
          setTimeout(() => setFailoverNotice(null), 4000);
        } else {
          setFailoverNotice('Sinal temporariamente instável na emissora. Tentando reconexão...');
          setTimeout(() => {
            setFailoverNotice(null);
          }, 4000);
        }
      }
    }, 0);
  }, [canalAtivo, streamIndex, useProxy]);

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
    if (
      user &&
      user.email &&
      user.email !== 'espectador@worscoi.tv' &&
      user.email !== 'espectador@playsports.tv' &&
      !user.isAnonymous
    ) {
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
          recentChannels={recentChannels}
          onClearRecentChannels={handleClearRecentChannels}
          onRemoveRecentChannel={handleRemoveRecentChannel}
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
              recentChannels={recentChannels}
              onClearRecentChannels={handleClearRecentChannels}
              onRemoveRecentChannel={handleRemoveRecentChannel}
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
          onOpenNotifications={openNotifications}
        />

        {/* CORPO CENTRAL DINÂMICO BASEADO NA ABA ATIVA */}
        <div
          className="flex-1 w-full p-3 sm:p-6 flex flex-col items-center overflow-y-auto custom-scrollbar"
        >
          {/* TRANSIÇÃO ULTRA SUAVE E LEVE ENTRE TELAS */}
          <AnimatePresence initial={false}>
            {/* VISTA 1: TRANSMISSÃO DE TV AO VIVO (EXPLORAR) */}
            {currentView === 'explorar' && (
              <motion.div
                key="screen-view-explorar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="w-full max-w-5xl mx-auto py-1 my-auto flex flex-col items-center justify-center"
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
                  isMiniMode={false}
                  onRestoreFromMiniMode={() => setTimeout(() => setCurrentView('explorar'), 0)}
                  onDismissMiniMode={() => setTimeout(() => setIsMiniPlayerDismissed(true), 0)}
                  todosCanais={todosCanais}
                  onSelectCanal={handleSelectCanal}
                  isPlaybackPaused={false}
                />
              </motion.div>
            )}

            {/* VISTA 2: PAINEL DE CONTROLE (MÉTRICAS & GESTÃO) */}
            {currentView === 'painel' && (
              <motion.div
                key="screen-view-painel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="w-full"
              >
                <WorscoiControlPanel
                  onNavigateToSubscribers={() => setCurrentView('assinantes')}
                  onOpenTokenGenerator={() => setIsSubscribersModalOpen(true)}
                  onSelectPlan={() => setIsPaymentModalOpen(true)}
                />
              </motion.div>
            )}

            {/* VISTA 3: ASSINANTES (CHAVES DE ACESSO & ASSINATURAS) */}
            {currentView === 'assinantes' && (
              <motion.div
                key="screen-view-assinantes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="w-full"
              >
                <WorscoiSubscribersView
                  onBackToControlPanel={() => setCurrentView('painel')}
                  onOpenTokenGenerator={() => setIsSubscribersModalOpen(true)}
                />
              </motion.div>
            )}

            {/* VISTA 4: FILMOTECA & CINEMA VOD */}
            {currentView === 'filmoteca' && (
              <motion.div
                key="screen-view-filmoteca"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="w-full"
              >
                <WorscoiFilmotecaView
                  onBackToTV={() => setCurrentView('explorar')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* REPRODUTOR FLUTUANTE EM MINI-MODO (AO VISITAR O PAINEL OU ASSINANTES) */}
          <AnimatePresence>
            {(currentView === 'painel' || currentView === 'assinantes') && !isMiniPlayerDismissed && canalAtivo && (
              <motion.div
                key="floating-mini-player-container"
                initial={{ opacity: 0, scale: 0.9, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 16 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
                  isMiniMode={true}
                  onRestoreFromMiniMode={() => setTimeout(() => setCurrentView('explorar'), 0)}
                  onDismissMiniMode={() => setTimeout(() => setIsMiniPlayerDismissed(true), 0)}
                  todosCanais={todosCanais}
                  onSelectCanal={handleSelectCanal}
                  isPlaybackPaused={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOTÃO FLUTUANTE DISCRETO PARA RESTAURAR O MINI-PLAYER SE DISPENSADO */}
          <AnimatePresence>
            {(currentView === 'painel' || currentView === 'assinantes') && isMiniPlayerDismissed && canalAtivo && (
              <motion.button
                key="floating-restore-pill"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                type="button"
                id="restore-mini-player-pill"
                onClick={() => setIsMiniPlayerDismissed(false)}
                className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 shadow-xl backdrop-blur-md transition cursor-pointer text-xs group ring-1 ring-zinc-700/50"
                title="Restaurar reprodutor flutuante"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-pulse" />
                <span className="font-semibold max-w-[120px] truncate">{canalAtivo.nome}</span>
                <Tv className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF2D55] transition-colors" />
              </motion.button>
            )}
          </AnimatePresence>
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
        onOpenPrivacyPolicy={() => {
          setIsUserProfileModalOpen(false);
          setPrivacyModalDefaultTab('terms');
          setIsPrivacyModalOpen(true);
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

      {/* NOTIFICAÇÃO TOAST FLUTUANTE EM TEMPO REAL (BÔNUS, EXPIRAÇÃO, ATIVAÇÃO) */}
      <NotificationToast
        onOpenNotifications={openNotifications}
        onOpenPlans={() => setIsPaymentModalOpen(true)}
      />

      {/* MODAL CENTRAL DE NOTIFICAÇÕES (MENSAGENS DE BÔNUS, FIM DO PLANO, ALERTA E ATIVAÇÃO) */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={closeNotifications}
        onOpenPlans={() => {
          closeNotifications();
          setIsPaymentModalOpen(true);
        }}
        onOpenRedeemToken={() => {
          closeNotifications();
          setIsRedeemModalOpen(true);
        }}
      />
      {/* BANNER DE CONSENTIMENTO DE COOKIES */}
      <CookieConsentBanner
        onOpenPrivacyPolicy={() => {
          setPrivacyModalDefaultTab('cookies');
          setIsPrivacyModalOpen(true);
        }}
      />

      {/* MODAL DE POLÍTICA DE PRIVACIDADE E TERMOS DE COOKIES */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        defaultTab={privacyModalDefaultTab}
      />
    </main>
  );
}
