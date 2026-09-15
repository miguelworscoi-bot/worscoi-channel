'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Tv,
  Globe,
} from 'lucide-react';
import { FilmeItem } from '@/app/api/filmes/route';

interface WorscoiFilmotecaViewProps {
  onBackToTV: () => void;
}

const LOCAL_STORAGE_FILMOTECAS_KEY = 'playsports_filmoteca_cache_v10';
const LOCAL_STORAGE_FILMOTECAS_TIME_KEY = 'playsports_filmoteca_cache_time_v10';
// Cache válido por 6 horas (mesmo intervalo de revalidação do repositório)
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

type ServidorFilme = 'dailymotion' | 'multiembed' | 'vidsrc' | 'trailer';

function obterUrlFilme(filme: FilmeItem, servidor: ServidorFilme): string {
  if (servidor === 'dailymotion') {
    return (
      filme.dailymotionUrl ||
      `https://www.dailymotion.com/embed/video/xat72da?autoplay=1`
    );
  }
  if (servidor === 'multiembed') {
    return (
      filme.videoUrl ||
      (filme.imdbId ? `https://multiembed.mov/directstream.php?video_id=${filme.imdbId}` : '')
    );
  }
  if (servidor === 'vidsrc') {
    return (
      filme.fallbackUrl ||
      (filme.imdbId ? `https://vidsrc.me/embed/movie?imdb=${filme.imdbId}` : '')
    );
  }
  if (servidor === 'trailer') {
    return filme.trailerUrl || '';
  }
  return filme.dailymotionUrl || filme.trailerUrl || '';
}

export function WorscoiFilmotecaView({ onBackToTV }: WorscoiFilmotecaViewProps) {
  // Inicializa o estado diretamente do localStorage para evitar telas de carregamento ao trocar de abas
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
      // Ignora erro de leitura
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
  const [filmeAtivo, setFilmeAtivo] = useState<FilmeItem | null>(null);
  const [servidorAtivo, setServidorAtivo] = useState<ServidorFilme>('dailymotion');
  const [filmeSelecionado, setFilmeSelecionado] = useState<FilmeItem | null>(null);
  const [modoPlayer, setModoPlayer] = useState<ServidorFilme>('dailymotion');
  const [busca, setBusca] = useState('');
  const [generoAtivo, setGeneroAtivo] = useState<string>('todos');

  const carregarFilmes = useCallback(async (force = false) => {
    // Se não for forçado e já temos dados em cache dentro da validade, não recarrega
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
        // Prossegue com requisição
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
          // localStorage cota excedida ou restrição
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

  // Seleciona automaticamente o primeiro filme caso nenhum esteja ativo
  useEffect(() => {
    if (!filmeAtivo && filmes.length > 0) {
      setFilmeAtivo(filmes[0]);
    }
  }, [filmes, filmeAtivo]);

  // Extrai lista única de gêneros dos filmes retornados pela API
  const generosDisponiveis = useMemo(() => {
    const setGeneros = new Set<string>();
    filmes.forEach((f) => {
      if (f.genero) {
        f.genero.split(/[/,]/).forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) setGeneros.add(trimmed);
        });
      }
    });
    return Array.from(setGeneros);
  }, [filmes]);

  // Função para normalizar acentuação e caixa
  const normalizar = (texto: string) =>
    (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Filtragem combinada por título ou gênero
  const filmesFiltrados = useMemo(() => {
    const termo = normalizar(busca);
    return filmes.filter((f) => {
      // Valida filtro de gênero clicável
      if (generoAtivo !== 'todos') {
        const generoFilmeNorm = normalizar(f.genero);
        const generoAtivoNorm = normalizar(generoAtivo);
        if (!generoFilmeNorm.includes(generoAtivoNorm)) {
          return false;
        }
      }

      // Se a barra de busca estiver vazia, exibe de acordo com o gênero
      if (!termo) return true;

      const tituloNorm = normalizar(f.titulo);
      const generoNorm = normalizar(f.genero);
      const sinopseNorm = normalizar(f.sinopse);

      return (
        tituloNorm.includes(termo) ||
        generoNorm.includes(termo) ||
        sinopseNorm.includes(termo)
      );
    });
  }, [filmes, busca, generoAtivo]);

  const limparFiltros = () => {
    setBusca('');
    setGeneroAtivo('todos');
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF2D55]/20 to-zinc-900 border border-[#FF2D55]/30 flex items-center justify-center">
                <Film className="w-4 h-4 text-[#FF2D55]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Filmoteca
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#FF2D55]/10 text-[#FF2D55] border border-[#FF2D55]/20">
                    VOD & Open Source
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Catálogo sob demanda com busca dinâmica por título e gênero
                </p>
              </div>
            </div>
          </div>

          {/* BARRA DE PESQUISA PRINCIPAL E BOTÃO DE RECARREGAR */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="w-full md:w-80 relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  id="filmoteca-search-input"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setBusca('');
                  }}
                  placeholder="Pesquisar por título ou gênero..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-900 text-zinc-100 text-xs placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-[#FF2D55]/60 focus:ring-1 focus:ring-[#FF2D55]/30 transition"
                />
                {busca && (
                  <button
                    type="button"
                    id="filmoteca-clear-search-btn"
                    onClick={() => setBusca('')}
                    className="absolute right-2.5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    title="Limpar pesquisa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              id="filmoteca-refresh-btn"
              onClick={() => carregarFilmes(true)}
              disabled={isRefreshing || isLoading}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Atualizar catálogo do repositório"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF2D55]' : ''}`} />
            </button>
          </div>
        </div>

        {/* FILTROS POR GÊNERO & CONTADOR DE RESULTADOS */}
        {!isLoading && filmes.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* CHIPS DE GÊNEROS */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 max-w-full">
              <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mr-1">
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

            {/* CONTADOR DE ITENS */}
            <div className="text-xs text-zinc-500 font-mono shrink-0">
              {filmesFiltrados.length === filmes.length ? (
                <span>{filmes.length} filmes disponíveis</span>
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
        <div className="mb-8 flex flex-col gap-3">
          {/* SELETOR DE SERVIDOR DE STREAMING */}
          {filmeAtivo && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-zinc-950/90 rounded-xl border border-zinc-800/90 text-xs shadow-lg">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono mr-1">
                  Servidor:
                </span>
                <button
                  type="button"
                  id="filmoteca-servidor-vidsrc"
                  onClick={() => setServidorAtivo('vidsrc')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    servidorAtivo === 'vidsrc'
                      ? 'bg-[#FF2D55] text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                  title="Player VidSrc Principal (Compatível sem erros de sandbox)"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>VidSrc VIP (Principal)</span>
                </button>
                <button
                  type="button"
                  id="filmoteca-servidor-vidsrc-alt"
                  onClick={() => setServidorAtivo('vidsrc_alt')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    servidorAtivo === 'vidsrc_alt'
                      ? 'bg-[#FF2D55] text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                  title="Servidor secundário alternativo"
                >
                  <Film className="w-3 h-3" />
                  <span>VidSrc HD (Alt)</span>
                </button>
                {filmeAtivo.trailerUrl && (
                  <button
                    type="button"
                    id="filmoteca-servidor-trailer"
                    onClick={() => setServidorAtivo('trailer')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      servidorAtivo === 'trailer'
                        ? 'bg-[#FF2D55] text-white shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Trailer Oficial 4K</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="filmoteca-open-external-safe"
                  onClick={() => {
                    const url = obterUrlFilme(filmeAtivo, servidorAtivo);
                    if (url) window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer flex items-center gap-1.5"
                  title="Abre o player numa aba isolada sem restrições de sandbox"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Ecrã Externo Seguro</span>
                </button>
              </div>
            </div>
          )}

          {/* TELA DE REPRODUÇÃO SEM RESTRIÇÃO SANDBOX */}
          <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl">
            {filmeAtivo ? (
              <iframe
                key={`${filmeAtivo.id}-${servidorAtivo}`}
                src={obterUrlFilme(filmeAtivo, servidorAtivo) || filmeAtivo.videoUrl}
                title={filmeAtivo.titulo}
                width="100%"
                height="100%"
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                /* Deixamos apenas os triggers de mídia, sem a tag restrictiva sandbox */
                allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Selecione um filme para iniciar
              </div>
            )}
          </div>

          {/* BARRA DE INFORMAÇÕES DO FILME ATIVO */}
          {filmeAtivo && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 shadow-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {filmeAtivo.titulo}
                  </h2>
                  {filmeAtivo.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shadow">
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
                  <span>Servidor VIP Ativo</span>
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
            Lendo repositório público de filmes...
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Extraindo metadados, capas e links VOD
          </p>
        </div>
      )}

      {/* GRELHA ESTILO NETFLIX / STREAMING */}
      {!isLoading && filmesFiltrados.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filmesFiltrados.map((filme) => (
            <div
              key={filme.id}
              onClick={() => {
                setFilmeAtivo(filme);
                // Rola suavemente até o player no topo se estiver abaixo
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
                      setModoPlayer('videasy');
                    }}
                    className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* BADGES IMDb / ANO */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {filme.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shadow tracking-wider">
                      IMDb
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
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
            Nenhum filme encontrado
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            {busca
              ? `Não foram encontrados resultados para "${busca}" no título ou gênero.`
              : 'Nenhum filme corresponde aos filtros selecionados.'}
          </p>
          <button
            type="button"
            id="filmoteca-reset-filters-btn"
            onClick={limparFiltros}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-800 transition cursor-pointer"
          >
            Limpar busca e filtros
          </button>
        </div>
      )}

      {/* MODAL DO REPRODUTOR DE FILME SELECIONADO */}
      {filmeSelecionado && (() => {
        const urlAtiva = obterUrlFilme(filmeSelecionado, modoPlayer);
        const isEmbed = Boolean(
          urlAtiva && (
            urlAtiva.includes('videasy') ||
            urlAtiva.includes('autoembed') ||
            urlAtiva.includes('embed') ||
            urlAtiva.includes('youtube') ||
            urlAtiva.includes('youtu.be') ||
            Boolean(filmeSelecionado.imdbId)
          )
        );

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
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-2 min-w-0">
                  <Clapperboard className="w-4 h-4 text-[#FF2D55] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {filmeSelecionado.titulo}
                  </span>
                  {filmeSelecionado.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shrink-0">
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
                      onClick={() => window.open(urlAtiva, '_blank', 'noopener,noreferrer')}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition"
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

              {/* SELEÇÃO DE SERVIDOR / MODO DE REPRODUÇÃO */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/80 overflow-x-auto text-xs">
                <button
                  type="button"
                  id="filmoteca-modal-server-vidsrc"
                  onClick={() => setModoPlayer('vidsrc')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    modoPlayer === 'vidsrc'
                      ? 'bg-[#FF2D55] text-white shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Player VidSrc Principal (Sem erros de sandbox)"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>VidSrc VIP (Principal)</span>
                </button>

                <button
                  type="button"
                  id="filmoteca-modal-server-vidsrc-alt"
                  onClick={() => setModoPlayer('vidsrc_alt')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    modoPlayer === 'vidsrc_alt'
                      ? 'bg-[#FF2D55] text-white shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Servidor secundário alternativo"
                >
                  <Film className="w-3 h-3" />
                  <span>VidSrc HD (Alt)</span>
                </button>

                {filmeSelecionado.trailerUrl && (
                  <button
                    type="button"
                    id="filmoteca-modal-server-trailer"
                    onClick={() => setModoPlayer('trailer')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      modoPlayer === 'trailer'
                        ? 'bg-[#FF2D55] text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Trailer Oficial 4K</span>
                  </button>
                )}
              </div>

              {/* PLAYER DE VÍDEO DO FILME (IFRAME OU VÍDEO NATIVO) SEM RESTRIÇÃO SANDBOX */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                {urlAtiva ? (
                  isEmbed ? (
                    <iframe
                      key={`${filmeSelecionado.id}-${modoPlayer}`}
                      src={urlAtiva}
                      title={filmeSelecionado.titulo}
                      className="w-full h-full border-0"
                      allowFullScreen
                      /* Deixamos apenas os triggers de mídia, sem a tag restrictiva sandbox */
                      allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video
                      key={urlAtiva}
                      src={urlAtiva}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    >
                      Seu navegador não suporta este formato de vídeo.
                    </video>
                  )
                ) : (
                  <div className="text-center p-6 text-zinc-500">
                    <Film className="w-12 h-12 mx-auto mb-2 text-zinc-700" />
                    <p className="text-xs">Link de vídeo indisponível para este item.</p>
                  </div>
                )}
              </div>

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
