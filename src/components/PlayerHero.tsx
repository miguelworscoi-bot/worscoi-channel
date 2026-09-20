'use client';
import React, { useState, useEffect, useMemo } from 'react';
import ReactPlayer from 'react-player';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Lock,
  CreditCard,
  KeyRound,
  RefreshCw,
  Tv,
  AlertCircle,
  AlertTriangle,
  X,
  PictureInPicture2,
  Maximize2,
  Sliders,
  Zap,
  SkipForward,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Film,
  Heart,
  MessageCircle,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { Canal, LatencyMode, VideoQuality } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { ChannelShareModal } from './ChannelShareModal';
import { CustomPage } from '@/services/customPagesService';
import {
  getSafeStreamUrl,
  isStreamAutoProxied,
  getHlsOptionsForLatencyMode,
  getEmergencyFallbackStream,
  resolveActiveChannelStream,
  applyQualityToHls,
} from '@/utils/streamUtils';
import { useAuth } from '@/context/AuthContext';
import { isUserPlanExpired, canUserWatchChannel, PLANS } from '@/services/subscriptionService';
import { PlayerTransitionSkeleton } from './PlayerTransitionSkeleton';
import { PlayerSettingsModal } from './PlayerSettingsModal';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';
import { ChannelVideosModal, extractYouTubeId } from './ChannelVideosModal';
import { NextVideosQueueDrawer } from './NextVideosQueueDrawer';
import { NextVideoAutoplayOverlay } from './NextVideoAutoplayOverlay';
import { autoplayQueueService, QueueItem } from '@/services/autoplayQueueService';
import { PlayerCommentsDrawer } from './PlayerCommentsDrawer';
import {
  subscribeChannelStats,
  subscribeChannelComments,
  toggleChannelAdoro,
  toggleCommentAdoro,
  addChannelComment,
  deleteChannelComment,
  getVideoItemSlug,
  formatInteractionCount,
  getEffectiveVisitorId,
  ChannelComment,
} from '@/services/channelInteractionsService';

interface PlayerHeroProps {
  canalAtivo: Canal | null;
  streamIndex: number;
  onStreamChange: (index: number) => void;
  onAddStreamUrl?: (url: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  useProxy: boolean;
  onToggleProxy: () => void;
  latencyMode: LatencyMode;
  onToggleLatencyMode: (mode?: LatencyMode) => void;
  isCinemaMode?: boolean;
  onEnterCinemaMode: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  failoverNotice: string | null;
  onClearFailoverNotice: () => void;
  onPlayerError: (error: unknown) => void;
  onNextCanal?: () => void;
  onPrevCanal?: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenRedeemToken?: () => void;
  isTransitioning?: boolean;
  transitionDirection?: 'to-cinema' | 'to-hero' | null;
  isAudioTransitionMuted?: boolean;
  onVideoEnded?: () => void;
  isMiniMode?: boolean;
  onRestoreFromMiniMode?: () => void;
  onDismissMiniMode?: () => void;
  todosCanais?: Canal[];
  onSelectCanal?: (canal: Canal) => void;
  isPlaybackPaused?: boolean;
  videoQuality?: VideoQuality;
  onSelectVideoQuality?: (quality: VideoQuality) => void;
  customPages?: CustomPage[];
  onNavigateToCustomPage?: (slug: string) => void;
}

export function PlayerHero({
  canalAtivo,
  streamIndex,
  onStreamChange,
  onAddStreamUrl,
  isMuted,
  onToggleMute,
  useProxy,
  onToggleProxy,
  latencyMode,
  onToggleLatencyMode,
  isCinemaMode = false,
  onEnterCinemaMode,
  isFavorited,
  onToggleFavorite,
  failoverNotice,
  onClearFailoverNotice,
  onPlayerError,
  onNextCanal,
  onPrevCanal,
  onOpenPaymentPlans,
  onOpenRedeemToken,
  isTransitioning = false,
  transitionDirection = null,
  isAudioTransitionMuted = false,
  onVideoEnded,
  isMiniMode = false,
  onRestoreFromMiniMode,
  onDismissMiniMode,
  todosCanais,
  onSelectCanal,
  isPlaybackPaused = false,
  videoQuality = 'auto',
  onSelectVideoQuality,
  customPages = [],
  onNavigateToCustomPage,
}: PlayerHeroProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { userProfile, isAdmin, countdown, isSubscriptionExpired } = useAuth();
  const isPlanExpired = !isAdmin && (isSubscriptionExpired || countdown.expired || isUserPlanExpired(userProfile));
  const channelAccess = canUserWatchChannel(canalAtivo, userProfile);
  const isChannelLockedByPlan = !isAdmin && !channelAccess.allowed && channelAccess.reason === 'plan_too_low';
  const requiredPlanInfo = PLANS[channelAccess.requiredPlan] || PLANS.vip;
  const userPlanInfo = PLANS[channelAccess.userPlan] || PLANS.free;

  const playerRef = React.useRef<{ getInternalPlayer: (type?: string) => unknown } | null>(null);

  // Aplica a qualidade selecionada diretamente à instância Hls.js do reprodutor
  useEffect(() => {
    if (playerRef.current) {
      try {
        const hls = (playerRef.current as unknown as { getInternalPlayer: (type?: string) => unknown }).getInternalPlayer('hls');
        if (hls) {
          applyQualityToHls(hls, videoQuality);
        }
      } catch {
        // Ignora em caso de reprodutor não-HLS
      }
    }
  }, [videoQuality]);

  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [hasYouTubeEmbedError, setHasYouTubeEmbedError] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [isStreamOffline, setIsStreamOffline] = useState(false);
  const [offlineAutoAdvanceSeconds, setOfflineAutoAdvanceSeconds] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChannelVideosOpen, setIsChannelVideosOpen] = useState(false);

  // Estados de recuperação inteligente de streaming
  const [emergencyOverrideUrl, setEmergencyOverrideUrl] = useState<string | null>(null);

  // Monitor de latência e qualidade da transmissão em tempo real
  const [streamLatency, setStreamLatency] = useState<number>(() => {
    if (latencyMode === 'low-latency') return 120;
    if (latencyMode === 'economy') return 280;
    return 180;
  });
  const [_isMeasuringLatency, setIsMeasuringLatency] = useState(false);

  // Estados da Fila de Próximos Vídeos e Reprodução Contínua (Autoplay)
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [autoplayTarget, setAutoplayTarget] = useState<QueueItem | null>(null);
  const [isAutoplayCountdownActive, setIsAutoplayCountdownActive] = useState(false);
  // Partículas disparadas ao apertar o botão favoritar (#ed3c5c)
  const [bookmarkParticles, setBookmarkParticles] = useState<
    Array<{ id: number; angle: number; distance: number; size: number; duration: number }>
  >([]);

  // Estados de Interações (Adoro e Comentários ao Vivo)
  const [isLiked, setIsLiked] = useState(false);
  const [adorosCount, setAdorosCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsList, setCommentsList] = useState<ChannelComment[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [adoroParticles, setAdoroParticles] = useState<
    Array<{ id: number; angle: number; distance: number; size: number; duration: number }>
  >([]);

  const handleBookmarkClick = (_e?: React.MouseEvent<HTMLButtonElement>) => {
    // Dispara a animação de partículas na cor #ed3c5c
    const angleBase = Math.random() * Math.PI * 2;
    const newParticles = Array.from({ length: 14 }).map((_, i) => {
      const angle = angleBase + (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 26 + Math.random() * 28;
      const size = 3 + Math.random() * 4;
      const duration = 0.55 + Math.random() * 0.25;
      return { id: Date.now() + i, angle, distance, size, duration };
    });

    setBookmarkParticles(newParticles);
    setTimeout(() => {
      setBookmarkParticles([]);
    }, 900);

    onToggleFavorite();
  };

  // Callbacks estabilizados em refs para garantir que useEffects com intervals/listeners nunca reiniciem a cada render
  const onNextCanalRef = React.useRef(onNextCanal);
  onNextCanalRef.current = onNextCanal;
  const onPrevCanalRef = React.useRef(onPrevCanal);
  onPrevCanalRef.current = onPrevCanal;
  const onToggleMuteRef = React.useRef(onToggleMute);
  onToggleMuteRef.current = onToggleMute;
  const onEnterCinemaModeRef = React.useRef(onEnterCinemaMode);
  onEnterCinemaModeRef.current = onEnterCinemaMode;
  const onToggleLatencyModeRef = React.useRef(onToggleLatencyMode);
  onToggleLatencyModeRef.current = onToggleLatencyMode;
  const onStreamChangeRef = React.useRef(onStreamChange);
  onStreamChangeRef.current = onStreamChange;
  const onToggleProxyRef = React.useRef(onToggleProxy);
  onToggleProxyRef.current = onToggleProxy;
  const onPlayerErrorRef = React.useRef(onPlayerError);
  onPlayerErrorRef.current = onPlayerError;
  const onAddStreamUrlRef = React.useRef(onAddStreamUrl);
  onAddStreamUrlRef.current = onAddStreamUrl;

  const backupUrlsKey = (canalAtivo?.backupUrls || []).join('|');
  const streamsDisponiveis = useMemo(() => {
    return canalAtivo ? [canalAtivo.url, ...(canalAtivo.backupUrls || [])] : [];
  }, [canalAtivo?.id, canalAtivo?.url, backupUrlsKey]);

  const rawTargetUrl =
    canalAtivo && streamsDisponiveis[streamIndex]
      ? streamsDisponiveis[streamIndex]
      : canalAtivo?.url || '';

  const activeRawStreamUrl = resolveActiveChannelStream(
    rawTargetUrl,
    canalAtivo?.categoria,
    streamIndex
  );

  // Carrega e sincroniza em tempo real Adoros e Comentários do canal/transmissão
  useEffect(() => {
    if (!canalAtivo) {
      setIsLiked(false);
      setAdorosCount(0);
      setCommentsCount(0);
      setCommentsList([]);
      return;
    }

    const rawUrl = emergencyOverrideUrl || streamsDisponiveis[streamIndex] || canalAtivo.url || '';
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, rawUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);

    const unsubStats = subscribeChannelStats(videoSlug, effectiveUserId, (stats) => {
      setIsLiked((prev) => (prev === stats.userHasAdorado ? prev : stats.userHasAdorado));
      setAdorosCount((prev) => (prev === stats.adorosCount ? prev : stats.adorosCount));
      setCommentsCount((prev) => (prev === stats.commentsCount ? prev : stats.commentsCount));
    });

    const unsubComments = subscribeChannelComments(videoSlug, (comments) => {
      setCommentsList(comments);
    });

    return () => {
      unsubStats();
      unsubComments();
    };
  }, [
    canalAtivo?.id,
    canalAtivo?.nome,
    canalAtivo?.url,
    streamIndex,
    emergencyOverrideUrl,
    activeRawStreamUrl,
    userProfile?.id,
  ]);

  const handleToggleAdoro = async () => {
    if (!canalAtivo) return;
    const rawUrl = emergencyOverrideUrl || streamsDisponiveis[streamIndex] || canalAtivo.url || '';
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, rawUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);

    // Efeito de partículas vibrantes na cor #ed3c5c
    const angleBase = Math.random() * Math.PI * 2;
    const newParticles = Array.from({ length: 14 }).map((_, i) => {
      const angle = angleBase + (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 26 + Math.random() * 28;
      const size = 3 + Math.random() * 4;
      const duration = 0.55 + Math.random() * 0.25;
      return { id: Date.now() + i, angle, distance, size, duration };
    });
    setAdoroParticles(newParticles);
    setTimeout(() => {
      setAdoroParticles([]);
    }, 900);

    const res = await toggleChannelAdoro(videoSlug, canalAtivo.nome, effectiveUserId);
    setIsLiked(res.userHasAdorado);
    setAdorosCount(res.adorosCount);
  };

  const handleSendComment = async (
    text: string,
    parentId?: string | null,
    replyToUserName?: string | null
  ) => {
    if (!canalAtivo || !text.trim() || isSubmittingComment) return;
    const rawUrl = emergencyOverrideUrl || streamsDisponiveis[streamIndex] || canalAtivo.url || '';
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, rawUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    const effectiveUserName =
      userProfile?.displayName ||
      (userProfile?.email ? userProfile.email.split('@')[0] : 'Espectador');
    const effectiveUserPhoto = userProfile?.photoURL || null;
    const effectiveUserPlan = userProfile?.planName || userProfile?.plan || null;

    setIsSubmittingComment(true);
    try {
      await addChannelComment({
        channelSlug: videoSlug,
        channelName: canalAtivo.nome,
        userId: effectiveUserId,
        userName: effectiveUserName,
        userPhoto: effectiveUserPhoto,
        userPlan: effectiveUserPlan,
        text,
        parentId,
        replyToUserName,
      });
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleCommentAdoro = async (commentId: string) => {
    if (!canalAtivo) return;
    const rawUrl = emergencyOverrideUrl || streamsDisponiveis[streamIndex] || canalAtivo.url || '';
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, rawUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    try {
      await toggleCommentAdoro(commentId, videoSlug, effectiveUserId);
    } catch (err) {
      console.error('Erro ao alternar adoro do comentário:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!canalAtivo) return;
    const rawUrl = emergencyOverrideUrl || streamsDisponiveis[streamIndex] || canalAtivo.url || '';
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, rawUrl);
    try {
      await deleteChannelComment(commentId, videoSlug);
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
    }
  };

  // Atualiza a fila de reprodução inteligente e grava no histórico do usuário
  const totalCanaisCount = todosCanais?.length || 0;
  useEffect(() => {
    if (!canalAtivo) return;
    const items = autoplayQueueService.buildQueue(
      canalAtivo,
      streamIndex,
      todosCanais || []
    );
    setQueueItems(items);
    autoplayQueueService.addToWatchHistory(canalAtivo, streamIndex, activeRawStreamUrl);
  }, [canalAtivo?.id, streamIndex, totalCanaisCount, activeRawStreamUrl]);

  const handlePlaybackFinished = () => {
    if (autoplayQueueService.isAutoplayEnabled()) {
      const nextItem = autoplayQueueService.peekNextVideo(
        canalAtivo,
        streamIndex,
        todosCanais || []
      );
      if (nextItem) {
        setAutoplayTarget(nextItem);
        setIsAutoplayCountdownActive(true);
        return;
      }
    }
    onVideoEnded?.();
  };

  const handlePlayNextItem = (item: QueueItem) => {
    setIsAutoplayCountdownActive(false);
    setAutoplayTarget(null);

    if (canalAtivo && item.canal.id === canalAtivo.id && typeof item.streamIndex === 'number') {
      onStreamChange(item.streamIndex);
      return;
    }

    if (onSelectCanal) {
      onSelectCanal(item.canal);
      if (typeof item.streamIndex === 'number') {
        setTimeout(() => onStreamChange(item.streamIndex), 80);
      }
    } else {
      onNextCanal?.();
    }
  };

  const handleCancelAutoplay = () => {
    setIsAutoplayCountdownActive(false);
    setAutoplayTarget(null);
  };

  // Áudio suavizado durante transição entre componentes para evitar picos
  const effectiveMuted = isMuted || isAudioTransitionMuted || Boolean(isPlaybackPaused);
  const rawStreamToPlay = emergencyOverrideUrl || activeRawStreamUrl;
  const finalStreamUrl = emergencyOverrideUrl
    ? emergencyOverrideUrl
    : getSafeStreamUrl(activeRawStreamUrl, useProxy);
  const isCurrentlyProxied = isStreamAutoProxied(rawStreamToPlay, useProxy);
  const isYouTubeChannel = Boolean(
    canalAtivo && (
      canalAtivo.categoria === 'YouTube' ||
      canalAtivo.rede === 'YouTube' ||
      canalAtivo.grupo?.toLowerCase().includes('youtube') ||
      canalAtivo.url?.includes('youtube.com') ||
      canalAtivo.url?.includes('youtu.be') ||
      activeRawStreamUrl.includes('youtube.com') ||
      activeRawStreamUrl.includes('youtu.be') ||
      (canalAtivo.backupUrls && canalAtivo.backupUrls.some((u) => u.includes('youtube.com') || u.includes('youtu.be')))
    )
  );

  // Sincroniza metadados do canal selecionado
  useEffect(() => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setHasYouTubeEmbedError(false);
    setLoadSeconds(0);
    setIsStreamOffline(false);
    setOfflineAutoAdvanceSeconds(null);
    setEmergencyOverrideUrl(null);
    // Reseta a latência base para o novo canal
    setStreamLatency(latencyMode === 'low-latency' ? 120 : latencyMode === 'economy' ? 260 : 180);
  }, [canalAtivo?.id, canalAtivo?.url, streamIndex, useProxy, latencyMode]);

  // Sincronização inteligente com mensagens do YouTube (ao escolher outro vídeo, reproduz no player do sistema)
  useEffect(() => {
    const handleYouTubeMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        // Ignora initialDelivery para evitar loop de atualização durante a montagem do componente
        if (data && data.event === 'infoDelivery') {
          const videoData = data.info?.videoData;
          if (videoData && videoData.video_id) {
            const currentVideoId = extractYouTubeId(activeRawStreamUrl);
            if (currentVideoId && videoData.video_id !== currentVideoId) {
              const newUrl = `https://www.youtube.com/watch?v=${videoData.video_id}`;
              if (canalAtivo) {
                const allUrls = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
                const existingIndex = allUrls.findIndex((u) => u.includes(videoData.video_id));
                setTimeout(() => {
                  if (existingIndex >= 0) {
                    onStreamChangeRef.current?.(existingIndex);
                  } else if (onAddStreamUrlRef.current) {
                    onAddStreamUrlRef.current(newUrl);
                  }
                }, 0);
              }
            }
          }
        }
      } catch {
        // Ignora mensagens que não são do player
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
    };
  }, [activeRawStreamUrl, canalAtivo?.id]);

  // Medição contínua e dinâmica da latência do sinal da transmissão (ping RTT)
  useEffect(() => {
    if (!canalAtivo || isPlanExpired) return;

    let isMounted = true;
    const measureStreamLatency = async () => {
      try {
        setIsMeasuringLatency(true);
        const startTime = performance.now();
        const pingUrl = isCurrentlyProxied
          ? `/api/proxy?url=${encodeURIComponent(activeRawStreamUrl)}`
          : (activeRawStreamUrl.startsWith('http')
              ? `/api/proxy?url=${encodeURIComponent(activeRawStreamUrl)}`
              : '/api/proxy');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        await fetch(pingUrl, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        const rtt = Math.round(performance.now() - startTime);
        if (isMounted) {
          // Ajuste fino para visualização natural e estável
          setStreamLatency(Math.max(45, rtt));
        }
      } catch {
        if (isMounted) {
          // Em caso de lentidão temporária ou timeout, reflete degradação da conexão
          setStreamLatency((prev) => Math.max(prev, 1400));
        }
      } finally {
        if (isMounted) setIsMeasuringLatency(false);
      }
    };

    // Primeira checagem rápida após 2s de montagem do canal
    const initTimer = setTimeout(measureStreamLatency, 2000);
    // Intervalo de medição leve a cada 45 segundos (evita sobrecarga de rede e CPU durante streaming)
    const interval = setInterval(measureStreamLatency, 45000);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [canalAtivo?.id, activeRawStreamUrl, isCurrentlyProxied, isPlanExpired]);

  // Se o sinal de origem estiver demorando para entregar o primeiro frame, a latência estimada aumenta
  useEffect(() => {
    if (!hasFirstFrame && loadSeconds > 0) {
      setStreamLatency(Math.min(2400, 160 + loadSeconds * 280));
    }
  }, [hasFirstFrame, loadSeconds]);

  // Classificação dinâmica de qualidade do sinal baseada na latência detectada e estado do player:
  // Verde (< 450ms): Excelente / Conexão Forte
  // Amarelo (450ms - 1200ms): Moderada / Conexão Média
  // Vermelho (> 1200ms ou Rebuffering): Alta Latência / Conexão Instável
  const signalQuality = (() => {
    if (isBuffering && hasFirstFrame) {
      return {
        tier: 'red' as const,
        colorClass: 'text-rose-500',
        bgClass: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
        dotClass: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]',
        label: 'Instável / Buffer',
        shortLabel: 'Buffer',
        icon: SignalLow,
        latencyMs: Math.max(streamLatency, 1850),
      };
    }

    if (streamLatency < 450) {
      return {
        tier: 'green' as const,
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
        dotClass: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
        label: 'Excelente',
        shortLabel: 'Forte',
        icon: SignalHigh,
        latencyMs: streamLatency,
      };
    }

    if (streamLatency <= 1200) {
      return {
        tier: 'yellow' as const,
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        dotClass: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]',
        label: 'Moderada',
        shortLabel: 'Média',
        icon: SignalMedium,
        latencyMs: streamLatency,
      };
    }

    return {
      tier: 'red' as const,
      colorClass: 'text-rose-500',
      bgClass: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
      dotClass: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]',
      label: 'Alta Latência',
      shortLabel: 'Lenta',
      icon: SignalLow,
      latencyMs: streamLatency,
    };
  })();

  // Watchdog de failover inteligente e resgate contra telas intermináveis
  const streamsCount = streamsDisponiveis.length;
  useEffect(() => {
    if (hasFirstFrame || !canalAtivo || isCinemaMode || isStreamOffline) return;

    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      setLoadSeconds(seconds);

      // Aos 5s: se o sinal direto ainda não abriu e não é YouTube, tenta via proxy seguro (corrige bloqueios de CORS/SSL da emissora)
      if (seconds === 5 && !hasFirstFrame) {
        setTimeout(() => {
          if (
            !useProxy &&
            !activeRawStreamUrl.includes('youtube.com') &&
            !activeRawStreamUrl.includes('youtu.be')
          ) {
            onToggleProxyRef.current?.();
          }
        }, 0);
      }

      // Aos 9s: tenta servidor alternativo da lista se houver
      if (seconds === 9 && !hasFirstFrame) {
        setTimeout(() => {
          if (streamsCount > 1 && streamIndex < streamsCount - 1) {
            onStreamChangeRef.current?.(streamIndex + 1);
          }
        }, 0);
      }

      // Aos 13s: se ainda não abriu, aciona o sinal de contingência da categoria para garantir que a tela não fique preta
      if (seconds === 13 && !hasFirstFrame) {
        const emergencyStream = getEmergencyFallbackStream(canalAtivo.categoria);
        if (emergencyStream && emergencyStream !== activeRawStreamUrl) {
          setEmergencyOverrideUrl(emergencyStream);
        }
      }

      // Aos 18s: se persistir sem sinal após todas as tentativas (direto, proxy, backups e contingência),
      // declara o sinal offline e abre tela de resgate com contagem automática para o próximo canal
      if (seconds >= 18 && !hasFirstFrame) {
        clearInterval(interval);
        setIsBuffering(false);
        setIsStreamOffline(true);
        setOfflineAutoAdvanceSeconds(8);
        setTimeout(() => {
          onPlayerErrorRef.current?.(new Error('Sinal oficial fora do ar na emissora'));
        }, 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFirstFrame, canalAtivo?.id, canalAtivo?.categoria, streamsCount, streamIndex, useProxy, activeRawStreamUrl, isCinemaMode, isStreamOffline]);

  // Contagem regressiva para auto-avanço ao próximo canal quando o sinal de origem está fora do ar
  useEffect(() => {
    if (offlineAutoAdvanceSeconds === null || !onNextCanal) return;
    if (offlineAutoAdvanceSeconds <= 0) {
      setOfflineAutoAdvanceSeconds(null);
      onNextCanal();
      return;
    }
    const timer = setTimeout(() => {
      setOfflineAutoAdvanceSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [offlineAutoAdvanceSeconds, onNextCanal]);

  // Atalhos de teclado úteis
  useEffect(() => {
    if (isCinemaMode || isTransitioning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ']') {
        setTimeout(() => onNextCanalRef.current?.(), 0);
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        setTimeout(() => onPrevCanalRef.current?.(), 0);
      } else if (e.key.toLowerCase() === 'm') {
        setTimeout(() => onToggleMuteRef.current?.(), 0);
      } else if (e.key.toLowerCase() === 'f') {
        setTimeout(() => onEnterCinemaModeRef.current?.(), 0);
      } else if (e.key.toLowerCase() === 's') {
        setTimeout(() => onToggleLatencyModeRef.current?.(), 0);
      } else if (e.key.toLowerCase() === 'p') {
        handleTogglePip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinemaMode, isTransitioning]);

  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const [isPipActive, setIsPipActive] = useState(false);

  // Alternar Picture-in-Picture nativo do navegador
  const handleTogglePip = async () => {
    try {
      const videoEl = videoContainerRef.current?.querySelector('video');
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (videoEl && document.pictureInPictureEnabled) {
        await videoEl.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) {
      console.warn('Erro ao alternar Picture-in-Picture nativo:', err);
    }
  };

  // Monitorar eventos nativos de PiP para sincronizar estado visual
  useEffect(() => {
    const videoEl = videoContainerRef.current?.querySelector('video');
    if (!videoEl) return;

    const handleEnter = () => setIsPipActive(true);
    const handleLeave = () => setIsPipActive(false);

    videoEl.addEventListener('enterpictureinpicture', handleEnter);
    videoEl.addEventListener('leavepictureinpicture', handleLeave);

    return () => {
      videoEl.removeEventListener('enterpictureinpicture', handleEnter);
      videoEl.removeEventListener('leavepictureinpicture', handleLeave);
    };
  }, [hasFirstFrame, canalAtivo?.id, streamIndex]);

  // Pausa imperativa imediata do elemento de vídeo ao suspender (ex: ao entrar na Filmoteca)
  // e retoma imediatamente quando o usuário volta para a TV
  useEffect(() => {
    try {
      const videoEl = videoContainerRef.current?.querySelector('video');
      if (videoEl) {
        if (isPlaybackPaused) {
          if (!videoEl.paused) {
            videoEl.pause();
          }
        } else if (videoEl.paused && !isPlanExpired && !isChannelLockedByPlan) {
          videoEl.play().catch(() => {});
        }
      }
    } catch {
      // Ignora restrições do navegador
    }
  }, [isPlaybackPaused, isPlanExpired, isChannelLockedByPlan]);

  const handleReload = () => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setLoadSeconds(0);
    setIsStreamOffline(false);
    setOfflineAutoAdvanceSeconds(null);
    setEmergencyOverrideUrl(null);
    setTimeout(() => onClearFailoverNotice(), 0);
  };

  if (!canalAtivo) {
    const quickChannels = (todosCanais || []).slice(0, 6);

    return (
      <div
        id="player-hero-standby-container"
        className="flex flex-col items-center w-full max-w-4xl mx-auto select-none"
      >
        <div className="relative aspect-video w-full bg-[#08090c] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-zinc-800/60 ring-1 ring-white/5 flex flex-col items-center justify-center p-6 sm:p-10 text-center">
          {/* Header discreto: Status */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Transmissão Pronta</span>
            </div>
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline-block">
              {todosCanais?.length || 0} canais disponíveis
            </span>
          </div>

          {/* Área Central: Título Direto e Canais em Destaque */}
          <div className="flex flex-col items-center max-w-lg px-2 z-10 mt-3 sm:mt-0">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 shadow-md mb-3">
              <Tv className="w-6 h-6 text-zinc-300" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1.5">
              Escolha seu canal para assistir
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed mb-5">
              Selecione um canal na lista lateral ou toque em um dos destaques:
            </p>

            {/* Destaques de Canais Rápidos sem Poluição Visual */}
            {quickChannels.length > 0 && onSelectCanal && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                {quickChannels.map((c) => (
                  <button
                    key={c.id || c.url}
                    type="button"
                    onClick={() => onSelectCanal(c)}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/10 hover:border-white/20 text-xs font-semibold flex items-center gap-2.5 transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
                    title={`Sintonizar ${c.nome}`}
                  >
                    <img
                      src={getChannelLogo(c)}
                      alt=""
                      className="w-4 h-4 object-contain rounded-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getChannelFallbackLogo(c);
                      }}
                    />
                    <span className="truncate max-w-[120px]">{c.nome}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fundo suave com iluminação sutil */}
          <div className="absolute inset-0 bg-radial from-zinc-800/10 via-transparent to-black pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div
      id={isMiniMode ? 'player-hero-mini-floating' : 'player-hero-container'}
      className={
        isMiniMode
          ? 'fixed bottom-5 right-5 z-50 w-72 sm:w-84 bg-[#0c0c0e]/95 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl shadow-black/90 overflow-hidden flex flex-col ring-1 ring-zinc-700/50 select-none'
          : 'flex flex-col items-center w-full max-w-5xl mx-auto'
      }
    >
      {/* HEADER EXCLUSIVO DO MODO MINI-PIP FLUTUANTE */}
      {isMiniMode && (
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/80 select-none">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FF2D55]/10 text-[#FF2D55] text-[9px] font-extrabold border border-[#FF2D55]/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
              AO VIVO
            </span>

            {/* ÍCONE DE SINAL DINÂMICO NO MINI REPRODUTOR */}
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border bg-black/70 text-[9px] font-bold shrink-0 transition-colors ${
                signalQuality.tier === 'green'
                  ? 'border-emerald-500/30 text-emerald-400'
                  : signalQuality.tier === 'yellow'
                  ? 'border-amber-500/30 text-amber-400'
                  : 'border-rose-500/40 text-rose-500'
              }`}
              title={`Qualidade do Sinal: ${signalQuality.label} (${signalQuality.latencyMs}ms)`}
            >
              <signalQuality.icon className="w-2.5 h-2.5" />
              <span className="font-bold">{signalQuality.latencyMs}ms</span>
            </div>

            <span className="text-xs font-bold text-zinc-200 truncate">
              {canalAtivo.nome}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleTogglePip}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isPipActive
                  ? 'text-[#FF2D55] bg-[#FF2D55]/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title={isPipActive ? 'Sair do PiP nativo' : 'Picture-in-Picture nativo (janela do sistema)'}
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
            </button>
            {onRestoreFromMiniMode && (
              <button
                type="button"
                onClick={onRestoreFromMiniMode}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Expandir para tela principal"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDismissMiniMode && (
              <button
                type="button"
                onClick={onDismissMiniMode}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Fechar mini-reprodutor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SEÇÃO PRINCIPAL: VÍDEO CENTRALIZADO */}
      <div
        className={
          isMiniMode
            ? 'relative w-full'
            : 'relative flex flex-col items-center w-full'
        }
      >
        {/* CONTAINER DO VÍDEO COM CANTOS ARREDONDADOS E LINHA DE PROGRESSO */}
        <div
          id="tour-player-screen"
          ref={videoContainerRef}
          className={
            isMiniMode
              ? 'group relative aspect-video w-full bg-black overflow-hidden'
              : 'group relative aspect-video w-full max-w-4xl bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/90 border border-zinc-800/80 ring-1 ring-white/5'
          }
        >
          {/* REPRODUTOR DE VÍDEO */}
          <div className="w-full h-full">
            {!isCinemaMode ? (
              React.createElement(
                ReactPlayer as unknown as React.ComponentType<Record<string, unknown>>,
                {
                  ref: playerRef,
                  key: `${canalAtivo.id || canalAtivo.url}-${streamIndex}-${isCurrentlyProxied ? 'proxy' : 'direct'}-${latencyMode}-${videoQuality}`,
                  url: finalStreamUrl,
                  src: finalStreamUrl,
                  playing: !isPlaybackPaused && !isPlanExpired && !isChannelLockedByPlan,
                  muted: effectiveMuted,
                  controls: false,
                  width: '100%',
                  height: '100%',
                  playsinline: true,
                  config: {
                    file: {
                      forceHLS:
                        !finalStreamUrl.includes('youtube.com') &&
                        !finalStreamUrl.includes('youtu.be'),
                      hlsOptions: {
                        ...getHlsOptionsForLatencyMode(latencyMode, videoQuality),
                      },
                      attributes: {
                        autoPlay: true,
                        playsInline: true,
                      },
                    },
                    youtube: {
                      playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0,
                        controls: 0,
                      },
                    },
                  },
                  onReady: () => {
                    setIsReady(true);
                    try {
                      const hls = (playerRef.current as unknown as { getInternalPlayer: (type?: string) => unknown })?.getInternalPlayer('hls');
                      if (hls) {
                        applyQualityToHls(hls, videoQuality);
                      }
                    } catch {
                      // Silencioso
                    }
                  },
                  onStart: () => {
                    setIsReady(true);
                    setIsBuffering(false);
                    setHasFirstFrame(true);
                    try {
                      const hls = (playerRef.current as unknown as { getInternalPlayer: (type?: string) => unknown })?.getInternalPlayer('hls');
                      if (hls) {
                        applyQualityToHls(hls, videoQuality);
                      }
                    } catch {
                      // Silencioso
                    }
                  },
                  onPlay: () => {
                    setIsBuffering(false);
                    setHasFirstFrame(true);
                  },
                  onBuffer: () => setIsBuffering(true),
                  onBufferEnd: () => {
                    setIsBuffering(false);
                    setHasFirstFrame(true);
                    try {
                      const hls = (playerRef.current as unknown as { getInternalPlayer: (type?: string) => unknown })?.getInternalPlayer('hls');
                      if (hls) {
                        applyQualityToHls(hls, videoQuality);
                      }
                    } catch {
                      // Silencioso
                    }
                  },
                  onEnded: () => {
                    setTimeout(() => {
                      handlePlaybackFinished();
                    }, 0);
                  },
                  onError: (err: unknown, data?: unknown) => {
                    setTimeout(() => {
                      // Se o navegador rejeitou autoplay com áudio, muta para permitir reprodução visual contínua
                      if (err instanceof Error) {
                        if (
                          err.name === 'NotAllowedError' ||
                          err.message?.includes('play() failed') ||
                          err.message?.includes("user didn't interact")
                        ) {
                          if (!isMuted) {
                            onToggleMute();
                          }
                          return;
                        }
                        if (err.name === 'AbortError' || err.message?.includes('interrupted by a call to pause')) {
                          return;
                        }
                      }

                      // Se o Hls.js disparou erro não-fatal, permite que ele tente re-sincronizar
                      if (data && typeof data === 'object' && 'fatal' in data && !(data as { fatal: boolean }).fatal) {
                        return;
                      }

                      if (
                        activeRawStreamUrl.includes('youtube.com') ||
                        activeRawStreamUrl.includes('youtu.be')
                      ) {
                        setHasYouTubeEmbedError(true);
                      }

                      // Se a conexão direta falhou por CORS ou SSL da emissora, ativa automaticamente o proxy antes de descartar o canal
                      if (
                        !isCurrentlyProxied &&
                        !activeRawStreamUrl.includes('youtube.com') &&
                        !activeRawStreamUrl.includes('youtu.be')
                      ) {
                        onToggleProxyRef.current?.();
                        return;
                      }

                      // Se já tentou proxy e não há mais servidores disponíveis ou se o sinal falhou terminalmente
                      if (loadSeconds >= 10 || streamIndex >= streamsCount - 1) {
                        setIsBuffering(false);
                        setIsStreamOffline(true);
                        setOfflineAutoAdvanceSeconds(8);
                      }

                      onPlayerErrorRef.current?.(err);
                    }, 0);
                  },
                }
              )
            ) : (
              <div className="w-full h-full bg-black flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xs font-bold text-zinc-300">Modo Cinema Ativado</p>
              </div>
            )}
          </div>

          {/* SKELETON DE TRANSIÇÃO */}
          <AnimatePresence>
            {isTransitioning && (
              <motion.div
                key="hero-transition-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="absolute inset-0 z-30 pointer-events-none"
              >
                <PlayerTransitionSkeleton
                  canal={canalAtivo}
                  direction={transitionDirection || 'to-cinema'}
                  variant="hero"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* BLOQUEIO POR EXPIRAÇÃO DE PLANO */}
          {isPlanExpired && (
            <div
              id="player-plan-expired-overlay"
              className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl mb-3">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white max-w-md">Tempo de Acesso Expirado</h3>
              <div className="text-2xl font-bold text-rose-500 tracking-tight my-1 bg-black/60 px-4 py-1 rounded-xl border border-rose-500/30">
                00:00:00
              </div>
              <p className="text-xs text-zinc-400 font-normal max-w-md mt-1 leading-relaxed">
                O cronômetro da assinatura chegou ao fim. Para continuar assistindo à programação esportiva, renove seu plano ou ative seu código.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {onOpenPaymentPlans && (
                  <button
                    type="button"
                    onClick={onOpenPaymentPlans}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Ver Planos & Renovar</span>
                  </button>
                )}
                {onOpenRedeemToken && (
                  <button
                    type="button"
                    onClick={onOpenRedeemToken}
                    className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Ativar Código (5 Dígitos)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BLOQUEIO HIERÁRQUICO: CANAL EXIGE PLANO SUPERIOR (NUNCA ACESSÍVEL EM PLANO MAIS BAIXO) */}
          {!isPlanExpired && isChannelLockedByPlan && (
            <div
              id="player-channel-plan-locked-overlay"
              className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl mb-3">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold mb-2">
                <span>Canal Exclusivo do {requiredPlanInfo.name}</span>
              </div>
              <h3 className="text-lg font-black text-white max-w-md">
                Acesso Restrito ao Canal {canalAtivo.nome}
              </h3>
              <p className="text-xs text-zinc-300 max-w-md mt-2 leading-relaxed">
                Seu plano atual (<span className="text-white font-bold">{userPlanInfo.name}</span>) não inclui este canal.
                O canal <span className="text-amber-400 font-semibold">{canalAtivo.nome}</span> está liberado apenas a partir do plano{' '}
                <span className="text-[#00E676] font-bold">{requiredPlanInfo.name}</span>.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                {onOpenPaymentPlans && (
                  <button
                    type="button"
                    onClick={onOpenPaymentPlans}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-rose-600 hover:from-[#ff1744] hover:to-rose-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50 hover:scale-105 active:scale-95 transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Fazer Upgrade para {requiredPlanInfo.name}</span>
                  </button>
                )}
                {onOpenRedeemToken && (
                  <button
                    type="button"
                    onClick={onOpenRedeemToken}
                    className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center gap-1.5 border border-zinc-700 cursor-pointer transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Tenho Código de Ativação</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BACKDROP LIMPO E PROFISSIONAL DE CARREGAMENTO */}
          {!hasFirstFrame && !isStreamOffline && (
            <div
              id="player-signal-backdrop"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-[#080a0e] select-none text-center"
            >
              {/* Logo do Canal com indicador ao vivo */}
              <div className="relative mb-3.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900 border border-zinc-700/70 p-2.5 shadow-2xl flex items-center justify-center">
                  <img
                    src={getChannelLogo(canalAtivo)}
                    alt={canalAtivo.nome}
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getChannelFallbackLogo(canalAtivo);
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D55] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF2D55] border-2 border-black" />
                </span>
              </div>

              {/* Nome do Canal */}
              <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {canalAtivo.nome}
              </h4>

              {/* Status de Conexão e Barra de Sincronia */}
              <div className="mt-2.5 flex flex-col items-center w-full max-w-xs">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <div className="w-3 h-3 rounded-full border-2 border-[#FF2D55] border-t-transparent animate-spin shrink-0" />
                  <span>
                    {hasYouTubeEmbedError
                      ? 'Vídeo com restrição de incorporação'
                      : loadSeconds < 4
                      ? 'Conectando transmissão ao vivo...'
                      : loadSeconds < 8
                      ? 'Sintonizando fluxo e sincronizando buffer HD...'
                      : loadSeconds < 13
                      ? 'Otimizando sinal com servidor da emissora...'
                      : 'Verificando rotas alternativas...'}
                  </span>
                </div>

                {/* Barra de progresso sutil */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-[#FF2D55]"
                    initial={{ width: '18%' }}
                    animate={{ width: `${Math.min(94, Math.max(18, Math.round(18 + (loadSeconds / 18) * 76)))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Alternativas se demorar a carregar */}
              {(loadSeconds >= 5 || hasYouTubeEmbedError) && (
                <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
                  {videoQuality !== '360p' && onSelectVideoQuality && (
                    <button
                      type="button"
                      onClick={() => onSelectVideoQuality('360p')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 text-[#00E676] text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer transition shadow-sm animate-pulse"
                      title="Baixar resolução para 360p e reproduzir sem travar mesmo com sinal ruim"
                    >
                      <SignalLow className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>Baixar p/ 360p (Sinal Fraco)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReload}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Recarregar Sinal</span>
                  </button>
                  {streamsDisponiveis.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onStreamChange((streamIndex + 1) % streamsDisponiveis.length)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Alternar Sinal ({streamIndex + 1}/{streamsDisponiveis.length})</span>
                    </button>
                  )}
                  {onNextCanal && (
                    <button
                      type="button"
                      onClick={onNextCanal}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-[#FF2D55]" />
                      <span>Próximo Canal</span>
                    </button>
                  )}
                  {isYouTubeChannel && (
                    <button
                      type="button"
                      onClick={() => setIsChannelVideosOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-900 text-red-200 text-xs font-semibold border border-red-700/60 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Ver Vídeos</span>
                    </button>
                  )}
                  {isYouTubeChannel && hasYouTubeEmbedError && (
                    <a
                      href={activeRawStreamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Assistir no YouTube</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TELA LIMPA DE SINAL OFFLINE / RESGATE (NUNCA FICA PRESO POR HORAS) */}
          {isStreamOffline && (
            <div
              id="player-stream-offline-overlay"
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#10131a] via-[#090b0e] to-[#040507] select-none text-center"
            >
              {/* Ícone de Alerta com efeito de anel */}
              <div className="relative mb-3.5 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900/90 border border-amber-500/30 p-3 shadow-2xl flex items-center justify-center relative overflow-hidden">
                  <img
                    src={getChannelLogo(canalAtivo)}
                    alt={canalAtivo.nome}
                    className="w-full h-full object-contain opacity-35 grayscale"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getChannelFallbackLogo(canalAtivo);
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 drop-shadow-md animate-pulse" />
                  </div>
                </div>
                <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Sinal Offline
                </span>
              </div>

              {/* Título & Detalhes */}
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide mb-1">
                {canalAtivo.nome}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed mb-4">
                A emissora oficial deste canal encontra-se temporariamente sem transmissão ou o sinal oficial está fora do ar na origem.
              </p>

              {/* Contador de Auto-Avanço */}
              {offlineAutoAdvanceSeconds !== null && onNextCanal && (
                <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
                  <span>
                    Avançando para o próximo canal em <strong className="text-white font-mono">{offlineAutoAdvanceSeconds}s</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOfflineAutoAdvanceSeconds(null)}
                    className="ml-1 text-[11px] font-bold text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Pausar
                  </button>
                </div>
              )}

              {/* Ações Rápidas */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {onNextCanal && (
                  <button
                    type="button"
                    onClick={onNextCanal}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00E676] hover:from-emerald-500 hover:to-[#00E676] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4 fill-black" />
                    <span>Próximo Canal Agora</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReload}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Tentar Reconectar</span>
                </button>

                {streamsDisponiveis.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsStreamOffline(false);
                      setOfflineAutoAdvanceSeconds(null);
                      onStreamChange((streamIndex + 1) % streamsDisponiveis.length);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Testar Servidor Reserva ({streamIndex + 1}/{streamsDisponiveis.length})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SPINNER DISCRETO DE REBUFFERING */}
          {hasFirstFrame && isBuffering && (
            <div className="absolute top-3 right-3 z-30 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-2 text-xs text-white border border-zinc-800">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#FF2D55] border-t-transparent animate-spin" />
              <span className="text-[10px] text-zinc-400">Carregando...</span>
            </div>
          )}

          {/* STATUS DISCRETO DE TRANSMISSÃO EM TEMPO REAL */}
          <div
            id="player-signal-strength-badge"
            className="absolute top-3.5 left-3.5 z-25 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/65 border border-white/10 text-zinc-300 text-xs select-none shadow-lg"
            title={`Qualidade: ${signalQuality.label} • Latência: ${signalQuality.latencyMs}ms`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-semibold text-white tracking-wide">HD Ao Vivo</span>
            <span className="text-zinc-600 text-[10px]">•</span>
            <span className="text-[10px] text-zinc-400 font-medium">{signalQuality.latencyMs}ms</span>
          </div>

          {/* CONTROLES RÁPIDOS SOBRE O VÍDEO (HOVER SUAVE) */}
          {!isMiniMode && (
            <div className="absolute top-3.5 right-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
              <button
                type="button"
                id="player-quick-audio-btn"
                onClick={onToggleMute}
                className="w-9 h-9 rounded-full backdrop-blur-md bg-black/70 hover:bg-black text-zinc-200 hover:text-white border border-white/10 shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title={isMuted ? 'Ativar som (M)' : 'Silenciar áudio (M)'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-amber-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-zinc-200" />
                )}
              </button>
              <button
                type="button"
                id="player-quick-reload-btn"
                onClick={handleReload}
                className="w-9 h-9 rounded-full backdrop-blur-md bg-black/70 hover:bg-black text-zinc-200 hover:text-white border border-white/10 shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Recarregar transmissão"
              >
                <RefreshCw className="w-4 h-4 text-zinc-200" />
              </button>
              <button
                type="button"
                id="player-quick-pip-btn"
                onClick={handleTogglePip}
                className={`w-9 h-9 rounded-full backdrop-blur-md border shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                  isPipActive
                    ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                    : 'bg-black/70 hover:bg-black text-zinc-200 hover:text-white border-white/10'
                }`}
                title={isPipActive ? 'Sair do Picture-in-Picture' : 'Picture-in-Picture (PiP - Atalho P)'}
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="player-quick-settings-btn"
                onClick={() => setIsSettingsOpen(true)}
                className="w-9 h-9 rounded-full backdrop-blur-md bg-black/70 hover:bg-black text-zinc-200 hover:text-white border border-white/10 shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Configurações do Reprodutor (Modo Estável / Baixa Latência / Economia)"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                type="button"
                id="player-quick-cinema-btn"
                onClick={onEnterCinemaMode}
                className="w-9 h-9 rounded-full backdrop-blur-md bg-black/70 hover:bg-black text-zinc-200 hover:text-white border border-white/10 shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Modo Cinema (Atalho C)"
              >
                <Maximize2 className="w-4 h-4 text-zinc-200" />
              </button>
            </div>
          )}

          {/* OVERLAY DE NOTIFICAÇÃO DE FAILOVER */}
          {failoverNotice && (
            <div className="absolute top-12 left-3 right-3 z-30 bg-black/90 backdrop-blur-md border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{failoverNotice}</span>
              </div>
              <button
                type="button"
                onClick={onClearFailoverNotice}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* OVERLAY DE CONTAGEM REGRESSIVA DO AUTOPLAY INTELIGENTE */}
          <NextVideoAutoplayOverlay
            isOpen={isAutoplayCountdownActive}
            nextItem={autoplayTarget}
            onPlayNow={handlePlayNextItem}
            onCancel={handleCancelAutoplay}
            onOpenQueue={() => {
              handleCancelAutoplay();
              setIsQueueDrawerOpen(true);
            }}
          />
        </div>

        {/* BARRA INFERIOR INTEGRADA DO CANAL (LIMPA, MODERNA E PROFISSIONAL) */}
        {!isMiniMode && (
          <div
            id="player-channel-bar"
            className="w-full max-w-4xl mt-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-end gap-2 text-zinc-300 select-none shadow-xl backdrop-blur-xl transition-all"
          >
            {/* AÇÕES ESSENCIAIS E ORGANIZADAS */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap w-full justify-end">
              {/* BOTÃO ADORO (CORAÇÃO COM CONTADOR E PARTÍCULAS #ed3c5c) */}
              <div className="relative inline-flex items-center justify-center">
                <button
                  type="button"
                  id="player-action-adoro-btn"
                  onClick={handleToggleAdoro}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                    isLiked
                      ? 'bg-[#ed3c5c]/15 border-[#ed3c5c]/50 text-[#ed3c5c] shadow-sm shadow-[#ed3c5c]/20'
                      : 'bg-zinc-800/60 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                  title={isLiked ? 'Remover Adoro' : 'Adoro este canal'}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isLiked ? 'fill-[#ed3c5c] text-[#ed3c5c] scale-110' : ''
                    }`}
                  />
                  <span>{formatInteractionCount(adorosCount)}</span>
                  <span className="hidden sm:inline">Adoro</span>
                </button>

                {/* Explosão de Partículas #ed3c5c ao Adorar */}
                <AnimatePresence>
                  {adoroParticles.map((p) => {
                    const targetX = Math.cos(p.angle) * p.distance;
                    const targetY = Math.sin(p.angle) * p.distance;
                    return (
                      <motion.span
                        key={p.id}
                        initial={{ scale: 0.2, x: 0, y: 0, opacity: 1 }}
                        animate={{
                          scale: [0.2, 1.2, 0],
                          x: targetX,
                          y: targetY,
                          opacity: [1, 0.9, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: p.duration, ease: 'easeOut' }}
                        className="pointer-events-none absolute rounded-full shadow-sm"
                        style={{
                          width: `${p.size}px`,
                          height: `${p.size}px`,
                          backgroundColor: '#ed3c5c',
                          boxShadow: '0 0 8px #ed3c5c',
                        }}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* BOTÃO COMENTÁRIOS */}
              <button
                type="button"
                id="player-action-comment-btn"
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isCommentsOpen
                    ? 'bg-rose-500/20 border-rose-500/50 text-[#ed3c5c] shadow-sm'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
                }`}
                title="Ver e adicionar comentários ao vivo"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{formatInteractionCount(commentsCount)}</span>
                <span className="hidden sm:inline">Comentários</span>
              </button>

              {/* BOTÃO SALVAR / FAVORITAR */}
              <div className="relative inline-flex items-center justify-center">
                <button
                  type="button"
                  id="player-action-bookmark-btn"
                  onClick={handleBookmarkClick}
                  className={`relative p-2.5 rounded-xl border text-xs transition-all cursor-pointer active:scale-90 flex items-center justify-center ${
                    isFavorited
                      ? 'bg-[#ed3c5c]/15 border-[#ed3c5c]/50 text-[#ed3c5c] shadow-sm shadow-[#ed3c5c]/20'
                      : 'bg-zinc-800/60 hover:bg-zinc-800 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                  title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Bookmark className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-[#ed3c5c] text-[#ed3c5c] scale-110' : ''}`} />
                </button>

                {/* Explosão de Partículas #ed3c5c */}
                <AnimatePresence>
                  {bookmarkParticles.map((p) => {
                    const targetX = Math.cos(p.angle) * p.distance;
                    const targetY = Math.sin(p.angle) * p.distance;
                    return (
                      <motion.span
                        key={p.id}
                        initial={{ scale: 0.2, x: 0, y: 0, opacity: 1 }}
                        animate={{
                          scale: [0.2, 1.2, 0],
                          x: targetX,
                          y: targetY,
                          opacity: [1, 0.9, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: p.duration, ease: 'easeOut' }}
                        className="pointer-events-none absolute rounded-full shadow-sm"
                        style={{
                          width: `${p.size}px`,
                          height: `${p.size}px`,
                          backgroundColor: '#ed3c5c',
                          boxShadow: '0 0 8px #ed3c5c',
                        }}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* BOTÃO VÍDEOS DO CANAL (SE FOR YOUTUBE) */}
              {isYouTubeChannel && (
                <button
                  type="button"
                  id="player-action-channel-videos-btn"
                  onClick={() => setIsChannelVideosOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 text-red-200 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
                  title="Ver catálogo de vídeos deste canal"
                >
                  <Film className="w-4 h-4 text-red-400" />
                  <span className="hidden sm:inline">Vídeos</span>
                </button>
              )}

              {/* BOTÃO COMPARTILHAR / LINK PERSONALIZADO */}
              <button
                type="button"
                id="player-action-share-custom-link-btn"
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                title="Compartilhar link direto ou ver páginas com links personalizados"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>

              {/* BOTÃO AJUSTES / CONFIGURAÇÕES */}
              <button
                type="button"
                id="player-action-settings-btn"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
                title="Ajustes do Reprodutor (Modo Estável, Baixa Latência, Economia de Dados e Servidores)"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Ajustes</span>
              </button>

              {/* BOTÃO RÁPIDO DE QUALIDADE DE VÍDEO (360P SINAL FRACO / AUTO / HD) */}
              <button
                type="button"
                id="player-action-quality-btn"
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  videoQuality === '360p'
                    ? 'bg-emerald-500/20 border-[#00E676]/60 text-[#00E676] ring-1 ring-[#00E676]/30'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
                }`}
                title="Qualidade da Transmissão (Auto / 360p / 480p / 720p / 1080p). Se a internet estiver fraca, escolha 360p para não travar."
              >
                <SignalLow className={`w-4 h-4 ${videoQuality === '360p' ? 'text-[#00E676]' : 'text-zinc-400'}`} />
                <span className="hidden sm:inline">
                  {videoQuality === '360p' ? '360p (Sinal Fraco)' : videoQuality.toUpperCase()}
                </span>
                <span className="sm:hidden">
                  {videoQuality === '360p' ? '360p' : videoQuality.toUpperCase()}
                </span>
              </button>

              {/* BOTÃO MODO CINEMA */}
              <button
                type="button"
                id="player-action-cinema-btn"
                onClick={onEnterCinemaMode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
                title="Modo Cinema Expandido (Atalho C)"
              >
                <Maximize2 className="w-4 h-4 text-zinc-300" />
                <span>Cinema</span>
              </button>

              {/* PRÓXIMO CANAL */}
              {onNextCanal && (
                <button
                  type="button"
                  id="player-action-next-btn"
                  onClick={onNextCanal}
                  className="p-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Próximo canal (Atalho: N)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MINI CONTROLES INFERIORES DO MODO PIP FLUTUANTE */}
      {isMiniMode && (
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-t border-zinc-900 select-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevCanal}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Canal anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextCanal}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Próximo canal"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title={isMuted ? 'Ativar som' : 'Silenciar áudio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#FF2D55]" />
              ) : (
                <Volume2 className="w-4 h-4 text-zinc-200" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÕES DO REPRODUTOR (MODO ESTÁVEL / BAIXA LATÊNCIA / POUPANÇA) */}
      {isSettingsOpen && (
        <PlayerSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          latencyMode={latencyMode}
          onSelectLatencyMode={(mode) => onToggleLatencyMode(mode)}
          useProxy={useProxy}
          onToggleProxy={onToggleProxy}
          canalNome={canalAtivo?.nome}
          quality={videoQuality === '360p' ? '360p (Sinal Fraco)' : videoQuality.toUpperCase()}
          videoQuality={videoQuality}
          onSelectVideoQuality={onSelectVideoQuality}
          streamsDisponiveis={streamsDisponiveis}
          streamIndex={streamIndex}
          onSelectStream={onStreamChange}
        />
      )}

      {/* MODAL / PAINEL VER MAIS VÍDEOS DO CANAL (REPRODUZ 100% NO REPRODUTOR DO SISTEMA) */}
      <ChannelVideosModal
        isOpen={isChannelVideosOpen}
        onClose={() => setIsChannelVideosOpen(false)}
        canal={canalAtivo}
        streamIndex={streamIndex}
        onSelectStream={(idx) => {
          onStreamChange(idx);
          setEmergencyOverrideUrl(null);
          setHasYouTubeEmbedError(false);
        }}
        onAddStreamUrl={onAddStreamUrl}
      />

      {/* GAVETA LATERAL DE FILA DE PRÓXIMOS VÍDEOS E HISTÓRICO */}
      <NextVideosQueueDrawer
        isOpen={isQueueDrawerOpen}
        onClose={() => setIsQueueDrawerOpen(false)}
        queueItems={queueItems}
        currentCanal={canalAtivo}
        currentStreamIndex={streamIndex}
        onSelectQueueItem={(item) => {
          handlePlayNextItem(item);
          setIsQueueDrawerOpen(false);
        }}
        onClearHistory={() => {
          autoplayQueueService.clearHistory();
          if (canalAtivo) {
            setQueueItems(
              autoplayQueueService.buildQueue(canalAtivo, streamIndex, todosCanais || [])
            );
          }
        }}
      />

      {/* GAVETA DE COMENTÁRIOS AO VIVO */}
      <PlayerCommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        canalNome={canalAtivo?.nome || 'Canal'}
        comments={commentsList}
        onSendComment={handleSendComment}
        onToggleCommentAdoro={handleToggleCommentAdoro}
        onDeleteComment={handleDeleteComment}
        isSubmitting={isSubmittingComment}
        currentUserId={getEffectiveVisitorId(userProfile?.id)}
        isAdmin={isAdmin}
      />

      {/* MODAL DE COMPARTILHAMENTO E LINKS PERSONALIZADOS */}
      <ChannelShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        canal={canalAtivo}
        customPages={customPages}
        onNavigateToCustomPage={onNavigateToCustomPage}
      />
    </div>
  );
}
