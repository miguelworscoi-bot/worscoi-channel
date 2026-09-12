'use client';
import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  Radio,
} from 'lucide-react';
import { Canal } from '@/types';
import { getChannelQuality, getNetworkBadge, getSportTag } from '@/utils/channelUtils';

interface NowPlayingRailProps {
  canalAtivo: Canal | null;
  todosCanais: Canal[];
  favorites: string[];
  onSelectCanal: (canal: Canal) => void;
  onToggleFavorite: (canal: Canal, e?: React.MouseEvent) => void;
}

export function NowPlayingRail({
  canalAtivo,
  todosCanais,
  favorites,
  onSelectCanal,
  onToggleFavorite,
}: NowPlayingRailProps) {
  const favoritesRailRef = useRef<HTMLDivElement>(null);
  const relatedRailRef = useRef<HTMLDivElement>(null);

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, offset: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Favorited channels list
  const favoritedChannels = todosCanais.filter((c) => {
    if (c.id && favorites.includes(c.id)) return true;
    if (c.url && favorites.includes(c.url)) return true;
    return false;
  });

  // Related channels (from same network or sport)
  const relatedChannels = canalAtivo
    ? todosCanais.filter((c) => {
        if (c.url === canalAtivo.url && c.id === canalAtivo.id) return false;
        if (canalAtivo.rede && c.rede === canalAtivo.rede) return true;
        if (getSportTag(canalAtivo) === getSportTag(c)) return true;
        return false;
      }).slice(0, 16)
    : [];

  const activeQuality = canalAtivo ? getChannelQuality(canalAtivo) : 'HD';
  const activeBadge = canalAtivo ? getNetworkBadge(canalAtivo) : null;
  const activeSport = canalAtivo ? getSportTag(canalAtivo) : 'Ao Vivo';
  const isFavoritedActive = canalAtivo
    ? (canalAtivo.id && favorites.includes(canalAtivo.id)) ||
      (canalAtivo.url && favorites.includes(canalAtivo.url))
    : false;

  return (
    <div id="now-playing-context-rail" className="w-full space-y-6 pt-2">
      {/* 🚀 CARD DESTACADO "AGORA NO AR" + SINTONIZADOR RÁPIDO */}
      {canalAtivo && (
        <div className="bg-gradient-to-r from-[#121214] via-[#151518] to-[#121214] border border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-80 h-full bg-[#00E676]/5 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* LADO ESQUERDO: SPOTLIGHT CARD */}
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={canalAtivo.logo}
                  alt={canalAtivo.nome}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-zinc-950 border border-zinc-800 p-1.5 shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/80x80/222222/ffffff?text=TV';
                  }}
                />
                <div className="absolute -bottom-2 -right-1 bg-black/90 border border-[#00E676]/50 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#00E676] flex items-center gap-1 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
                  <span>NO AR</span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>Transmitindo Agora</span>
                  </span>
                  {activeBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {activeBadge.label}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                    {activeQuality}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {canalAtivo.nome}
                </h3>

                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                  <span>Modalidade: <strong className="text-zinc-200">{activeSport}</strong></span>
                  <span>•</span>
                  <span>Taxa de bits: <strong className="text-[#00E676]">Adaptativa (HLS Auto)</strong></span>
                </p>
              </div>
            </div>

            {/* LADO DIREITO: BARRA DE STATUS & FAVORITAR */}
            <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
              <button
                type="button"
                id="now-playing-quick-fav"
                onClick={() => onToggleFavorite(canalAtivo)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                  isFavoritedActive
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Star
                  className={`w-4 h-4 transition-transform active:scale-125 ${
                    isFavoritedActive ? 'fill-amber-400 text-amber-400' : 'text-current'
                  }`}
                />
                <span>{isFavoritedActive ? 'Salvo nos Favoritos' : 'Adicionar aos Favoritos'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 RAIL 1: SEUS FAVORITOS RÁPIDOS (SE HOUVER) */}
      {favoritedChannels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h4 className="text-sm font-extrabold text-white tracking-tight">
                Seus Favoritos Rápidos
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                {favoritedChannels.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollRail(favoritesRailRef, -300)}
                className="p-1.5 rounded-lg bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(favoritesRailRef, 300)}
                className="p-1.5 rounded-lg bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                title="Rolar para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={favoritesRailRef}
            className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1"
          >
            {favoritedChannels.map((c) => {
              const isCurrent =
                c.url === canalAtivo?.url && (c.id ? c.id === canalAtivo?.id : true);
              const quality = getChannelQuality(c);

              return (
                <div
                  key={`fav-rail-${c.id || c.url}`}
                  onClick={() => onSelectCanal(c)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border shrink-0 transition-all cursor-pointer select-none group min-w-[210px] ${
                    isCurrent
                      ? 'bg-[#00E676]/10 border-[#00E676]/60 text-[#00E676] ring-1 ring-[#00E676]/30 shadow-md'
                      : 'bg-[#121214] hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 hover:scale-[1.02]'
                  }`}
                >
                  <img
                    src={c.logo}
                    alt={c.nome}
                    className="w-9 h-9 rounded-lg object-contain bg-zinc-950 border border-zinc-800 p-0.5 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/80x80/222222/ffffff?text=TV';
                    }}
                  />
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-zinc-100 group-hover:text-white">
                      {c.nome}
                    </p>
                    <span className="text-[10px] text-zinc-400 font-semibold">{quality}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ⚽ RAIL 2: CANAIS RELACIONADOS / SUGERIDOS */}
      {relatedChannels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-extrabold text-white tracking-tight">
                Canais Relacionados &bull; {canalAtivo?.rede || activeSport}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-bold border border-zinc-700">
                {relatedChannels.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollRail(relatedRailRef, -320)}
                className="p-1.5 rounded-lg bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(relatedRailRef, 320)}
                className="p-1.5 rounded-lg bg-[#121214] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                title="Rolar para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={relatedRailRef}
            className="flex items-center gap-3.5 overflow-x-auto custom-scrollbar pb-2 pt-1"
          >
            {relatedChannels.map((c) => {
              const quality = getChannelQuality(c);
              const network = getNetworkBadge(c);
              const sport = getSportTag(c);

              return (
                <div
                  key={`related-rail-${c.id || c.url}`}
                  onClick={() => onSelectCanal(c)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/80 bg-[#121214] hover:bg-zinc-900 hover:border-[#00E676]/40 hover:scale-[1.02] shrink-0 transition-all cursor-pointer select-none group min-w-[240px] max-w-[280px]"
                >
                  <img
                    src={c.logo}
                    alt={c.nome}
                    className="w-10 h-10 rounded-lg object-contain bg-zinc-950 border border-zinc-800 p-0.5 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/80x80/222222/ffffff?text=TV';
                    }}
                  />
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-100 group-hover:text-[#00E676] truncate transition-colors">
                      {c.nome}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5 truncate">
                      <span className="text-zinc-300">{network.label}</span>
                      <span>•</span>
                      <span className="text-zinc-500">{sport}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
                    {quality}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
