'use client';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  Minimize2,
  Volume2,
  VolumeX,
  Server,
  AlertCircle,
  X,
  CheckCircle2,
  SkipBack,
  SkipForward,
  Zap,
  ShieldCheck,
  Sliders,
  Leaf,
  Lock,
  CreditCard,
  KeyRound,
  Film,
} from 'lucide-react';
import { Canal, LatencyMode } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { getNetworkBadge, getSportTag, getChannelQuality } from '@/utils/channelUtils';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';
import { getChannelSchedule } from '@/utils/channelProgramExtractor';
import {
  getSafeStreamUrl,
  isStreamAutoProxied,
  getHlsOptionsForLatencyMode,
  SPORTS_TRIVIA,
  getEmergencyFallbackStream,
} from '@/utils/streamUtils';
import { PlayerSettingsModal } from './PlayerSettingsModal';
import { PlayerTransitionSkeleton } from './PlayerTransitionSkeleton';
import { SubscriptionCountdownBadge } from './SubscriptionCountdownBadge';
import { useAuth } from '@/context/AuthContext';
import { ChannelVideosModal, extractYouTubeId } from './ChannelVideosModal';

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
}: CinemaPlayerProps) {
  const { isAdmin, countdown, isSubscriptionExpired } = useAuth();
  const isPlanExpired = !isAdmin && (isSubscriptionExpired || countdown.expired);
  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChannelVideosOpen, setIsChannelVideosOpen] = useState(false);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [emergencyOverrideUrl, setEmergencyOverrideUrl] = useState<string | null>(null);

  // Áudio suavizado durante transição entre componentes para evitar picos e ruídos
  const effectiveMuted = isMuted || isAudioTransitionMuted;

  const streamsDisponiveis = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
  const activeRawStreamUrl = streamsDisponiveis[streamIndex] || canalAtivo.url;
  const rawStreamToPlay = emergencyOverrideUrl || activeRawStreamUrl;
  const finalStreamUrl = emergencyOverrideUrl
    ? emergencyOverrideUrl
    : getSafeStreamUrl(activeRawStreamUrl, useProxy);
  const isCurrentlyProxied = isStreamAutoProxied(rawStreamToPlay, useProxy);
  const isYouTubeChannel =
    canalAtivo.categoria === 'YouTube' ||
    canalAtivo.rede === 'YouTube' ||
    activeRawStreamUrl.includes('youtube.com') ||
    activeRawStreamUrl.includes('youtu.be');

  const networkBadge = getNetworkBadge(canalAtivo);
  const sportTag = getSportTag(canalAtivo);
  const programaAtual = getChannelSchedule(canalAtivo)[0];
  const quality = getChannelQuality(canalAtivo);

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
              if (existingIndex >= 0) {
                onStreamChange(existingIndex);
              } else if (onAddStreamUrl) {
                onAddStreamUrl(newUrl);
              }
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

  // Watchdog de failover ultrarrápido no modo cinema: 3.5s para conexões imediatas
  useEffect(() => {
    if (hasFirstFrame) return;

    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      setLoadSeconds(seconds);
      if (seconds === 4 && !hasFirstFrame) {
        if (streamsDisponiveis.length > 1 && streamIndex < streamsDisponiveis.length - 1) {
          onStreamChange(streamIndex + 1);
        } else if (!useProxy && !isYouTubeChannel) {
          onToggleProxy();
        }
      }
      if (seconds === 7 && !hasFirstFrame) {
        setTimeout(() => {
          onPlayerError?.(new Error('Tempo limite excedido'));
        }, 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFirstFrame, streamsDisponiveis.length, streamIndex, onStreamChange, useProxy, isYouTubeChannel, onToggleProxy, onPlayerError]);

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
      {/* 🎬 SKELETON / FADE DE TRANSIÇÃO SUAVE ENTRE PLAYERS */}
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

      {/* TOP FLOATING CONTROLS BAR */}
      <div
        id="cinema-top-bar"
        className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between gap-4 pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <img
            src={getChannelLogo(canalAtivo)}
            alt={canalAtivo.nome}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain bg-zinc-900 border border-zinc-700/80 p-1 shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getChannelFallbackLogo(canalAtivo);
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] bg-[#00E676] text-black px-2 py-0.5 rounded font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                Ao Vivo
              </span>
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
                {networkBadge.label} • {sportTag} • {quality}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              {canalAtivo.nome}
            </h2>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zapping Rápido no Modo Cinema */}
          {onPrevCanal && (
            <button
              type="button"
              id="cinema-prev-canal"
              onClick={onPrevCanal}
              className="p-2 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Canal Anterior (Seta Esquerda)"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          {onNextCanal && (
            <button
              type="button"
              id="cinema-next-canal"
              onClick={onNextCanal}
              className="p-2 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Próximo Canal (Seta Direita)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          {/* BOTÃO VER MAIS VÍDEOS DO CANAL NO MODO CINEMA */}
          <button
            type="button"
            id="cinema-btn-channel-videos"
            onClick={() => setIsChannelVideosOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30 flex items-center gap-1.5 cursor-pointer shadow-lg transition"
            title="Ver mais vídeos do canal (reproduzir diretamente no nosso player)"
          >
            <Film className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Ver mais vídeos</span>
            <span className="sm:hidden">Vídeos</span>
            {streamsDisponiveis.length > 1 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500/30 text-white text-[10px] font-bold">
                {streamsDisponiveis.length}
              </span>
            )}
          </button>

          {/* Seletor rápido de rota no modo cinema */}
          {streamsDisponiveis.length > 1 && (
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-full px-2.5 py-1 text-xs">
              <span className="text-zinc-400 text-[11px] mr-1 flex items-center gap-1">
                {isYouTubeChannel ? (
                  <>
                    <Zap className="w-3 h-3 text-red-500" />
                    <span>Playlist:</span>
                  </>
                ) : (
                  <>
                    <Server className="w-3 h-3 text-zinc-500" />
                    <span>Rota:</span>
                  </>
                )}
              </span>
              {streamsDisponiveis.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onStreamChange(idx)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    streamIndex === idx
                      ? isYouTubeChannel
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-[#00E676] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {streamIndex === idx && (
                    <CheckCircle2 className={`w-3 h-3 ${isYouTubeChannel ? 'text-white' : 'text-black'}`} />
                  )}
                  <span>{isYouTubeChannel ? `Vídeo ${idx + 1}` : idx === 0 ? 'Principal' : `Reserva ${idx}`}</span>
                </button>
              ))}

              {isYouTubeChannel && streamIndex < streamsDisponiveis.length - 1 && (
                <button
                  type="button"
                  onClick={() => onStreamChange(streamIndex + 1)}
                  className="ml-1 px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold border border-zinc-700 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                  title="Avançar para o próximo vídeo"
                >
                  <SkipForward className="w-3 h-3 text-red-400" />
                  <span>Próximo</span>
                </button>
              )}
            </div>
          )}

          {/* Alternador Rápido de Modo de Transmissão (Economia vs Estável vs Baixa Latência) */}
          <button
            type="button"
            id="cinema-latency-mode-toggle"
            onClick={() => onToggleLatencyMode()}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
              latencyMode === 'economy'
                ? 'bg-emerald-500/20 border-[#00E676]/60 text-emerald-300 hover:bg-emerald-500/30 ring-1 ring-[#00E676]/30'
                : latencyMode === 'stable'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
            }`}
            title={
              latencyMode === 'economy'
                ? 'Modo Economia de Dados Ativo (Poupa até 75% de internet móvel). Pressione S para opções.'
                : latencyMode === 'stable'
                ? 'Modo Equilibrado HD Ativo (Buffer 14s). Pressione S para opções.'
                : 'Modo Baixa Latência Ativo (Tempo Real). Pressione S para opções.'
            }
          >
            {latencyMode === 'economy' ? (
              <>
                <Leaf className="w-3.5 h-3.5 text-[#00E676]" />
                <span className="hidden sm:inline">Poupar Internet (-70%)</span>
                <span className="sm:hidden">Poupar</span>
              </>
            ) : latencyMode === 'stable' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Equilibrado (HD)</span>
                <span className="sm:hidden">HD</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Baixa Latência</span>
                <span className="sm:hidden">Ao Vivo</span>
              </>
            )}
          </button>

          {/* Cronômetro de Assinatura no Modo Cinema */}
          <SubscriptionCountdownBadge onClick={onOpenPaymentPlans} compact />

          {/* Configurações do Player */}
          <button
            type="button"
            id="cinema-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg hover:scale-105"
            title="Configurações do Player"
          >
            <Sliders className="w-4 h-4" />
          </button>

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
                    {SPORTS_TRIVIA[triviaIndex].icon} {SPORTS_TRIVIA[triviaIndex].tag}
                  </span>
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition">Toque p/ trocar</span>
                </div>
                <h5 className="text-xs font-bold text-white mb-0.5">{SPORTS_TRIVIA[triviaIndex].title}</h5>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{SPORTS_TRIVIA[triviaIndex].fact}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
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

        {React.createElement(
          ReactPlayer as unknown as React.ComponentType<Record<string, unknown>>,
          {
            key: `cinema-${canalAtivo.id || canalAtivo.url}-${streamIndex}-${isCurrentlyProxied ? 'proxy' : 'direct'}`,
            url: finalStreamUrl,
            src: finalStreamUrl,
            playing: true,
            muted: effectiveMuted,
            controls: true,
            width: '100%',
            height: '100%',
            playsinline: true,
            config: {
              file: {
                forceHLS:
                  !finalStreamUrl.includes('youtube.com') &&
                  !finalStreamUrl.includes('youtu.be'),
                hlsOptions: getHlsOptionsForLatencyMode(latencyMode),
              },
              youtube: {
                playerVars: {
                  autoplay: 1,
                  modestbranding: 1,
                  rel: 0,
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
            onBuffer: () => setIsBuffering(true),
            onBufferEnd: () => {
              setIsBuffering(false);
              setHasFirstFrame(true);
            },
            onEnded: () => {
              // Transição automática para o próximo vídeo quando terminar
              setTimeout(() => {
                onVideoEnded?.();
              }, 0);
            },
            onError: (err) => {
              setTimeout(() => {
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
            <h3 className="text-xl font-black text-white max-w-md">Tempo de Acesso Expirado</h3>
            <div className="font-mono text-3xl font-black text-rose-500 tracking-wider my-2 bg-black/60 px-5 py-1.5 rounded-xl border border-rose-500/30 shadow-inner">
              00:00:00
            </div>
            <p className="text-xs text-zinc-400 max-w-md mt-1 leading-relaxed">
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

        {isSettingsOpen && (
          <PlayerSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            latencyMode={latencyMode}
            onSelectLatencyMode={(mode) => onToggleLatencyMode(mode)}
            useProxy={useProxy}
            onToggleProxy={onToggleProxy}
            canalNome={canalAtivo.nome}
            quality={quality}
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

