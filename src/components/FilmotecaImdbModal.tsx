'use client';
import React, { useEffect, useState } from 'react';
import {
  X,
  Star,
  Calendar,
  Clock,
  Award,
  Users,
  Film,
  Tv,
  Play,
  ExternalLink,
  Sparkles,
  Maximize2,
  Share2,
  Check
} from 'lucide-react';
import { FilmeItem } from '@/app/api/filmes/route';
import { ImdbDetalhes } from '@/types';
import { ImdbService } from '@/services/imdbService';

interface FilmotecaImdbModalProps {
  filme: FilmeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (filme: FilmeItem, season?: number, episode?: number) => void;
  onPlayCinema?: (filme: FilmeItem) => void;
  onSearchActor?: (actorName: string) => void;
}

export function FilmotecaImdbModal({
  filme,
  isOpen,
  onClose,
  onPlay,
  onPlayCinema,
  onSearchActor
}: FilmotecaImdbModalProps) {
  const [detalhes, setDetalhes] = useState<ImdbDetalhes | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [seasonSelecionada, setSeasonSelecionada] = useState(1);
  const [episodeSelecionado, setEpisodeSelecionado] = useState(1);
  const [exibirSinopsePt, setExibirSinopsePt] = useState(true);

  useEffect(() => {
    if (!isOpen || !filme) {
      setDetalhes(null);
      setLoading(false);
      return;
    }

    let ativo = true;
    setLoading(true);
    setSeasonSelecionada(1);
    setEpisodeSelecionado(1);

    ImdbService.obterDetalhes(filme)
      .then((dados) => {
        if (ativo) {
          setDetalhes(dados);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar detalhes IMDb:', err);
        if (ativo) {
          setLoading(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [isOpen, filme]);

  // Tecla Escape para fechar modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !filme) return null;

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = detalhes?.urlImdb || `https://www.imdb.com/title/${filme.imdbId || ''}/`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    });
  };

  const totalSeasons = detalhes?.totalTemporadas || (typeof filme.temporadas === 'number' ? filme.temporadas : 1);
  const totalEpisodesInSeason = typeof filme.episodiosPorTemporada === 'number' ? filme.episodiosPorTemporada : 10;

  return (
    <div
      id="imdb-details-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="imdb-details-container"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0b10] border border-zinc-800/80 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden text-zinc-100 ring-1 ring-white/10"
      >
        {/* Header Superior com Badge IMDb e Fechar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/70 z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center bg-[#f5c518] text-black font-black text-xs px-2.5 py-0.5 rounded shadow-sm tracking-wider">
              IMDb
            </span>
            <span className="text-xs font-medium text-zinc-400">
              Metadados & Ficha Técnica Oficial
            </span>
            {detalhes?.imdbId && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded">
                {detalhes.imdbId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Copiar link oficial"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-medium">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Compartilhar</span>
                </>
              )}
            </button>

            {detalhes?.urlImdb && (
              <a
                href={detalhes.urlImdb}
                target="_blank"
                rel="noreferrer"
                title="Abrir no site oficial do IMDb"
                className="p-1.5 text-zinc-400 hover:text-[#f5c518] hover:bg-zinc-800/60 rounded-lg transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">IMDb.com</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Fechar detalhes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {loading ? (
            /* Skeleton de Carregamento */
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-zinc-800 border-t-[#f5c518] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#f5c518]">IMDb</span>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-zinc-200">
                  Consultando metadados em tempo real do IMDb...
                </p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Obtendo sinopse detalhada, elenco principal, avaliações dos críticos e prêmios para <strong className="text-zinc-300">{filme.titulo}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Seção Superior: Capa + Informações Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                {/* Capa / Pôster com Efeito */}
                <div className="sm:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start gap-3">
                  <div className="relative w-44 sm:w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 group bg-zinc-900">
                    <img
                      src={detalhes?.capa || filme.capa}
                      alt={filme.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 bg-black/80 backdrop-blur-md text-[#f5c518] font-bold text-xs px-2 py-0.5 rounded border border-[#f5c518]/30">
                        <Star className="w-3 h-3 fill-[#f5c518]" />
                        {detalhes?.notaImdb || filme.rating || '8.5'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-300 border border-zinc-700/50">
                        {detalhes?.tipo === 'serie' || filme.tipo === 'serie' ? 'Série' : 'Filme'}
                      </span>
                    </div>
                  </div>

                  {/* Botões de Ação Imediata */}
                  <div className="w-full space-y-2 pt-1">
                    <button
                      onClick={() => {
                        onPlay(filme, seasonSelecionada, episodeSelecionado);
                        onClose();
                      }}
                      className="w-full py-2.5 px-4 bg-[#f5c518] hover:bg-[#e4b512] text-black font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Assistir Agora
                    </button>

                    {onPlayCinema && (
                      <button
                        onClick={() => {
                          onPlayCinema(filme);
                          onClose();
                        }}
                        className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                        Modo Cinema
                      </button>
                    )}
                  </div>
                </div>

                {/* Coluna de Informações e Metadados IMDb */}
                <div className="sm:col-span-8 lg:col-span-9 space-y-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      {detalhes?.titulo || filme.titulo}
                    </h2>
                    {detalhes?.tituloOriginal && detalhes.tituloOriginal !== detalhes.titulo && (
                      <p className="text-xs text-zinc-400 italic mt-0.5">
                        Título original: {detalhes.tituloOriginal}
                      </p>
                    )}
                  </div>

                  {/* Pills de Metadados: Ano, Classificação, Duração, Gênero */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {detalhes?.ano && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {detalhes.ano}
                      </span>
                    )}

                    {detalhes?.classificacao && (
                      <span className="px-2 py-0.5 font-semibold text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                        {detalhes.classificacao}
                      </span>
                    )}

                    {detalhes?.duracao && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {detalhes.duracao}
                      </span>
                    )}

                    {detalhes?.genero && (
                      <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                        {detalhes.genero}
                      </span>
                    )}
                  </div>

                  {/* Card de Avaliação IMDb em Destaque */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#f5c518]/15 border border-[#f5c518]/30 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-[#f5c518] leading-none">IMDb</span>
                        <span className="text-sm font-black text-white mt-0.5 leading-none">
                          {detalhes?.notaImdb || filme.rating || '8.5'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-sm font-bold text-white">
                          <Star className="w-4 h-4 fill-[#f5c518] text-[#f5c518]" />
                          <span>{detalhes?.notaImdb || filme.rating || '8.5'}</span>
                          <span className="text-xs text-zinc-400 font-normal">/ 10</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {detalhes?.votosImdb || 'Avaliações globais de usuários no IMDb'}
                        </p>
                      </div>
                    </div>

                    {detalhes?.metascore && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <span className="text-xs font-bold text-emerald-400">Metascore</span>
                        <span className="text-xs font-black bg-emerald-500 text-black px-1.5 py-0.5 rounded">
                          {detalhes.metascore}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sinopse Dinâmica */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-[#f5c518]" />
                        Sinopse
                      </h3>
                      {detalhes?.sinopseLocal && detalhes.sinopse !== detalhes.sinopseLocal && (
                        <button
                          onClick={() => setExibirSinopsePt(!exibirSinopsePt)}
                          className="text-[11px] text-[#f5c518] hover:underline"
                        >
                          {exibirSinopsePt ? 'Ver sinopse IMDb em inglês' : 'Ver sinopse em português'}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {exibirSinopsePt && detalhes?.sinopseLocal
                        ? detalhes.sinopseLocal
                        : (detalhes?.sinopse || filme.sinopse)}
                    </p>
                  </div>

                  {/* Elenco Principal (Cast) em Chips Clicáveis */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      Elenco Principal
                    </h3>
                    {detalhes?.elenco && detalhes.elenco.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {detalhes.elenco.map((ator, idx) => (
                          <button
                            key={idx}
                            onClick={() => onSearchActor && onSearchActor(ator)}
                            title={`Filtrar títulos com ${ator}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-[#f5c518] border border-zinc-800 hover:border-zinc-700 text-xs rounded-full transition-all cursor-pointer"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c518]" />
                            {ator}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400">
                        {detalhes?.elencoTexto || 'Elenco completo listado no catálogo IMDb.'}
                      </p>
                    )}
                  </div>

                  {/* Direção, Roteiro e Prêmios */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80 text-xs">
                    {detalhes?.diretor && (
                      <div>
                        <span className="text-zinc-500 font-medium">Direção: </span>
                        <span className="text-zinc-200 font-semibold">{detalhes.diretor}</span>
                      </div>
                    )}
                    {detalhes?.roteirista && (
                      <div>
                        <span className="text-zinc-500 font-medium">Roteiro / Criação: </span>
                        <span className="text-zinc-200">{detalhes.roteirista}</span>
                      </div>
                    )}
                    {detalhes?.premios && (
                      <div className="sm:col-span-2 flex items-start gap-1.5 text-amber-300/90 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/15">
                        <Award className="w-4 h-4 text-[#f5c518] shrink-0 mt-0.5" />
                        <span>{detalhes.premios}</span>
                      </div>
                    )}
                  </div>

                  {/* Seletor de Temporadas e Episódios se for Série */}
                  {(detalhes?.tipo === 'serie' || filme.tipo === 'serie') && (
                    <div className="pt-3 border-t border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                          <Tv className="w-3.5 h-3.5 text-indigo-400" />
                          Temporadas & Episódios ({totalSeasons} disponíveis)
                        </h4>
                      </div>

                      {/* Botões de Temporada */}
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setSeasonSelecionada(s);
                              setEpisodeSelecionado(1);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              seasonSelecionada === s
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            Temp {s}
                          </button>
                        ))}
                      </div>

                      {/* Botões de Episódios */}
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {Array.from({ length: totalEpisodesInSeason }, (_, i) => i + 1).map((ep) => (
                          <button
                            key={ep}
                            onClick={() => setEpisodeSelecionado(ep)}
                            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                              episodeSelecionado === ep
                                ? 'bg-[#f5c518] text-black font-bold'
                                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80'
                            }`}
                          >
                            EP {ep}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer do Modal com Créditos IMDb e Ação */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#f5c518]" />
            <span>Dados sincronizados em tempo real via base de dados IMDb</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onPlay(filme, seasonSelecionada, episodeSelecionado);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-[#f5c518] hover:bg-[#e4b512] text-black font-bold transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Reproduzir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
