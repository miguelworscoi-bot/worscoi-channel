'use client';
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
  Volume2,
  VolumeX,
  Maximize2,
  ShieldCheck,
  RefreshCw,
  Server,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Tv,
  SkipBack,
  SkipForward,
  Zap,
} from 'lucide-react';
import { Canal } from '@/types';
import { getChannelQuality, getNetworkBadge, getSportTag } from '@/utils/channelUtils';
import { getChannelSchedule } from '@/utils/channelProgramExtractor';

interface PlayerHeroProps {
  canalAtivo: Canal | null;
  streamIndex: number;
  onStreamChange: (index: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  useProxy: boolean;
  onToggleProxy: () => void;
  onEnterCinemaMode: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  failoverNotice: string | null;
  onClearFailoverNotice: () => void;
  onPlayerError: (error: unknown) => void;
  onNextCanal?: () => void;
  onPrevCanal?: () => void;
}

export function PlayerHero({
  canalAtivo,
  streamIndex,
  onStreamChange,
  isMuted,
  onToggleMute,
  useProxy,
  onToggleProxy,
  onEnterCinemaMode,
  isFavorited,
  onToggleFavorite,
  failoverNotice,
  onClearFailoverNotice,
  onPlayerError,
  onNextCanal,
  onPrevCanal,
}: PlayerHeroProps) {
  const [_isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);

  const streamsDisponiveis = canalAtivo
    ? [canalAtivo.url, ...(canalAtivo.backupUrls || [])]
    : [];
  const activeRawStreamUrl =
    canalAtivo && streamsDisponiveis[streamIndex]
      ? streamsDisponiveis[streamIndex]
      : canalAtivo?.url || '';
  const finalStreamUrl = useProxy
    ? `/api/proxy?url=${encodeURIComponent(activeRawStreamUrl)}`
    : activeRawStreamUrl;

  const quality = canalAtivo ? getChannelQuality(canalAtivo) : 'HD';
  const networkBadge = canalAtivo ? getNetworkBadge(canalAtivo) : { label: '', badgeBg: '', textColor: '', borderColor: '' };
  const sportTag = canalAtivo ? getSportTag(canalAtivo) : '';
  const programaAtual = canalAtivo ? getChannelSchedule(canalAtivo)[0] : null;

  // Reset de estados ao trocar de canal ou rota
  useEffect(() => {
    setIsReady(false);
    setIsBuffering(true);
    setHasFirstFrame(false);
    setLoadSeconds(0);
  }, [canalAtivo?.id, canalAtivo?.url, streamIndex, useProxy]);

  // Watchdog de conexão rápida: se passar 6s sem sinal de vídeo, avança automaticamente
  useEffect(() => {
    if (hasFirstFrame || !canalAtivo) return;

    const interval = setInterval(() => {
      setLoadSeconds((prev) => {
        const nextSec = prev + 1;
        // Aos 6 segundos na tela escura/carregando, auto-avança para rota reserva ou proxy
        if (nextSec === 6 && !hasFirstFrame) {
          if (streamsDisponiveis.length > 1 && streamIndex < streamsDisponiveis.length - 1) {
            onStreamChange(streamIndex + 1);
          } else if (!useProxy) {
            onToggleProxy();
          }
        }
        return nextSec;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFirstFrame, canalAtivo, streamsDisponiveis.length, streamIndex, useProxy, onStreamChange, onToggleProxy]);

  // Atalhos de teclado úteis para zapping de canal e controles
  useEffect(() => {
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextCanal, onPrevCanal, onToggleMute, onEnterCinemaMode]);

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
        className="w-full aspect-video bg-[#121214] border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mb-4 border border-zinc-800">
          <Tv className="w-8 h-8 text-zinc-500 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-zinc-200 mb-1">Nenhum canal selecionado</h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          Selecione um canal na grade ao lado ou use a busca global para sintonizar a transmissão.
        </p>
      </div>
    );
  }

  return (
    <div id="player-hero-section" className="space-y-4">
      {/* 📺 HERO CONTAINER COM ASPECTO 16:9 & OVERLAYS CINEMATOGRÁFICOS */}
      <div className="group relative aspect-video w-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl shadow-black/90 ring-1 ring-zinc-700/30 transition-all duration-300 hover:ring-[#00E676]/30">
        {/* PLAYER VIDEO */}
        <div className="w-full h-full">
          {React.createElement(
            ReactPlayer as unknown as React.ComponentType<Record<string, unknown>>,
            {
              key: `${canalAtivo.id || canalAtivo.url}-${streamIndex}-${useProxy ? 'proxy' : 'direct'}`,
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
                    maxBufferLength: 8,
                    maxMaxBufferLength: 15,
                    manifestLoadingTimeOut: 5000,
                    manifestLoadingMaxRetry: 2,
                    levelLoadingTimeOut: 5000,
                    levelLoadingMaxRetry: 2,
                    fragLoadingTimeOut: 6000,
                    fragLoadingMaxRetry: 2,
                    startLevel: -1,
                  },
                  attributes: {
                    autoPlay: true,
                    playsInline: true,
                  },
                },
              },
              onReady: () => {
                setIsReady(true);
              },
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
              onError: (err: unknown) => {
                onPlayerError(err);
              },
            }
          )}
        </div>

        {/* 🌟 POSTER ATMOSFÉRICO DE PRÉ-CARREGAMENTO (ADEUS TELA ESCURA VAZIA!) */}
        {!hasFirstFrame && (
          <div
            id="player-signal-backdrop"
            className="absolute inset-0 z-20 overflow-hidden flex flex-col items-center justify-center transition-all duration-500 bg-zinc-950"
          >
            {/* BACKGROUND ARTWORK COM GRADIENTE SUAVE */}
            <div className="absolute inset-0">
              <img
                src={
                  programaAtual?.imagemCapa ||
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop'
                }
                alt={canalAtivo.nome}
                className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60" />
            </div>

            {/* CONTEÚDO CENTRAL: LOGO DO CANAL, PROGRAMA E STATUS DO SINAL */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md animate-in fade-in zoom-in-95 duration-200">
              {/* LOGO COM PULSO RADIAL */}
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 p-2 shadow-2xl flex items-center justify-center ring-2 ring-[#00E676]/30">
                  <img
                    src={canalAtivo.logo}
                    alt={canalAtivo.nome}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/120x120/18181b/00E676?text=TV';
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00E676] border-2 border-black"></span>
                </span>
              </div>

              {/* TÍTULO E TAG */}
              <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                  {canalAtivo.nome}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {sportTag}
                </span>
              </div>

              {programaAtual && (
                <p className="text-xs text-zinc-400 line-clamp-1 mb-2">
                  <span className="text-[#00E676] font-semibold">No ar:</span> {programaAtual.titulo}
                </p>
              )}

              {/* STATUS COM TEMPO REAL DA CONEXÃO */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/90 text-xs shadow-md mt-1">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping"></span>
                <span className="text-zinc-300 font-medium">
                  {loadSeconds < 3
                    ? `Sintonizando ${streamIndex === 0 ? 'Servidor Principal' : `Servidor Reserva ${streamIndex}`}...`
                    : loadSeconds < 6
                    ? 'Recebendo transmissão ao vivo...'
                    : 'Sinal demorando a responder. Alternando rota...'}
                </span>
              </div>

              {/* BOTÕES DE AÇÃO RÁPIDA: SEM FICAR PRESO ESPERANDO */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {streamsDisponiveis.length > 1 && (
                  <button
                    type="button"
                    id="hero-quick-switch-stream"
                    onClick={() => {
                      const next = (streamIndex + 1) % streamsDisponiveis.length;
                      onStreamChange(next);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    title="Alternar para o próximo sinal disponível imediatamente"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mudar Servidor ({streamIndex + 1}/{streamsDisponiveis.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  id="hero-quick-proxy-toggle"
                  onClick={onToggleProxy}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer ${
                    useProxy
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-700 hover:text-white hover:border-zinc-500'
                  }`}
                  title="Contornar bloqueios de rede com o servidor proxy"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{useProxy ? 'Proxy Ativo' : 'Tentar via Proxy'}</span>
                </button>

                {onNextCanal && (
                  <button
                    type="button"
                    id="hero-quick-next-channel"
                    onClick={onNextCanal}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    title="Avançar para o próximo canal da lista"
                  >
                    <SkipForward className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Próximo Canal</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SPINNER DISCRETO DE REBUFFERING SE O VÍDEO JÁ ESTIVER RODANDO */}
        {hasFirstFrame && isBuffering && (
          <div className="absolute top-4 right-4 z-30 bg-black/80 backdrop-blur-md border border-[#00E676]/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-white shadow-xl animate-in fade-in">
            <div className="w-3 h-3 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
            <span className="text-[11px] font-semibold text-zinc-300">Ajustando sinal...</span>
          </div>
        )}

        {/* OVERLAY SUPERIOR: BADGE AO VIVO, REDE E MODO CINEMA */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-5 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* LIVE BADGE COM PULSE */}
            <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-[#00E676]/40 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
              </span>
              <span>AO VIVO</span>
            </div>

            {/* QUALIDADE */}
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-900/80 backdrop-blur-md text-[#00E676] border border-[#00E676]/30 shadow-md">
              {quality === '4K' ? '4K UHD' : quality === '1080p' ? '1080p FHD' : 'HD 720p'}
            </span>

            {/* REDE */}
            {networkBadge.label && (
              <span
                className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border ${networkBadge.badgeBg} ${networkBadge.textColor} ${networkBadge.borderColor}`}
              >
                {networkBadge.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* MODO CINEMA BOTÃO FLUTUANTE */}
            <button
              type="button"
              id="player-cinema-btn"
              onClick={onEnterCinemaMode}
              className="bg-black/80 hover:bg-black text-zinc-200 hover:text-white text-xs px-3 py-1.5 rounded-full border border-zinc-700/80 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:border-[#00E676]/50 hover:scale-[1.02] active:scale-95"
              title="Expandir Modo Cinema (Tela Cheia Imersiva - Pressione F)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="hidden sm:inline">Modo Cinema</span>
            </button>
          </div>
        </div>

        {/* OVERLAY DE NOTIFICAÇÃO DE FAILOVER (SE HOUVER TROCA DE ROTA) */}
        {failoverNotice && (
          <div
            id="player-failover-banner"
            className="absolute top-16 left-4 right-4 z-30 bg-zinc-950/95 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{failoverNotice}</span>
            </div>
            <button
              type="button"
              onClick={onClearFailoverNotice}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 🎛️ CONTROLES MINIMALISTAS & DADOS DO CANAL HERÓI */}
      <div
        id="player-details-strip"
        className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
      >
        {/* LINHA 1: INFORMAÇÕES DO CANAL + ZAPPING + FAVORITAR + ÁUDIO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={canalAtivo.logo}
                alt={canalAtivo.nome}
                className="w-12 h-12 rounded-xl object-contain bg-zinc-950 border border-zinc-800 p-1 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/80x80/222222/ffffff?text=TV';
                }}
              />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E676] border-2 border-black"></span>
              </span>
            </div>

            <div className="truncate">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
                  {canalAtivo.nome}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {sportTag}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>{networkBadge.label}</span>
                <span>•</span>
                <span className="text-zinc-500">
                  {streamsDisponiveis.length} {streamsDisponiveis.length === 1 ? 'fonte' : 'fontes disponíveis'}
                </span>
              </p>
              {programaAtual && (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-zinc-300 font-medium truncate flex items-center gap-1.5">
                    <span className="text-[#00E676] font-bold shrink-0">No Ar:</span>
                    <span className="truncate text-zinc-200">{programaAtual.titulo}</span>
                  </p>
                  {programaAtual.fonteOficialNome && (
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Guia Oficial: {programaAtual.fonteOficialNome}
                    </span>
                  )}
                  {programaAtual.isJogoGrande && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      BeSoccer • Jogo Grande
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AÇÕES: ZAPPING RÁPIDO + ÁUDIO & FAVORITO */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {/* Zapping Rápido: Anterior e Próximo */}
            {onPrevCanal && (
              <button
                type="button"
                id="player-prev-canal-btn"
                onClick={onPrevCanal}
                className="px-2.5 py-2 rounded-xl text-xs font-bold border bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
                title="Canal anterior (Seta esquerda ou [)"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Anterior</span>
              </button>
            )}

            {onNextCanal && (
              <button
                type="button"
                id="player-next-canal-btn"
                onClick={onNextCanal}
                className="px-2.5 py-2 rounded-xl text-xs font-bold border bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
                title="Próximo canal (Seta direita ou ])"
              >
                <span className="hidden md:inline">Próximo</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Botão de Áudio Rápido */}
            <button
              type="button"
              id="player-audio-toggle"
              onClick={onToggleMute}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isMuted
                  ? 'bg-zinc-900 border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
              title={isMuted ? 'Ativar som (Pressione M)' : 'Silenciar áudio (Pressione M)'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Ativar Som</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#00E676]" />
                  <span>Áudio Ativo</span>
                </>
              )}
            </button>

            {/* Botão Favoritar */}
            <button
              type="button"
              id="player-favorite-btn"
              onClick={onToggleFavorite}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isFavorited
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
              title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  isFavorited ? 'fill-amber-400 text-amber-400' : 'text-current'
                }`}
              />
              <span>{isFavorited ? 'Favoritado' : 'Favoritar'}</span>
            </button>
          </div>
        </div>

        {/* LINHA 2: SELETOR DE ROTA / BACKUPS + PROXY SEGURO + RECARREGAR */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-400 font-semibold flex items-center gap-1 text-[11px]">
              <Server className="w-3.5 h-3.5 text-zinc-500" />
              <span>Rota de Transmissão:</span>
            </span>

            {streamsDisponiveis.map((_, idx) => {
              const isSelected = streamIndex === idx;
              const label = idx === 0 ? 'Principal' : `Reserva ${idx}`;

              return (
                <button
                  key={idx}
                  type="button"
                  id={`hero-stream-btn-${idx}`}
                  onClick={() => onStreamChange(idx)}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#00E676] text-black border-[#00E676] shadow-sm shadow-[#00E676]/30'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Toggle de Proxy Seguro */}
            <button
              type="button"
              id="hero-proxy-btn"
              onClick={onToggleProxy}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                useProxy
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
              }`}
              title="Contorna bloqueios de CORS e restrições de User-Agent via servidor"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Proxy Seguro: {useProxy ? 'Ativado' : 'Direto'}</span>
            </button>

            {/* Recarregar */}
            <button
              type="button"
              id="hero-reload-btn"
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
              title="Recarregar transmissão atual"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

