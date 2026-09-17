'use client';
import React from 'react';
import { Play, Maximize2, Star, Info } from 'lucide-react';
import { FilmeItem } from '@/app/api/filmes/route';

interface FilmeCardProps {
  filme: FilmeItem;
  isAtivo?: boolean;
  onSelect: (filme: FilmeItem) => void;
  onOpenTeatro: (filme: FilmeItem) => void;
  onOpenImdb?: (filme: FilmeItem) => void;
  onPlayDirect?: (filme: FilmeItem) => void;
  className?: string;
}

function FilmeCardComponent({
  filme,
  isAtivo = false,
  onSelect,
  onOpenTeatro,
  onOpenImdb,
  onPlayDirect,
  className = ''
}: FilmeCardProps) {
  const isClassico =
    filme.isClassico || (parseInt(filme.ano, 10) && parseInt(filme.ano, 10) < 2000);

  // Determina a etiqueta de formato de maneira elegante e discreta (sem arco-íris de cores)
  const formatTag = (() => {
    if (filme.tipo === 'serie') {
      return filme.temporadas && filme.temporadas > 1
        ? `Série • ${filme.temporadas}T`
        : 'Série';
    }
    if (filme.tipo === 'anime') return 'Anime';
    if (isClassico) return 'Clássico';
    if (filme.plataforma === 'netflix') return 'Netflix';
    if (filme.plataforma === 'hbo') return 'HBO Max';
    if (filme.plataforma === 'disney') return 'Disney+';
    if (filme.plataforma === 'crunchyroll') return 'Crunchyroll';
    return null;
  })();

  return (
    <div
      onClick={() => onSelect(filme)}
      className={`group relative flex flex-col bg-[#0e1015] rounded-xl overflow-hidden border cursor-pointer shadow-md select-none film-card-motion ${
        isAtivo
          ? 'border-zinc-300 ring-2 ring-zinc-300/80 bg-[#12141c] shadow-[0_0_20px_rgba(255,255,255,0.15)]'
          : 'border-zinc-800/80 hover:border-zinc-700/90'
      } ${className}`}
    >
      {/* CAPA DO FILME COM PROPORÇÃO CINEMATOGRÁFICA 2:3 & SHEEN ANIMADO */}
      <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden film-poster-sheen">
        <img
          src={
            filme.capa && filme.capa !== 'https://tmdb.org'
              ? filme.capa
              : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
          }
          alt={filme.titulo}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* GRADIENTE DE PROFUNDIDADE NA IMAGEM */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-transparent to-black/30 pointer-events-none" />

        {/* BADGE DE FORMATO (DISCRETO, PRETO TRANSLÚCIDO) */}
        {formatTag && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none transition-transform duration-200 group-hover:scale-105">
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-zinc-200 text-[10px] font-medium border border-white/10 tracking-wide shadow-sm">
              {formatTag}
            </span>
          </div>
        )}

        {/* BADGE RATING / ANO (TOP DIREITA) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 pointer-events-none transition-transform duration-200 group-hover:scale-105">
          {filme.rating && (
            <span className="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-semibold border border-amber-500/20 shadow flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{filme.rating}</span>
            </span>
          )}
        </div>

        {/* OVERLAY ELEGANTE DE AÇÕES AO PASSAR O MOUSE (ESTILO STREAMING / TIKTOK) */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2.5 p-3">
          {/* BOTÃO PRINCIPAL DE PLAY COM POP TIKTOK */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPlayDirect) {
                onPlayDirect(filme);
              } else {
                onSelect(filme);
              }
            }}
            className="w-12 h-12 rounded-full bg-white hover:bg-[#FF2D55] text-black hover:text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer group/play"
            title="Assistir agora"
          >
            <Play className="w-5 h-5 fill-current ml-0.5 transition-transform duration-200 group-hover/play:scale-110" />
          </button>

          {/* AÇÕES SECUNDÁRIAS DISCRETAS */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Abrir em Tela Expandida / Teatro"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTeatro(filme);
              }}
              className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {onOpenImdb && (
              <button
                type="button"
                title="Ficha completa no IMDb"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenImdb(filme);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
              >
                <span>IMDb</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METADADOS E INFORMAÇÕES DO FILME */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-[#0e1015]">
        <div>
          <h3 className="font-semibold text-xs sm:text-sm text-zinc-200 group-hover:text-white line-clamp-1 tracking-tight">
            {filme.titulo}
          </h3>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
            <span>{filme.ano}</span>
            <span className="text-zinc-600">•</span>
            <span className="truncate text-zinc-400">{filme.genero}</span>
          </div>
        </div>

        {filme.sinopse && (
          <p className="text-[11px] text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
            {filme.sinopse}
          </p>
        )}

        {onOpenImdb && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenImdb(filme);
              }}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              <Info className="w-3 h-3 text-zinc-500" />
              <span>Ver detalhes</span>
            </button>

            {filme.rating && (
              <span className="font-mono text-zinc-500 text-[10px]">
                Nota {filme.rating}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const FilmeCard = React.memo(FilmeCardComponent);
