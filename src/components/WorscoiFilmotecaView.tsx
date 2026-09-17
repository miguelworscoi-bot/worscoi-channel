'use client';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Flame,
  LayoutGrid,
  Layers,
  Heart,
  Ghost,
  Laugh,
  Rocket
} from 'lucide-react';
import { FilmeItem } from '@/app/api/filmes/route';
import {
  StreamService,
  StreamProviderId,
  STREAM_IFRAME_ALLOW,
  STREAM_REFERRER_POLICY
} from '@/services/streamService';
import { FilmeCard } from '@/components/FilmeCard';
import { FilmotecaGenreRow } from '@/components/FilmotecaGenreRow';
import { FilmotecaImdbModal } from '@/components/FilmotecaImdbModal';
import { ImdbService } from '@/services/imdbService';

interface WorscoiFilmotecaViewProps {
  onBackToTV: () => void;
}

const LOCAL_STORAGE_FILMOTECAS_KEY = 'playsports_filmoteca_cache_v23';
const LOCAL_STORAGE_FILMOTECAS_TIME_KEY = 'playsports_filmoteca_cache_time_v23';
// Cache de 6 horas
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type ServidorFilme = StreamProviderId;

export function obterUrlFilme(
  filme: FilmeItem,
  servidor: ServidorFilme,
  season: number = 1,
  episode: number = 1
): string {
  return StreamService.getUrlForProvider(filme, servidor, season, episode);
}

export function obterServidorPadrao(filme: FilmeItem): ServidorFilme {
  if (filme.directStreamUrl) return 'direct';
  if (filme.imdbId) return 'videasy';
  if (filme.tmdbId) return 'vidsrc';
  return 'videasy';
}

export interface SecaoGeneroConfig {
  id: string;
  titulo: string;
  subtitulo?: string;
  icon: React.ReactNode;
  corDestaque: string;
  badgeBg: string;
  test: (f: FilmeItem) => boolean;
}

export const SECOES_GENERO: SecaoGeneroConfig[] = [
  {
    id: 'imdb-top',
    titulo: 'IMDb Top 250 & Aclamados',
    subtitulo: 'As maiores notas da história do cinema, séries e animações no ranking oficial IMDb',
    icon: <Star className="w-4 h-4 fill-amber-400/80 text-amber-400" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const r = f.rating ? parseFloat(f.rating) : 0;
      return Boolean(
        String(f.id).includes('imdb') ||
        (f.imdbId && f.imdbId.startsWith('tt')) ||
        r >= 8.5
      );
    }
  },
  {
    id: 'lancamentos',
    titulo: 'Novos Lançamentos & Em Alta',
    subtitulo: 'Grandes sucessos recentes do cinema e streaming',
    icon: <Flame className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const anoNum = parseInt(f.ano, 10);
      return Boolean(f.plataforma || (anoNum && anoNum >= 2024));
    }
  },
  {
    id: 'acao',
    titulo: 'Ação & Aventura',
    subtitulo: 'Adrenalina, combates eletrizantes e jornadas épicas',
    icon: <Zap className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('acao') ||
        g.includes('ação') ||
        g.includes('action') ||
        g.includes('aventura') ||
        g.includes('adventure')
      );
    }
  },
  {
    id: 'anime',
    titulo: 'Animes & Animação',
    subtitulo: 'Sagas lendárias, produções Crunchyroll e shonens',
    icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        f.tipo === 'anime' ||
        f.plataforma === 'crunchyroll' ||
        g.includes('anime') ||
        g.includes('animacao') ||
        g.includes('animação') ||
        g.includes('animation')
      );
    }
  },
  {
    id: 'drama',
    titulo: 'Drama & Histórias Profundas',
    subtitulo: 'Roteiros consagrados, biografias e atuações premiadas',
    icon: <Heart className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('drama') ||
        g.includes('biografia') ||
        g.includes('historia') ||
        g.includes('romance')
      );
    }
  },
  {
    id: 'scifi',
    titulo: 'Ficção Científica & Fantasia',
    subtitulo: 'Futuros distópicos, cosmos, magia e tecnologia',
    icon: <Rocket className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('ficcao') ||
        g.includes('ficção') ||
        g.includes('sci-fi') ||
        g.includes('fantasia') ||
        g.includes('fantasy')
      );
    }
  },
  {
    id: 'comedia',
    titulo: 'Comédia & Diversão',
    subtitulo: 'O melhor humor para relaxar e dar boas risadas',
    icon: <Laugh className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return g.includes('comedia') || g.includes('comédia') || g.includes('comedy');
    }
  },
  {
    id: 'terror',
    titulo: 'Terror, Suspense & Mistério',
    subtitulo: 'Frio na espinha, mistérios sombrios e suspense psicológico',
    icon: <Ghost className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('terror') ||
        g.includes('horror') ||
        g.includes('suspense') ||
        g.includes('thriller') ||
        g.includes('misterio') ||
        g.includes('mistério')
      );
    }
  },
  {
    id: 'crime',
    titulo: 'Crime & Policial',
    subtitulo: 'Máfia, golpes, tribunais e investigações policiais',
    icon: <ShieldCheck className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('crime') ||
        g.includes('policial') ||
        g.includes('investigacao') ||
        g.includes('investigação')
      );
    }
  },
  {
    id: 'super-herois',
    titulo: 'Heróis, HQs & Universos Épicos',
    subtitulo: 'Homem-Aranha, Batman, Superman, Liga da Justiça, DC & Marvel',
    icon: <ShieldCheck className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const t = (f.titulo || '').toLowerCase();
      const g = (f.genero || '').toLowerCase();
      const s = (f.sinopse || '').toLowerCase();
      return (
        t.includes('homem-aranha') ||
        t.includes('spider-man') ||
        t.includes('aranhaverso') ||
        t.includes('batman') ||
        t.includes('superman') ||
        t.includes('homem de aço') ||
        t.includes('liga da justiça') ||
        t.includes('justice league') ||
        t.includes('flash') ||
        t.includes('demolidor') ||
        t.includes('daredevil') ||
        t.includes('x-men') ||
        t.includes('guerra civil') ||
        t.includes('watchmen') ||
        t.includes('sandman') ||
        t.includes('invenc') ||
        t.includes('hellboy') ||
        t.includes('vingança') ||
        t.includes('lantern') ||
        g.includes('super-herói') ||
        g.includes('quadrinhos') ||
        s.includes('super-herói') ||
        s.includes('quadrinhos')
      );
    }
  },
  {
    id: 'series',
    titulo: 'Séries de TV & Temporadas',
    subtitulo: 'Temporadas completas com maratonas imperdíveis',
    icon: <Tv className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => f.tipo === 'serie'
  },
  {
    id: 'classicos',
    titulo: 'Grandes Clássicos do Cinema',
    subtitulo: 'Obras imortais com avaliação máxima no IMDb',
    icon: <Star className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const anoNum = parseInt(f.ano, 10);
      return Boolean(f.isClassico || (anoNum && anoNum < 2000));
    }
  },
  {
    id: 'animacoes-imdb',
    titulo: 'Animações Lendárias (Disney, Pixar & Ghibli)',
    subtitulo: 'As maiores animações da história consagradas com notas estelares no IMDb',
    icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
    corDestaque: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      const t = (f.titulo || '').toLowerCase();
      return (
        f.tipo === 'anime' ||
        g.includes('animação') ||
        g.includes('animacao') ||
        g.includes('animation') ||
        t.includes('rei leão') ||
        t.includes('toy story') ||
        t.includes('aranhaverso') ||
        t.includes('wall-e') ||
        t.includes('chihiro') ||
        t.includes('mononoke') ||
        t.includes('totoro') ||
        t.includes('divertida mente') ||
        t.includes('viva: a vida') ||
        t.includes('como treinar') ||
        t.includes('up: altas')
      );
    }
  }
];

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
  const [modoVisualizacao, setModoVisualizacao] = useState<'secoes' | 'grelha'>('secoes');
  const [limiteGrelha, setLimiteGrelha] = useState<number>(36);
  const [tipoFiltro, setTipoFiltro] = useState<
    'todos' | 'imdb' | 'animacao' | 'filme' | 'serie' | 'anime' | 'classico' | 'hbo' | 'disney' | 'netflix' | 'crunchyroll'
  >('todos');
  const [temporadaAtiva, setTemporadaAtiva] = useState<number>(1);
  const [episodioAtivo, setEpisodioAtivo] = useState<number>(1);
  const [modalTemporada, setModalTemporada] = useState<number>(1);
  const [modalEpisodio, setModalEpisodio] = useState<number>(1);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Estados e controle do Modal de Metadados Dinâmicos do IMDb
  const [modalImdbFilme, setModalImdbFilme] = useState<FilmeItem | null>(null);
  const [isModalImdbAberto, setIsModalImdbAberto] = useState<boolean>(false);
  const [buscandoNoImdbAoVivo, setBuscandoNoImdbAoVivo] = useState<boolean>(false);
  const [resultadosImdbAoVivo, setResultadosImdbAoVivo] = useState<FilmeItem[]>([]);
  const [mostrarResultadosImdbAoVivo, setMostrarResultadosImdbAoVivo] = useState<boolean>(false);

  const abrirModalImdb = useCallback((filme: FilmeItem) => {
    setModalImdbFilme(filme);
    setIsModalImdbAberto(true);
  }, []);

  const fecharModalImdb = useCallback(() => {
    setIsModalImdbAberto(false);
  }, []);

  const handlePlayFromImdb = useCallback((filme: FilmeItem, season?: number, episode?: number) => {
    setFilmeAtivo(filme);
    setServidorAtivo(obterServidorPadrao(filme));
    if (season) setTemporadaAtiva(season);
    if (episode) setEpisodioAtivo(episode);
    setReloadKey((k) => k + 1);
    setIsModalImdbAberto(false);
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handlePlayCinemaFromImdb = useCallback((filme: FilmeItem) => {
    setFilmeSelecionado(filme);
    setModoPlayer(obterServidorPadrao(filme));
    setIsModalImdbAberto(false);
  }, []);

  const handleSearchActorFromImdb = useCallback((actorName: string) => {
    setBusca(actorName);
    setGeneroAtivo('todos');
    setTipoFiltro('todos');
    setIsModalImdbAberto(false);
  }, []);

  const alternarProximoServidor = useCallback(() => {
    if (!filmeAtivo) return;
    const proximo = StreamService.getNextProvider(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo);
    setServidorAtivo(proximo);
    setReloadKey((k) => k + 1);
  }, [filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo]);

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
    setBuscandoNoImdbAoVivo(true);
    setMostrarResultadosImdbAoVivo(true);
    try {
      const [resLocal, resultadosImdb] = await Promise.allSettled([
        fetch(`/api/filmes?q=${encodeURIComponent(termo.trim())}`).then((r) =>
          r.ok ? (r.json() as Promise<FilmeItem[]>) : []
        ),
        ImdbService.pesquisarNoImdb(termo.trim())
      ]);

      if (resLocal.status === 'fulfilled' && Array.isArray(resLocal.value) && resLocal.value.length > 0) {
        const resultados = resLocal.value;
        setFilmes((prev) => {
          const idsExistentes = new Set(prev.map((f) => String(f.imdbId || f.id)));
          const novos = resultados.filter((r) => !idsExistentes.has(String(r.imdbId || r.id)));
          return [...novos, ...prev];
        });
        const primeiro = resultados[0];
        setFilmeAtivo(primeiro);
        setServidorAtivo(obterServidorPadrao(primeiro));
      }

      if (resultadosImdb.status === 'fulfilled' && Array.isArray(resultadosImdb.value)) {
        setResultadosImdbAoVivo(resultadosImdb.value);
      }
    } catch (err) {
      console.warn('Erro na busca remota:', err);
    } finally {
      setIsSearchingRemote(false);
      setBuscandoNoImdbAoVivo(false);
    }
  };

  // Busca focada puramente em metadados dinâmicos do IMDb
  const executarBuscaImdbAoVivo = async (termo: string) => {
    if (!termo || termo.trim().length < 2) return;
    setBuscandoNoImdbAoVivo(true);
    setMostrarResultadosImdbAoVivo(true);
    try {
      const resultados = await ImdbService.pesquisarNoImdb(termo.trim());
      setResultadosImdbAoVivo(resultados);
      if (resultados.length > 0) {
        // Se encontrar itens, também garante que estejam no catálogo local
        setFilmes((prev) => {
          const idsExistentes = new Set(prev.map((f) => String(f.imdbId || f.id)));
          const novos = resultados.filter((r) => !idsExistentes.has(String(r.imdbId || r.id)));
          return [...novos, ...prev];
        });
      }
    } catch (err) {
      console.warn('Erro ao pesquisar no IMDb:', err);
    } finally {
      setBuscandoNoImdbAoVivo(false);
    }
  };

  const normalizar = (texto: string) =>
    (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Filtragem base por categoria/plataforma (IMDb Top, animações, filmes, séries, animes, hbo, netflix, etc.)
  const filmesBase = useMemo(() => {
    return filmes.filter((f) => {
      if (tipoFiltro === 'imdb') {
        const r = f.rating ? parseFloat(f.rating) : 0;
        return Boolean(
          String(f.id).includes('imdb') ||
          (f.imdbId && f.imdbId.startsWith('tt')) ||
          r >= 8.5
        );
      } else if (tipoFiltro === 'animacao') {
        const g = (f.genero || '').toLowerCase();
        const t = (f.titulo || '').toLowerCase();
        return (
          f.tipo === 'anime' ||
          g.includes('animação') ||
          g.includes('animacao') ||
          g.includes('animation') ||
          t.includes('rei leão') ||
          t.includes('toy story') ||
          t.includes('aranhaverso') ||
          t.includes('wall-e') ||
          t.includes('chihiro') ||
          t.includes('totoro') ||
          t.includes('divertida mente') ||
          t.includes('viva: a vida')
        );
      } else if (tipoFiltro === 'filme') {
        if (f.tipo && f.tipo !== 'filme') return false;
        if (f.isClassico) return false;
      } else if (tipoFiltro === 'serie') {
        if (f.tipo !== 'serie') return false;
      } else if (tipoFiltro === 'anime') {
        if (f.tipo !== 'anime') return false;
      } else if (tipoFiltro === 'classico') {
        const anoNum = parseInt(f.ano, 10);
        if (!f.isClassico && (!anoNum || anoNum >= 2000)) return false;
      } else if (tipoFiltro === 'hbo') {
        if (f.plataforma !== 'hbo') return false;
      } else if (tipoFiltro === 'disney') {
        if (f.plataforma !== 'disney') return false;
      } else if (tipoFiltro === 'netflix') {
        if (f.plataforma !== 'netflix') return false;
      } else if (tipoFiltro === 'crunchyroll') {
        if (f.plataforma !== 'crunchyroll' && f.tipo !== 'anime') return false;
      }
      return true;
    });
  }, [filmes, tipoFiltro]);

  // Seção de gênero ativa no momento (caso selecionada uma aba específica)
  const secaoAtiva = useMemo(() => {
    if (generoAtivo === 'todos') return null;
    return SECOES_GENERO.find((s) => s.id === generoAtivo) || null;
  }, [generoAtivo]);

  // Agrupamento por seções de gênero (usado na exibição de fileiras/carrosséis)
  const secoesAgrupadas = useMemo(() => {
    const termo = normalizar(busca);
    return SECOES_GENERO.map((sec) => {
      const itens = filmesBase.filter((f) => {
        if (!sec.test(f)) return false;
        if (!termo) return true;
        const tituloNorm = normalizar(f.titulo);
        const generoNorm = normalizar(f.genero);
        const sinopseNorm = normalizar(f.sinopse);
        const imdbNorm = normalizar(f.imdbId || '');
        const plataformaNorm = normalizar(f.plataforma || '');
        return (
          tituloNorm.includes(termo) ||
          generoNorm.includes(termo) ||
          sinopseNorm.includes(termo) ||
          imdbNorm.includes(termo) ||
          plataformaNorm.includes(termo)
        );
      });
      return {
        ...sec,
        filmes: itens.slice(0, 32),
        totalCount: itens.length
      };
    }).filter((sec) => sec.filmes.length > 0);
  }, [filmesBase, busca]);

  // Filtragem local por categoria/tipo e gênero
  const filmesFiltrados = useMemo(() => {
    const termo = normalizar(busca);
    return filmesBase.filter((f) => {
      // Filtro por gênero específico
      if (generoAtivo !== 'todos') {
        const sec = SECOES_GENERO.find((s) => s.id === generoAtivo);
        if (sec) {
          if (!sec.test(f)) return false;
        } else {
          const generoFilmeNorm = normalizar(f.genero);
          const generoAtivoNorm = normalizar(generoAtivo);
          if (!generoFilmeNorm.includes(generoAtivoNorm)) {
            return false;
          }
        }
      }

      if (!termo) return true;

      const tituloNorm = normalizar(f.titulo);
      const generoNorm = normalizar(f.genero);
      const sinopseNorm = normalizar(f.sinopse);
      const imdbNorm = normalizar(f.imdbId || '');
      const plataformaNorm = normalizar(f.plataforma || '');

      return (
        tituloNorm.includes(termo) ||
        generoNorm.includes(termo) ||
        sinopseNorm.includes(termo) ||
        imdbNorm.includes(termo) ||
        plataformaNorm.includes(termo)
      );
    });
  }, [filmesBase, busca, generoAtivo]);

  const handleSelecionarFilme = (filme: FilmeItem) => {
    setFilmeAtivo(filme);
    setServidorAtivo(obterServidorPadrao(filme));
    setTemporadaAtiva(1);
    setEpisodioAtivo(1);
    abrirModalImdb(filme);
  };

  const handlePlayDireto = (filme: FilmeItem) => {
    setFilmeAtivo(filme);
    setServidorAtivo(obterServidorPadrao(filme));
    setTemporadaAtiva(1);
    setEpisodioAtivo(1);
    setReloadKey((k) => k + 1);
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setGeneroAtivo('todos');
    setTipoFiltro('todos');
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
        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
          isSelected
            ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
            : highlight
            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
            : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700'
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
      <div id="filmoteca-header-container" className="flex flex-col gap-3.5 pb-4 border-b border-zinc-800/80 mb-6 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="filmoteca-back-header-btn"
              onClick={onBackToTV}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
              title="Voltar para TV ao vivo"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Film className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Filmoteca
              </h1>
            </div>
          </div>

          {/* BARRA DE PESQUISA MINIMALISTA & RECARREGAR */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    setMostrarResultadosImdbAoVivo(false);
                  }
                }}
                placeholder="Pesquisar títulos ou gêneros..."
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-zinc-900/90 text-zinc-100 text-xs placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600/30 transition"
              />
              {busca && (
                <button
                  type="button"
                  id="filmoteca-clear-search-btn"
                  onClick={() => {
                    setBusca('');
                    setMostrarResultadosImdbAoVivo(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              id="filmoteca-refresh-btn"
              onClick={() => carregarFilmes(true)}
              disabled={isRefreshing || isLoading}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Recarregar catálogo"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-200' : ''}`} />
            </button>
          </div>
        </div>

        {/* LINHA INFERIOR: CATEGORIAS ESSENCIAIS + ALTERNADOR SEÇÕES/GRELHA */}
        {!isLoading && filmes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* FILTROS PRINCIPAIS EM LINHA ÚNICA */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'filme', label: 'Filmes' },
                  { id: 'serie', label: 'Séries' },
                  { id: 'animacao', label: 'Animações' },
                  { id: 'imdb', label: 'Top IMDb' },
                  { id: 'hbo', label: 'HBO / Max' },
                  { id: 'netflix', label: 'Netflix' },
                  { id: 'disney', label: 'Disney+' },
                ] as const
              ).map((cat) => {
                const isSelected = tipoFiltro === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`filter-category-${cat.id}`}
                    onClick={() => {
                      setTipoFiltro(cat.id);
                      setGeneroAtivo('todos');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* CONTROLES: SEÇÕES / GRELHA + CONTAGEM */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              {!busca && (
                <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <button
                    type="button"
                    id="filmoteca-view-sections-btn"
                    onClick={() => setModoVisualizacao('secoes')}
                    className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      modoVisualizacao === 'secoes'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Exibir por seções"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Seções</span>
                  </button>
                  <button
                    type="button"
                    id="filmoteca-view-grid-btn"
                    onClick={() => setModoVisualizacao('grelha')}
                    className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      modoVisualizacao === 'grelha'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Exibir em grelha"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Grelha</span>
                  </button>
                </div>
              )}

              <span className="text-xs text-zinc-400 font-normal">
                {filmesFiltrados.length} {filmesFiltrados.length === 1 ? 'título' : 'títulos'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PLAYER PRINCIPAL DE CINEMA / FILME ATIVO */}
      {!isLoading && (
        <div ref={playerContainerRef} className="w-full max-w-full mb-8 flex flex-col gap-3">
          {filmeAtivo && (
            <div id="filmoteca-active-player-controls" className="w-full max-w-full flex flex-col gap-2 select-none">
              {/* BARRA DE FONTES & AÇÕES RÁPIDAS */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
                  <span className="text-[11px] text-zinc-400 font-normal mr-1 shrink-0">
                    Servidor:
                  </span>

                  {filmeAtivo.directStreamUrl &&
                    renderServerPill(
                      'direct',
                      'Nativo',
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
                      servidorAtivo,
                      setServidorAtivo,
                      true
                    )}

                  {renderServerPill(
                    'videasy',
                    'Videasy',
                    <Film className="w-3 h-3 text-zinc-300" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidsrc',
                    'VidSrc',
                    <Tv className="w-3 h-3 text-zinc-300" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidsrcin',
                    'VidSrc 2',
                    <Sparkles className="w-3 h-3 text-zinc-300" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidlink',
                    'VidLink',
                    <Play className="w-3 h-3 fill-current text-zinc-300" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'autoembed',
                    'AutoEmbed',
                    <Globe2 className="w-3 h-3 text-zinc-300" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {filmeAtivo.trailerUrl &&
                    renderServerPill(
                      'trailer',
                      'Trailer',
                      <Sparkles className="w-3 h-3 text-amber-300" />,
                      servidorAtivo,
                      setServidorAtivo
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    id="filmoteca-open-external-safe"
                    onClick={() => {
                      const url = obterUrlFilme(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo);
                      if (url) StreamService.openSafeExternal(url);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer flex items-center gap-1.5"
                    title="Abre o player em nova aba sem restrições"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nova Aba</span>
                  </button>
                </div>
              </div>

              {/* SELETOR DE TEMPORADAS E EPISÓDIOS (PARA SÉRIES E ANIMES) */}
              {(filmeAtivo.tipo === 'serie' || filmeAtivo.tipo === 'anime') && (
                <div className="flex flex-col gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-zinc-400 font-normal">
                      Temporada {temporadaAtiva} • Episódio {episodioAtivo}
                    </span>

                    {/* Seleção de Temporada */}
                    {filmeAtivo.temporadas && filmeAtivo.temporadas > 1 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {Array.from({ length: Math.min(filmeAtivo.temporadas, 15) }, (_, i) => i + 1).map((s) => (
                          <button
                            key={`temp-${s}`}
                            type="button"
                            onClick={() => {
                              setTemporadaAtiva(s);
                              setEpisodioAtivo(1);
                              setReloadKey((k) => k + 1);
                            }}
                            className={`px-2 py-0.5 rounded-md text-xs font-medium transition cursor-pointer ${
                              temporadaAtiva === s
                                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                                : 'bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                          >
                            T{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Seleção de Episódios */}
                  <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
                    {Array.from(
                      { length: Math.min(filmeAtivo.episodiosPorTemporada || 12, 40) },
                      (_, i) => i + 1
                    ).map((ep) => (
                      <button
                        key={`ep-${ep}`}
                        type="button"
                        onClick={() => {
                          setEpisodioAtivo(ep);
                          setReloadKey((k) => k + 1);
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer shrink-0 ${
                          episodioAtivo === ep
                            ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                            : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title={`Episódio ${ep}`}
                      >
                        EP {ep}
                      </button>
                    ))}
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
                    const url = obterUrlFilme(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo);
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
                  key={`${filmeAtivo.id}-${servidorAtivo}-${temporadaAtiva}-${episodioAtivo}-${reloadKey}`}
                  src={obterUrlFilme(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo)}
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
                  Fonte ativa: <strong className="text-white uppercase font-bold">{servidorAtivo}</strong>
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
                  {filmeAtivo.plataforma === 'hbo' && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-700 text-white font-black text-[9px]">
                      HBO MAX
                    </span>
                  )}
                  {filmeAtivo.plataforma === 'disney' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-black text-[9px]">
                      DISNEY+
                    </span>
                  )}
                  {filmeAtivo.plataforma === 'netflix' && (
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px]">
                      NETFLIX
                    </span>
                  )}
                  {filmeAtivo.plataforma === 'crunchyroll' && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-black text-[9px]">
                      CRUNCHYROLL
                    </span>
                  )}
                  {filmeAtivo.rating && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black shadow flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>{filmeAtivo.rating}</span>
                    </span>
                  )}
                  {filmeAtivo.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      {filmeAtivo.imdbId}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800 font-normal">
                    {filmeAtivo.ano}
                  </span>
                  <span className="text-xs text-[#FF2D55] font-semibold">
                    {filmeAtivo.genero}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-normal line-clamp-2 leading-relaxed">
                  {filmeAtivo.sinopse}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  id="filmoteca-open-imdb-details-btn"
                  onClick={() => abrirModalImdb(filmeAtivo)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-[#f5c518] hover:bg-[#e4b512] transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Ver sinopse completa, nota e elenco dinâmico no IMDb"
                >
                  <span className="font-black text-[10px] bg-black text-[#f5c518] px-1 rounded">IMDb</span>
                  <span>Ficha & Elenco</span>
                </button>
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
                <div className="text-[11px] text-emerald-400/90 font-normal bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
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
          <p className="text-sm font-normal text-zinc-300">
            Carregando repositório de filmes em alta resolução...
          </p>
          <p className="text-xs text-zinc-400 font-normal mt-1">
            Conectando fontes VidLink, Videasy, VidSrc e streams diretos
          </p>
        </div>
      )}

      {/* RENDERIZAÇÃO DO CATÁLOGO: SEÇÕES AGRUPADAS POR GÊNERO, GRELHA OU ABA ATIVA */}
      {!isLoading && (
        <div className="flex flex-col gap-6">
          {/* CASO 1: BUSCA ATIVA */}
          {busca.trim().length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#FF2D55]" />
                  <span className="text-sm font-bold text-zinc-200 tracking-tight">
                    Resultados para &quot;<span className="text-white">{busca}</span>&quot;
                  </span>
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    {filmesFiltrados.length} encontrados
                  </span>
                </div>
                <button
                  type="button"
                  id="filmoteca-clear-search-view-btn"
                  onClick={() => setBusca('')}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar busca</span>
                </button>
              </div>

              {filmesFiltrados.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {filmesFiltrados.map((filme) => (
                    <FilmeCard
                      key={`search-${filme.id}`}
                      filme={filme}
                      isAtivo={filmeAtivo?.id === filme.id}
                      onSelect={handleSelecionarFilme}
                      onOpenImdb={abrirModalImdb}
                      onPlayDirect={handlePlayDireto}
                      onOpenTeatro={(f) => {
                        setFilmeSelecionado(f);
                        setModoPlayer(obterServidorPadrao(f));
                        setModalTemporada(1);
                        setModalEpisodio(1);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* RESULTADOS AO VIVO DO IMDB (SINOPSE, NOTA E ELENCO) */}
              {mostrarResultadosImdbAoVivo && resultadosImdbAoVivo.length > 0 && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#f5c518] text-black font-black text-[10px] uppercase tracking-wider">
                        IMDb Metadados
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        Resultados encontrados no IMDb com sinopse, nota e elenco
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400 font-normal">
                      {resultadosImdbAoVivo.length} títulos
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {resultadosImdbAoVivo.map((filme) => (
                      <FilmeCard
                        key={`imdb-search-${filme.id}`}
                        filme={filme}
                        isAtivo={filmeAtivo?.id === filme.id}
                        onSelect={handleSelecionarFilme}
                        onOpenImdb={abrirModalImdb}
                        onPlayDirect={handlePlayDireto}
                        onOpenTeatro={(f) => {
                          setFilmeSelecionado(f);
                          setModoPlayer(obterServidorPadrao(f));
                          setModalTemporada(1);
                          setModalEpisodio(1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASO 2: VISUALIZAÇÃO DE UM GÊNERO ESPECÍFICO (QUANDO UMA ABA DE GÊNERO FOR CLICADA) */}
          {!busca && generoAtivo !== 'todos' && (
            <div className="flex flex-col gap-4">
              {/* CABEÇALHO DO GÊNERO SELECIONADO */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner ${
                      secaoAtiva?.corDestaque || 'text-[#FF2D55]'
                    }`}
                  >
                    {secaoAtiva?.icon || <SlidersHorizontal className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {secaoAtiva?.titulo || generoAtivo}
                      </h2>
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {filmesFiltrados.length} títulos
                      </span>
                    </div>
                    {secaoAtiva?.subtitulo && (
                      <p className="text-xs text-zinc-400 font-normal mt-0.5">
                        {secaoAtiva.subtitulo}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id="filmoteca-back-to-all-sections-btn"
                  onClick={() => setGeneroAtivo('todos')}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-center shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ver Todos os Gêneros</span>
                </button>
              </div>

              {/* GRELHA COMPLETA DO GÊNERO ESCOLHIDO */}
              {filmesFiltrados.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {filmesFiltrados.map((filme) => (
                    <FilmeCard
                      key={`genre-grid-${filme.id}`}
                      filme={filme}
                      isAtivo={filmeAtivo?.id === filme.id}
                      onSelect={handleSelecionarFilme}
                      onOpenImdb={abrirModalImdb}
                      onPlayDirect={handlePlayDireto}
                      onOpenTeatro={(f) => {
                        setFilmeSelecionado(f);
                        setModoPlayer(obterServidorPadrao(f));
                        setModalTemporada(1);
                        setModalEpisodio(1);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CASO 3: MODO SEÇÕES AGRUPADAS POR GÊNERO (MODO PADRÃO) */}
          {!busca && generoAtivo === 'todos' && modoVisualizacao === 'secoes' && (
            <div className="flex flex-col gap-6">
              {secoesAgrupadas.map((secao) => (
                <FilmotecaGenreRow
                  key={`row-${secao.id}`}
                  id={secao.id}
                  titulo={secao.titulo}
                  icon={secao.icon}
                  corDestaque={secao.corDestaque}
                  filmes={secao.filmes}
                  filmeAtivoId={filmeAtivo?.id !== undefined ? String(filmeAtivo.id) : undefined}
                  onSelectFilme={handleSelecionarFilme}
                  onOpenImdb={abrirModalImdb}
                  onPlayDirect={handlePlayDireto}
                  onOpenTeatro={(f) => {
                    setFilmeSelecionado(f);
                    setModoPlayer(obterServidorPadrao(f));
                    setModalTemporada(1);
                    setModalEpisodio(1);
                  }}
                  onVerTodos={(genreId) => setGeneroAtivo(genreId)}
                />
              ))}
            </div>
          )}

          {/* CASO 4: MODO GRELHA GERAL COMPLETA (OTIMIZADO COM PAGINAÇÃO DINÂMICA) */}
          {!busca && generoAtivo === 'todos' && modoVisualizacao === 'grelha' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filmesFiltrados.slice(0, limiteGrelha).map((filme) => (
                  <FilmeCard
                    key={`all-grid-${filme.id}`}
                    filme={filme}
                    isAtivo={filmeAtivo?.id === filme.id}
                    onSelect={handleSelecionarFilme}
                    onOpenImdb={abrirModalImdb}
                    onPlayDirect={handlePlayDireto}
                    onOpenTeatro={(f) => {
                      setFilmeSelecionado(f);
                      setModoPlayer(obterServidorPadrao(f));
                      setModalTemporada(1);
                      setModalEpisodio(1);
                    }}
                  />
                ))}
              </div>

              {filmesFiltrados.length > limiteGrelha && (
                <div className="flex flex-col items-center justify-center py-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setLimiteGrelha((prev) => prev + 36)}
                    className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                  >
                    Carregar Mais Filmes (+36 títulos)
                  </button>
                  <span className="text-[11px] text-zinc-400 font-normal">
                    Exibindo {Math.min(limiteGrelha, filmesFiltrados.length)} de {filmesFiltrados.length} filmes
                  </span>
                </div>
              )}
            </div>
          )}
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
          <div className="flex items-center gap-2 flex-wrap justify-center">
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
              id="filmoteca-search-imdb-direct-btn"
              onClick={() => executarBuscaImdbAoVivo(busca)}
              disabled={buscandoNoImdbAoVivo}
              className="px-4 py-2 rounded-xl bg-[#f5c518] hover:bg-[#e4b512] text-xs font-black text-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {buscandoNoImdbAoVivo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Buscar Ficha no IMDb</span>
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

          {/* EXIBIÇÃO DE RESULTADOS IMDB AO VIVO MESMO SE NÃO HOUVER NA LISTA LOCAL */}
          {resultadosImdbAoVivo.length > 0 && (
            <div className="w-full max-w-6xl mt-8 pt-6 border-t border-zinc-800 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#f5c518] text-black font-black text-[10px] uppercase tracking-wider">
                    IMDb Ao Vivo
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Títulos encontrados no IMDb com sinopse, nota e elenco
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-normal">
                  {resultadosImdbAoVivo.length} títulos
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {resultadosImdbAoVivo.map((filme) => (
                  <FilmeCard
                    key={`empty-imdb-${filme.id}`}
                    filme={filme}
                    isAtivo={filmeAtivo?.id === filme.id}
                    onSelect={handleSelecionarFilme}
                    onOpenImdb={abrirModalImdb}
                    onPlayDirect={handlePlayDireto}
                    onOpenTeatro={(f) => {
                      setFilmeSelecionado(f);
                      setModoPlayer(obterServidorPadrao(f));
                      setModalTemporada(1);
                      setModalEpisodio(1);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DO REPRODUTOR DE FILME SELECIONADO (MODO TEATRO COM TRANSIÇÃO SUAVE) */}
      <AnimatePresence>
        {filmeSelecionado && (() => {
          const urlAtiva = obterUrlFilme(filmeSelecionado, modoPlayer, modalTemporada, modalEpisodio);
          const isDirectVideo = modoPlayer === 'direct' && Boolean(filmeSelecionado.directStreamUrl);

          return (
            <motion.div
              key={`theater-modal-overlay-${filmeSelecionado.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
              onClick={() => setFilmeSelecionado(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
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
                  {filmeSelecionado.plataforma === 'hbo' && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-700 text-white font-black text-[9px] shrink-0">
                      HBO MAX
                    </span>
                  )}
                  {filmeSelecionado.plataforma === 'disney' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-black text-[9px] shrink-0">
                      DISNEY+
                    </span>
                  )}
                  {filmeSelecionado.plataforma === 'netflix' && (
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px] shrink-0">
                      NETFLIX
                    </span>
                  )}
                  {filmeSelecionado.plataforma === 'crunchyroll' && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-black text-[9px] shrink-0">
                      CRUNCHYROLL
                    </span>
                  )}
                  {filmeSelecionado.tipo === 'serie' && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600/90 text-white font-bold text-[9px]">
                      SÉRIE
                    </span>
                  )}
                  {filmeSelecionado.tipo === 'anime' && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-bold text-[9px]">
                      ANIME
                    </span>
                  )}
                  {filmeSelecionado.rating && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black shrink-0 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>{filmeSelecionado.rating}</span>
                    </span>
                  )}
                  {filmeSelecionado.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/30 text-[9px] font-bold shrink-0">
                      {filmeSelecionado.imdbId}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 font-normal shrink-0">
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

              {/* SELETOR DE TEMPORADAS E EPISÓDIOS NO MODO TEATRO (SÉRIES E ANIMES) */}
              {(filmeSelecionado.tipo === 'serie' || filmeSelecionado.tipo === 'anime') && (
                <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-zinc-300 font-medium text-[11px]">
                      Temporada {modalTemporada} • Episódio {modalEpisodio}
                    </span>
                    {filmeSelecionado.temporadas && filmeSelecionado.temporadas > 1 && (
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500 text-[10px]">Temporada:</span>
                        {Array.from({ length: Math.min(filmeSelecionado.temporadas, 12) }, (_, i) => i + 1).map((s) => (
                          <button
                            key={`modal-t-${s}`}
                            type="button"
                            onClick={() => {
                              setModalTemporada(s);
                              setModalEpisodio(1);
                              setReloadKey((k) => k + 1);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              modalTemporada === s
                                ? 'bg-[#FF2D55] text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            T{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
                    {Array.from(
                      { length: Math.min(filmeSelecionado.episodiosPorTemporada || 12, 30) },
                      (_, i) => i + 1
                    ).map((ep) => (
                      <button
                        key={`modal-ep-${ep}`}
                        type="button"
                        onClick={() => {
                          setModalEpisodio(ep);
                          setReloadKey((k) => k + 1);
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-bold shrink-0 ${
                          modalEpisodio === ep
                            ? 'bg-[#FF2D55] text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        EP {ep}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                      key={`${filmeSelecionado.id}-${modoPlayer}-${modalTemporada}-${modalEpisodio}-${reloadKey}`}
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
                        const next = StreamService.getNextProvider(
                          filmeSelecionado,
                          modoPlayer,
                          modalTemporada,
                          modalEpisodio
                        );
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
                    <span className="text-zinc-400 font-normal">Gênero:</span>
                    <span className="text-[#FF2D55] font-semibold">
                      {filmeSelecionado.genero}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {filmeSelecionado.sinopse}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    id="filmoteca-modal-imdb-info-btn"
                    onClick={() => {
                      abrirModalImdb(filmeSelecionado);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#f5c518] hover:bg-[#e4b512] text-black font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm text-xs"
                    title="Ver sinopse completa, nota e elenco no IMDb"
                  >
                    <span className="font-black text-[10px] bg-black text-[#f5c518] px-1 rounded">IMDb</span>
                    <span>Ficha & Elenco</span>
                  </button>
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
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>

      {/* MODAL DE METADADOS DINÂMICOS DO IMDB (SINOPSE, NOTA, ELENCO E STREAMING) */}
      <FilmotecaImdbModal
        filme={modalImdbFilme}
        isOpen={isModalImdbAberto}
        onClose={fecharModalImdb}
        onPlay={handlePlayFromImdb}
        onPlayCinema={handlePlayCinemaFromImdb}
        onSearchActor={handleSearchActorFromImdb}
      />
    </div>
  );
}

export default WorscoiFilmotecaView;

