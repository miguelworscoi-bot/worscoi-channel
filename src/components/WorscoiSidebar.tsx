'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Star,
  X,
  ChevronDown,
  ChevronsUpDown,
  Layers,
  Compass,
  TrendingUp,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Tv,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Canal, FiltroAtivo, WorscoiView } from '@/types';
import { WorscoiLogo } from './WorscoiLogo';
import {
  getChannelCategoryInfo,
  getChannelQuality,
  getNetworkBadge,
  getSportTag,
} from '@/utils/channelUtils';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';

interface WorscoiSidebarProps {
  currentView: WorscoiView;
  onNavigate: (view: WorscoiView) => void;
  todosCanais: Canal[];
  canalAtivo: Canal | null;
  onSelectCanal: (canal: Canal) => void;
  onLogout: () => void;
  favorites: string[];
  onToggleFavorite: (canal: Canal, e?: React.MouseEvent) => void;
  filtroAtivo: FiltroAtivo;
  onSelectFiltro: (filtro: FiltroAtivo) => void;
  customChannels?: Canal[];
  onDeleteCustomChannel?: (id: string, e: React.MouseEvent) => void;
  isAdmin?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FILTROS_CONFIG: Array<{ id: FiltroAtivo; label: string; icon: string }> = [
  { id: 'Todos', label: 'Todos', icon: '⚡' },
  { id: 'Esportes', label: 'Esportes', icon: '⚽' },
  { id: 'ZAP Angola', label: 'ZAP Angola', icon: '🇦🇴' },
  { id: 'Portugal', label: 'Portugal', icon: '🇵🇹' },
  { id: 'Brasil', label: 'Brasil', icon: '🇧🇷' },
  { id: 'SuperSport', label: 'SuperSport', icon: '🏆' },
  { id: 'Filmes', label: 'Filmes & Séries', icon: '🍿' },
  { id: 'Bonecos', label: 'Bonecos & Kids', icon: '🧸' },
  { id: 'Novelas', label: 'Novelas', icon: '🎭' },
  { id: 'Notícias', label: 'Notícias', icon: '📰' },
  { id: 'Músicas', label: 'Músicas', icon: '🎵' },
  { id: 'Favoritos', label: 'Favoritos', icon: '⭐' },
  { id: 'Meus Canais', label: 'Meus Canais', icon: '📡' },
];

interface CategoryGroupMeta {
  key: string;
  label: string;
  icon: string;
  order: number;
}

function getChannelCategoryGroup(canal: Canal): CategoryGroupMeta {
  if (canal.isCustom) {
    return {
      key: 'Personalizados',
      label: 'Canais Personalizados',
      icon: '📡',
      order: 7,
    };
  }

  const catInfo = getChannelCategoryInfo(canal);
  const cat = (canal.categoria || '').toLowerCase();

  if (catInfo.categoria === 'Esportes' || cat === 'esportes') {
    return {
      key: 'Esportes',
      label: 'Esportes & Campeonatos',
      icon: '⚽',
      order: 1,
    };
  }

  if (
    canal.rede === 'ZAP' ||
    canal.pais === 'AO' ||
    canal.nome.toLowerCase().includes('zap') ||
    canal.nome.toLowerCase().includes('zimbo')
  ) {
    return {
      key: 'ZAP Angola',
      label: 'ZAP Angola',
      icon: '🇦🇴',
      order: 2,
    };
  }

  if (catInfo.categoria === 'Filmes' || cat === 'filmes' || cat === 'lazer') {
    return {
      key: 'Filmes',
      label: 'Filmes & Séries',
      icon: '🍿',
      order: 3,
    };
  }

  if (catInfo.categoria === 'Bonecos' || cat === 'bonecos') {
    return {
      key: 'Bonecos',
      label: 'Bonecos & Infantis',
      icon: '🧸',
      order: 4,
    };
  }

  if (catInfo.categoria === 'Novelas' || cat === 'novelas') {
    return {
      key: 'Novelas',
      label: 'Novelas & Dramas',
      icon: '🎭',
      order: 5,
    };
  }

  if (catInfo.categoria === 'Notícias' || cat === 'notícias' || cat === 'noticias') {
    return {
      key: 'Notícias',
      label: 'Notícias & Jornalismo',
      icon: '📰',
      order: 6,
    };
  }

  if (catInfo.categoria === 'Músicas' || cat === 'músicas' || cat === 'musicas') {
    return {
      key: 'Músicas',
      label: 'Músicas & Shows',
      icon: '🎵',
      order: 7,
    };
  }

  return {
    key: 'Outros',
    label: 'Variedades & Entretenimento',
    icon: '📺',
    order: 8,
  };
}

export function WorscoiSidebar({
  currentView,
  onNavigate,
  todosCanais,
  canalAtivo,
  onSelectCanal,
  onLogout,
  favorites,
  onToggleFavorite,
  filtroAtivo,
  onSelectFiltro,
  customChannels: _customChannels = [],
  onDeleteCustomChannel,
  isAdmin = false,
  isCollapsed = false,
  onToggleCollapse,
}: WorscoiSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const isCanalFavorited = (canal?: Canal | null): boolean => {
    if (!canal) return false;
    if (canal.id && favorites.includes(canal.id)) return true;
    if (canal.url && favorites.includes(canal.url)) return true;
    return false;
  };

  // Filtragem dinâmica de todos os canais do catálogo
  const canaisFiltrados = useMemo(() => {
    return todosCanais.filter((canal) => {
      const q = searchQuery.toLowerCase().trim();
      const catInfo = getChannelCategoryInfo(canal);
      const cName = canal.nome.toLowerCase();

      const matchBusca =
        !q ||
        cName.includes(q) ||
        (canal.grupo && canal.grupo.toLowerCase().includes(q)) ||
        (canal.rede && canal.rede.toLowerCase().includes(q)) ||
        catInfo.label.toLowerCase().includes(q) ||
        getSportTag(canal).toLowerCase().includes(q);

      let matchFiltro = true;

      if (filtroAtivo === 'Favoritos') {
        matchFiltro = isCanalFavorited(canal);
      } else if (filtroAtivo === 'Meus Canais') {
        matchFiltro = canal.isCustom === true;
      } else if (filtroAtivo === 'Esportes') {
        matchFiltro = catInfo.categoria === 'Esportes' || canal.categoria === 'Esportes';
      } else if (filtroAtivo === 'Bonecos') {
        matchFiltro = catInfo.categoria === 'Bonecos' || canal.categoria === 'Bonecos';
      } else if (filtroAtivo === 'Filmes' || filtroAtivo === 'Lazer') {
        matchFiltro = catInfo.categoria === 'Filmes' || canal.categoria === 'Filmes' || canal.categoria === 'Lazer';
      } else if (filtroAtivo === 'Novelas') {
        matchFiltro = catInfo.categoria === 'Novelas' || canal.categoria === 'Novelas';
      } else if (filtroAtivo === 'Notícias') {
        matchFiltro = catInfo.categoria === 'Notícias' || canal.categoria === 'Notícias';
      } else if (filtroAtivo === 'Músicas') {
        matchFiltro = catInfo.categoria === 'Músicas' || canal.categoria === 'Músicas';
      } else if (filtroAtivo === 'Portugal') {
        matchFiltro =
          canal.pais === 'PT' ||
          cName.includes('portugal') ||
          cName.includes('rtp') ||
          cName.includes('sic') ||
          cName.includes('tvi') ||
          (canal.grupo && canal.grupo.toLowerCase().includes('portugal'));
      } else if (filtroAtivo === 'Brasil') {
        matchFiltro = canal.pais === 'BR';
      } else if (filtroAtivo === 'ZAP Angola') {
        matchFiltro =
          canal.rede === 'ZAP' ||
          canal.pais === 'AO' ||
          cName.includes('zap') ||
          cName.includes('angola') ||
          cName.includes('zimbo');
      } else if (filtroAtivo === 'SuperSport') {
        matchFiltro =
          canal.rede === 'SuperSport' ||
          cName.includes('supersport') ||
          (canal.grupo && canal.grupo.toLowerCase().includes('supersport'));
      }

      return matchBusca && matchFiltro;
    });
  }, [todosCanais, searchQuery, filtroAtivo, favorites]);

  // Categoria do canal que está em reprodução ativa
  const activeCategoryKey = useMemo(() => {
    if (!canalAtivo) return null;
    return getChannelCategoryGroup(canalAtivo).key;
  }, [canalAtivo]);

  // Agrupamento de categorias
  const groupedCategories = useMemo(() => {
    const map = new Map<string, { meta: CategoryGroupMeta; channels: Canal[] }>();

    for (const canal of canaisFiltrados) {
      const meta = getChannelCategoryGroup(canal);
      if (!map.has(meta.key)) {
        map.set(meta.key, { meta, channels: [] });
      }
      map.get(meta.key)!.channels.push(canal);
    }

    return Array.from(map.values()).sort((a, b) => a.meta.order - b.meta.order);
  }, [canaisFiltrados]);

  // Abre categoria do canal ativo por padrão
  useEffect(() => {
    if (activeCategoryKey) {
      setExpandedCategories((prev) => ({
        ...prev,
        [activeCategoryKey]: true,
      }));
    }
  }, [activeCategoryKey]);

  const isCategoryExpanded = (catKey: string): boolean => {
    if (searchQuery.trim().length > 0) return true;
    if (expandedCategories[catKey] !== undefined) {
      return expandedCategories[catKey];
    }
    if (activeCategoryKey === catKey) return true;
    if (groupedCategories.length === 1) return true;
    return true; // Por padrão deixa aberto para visualização rápida dos canais
  };

  const toggleCategory = (catKey: string) => {
    const currentStatus = isCategoryExpanded(catKey);
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !currentStatus,
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    groupedCategories.forEach((g) => {
      next[g.meta.key] = true;
    });
    setExpandedCategories(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    groupedCategories.forEach((g) => {
      next[g.meta.key] = false;
    });
    setExpandedCategories(next);
  };

  const allAreExpanded =
    groupedCategories.length > 0 &&
    groupedCategories.every((g) => isCategoryExpanded(g.meta.key));

  return (
    <aside
      className={`bg-[#050507] border-r border-zinc-900/90 flex flex-col justify-between transition-all duration-200 z-40 select-none ${
        isCollapsed ? 'w-20' : 'w-72 sm:w-80 lg:w-84'
      } h-screen sticky top-0 shrink-0`}
    >
      {/* SEÇÃO SUPERIOR: CABEÇALHO + BUSCA + FILTROS + LISTA DE CANAIS */}
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* LOGO WORSCOI + TOGGLE COLLAPSE */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-900 shrink-0">
          {!isCollapsed ? (
            <div
              onClick={() => onNavigate('explorar')}
              className="cursor-pointer flex items-center gap-2"
              title="Worscoi - Grade de Transmissões"
            >
              <WorscoiLogo size="md" />
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                {todosCanais.length} canais
              </span>
            </div>
          ) : (
            <div
              onClick={() => onNavigate('explorar')}
              className="cursor-pointer mx-auto"
              title="Worscoi"
            >
              <span
                data-logomark="true"
                style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
                className="text-2xl font-bold text-[#FF2D55] font-logomark logomark-font"
              >
                W
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition cursor-pointer"
              title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* CAMPO DE BUSCA DE CANAIS */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-2 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar canal, time, liga..."
                className="w-full bg-[#111115] text-xs text-zinc-200 placeholder-zinc-500 rounded-full pl-8 pr-7 py-2 border border-zinc-800 focus:outline-none focus:border-[#FF2D55]/60 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* PILLS DE CATEGORIA COM CONTADOR HORIZONTAL */}
        {!isCollapsed && (
          <div className="px-3 pb-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 select-none">
              {FILTROS_CONFIG.filter((f) => f.id !== 'Meus Canais' || isAdmin).map((f) => {
                const isSelected = filtroAtivo === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelectFiltro(f.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 font-bold'
                        : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* EXPANDIR / RECOLHER TODAS AS CATEGORIAS */}
        {!isCollapsed && groupedCategories.length > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-zinc-500 border-y border-zinc-900/80 shrink-0 bg-[#07070a]">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#FF2D55]" />
              <span>
                {canaisFiltrados.length} canais encontrados
              </span>
            </div>
            <button
              type="button"
              onClick={allAreExpanded ? collapseAll : expandAll}
              className="flex items-center gap-1 hover:text-zinc-300 transition cursor-pointer"
            >
              <ChevronsUpDown className="w-3 h-3 text-[#FF2D55]" />
              <span>{allAreExpanded ? 'Recolher todas' : 'Expandir todas'}</span>
            </button>
          </div>
        )}

        {/* LISTA DE CANAIS COM SCROLL VERTICAL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-2 min-h-0">
          {groupedCategories.length > 0 ? (
            groupedCategories.map((group) => {
              const isOpen = isCategoryExpanded(group.meta.key);
              const hasActiveChannel = group.channels.some(
                (c) =>
                  canalAtivo &&
                  (canalAtivo.id && c.id
                    ? canalAtivo.id === c.id
                    : canalAtivo.url === c.url)
              );

              return (
                <div
                  key={`group-${group.meta.key}`}
                  className="rounded-xl border border-zinc-900 bg-zinc-950/40 overflow-hidden"
                >
                  {/* CABEÇALHO DO GRUPO (ACCORDION) */}
                  {!isCollapsed && (
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.meta.key)}
                      className={`w-full flex items-center justify-between p-2 text-left transition cursor-pointer ${
                        hasActiveChannel
                          ? 'bg-zinc-900/90 text-white'
                          : 'bg-zinc-950/80 hover:bg-zinc-900/50 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{group.meta.icon}</span>
                        <span className="text-xs font-bold truncate">
                          {group.meta.label}
                        </span>
                        {hasActiveChannel && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {group.channels.length}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-zinc-300' : 'rotate-0'
                          }`}
                        />
                      </div>
                    </button>
                  )}

                  {/* ITENS DOS CANAIS (SEMPRE ABERTO QUANDO COLLAPSED, OU QUANDO ISOPEN) */}
                  <AnimatePresence initial={false}>
                    {(isOpen || isCollapsed) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="p-1 space-y-1 bg-[#050507]/40">
                          {group.channels.map((canal, index) => {
                            const isAtivo = Boolean(
                              canalAtivo &&
                                (canalAtivo.id && canal.id
                                  ? canalAtivo.id === canal.id
                                  : canalAtivo.url === canal.url)
                            );
                            const isFav = isCanalFavorited(canal);
                            const quality = getChannelQuality(canal);
                            const network = getNetworkBadge(canal);

                            return (
                              <div
                                key={canal.id || `${canal.url}-${index}`}
                                onClick={() => {
                                  onSelectCanal(canal);
                                  if (currentView !== 'explorar') {
                                    onNavigate('explorar');
                                  }
                                }}
                                className={`group relative flex items-center justify-between gap-2 p-2 rounded-xl transition cursor-pointer select-none ${
                                  isAtivo
                                    ? 'bg-zinc-800 text-white font-medium ring-1 ring-[#FF2D55]/60 shadow-md shadow-[#FF2D55]/10'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800'
                                }`}
                                title={canal.nome}
                              >
                                {/* LADO ESQUERDO: ESTRELA FAVORITO + LOGO DO CANAL + NOME OFICIAL */}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {/* FAVORITO STAR */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleFavorite(canal, e);
                                    }}
                                    className={`p-1 rounded-md transition cursor-pointer shrink-0 ${
                                      isFav
                                        ? 'text-amber-400'
                                        : 'text-zinc-600 hover:text-amber-400 hover:bg-zinc-800'
                                    }`}
                                    title={isFav ? 'Remover dos favoritos' : 'Favoritar canal'}
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 ${
                                        isFav ? 'fill-amber-400 text-amber-400' : 'text-current'
                                      }`}
                                    />
                                  </button>

                                  {/* LOGO DO CANAL DE TV */}
                                  <div className="relative shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 p-0.5 flex items-center justify-center">
                                    <img
                                      src={getChannelLogo(canal)}
                                      alt={canal.nome}
                                      className="w-full h-full object-contain"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = getChannelFallbackLogo(canal);
                                      }}
                                    />
                                    {isAtivo && (
                                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D55] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2D55]"></span>
                                      </span>
                                    )}
                                  </div>

                                  {/* NOME DO CANAL (SEM @!) + REDE/ORIGEM */}
                                  {!isCollapsed && (
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`text-xs font-semibold truncate tracking-tight ${
                                            isAtivo ? 'text-white font-bold' : 'text-zinc-200'
                                          }`}
                                        >
                                          {canal.nome}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[9px] font-medium text-zinc-400 px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800/80 truncate">
                                          {network.label}
                                        </span>

                                        {canal.backupUrls && canal.backupUrls.length > 0 && (
                                          <span className="text-[8px] font-bold text-emerald-400 px-1 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40">
                                            +{canal.backupUrls.length} links
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* LADO DIREITO: BADGE DE QUALIDADE E AÇÃO EXCLUIR */}
                                {!isCollapsed && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                                      {quality}
                                    </span>

                                    {canal.isCustom && canal.id && isAdmin && onDeleteCustomChannel && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteCustomChannel(canal.id!, e);
                                        }}
                                        className="p-1 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded transition cursor-pointer"
                                        title="Excluir canal"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center text-zinc-500 text-xs py-10 flex flex-col items-center justify-center gap-2">
              <Tv className="w-8 h-8 text-zinc-600" />
              <p>Nenhum canal encontrado</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSelectFiltro('Todos');
                }}
                className="text-xs font-bold text-[#FF2D55] hover:underline cursor-pointer"
              >
                Ver todos os canais
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO INFERIOR DOCKED: EXPLORAR, PAINEL DE CONTROLE, TERMINAR SESSÃO */}
      <div className="p-3 border-t border-zinc-900 space-y-1 bg-[#050507] shrink-0">
        {/* BOTÃO EXPLORAR */}
        <button
          type="button"
          onClick={() => onNavigate('explorar')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            currentView === 'explorar'
              ? 'bg-zinc-900 text-white ring-1 ring-zinc-800'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
          title="Grade de Canais e Transmissões"
        >
          <Compass
            className={`w-4 h-4 ${
              currentView === 'explorar' ? 'text-[#FF2D55]' : 'text-zinc-400'
            }`}
          />
          {!isCollapsed && <span>Transmissão</span>}
        </button>

        {/* BOTÃO PAINEL DE CONTROLE */}
        <button
          type="button"
          onClick={() => onNavigate('painel')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            currentView === 'painel' || currentView === 'assinantes'
              ? 'bg-zinc-900 text-white ring-1 ring-zinc-800'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
          title="Painel de controle e métricas"
        >
          <TrendingUp
            className={`w-4 h-4 ${
              currentView === 'painel' || currentView === 'assinantes'
                ? 'text-[#FF2D55]'
                : 'text-zinc-400'
            }`}
          />
          {!isCollapsed && <span>Painel de controle</span>}
        </button>

        {/* BOTÃO TERMINAR SESSÃO */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          title="Terminar sessão"
        >
          <LogOut className="w-4 h-4 text-zinc-400" />
          {!isCollapsed && <span>Terminar sessão</span>}
        </button>
      </div>
    </aside>
  );
}
