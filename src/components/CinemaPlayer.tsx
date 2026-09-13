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
} from 'lucide-react';
import { Canal, LatencyMode } from '@/types';
import { getNetworkBadge, getSportTag, getChannelQuality } from '@/utils/channelUtils';
import { getChannelSchedule } from '@/utils/channelProgramExtractor';
import { getSafeStreamUrl, isStreamAutoProxied, getHlsOptionsForLatencyMode } from '@/utils/streamUtils';
import { PlayerSettingsModal } from './PlayerSettingsModal';

interface CinemaPlayerProps {
  canalAtivo: Canal;
  streamIndex: number;
  onStreamChange: (index: number) => void;
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
}

export function CinemaPlayer({
  canalAtivo,
  streamIndex,
  onStreamChange,
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
}: CinemaPlayerProps) {
  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const streamsDisponiveis = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
  const activeRawStreamUrl = streamsDisponiveis[streamIndex] || canalAtivo.url;
  const finalStreamUrl = getSafeStreamUrl(activeRawStreamUrl, useProxy);
  const isCurrentlyProxied = isStreamAutoProxied(activeRawStreamUrl, useProxy);

  const networkBadge = getNetworkBadge(canalAtivo);
  const sportTag = getSportTag(canalAtivo);
  const programaAtual = getChannelSchedule(canalAtivo)[0];
  const quality = getChannelQuality(canalAtivo);

  // Reset de estados
  useEffect(() => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setLoadSeconds(0);
  }, [canalAtivo.id, canalAtivo.url, streamIndex, useProxy]);

  // Watchdog de failover automático no modo cinema (9s para permitir negociação de buffer)
  useEffect(() => {
    if (hasFirstFrame) return;

    const interval = setInterval(() => {
      setLoadSeconds((prev) => {
        const next = prev + 1;
        if (next === 9 && !hasFirstFrame) {
          if (streamsDisponiveis.length > 1 && streamIndex < streamsDisponiveis.length - 1) {
            onStreamChange(streamIndex + 1);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFirstFrame, streamsDisponiveis.length, streamIndex, onStreamChange]);

  // Teclado: ESC fecha cinema, Setas zapam canais, M muta, S alterna modo
  useEffect(() => {
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
  }, [onClose, onNextCanal, onPrevCanal, onToggleMute, onToggleLatencyMode]);

  return (
    <div
      id="cinema-mode-overlay"
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-200"
    >
      {/* TOP FLOATING CONTROLS BAR */}
      <div
        id="cinema-top-bar"
        className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between gap-4 pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <img
            src={canalAtivo.logo}
            alt={canalAtivo.nome}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain bg-zinc-900 border border-zinc-700/80 p-1 shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/80x80/222222/ffffff?text=TV';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] bg-[#00E676] text-black px-2 py-0.5 rounded font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                Ao Vivo
              </span>
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
                {networkBadge.label} • {sportTag}
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

          {/* Seletor rápido de rota no modo cinema */}
          {streamsDisponiveis.length > 1 && (
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-full px-2.5 py-1 text-xs">
              <span className="text-zinc-400 text-[11px] mr-1 flex items-center gap-1">
                <Server className="w-3 h-3 text-zinc-500" />
                <span>Rota:</span>
              </span>
              {streamsDisponiveis.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onStreamChange(idx)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    streamIndex === idx
                      ? 'bg-[#00E676] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {streamIndex === idx && <CheckCircle2 className="w-3 h-3 text-black" />}
                  <span>{idx === 0 ? 'Principal' : `Reserva ${idx}`}</span>
                </button>
              ))}
            </div>
          )}

          {/* Alternador Rápido de Modo de Transmissão (Modo Estável vs Baixa Latência) */}
          <button
            type="button"
            id="cinema-latency-mode-toggle"
            onClick={() => onToggleLatencyMode()}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
              latencyMode === 'stable'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
            }`}
            title={
              latencyMode === 'stable'
                ? 'Modo Estável Ativo (Buffer 30s para redes lentas). Clique para alternar para Baixa Latência (Pressione S).'
                : 'Modo Baixa Latência Ativo (Tempo Real). Clique para alternar para Modo Estável (Pressione S).'
            }
          >
            {latencyMode === 'stable' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
                <span className="hidden sm:inline">Modo Estável (Buffer+)</span>
                <span className="sm:hidden">Estável</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Baixa Latência</span>
                <span className="sm:hidden">Ao Vivo</span>
              </>
            )}
          </button>

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
            className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-800/90 hover:bg-red-500 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-zinc-600/80 hover:border-red-500 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95"
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
                  {loadSeconds < 4
                    ? 'Sintonizando sinal...'
                    : 'Aguardando primeiros quadros...'}
                </span>
              </div>

              {streamsDisponiveis.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = (streamIndex + 1) % streamsDisponiveis.length;
                    onStreamChange(next);
                  }}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mudar Servidor ({streamIndex + 1}/{streamsDisponiveis.length})</span>
                </button>
              )}
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
            muted: isMuted,
            controls: true,
            width: '100%',
            height: '100%',
            playsinline: true,
            config: {
              file: {
                forceHLS: true,
                hlsOptions: {
                  enableWorker: true,
                  lowLatencyMode: true,
                  backBufferLength: 30,
                  maxBufferLength: 10,
                  maxMaxBufferLength: 20,
                  manifestLoadingTimeOut: 12000,
                  manifestLoadingMaxRetry: 3,
                  levelLoadingTimeOut: 12000,
                  levelLoadingMaxRetry: 3,
                  fragLoadingTimeOut: 12000,
                  fragLoadingMaxRetry: 3,
                  startLevel: -1,
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
            onError: onPlayerError,
          }
        )}
      </div>
    </div>
  );
}

