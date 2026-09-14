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
  ExternalLink,
  Send,
  PictureInPicture2,
  Maximize2,
} from 'lucide-react';
import { Canal, LatencyMode } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { getSafeStreamUrl, isStreamAutoProxied, getHlsOptionsForLatencyMode } from '@/utils/streamUtils';
import { useAuth } from '@/context/AuthContext';
import { isUserPlanExpired } from '@/services/subscriptionService';
import { PlayerTransitionSkeleton } from './PlayerTransitionSkeleton';

interface PlayerHeroProps {
  canalAtivo: Canal | null;
  streamIndex: number;
  onStreamChange: (index: number) => void;
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
}

export function PlayerHero({
  canalAtivo,
  streamIndex,
  onStreamChange,
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
}: PlayerHeroProps) {
  const { userProfile, isAdmin, countdown, isSubscriptionExpired } = useAuth();
  const isPlanExpired = !isAdmin && (isSubscriptionExpired || countdown.expired || isUserPlanExpired(userProfile));

  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [hasYouTubeEmbedError, setHasYouTubeEmbedError] = useState(false);
  const [_loadSeconds, setLoadSeconds] = useState(0);
  const [playedPercent, setPlayedPercent] = useState(45);

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
  const finalStreamUrl = getSafeStreamUrl(activeRawStreamUrl, useProxy);
  const isCurrentlyProxied = isStreamAutoProxied(activeRawStreamUrl, useProxy);

  // Sincroniza metadados do canal selecionado
  useEffect(() => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setHasYouTubeEmbedError(false);
    setLoadSeconds(0);
    setPlayedPercent(35);
    setIsLiked(false);
    setShowComments(false);
    setLikesCount(canalAtivo?.likesCount || '1.8M');
  }, [canalAtivo?.id, canalAtivo?.url, streamIndex, useProxy]);

  // Watchdog de failover inteligente
  useEffect(() => {
    if (hasFirstFrame || !canalAtivo || isCinemaMode) return;

    const interval = setInterval(() => {
      setLoadSeconds((prev) => {
        const nextSec = prev + 1;
        if (nextSec === 4 && !hasFirstFrame) {
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
        if (nextSec === 7 && !hasFirstFrame) {
          onPlayerError(new Error('Tempo limite de conexão excedido'));
        }
        return nextSec;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFirstFrame, canalAtivo, streamsDisponiveis.length, streamIndex, useProxy, onStreamChange, onToggleProxy, onPlayerError, activeRawStreamUrl, isCinemaMode]);

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
                  onEnded: () => onVideoEnded?.(),
                  onError: (err: unknown) => {
                    if (
                      activeRawStreamUrl.includes('youtube.com') ||
                      activeRawStreamUrl.includes('youtu.be')
                    ) {
                      setHasYouTubeEmbedError(true);
                    }
                    onPlayerError(err);
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

          {/* BACKDROP LIMPO DE PRÉ-CARREGAMENTO */}
          {!hasFirstFrame && (
            <div
              id="player-signal-backdrop"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90"
            >
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 p-2 shadow-2xl flex items-center justify-center">
                  <img
                    src={canalAtivo.logo}
                    alt={canalAtivo.nome}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/120x120/18181b/ffffff?text=TV';
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D55] opacity-80" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF2D55] border-2 border-black" />
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-300">
                {hasYouTubeEmbedError
                  ? 'Vídeo com restrição de incorporação'
                  : 'Sintonizando sinal...'}
              </p>
              {hasYouTubeEmbedError && (
                <a
                  href={activeRawStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Assistir no YouTube</span>
                </a>
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

          {/* BOTÃO RÁPIDO PICTURE-IN-PICTURE (HOVER NO VÍDEO) */}
          {!isMiniMode && (
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
            <div className="absolute top-3 left-3 right-3 z-30 bg-black/90 backdrop-blur-md border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-xl flex items-center justify-between gap-2">
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
                src={canalAtivo.logo}
                alt={canalAtivo.nome}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-zinc-950"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/222222/ffffff?text=TV';
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
          </div>
        )}
      </div>

      {/* BARRA INFERIOR DE CONTROLE (EXATAMENTE COMO NA REFERÊNCIA: PÍLULAS À ESQUERDA, SETAS NO CENTRO) */}
      {!isMiniMode && (
        <div className="w-full max-w-[860px] flex items-center justify-between mt-4 px-1 select-none flex-wrap gap-y-3">
          {/* LADO ESQUERDO: PÍLULAS "MODO CINEMA", "POUPAR INTERNET -75%" E "PIP" */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="player-pill-cinema-mode"
              onClick={onEnterCinemaMode}
              className="px-4 py-2 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-200 hover:text-white border border-zinc-800/90 text-xs font-medium transition cursor-pointer shadow-sm"
            >
              Modo Cinema
            </button>
            <button
              type="button"
              id="player-pill-save-data"
              onClick={() => onToggleLatencyMode()}
              className={`px-4 py-2 rounded-full border text-xs font-medium transition cursor-pointer shadow-sm ${
                latencyMode === 'economy'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#141416] hover:bg-[#202024] text-zinc-200 hover:text-white border border-zinc-800/90'
              }`}
              title="Alternar economia de dados de rede móvel"
            >
              Poupar Internet {latencyMode === 'economy' ? '-75% (Ativo)' : '-75%'}
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
    </div>
  );
}
