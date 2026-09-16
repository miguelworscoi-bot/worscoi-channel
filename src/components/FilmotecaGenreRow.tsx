'use client';
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { FilmeItem } from '@/app/api/filmes/route';
import { FilmeCard } from '@/components/FilmeCard';

interface FilmotecaGenreRowProps {
  id: string;
  titulo: string;
  icon?: React.ReactNode;
  corDestaque?: string;
  filmes: FilmeItem[];
  filmeAtivoId?: string;
  onSelectFilme: (filme: FilmeItem) => void;
  onOpenTeatro: (filme: FilmeItem) => void;
  onOpenImdb?: (filme: FilmeItem) => void;
  onPlayDirect?: (filme: FilmeItem) => void;
  onVerTodos?: (genreId: string) => void;
}

export function FilmotecaGenreRow({
  id,
  titulo,
  icon,
  corDestaque = 'text-zinc-200',
  filmes,
  filmeAtivoId,
  onSelectFilme,
  onOpenTeatro,
  onOpenImdb,
  onPlayDirect,
  onVerTodos
}: FilmotecaGenreRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!filmes || filmes.length === 0) return null;

  const rolar = (direcao: 'esquerda' | 'direita') => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direcao === 'esquerda' ? -offset : offset,
      behavior: 'smooth'
    });
  };

  return (
    <section className="w-full flex flex-col gap-3 py-2" id={`secao-genero-${id}`}>
      {/* CABEÇALHO DA SEÇÃO */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {icon && <span className={`${corDestaque} shrink-0`}>{icon}</span>}
          <h2 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <span>{titulo}</span>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {filmes.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {onVerTodos && (
            <button
              type="button"
              id={`ver-todos-${id}-btn`}
              onClick={() => onVerTodos(id)}
              className="text-xs font-medium text-zinc-400 hover:text-white transition flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer mr-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* CONTROLES DE ROLAGEM DO CARROSSEL */}
          <button
            type="button"
            id={`scroll-left-${id}-btn`}
            onClick={() => rolar('esquerda')}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer shadow-sm disabled:opacity-30"
            title="Rolar para esquerda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id={`scroll-right-${id}-btn`}
            onClick={() => rolar('direita')}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer shadow-sm disabled:opacity-30"
            title="Rolar para direita"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CARROSSEL HORIZONTAL DE FILMES */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 px-1 custom-scrollbar scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {filmes.map((filme) => (
          <div
            key={`${id}-${filme.id}`}
            className="w-[155px] sm:w-[175px] md:w-[195px] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <FilmeCard
              filme={filme}
              isAtivo={filmeAtivoId === filme.id}
              onSelect={onSelectFilme}
              onOpenTeatro={onOpenTeatro}
              onOpenImdb={onOpenImdb}
              onPlayDirect={onPlayDirect}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
