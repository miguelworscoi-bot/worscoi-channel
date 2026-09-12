'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Star, Plus, Radio, X, ArrowRight } from 'lucide-react';
import { Canal, FiltroAtivo } from '@/types';
import { getChannelQuality, getNetworkBadge, getSportTag } from '@/utils/channelUtils';

interface HeaderProps {
  filtroAtivo: FiltroAtivo;
  onSelectFiltro: (filtro: FiltroAtivo) => void;
  totalFavoritos: number;
  onOpenAddChannel: () => void;
  todosCanais: Canal[];
  onSelectCanal: (canal: Canal) => void;
}

export function Header({
  filtroAtivo,
  onSelectFiltro,
  totalFavoritos,
  onOpenAddChannel,
  todosCanais,
  onSelectCanal,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl/Cmd + K or '/')
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement !== inputRef.current)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsDropdownOpen(true);
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered preview channels for dropdown
  const filteredInstantChannels = searchQuery.trim()
    ? todosCanais
        .filter((c) => {
          const q = searchQuery.toLowerCase();
          return (
            c.nome.toLowerCase().includes(q) ||
            (c.rede && c.rede.toLowerCase().includes(q)) ||
            (c.grupo && c.grupo.toLowerCase().includes(q)) ||
            getSportTag(c).toLowerCase().includes(q)
          );
        })
        .slice(0, 7)
    : [];

  const handleSelectSearchResult = (canal: Canal) => {
    onSelectCanal(canal);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-zinc-800/80 transition-all"
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E676] to-emerald-600 text-black font-black shadow-lg shadow-[#00E676]/20 ring-1 ring-[#00E676]/50 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-['Space_Grotesk']">
                  PLAY<span className="text-[#00E676] drop-shadow-[0_0_12px_rgba(0,230,118,0.4)]">SPORTS</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
                TV e Esportes Ao Vivo
              </p>
            </div>
          </div>
        </div>

        {/* 🔍 BUSCA GLOBAL CENTRALIZADA COM DROPDOWN INTELIGENTE */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#00E676] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              id="global-search-input"
              type="text"
              placeholder="Buscar canal, emissora ou modalidade esportiva..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-[#121214] border border-zinc-800/90 hover:border-zinc-700 focus:border-[#00E676] rounded-xl pl-10 pr-16 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 pointer-events-none">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="pointer-events-auto text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 rounded">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* DROPDOWN DE RESULTADOS INSTANTÂNEOS */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div
              id="global-search-dropdown"
              className="absolute left-0 right-0 mt-2 bg-[#121214] border border-zinc-800/90 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="p-2 border-b border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-3">
                <span>Resultados correspondentes ({filteredInstantChannels.length})</span>
                <span className="text-zinc-500 text-[10px]">Clique para sintonizar</span>
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/40">
                {filteredInstantChannels.length > 0 ? (
                  filteredInstantChannels.map((c) => {
                    const quality = getChannelQuality(c);
                    const badge = getNetworkBadge(c);
                    const sport = getSportTag(c);

                    return (
                      <div
                        key={c.id || c.url}
                        onClick={() => handleSelectSearchResult(c)}
                        className="flex items-center justify-between gap-3 p-2.5 hover:bg-zinc-800/60 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={c.logo}
                            alt={c.nome}
                            className="w-9 h-9 rounded-lg object-contain bg-zinc-950 p-0.5 border border-zinc-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/80x80/222222/ffffff?text=TV';
                            }}
                          />
                          <div className="truncate">
                            <p className="text-sm font-semibold text-zinc-100 group-hover:text-[#00E676] truncate transition-colors">
                              {c.nome}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                              <span className="text-zinc-300">{badge.label}</span>
                              <span>•</span>
                              <span className="text-zinc-500">{sport}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                            {quality}
                          </span>
                          <span className="text-[10px] font-bold text-[#00E676] opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                            Assistir <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    Nenhum canal encontrado para &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS: FAVORITOS + STATUS + ADICIONAR */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Botão Adicionar Canal */}
          <button
            type="button"
            id="header-add-channel-btn"
            onClick={onOpenAddChannel}
            className="text-xs px-3.5 py-2 rounded-xl border border-[#00E676]/30 bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
            title="Cadastrar canal personalizado HLS"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Canal</span>
          </button>

          {/* Pill de Favoritos com Contador e Glow */}
          <button
            type="button"
            id="header-favorites-pill"
            onClick={() => onSelectFiltro(filtroAtivo === 'Favoritos' ? 'Todos' : 'Favoritos')}
            className={`text-xs px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer select-none ${
              filtroAtivo === 'Favoritos'
                ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-500/20 glow-amber-sm'
                : 'bg-[#121214] text-amber-300 border-zinc-800/90 hover:border-amber-500/50 hover:bg-zinc-800/40'
            }`}
            title="Filtrar canais favoritos"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filtroAtivo === 'Favoritos'
                  ? 'fill-black text-black'
                  : 'fill-amber-400 text-amber-400'
              }`}
            />
            <span className="font-semibold hidden sm:inline">Favoritos</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                filtroAtivo === 'Favoritos'
                  ? 'bg-black/20 text-black'
                  : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
              }`}
            >
              {totalFavoritos}
            </span>
          </button>

          {/* Status HLS Pulse */}
          <div
            className="hidden lg:flex items-center gap-2 bg-[#121214] border border-zinc-800/90 rounded-xl px-3 py-1.5 text-xs select-none"
            title="Transmissão ao vivo HLS com failover automático ativo"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
            </span>
            <span className="text-[11px] font-bold text-zinc-300 tracking-wider uppercase">
              HLS LIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
