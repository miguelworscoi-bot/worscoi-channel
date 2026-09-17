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
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPausedTemporarily, setIsPausedTemporarily] = useState<boolean>(false);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para arrastar com mouse (drag-to-scroll)
  const dragStartXRef = useRef<number>(0);
  const dragStartScrollLeftRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);

  // Otimização de Performance: Limita a quantidade de cards duplicados por carrossel (máx 14)
  // para evitar inchar o DOM e manter o consumo de memória ultrabaixo
  const baseFilmes = useMemo(() => {
    return filmes.slice(0, 14);
  }, [filmes]);

  const podeFazerLoop = baseFilmes.length >= 3;
  const listaExibicao = useMemo(() => {
    if (!podeFazerLoop) return baseFilmes;
    return [...baseFilmes, ...baseFilmes];
  }, [baseFilmes, podeFazerLoop]);

  // INTERSECTION OBSERVER: Ativa animações APENAS quando a linha está visível na tela
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: '120px 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // VISIBILIDADE DA ABA DO NAVEGADOR: Pausa imediata se o usuário mudar de aba
  const [isDocumentVisible, setIsDocumentVisible] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Função para pausar temporariamente (após clique em seta ou scroll manual)
  const pausarTemporariamente = useCallback((ms = 3500) => {
    setIsPausedTemporarily(true);
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    pauseTimerRef.current = setTimeout(() => {
      setIsPausedTemporarily(false);
    }, ms);
  }, []);

  // Limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  // ENGINE LEVE DE ANIMAÇÃO DO CARROSSEL
  // Executa SOMENTE quando: Em visualização na tela + Aba ativa + Sem hover/arraste
  useEffect(() => {
    if (
      !isAutoPlay ||
      !isIntersecting ||
      !isDocumentVisible ||
      isHovered ||
      isDragging ||
      isPausedTemporarily ||
      baseFilmes.length < 2
    ) {
      return;
    }

    let animationFrameId: number;
    let lastTime = performance.now();
    // Velocidade otimizada e ultra-fluida (~24px/s)
    const speed = 24;

    const tick = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const el = scrollRef.current;
      if (el) {
        if (podeFazerLoop) {
          const halfScrollWidth = el.scrollWidth / 2;
          el.scrollLeft += speed * delta;

          if (el.scrollLeft >= halfScrollWidth) {
            el.scrollLeft -= halfScrollWidth;
          } else if (el.scrollLeft < 0) {
            el.scrollLeft += halfScrollWidth;
          }
        } else {
          const maxScroll = el.scrollWidth - el.clientWidth;
          if (maxScroll > 0) {
            el.scrollLeft += speed * delta;
            if (el.scrollLeft >= maxScroll) {
              el.scrollLeft = 0;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isAutoPlay,
    isIntersecting,
    isDocumentVisible,
    isHovered,
    isDragging,
    isPausedTemporarily,
    baseFilmes.length,
    podeFazerLoop
  ]);

  if (!filmes || filmes.length === 0) return null;

  const rolar = (direcao: 'esquerda' | 'direita') => {
    if (!scrollRef.current) return;
    pausarTemporariamente(4000);
    const offset = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direcao === 'esquerda' ? -offset : offset,
      behavior: 'smooth'
    });
  };

  // HANDLERS PARA ARRASTAR COM O MOUSE (DRAG TO SCROLL)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartXRef.current = e.pageX - scrollRef.current.offsetLeft;
    dragStartScrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.3;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    scrollRef.current.scrollLeft = dragStartScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      pausarTemporariamente(2500);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="w-full flex flex-col gap-3 py-2"
      id={`secao-genero-${id}`}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 320px',
      }}
    >
      {/* CABEÇALHO DA SEÇÃO COM CONTROLES DE CARROSSEL */}
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

        <div className="flex items-center gap-2">
          {/* BOTÃO INTERATIVO DE PAUSAR / RETOMAR ANIMAÇÃO DO CARROSSEL */}
          <button
            type="button"
            id={`toggle-autoplay-${id}-btn`}
            onClick={() => {
              setIsAutoPlay((prev) => !prev);
              setIsPausedTemporarily(false);
            }}
            className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 ${
              isAutoPlay && !isHovered && !isPausedTemporarily
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
            title={
              isAutoPlay
                ? 'Carrossel em movimento automático (Passe o mouse ou clique para pausar)'
                : 'Carrossel pausado (Clique para animar automaticamente)'
            }
          >
            {isAutoPlay && !isHovered && !isPausedTemporarily ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-medium hidden sm:inline">Em Movimento</span>
                <Pause className="w-2.5 h-2.5 text-emerald-400/80 group-hover:text-emerald-300 ml-0.5" />
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-zinc-400 group-hover:text-white transition-transform group-hover:scale-110" />
                <span className="text-[11px] font-medium hidden sm:inline">Animar</span>
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

          {/* CONTROLES DE ROLAGEM DO CARROSSEL ESTILO TIKTOK */}
          <button
            type="button"
            id={`scroll-left-${id}-btn`}
            onClick={() => rolar('esquerda')}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer shadow-sm disabled:opacity-30 group"
            title="Rolar para esquerda"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
          <button
            type="button"
            id={`scroll-right-${id}-btn`}
            onClick={() => rolar('direita')}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer shadow-sm disabled:opacity-30 group"
            title="Rolar para direita"
          >
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* CARROSSEL HORIZONTAL ANIMADO DE FILMES COM SUPORTE A TOUCH E DRAG */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUpOrLeave();
        }}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => {
          setIsHovered(false);
          pausarTemporariamente(3000);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        className={`flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 px-1 custom-scrollbar select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollBehavior: isAutoPlay && !isHovered && !isDragging ? 'auto' : 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {listaExibicao.map((filme, index) => (
          <div
            key={`${id}-${filme.id}-${index}`}
            className="w-[155px] sm:w-[175px] md:w-[195px] shrink-0"
          >
            <FilmeCard
              filme={filme}
              isAtivo={filmeAtivoId === filme.id}
              onSelect={(f) => {
                if (!hasMovedRef.current) {
                  onSelectFilme(f);
                }
              }}
              onOpenTeatro={(f) => {
                if (!hasMovedRef.current) {
                  onOpenTeatro(f);
                }
              }}
              onOpenImdb={onOpenImdb}
              onPlayDirect={(f) => {
                if (!hasMovedRef.current && onPlayDirect) {
                  onPlayDirect(f);
                }
              }}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export const FilmotecaGenreRow = React.memo(FilmotecaGenreRowComponent);

