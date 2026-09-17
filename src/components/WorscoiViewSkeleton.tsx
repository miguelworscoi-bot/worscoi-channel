'use client';
import React from 'react';
import { LayoutDashboard, Users, Film, Loader2 } from 'lucide-react';
import { WorscoiView } from '@/types';

interface WorscoiViewSkeletonProps {
  view: WorscoiView;
}

export function WorscoiViewSkeleton({ view }: WorscoiViewSkeletonProps) {
  if (view === 'painel') {
    return (
      <div
        id="skeleton-view-painel"
        className="w-full max-w-6xl mx-auto space-y-6 animate-pulse py-2 select-none"
      >
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-[#00E676]/60 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-44 bg-zinc-800/80 rounded-md" />
              <div className="h-3 w-64 bg-zinc-900/90 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-zinc-900 rounded-full border border-zinc-800/80" />
            <div className="h-9 w-32 bg-zinc-900 rounded-full border border-zinc-800/80" />
          </div>
        </div>

        {/* 4 CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`metric-skeleton-${i}`}
              className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-zinc-800/60 rounded" />
                <div className="w-7 h-7 rounded-xl bg-zinc-800/40" />
              </div>
              <div className="h-7 w-28 bg-zinc-800/80 rounded-lg" />
              <div className="h-2.5 w-36 bg-zinc-900 rounded" />
            </div>
          ))}
        </div>

        {/* GRÁFICO PLACEHOLDER */}
        <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 bg-zinc-800/70 rounded-md" />
            <div className="h-3 w-24 bg-zinc-900 rounded" />
          </div>
          <div className="h-64 sm:h-72 w-full rounded-2xl bg-zinc-950/60 border border-zinc-800/40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <Loader2 className="w-6 h-6 animate-spin text-[#00E676]/70" />
              <span className="text-xs font-medium text-zinc-500">
                Carregando métricas e gráficos em tempo real...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'assinantes') {
    return (
      <div
        id="skeleton-view-assinantes"
        className="w-full max-w-6xl mx-auto space-y-6 animate-pulse py-2 select-none"
      >
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Users className="w-5 h-5 text-sky-400/60 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-zinc-800/80 rounded-md" />
              <div className="h-3 w-72 bg-zinc-900/90 rounded-md" />
            </div>
          </div>
          <div className="h-9 w-36 bg-zinc-900 rounded-full border border-zinc-800/80" />
        </div>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
          <div className="h-10 w-32 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
        </div>

        {/* TABELA DE ASSINANTES */}
        <div className="rounded-3xl bg-zinc-900/30 border border-zinc-800/80 overflow-hidden">
          <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="h-3.5 w-32 bg-zinc-800/70 rounded" />
            <div className="h-3.5 w-20 bg-zinc-900 rounded" />
          </div>
          <div className="divide-y divide-zinc-800/40 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={`sub-skeleton-${i}`}
                className="p-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800/80" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 bg-zinc-800/70 rounded" />
                    <div className="h-2.5 w-44 bg-zinc-900 rounded" />
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-6 w-24 bg-zinc-800/60 rounded-full" />
                  <div className="h-6 w-20 bg-zinc-800/60 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'filmoteca') {
    return (
      <div
        id="skeleton-view-filmoteca"
        className="w-full max-w-7xl mx-auto space-y-6 animate-pulse py-2 select-none"
      >
        {/* BANNER DESTAQUE HERO SKELETON */}
        <div className="relative w-full h-56 sm:h-72 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden flex flex-col justify-end p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Film className="w-4 h-4 text-amber-400/70 animate-spin" />
            </div>
            <div className="h-4 w-28 bg-amber-400/20 rounded-full" />
          </div>
          <div className="h-7 sm:h-9 w-72 sm:w-96 bg-zinc-800 rounded-xl" />
          <div className="h-3.5 max-w-lg w-full bg-zinc-800/60 rounded" />
          <div className="flex gap-3 pt-2">
            <div className="h-9 w-28 bg-white/20 rounded-full" />
            <div className="h-9 w-28 bg-zinc-800 rounded-full" />
          </div>
        </div>

        {/* BARRA DE GÊNEROS / ABAS */}
        <div className="flex items-center gap-2 overflow-hidden py-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={`genre-skeleton-${i}`}
              className="h-8 w-24 rounded-full bg-zinc-900/80 border border-zinc-800/60 shrink-0"
            />
          ))}
        </div>

        {/* FILEIRA DE CARDS DE FILMES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-zinc-800/70 rounded" />
            <div className="h-3 w-16 bg-zinc-900 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={`movie-card-skeleton-${i}`}
                className="space-y-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-2 overflow-hidden"
              >
                <div className="aspect-[2/3] w-full rounded-xl bg-zinc-800/70" />
                <div className="h-3 w-3/4 bg-zinc-800/70 rounded" />
                <div className="h-2.5 w-1/2 bg-zinc-900 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 text-zinc-500 gap-3 animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin text-[#00E676]" />
      <span className="text-sm font-medium">Carregando visualização...</span>
    </div>
  );
}

export default WorscoiViewSkeleton;
