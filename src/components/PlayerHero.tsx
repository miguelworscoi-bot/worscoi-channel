'use client';
import React, { useState } from 'react';
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
}: PlayerHeroProps) {
  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

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

  const streamsDisponiveis = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
  const activeRawStreamUrl = streamsDisponiveis[streamIndex] || canalAtivo.url;
  const finalStreamUrl = useProxy
    ? `/api/proxy?url=${encodeURIComponent(activeRawStreamUrl)}`
    : activeRawStreamUrl;

  const quality = getChannelQuality(canalAtivo);
  const networkBadge = getNetworkBadge(canalAtivo);
  const sportTag = getSportTag(canalAtivo);
  const programaAtual = getChannelSchedule(canalAtivo)[0];

  const handleReload = () => {
    setIsReady(false);
    setIsBuffering(true);
    onClearFailoverNotice();
  };

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
                },
              },
              onReady: () => {
                setIsReady(true);
                setIsBuffering(false);
              },
              onBuffer: () => setIsBuffering(true),
              onBufferEnd: () => setIsBuffering(false),
              onError: onPlayerError,
            }
          )}
        </div>

        {/* SKELETON / BUFFERING OVERLAY */}
        {(!isReady || isBuffering) && (
          <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
            <div className="relative flex items-center justify-center mb-3">
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-[#00E676] opacity-30"></span>
              <div className="w-10 h-10 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs font-semibold text-zinc-300 tracking-wide">
              Sintonizando {canalAtivo.nome}...
            </p>
            <span className="text-[10px] text-zinc-500 mt-1">
              {streamIndex === 0 ? 'Servidor Principal' : `Servidor Reserva ${streamIndex}`}
            </span>
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
            <span
              className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border ${networkBadge.badgeBg} ${networkBadge.textColor} ${networkBadge.borderColor}`}
            >
              {networkBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* MODO CINEMA BOTÃO FLUTUANTE */}
            <button
              type="button"
              id="player-cinema-btn"
              onClick={onEnterCinemaMode}
              className="bg-black/80 hover:bg-black text-zinc-200 hover:text-white text-xs px-3 py-1.5 rounded-full border border-zinc-700/80 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:border-[#00E676]/50 hover:scale-[1.02] active:scale-95"
              title="Expandir Modo Cinema (Tela Cheia Imersiva)"
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
        {/* LINHA 1: INFORMAÇÕES DO CANAL + FAVORITAR + ÁUDIO */}
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

          {/* AÇÕES: ÁUDIO & FAVORITO */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
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
              title={isMuted ? 'Ativar som' : 'Silenciar áudio'}
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
