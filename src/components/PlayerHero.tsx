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
  ShieldCheck,
  Zap,
  SkipForward,
  Sparkles,
  Radio,
  RotateCcw,
  Play,
  Pause,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Film,
} from 'lucide-react';
import { Canal, LatencyMode } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import {
  getSafeStreamUrl,
  isStreamAutoProxied,
  getHlsOptionsForLatencyMode,
  SPORTS_TRIVIA,
  getEmergencyFallbackStream,
} from '@/utils/streamUtils';
import { useAuth } from '@/context/AuthContext';
import { isUserPlanExpired } from '@/services/subscriptionService';
import { PlayerTransitionSkeleton } from './PlayerTransitionSkeleton';
import { PlayerSettingsModal } from './PlayerSettingsModal';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';
import { ChannelVideosModal, extractYouTubeId } from './ChannelVideosModal';

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
}: PlayerHeroProps) {
  const { userProfile, isAdmin, countdown, isSubscriptionExpired } = useAuth();
  const isPlanExpired = !isAdmin && (isSubscriptionExpired || countdown.expired || isUserPlanExpired(userProfile));

  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [hasYouTubeEmbedError, setHasYouTubeEmbedError] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [playedPercent, setPlayedPercent] = useState(45);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChannelVideosOpen, setIsChannelVideosOpen] = useState(false);

  // Estados anti-tédio e recuperação inteligente de streaming
  const [triviaIndex, setTriviaIndex] = useState(0);
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

  // Estados sociais interativos (Curtir e Comentários estilo Shorts/TikTok)
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<string>('1.8M');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([
    'Melhor qualidade de transmissão!',
    'Som e imagem impecáveis 🔥',
    'Assistindo direto de Luanda 🇦🇴',
    'Excelente velocidade, sem travar!',
  ]);

  // Áudio suavizado durante transição entre componentes para evitar picos
  const effectiveMuted = isMuted || isAudioTransitionMuted;

  const streamsDisponiveis = canalAtivo
    ? [canalAtivo.url, ...(canalAtivo.backupUrls || [])]
    : [];
  const activeRawStreamUrl =
    canalAtivo && streamsDisponiveis[streamIndex]
      ? streamsDisponiveis[streamIndex]
      : canalAtivo?.url || '';
  const rawStreamToPlay = emergencyOverrideUrl || activeRawStreamUrl;
  const finalStreamUrl = emergencyOverrideUrl
    ? emergencyOverrideUrl
    : getSafeStreamUrl(activeRawStreamUrl, useProxy);
  const isCurrentlyProxied = isStreamAutoProxied(rawStreamToPlay, useProxy);

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
    setIsLiked(false);
    setShowComments(false);
    setLikesCount(canalAtivo?.likesCount || '1.8M');
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
        if (data && (data.event === 'infoDelivery' || data.event === 'initialDelivery')) {
          const videoData = data.info?.videoData;
          if (videoData && videoData.video_id) {
            const currentVideoId = extractYouTubeId(activeRawStreamUrl);
            if (currentVideoId && videoData.video_id !== currentVideoId) {
              const newUrl = `https://www.youtube.com/watch?v=${videoData.video_id}`;
              if (canalAtivo) {
                const allUrls = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
                const existingIndex = allUrls.findIndex((u) => u.includes(videoData.video_id));
                if (existingIndex >= 0) {
                  onStreamChange(existingIndex);
                } else if (onAddStreamUrl) {
                  onAddStreamUrl(newUrl);
                }
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

    // Primeira checagem rápida após 1s de montagem
    const initTimer = setTimeout(measureStreamLatency, 1000);
    // Intervalo de medição contínua a cada 7 segundos
    const interval = setInterval(measureStreamLatency, 7000);

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

  // Rotaciona curiosidades esportivas a cada 3.5s para entreter enquanto carrega
  useEffect(() => {
    if (hasFirstFrame || isCinemaMode) return;
    const triviaTimer = setInterval(() => {
      setTriviaIndex((prev) => (prev + 1) % SPORTS_TRIVIA.length);
    }, 3500);
    return () => clearInterval(triviaTimer);
  }, [hasFirstFrame, isCinemaMode]);

  // Watchdog de failover inteligente e resgate contra telas intermináveis
  useEffect(() => {
    if (hasFirstFrame || !canalAtivo || isCinemaMode) return;

    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      setLoadSeconds(seconds);

      // Aos 3.5s: tenta servidor alternativo ou ativa proxy
      if (seconds === 4 && !hasFirstFrame) {
        if (streamsDisponiveis.length > 1 && streamIndex < streamsDisponiveis.length - 1) {
          onStreamChange(streamIndex + 1);
        } else if (
          !useProxy &&
          !activeRawStreamUrl.includes('youtube.com') &&
          !activeRawStreamUrl.includes('youtu.be')
        ) {
          onToggleProxy();
        }
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
        onNextCanal?.();
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        onPrevCanal?.();
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        onEnterCinemaMode();
      } else if (e.key.toLowerCase() === 's') {
        onToggleLatencyMode();
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

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList((prev) => [newComment.trim(), ...prev]);
    setNewComment('');
  };

  const handleReload = () => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setLoadSeconds(0);
    onClearFailoverNotice();
  };

  const suggestedChannels = (todosCanais || [])
    .filter((c) => c.id !== canalAtivo?.id && (c.categoria === canalAtivo?.categoria || c.categoria === 'Esportes'))
    .slice(0, 3);

  if (!canalAtivo) {
    return (
      <div
        id="player-hero-placeholder"
        className="w-full aspect-video bg-[#0c0c0e] border border-zinc-900 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mb-4 border border-zinc-800">
          <Tv className="w-8 h-8 text-zinc-500 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-zinc-200 mb-1">Nenhum canal selecionado</h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          Selecione um canal na grade lateral para iniciar a reprodução.
        </p>
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
              <span className="font-mono">{signalQuality.latencyMs}ms</span>
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

      {/* SEÇÃO PRINCIPAL: VÍDEO CENTRALIZADO + BARRA LATERAL VERTICAL DE AÇÕES */}
      <div
        className={
          isMiniMode
            ? 'relative w-full'
            : 'relative flex items-end justify-center gap-3 sm:gap-4 w-full'
        }
      >
        {/* CONTAINER DO VÍDEO COM CANTOS ARREDONDADOS E LINHA DE PROGRESSO VERMELHA */}
        <div
          ref={videoContainerRef}
          className={
            isMiniMode
              ? 'group relative aspect-video w-full bg-black overflow-hidden'
              : 'group relative aspect-video w-full max-w-[860px] bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-zinc-900/80 ring-1 ring-zinc-800/40'
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
                  playing: !isPlanExpired,
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
                      onVideoEnded?.();
                    }, 0);
                  },
                  onError: (err: unknown) => {
                    if (
                      activeRawStreamUrl.includes('youtube.com') ||
                      activeRawStreamUrl.includes('youtu.be')
                    ) {
                      setHasYouTubeEmbedError(true);
                    }
                    setTimeout(() => {
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
              <h3 className="text-lg font-black text-white max-w-md">Tempo de Acesso Expirado</h3>
              <div className="font-mono text-2xl font-black text-rose-500 tracking-wider my-1 bg-black/60 px-4 py-1 rounded-xl border border-rose-500/30">
                00:00:00
              </div>
              <p className="text-xs text-zinc-400 max-w-md mt-1 leading-relaxed">
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

          {/* BACKDROP INTERATIVO E ENGAJANTE DE PRÉ-CARREGAMENTO (ANTI-TÉDIO & ANTI-STALL) */}
          {!hasFirstFrame && (
            <div
              id="player-signal-backdrop"
              className="absolute inset-0 z-20 flex flex-col items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black overflow-hidden select-none"
            >
              {/* Efeito Glow com Logo do Canal Difuso no Fundo */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 blur-3xl scale-125 pointer-events-none transition-all duration-700"
                style={{ backgroundImage: `url(${canalAtivo.logo})` }}
              />

              {/* TOPO: IDENTIDADE DO CANAL E STATUS DO SINAL */}
              <div className="relative z-10 w-full flex flex-col items-center pt-1">
                <div className="relative mb-2">
                  <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 p-2 shadow-2xl flex items-center justify-center backdrop-blur-md">
                    <img
                      src={getChannelLogo(canalAtivo)}
                      alt={canalAtivo.nome}
                      className="w-full h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getChannelFallbackLogo(canalAtivo);
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D55] opacity-80" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-[#FF2D55] border-2 border-black" />
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-base font-black text-white tracking-wide text-center">
                    {canalAtivo.nome}
                  </h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/40">
                    AO VIVO
                  </span>
                </div>

                {/* STATUS VISUAL DE SINCRONIA E BARRA DE PROGRESSO */}
                <div className="mt-1.5 flex flex-col items-center w-full max-w-xs">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-zinc-300">
                    <Radio className="w-3.5 h-3.5 text-[#FF2D55] animate-pulse shrink-0" />
                    <span className="truncate">
                      {hasYouTubeEmbedError
                        ? 'Vídeo com restrição de incorporação'
                        : isRescueActive
                        ? 'Origem instável. Modo Resgate ativo'
                        : loadSeconds < 2
                        ? 'Sintonizando feed via satélite...'
                        : loadSeconds < 4
                        ? 'Sincronizando áudio e vídeo HD...'
                        : 'Otimizando buffer e rotas de entrega...'}
                    </span>
                  </div>

                  {/* Barra de progresso de conexão ativa */}
                  <div className="w-full h-1 sm:h-1.5 bg-zinc-800/80 rounded-full overflow-hidden mt-1.5 border border-zinc-700/50">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 via-[#FF2D55] to-amber-400"
                      initial={{ width: '15%' }}
                      animate={{
                        width: `${Math.min(95, Math.max(25, (loadSeconds + 1) * 20))}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                {hasYouTubeEmbedError && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => setIsChannelVideosOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/50 transition"
                      title="Ver mais vídeos deste canal"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Ver mais vídeos do canal</span>
                    </button>
                    {streamsDisponiveis.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onStreamChange((streamIndex + 1) % streamsDisponiveis.length)}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-700 transition"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sinal Alternativo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CENTRO: MODO RESGATE OU CARTÃO INTERATIVO ANTI-TÉDIO ("SABIA QUE...?") */}
              {!isMiniMode && (
                <div className="relative z-10 w-full max-w-md my-auto px-2">
                  <AnimatePresence mode="wait">
                    {isRescueActive ? (
                      /* PAINEL DE RESGATE ATIVO: EVITA CARREGAMENTO INFINITO */
                      <motion.div
                        key="rescue-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-zinc-900/95 border border-amber-500/40 rounded-2xl p-3 sm:p-4 text-center shadow-2xl backdrop-blur-md"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400 animate-bounce" />
                          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
                            Central de Recuperação de Transmissão
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                          O servidor deste canal está demorando a responder.
                          <br />
                          {isRescuePaused ? (
                            <span className="text-zinc-400">Transição pausada. Escolha uma opção abaixo:</span>
                          ) : (
                            <span className="font-bold text-white">
                              Alternando para canal estável em{' '}
                              <span className="text-amber-400 font-mono text-sm">{rescueCountdown}s</span>...
                            </span>
                          )}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-2 mb-2.5">
                          {/* Botão de Emergência HD Garantido */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsRescuePaused(true);
                              setEmergencyOverrideUrl(getEmergencyFallbackStream(canalAtivo.categoria));
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
                            title="Carregar canal de emergência garantido 24/7"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>Sinal Reserva HD</span>
                          </button>

                          {/* Botão Pular Canal */}
                          {onNextCanal && (
                            <button
                              type="button"
                              onClick={onNextCanal}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center gap-1.5 border border-zinc-600 cursor-pointer"
                              title="Pular para o próximo canal da grade"
                            >
                              <SkipForward className="w-3.5 h-3.5 text-[#FF2D55]" />
                              <span>Pular Canal</span>
                            </button>
                          )}

                          {/* Pausar / Retomar contagem */}
                          <button
                            type="button"
                            onClick={() => setIsRescuePaused(!isRescuePaused)}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold text-xs border border-zinc-700 cursor-pointer"
                            title={isRescuePaused ? 'Retomar contagem regressiva' : 'Pausar contagem regressiva'}
                          >
                            {isRescuePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Atalhos rápidos para canais recomendados ativos */}
                        {suggestedChannels.length > 0 && (
                          <div className="pt-2 border-t border-zinc-800 flex items-center justify-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-medium">Ao vivo agora:</span>
                            {suggestedChannels.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => onSelectCanal && onSelectCanal(c)}
                                className="px-2 py-1 rounded-lg bg-black/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold border border-zinc-700 flex items-center gap-1 cursor-pointer transition truncate max-w-[110px]"
                                title={`Assistir ${c.nome}`}
                              >
                                <img
                                  src={c.logo}
                                  alt=""
                                  className="w-3.5 h-3.5 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <span className="truncate">{c.nome}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* CARTÃO INTERATIVO ANTI-TÉDIO: CURIOSIDADES E FATOS ESPORTIVOS */
                      <motion.div
                        key={`trivia-${triviaIndex}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setTriviaIndex((prev) => (prev + 1) % SPORTS_TRIVIA.length)}
                        className="bg-zinc-900/85 hover:bg-zinc-900 border border-zinc-700/60 hover:border-zinc-500/80 rounded-2xl p-3 sm:p-4 text-left shadow-2xl backdrop-blur-md cursor-pointer transition group"
                        title="Clique para ver outra curiosidade ou dica"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/90 text-amber-300 text-[10px] sm:text-[11px] font-bold border border-amber-400/20">
                            <span>{SPORTS_TRIVIA[triviaIndex].icon}</span>
                            <span>{SPORTS_TRIVIA[triviaIndex].tag}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 flex items-center gap-1 transition">
                            <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                            Toque p/ trocar
                          </span>
                        </div>

                        <h5 className="text-xs sm:text-sm font-bold text-white mb-1">
                          {SPORTS_TRIVIA[triviaIndex].title}
                        </h5>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {SPORTS_TRIVIA[triviaIndex].fact}
                        </p>

                        {/* Indicadores sutis de curiosidade */}
                        <div className="flex items-center justify-center gap-1 mt-2.5">
                          {SPORTS_TRIVIA.slice(0, 7).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                i === triviaIndex % 7 ? 'w-4 bg-[#FF2D55]' : 'w-1 bg-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* RODAPÉ: AÇÕES DIRETAS PARA O USUÁRIO NUNCA FICAR PRESO */}
              <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-2 pb-1">
                {/* BOTÃO VER MAIS VÍDEOS DO CANAL NO RODAPÉ DO CARREGAMENTO */}
                <button
                  type="button"
                  id="player-rescue-channel-videos-btn"
                  onClick={() => setIsChannelVideosOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-200 hover:text-white text-xs font-semibold border border-red-500/40 flex items-center gap-1.5 cursor-pointer shadow transition"
                  title="Ver mais vídeos do canal (reproduzir diretamente no nosso player)"
                >
                  <Film className="w-3.5 h-3.5 text-red-400" />
                  <span>Ver mais vídeos {streamsDisponiveis.length > 1 ? `(${streamsDisponiveis.length})` : ''}</span>
                </button>

                {streamsDisponiveis.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onStreamChange((streamIndex + 1) % streamsDisponiveis.length)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 cursor-pointer shadow transition"
                    title="Alternar entre links de transmissão deste canal"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Servidor {streamIndex + 1} de {streamsDisponiveis.length}</span>
                  </button>
                )}

                {onNextCanal && (
                  <button
                    type="button"
                    onClick={onNextCanal}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 cursor-pointer shadow transition"
                    title="Assistir ao próximo canal da grade"
                  >
                    <SkipForward className="w-3.5 h-3.5 text-[#FF2D55]" />
                    <span>Pular Canal</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleLatencyMode('economy')}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 cursor-pointer shadow transition"
                  title="Ativar modo leve e economizar dados móveis"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Poupar Internet</span>
                </button>
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

            <span className={`text-[10px] font-mono font-bold ${signalQuality.colorClass} tracking-tight`}>
              {signalQuality.latencyMs}ms
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold text-zinc-300">
              <span className={`w-1 h-1 rounded-full ${signalQuality.dotClass}`} />
              {signalQuality.shortLabel}
            </span>
          </div>

          {/* BOTÕES RÁPIDOS NO VÍDEO: CONFIGURAÇÕES E PICTURE-IN-PICTURE (HOVER) */}
          {!isMiniMode && (
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
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

          {/* LINHA DE PROGRESSO VERMELHA EXATAMENTE COMO NA REFERÊNCIA */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-900/80 z-20 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all duration-300"
              style={{ width: `${Math.max(15, playedPercent)}%` }}
            />
          </div>
        </div>

        {/* BARRA LATERAL VERTICAL DE AÇÕES (EXATAMENTE COMO NA REFERÊNCIA: AVATAR, CORAÇÃO, COMENTÁRIO, SALVAR) */}
        {!isMiniMode && (
          <div className="flex flex-col items-center gap-4 sm:gap-5 pb-2 select-none shrink-0">
            {/* AVATAR DO CANAL COM ANEL NEON PINK */}
            <div
              className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#FF2D55] via-pink-500 to-rose-600 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              title={canalAtivo.nome}
            >
              <img
                src={getChannelLogo(canalAtivo)}
                alt={canalAtivo.nome}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-zinc-950"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getChannelFallbackLogo(canalAtivo);
                }}
              />
            </div>

            {/* BOTÃO CURTIR / LIKE */}
            <button
              type="button"
              id="player-action-like-btn"
              onClick={handleToggleLike}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Gostei"
            >
              <div
                className={`p-1.5 rounded-full transition-transform group-hover:scale-110 active:scale-90 ${
                  isLiked ? 'text-[#FF2D55]' : 'text-white group-hover:text-rose-400'
                }`}
              >
                <Heart
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    isLiked ? 'fill-[#FF2D55] text-[#FF2D55]' : 'text-white'
                  }`}
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight">
                {likesCount}
              </span>
            </button>

            {/* BOTÃO COMENTÁRIOS */}
            <button
              type="button"
              id="player-action-comment-btn"
              onClick={() => setShowComments((prev) => !prev)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Comentários"
            >
              <div className="p-1.5 rounded-full text-white group-hover:text-zinc-300 transition-transform group-hover:scale-110 active:scale-90">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight">
                {canalAtivo.commentsCount || '6605'}
              </span>
            </button>

            {/* BOTÃO SALVAR / FAVORITAR */}
            <button
              type="button"
              id="player-action-bookmark-btn"
              onClick={onToggleFavorite}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title={isFavorited ? 'Salvo' : 'Salvar'}
            >
              <div
                className={`p-1.5 rounded-full transition-transform group-hover:scale-110 active:scale-90 ${
                  isFavorited ? 'text-white' : 'text-white group-hover:text-zinc-300'
                }`}
              >
                <Bookmark
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    isFavorited ? 'fill-white text-white' : 'text-white'
                  }`}
                />
              </div>
            </button>

            {/* BOTÃO VER MAIS VÍDEOS DO CANAL NA COLUNA VERTICAL */}
            <button
              type="button"
              id="player-action-channel-videos-btn"
              onClick={() => setIsChannelVideosOpen(true)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Ver mais vídeos do canal (reproduzir no nosso player)"
            >
              <div className="p-1.5 rounded-full text-white group-hover:text-red-400 hover:bg-red-500/15 transition-all group-hover:scale-110 active:scale-90 border border-transparent group-hover:border-red-500/30">
                <Film className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 group-hover:text-red-400" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-300 group-hover:text-white tracking-tight text-center leading-tight max-w-[48px]">
                Vídeos
              </span>
            </button>
          </div>
        )}
      </div>

      {/* BARRA INFERIOR DE CONTROLE (EXATAMENTE COMO NA REFERÊNCIA: PÍLULAS À ESQUERDA, SETAS NO CENTRO) */}
      {!isMiniMode && (
        <div className="w-full max-w-[860px] flex items-center justify-between mt-4 px-1 select-none flex-wrap gap-y-3">
          {/* LADO ESQUERDO: PÍLULAS "MODO CINEMA", "VER MAIS VÍDEOS DO CANAL", "MODO ESTÁVEL / BAIXA LATÊNCIA", ETC. */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="player-pill-cinema-mode"
              onClick={onEnterCinemaMode}
              className="px-4 py-2 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-200 hover:text-white border border-zinc-800/90 text-xs font-medium transition cursor-pointer shadow-sm"
            >
              Modo Cinema
            </button>

            {/* BOTÃO VER MAIS VÍDEOS DO CANAL */}
            <button
              type="button"
              id="player-pill-channel-videos"
              onClick={() => setIsChannelVideosOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-full border text-xs font-semibold transition cursor-pointer shadow-sm flex items-center gap-1.5 bg-gradient-to-r from-red-600/20 via-zinc-900 to-zinc-900 text-zinc-100 hover:text-white border-red-500/40 hover:border-red-500/70 hover:scale-[1.02] active:scale-95"
              title="Ver mais vídeos do canal (reproduzir diretamente no nosso player)"
            >
              <Film className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Ver mais vídeos do canal</span>
              {streamsDisponiveis.length > 1 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600/30 text-red-300 text-[10px] font-bold border border-red-500/30">
                  {streamsDisponiveis.length}
                </span>
              )}
            </button>

            {/* PÍLULA DE QUALIDADE DO SINAL & LATÊNCIA REAL */}
            <div
              id="player-pill-signal-indicator"
              className={`px-3 py-2 rounded-full border text-xs font-medium transition flex items-center gap-1.5 shadow-sm select-none ${
                signalQuality.tier === 'green'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : signalQuality.tier === 'yellow'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
              title={`Qualidade da Conexão: ${signalQuality.label} • Latência detectada: ${signalQuality.latencyMs}ms`}
            >
              <signalQuality.icon className={`w-3.5 h-3.5 ${signalQuality.colorClass}`} />
              <span className="font-mono font-bold text-[11px]">{signalQuality.latencyMs}ms</span>
              <span className="hidden md:inline text-[10px] text-zinc-300 font-semibold">• {signalQuality.label}</span>
            </div>

            {/* BOTÃO RÁPIDO: ALTERNAR ENTRE MODO ESTÁVEL E MODO BAIXA LATÊNCIA (AJUDA EM REDES LENTAS) */}
            <button
              type="button"
              id="player-pill-latency-toggle"
              onClick={() => {
                // Alterna diretamente entre Modo Estável (buffer prolongado para redes lentas) e Modo Baixa Latência (tempo real)
                onToggleLatencyMode(latencyMode === 'stable' ? 'low-latency' : 'stable');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-full border text-xs font-medium transition cursor-pointer shadow-sm flex items-center gap-1.5 ${
                latencyMode === 'stable'
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
                  : latencyMode === 'low-latency'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              }`}
              title={
                latencyMode === 'stable'
                  ? 'Modo Estável ativado (buffer 14s p/ redes mais lentas). Clique para alternar para Baixa Latência.'
                  : latencyMode === 'low-latency'
                  ? 'Modo Baixa Latência ativado (tempo real 2s). Clique para alternar para Modo Estável.'
                  : 'Clique para alternar para Modo Estável'
              }
            >
              {latencyMode === 'stable' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Modo Estável</span>
                </>
              ) : latencyMode === 'low-latency' ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Baixa Latência</span>
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Poupar Dados</span>
                </>
              )}
            </button>

            {/* BOTÃO PARA ABRIR AS CONFIGURAÇÕES COMPLETAS DO REPRODUTOR */}
            <button
              type="button"
              id="player-pill-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-200 hover:text-white border border-zinc-800/90 text-xs font-medium transition cursor-pointer shadow-sm flex items-center gap-1.5"
              title="Abrir configurações de desempenho de rede e latência"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
              <span className="hidden sm:inline">Configurações</span>
            </button>

            <button
              type="button"
              id="player-pill-pip"
              onClick={handleTogglePip}
              className={`px-3.5 sm:px-4 py-2 rounded-full border text-xs font-medium transition cursor-pointer shadow-sm flex items-center gap-1.5 ${
                isPipActive
                  ? 'bg-[#FF2D55]/20 text-[#FF2D55] border-[#FF2D55]/50'
                  : 'bg-[#141416] hover:bg-[#202024] text-zinc-200 hover:text-white border border-zinc-800/90'
              }`}
              title={
                isPipActive
                  ? 'Sair do Picture-in-Picture'
                  : 'Assistir em Picture-in-Picture nativo (Atalho P)'
              }
            >
              <PictureInPicture2 className="w-3.5 h-3.5 text-[#FF2D55]" />
              <span className="hidden sm:inline">Picture-in-Picture</span>
              <span className="sm:hidden">PiP</span>
            </button>
          </div>

          {/* CENTRO: SETAS CIRCULARES DE NAVEGAÇÃO DE CANAL < > */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="player-btn-prev-canal"
              onClick={onPrevCanal}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-200 hover:text-white border border-zinc-800/90 flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
              title="Canal anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              id="player-btn-next-canal"
              onClick={onNextCanal}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-200 hover:text-white border border-zinc-800/90 flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
              title="Próximo canal"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* LADO DIREITO: CONTROLE DE ÁUDIO DISCRETO */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="player-btn-audio-mute"
              onClick={onToggleMute}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-300 hover:text-white border border-zinc-800/90 flex items-center justify-center transition cursor-pointer shadow-sm"
              title={isMuted ? 'Ativar som (M)' : 'Silenciar áudio (M)'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#00E676]" />
              )}
            </button>
            <button
              type="button"
              id="player-btn-reload-stream"
              onClick={handleReload}
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-400 hover:text-white border border-zinc-800/90 items-center justify-center transition cursor-pointer shadow-sm"
              title="Recarregar sinal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

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

      {/* GAVETA ELEGANTE DE COMENTÁRIOS SE O USUÁRIO CLICAR NO ÍCONE DE COMENTÁRIOS */}
      <AnimatePresence>
        {!isMiniMode && showComments && (
          <motion.div
            key="player-comments-drawer"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[860px] mt-3 p-4 rounded-2xl bg-[#0e0e11] border border-zinc-800 text-zinc-200 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#FF2D55]" />
                <span>Comentários ao Vivo ({commentsList.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="text-zinc-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-2 mb-3 pr-1">
              {commentsList.map((comm, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60 text-xs text-zinc-300 flex items-start gap-2.5"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2D55] to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    U{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug">{comm}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar um comentário..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2D55]"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-3 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white font-bold text-xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Enviar</span>
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
    </div>
  );
}
