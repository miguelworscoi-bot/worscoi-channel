'use client';
import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  X,
  ChevronDown,
  Compass,
  TrendingUp,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Tv,
  Trash2,
  Film,
  Trophy,
  Globe,
  Sparkles,
  Smile,
  Heart,
  Newspaper,
  Music,
  Radio,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Canal, FiltroAtivo, WorscoiView } from '@/types';
import { WorscoiLogo } from './WorscoiLogo';
import {
  getChannelCategoryInfo,
  getSportTag,
} from '@/utils/channelUtils';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';
import { CanalRecente, formatRelativeTime } from '@/utils/recentChannelsUtils';

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
  recentChannels?: CanalRecente[];
  onClearRecentChannels?: () => void;
  onRemoveRecentChannel?: (channelIdentifier: string, e?: React.MouseEvent) => void;
  customChannels?: Canal[];
  onDeleteCustomChannel?: (id: string, e: React.MouseEvent) => void;
  isAdmin?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FILTROS_CONFIG: Array<{
  id: FiltroAtivo;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'Todos', label: 'Todos', icon: Sparkles },
  { id: 'Recentes', label: 'Recentes', icon: Clock },
  { id: 'Favoritos', label: 'Favoritos', icon: Star },
  { id: 'Esportes', label: 'Esportes', icon: Trophy },
  { id: 'ZAP Angola', label: 'ZAP Angola', icon: Globe },
  { id: 'Portugal', label: 'Portugal', icon: Globe },
  { id: 'Brasil', label: 'Brasil', icon: Globe },
  { id: 'SuperSport', label: 'SuperSport', icon: Trophy },
  { id: 'Filmes', label: 'Filmes & Séries', icon: Film },
  { id: 'Bonecos', label: 'Kids & Animação', icon: Smile },
  { id: 'Novelas', label: 'Novelas & Dramas', icon: Heart },
  { id: 'Notícias', label: 'Notícias', icon: Newspaper },
  { id: 'Músicas', label: 'Músicas & Shows', icon: Music },
  { id: 'Meus Canais', label: 'Personalizados', icon: Radio },
];

interface CategoryGroupMeta {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  order: number;
}

function getChannelCategoryGroup(canal: Canal): CategoryGroupMeta {
  if (canal.isCustom) {
    return {
      key: 'Personalizados',
      label: 'Canais Personalizados',
      icon: Radio,
      order: 7,
    };
  }

  const catInfo = getChannelCategoryInfo(canal);
  const cat = (canal.categoria || '').toLowerCase();

  if (catInfo.categoria === 'Esportes' || cat === 'esportes') {
    return {
      key: 'Esportes',
      label: 'Esportes & Campeonatos',
      icon: Trophy,
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
      icon: Globe,
      order: 2,
    };
  }

  if (catInfo.categoria === 'Filmes' || cat === 'filmes' || cat === 'lazer') {
    return {
      key: 'Filmes',
      label: 'Filmes & Séries',
      icon: Film,
      order: 3,
    };
  }

  if (catInfo.categoria === 'Bonecos' || cat === 'bonecos') {
    return {
      key: 'Bonecos',
      label: 'Bonecos & Infantis',
      icon: Smile,
      order: 4,
    };
  }

  if (catInfo.categoria === 'Novelas' || cat === 'novelas') {
    return {
      key: 'Novelas',
      label: 'Novelas & Dramas',
      icon: Heart,
      order: 5,
    };
  }

  if (catInfo.categoria === 'Notícias' || cat === 'notícias' || cat === 'noticias') {
    return {
      key: 'Notícias',
      label: 'Notícias & Jornalismo',
      icon: Newspaper,
      order: 6,
    };
  }

  if (catInfo.categoria === 'Músicas' || cat === 'músicas' || cat === 'musicas') {
    return {
      key: 'Músicas',
      label: 'Músicas & Shows',
      icon: Music,
      order: 7,
    };
  }

  return {
    key: 'Outros',
    label: 'Variedades & Entretenimento',
    icon: Tv,
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
  recentChannels = [],
  onClearRecentChannels,
  onRemoveRecentChannel,
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
    const q = searchQuery.toLowerCase().trim();

    if (filtroAtivo === 'Recentes') {
      return (recentChannels || []).filter((canal) => {
        if (!q) return true;
        const catInfo = getChannelCategoryInfo(canal);
        const cName = canal.nome.toLowerCase();
        return (
          cName.includes(q) ||
          (canal.grupo && canal.grupo.toLowerCase().includes(q)) ||
          (canal.rede && canal.rede.toLowerCase().includes(q)) ||
          catInfo.label.toLowerCase().includes(q) ||
          getSportTag(canal).toLowerCase().includes(q)
        );
      });
    }

    return todosCanais.filter((canal) => {
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
  }, [todosCanais, searchQuery, filtroAtivo, favorites, recentChannels]);

  // Agrupamento de categorias
  const groupedCategories = useMemo(() => {
    if (filtroAtivo === 'Recentes') {
      if (canaisFiltrados.length === 0) return [];
      return [
        {
          meta: {
            key: 'Recentes',
            label: 'Canais Vistos Recentemente',
            icon: Clock,
            order: 0,
          },
          channels: canaisFiltrados,
        },
      ];
    }

    const map = new Map<string, { meta: CategoryGroupMeta; channels: Canal[] }>();

    for (const canal of canaisFiltrados) {
      const meta = getChannelCategoryGroup(canal);
      if (!map.has(meta.key)) {
        map.set(meta.key, { meta, channels: [] });
      }
      map.get(meta.key)!.channels.push(canal);
    }

    return Array.from(map.values()).sort((a, b) => a.meta.order - b.meta.order);
  }, [canaisFiltrados, filtroAtivo]);

  const isCategoryExpanded = (catKey: string): boolean => {
    // Quando houver termo de busca, expande automaticamente para exibir os canais encontrados
    if (searchQuery.trim().length > 0) return true;

    // Se o usuário interagiu com a categoria (expandiu ou recolheu), respeita a escolha
    if (expandedCategories[catKey] !== undefined) {
      return expandedCategories[catKey];
    }

    // Por definição os agrupamentos de canais mantêm-se retidos (fechados).
    // O usuário é quem expande se quiser.
    return false;
  };

  const toggleCategory = (catKey: string) => {
    const currentStatus = isCategoryExpanded(catKey);
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !currentStatus,
    }));
  };

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
                style={{ fontFamily: "'Brittany Signature', 'Brittany', 'Dancing Script', cursive" }}
                className="text-2xl font-normal text-[#FF2D55] font-logomark logomark-font"
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
                placeholder="Buscar canal..."
                className="w-full bg-zinc-900/80 text-xs text-zinc-200 placeholder-zinc-500 rounded-lg pl-8 pr-7 py-2 border border-zinc-800/80 focus:outline-none focus:border-zinc-700 transition"
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

        {/* PILLS DE CATEGORIA */}
        {!isCollapsed && (
          <div className="px-3 pb-2.5 shrink-0 border-b border-zinc-900/80">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 select-none">
              {FILTROS_CONFIG.filter((f) => f.id !== 'Meus Canais' || isAdmin).map((f) => {
                const isSelected = filtroAtivo === f.id;
                const IconComponent = f.icon;
                const count =
                  f.id === 'Recentes'
                    ? recentChannels.length
                    : f.id === 'Favoritos'
                    ? favorites.length
                    : undefined;

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelectFiltro(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                        : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/60'
                    }`}
                  >
                    <IconComponent className={`w-3 h-3 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
                    <span>{f.label}</span>
                    {typeof count === 'number' && count > 0 && (
                      <span
                        className={`text-[9px] font-mono px-1 rounded ${
                          isSelected
                            ? 'bg-zinc-900 text-zinc-100'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LISTA DE CANAIS COM SCROLL VERTICAL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-3 min-h-0">
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
              const GroupIcon = group.meta.icon;

              return (
                <div key={`group-${group.meta.key}`} className="space-y-0.5">
                  {/* CABEÇALHO DO GRUPO */}
                  {!isCollapsed && groupedCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.meta.key)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GroupIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                        <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 truncate">
                          {group.meta.label}
                        </span>
                        {hasActiveChannel && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {group.meta.key === 'Recentes' && onClearRecentChannels && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearRecentChannels();
                            }}
                            className="text-[10px] text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 px-1.5 py-0.5 rounded transition cursor-pointer"
                            title="Limpar histórico recente"
                          >
                            Limpar
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-mono">
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

                  {/* ITENS DOS CANAIS */}
                  <AnimatePresence initial={false}>
                    {(isOpen || isCollapsed || groupedCategories.length === 1) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-0.5">
                          {group.channels.map((canal, index) => {
                            const isAtivo = Boolean(
                              canalAtivo &&
                                (canalAtivo.id && canal.id
                                  ? canalAtivo.id === canal.id
                                  : canalAtivo.url === canal.url)
                            );
                            const isFav = isCanalFavorited(canal);
                            const viewedAt = (canal as CanalRecente).viewedAt;

                            return (
                              <div
                                key={canal.id || `${canal.url}-${index}`}
                                onClick={() => {
                                  onSelectCanal(canal);
                                  if (currentView !== 'explorar') {
                                    onNavigate('explorar');
                                  }
                                }}
                                className={`group relative flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none ${
                                  isAtivo
                                    ? 'bg-zinc-800 text-white font-medium shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                                }`}
                                title={canal.nome}
                              >
                                {/* LADO ESQUERDO: LOGO + NOME DO CANAL */}
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="relative shrink-0 w-7 h-7 rounded-md overflow-hidden bg-zinc-900 border border-zinc-800/80 p-0.5 flex items-center justify-center">
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
                                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                    )}
                                  </div>

                                  {!isCollapsed && (
                                    <div className="min-w-0 flex-1">
                                      <span
                                        className={`text-xs truncate block tracking-tight ${
                                          isAtivo ? 'text-white font-medium' : 'text-zinc-300 group-hover:text-zinc-100'
                                        }`}
                                      >
                                        {canal.nome}
                                      </span>
                                      {filtroAtivo === 'Recentes' && viewedAt && (
                                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5" />
                                          {formatRelativeTime(viewedAt)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* LADO DIREITO: ESTRELA DE FAVORITO + BOTÕES DE AÇÃO */}
                                {!isCollapsed && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(canal, e);
                                      }}
                                      className={`p-1 rounded transition cursor-pointer ${
                                        isFav
                                          ? 'text-amber-400 opacity-100'
                                          : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-zinc-800'
                                      }`}
                                      title={isFav ? 'Remover dos favoritos' : 'Favoritar canal'}
                                    >
                                      <Star
                                        className={`w-3.5 h-3.5 ${
                                          isFav ? 'fill-amber-400 text-amber-400' : 'text-current'
                                        }`}
                                      />
                                    </button>

                                    {filtroAtivo === 'Recentes' && onRemoveRecentChannel && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemoveRecentChannel(canal.id || canal.url, e);
                                        }}
                                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                        title="Remover dos recentes"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}

                                    {canal.isCustom && canal.id && isAdmin && onDeleteCustomChannel && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteCustomChannel(canal.id!, e);
                                        }}
                                        className="p-1 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
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
          ) : filtroAtivo === 'Recentes' ? (
            <div className="text-center text-zinc-500 text-xs py-10 flex flex-col items-center justify-center gap-2 px-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Clock className="w-5 h-5 text-[#FF2D55]" />
              </div>
              <p className="font-semibold text-zinc-300">Nenhum canal recente</p>
              <p className="text-[11px] text-zinc-500 max-w-[200px]">
                Os canais que você assistir ao vivo ficarão salvos aqui para acesso rápido.
              </p>
              <button
                type="button"
                onClick={() => onSelectFiltro('Todos')}
                className="mt-2 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer border border-zinc-700"
              >
                Explorar canais
              </button>
            </div>
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
                className="text-xs font-semibold text-zinc-300 hover:text-white underline cursor-pointer"
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
              ? 'bg-zinc-800 text-white ring-1 ring-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
          title="Grade de Canais e Transmissões"
        >
          <Compass
            className={`w-4 h-4 ${
              currentView === 'explorar' ? 'text-white' : 'text-zinc-400'
            }`}
          />
          {!isCollapsed && <span>Transmissão</span>}
        </button>

        {/* BOTÃO FILMOTECA */}
        <button
          type="button"
          onClick={() => onNavigate('filmoteca')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            currentView === 'filmoteca'
              ? 'bg-zinc-800 text-white ring-1 ring-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
          title="Filmoteca & Cinema VOD"
        >
          <Film
            className={`w-4 h-4 ${
              currentView === 'filmoteca' ? 'text-white' : 'text-zinc-400'
            }`}
          />
          {!isCollapsed && <span>Filmoteca</span>}
        </button>

        {/* BOTÃO PAINEL DE CONTROLE (EXCLUSIVO PARA ADMINISTRADOR) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigate('painel')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              currentView === 'painel' || currentView === 'assinantes'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
            title="Painel de controle e métricas"
          >
            <TrendingUp
              className={`w-4 h-4 ${
                currentView === 'painel' || currentView === 'assinantes'
                  ? 'text-white'
                  : 'text-zinc-400'
              }`}
            />
            {!isCollapsed && <span>Painel de controle</span>}
          </button>
        )}

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
