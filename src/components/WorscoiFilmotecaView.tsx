'use client';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Film,
  ArrowLeft,
  Play,
  Loader2,
  X,
  Search,
  Info,
  Clapperboard,
  SlidersHorizontal,
  RotateCw,
  ExternalLink,
  Sparkles,
  Maximize2,
  Zap,
  ShieldCheck,
  Globe2,
  Tv,
  Star,
  AlertTriangle
} from 'lucide-react';
import { FilmeItem } from '@/app/api/filmes/route';
import {
  StreamService,
  StreamProviderId,
  STREAM_IFRAME_ALLOW,
  STREAM_REFERRER_POLICY
} from '@/services/streamService';

interface WorscoiFilmotecaViewProps {
  onBackToTV: () => void;
}

const LOCAL_STORAGE_FILMOTECAS_KEY = 'playsports_filmoteca_cache_v18';
const LOCAL_STORAGE_FILMOTECAS_TIME_KEY = 'playsports_filmoteca_cache_time_v18';
// Cache de 6 horas
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type ServidorFilme = StreamProviderId;

export function obterUrlFilme(filme: FilmeItem, servidor: ServidorFilme): string {
  return StreamService.getUrlForProvider(filme, servidor);
}

export function obterServidorPadrao(filme: FilmeItem): ServidorFilme {
  if (filme.directStreamUrl) return 'direct';
  if (filme.imdbId) return 'videasy';
  if (filme.tmdbId) return 'vidsrc';
  return 'videasy';
}

export function WorscoiFilmotecaView({ onBackToTV }: WorscoiFilmotecaViewProps) {
  const [filmes, setFilmes] = useState<FilmeItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const salvo = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignora erro
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const salvo = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return false;
        }
      }
    } catch {
      // Fallback
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [filmeAtivo, setFilmeAtivo] = useState<FilmeItem | null>(null);
  const [servidorAtivo, setServidorAtivo] = useState<ServidorFilme>('videasy');
  const [filmeSelecionado, setFilmeSelecionado] = useState<FilmeItem | null>(null);
  const [modoPlayer, setModoPlayer] = useState<ServidorFilme>('videasy');
  const [reloadKey, setReloadKey] = useState(0);
  const [busca, setBusca] = useState('');
  const [generoAtivo, setGeneroAtivo] = useState<string>('todos');
  const [isInsideIframe, setIsInsideIframe] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setIsInsideIframe(window.self !== window.top);
      }
    } catch {
      setIsInsideIframe(true);
    }
  }, []);

  const alternarProximoServidor = useCallback(() => {
    if (!filmeAtivo) return;
    const proximo = StreamService.getNextProvider(filmeAtivo, servidorAtivo);
    setServidorAtivo(proximo);
    setReloadKey((k) => k + 1);
  }, [filmeAtivo, servidorAtivo]);

  const recarregarPlayer = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const carregarFilmes = useCallback(async (force = false) => {
    if (!force) {
      try {
        const salvo = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_KEY);
        const salvoTimestamp = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_TIME_KEY);
        if (salvo && salvoTimestamp) {
          const idade = Date.now() - Number(salvoTimestamp);
          if (idade < CACHE_MAX_AGE_MS) {
            const parsed = JSON.parse(salvo);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFilmes(parsed);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Prossegue com fetch
      }
    }

    if (force) {
      setIsRefreshing(true);
    } else if (filmes.length === 0) {
      setIsLoading(true);
    }

    try {
      const res = await fetch('/api/filmes');
      if (!res.ok) throw new Error('Falha ao obter lista de filmes');
      const dados = await res.json();
      if (Array.isArray(dados) && dados.length > 0) {
        setFilmes(dados);
        try {
          localStorage.setItem(LOCAL_STORAGE_FILMOTECAS_KEY, JSON.stringify(dados));
          localStorage.setItem(LOCAL_STORAGE_FILMOTECAS_TIME_KEY, Date.now().toString());
        } catch {
          // Ignora cota excedida
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar filmes:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filmes.length]);

  useEffect(() => {
    carregarFilmes(false);
  }, [carregarFilmes]);

  // Define o filme ativo padrão com servidor ideal
  useEffect(() => {
    if (!filmeAtivo && filmes.length > 0) {
      const primeiro = filmes[0];
      setFilmeAtivo(primeiro);
      setServidorAtivo(obterServidorPadrao(primeiro));
    }
  }, [filmes, filmeAtivo]);

  // Busca remota oficial quando usuário pesquisa um título fora da lista local
  const executarBuscaGlobal = async (termo: string) => {
    if (!termo || termo.trim().length < 2) return;
    setIsSearchingRemote(true);
    try {
      const res = await fetch(`/api/filmes?q=${encodeURIComponent(termo.trim())}`);
      if (res.ok) {
        const resultados: FilmeItem[] = await res.json();
        if (Array.isArray(resultados) && resultados.length > 0) {
          // Adiciona ao topo da lista sem duplicar IDs
          setFilmes((prev) => {
            const idsExistentes = new Set(prev.map((f) => String(f.imdbId || f.id)));
            const novos = resultados.filter((r) => !idsExistentes.has(String(r.imdbId || r.id)));
            return [...novos, ...prev];
          });
          // Seleciona o primeiro resultado imediatamente
          const primeiro = resultados[0];
          setFilmeAtivo(primeiro);
          setServidorAtivo(obterServidorPadrao(primeiro));
        }
      }
    } catch (err) {
      console.warn('Erro na busca remota:', err);
    } finally {
      setIsSearchingRemote(false);
    }
  };

  // Extrai lista única de gêneros dos filmes
  const generosDisponiveis = useMemo(() => {
    const setGeneros = new Set<string>();
    filmes.forEach((f) => {
      if (f.genero) {
        f.genero.split(/[/,]/).forEach((g) => {
          const trimmed = g.trim();
          if (trimmed && trimmed.length > 2) setGeneros.add(trimmed);
        });
      }
    });
    return Array.from(setGeneros).slice(0, 8);
  }, [filmes]);

  const normalizar = (texto: string) =>
    (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Filtragem local
  const filmesFiltrados = useMemo(() => {
    const termo = normalizar(busca);
    return filmes.filter((f) => {
      if (generoAtivo !== 'todos') {
        const generoFilmeNorm = normalizar(f.genero);
        const generoAtivoNorm = normalizar(generoAtivo);
        if (!generoFilmeNorm.includes(generoAtivoNorm)) {
          return false;
        }
      }

      if (!termo) return true;

      const tituloNorm = normalizar(f.titulo);
      const generoNorm = normalizar(f.genero);
      const sinopseNorm = normalizar(f.sinopse);
      const imdbNorm = normalizar(f.imdbId || '');

      return (
        tituloNorm.includes(termo) ||
        generoNorm.includes(termo) ||
        sinopseNorm.includes(termo) ||
        imdbNorm.includes(termo)
      );
    });
  }, [filmes, busca, generoAtivo]);

  const handleSelecionarFilme = (filme: FilmeItem) => {
    setFilmeAtivo(filme);
    setServidorAtivo(obterServidorPadrao(filme));
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setGeneroAtivo('todos');
  };

  const renderServerPill = (
    id: ServidorFilme,
    label: string,
    icon: React.ReactNode,
    currentServer: ServidorFilme,
    onSelect: (s: ServidorFilme) => void,
    highlight = false
  ) => {
    const isSelected = currentServer === id;
    return (
      <button
        type="button"
        id={`filmoteca-server-${id}`}
        onClick={() => onSelect(id)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
          isSelected
            ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
            : highlight
            ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30'
            : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 flex flex-col min-h-full">
      {/* CABEÇALHO DA FILMOTECA */}
      <div className="flex flex-col gap-4 pb-6 border-b border-zinc-900/80 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="filmoteca-back-header-btn"
              onClick={onBackToTV}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
              title="Voltar para TV ao vivo"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D55]/20 to-zinc-900 border border-[#FF2D55]/40 flex items-center justify-center shadow-lg shadow-[#FF2D55]/10">
                <Film className="w-5 h-5 text-[#FF2D55]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Filmoteca & Cinema VOD
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF2D55]/10 text-[#FF2D55] border border-[#FF2D55]/20">
                    Multi-Provedor VIP
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Transmissão sob demanda dos verdadeiros filmes em alta definição com múltiplos servidores
                </p>
              </div>
            </div>
          </div>

          {/* BARRA DE PESQUISA PRINCIPAL E BOTÃO DE RECARREGAR */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="w-full md:w-96 relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  id="filmoteca-search-input"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executarBuscaGlobal(busca);
                    } else if (e.key === 'Escape') {
                      setBusca('');
                    }
                  }}
                  placeholder="Pesquisar filme ou pressionar Enter para buscar global..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-900 text-zinc-100 text-xs placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-[#FF2D55]/60 focus:ring-1 focus:ring-[#FF2D55]/30 transition"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {busca && (
                    <button
                      type="button"
                      id="filmoteca-clear-search-btn"
                      onClick={() => setBusca('')}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                      title="Limpar pesquisa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    id="filmoteca-do-search-btn"
                    onClick={() => executarBuscaGlobal(busca)}
                    disabled={isSearchingRemote || !busca.trim()}
                    className="p-1.5 rounded-lg bg-[#FF2D55] text-white hover:bg-[#e0264a] transition disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold"
                    title="Pesquisar catálogo global"
                  >
                    {isSearchingRemote ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Buscar'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {isInsideIframe && (
              <button
                type="button"
                id="filmoteca-header-open-tab-btn"
                onClick={() => StreamService.openAppInNewTab()}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 shadow-sm"
                title="Executar sem sandbox: Abre o Worscoi Channel em uma aba dedicada sem iframes"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Desativar Sandbox (Nova Aba)</span>
                <span className="sm:hidden">Nova Aba</span>
              </button>
            )}

            <button
              type="button"
              id="filmoteca-refresh-btn"
              onClick={() => carregarFilmes(true)}
              disabled={isRefreshing || isLoading}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Recarregar catálogo atualizado"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF2D55]' : ''}`} />
            </button>
          </div>
        </div>

        {/* FILTROS POR GÊNERO & CONTADOR DE RESULTADOS */}
        {!isLoading && filmes.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 max-w-full">
              <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mr-1 shrink-0">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Gêneros:</span>
              </span>

              <button
                type="button"
                id="filter-genre-all"
                onClick={() => setGeneroAtivo('todos')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                  generoAtivo === 'todos'
                    ? 'bg-[#FF2D55] text-white font-semibold shadow-sm shadow-[#FF2D55]/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                Todos
              </button>

              {generosDisponiveis.map((gen) => (
                <button
                  key={gen}
                  type="button"
                  id={`filter-genre-${normalizar(gen)}`}
                  onClick={() => setGeneroAtivo(generoAtivo === gen ? 'todos' : gen)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                    generoAtivo === gen
                      ? 'bg-[#FF2D55] text-white font-semibold shadow-sm shadow-[#FF2D55]/20'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {gen}
                </button>
              ))}
            </div>

            <div className="text-xs text-zinc-500 font-mono shrink-0">
              {filmesFiltrados.length === filmes.length ? (
                <span>{filmes.length} filmes prontos para assistir</span>
              ) : (
                <span className="text-zinc-400">
                  <span className="text-[#FF2D55] font-semibold">
                    {filmesFiltrados.length}
                  </span>{' '}
                  de {filmes.length} filmes
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PLAYER PRINCIPAL DE CINEMA / FILME ATIVO */}
      {!isLoading && (
        <div ref={playerContainerRef} className="w-full max-w-full mb-8 flex flex-col gap-3">
          {filmeAtivo && (
            <div className="w-full max-w-full flex flex-col gap-2">
              {/* BARRA DE SELEÇÃO DE PROVEDORES E FONTES */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-zinc-950/95 rounded-xl border border-zinc-800/90 text-xs shadow-xl">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono mr-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#FF2D55]" />
                    <span>Fontes:</span>
                  </span>

                  {filmeAtivo.directStreamUrl &&
                    renderServerPill(
                      'direct',
                      'Nativo (HTML5 Sem Bloqueios)',
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
                      servidorAtivo,
                      setServidorAtivo,
                      true
                    )}

                  {renderServerPill(
                    'videasy',
                    'Fonte 1: Videasy VIP (Recomendada)',
                    <Film className="w-3 h-3 text-cyan-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidsrc',
                    'Fonte 2: VidSrc Ultra',
                    <Tv className="w-3 h-3 text-amber-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidsrcin',
                    'Fonte 3: VidSrc In',
                    <Sparkles className="w-3 h-3 text-emerald-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidlink',
                    'Fonte 4: VidLink Pro (Ultra HD)',
                    <Play className="w-3 h-3 fill-current text-white" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'autoembed',
                    'Fonte 5: AutoEmbed VIP',
                    <Globe2 className="w-3 h-3 text-indigo-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {filmeAtivo.trailerUrl &&
                    renderServerPill(
                      'trailer',
                      'Trailer Oficial',
                      <Sparkles className="w-3 h-3 text-amber-300" />,
                      servidorAtivo,
                      setServidorAtivo
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="filmoteca-open-external-safe"
                    onClick={() => {
                      const url = obterUrlFilme(filmeAtivo, servidorAtivo);
                      if (url) StreamService.openSafeExternal(url);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Abre o player numa aba dedicada sem restrições de sandbox ou navegador"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Ecrã Externo Seguro</span>
                  </button>
                </div>
              </div>

              {/* AVISO DE QUALIDADE E DICA DE CONTORNAR POLÍTICAS DE SANDBOX */}
              <div className="px-3.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Reprodução do filme completo. Se uma fonte demorar ou ficar escura no seu navegador, selecione outra fonte acima ou use o <strong>Ecrã Externo</strong>.
                  </span>
                </span>
                <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline">
                  IMDb: {filmeAtivo.imdbId || 'HD'} {filmeAtivo.tmdbId ? `• TMDB: ${filmeAtivo.tmdbId}` : ''}
                </span>
              </div>

              {/* BANNER DE DESATIVAÇÃO DE SANDBOX HERDADO (AI STUDIO IFRAME) */}
              {isInsideIframe && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-zinc-950 border border-amber-500/40 text-xs shadow-lg">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="font-semibold text-amber-200">
                        Aviso de Restrição de Sandbox (Visualizador Embutido)
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Se o player apresentar &quot;Playback blocked / restricted (sandboxed) frame&quot;, clique ao lado para assistir sem qualquer restrição de sandbox herdada pelo navegador:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      id="filmoteca-unconstrained-player-btn"
                      onClick={() => {
                        const url = obterUrlFilme(filmeAtivo, servidorAtivo);
                        if (url) StreamService.openSafeExternal(url);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FF2D55] hover:bg-[#e0264a] text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      title="Abre o player em uma janela/aba dedicada sem qualquer restrição de sandbox"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ecrã Livre (Sem Sandbox)</span>
                    </button>
                    <button
                      type="button"
                      id="filmoteca-open-app-newtab-btn"
                      onClick={() => StreamService.openAppInNewTab()}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                      title="Abre toda a aplicação numa nova aba do navegador, removendo 100% dos iframes do editor"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir App em Nova Aba</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TELA DE REPRODUÇÃO (VÍDEO NATIVO OU IFRAME OTIMIZADO) */}
          <div
            className="relative w-full aspect-video max-w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl shrink-0"
            style={{ aspectRatio: '16 / 9' }}
          >
            {/* BOTÃO FLUTUANTE DE DESBLOQUEIO DE SANDBOX NO TOPO DO PLAYER */}
            {filmeAtivo && (
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  id="filmoteca-overlay-safe-external"
                  onClick={() => {
                    const url = obterUrlFilme(filmeAtivo, servidorAtivo);
                    if (url) StreamService.openSafeExternal(url);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-black/85 hover:bg-[#FF2D55] text-white text-[11px] font-semibold backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow-xl cursor-pointer"
                  title="Abrir reprodutor fora do iframe para contornar qualquer erro de sandbox"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ecrã Sem Sandbox</span>
                </button>
              </div>
            )}

            {filmeAtivo ? (
              servidorAtivo === 'direct' && filmeAtivo.directStreamUrl ? (
                <video
                  key={`${filmeAtivo.id}-direct-${reloadKey}`}
                  src={filmeAtivo.directStreamUrl}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                >
                  Seu navegador não suporta reprodução direta deste formato de vídeo.
                </video>
              ) : (
                <iframe
                  key={`${filmeAtivo.id}-${servidorAtivo}-${reloadKey}`}
                  src={obterUrlFilme(filmeAtivo, servidorAtivo)}
                  title={filmeAtivo.titulo}
                  width="100%"
                  height="100%"
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  referrerPolicy={STREAM_REFERRER_POLICY}
                  allow={STREAM_IFRAME_ALLOW}
                  className="absolute inset-0 w-full h-full bg-black border-0"
                ></iframe>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Selecione um filme para iniciar
              </div>
            )}
          </div>

          {/* ASSISTENTE DE REPRODUÇÃO RÁPIDA (FALLBACK & CORREÇÃO 1-CLIQUE) */}
          {filmeAtivo && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs shadow-md">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-zinc-300">
                  Fonte ativa: <strong className="text-white uppercase font-mono">{servidorAtivo}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="filmoteca-next-server-btn"
                  onClick={alternarProximoServidor}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 transition cursor-pointer flex items-center gap-1.5 text-[11px] font-medium"
                  title="Se a tela estiver preta ou demorando, clique aqui para trocar de fonte"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#FF2D55]" />
                  <span>Alternar Servidor (Se não reproduzir)</span>
                </button>

                <button
                  type="button"
                  id="filmoteca-reload-player-btn"
                  onClick={recarregarPlayer}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 transition cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Recarregar player atual"
                >
                  <RotateCw className="w-3 h-3 text-zinc-400" />
                  <span>Recarregar</span>
                </button>

                <button
                  type="button"
                  id="filmoteca-direct-external-btn"
                  onClick={() => {
                    const url = obterUrlFilme(filmeAtivo, servidorAtivo);
                    if (url) StreamService.openSafeExternal(url);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#FF2D55] hover:bg-[#e0264a] text-white transition cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold shadow-sm"
                  title="Abre o player em nova aba sem nenhuma limitação de iframe ou navegador"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ecrã Externo (Sem Bloqueios)</span>
                </button>
              </div>
            </div>
          )}

          {/* BARRA DE INFORMAÇÕES DO FILME ATIVO */}
          {filmeAtivo && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 shadow-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {filmeAtivo.titulo}
                  </h2>
                  {filmeAtivo.rating && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shadow flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>{filmeAtivo.rating}</span>
                    </span>
                  )}
                  {filmeAtivo.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30">
                      {filmeAtivo.imdbId}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {filmeAtivo.ano}
                  </span>
                  <span className="text-xs text-[#FF2D55] font-semibold">
                    {filmeAtivo.genero}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {filmeAtivo.sinopse}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="filmoteca-open-theater-modal-btn"
                  onClick={() => {
                    setFilmeSelecionado(filmeAtivo);
                    setModoPlayer(servidorAtivo);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Abrir reprodutor em modo teatro / tela expandida"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Modo Teatro</span>
                </button>
                <div className="text-[11px] text-emerald-400/90 font-mono bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Filme Completo</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ESTADO DE CARREGAMENTO */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#FF2D55] animate-spin mb-4" />
          <p className="text-sm font-medium text-zinc-300">
            Carregando repositório de filmes em alta resolução...
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Conectando fontes VidLink, Videasy, VidSrc e streams diretos
          </p>
        </div>
      )}

      {/* GRELHA ESTILO STREAMING / NETFLIX */}
      {!isLoading && filmesFiltrados.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filmesFiltrados.map((filme) => (
            <div
              key={filme.id}
              onClick={() => handleSelecionarFilme(filme)}
              className={`group relative flex flex-col bg-zinc-950 rounded-xl overflow-hidden border transition duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.02] ${
                filmeAtivo?.id === filme.id
                  ? 'border-[#FF2D55] ring-2 ring-[#FF2D55]/40'
                  : 'border-zinc-900 hover:border-zinc-700'
              }`}
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
                  <div
                    className="w-10 h-10 rounded-full bg-[#FF2D55] hover:bg-[#e0264a] text-white flex items-center justify-center shadow-lg shadow-[#FF2D55]/40 transform scale-90 group-hover:scale-100 transition"
                    title="Assistir no player principal"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <button
                    type="button"
                    title="Abrir em Modo Teatro"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilmeSelecionado(filme);
                      setModoPlayer(obterServidorPadrao(filme));
                    }}
                    className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* BADGES IMDb / RATING / ANO */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
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
                  <p className="text-[11px] text-[#FF2D55] font-mono mt-0.5 font-medium">
                    {filme.genero}
                  </p>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {filme.sinopse}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESTADO QUANDO NENHUM FILME FOR ENCONTRADO */}
      {!isLoading && filmesFiltrados.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
            <Info className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-300">
            Nenhum filme na lista local para &quot;{busca}&quot;
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            Deseja buscar este título diretamente no catálogo global IMDb e gerar as fontes de reprodução?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="filmoteca-search-global-btn"
              onClick={() => executarBuscaGlobal(busca)}
              disabled={isSearchingRemote}
              className="px-4 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#e0264a] text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isSearchingRemote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe2 className="w-3.5 h-3.5" />
              )}
              <span>Buscar no Catálogo Global IMDb</span>
            </button>
            <button
              type="button"
              id="filmoteca-reset-filters-btn"
              onClick={limparFiltros}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-800 transition cursor-pointer"
            >
              Limpar busca
            </button>
          </div>
        </div>
      )}

      {/* MODAL DO REPRODUTOR DE FILME SELECIONADO (MODO TEATRO) */}
      {filmeSelecionado && (() => {
        const urlAtiva = obterUrlFilme(filmeSelecionado, modoPlayer);
        const isDirectVideo = modoPlayer === 'direct' && Boolean(filmeSelecionado.directStreamUrl);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
            onClick={() => setFilmeSelecionado(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BARRA SUPERIOR DO MODAL */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90">
                <div className="flex items-center gap-2 min-w-0">
                  <Clapperboard className="w-4 h-4 text-[#FF2D55] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {filmeSelecionado.titulo}
                  </span>
                  {filmeSelecionado.rating && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shrink-0 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>{filmeSelecionado.rating}</span>
                    </span>
                  )}
                  {filmeSelecionado.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/30 text-[9px] font-mono font-bold shrink-0">
                      {filmeSelecionado.imdbId}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 shrink-0">
                    {filmeSelecionado.ano}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {urlAtiva && (
                    <button
                      type="button"
                      id="filmoteca-open-external-btn"
                      onClick={() => StreamService.openSafeExternal(urlAtiva)}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-200 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition"
                      title="Abrir em Nova Aba Isolada"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ecrã Externo Seguro</span>
                    </button>
                  )}
                  <button
                    type="button"
                    id="filmoteca-modal-close-btn"
                    onClick={() => setFilmeSelecionado(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    title="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SELEÇÃO DE FONTES NO MODAL */}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 overflow-x-auto text-xs">
                {filmeSelecionado.directStreamUrl &&
                  renderServerPill(
                    'direct',
                    'Nativo HTML5',
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />,
                    modoPlayer,
                    setModoPlayer,
                    true
                  )}

                {renderServerPill(
                  'videasy',
                  'Fonte 1: Videasy VIP',
                  <Film className="w-3 h-3 text-cyan-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'vidsrc',
                  'Fonte 2: VidSrc Ultra',
                  <Tv className="w-3 h-3 text-amber-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'vidsrcin',
                  'Fonte 3: VidSrc In',
                  <Sparkles className="w-3 h-3 text-emerald-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'vidlink',
                  'Fonte 4: VidLink Pro',
                  <Play className="w-3 h-3 fill-current" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'autoembed',
                  'Fonte 5: AutoEmbed VIP',
                  <Globe2 className="w-3 h-3 text-indigo-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {filmeSelecionado.trailerUrl &&
                  renderServerPill(
                    'trailer',
                    'Trailer',
                    <Sparkles className="w-3 h-3 text-amber-300" />,
                    modoPlayer,
                    setModoPlayer
                  )}
              </div>

              {/* ÁREA DE REPRODUÇÃO */}
              <div
                className="relative aspect-video w-full max-w-full bg-black flex items-center justify-center overflow-hidden shrink-0"
                style={{ aspectRatio: '16 / 9' }}
              >
                {urlAtiva && (
                  <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
                    <button
                      type="button"
                      id="modal-overlay-safe-external"
                      onClick={() => StreamService.openSafeExternal(urlAtiva)}
                      className="px-2.5 py-1.5 rounded-lg bg-black/85 hover:bg-[#FF2D55] text-white text-[11px] font-semibold backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow-xl cursor-pointer"
                      title="Abrir reprodutor fora do iframe para contornar qualquer erro de sandbox"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ecrã Sem Sandbox</span>
                    </button>
                  </div>
                )}
                {urlAtiva ? (
                  isDirectVideo ? (
                    <video
                      key={`${urlAtiva}-${reloadKey}`}
                      src={urlAtiva}
                      controls
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain bg-black"
                    >
                      Seu navegador não suporta este formato de vídeo.
                    </video>
                  ) : (
                    <iframe
                      key={`${filmeSelecionado.id}-${modoPlayer}-${reloadKey}`}
                      src={urlAtiva}
                      title={filmeSelecionado.titulo}
                      className="absolute inset-0 w-full h-full border-0 bg-black"
                      allowFullScreen
                      referrerPolicy={STREAM_REFERRER_POLICY}
                      allow={STREAM_IFRAME_ALLOW}
                    />
                  )
                ) : (
                  <div className="text-center p-6 text-zinc-500">
                    <Film className="w-12 h-12 mx-auto mb-2 text-zinc-700" />
                    <p className="text-xs">Link de vídeo indisponível para este item.</p>
                  </div>
                )}
              </div>

              {/* BARRA DE RESOLUÇÃO RÁPIDA NO MODAL */}
              {urlAtiva && (
                <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Se não reproduzir de imediato, troque a fonte ou abra no Ecrã Externo:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = StreamService.getNextProvider(filmeSelecionado, modoPlayer);
                        setModoPlayer(next);
                        setReloadKey((k) => k + 1);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3 text-[#FF2D55]" />
                      <span>Alternar Fonte</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => StreamService.openSafeExternal(urlAtiva)}
                      className="px-2.5 py-1 rounded bg-[#FF2D55] hover:bg-[#e0264a] text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ecrã Externo (Sem Bloqueios)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DETALHES E SINOPSE */}
              <div className="p-4 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-zinc-400 font-mono">Gênero:</span>
                    <span className="text-[#FF2D55] font-semibold">
                      {filmeSelecionado.genero}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {filmeSelecionado.sinopse}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="filmoteca-modal-back-btn"
                    onClick={() => setFilmeSelecionado(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition cursor-pointer font-medium"
                  >
                    Voltar à Filmoteca
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
