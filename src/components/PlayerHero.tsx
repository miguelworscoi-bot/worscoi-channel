'use client';
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
  Heart,
  MessageCircle,
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
  X,
  Send,
  PictureInPicture2,
  Maximize2,
  Sliders,
  Zap,
  SkipForward,
  Play,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Film,
  Trash2,
} from 'lucide-react';
import { Canal, LatencyMode } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import {
  getSafeStreamUrl,
  isStreamAutoProxied,
  getHlsOptionsForLatencyMode,
  getEmergencyFallbackStream,
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
import {
  getVideoItemSlug,
  subscribeChannelStats,
  toggleChannelAdoro,
  subscribeChannelComments,
  addChannelComment,
  deleteChannelComment,
  formatInteractionCount,
  formatRelativeTime,
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
}: PlayerHeroProps) {
  const { userProfile, isAdmin, countdown, isSubscriptionExpired } = useAuth();
  const isPlanExpired = !isAdmin && (isSubscriptionExpired || countdown.expired || isUserPlanExpired(userProfile));
  const channelAccess = canUserWatchChannel(canalAtivo, userProfile);
  const isChannelLockedByPlan = !isAdmin && !channelAccess.allowed && channelAccess.reason === 'plan_too_low';
  const requiredPlanInfo = PLANS[channelAccess.requiredPlan] || PLANS.vip;
  const userPlanInfo = PLANS[channelAccess.userPlan] || PLANS.free;

  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [hasYouTubeEmbedError, setHasYouTubeEmbedError] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [playedPercent, setPlayedPercent] = useState(45);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChannelVideosOpen, setIsChannelVideosOpen] = useState(false);

  // Estados de recuperação inteligente de streaming
  const [isRescueActive, setIsRescueActive] = useState(false);
  const [rescueCountdown, setRescueCountdown] = useState(6);
  const [isRescuePaused, setIsRescuePaused] = useState(false);
  const [emergencyOverrideUrl, setEmergencyOverrideUrl] = useState<string | null>(null);

  // Monitor de latência e qualidade da transmissão em tempo real
  const [streamLatency, setStreamLatency] = useState<number>(() => {
    if (latencyMode === 'low-latency') return 120;
    if (latencyMode === 'economy') return 280;
    return 180;
  });
  const [_isMeasuringLatency, setIsMeasuringLatency] = useState(false);

  // Estados sociais interativos reais (Adoros e Comentários persistentes no Firestore)
  const [isLiked, setIsLiked] = useState(false);
  const [adorosCount, setAdorosCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<ChannelComment[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Estados da Fila de Próximos Vídeos e Reprodução Contínua (Autoplay)
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [autoplayTarget, setAutoplayTarget] = useState<QueueItem | null>(null);
  const [isAutoplayCountdownActive, setIsAutoplayCountdownActive] = useState(false);

  const streamsDisponiveis = canalAtivo
    ? [canalAtivo.url, ...(canalAtivo.backupUrls || [])]
    : [];
  const activeRawStreamUrl =
    canalAtivo && streamsDisponiveis[streamIndex]
      ? streamsDisponiveis[streamIndex]
      : canalAtivo?.url || '';

  // Atualiza a fila de reprodução inteligente e grava no histórico do usuário
  useEffect(() => {
    if (!canalAtivo) return;
    const items = autoplayQueueService.buildQueue(
      canalAtivo,
      streamIndex,
      todosCanais || []
    );
    setQueueItems(items);
    autoplayQueueService.addToWatchHistory(canalAtivo, streamIndex, activeRawStreamUrl);
  }, [canalAtivo, streamIndex, todosCanais, activeRawStreamUrl]);

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

  // Sincronização em tempo real de Adoros e Comentários reais com Firestore para o vídeo selecionado
  useEffect(() => {
    if (!canalAtivo) {
      setIsLiked(false);
      setAdorosCount(0);
      setCommentsCount(0);
      setCommentsList([]);
      return;
    }

    // Identificador único do canal e do vídeo/stream ativo
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);

    // Listener em tempo real (onSnapshot) para contadores de adoros e comentários no Firestore
    const unsubStats = subscribeChannelStats(videoSlug, effectiveUserId, (stats) => {
      setIsLiked(stats.userHasAdorado);
      setAdorosCount(stats.adorosCount);
      setCommentsCount(stats.commentsCount);
    });

    // Listener em tempo real (onSnapshot) para a lista de comentários no Firestore
    const unsubComments = subscribeChannelComments(videoSlug, (comments) => {
      setCommentsList(comments);
    });

    return () => {
      unsubStats();
      unsubComments();
    };
  }, [canalAtivo?.id, canalAtivo?.nome, streamIndex, activeRawStreamUrl, userProfile?.id]);
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
    setIsRescueActive(false);
    setRescueCountdown(6);
    setIsRescuePaused(false);
    setEmergencyOverrideUrl(null);
    setPlayedPercent(35);
    setShowComments(false);
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
                    onStreamChange?.(existingIndex);
                  } else if (onAddStreamUrl) {
                    onAddStreamUrl(newUrl);
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
  }, [activeRawStreamUrl, canalAtivo, onStreamChange, onAddStreamUrl]);

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
  useEffect(() => {
    if (hasFirstFrame || !canalAtivo || isCinemaMode) return;

    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      setLoadSeconds(seconds);

      // Aos 3.5s: tenta servidor alternativo ou ativa proxy
      if (seconds === 4 && !hasFirstFrame) {
        setTimeout(() => {
          if (streamsDisponiveis.length > 1 && streamIndex < streamsDisponiveis.length - 1) {
            onStreamChange(streamIndex + 1);
          } else if (
            !useProxy &&
            !activeRawStreamUrl.includes('youtube.com') &&
            !activeRawStreamUrl.includes('youtu.be')
          ) {
            onToggleProxy();
          }
        }, 0);
      }

      // Aos 6s: se ainda não abriu, aciona a central de resgate para não intediar o espectador
      if (seconds >= 6 && !hasFirstFrame) {
        setIsRescueActive(true);
      }

      if (seconds === 8 && !hasFirstFrame) {
        setTimeout(() => {
          onPlayerError(new Error('Tempo limite de conexão'));
        }, 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFirstFrame, canalAtivo, streamsDisponiveis.length, streamIndex, useProxy, onStreamChange, onToggleProxy, onPlayerError, activeRawStreamUrl, isCinemaMode]);

  // Contagem regressiva de auto-resgate para nunca travar o usuário
  useEffect(() => {
    if (!isRescueActive || hasFirstFrame || isRescuePaused || isCinemaMode) return;

    let countdown = rescueCountdown;
    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(timer);
        setRescueCountdown(0);
        setTimeout(() => {
          if (onNextCanal) {
            onNextCanal();
          } else {
            setEmergencyOverrideUrl(getEmergencyFallbackStream(canalAtivo?.categoria));
          }
        }, 0);
      } else {
        setRescueCountdown(countdown);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRescueActive, hasFirstFrame, isRescuePaused, isCinemaMode, onNextCanal, canalAtivo?.categoria]);

  // Atalhos de teclado úteis
  useEffect(() => {
    if (isCinemaMode || isTransitioning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ']') {
        setTimeout(() => onNextCanal?.(), 0);
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        setTimeout(() => onPrevCanal?.(), 0);
      } else if (e.key.toLowerCase() === 'm') {
        setTimeout(() => onToggleMute(), 0);
      } else if (e.key.toLowerCase() === 'f') {
        setTimeout(() => onEnterCinemaMode(), 0);
      } else if (e.key.toLowerCase() === 's') {
        setTimeout(() => onToggleLatencyMode(), 0);
      } else if (e.key.toLowerCase() === 'p') {
        handleTogglePip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextCanal, onPrevCanal, onToggleMute, onEnterCinemaMode, onToggleLatencyMode, isCinemaMode, isTransitioning]);

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

  const handleToggleLike = async () => {
    if (!canalAtivo) return;
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    const res = await toggleChannelAdoro(videoSlug, canalAtivo.nome, effectiveUserId);
    setIsLiked(res.userHasAdorado);
    setAdorosCount(res.adorosCount);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !canalAtivo || isSubmittingComment) return;

    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    const effectiveUserName =
      userProfile?.displayName ||
      (userProfile?.email ? userProfile.email.split('@')[0] : 'Assinante');
    const effectiveUserPhoto = userProfile?.photoURL || null;
    const effectiveUserPlan = userProfile?.planName || userProfile?.plan || null;

    const commentText = newComment.trim();
    setNewComment('');
    setIsSubmittingComment(true);

    try {
      await addChannelComment({
        channelSlug: videoSlug,
        channelName: canalAtivo.nome,
        userId: effectiveUserId,
        userName: effectiveUserName,
        userPhoto: effectiveUserPhoto,
        userPlan: effectiveUserPlan,
        text: commentText,
      });
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!canalAtivo) return;
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);
    try {
      await deleteChannelComment(commentId, videoSlug);
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
    }
  };

  const handleReload = () => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setLoadSeconds(0);
    setTimeout(() => onClearFailoverNotice(), 0);
  };

  if (!canalAtivo) {
    const quickChannels = (todosCanais || []).slice(0, 6);

    return (
      <div
        id="player-hero-standby-container"
        className="flex flex-col items-center w-full max-w-4xl mx-auto select-none"
      >
        <div className="relative aspect-video w-full bg-[#090b0e] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-zinc-800/80 ring-1 ring-white/5 flex flex-col items-center justify-between p-5 sm:p-8 text-center">
          {/* Top Bar: Status Badge */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Transmissão Pronta</span>
            </div>
            <span className="text-xs text-zinc-400 font-normal hidden sm:inline-block">
              {todosCanais?.length || 0} canais disponíveis
            </span>
          </div>

          {/* Central Area: Standby Title & Fast Channels */}
          <div className="flex flex-col items-center my-auto max-w-lg px-2 z-10">
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-xl mb-3.5">
              <Tv className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-300" />
            </div>

            <h3 className="text-base sm:text-xl font-bold text-white tracking-tight mb-1.5">
              Escolha seu canal para assistir
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed mb-4">
              Selecione um canal na barra lateral ou sintonize um dos destaques abaixo:
            </p>

            {/* Botões de canais rápidos de início */}
            {quickChannels.length > 0 && onSelectCanal && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                {quickChannels.map((c) => (
                  <button
                    key={c.id || c.url}
                    type="button"
                    onClick={() => onSelectCanal(c)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm group active:scale-95"
                    title={`Sintonizar ${c.nome}`}
                  >
                    <img
                      src={getChannelLogo(c)}
                      alt=""
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getChannelFallbackLogo(c);
                      }}
                    />
                    <span className="truncate max-w-[120px]">{c.nome}</span>
                    <Play className="w-3 h-3 text-[#FF2D55] group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Bar: Instructions */}
          <div className="w-full flex items-center justify-center pt-2 z-10 border-t border-zinc-900 text-[11px] text-zinc-500">
            <span>Selecione qualquer canal para iniciar a transmissão ao vivo</span>
          </div>

          {/* Fundo suave com iluminação sutil */}
          <div className="absolute inset-0 bg-radial from-zinc-900/20 via-transparent to-black pointer-events-none" />
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
                  key: `${canalAtivo.id || canalAtivo.url}-${streamIndex}-${isCurrentlyProxied ? 'proxy' : 'direct'}-${latencyMode}`,
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
                        ...getHlsOptionsForLatencyMode(latencyMode),
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
                  onReady: () => setIsReady(true),
                  onStart: () => {
                    setIsReady(true);
                    setIsBuffering(false);
                    setHasFirstFrame(true);
                  },
                  onPlay: () => {
                    setIsBuffering(false);
                    setHasFirstFrame(true);
                  },
                  onProgress: (state: { played: number }) => {
                    if (state && typeof state.played === 'number' && state.played > 0) {
                      setPlayedPercent(Math.min(100, Math.max(5, state.played * 100)));
                    }
                  },
                  onBuffer: () => setIsBuffering(true),
                  onBufferEnd: () => {
                    setIsBuffering(false);
                    setHasFirstFrame(true);
                  },
                  onEnded: () => {
                    setTimeout(() => {
                      handlePlaybackFinished();
                    }, 0);
                  },
                  onError: (err: unknown) => {
                    setTimeout(() => {
                      if (
                        activeRawStreamUrl.includes('youtube.com') ||
                        activeRawStreamUrl.includes('youtu.be')
                      ) {
                        setHasYouTubeEmbedError(true);
                      }
                      onPlayerError(err);
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
          {!hasFirstFrame && (
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
                      : 'Sincronizando sinal HD...'}
                  </span>
                </div>

                {/* Barra de progresso sutil */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-[#FF2D55]"
                    initial={{ width: '20%' }}
                    animate={{ width: `${Math.min(95, Math.max(30, (loadSeconds + 1) * 20))}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Alternativas se demorar a carregar */}
              {(loadSeconds >= 5 || hasYouTubeEmbedError) && (
                <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
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
                </div>
              )}
            </div>
          )}

          {/* SPINNER DISCRETO DE REBUFFERING */}
          {hasFirstFrame && isBuffering && (
            <div className="absolute top-3 right-3 z-30 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-2 text-xs text-white border border-zinc-800">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#FF2D55] border-t-transparent animate-spin" />
              <span className="text-[10px] text-zinc-400">Carregando...</span>
            </div>
          )}

          {/* ÍCONE DINÂMICO DE QUALIDADE DO SINAL & LATÊNCIA (VERDE / AMARELO / VERMELHO) */}
          <div
            id="player-signal-strength-badge"
            className={`absolute top-3 left-3 z-25 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 select-none bg-black/70 ${
              signalQuality.tier === 'green'
                ? 'border-emerald-500/40 hover:border-emerald-500/70 text-emerald-400 shadow-emerald-950/20'
                : signalQuality.tier === 'yellow'
                ? 'border-amber-500/40 hover:border-amber-500/70 text-amber-400 shadow-amber-950/20'
                : 'border-rose-500/50 hover:border-rose-500/80 text-rose-500 shadow-rose-950/30'
            }`}
            title={`Qualidade do Sinal: ${signalQuality.label} • Latência detectada: ${signalQuality.latencyMs}ms`}
          >
            <div className="relative flex items-center justify-center">
              <signalQuality.icon className={`w-3.5 h-3.5 ${signalQuality.colorClass} transition-colors duration-300`} />
              {signalQuality.tier === 'red' && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>

            <span className={`text-[10px] font-bold ${signalQuality.colorClass} tracking-tight`}>
              {signalQuality.latencyMs}ms
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold text-zinc-300">
              <span className={`w-1 h-1 rounded-full ${signalQuality.dotClass}`} />
              {signalQuality.shortLabel}
            </span>
          </div>

          {/* BOTÕES RÁPIDOS NO VÍDEO: ÁUDIO, RECARREGAR, MODO CINEMA, AJUSTES E PICTURE-IN-PICTURE (HOVER) */}
          {!isMiniMode && (
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
              <button
                type="button"
                id="player-quick-audio-btn"
                onClick={onToggleMute}
                className="p-2 rounded-full backdrop-blur-md border shadow-lg transition cursor-pointer flex items-center justify-center bg-black/70 hover:bg-black text-zinc-200 hover:text-white border-zinc-700/60"
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
                className="p-2 rounded-full backdrop-blur-md border shadow-lg transition cursor-pointer flex items-center justify-center bg-black/70 hover:bg-black text-zinc-200 hover:text-white border-zinc-700/60"
                title="Recarregar transmissão"
              >
                <RefreshCw className="w-4 h-4 text-zinc-200" />
              </button>
              <button
                type="button"
                id="player-quick-cinema-btn"
                onClick={onEnterCinemaMode}
                className="p-2 rounded-full backdrop-blur-md border shadow-lg transition cursor-pointer flex items-center justify-center bg-black/70 hover:bg-black text-zinc-200 hover:text-white border-zinc-700/60"
                title="Modo Cinema (Atalho C)"
              >
                <Maximize2 className="w-4 h-4 text-zinc-200" />
              </button>
              <button
                type="button"
                id="player-quick-settings-btn"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full backdrop-blur-md border shadow-lg transition cursor-pointer flex items-center justify-center bg-black/70 hover:bg-black text-zinc-200 hover:text-white border-zinc-700/60"
                title="Configurações do reprodutor (Modo Estável / Baixa Latência)"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                type="button"
                id="player-quick-pip-btn"
                onClick={handleTogglePip}
                className={`p-2 rounded-full backdrop-blur-md border shadow-lg transition cursor-pointer flex items-center justify-center ${
                  isPipActive
                    ? 'bg-[#FF2D55] text-white border-[#FF2D55] shadow-[#FF2D55]/30'
                    : 'bg-black/70 hover:bg-black text-zinc-200 hover:text-white border-zinc-700/60'
                }`}
                title={isPipActive ? 'Sair do Picture-in-Picture' : 'Abrir Picture-in-Picture (PiP - Atalho P)'}
              >
                <PictureInPicture2 className="w-4 h-4" />
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

          {/* LINHA DE PROGRESSO ELEGANTE */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-900/80 z-20 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all duration-300"
              style={{ width: `${Math.max(15, playedPercent)}%` }}
            />
          </div>
        </div>

        {/* BARRA INFERIOR INTEGRADA DO CANAL (LIMPA, MODERNA E PROFISSIONAL) */}
        {!isMiniMode && (
          <div
            id="player-channel-bar"
            className="w-full max-w-4xl mt-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-zinc-300 select-none shadow-lg backdrop-blur-md"
          >
            {/* LADO ESQUERDO: INFO DO CANAL */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={getChannelLogo(canalAtivo)}
                  alt={canalAtivo.nome}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getChannelFallbackLogo(canalAtivo);
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-900" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[170px] sm:max-w-[260px]">
                    {canalAtivo.nome}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/30 shrink-0">
                    AO VIVO
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span className="truncate">{canalAtivo.categoria || 'Geral'}</span>
                  {streamsDisponiveis.length > 1 && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <button
                        type="button"
                        onClick={() => onStreamChange((streamIndex + 1) % streamsDisponiveis.length)}
                        className="hover:text-amber-400 text-zinc-400 transition cursor-pointer flex items-center gap-1 font-medium"
                        title="Alternar servidor de transmissão"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Sinal {streamIndex + 1}/{streamsDisponiveis.length}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* LADO DIREITO: AÇÕES LIMPAS */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              {/* BOTÃO ADORO / LIKE */}
              <button
                type="button"
                id="player-action-like-btn"
                onClick={handleToggleLike}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  isLiked
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white'
                }`}
                title={isLiked ? 'Remover Adoro' : 'Adorar canal'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'}`} />
                <span>{formatInteractionCount(adorosCount)}</span>
              </button>

              {/* BOTÃO COMENTÁRIOS */}
              <button
                type="button"
                id="player-action-comment-btn"
                onClick={() => setShowComments((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  showComments
                    ? 'bg-[#FF2D55]/15 border-[#FF2D55]/40 text-[#FF2D55]'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white'
                }`}
                title="Comentários ao Vivo"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{formatInteractionCount(commentsCount)}</span>
              </button>

              {/* BOTÃO SALVAR / FAVORITAR */}
              <button
                type="button"
                id="player-action-bookmark-btn"
                onClick={onToggleFavorite}
                className={`p-2 rounded-xl border text-xs transition cursor-pointer active:scale-95 ${
                  isFavorited
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white'
                }`}
                title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              {/* BOTÃO VÍDEOS (YOUTUBE) */}
              {isYouTubeChannel && (
                <button
                  type="button"
                  id="player-action-channel-videos-btn"
                  onClick={() => setIsChannelVideosOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-red-900/30 hover:bg-red-900/50 border border-red-500/40 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Ver catálogo de vídeos deste canal"
                >
                  <Film className="w-4 h-4 text-red-400" />
                  <span className="hidden sm:inline">Vídeos</span>
                </button>
              )}

              {/* BOTÃO AJUSTES / CONFIGURAÇÕES */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs transition cursor-pointer active:scale-95"
                title="Ajustes do Reprodutor"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
              </button>

              {/* PRÓXIMO CANAL */}
              {onNextCanal && (
                <button
                  type="button"
                  onClick={onNextCanal}
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs transition cursor-pointer active:scale-95"
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

      {/* GAVETA ELEGANTE DE COMENTÁRIOS REAIS SINCRONIZADOS */}
      <AnimatePresence>
        {!isMiniMode && showComments && (
          <motion.div
            key="player-comments-drawer"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-4xl mt-3 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800 text-zinc-200 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#FF2D55]" />
                <h4 className="text-xs font-bold text-white">
                  Comentários ao Vivo ({commentsList.length})
                </h4>
                <span className="text-[10px] text-zinc-500 font-medium">
                  • {canalAtivo?.nome}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="text-zinc-500 hover:text-white p-1 cursor-pointer transition-colors"
                title="Fechar comentários"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LISTA DE COMENTÁRIOS REAIS */}
            <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-2 mb-3 pr-1">
              {commentsList.length === 0 ? (
                <div className="py-6 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-2">
                    <MessageCircle className="w-5 h-5 text-zinc-500" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-400">
                    Nenhum comentário ou adoro registrado ainda neste canal.
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Seja o primeiro a interagir e deixar sua mensagem!
                  </p>
                </div>
              ) : (
                commentsList.map((comm) => {
                  const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
                  const isAuthor = comm.userId === effectiveUserId || isAdmin;

                  return (
                    <div
                      key={comm.id}
                      className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60 text-xs text-zinc-300 flex items-start gap-2.5 group"
                    >
                      {comm.userPhoto ? (
                        <img
                          src={comm.userPhoto}
                          alt={comm.userName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-700"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF2D55] to-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                          {comm.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-white text-[11px]">
                              {comm.userName}
                            </span>
                            {comm.userPlan && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/30">
                                {comm.userPlan}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-400 font-normal">
                              {formatRelativeTime(comm.createdAt)}
                            </span>
                            {isAuthor && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comm.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                                title="Excluir comentário"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="leading-snug text-zinc-200 text-xs break-words">
                          {comm.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FORMULÁRIO DE NOVO COMENTÁRIO */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar um comentário ao vivo..."
                maxLength={400}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2D55]"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-3.5 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white font-bold text-xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>{isSubmittingComment ? 'Enviando...' : 'Enviar'}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
          quality="HD"
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
    </div>
  );
}
