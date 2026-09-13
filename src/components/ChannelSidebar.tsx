'use client';
import React, { useState } from 'react';
import {
  Star,
  Search,
  Trash2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Canal, FiltroAtivo } from '@/types';
import {
  getChannelCategoryInfo,
  getChannelQuality,
  getNetworkBadge,
  getSportTag,
} from '@/utils/channelUtils';

interface ChannelSidebarProps {
  todosCanais: Canal[];
  canalAtivo: Canal | null;
  onSelectCanal: (canal: Canal) => void;
  filtroAtivo: FiltroAtivo;
  onSelectFiltro: (filtro: FiltroAtivo) => void;
  favorites: string[];
  onToggleFavorite: (canal: Canal, e?: React.MouseEvent) => void;
  customChannels: Canal[];
  onDeleteCustomChannel: (id: string, e: React.MouseEvent) => void;
  totalFavoritos: number;
  isAdmin?: boolean;
}

const FILTROS_CONFIG: Array<{ id: FiltroAtivo; label: string; icon: string }> = [
  { id: 'Todos', label: 'Todos', icon: '⚡' },
  { id: 'Esportes', label: 'Esportes', icon: '🥊' },
  { id: 'Notícias', label: 'Notícias', icon: '📰' },
  { id: 'Lazer', label: 'Filmes & Séries', icon: '🍿' },
  { id: 'Libertadores', label: 'Libertadores', icon: '🏆' },
  { id: 'Champions League', label: 'Champions League', icon: '⭐' },
  { id: 'TNT Sports', label: 'TNT Sports', icon: '⚡' },
  { id: 'LaLiga', label: 'LaLiga', icon: '🇪🇸' },
  { id: 'NBA', label: 'NBA', icon: '🏀' },
  { id: 'MLS', label: 'MLS', icon: '🇺🇸' },
  { id: 'Futebol', label: 'Futebol', icon: '⚽' },
  { id: 'Favoritos', label: 'Favoritos', icon: '⭐' },
  { id: 'beIN Sports', label: 'beIN Sports', icon: '🟣' },
  { id: 'ZAP Angola', label: 'ZAP Angola', icon: '🇦🇴' },
  { id: 'SuperSport', label: 'SuperSport', icon: '🏆' },
  { id: 'Vivo TV', label: 'Vivo TV', icon: '📱' },
  { id: 'Brasil', label: 'Brasil', icon: '🇧🇷' },
  { id: 'Meus Canais', label: 'Meus Canais', icon: '📡' },
];

export function ChannelSidebar({
  todosCanais,
  canalAtivo,
  onSelectCanal,
  filtroAtivo,
  onSelectFiltro,
  favorites,
  onToggleFavorite,
  customChannels,
  onDeleteCustomChannel,
  totalFavoritos,
  isAdmin = false,
}: ChannelSidebarProps) {
  const [buscaLocal, setBuscaLocal] = useState('');

  const isCanalFavorited = (canal?: Canal | null): boolean => {
    if (!canal) return false;
    if (canal.id && favorites.includes(canal.id)) return true;
    if (canal.url && favorites.includes(canal.url)) return true;
    return false;
  };

  // Filtragem inteligente
  const canaisFiltrados = todosCanais.filter((canal) => {
    const q = buscaLocal.toLowerCase().trim();
    const catInfo = getChannelCategoryInfo(canal);
    const matchBusca =
      !q ||
      canal.nome.toLowerCase().includes(q) ||
      (canal.grupo && canal.grupo.toLowerCase().includes(q)) ||
      (canal.rede && canal.rede.toLowerCase().includes(q)) ||
      catInfo.label.toLowerCase().includes(q) ||
      (catInfo.subTag && catInfo.subTag.label.toLowerCase().includes(q)) ||
      getSportTag(canal).toLowerCase().includes(q);

    let matchFiltro = true;
    const comps = (canal.competicoes || []).map((c) => c.toLowerCase());
    const cName = canal.nome.toLowerCase();

    if (filtroAtivo === 'Favoritos') {
      matchFiltro = isCanalFavorited(canal);
    } else if (filtroAtivo === 'Meus Canais') {
      matchFiltro = canal.isCustom === true;
    } else if (filtroAtivo === 'Esportes') {
      matchFiltro = catInfo.categoria === 'Esportes';
    } else if (filtroAtivo === 'Notícias') {
      matchFiltro = catInfo.categoria === 'Notícias';
    } else if (filtroAtivo === 'Lazer') {
      matchFiltro = catInfo.categoria === 'Filmes';
    } else if (filtroAtivo === 'Libertadores') {
      matchFiltro =
        comps.includes('libertadores') ||
        cName.includes('libertadores') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('libertadores'));
    } else if (filtroAtivo === 'Champions League') {
      matchFiltro =
        comps.includes('champions league') ||
        cName.includes('champions') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('champions'));
    } else if (filtroAtivo === 'TNT Sports') {
      matchFiltro =
        canal.rede === 'TNT Sports' ||
        cName.includes('tnt') ||
        cName.includes('space') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('tnt'));
    } else if (filtroAtivo === 'LaLiga') {
      matchFiltro =
        comps.includes('laliga') ||
        cName.includes('laliga') ||
        cName.includes('la liga') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('laliga'));
    } else if (filtroAtivo === 'NBA') {
      matchFiltro =
        comps.includes('nba') ||
        canal.rede === 'NBA TV' ||
        cName.includes('nba') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('nba'));
    } else if (filtroAtivo === 'MLS') {
      matchFiltro =
        comps.includes('mls') ||
        cName.includes('mls') ||
        cName.includes('major league soccer') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('mls'));
    } else if (filtroAtivo === 'beIN Sports') {
      matchFiltro =
        canal.rede === 'beIN Sports' || canal.nome.toLowerCase().includes('bein');
    } else if (filtroAtivo === 'ZAP Angola') {
      matchFiltro =
        canal.rede === 'ZAP' ||
        canal.pais === 'AO' ||
        canal.nome.toLowerCase().includes('zap') ||
        canal.nome.toLowerCase().includes('angola') ||
        canal.nome.toLowerCase().includes('zimbo');
    } else if (filtroAtivo === 'SuperSport') {
      matchFiltro =
        canal.rede === 'SuperSport' ||
        canal.nome.toLowerCase().includes('supersport') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('supersport'));
    } else if (filtroAtivo === 'Vivo TV') {
      matchFiltro =
        canal.rede === 'Vivo' ||
        canal.nome.toLowerCase().includes('vivo') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('vivo'));
    } else if (filtroAtivo === 'Brasil') {
      matchFiltro = canal.pais === 'BR';
    } else if (filtroAtivo === 'Futebol') {
      matchFiltro = getSportTag(canal) === 'Futebol' || comps.includes('libertadores') || comps.includes('champions league') || comps.includes('laliga') || comps.includes('mls');
    }

    return matchBusca && matchFiltro;
  });

  return (
    <aside
      id="channels-sidebar-panel"
      className="bg-[#121214] border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col shadow-2xl h-[780px] transition-all"
    >
      {/* HEADER DA SIDEBAR: TÍTULO + CONTADOR */}
      <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[#00E676]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm tracking-tight">Grade de Canais</h3>
            <p className="text-[11px] text-zinc-500">Transmissões ao vivo selecionadas</p>
          </div>
        </div>

        <span className="text-[11px] font-extrabold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30 px-2.5 py-0.5 rounded-full">
          {canaisFiltrados.length} {canaisFiltrados.length === 1 ? 'canal' : 'canais'}
        </span>
      </div>

      {/* CAMPO DE BUSCA NA SIDEBAR */}
      <div className="relative mb-3 shrink-0">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
        <input
          id="sidebar-search-input"
          type="text"
          placeholder="Filtrar nesta lista..."
          value={buscaLocal}
          onChange={(e) => setBuscaLocal(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800/90 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/30 transition-all shadow-inner"
        />
        {buscaLocal && (
          <button
            type="button"
            onClick={() => setBuscaLocal('')}
            className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* INDICADOR DE FILTRO ATIVO (SE DIFERENTE DE TODOS) */}
      {filtroAtivo !== 'Todos' && (
        <div className="flex items-center justify-between text-[11px] bg-[#00E676]/10 border border-[#00E676]/30 px-2.5 py-1 rounded-lg mb-2.5 text-[#00E676] shrink-0">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="text-zinc-400">Filtrando por:</span>
            <span className="font-extrabold text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-[#00E676]/30">
              {filtroAtivo}
            </span>
          </span>
          <button
            type="button"
            id="clear-active-sidebar-filter"
            onClick={() => onSelectFiltro('Todos')}
            className="text-xs hover:text-white flex items-center gap-1 font-bold cursor-pointer hover:underline text-[#00E676]"
            title="Remover filtro e ver todos"
          >
            <X className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        </div>
      )}

      {/* PILLS DE FILTRO COM CONTADOR E GLOW VERDE */}
      <div
        id="sidebar-filter-pills"
        className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80 mb-3 overflow-x-auto custom-scrollbar shrink-0 select-none pb-1"
      >
        {FILTROS_CONFIG.filter((filtro) => filtro.id !== 'Meus Canais' || isAdmin).map((filtro) => {
          let count = 0;
          if (filtro.id === 'Todos') count = todosCanais.length;
          else if (filtro.id === 'Favoritos') count = totalFavoritos;
          else if (filtro.id === 'Meus Canais') count = customChannels.length;
          else if (filtro.id === 'Libertadores') {
            count = todosCanais.filter((c) => {
              const comps = (c.competicoes || []).map((x) => x.toLowerCase());
              return (
                comps.includes('libertadores') ||
                c.nome.toLowerCase().includes('libertadores') ||
                (c.grupo && c.grupo.toLowerCase().includes('libertadores'))
              );
            }).length;
          } else if (filtro.id === 'Champions League') {
            count = todosCanais.filter((c) => {
              const comps = (c.competicoes || []).map((x) => x.toLowerCase());
              return (
                comps.includes('champions league') ||
                c.nome.toLowerCase().includes('champions') ||
                (c.grupo && c.grupo.toLowerCase().includes('champions'))
              );
            }).length;
          } else if (filtro.id === 'TNT Sports') {
            count = todosCanais.filter((c) => {
              const cName = c.nome.toLowerCase();
              return (
                c.rede === 'TNT Sports' ||
                cName.includes('tnt') ||
                cName.includes('space') ||
                (c.grupo && c.grupo.toLowerCase().includes('tnt'))
              );
            }).length;
          } else if (filtro.id === 'LaLiga') {
            count = todosCanais.filter((c) => {
              const comps = (c.competicoes || []).map((x) => x.toLowerCase());
              const cName = c.nome.toLowerCase();
              return (
                comps.includes('laliga') ||
                cName.includes('laliga') ||
                cName.includes('la liga') ||
                (c.grupo && c.grupo.toLowerCase().includes('laliga'))
              );
            }).length;
          } else if (filtro.id === 'NBA') {
            count = todosCanais.filter((c) => {
              const comps = (c.competicoes || []).map((x) => x.toLowerCase());
              const cName = c.nome.toLowerCase();
              return (
                comps.includes('nba') ||
                c.rede === 'NBA TV' ||
                cName.includes('nba') ||
                (c.grupo && c.grupo.toLowerCase().includes('nba'))
              );
            }).length;
          } else if (filtro.id === 'MLS') {
            count = todosCanais.filter((c) => {
              const comps = (c.competicoes || []).map((x) => x.toLowerCase());
              const cName = c.nome.toLowerCase();
              return (
                comps.includes('mls') ||
                cName.includes('mls') ||
                cName.includes('major league soccer') ||
                (c.grupo && c.grupo.toLowerCase().includes('mls'))
              );
            }).length;
          } else if (filtro.id === 'beIN Sports') {
            count = todosCanais.filter(
              (c) => c.rede === 'beIN Sports' || c.nome.toLowerCase().includes('bein')
            ).length;
          } else if (filtro.id === 'ZAP Angola') {
            count = todosCanais.filter(
              (c) =>
                c.rede === 'ZAP' ||
                c.pais === 'AO' ||
                c.nome.toLowerCase().includes('zap') ||
                c.nome.toLowerCase().includes('angola') ||
                c.nome.toLowerCase().includes('zimbo')
            ).length;
          } else if (filtro.id === 'SuperSport') {
            count = todosCanais.filter(
              (c) =>
                c.rede === 'SuperSport' ||
                c.nome.toLowerCase().includes('supersport') ||
                (c.grupo && c.grupo.toLowerCase().includes('supersport'))
            ).length;
          } else if (filtro.id === 'Vivo TV') {
            count = todosCanais.filter(
              (c) =>
                c.rede === 'Vivo' ||
                c.nome.toLowerCase().includes('vivo') ||
                (c.grupo && c.grupo.toLowerCase().includes('vivo'))
            ).length;
          } else if (filtro.id === 'Brasil') {
            count = todosCanais.filter((c) => c.pais === 'BR').length;
          } else if (filtro.id === 'Futebol') {
            count = todosCanais.filter((c) => getSportTag(c) === 'Futebol').length;
          } else if (filtro.id === 'Esportes') {
            count = todosCanais.filter((c) => getChannelCategoryInfo(c).categoria === 'Esportes').length;
          } else if (filtro.id === 'Notícias') {
            count = todosCanais.filter(
              (c) => getChannelCategoryInfo(c).categoria === 'Notícias'
            ).length;
          } else if (filtro.id === 'Lazer') {
            count = todosCanais.filter(
              (c) => getChannelCategoryInfo(c).categoria === 'Filmes'
            ).length;
          }

          const isSelected = filtroAtivo === filtro.id;

          return (
            <button
              key={filtro.id}
              id={`sidebar-filter-${filtro.id.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => onSelectFiltro(filtro.id)}
              className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 select-none ${
                isSelected
                  ? 'bg-[#00E676] text-black font-extrabold shadow-md shadow-[#00E676]/30 glow-accent-sm scale-100'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <span className="text-[11px]">{filtro.icon}</span>
              <span>{filtro.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full leading-none font-bold ${
                  isSelected ? 'bg-black/25 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTA ROLÁVEL DE CANAIS */}
      <div
        id="channels-scroll-container"
        className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar"
      >
        {canaisFiltrados.length > 0 ? (
          canaisFiltrados.map((canal, index) => {
            const isActive =
              canalAtivo?.id && canal.id
                ? canalAtivo.id === canal.id
                : canalAtivo?.url === canal.url;
            const isFavorited = isCanalFavorited(canal);
            const quality = getChannelQuality(canal);
            const network = getNetworkBadge(canal);
            const catInfo = getChannelCategoryInfo(canal);

            return (
              <div
                key={canal.id || canal.url || index}
                id={`channel-card-${index}`}
                onClick={() => onSelectCanal(canal)}
                className={`group relative flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#00E676]/10 border-[#00E676]/60 shadow-lg shadow-[#00E676]/10 ring-1 ring-[#00E676]/40 scale-[1.01]'
                    : 'bg-[#18181b]/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-[#00E676]/40 hover:scale-[1.02]'
                }`}
              >
                {/* LADO ESQUERDO: BOTÃO FAVORITO + LOGO + NOMES */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* FAVORITO TOGGLE */}
                  <button
                    type="button"
                    id={`card-favorite-btn-${index}`}
                    onClick={(e) => onToggleFavorite(canal, e)}
                    className={`p-1.5 rounded-lg shrink-0 transition-all cursor-pointer ${
                      isFavorited
                        ? 'text-amber-400 hover:bg-amber-400/10'
                        : 'text-zinc-600 hover:text-amber-400 hover:bg-zinc-800'
                    }`}
                    title={isFavorited ? 'Remover dos favoritos' : 'Favoritar'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                        isFavorited
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : 'text-current'
                      }`}
                    />
                  </button>

                  {/* LOGO DO CANAL */}
                  <div className="relative shrink-0">
                    <img
                      src={canal.logo}
                      alt={canal.nome}
                      className="w-10 h-10 rounded-lg object-contain bg-zinc-950 border border-zinc-800 p-0.5 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/80x80/222222/ffffff?text=TV';
                      }}
                    />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]"></span>
                      </span>
                    )}
                  </div>

                  {/* INFO TEXTO COM BADGES DE CATEGORIA */}
                  <div className="truncate flex-1 min-w-0">
                    <p
                      className={`font-bold text-xs sm:text-sm tracking-tight truncate transition-colors ${
                        isActive ? 'text-[#00E676]' : 'text-zinc-100 group-hover:text-white'
                      }`}
                    >
                      {canal.nome}
                    </p>

                    {/* BADGES DE CATEGORIA (Esportes, Notícias, Filmes) E TAGS */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {/* BADGE DE CATEGORIA PRINCIPAL */}
                      <button
                        type="button"
                        id={`channel-${index}-badge-${catInfo.categoria.toLowerCase()}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFiltro(
                            filtroAtivo === catInfo.filtro ? 'Todos' : catInfo.filtro
                          );
                        }}
                        title={`Filtrar por categoria: ${catInfo.label} (clique para alternar)`}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap select-none hover:scale-105 active:scale-95 ${
                          filtroAtivo === catInfo.filtro
                            ? 'ring-1 ring-white/40 font-extrabold shadow-sm ' +
                              catInfo.badgeBg +
                              ' ' +
                              catInfo.textColor +
                              ' ' +
                              catInfo.borderColor
                            : catInfo.badgeBg +
                              ' ' +
                              catInfo.textColor +
                              ' ' +
                              catInfo.borderColor
                        }`}
                      >
                        <span className="text-[9px] leading-none">{catInfo.icon}</span>
                        <span className="leading-none">{catInfo.label}</span>
                      </button>

                      {/* SUB-TAG ESPECÍFICA (Futebol, Libertadores, Champions, TNT Sports, LaLiga, NBA, MLS) */}
                      {catInfo.subTag && (
                        <button
                          type="button"
                          id={`channel-${index}-subtag-${catInfo.subTag.label.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFiltro(
                              filtroAtivo === catInfo.subTag!.filtro
                                ? 'Todos'
                                : catInfo.subTag!.filtro
                            );
                          }}
                          title={`Filtrar por tag: ${catInfo.subTag.label} (clique para alternar)`}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer whitespace-nowrap select-none hover:scale-105 active:scale-95 ${
                            filtroAtivo === catInfo.subTag.filtro
                              ? 'ring-1 ring-white/40 font-extrabold shadow-sm ' +
                                catInfo.subTag.badgeBg +
                                ' ' +
                                catInfo.subTag.textColor +
                                ' ' +
                                catInfo.subTag.borderColor
                              : catInfo.subTag.badgeBg +
                                ' ' +
                                catInfo.subTag.textColor +
                                ' ' +
                                catInfo.subTag.borderColor
                          }`}
                        >
                          <span className="text-[9px] leading-none">
                            {catInfo.subTag.icon}
                          </span>
                          <span className="leading-none">{catInfo.subTag.label}</span>
                        </button>
                      )}

                      {/* REDE / ORIGEM SEGUNDÁRIA */}
                      <span className="text-[10px] font-medium text-zinc-400 px-1 py-0.5 rounded bg-zinc-900/60 border border-zinc-800/60 truncate max-w-[85px] hidden sm:inline">
                        {network.label}
                      </span>

                      {canal.backupUrls && canal.backupUrls.length > 0 && (
                        <span
                          className="text-[9px] font-bold text-emerald-400/90 px-1 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40 hidden md:inline"
                          title={`${canal.backupUrls.length} links alternativos`}
                        >
                          +{canal.backupUrls.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* LADO DIREITO: BADGE DE QUALIDADE & AÇÕES */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 group-hover:border-zinc-700">
                    {quality}
                  </span>

                  {canal.isCustom && canal.id && isAdmin && (
                    <button
                      type="button"
                      id={`delete-custom-channel-${index}`}
                      onClick={(e) => onDeleteCustomChannel(canal.id!, e)}
                      className="p-1 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir canal (Apenas Administrador)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-zinc-500 text-xs py-16 flex flex-col items-center justify-center gap-3">
            <span className="text-3xl">📡</span>
            <p>Nenhum canal encontrado com os filtros atuais.</p>
            <button
              type="button"
              onClick={() => {
                setBuscaLocal('');
                onSelectFiltro('Todos');
              }}
              className="text-xs font-bold text-[#00E676] hover:underline cursor-pointer"
            >
              Resetar busca e filtros
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
