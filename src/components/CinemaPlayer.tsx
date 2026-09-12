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
} from 'lucide-react';
import { Canal } from '@/types';
import { getNetworkBadge } from '@/utils/channelUtils';

interface CinemaPlayerProps {
  canalAtivo: Canal;
  streamIndex: number;
  onStreamChange: (index: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  useProxy: boolean;
  onClose: () => void;
  failoverNotice: string | null;
  onClearFailoverNotice: () => void;
  onPlayerError: (error: unknown) => void;
}

export function CinemaPlayer({
  canalAtivo,
  streamIndex,
  onStreamChange,
  isMuted,
  onToggleMute,
  useProxy,
  onClose,
  failoverNotice,
  onClearFailoverNotice,
  onPlayerError,
}: CinemaPlayerProps) {
  const [isReady, setIsReady] = useState(false);

  // Close on ESC and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const streamsDisponiveis = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
  const activeRawStreamUrl = streamsDisponiveis[streamIndex] || canalAtivo.url;
  const finalStreamUrl = useProxy
    ? `/api/proxy?url=${encodeURIComponent(activeRawStreamUrl)}`
    : activeRawStreamUrl;

  const networkBadge = getNetworkBadge(canalAtivo);

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
                {networkBadge.label} • Modo Cinema
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              {canalAtivo.nome}
            </h2>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Áudio Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
              isMuted
                ? 'bg-zinc-900/90 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-200 hover:text-white'
            }`}
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
        <div className="absolute top-20 left-6 right-6 z-50 bg-zinc-900/90 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs px-4 py-2 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{failoverNotice}</span>
          </div>
          <button type="button" onClick={onClearFailoverNotice} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FULLSCREEN PLAYER */}
      <div className="w-full h-full flex items-center justify-center p-0 md:p-4 relative">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-10">
            <div className="w-10 h-10 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
          </div>
        )}
        {React.createElement(
          ReactPlayer as unknown as React.ComponentType<Record<string, unknown>>,
          {
            key: `cinema-${canalAtivo.id || canalAtivo.url}-${streamIndex}-${useProxy ? 'proxy' : 'direct'}`,
            url: finalStreamUrl,
            src: finalStreamUrl,
            playing: true,
            muted: isMuted,
            controls: true,
            width: '100%',
            height: '100%',
            playsinline: true,
            config: { file: { forceHLS: true } },
            onReady: () => setIsReady(true),
            onError: onPlayerError,
          }
        )}
      </div>
    </div>
  );
}
