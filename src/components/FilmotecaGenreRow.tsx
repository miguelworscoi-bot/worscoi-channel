'use client';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause } from 'lucide-react';
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

export function FilmotecaGenreRowComponent({
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
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Estados de navegação e controles
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isAutoAdvance, setIsAutoAdvance] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Estados para drag suave com o mouse
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isPointerDownRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartScrollLeftRef = useRef<number>(0);
  const didDragRef = useRef<boolean>(false);
  const dragThreshold = 10; // pixels de tolerância antes de considerar arraste

  // Evita duplicações artificiais: exibe uma coleção rica e autêntica de filmes (até 32 títulos únicos)
  const listaFilmes = useMemo(() => {
    return filmes.slice(0, 32);
  }, [filmes]);

  // Atualiza os limites de rolagem e progresso visual
  const updateScrollBounds = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);

    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
      setScrollProgress(progress);

      const pages = Math.max(1, Math.ceil(scrollWidth / (clientWidth * 0.85)));
      setTotalPages(pages);
      const curPage = Math.min(pages - 1, Math.round((scrollLeft / maxScroll) * (pages - 1)));
      setActivePage(curPage);
    } else {
      setScrollProgress(0);
      setTotalPages(1);
      setActivePage(0);
    }
  }, []);

  // Monitora redimensionamento e scroll do carrossel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollBounds();

    const handleScroll = () => {
      updateScrollBounds();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateScrollBounds();
      });
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateScrollBounds, listaFilmes.length]);

  // Função de rolagem com física suave estilo streaming (Netflix/Disney+)
  const rolar = useCallback((direcao: 'esquerda' | 'direita') => {
    const el = scrollRef.current;
    if (!el) return;

    // Rola aproximadamente 80% da tela visível, garantindo fluidez e contexto do filme anterior
    const scrollAmount = Math.max(280, el.clientWidth * 0.8);
    const targetScroll =
      direcao === 'esquerda' ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;

    el.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, []);

  // Avanço automático passo a passo (Passa 1 tela a cada 7 segundos, com pausa no hover)
  useEffect(() => {
    if (!isAutoAdvance || isHovered || isDragging || listaFilmes.length < 3) return;

    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 16) {
        // Volta ao início suavemente
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        rolar('direita');
      }
    }, 7000);

    return () => clearInterval(timer);
  }, [isAutoAdvance, isHovered, isDragging, listaFilmes.length, rolar]);

  // Handlers para arraste com mouse (sem quebrar ou comer cliques dos filmes)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignora cliques com botão direito ou botões de ação do card
    if (e.button !== 0 || !scrollRef.current) return;
    isPointerDownRef.current = true;
    didDragRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !scrollRef.current) return;
    if (e.buttons !== 1) {
      isPointerDownRef.current = false;
      setIsDragging(false);
      return;
    }

    const deltaX = e.clientX - dragStartXRef.current;

    if (Math.abs(deltaX) > dragThreshold) {
      if (!isDragging) setIsDragging(true);
      didDragRef.current = true;
      e.preventDefault();
      scrollRef.current.scrollLeft = dragStartScrollLeftRef.current - deltaX;
    }
  };

  const handleMouseUp = () => {
    isPointerDownRef.current = false;
    if (isDragging) {
      setIsDragging(false);
      // Mantém didDragRef ativo por 150ms para evitar que o mouseUp acidentalmente ative o filme
      setTimeout(() => {
        didDragRef.current = false;
      }, 150);
    }
  };

  if (!filmes || filmes.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="group/row relative w-full flex flex-col gap-2.5 py-2.5"
      id={`secao-genero-${id}`}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 340px',
      }}
    >
      {/* CABEÇALHO DA SEÇÃO COM IDENTIDADE VISUAL E CONTROLES */}
      <div className="flex items-center justify-between px-2 sm:px-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className={`${corDestaque} shrink-0`}>{icon}</span>}
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate">
            <span className="truncate">{titulo}</span>
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
              {filmes.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* INDICADOR DISCRETO DE PÁGINAS / PROGRESSO (SE HOUVER MAIS DE 1 TELA) */}
          {totalPages > 1 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-400">
              <span className="font-semibold text-zinc-200">{activePage + 1}</span>
              <span className="text-zinc-600">/</span>
              <span>{totalPages}</span>
            </div>
          )}

          {/* BOTÃO OPCIONAL DE AVANÇO AUTOMÁTICO SUAVE */}
          <button
            type="button"
            id={`toggle-autoplay-${id}-btn`}
            onClick={() => setIsAutoAdvance((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
              isAutoAdvance
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
            title={
              isAutoAdvance
                ? 'Avanço suave ativado (clique para pausar)'
                : 'Ativar avanço suave automático a cada 7s'
            }
          >
            {isAutoAdvance ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                </span>
                <span className="text-[11px] font-medium hidden md:inline">Auto</span>
                <Pause className="w-2.5 h-2.5 text-rose-400" />
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 text-zinc-400" />
                <span className="text-[11px] font-medium hidden md:inline">Auto</span>
              </>
            )}
          </button>

          {onVerTodos && (
            <button
              type="button"
              id={`ver-todos-${id}-btn`}
              onClick={() => onVerTodos(id)}
              className="text-xs font-medium text-zinc-400 hover:text-white transition flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* BOTÕES DE NAVEGAÇÃO DO TOPO */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id={`scroll-left-${id}-btn`}
              onClick={() => rolar('esquerda')}
              disabled={!canScrollLeft}
              className={`w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-25 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
              title="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              id={`scroll-right-${id}-btn`}
              onClick={() => rolar('direita')}
              disabled={!canScrollRight}
              className={`w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-25 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
              title="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TRACK DO CARROSSEL COM PADDLES FLUTUANTES ESTILO STREAMING */}
      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUp();
        }}
      >
        {/* PADDLE FLUTUANTE ESQUERDO (NETFLIX STYLE) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => rolar('esquerda')}
            aria-label="Rolar carrossel para a esquerda"
            className="absolute left-0 top-0 bottom-3 z-30 w-10 sm:w-14 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/80 to-transparent flex items-center justify-start pl-1 sm:pl-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300 cursor-pointer focus:opacity-100"
          >
            <div className="w-8 h-12 sm:w-9 sm:h-14 rounded-xl bg-zinc-900/90 hover:bg-[#FF2D55] text-zinc-200 hover:text-white border border-white/10 hover:border-transparent backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-90">
              <ChevronLeft className="w-5 h-5 transition-transform" />
            </div>
          </button>
        )}

        {/* PADDLE FLUTUANTE DIREITO (NETFLIX STYLE) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => rolar('direita')}
            aria-label="Rolar carrossel para a direita"
            className="absolute right-0 top-0 bottom-3 z-30 w-10 sm:w-14 bg-gradient-to-l from-[#090a0f] via-[#090a0f]/80 to-transparent flex items-center justify-end pr-1 sm:pr-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300 cursor-pointer focus:opacity-100"
          >
            <div className="w-8 h-12 sm:w-9 sm:h-14 rounded-xl bg-zinc-900/90 hover:bg-[#FF2D55] text-zinc-200 hover:text-white border border-white/10 hover:border-transparent backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-90">
              <ChevronRight className="w-5 h-5 transition-transform" />
            </div>
          </button>
        )}

        {/* CONTÊINER HORIZONTAL DE FILMES COM SNAP PRECISO E SCROLLBAR OCULTA */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-3 sm:px-4 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {listaFilmes.map((filme, index) => (
            <div
              key={`${id}-${filme.id}-${index}`}
              className="w-[145px] sm:w-[170px] md:w-[190px] lg:w-[205px] shrink-0 snap-start transition-transform duration-200"
            >
              <FilmeCard
                filme={filme}
                isAtivo={filmeAtivoId === filme.id}
                onSelect={(f) => {
                  if (!didDragRef.current) {
                    onSelectFilme(f);
                  }
                }}
                onOpenTeatro={(f) => {
                  if (!didDragRef.current) {
                    onOpenTeatro(f);
                  }
                }}
                onOpenImdb={onOpenImdb}
                onPlayDirect={(f) => {
                  if (!didDragRef.current && onPlayDirect) {
                    onPlayDirect(f);
                  }
                }}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* LINHA DE PROGRESSO SUTIL NO RODAPÉ DO CARROSSEL */}
        {totalPages > 1 && (
          <div className="px-3 sm:px-4 pt-1">
            <div className="w-full h-0.5 bg-zinc-900/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-zinc-600 via-rose-500 to-rose-400 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.max(12, scrollProgress)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export const FilmotecaGenreRow = React.memo(FilmotecaGenreRowComponent);
