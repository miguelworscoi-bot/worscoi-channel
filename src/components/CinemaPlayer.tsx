'use client';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  Minimize2,
  Volume2,
  VolumeX,
  AlertCircle,
  X,
  SkipForward,
  Zap,
  Lock,
  CreditCard,
  KeyRound,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  CornerDownRight,
  SignalLow,
} from 'lucide-react';
import { Canal, LatencyMode, VideoQuality } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { getChannelSchedule } from '@/utils/channelProgramExtractor';
import {
  getSafeStreamUrl,
  isStreamAutoProxied,
  getHlsOptionsForLatencyMode,
  SPORTS_TRIVIA,
  getEmergencyFallbackStream,
  applyQualityToHls,
} from '@/utils/streamUtils';
import { PlayerSettingsModal } from './PlayerSettingsModal';
import { PlayerTransitionSkeleton } from './PlayerTransitionSkeleton';
import { useAuth } from '@/context/AuthContext';
import { isUserPlanExpired, canUserWatchChannel, PLANS } from '@/services/subscriptionService';
import { ChannelVideosModal, extractYouTubeId } from './ChannelVideosModal';
import {
  getVideoItemSlug,
  toggleCommentAdoro,
  subscribeChannelComments,
  addChannelComment,
  deleteChannelComment,
  formatInteractionCount,
  formatRelativeTime,
  getEffectiveVisitorId,
  ChannelComment,
} from '@/services/channelInteractionsService';

interface CinemaPlayerProps {
  canalAtivo: Canal;
  streamIndex: number;
  onStreamChange: (index: number) => void;
  onAddStreamUrl?: (url: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  useProxy: boolean;
  onToggleProxy?: () => void;
  latencyMode: LatencyMode;
  onToggleLatencyMode: (mode?: LatencyMode) => void;
  onClose: () => void;
  failoverNotice: string | null;
  onClearFailoverNotice: () => void;
  onPlayerError: (error: unknown) => void;
  onNextCanal?: () => void;
  onPrevCanal?: () => void;
  isTransitioning?: boolean;
  transitionDirection?: 'to-cinema' | 'to-hero' | null;
  isAudioTransitionMuted?: boolean;
  onVideoEnded?: () => void;
  onOpenPaymentPlans?: () => void;
  onOpenRedeemToken?: () => void;
  videoQuality?: VideoQuality;
  onSelectVideoQuality?: (quality: VideoQuality) => void;
}

export function CinemaPlayer({
  canalAtivo,
  streamIndex,
  onStreamChange,
  onAddStreamUrl,
  isMuted,
  onToggleMute,
  useProxy,
  onToggleProxy = () => {},
  latencyMode,
  onToggleLatencyMode,
  onClose,
  failoverNotice,
  onClearFailoverNotice,
  onPlayerError,
  onNextCanal,
  onPrevCanal,
  isTransitioning = false,
  transitionDirection = null,
  isAudioTransitionMuted = false,
  onVideoEnded,
  onOpenPaymentPlans,
  onOpenRedeemToken,
  videoQuality = 'auto',
  onSelectVideoQuality,
}: CinemaPlayerProps) {
  const { userProfile, isAdmin, countdown, isSubscriptionExpired } = useAuth();
  const isPlanExpired = !isAdmin && (isSubscriptionExpired || countdown.expired || isUserPlanExpired(userProfile));
  const channelAccess = canUserWatchChannel(canalAtivo, userProfile);
  const isChannelLockedByPlan = !isAdmin && !channelAccess.allowed && channelAccess.reason === 'plan_too_low';
  const requiredPlanInfo = PLANS[channelAccess.requiredPlan] || PLANS.vip;
  const userPlanInfo = PLANS[channelAccess.userPlan] || PLANS.free;
  const playerRef = React.useRef<{ getInternalPlayer: (type?: string) => unknown } | null>(null);

  // Aplica a qualidade selecionada diretamente à instância Hls.js do CinemaPlayer
  useEffect(() => {
    if (playerRef.current) {
      try {
        const hls = (playerRef.current as unknown as { getInternalPlayer: (type?: string) => unknown })?.getInternalPlayer('hls');
        if (hls) {
          applyQualityToHls(hls, videoQuality);
        }
      } catch {
        // Ignora
      }
    }
  }, [videoQuality]);

  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChannelVideosOpen, setIsChannelVideosOpen] = useState(false);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [emergencyOverrideUrl, setEmergencyOverrideUrl] = useState<string | null>(null);

  // Estados reais de Adoros e Comentários do vídeo selecionado
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<ChannelComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    userName: string;
    rootParentId: string;
  } | null>(null);
  const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);

  // Áudio suavizado durante transição entre componentes para evitar picos e ruídos
  const effectiveMuted = isMuted || isAudioTransitionMuted;

  const streamsDisponiveis = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
  const activeRawStreamUrl = streamsDisponiveis[streamIndex] || canalAtivo.url;
  const rawStreamToPlay = emergencyOverrideUrl || activeRawStreamUrl;
  const finalStreamUrl = emergencyOverrideUrl
    ? emergencyOverrideUrl
    : getSafeStreamUrl(activeRawStreamUrl, useProxy);
  const isCurrentlyProxied = isStreamAutoProxied(rawStreamToPlay, useProxy);

  // Sincronização em tempo real (onSnapshot) de comentários do Firestore no CinemaPlayer
  useEffect(() => {
    if (!canalAtivo) {
      setCommentsList([]);
      return;
    }

    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);

    const unsubComments = subscribeChannelComments(videoSlug, (comments) => {
      setCommentsList(comments);
    });

    return () => {
      unsubComments();
    };
  }, [canalAtivo?.id, canalAtivo?.nome, streamIndex, activeRawStreamUrl]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !canalAtivo || isSubmittingComment) return;

    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    const effectiveUserName =
      userProfile?.displayName ||
      (userProfile?.email ? userProfile.email.split('@')[0] : 'Assinante');
    const effectiveUserPhoto = userProfile?.photoURL || null;
    const effectiveUserPlan = userProfile?.planName || userProfile?.plan || null;

    const text = commentInput.trim();
    const parentId = replyingTo?.rootParentId || null;
    const replyToUserName = replyingTo?.userName || null;

    setCommentInput('');
    setReplyingTo(null);
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
      console.error('Erro ao enviar comentário no Modo Cinema:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleCommentAdoro = async (commentId: string) => {
    if (!canalAtivo) return;
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    try {
      setAnimatingHeartId(commentId);
      setTimeout(() => setAnimatingHeartId((prev) => (prev === commentId ? null : prev)), 450);
      await toggleCommentAdoro(commentId, videoSlug, effectiveUserId);
    } catch (err) {
      console.error('Erro ao alternar adoro no comentário no Modo Cinema:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!canalAtivo) return;
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, activeRawStreamUrl);
    try {
      await deleteChannelComment(commentId, videoSlug);
    } catch (err) {
      console.error('Erro ao excluir comentário no Modo Cinema:', err);
    }
  };
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

  const programaAtual = getChannelSchedule(canalAtivo)[0];

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
              const allUrls = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
              const existingIndex = allUrls.findIndex((u) => u.includes(videoData.video_id));
              setTimeout(() => {
                if (existingIndex >= 0) {
                  onStreamChange(existingIndex);
                } else if (onAddStreamUrl) {
                  onAddStreamUrl(newUrl);
                }
              }, 0);
            }
          }
        }
      } catch {
        // Ignora
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
    };
  }, [activeRawStreamUrl, canalAtivo, onStreamChange, onAddStreamUrl]);

  // Reset de estados
  useEffect(() => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setLoadSeconds(0);
    setEmergencyOverrideUrl(null);
  }, [canalAtivo.id, canalAtivo.url, streamIndex, useProxy]);

  // Rotaciona curiosidades e dicas esportivas a cada 3.5s enquanto o sinal carrega
  useEffect(() => {
    if (hasFirstFrame) return;
    const triviaTimer = setInterval(() => {
      setTriviaIndex((prev) => (prev + 1) % SPORTS_TRIVIA.length);
    }, 3500);
    return () => clearInterval(triviaTimer);
  }, [hasFirstFrame]);

  // Watchdog de failover inteligente no modo cinema
  useEffect(() => {
    if (hasFirstFrame) return;

    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      setLoadSeconds(seconds);

      // Aos 8s: se o sinal direto ainda não abriu e não é YouTube, ativa o proxy seguro
      if (seconds === 8 && !hasFirstFrame) {
        if (!useProxy && !isYouTubeChannel) {
          onToggleProxy();
        }
      }

      // Aos 14s: tenta o próximo servidor reserva se disponível
      if (seconds === 14 && !hasFirstFrame) {
        if (streamsDisponiveis.length > 1 && streamIndex < streamsDisponiveis.length - 1) {
          onStreamChange(streamIndex + 1);
        }
      }

      // Aos 22s: se ainda não abriu, aciona o sinal de emergência da categoria
      if (seconds === 22 && !hasFirstFrame) {
        const emergencyStream = getEmergencyFallbackStream(canalAtivo?.categoria);
        if (emergencyStream && emergencyStream !== activeRawStreamUrl) {
          setEmergencyOverrideUrl(emergencyStream);
        }
      }

      // Aos 30s: notifica o erro caso nenhum sinal responda
      if (seconds === 30 && !hasFirstFrame) {
        setTimeout(() => {
          onPlayerError?.(new Error('Tempo limite excedido'));
        }, 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFirstFrame, canalAtivo?.categoria, activeRawStreamUrl, streamsDisponiveis.length, streamIndex, onStreamChange, useProxy, isYouTubeChannel, onToggleProxy, onPlayerError]);

  // Teclado: ESC fecha cinema, Setas zapam canais, M muta, S alterna modo
  useEffect(() => {
    if (isTransitioning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        onNextCanal?.();
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        onPrevCanal?.();
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      } else if (e.key.toLowerCase() === 's') {
        onToggleLatencyMode();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNextCanal, onPrevCanal, onToggleMute, onToggleLatencyMode, isTransitioning]);

  return (
    <motion.div
      id="cinema-mode-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* SKELETON / FADE DE TRANSIÇÃO SUAVE ENTRE PLAYERS */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="cinema-transition-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="absolute inset-0 z-40 pointer-events-none"
          >
            <PlayerTransitionSkeleton
              canal={canalAtivo}
              direction={transitionDirection || 'to-cinema'}
              variant="cinema"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP FLOATING CONTROLS BAR (MINIMALISTA / SEM ELEMENTOS ELIMINADOS) */}
      <div
        id="cinema-top-bar"
        className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/20 to-transparent flex items-center justify-end gap-3 pointer-events-auto"
      >
        {/* Áudio Toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
            isMuted
              ? 'bg-zinc-900/90 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-200 hover:text-white'
          }`}
          title="Pressione M para ativar ou silenciar som"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00E676]" />}
          <span>{isMuted ? 'Ativar Áudio' : 'Mutar'}</span>
        </button>

        {/* Fechar Modo Cinema */}
        <button
          type="button"
          id="close-cinema-mode-btn"
          onClick={onClose}
          disabled={isTransitioning}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-800/90 hover:bg-red-500 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-zinc-600/80 hover:border-red-500 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 ${
            isTransitioning ? 'opacity-50 pointer-events-none' : ''
          }`}
          title="Fechar Modo Cinema (ESC)"
        >
          <Minimize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Sair do Cinema</span>
          <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">
            ESC
          </span>
        </button>
      </div>

      {/* FAILOVER ALERT IN CINEMA */}
      {failoverNotice && (
        <div className="absolute top-20 left-6 right-6 z-50 bg-zinc-900/90 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs px-4 py-2 rounded-xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{failoverNotice}</span>
          </div>
          <button type="button" onClick={onClearFailoverNotice} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FULLSCREEN PLAYER CONTAINER */}
      <div className="w-full h-full flex items-center justify-center p-0 md:p-4 relative">
        {/* POSTER CINEMATOGRÁFICO DE CONEXÃO AO VIVO */}
        {!hasFirstFrame && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
            <img
              src={
                programaAtual?.imagemCapa ||
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop'
              }
              alt={canalAtivo.nome}
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-md"
            />
            <div className="absolute inset-0 bg-radial from-transparent via-black/80 to-black" />

            <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-sm">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-700 p-2 shadow-2xl mb-4 relative">
                <img
                  src={canalAtivo.logo}
                  alt={canalAtivo.nome}
                  className="w-full h-full object-contain"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00E676]"></span>
                </span>
              </div>

              <h2 className="text-xl font-black text-white">{canalAtivo.nome}</h2>
              <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
                <span>
                  {loadSeconds < 3
                    ? 'Sincronizando sinal de alta velocidade...'
                    : loadSeconds < 5
                    ? 'Otimizando taxa de bits e buffer...'
                    : 'Sinal de origem demorando. Alternando rota...'}
                </span>
              </div>

              {/* CARD ROTATIVO DE CURIOSIDADES NO CINEMA (ANTI-TÉDIO) */}
              <div
                onClick={() => setTriviaIndex((prev) => (prev + 1) % SPORTS_TRIVIA.length)}
                className="mt-4 w-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 p-3 rounded-2xl text-left shadow-2xl backdrop-blur-md cursor-pointer transition select-none group"
                title="Toque para ver outro fato esportivo"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 text-[10px] font-bold border border-amber-400/20">
                    {SPORTS_TRIVIA[triviaIndex].tag}
                  </span>
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition">Toque p/ trocar</span>
                </div>
                <h5 className="text-xs font-bold text-white mb-0.5">{SPORTS_TRIVIA[triviaIndex].title}</h5>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{SPORTS_TRIVIA[triviaIndex].fact}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {/* Botão para baixar resolução para 360p caso a internet esteja fraca */}
                {videoQuality !== '360p' && onSelectVideoQuality && (
                  <button
                    type="button"
                    onClick={() => onSelectVideoQuality('360p')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/45 text-[#00E676] border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                    title="Baixar resolução para 360p e reproduzir sem travar mesmo com sinal ruim"
                  >
                    <SignalLow className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Baixar p/ 360p (Sinal Fraco)</span>
                  </button>
                )}

                {/* Botão de Emergência quando a transmissão de origem demora */}
                {loadSeconds >= 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmergencyOverrideUrl(getEmergencyFallbackStream(canalAtivo.categoria));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    title="Ativar canal reserva HD com sinal garantido"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Sinal Reserva HD</span>
                  </button>
                )}

                {streamsDisponiveis.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = (streamIndex + 1) % streamsDisponiveis.length;
                      onStreamChange(next);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mudar Servidor ({streamIndex + 1}/{streamsDisponiveis.length})</span>
                  </button>
                )}

                {onNextCanal && loadSeconds >= 2 && (
                  <button
                    type="button"
                    onClick={onNextCanal}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    title="Pular para o próximo canal sem esperar"
                  >
                    <SkipForward className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Pular Canal</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SPINNER DISCRETO DE REBUFFERING SE O VÍDEO JÁ ESTIVER RODANDO */}
        {hasFirstFrame && isBuffering && (
          <div className="absolute top-24 right-6 z-40 bg-black/80 backdrop-blur-md border border-[#00E676]/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-white shadow-xl">
            <div className="w-3 h-3 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
            <span className="text-[11px] font-semibold text-zinc-300">Ajustando sinal...</span>
          </div>
        )}

        {/* SUGESTÃO FLUTUANTE DE BAIXAR PARA 360P QUANDO O SINAL OSCILAR */}
        {(isBuffering || loadSeconds >= 4) && videoQuality !== '360p' && onSelectVideoQuality && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-black/85 backdrop-blur-md border border-amber-500/50 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-zinc-200 shadow-2xl">
            <SignalLow className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Sinal instável?</span>
            <button
              type="button"
              onClick={() => onSelectVideoQuality('360p')}
              className="font-bold underline text-[#00E676] hover:text-emerald-300 transition cursor-pointer"
            >
              Baixar para 360p (reproduzir sem travar)
            </button>
          </div>
        )}

        {React.createElement(
          ReactPlayer as unknown as React.ComponentType<Record<string, unknown>>,
          {
            ref: playerRef,
            key: `cinema-${canalAtivo.id || canalAtivo.url}-${streamIndex}-${isCurrentlyProxied ? 'proxy' : 'direct'}-${latencyMode}-${videoQuality}`,
            url: finalStreamUrl,
            src: finalStreamUrl,
            playing: !isPlanExpired && !isChannelLockedByPlan,
            muted: effectiveMuted,
            controls: !isPlanExpired && !isChannelLockedByPlan,
            width: '100%',
            height: '100%',
            playsinline: true,
            config: {
              file: {
                forceHLS:
                  !finalStreamUrl.includes('youtube.com') &&
                  !finalStreamUrl.includes('youtu.be'),
                hlsOptions: getHlsOptionsForLatencyMode(latencyMode, videoQuality),
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
              // Transição automática para o próximo vídeo quando terminar
              setTimeout(() => {
                onVideoEnded?.();
              }, 0);
            },
            onError: (err: unknown, data?: unknown) => {
              setTimeout(() => {
                if (err instanceof Error) {
                  if (
                    err.name === 'NotAllowedError' ||
                    err.message?.includes('play() failed') ||
                    err.message?.includes("user didn't interact")
                  ) {
                    if (!isMuted) {
                      onToggleMute?.();
                    }
                    return;
                  }
                  if (err.name === 'AbortError' || err.message?.includes('interrupted by a call to pause')) {
                    return;
                  }
                }

                if (data && typeof data === 'object' && 'fatal' in data && !(data as { fatal: boolean }).fatal) {
                  return;
                }

                if (!useProxy && !isYouTubeChannel) {
                  onToggleProxy();
                  return;
                }

                onPlayerError?.(err);
              }, 0);
            },
          }
        )}

        {/* BLOQUEIO POR EXPIRAÇÃO DE ASSINATURA NO MODO CINEMA */}
        {isPlanExpired && (
          <div
            id="cinema-plan-expired-overlay"
            className="absolute inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl mb-3">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white max-w-md">Tempo de Acesso Expirado</h3>
            <div className="text-3xl font-bold text-rose-500 tracking-tight my-2 bg-black/60 px-5 py-1.5 rounded-xl border border-rose-500/30 shadow-inner">
              00:00:00
            </div>
            <p className="text-xs text-zinc-400 font-normal max-w-md mt-1 leading-relaxed">
              O tempo de acesso contratado para esta conta chegou ao fim. As transmissões foram pausadas.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {onOpenPaymentPlans && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPaymentPlans();
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Ver Planos & Renovar</span>
                </button>
              )}
              {onOpenRedeemToken && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRedeemToken();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center gap-2 border border-zinc-700 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#00E676]" />
                  <span>Ativar Código (5 Dígitos)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* BLOQUEIO HIERÁRQUICO NO MODO CINEMA: CANAL EXIGE PLANO SUPERIOR */}
        {!isPlanExpired && isChannelLockedByPlan && (
          <div
            id="cinema-channel-plan-locked-overlay"
            className="absolute inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl mb-3">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <span>Canal Exclusivo do {requiredPlanInfo.name}</span>
            </div>
            <h3 className="text-xl font-black text-white max-w-md">
              Acesso Restrito ao Canal {canalAtivo.nome}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-md mt-2 leading-relaxed">
              O seu plano atual (<span className="text-white font-bold">{userPlanInfo.name}</span>) não permite assistir a este canal.
              Faça upgrade para o plano <span className="text-[#00E676] font-bold">{requiredPlanInfo.name}</span> para liberar este e todos os outros canais da categoria.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {onOpenPaymentPlans && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPaymentPlans();
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-rose-600 hover:from-[#ff1744] hover:to-rose-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50 hover:scale-105 active:scale-95 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Fazer Upgrade para {requiredPlanInfo.name}</span>
                </button>
              )}
              {onOpenRedeemToken && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRedeemToken();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center gap-2 border border-zinc-700 cursor-pointer transition-all"
                >
                  <KeyRound className="w-4 h-4 text-[#00E676]" />
                  <span>Tenho Código de Ativação</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* GAVETA DE COMENTÁRIOS REAIS EM TEMPO REAL NO MODO CINEMA */}
        {isCommentsOpen && (
          <div className="absolute inset-y-0 right-0 w-84 sm:w-96 max-w-full bg-[#0E0E12]/95 backdrop-blur-xl border-l border-zinc-800 z-50 flex flex-col p-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#FF2D55]" />
                <span className="text-xs font-bold text-zinc-200">
                  Comentários ({commentsList.length})
                </span>
              </div>
              <button
                type="button"
                id="cinema-comments-close-btn"
                onClick={() => {
                  setIsCommentsOpen(false);
                  setReplyingTo(null);
                }}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                title="Fechar comentários"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-2.5">
              {commentsList.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-2">
                    <MessageCircle className="w-4 h-4 text-zinc-500" />
                  </div>
                  <p className="text-xs font-medium text-zinc-400">
                    Nenhum comentário registrado ainda neste vídeo.
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Seja o primeiro a interagir ao vivo!
                  </p>
                </div>
              ) : (
                (() => {
                  const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
                  const roots = commentsList.filter((c) => !c.parentId);
                  const repliesMap = commentsList.reduce<Record<string, ChannelComment[]>>((acc, c) => {
                    if (c.parentId) {
                      if (!acc[c.parentId]) acc[c.parentId] = [];
                      acc[c.parentId].push(c);
                    }
                    return acc;
                  }, {});

                  // Órfãos
                  for (const c of commentsList) {
                    if (c.parentId && !roots.some((r) => r.id === c.parentId)) {
                      roots.push(c);
                    }
                  }

                  return roots.map((c) => {
                    const isAuthor = c.userId === effectiveUserId || isAdmin;
                    const hasAdorado = Boolean(c.adorosBy?.includes(effectiveUserId));
                    const adoros = c.adorosCount || c.adorosBy?.length || 0;
                    const threadReplies = repliesMap[c.id] || [];

                    return (
                      <div key={c.id} className="space-y-1.5">
                        <div className="text-xs bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {c.userPhoto ? (
                                <img
                                  src={c.userPhoto}
                                  alt={c.userName}
                                  className="w-5 h-5 rounded-full object-cover border border-zinc-700 shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF2D55] to-purple-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                  {c.userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-zinc-200 text-[11px] truncate">
                                {c.userName}
                              </span>
                              {c.userPlan && (
                                <span className="text-[8px] px-1 py-0.2 rounded bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/30 shrink-0">
                                  {c.userPlan}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-zinc-500">
                                {formatRelativeTime(c.createdAt)}
                              </span>
                              {isAuthor && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                                  title="Excluir comentário"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-zinc-300 text-xs pl-6.5 break-words">{c.text}</p>

                          {/* Ações: Adoro & Responder */}
                          <div className="mt-2 pl-6.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCommentAdoro(c.id)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition cursor-pointer border ${
                                hasAdorado
                                  ? 'bg-[#FF2D55]/20 text-rose-300 border-[#FF2D55]/40'
                                  : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 hover:text-rose-400'
                              }`}
                              title={hasAdorado ? 'Remover adoro' : 'Adorar comentário'}
                            >
                              <Heart
                                className={`w-3 h-3 ${hasAdorado ? 'fill-[#FF2D55] text-[#FF2D55]' : ''} ${
                                  animatingHeartId === c.id ? 'scale-125' : 'scale-100'
                                }`}
                              />
                              <span>{adoros > 0 ? formatInteractionCount(adoros) : 'Adoro'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const rootId = c.parentId || c.id;
                                setReplyingTo({
                                  commentId: c.id,
                                  userName: c.userName,
                                  rootParentId: rootId,
                                });
                              }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 text-zinc-400 bg-zinc-800/40 border border-zinc-700/50 hover:text-white transition cursor-pointer"
                              title={`Responder a ${c.userName}`}
                            >
                              <CornerDownRight className="w-3 h-3 text-zinc-400" />
                              <span>Responder</span>
                            </button>
                          </div>
                        </div>

                        {/* Respostas da thread */}
                        {threadReplies.length > 0 && (
                          <div className="ml-4 pl-3 border-l-2 border-[#FF2D55]/30 space-y-1.5 pt-0.5">
                            {threadReplies.map((reply) => {
                              const isReplyAuthor = reply.userId === effectiveUserId || isAdmin;
                              const hasReplyAdorado = Boolean(reply.adorosBy?.includes(effectiveUserId));
                              const replyAdoros = reply.adorosCount || reply.adorosBy?.length || 0;

                              return (
                                <div
                                  key={reply.id}
                                  className="text-xs bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/70 group"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="font-semibold text-zinc-200 text-[11px] truncate">
                                        {reply.userName}
                                      </span>
                                      {reply.userPlan && (
                                        <span className="text-[7px] px-1 rounded bg-[#FF2D55]/15 text-[#FF2D55]">
                                          {reply.userPlan}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className="text-[9px] text-zinc-500">
                                        {formatRelativeTime(reply.createdAt)}
                                      </span>
                                      {isReplyAuthor && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteComment(reply.id)}
                                          className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-zinc-300 text-xs pl-2 break-words">
                                    {reply.replyToUserName && (
                                      <span className="text-rose-400 font-semibold mr-1 select-none">
                                        @{reply.replyToUserName}
                                      </span>
                                    )}
                                    {reply.text}
                                  </p>
                                  <div className="mt-1.5 pl-2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleCommentAdoro(reply.id)}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-1 cursor-pointer border ${
                                        hasReplyAdorado
                                          ? 'bg-[#FF2D55]/20 text-rose-300 border-[#FF2D55]/40'
                                          : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 hover:text-rose-400'
                                      }`}
                                    >
                                      <Heart
                                        className={`w-2.5 h-2.5 ${
                                          hasReplyAdorado ? 'fill-[#FF2D55] text-[#FF2D55]' : ''
                                        }`}
                                      />
                                      <span>{replyAdoros > 0 ? formatInteractionCount(replyAdoros) : 'Adoro'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyingTo({
                                          commentId: reply.id,
                                          userName: reply.userName,
                                          rootParentId: c.id,
                                        });
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-1 text-zinc-400 bg-zinc-800/40 border border-zinc-700/50 hover:text-white cursor-pointer"
                                    >
                                      <CornerDownRight className="w-2.5 h-2.5" />
                                      <span>Responder</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Banner de Resposta */}
            {replyingTo && (
              <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-[#FF2D55]/10 border border-[#FF2D55]/30 flex items-center justify-between text-xs">
                <span className="text-zinc-300 truncate">
                  Respondendo a <strong className="text-rose-400">@{replyingTo.userName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                  title="Cancelar resposta"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendComment} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  replyingTo
                    ? `Responder a @${replyingTo.userName}...`
                    : 'Adicione um comentário...'
                }
                maxLength={400}
                className="flex-1 bg-zinc-900 text-xs text-zinc-200 placeholder-zinc-500 rounded-full px-3 py-2 border border-zinc-800 focus:outline-none focus:border-[#FF2D55]"
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmittingComment}
                className="p-2 rounded-full bg-[#FF2D55] text-white hover:opacity-90 disabled:opacity-50 transition cursor-pointer shrink-0"
                title={replyingTo ? 'Enviar resposta' : 'Enviar comentário'}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {isSettingsOpen && (
          <PlayerSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            latencyMode={latencyMode}
            onSelectLatencyMode={(mode) => onToggleLatencyMode(mode)}
            useProxy={useProxy}
            onToggleProxy={onToggleProxy}
            canalNome={canalAtivo.nome}
            quality={videoQuality === '360p' ? '360p (Sinal Fraco)' : videoQuality.toUpperCase()}
            videoQuality={videoQuality}
            onSelectVideoQuality={onSelectVideoQuality}
            streamsDisponiveis={streamsDisponiveis}
            streamIndex={streamIndex}
            onSelectStream={onStreamChange}
          />
        )}

        {/* MODAL VER MAIS VÍDEOS DO CANAL NO MODO CINEMA */}
        <ChannelVideosModal
          isOpen={isChannelVideosOpen}
          onClose={() => setIsChannelVideosOpen(false)}
          canal={canalAtivo}
          streamIndex={streamIndex}
          onSelectStream={(idx) => {
            onStreamChange(idx);
            setEmergencyOverrideUrl(null);
          }}
          onAddStreamUrl={onAddStreamUrl}
        />
      </div>
    </motion.div>
  );
}

