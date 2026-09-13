'use client';
import React from 'react';
import { Maximize2, Minimize2, Tv, Volume2, ShieldCheck } from 'lucide-react';
import { Canal } from '@/types';
import { getSportTag, getChannelQuality } from '@/utils/channelUtils';

interface PlayerTransitionSkeletonProps {
  canal: Canal | null;
  direction: 'to-cinema' | 'to-hero';
  variant?: 'hero' | 'cinema';
}

export function PlayerTransitionSkeleton({
  canal,
  direction,
  variant = 'hero',
}: PlayerTransitionSkeletonProps) {
  const isCinema = direction === 'to-cinema';
  const sportTag = canal ? getSportTag(canal) : 'Ao Vivo';
  const quality = canal ? getChannelQuality(canal) : '1080p';

  return (
    <div
      id="player-transition-skeleton"
      className={`relative w-full h-full bg-zinc-950/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none border border-zinc-800/60 ${
        variant === 'cinema' ? 'p-6 sm:p-10' : 'p-4 sm:p-6'
      }`}
    >
      {/* 🌟 VARREDURA DE SHIMMER ULTRA-SUAVE */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-player-shimmer pointer-events-none" />

      {/* 🌟 BRILHO RADIAL DE FUNDO */}
      <div className="absolute inset-0 bg-radial from-[#00E676]/5 via-transparent to-black pointer-events-none" />

      {/* 🔝 CABEÇALHO SUPERIOR SKELETON */}
      <div className="relative z-10 flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3">
          {/* LOGO MINI SKELETON */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-1 flex items-center justify-center shrink-0 shadow-lg">
            {canal?.logo ? (
              <img
                src={canal.logo}
                alt={canal.nome}
                className="w-full h-full object-contain opacity-70 filter grayscale"
              />
            ) : (
              <Tv className="w-5 h-5 text-zinc-600 animate-pulse" />
            )}
          </div>

          <div className="space-y-1.5">
            {/* CANAL NOME SKELETON */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-zinc-200 tracking-tight">
                {canal?.nome || 'Canal de TV'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                {sportTag}
              </span>
            </div>
            {/* STATUS SUB-BAR */}
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 rounded bg-zinc-800/70 animate-pulse" />
              <div className="w-24 h-2 rounded bg-zinc-800/50 animate-pulse" />
            </div>
          </div>
        </div>

        {/* PILLS SUPERIORES SKELETON */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]/70" />
            <span>Filtro Anti-Pico Ativo</span>
          </div>

          <div className="h-7 w-16 rounded-full bg-zinc-900/80 border border-zinc-800/80 animate-pulse" />
        </div>
      </div>

      {/* 🎯 NÚCLEO CENTRAL DE TRANSIÇÃO VISUAL COM ANIMAÇÃO */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4">
        {/* LOGO CENTRALIZADO COM PULSO RADIAL */}
        <div className="relative mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 p-2 shadow-2xl flex items-center justify-center ring-2 ring-[#00E676]/30">
            {canal?.logo ? (
              <img
                src={canal.logo}
                alt={canal.nome}
                className="w-full h-full object-contain"
              />
            ) : (
              <Tv className="w-8 h-8 text-zinc-400" />
            )}
          </div>

          {/* BEACON DE SINCRONIZAÇÃO */}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00E676] border-2 border-black"></span>
          </span>
        </div>

        {/* BADGE DE AÇÃO EM ANDAMENTO */}
        <div
          id="player-transition-status-pill"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-[#00E676]/40 text-xs text-white shadow-xl mb-2"
        >
          {isCinema ? (
            <Maximize2 className="w-3.5 h-3.5 text-[#00E676] animate-pulse" />
          ) : (
            <Minimize2 className="w-3.5 h-3.5 text-[#00E676] animate-pulse" />
          )}
          <span className="font-bold text-zinc-100">
            {isCinema ? 'Alternando para Modo Cinema' : 'Retornando à Grade de Canais'}
          </span>
        </div>

        <p className="text-[11px] sm:text-xs text-zinc-400 max-w-xs mt-1">
          {isCinema
            ? 'Ajustando tela cheia e estabilizando fluxo de áudio...'
            : 'Sincronizando sinal do reprodutor com a tela principal...'}
        </p>

        {/* INDICADOR DE ÁUDIO SUAVIZADO (SEM PICOS DE SOM) */}
        <div
          id="player-transition-audio-indicator"
          className="mt-3 flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-zinc-800/80 text-[10px] text-zinc-400"
        >
          <Volume2 className="w-3 h-3 text-[#00E676]" />
          <span>Suavização de áudio ativa</span>
          {/* EQUALIZADOR MICRO-ANIMADO */}
          <div className="flex items-end gap-0.5 h-3 px-1">
            <span className="w-0.5 h-2 bg-[#00E676] rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-[#00E676] rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-1.5 bg-[#00E676] rounded-full animate-pulse delay-150" />
            <span className="w-0.5 h-2.5 bg-[#00E676] rounded-full animate-pulse delay-100" />
          </div>
        </div>

        {/* BARRA DE PROGRESSO ILUMINADA */}
        <div
          id="player-transition-progress-bar"
          className="w-44 sm:w-56 h-1 rounded-full bg-zinc-800/80 mt-4 overflow-hidden relative"
        >
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-[#00E676] to-transparent animate-player-shimmer" />
        </div>
      </div>

      {/* 🔽 RODAPÉ INFERIOR SKELETON (CONTROLES SIMULADOS) */}
      <div className="relative z-10 flex items-center justify-between gap-3 w-full pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          {/* PLAY CIRCLE SKELETON */}
          <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 animate-pulse" />
          {/* VOLUME ICON SKELETON */}
          <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 animate-pulse" />
          {/* BARRA DE BUFFERING */}
          <div className="w-20 sm:w-32 h-2 rounded-full bg-zinc-900 border border-zinc-800/80 animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          {/* QUALITY PILL SKELETON */}
          <div className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500">
            {quality}
          </div>
          {/* FULLSCREEN SKELETON */}
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
