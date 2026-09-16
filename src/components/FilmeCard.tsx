'use client';
import React from 'react';
import { Play, Maximize2, Star } from 'lucide-react';
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

export function FilmeCard({
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

  return (
    <div
      onClick={() => onSelect(filme)}
      className={`group relative flex flex-col bg-[#0c0c11] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-[#FF2D55]/10 hover:-translate-y-1 select-none ${
        isAtivo
          ? 'border-[#FF2D55] ring-2 ring-[#FF2D55]/50 shadow-[#FF2D55]/20'
          : 'border-zinc-800/80 hover:border-zinc-700/80'
      } ${className}`}
    >
      {/* CAPA DO FILME */}
      <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
        <img
          src={
            filme.capa && filme.capa !== 'https://tmdb.org'
              ? filme.capa
              : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
          }
          alt={filme.titulo}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* OVERLAY COM GRADIENTE E BOTÕES DE AÇÃO */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
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
            className="w-10 h-10 rounded-full bg-[#FF2D55] hover:bg-[#e0264a] text-white flex items-center justify-center shadow-lg shadow-[#FF2D55]/40 transform scale-90 group-hover:scale-100 transition cursor-pointer"
            title="Assistir diretamente no player principal"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
          <button
            type="button"
            title="Abrir em Modo Teatro"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTeatro(filme);
            }}
            className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {onOpenImdb && (
            <button
              type="button"
              title="Ver detalhes, sinopse e elenco no IMDb"
              onClick={(e) => {
                e.stopPropagation();
                onOpenImdb(filme);
              }}
              className="w-9 h-9 rounded-full bg-[#f5c518] hover:bg-[#e4b512] text-black font-black text-[10px] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition cursor-pointer"
            >
              IMDb
            </button>
          )}
        </div>

        {/* BADGES ESQUERDA (TIPO / SÉRIE / ANIME / CLÁSSICO / STREAMING) */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {filme.plataforma === 'hbo' && (
            <span className="px-1.5 py-0.5 rounded bg-purple-700 text-white font-mono font-black text-[9px] shadow-sm tracking-wider">
              HBO MAX
            </span>
          )}
          {filme.plataforma === 'disney' && (
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono font-black text-[9px] shadow-sm tracking-wider">
              DISNEY+
            </span>
          )}
          {filme.plataforma === 'netflix' && (
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-black text-[9px] shadow-sm tracking-wider">
              NETFLIX
            </span>
          )}
          {filme.plataforma === 'crunchyroll' && (
            <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-mono font-black text-[9px] shadow-sm tracking-wider">
              CRUNCHYROLL
            </span>
          )}
          {filme.tipo === 'serie' && (
            <span className="px-1.5 py-0.5 rounded bg-indigo-600/90 text-white font-mono font-bold text-[9px] shadow-sm">
              SÉRIE
            </span>
          )}
          {filme.tipo === 'anime' && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-mono font-bold text-[9px] shadow-sm">
              ANIME
            </span>
          )}
          {Boolean(isClassico) && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono font-black text-[9px] shadow-sm">
              CLÁSSICO
            </span>
          )}
          {Boolean(filme.temporadas && filme.temporadas > 1) && (
            <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-zinc-300 font-mono text-[9px] border border-white/10">
              {filme.temporadas}T
            </span>
          )}
        </div>

        {/* BADGES IMDb / RATING / ANO */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10 pointer-events-none">
          {filme.rating && (
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shadow flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-black" />
              <span>{filme.rating}</span>
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
            {filme.ano}
          </span>
        </div>
      </div>

      {/* INFORMAÇÕES DO FILME */}
      <div className="p-2.5 flex flex-col flex-1 justify-between bg-zinc-950">
        <div>
          <h3 className="font-semibold text-xs text-zinc-200 group-hover:text-white line-clamp-1">
            {filme.titulo}
          </h3>
          <p className="text-[11px] text-[#FF2D55] font-mono mt-0.5 font-medium line-clamp-1">
            {filme.genero}
          </p>
        </div>
        <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">
          {filme.sinopse}
        </p>

        {onOpenImdb && (
          <div className="mt-2 pt-2 border-t border-zinc-900 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenImdb(filme);
              }}
              className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-[#f5c518] font-medium transition cursor-pointer"
              title="Ver sinopse completa, nota e elenco no IMDb"
            >
              <span className="px-1 py-0.5 rounded bg-[#f5c518] text-black font-black text-[9px] leading-none">
                IMDb
              </span>
              <span>Ver ficha</span>
            </button>
            {filme.imdbId && (
              <span className="text-[9px] text-zinc-600 font-mono">
                {filme.imdbId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
